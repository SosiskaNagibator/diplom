<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'saporedb';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка подключения к БД: ' . $e->getMessage()]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$action = $_POST['action'] ?? $_GET['action'] ?? $input['action'] ?? '';

switch($action) {
    case 'save_order':
        handleSaveOrder($pdo, $input);
        break;
    case 'get_orders':
        handleGetOrders($pdo, $input);
        break;
    case 'update_status':
        handleUpdateStatus($pdo, $input);
        break;
    case 'get_order_by_number':
        handleGetOrderByNumber($pdo, $input);
        break;
    case 'apply_promo':
        handleApplyPromo($pdo, $input);
        break;
    default:
        echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие: ' . $action]);
}

// ============================================================
// 1. СОХРАНЕНИЕ ЗАКАЗА
// ============================================================
function handleSaveOrder($pdo, $input) {
    if (!isset($input['items']) || !isset($input['total'])) {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные заказа']);
        return;
    }

    $userLogin = $input['userLogin'] ?? 'guest';
    $items = $input['items'];
    $total = (float)$input['total'];
    $originalTotal = (float)($input['originalTotal'] ?? $total);
    $bonusUsed = (int)($input['bonusUsed'] ?? 0);
    $status = $input['status'] ?? 'Принят';
    $deliveryAddress = trim($input['deliveryAddress'] ?? '');
    $deliveryTime = trim($input['deliveryTime'] ?? '');
    $promoCode = trim($input['promoCode'] ?? '');
    $discountAmount = (float)($input['discountAmount'] ?? 0);
    $finalTotal = (float)($input['finalTotal'] ?? $total);

    $customerName = trim($input['customerName'] ?? '');
    $customerPhone = trim($input['customerPhone'] ?? '');
    $customerEmail = trim($input['customerEmail'] ?? '');

    if ($userLogin === 'guest' && (empty($customerName) || empty($customerPhone))) {
        echo json_encode(['status' => 'error', 'message' => 'Укажите имя и телефон для оформления заказа']);
        return;
    }
    if (empty($deliveryAddress)) {
        echo json_encode(['status' => 'error', 'message' => 'Укажите адрес доставки']);
        return;
    }

    // ---------- ПРОВЕРКА ВРЕМЕНИ ДОСТАВКИ (до 22:50) ----------
    if ($deliveryTime !== 'ASAP' && !empty($deliveryTime)) {
        $now = new DateTime();
        $selected = DateTime::createFromFormat('Y-m-d\TH:i', $deliveryTime);
        if (!$selected) {
            echo json_encode(['status' => 'error', 'message' => 'Некорректный формат времени']);
            return;
        }
        // Минимальное время — через 30 минут
        $minTime = (clone $now)->modify('+30 minutes');
        if ($selected < $minTime) {
            echo json_encode(['status' => 'error', 'message' => 'Выберите время доставки не ранее чем через 30 минут']);
            return;
        }
        // Максимальное время — 22:50
        $maxHour = 22;
        $maxMinute = 50;
        if ((int)$selected->format('H') > $maxHour || 
            ((int)$selected->format('H') == $maxHour && (int)$selected->format('i') > $maxMinute)) {
            echo json_encode(['status' => 'error', 'message' => 'Время доставки не может быть позже 22:50']);
            return;
        }
        $deliveryTime = $selected->format('Y-m-d H:i:s');
    } elseif ($deliveryTime === 'ASAP') {
        $deliveryTime = null;
    }

    $stmt = $pdo->query("SELECT MAX(id) as max_id FROM orders");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $nextId = ($result['max_id'] ?? 0) + 1;
    $orderNumber = $nextId;

    try {
        $pdo->beginTransaction();

        // ----- Промокод -----
        $discount = 0;
        if (!empty($promoCode)) {
            $discount = applyPromoCode($pdo, $promoCode, $userLogin, $originalTotal);
            if ($discount === false) {
                echo json_encode(['status' => 'error', 'message' => 'Промокод недействителен']);
                return;
            }
            $stmt = $pdo->prepare("UPDATE promo_codes SET used_count = used_count + 1 WHERE code = ?");
            $stmt->execute([$promoCode]);
        }

        $finalTotal = $originalTotal - $discount - $bonusUsed;
        if ($finalTotal < 0) $finalTotal = 0;

        // ----- Вставка заказа -----
        $itemsJson = json_encode($items, JSON_UNESCAPED_UNICODE);
        $sql = "INSERT INTO orders (
                order_number, total, status, items, user_login,
                delivery_address, delivery_time, promo_code, discount_amount, final_total,
                customer_name, customer_phone, customer_email, order_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $orderNumber, $originalTotal, $status, $itemsJson, $userLogin,
            $deliveryAddress, $deliveryTime, $promoCode, $discount, $finalTotal,
            $customerName, $customerPhone, $customerEmail
        ]);
        $orderId = $pdo->lastInsertId();

        // ----- Бонусы (если пользователь авторизован) -----
        $earnedBonuses = 0;
        if ($userLogin !== 'guest' && empty($promoCode)) {
            $earnedBonuses = (int)($originalTotal * 0.1);
        }
        $newBalance = null;
        if ($userLogin !== 'guest') {
            $stmt = $pdo->prepare("SELECT balance FROM bonuses WHERE login = ? FOR UPDATE");
            $stmt->execute([$userLogin]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $currentBalance = (int)$row['balance'];
                $newBalance = $currentBalance - $bonusUsed + $earnedBonuses;
                $stmt = $pdo->prepare("UPDATE bonuses SET balance = ? WHERE login = ?");
                $stmt->execute([$newBalance, $userLogin]);

                if ($bonusUsed > 0) {
                    $stmt = $pdo->prepare("INSERT INTO bonus_history (login, amount, description, order_id) VALUES (?, ?, ?, ?)");
                    $stmt->execute([$userLogin, -$bonusUsed, "Списание бонусов за заказ #$orderNumber", $orderId]);
                }
                if ($earnedBonuses > 0) {
                    $stmt = $pdo->prepare("INSERT INTO bonus_history (login, amount, description, order_id) VALUES (?, ?, ?, ?)");
                    $stmt->execute([$userLogin, $earnedBonuses, "Начисление бонусов за заказ #$orderNumber", $orderId]);
                }
            }
        }

        // ----- Реферальная система (первый заказ) -----
        if ($userLogin !== 'guest' && empty($promoCode)) {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM orders WHERE user_login = ?");
            $stmt->execute([$userLogin]);
            $orderCount = $stmt->fetchColumn();
            if ($orderCount <= 1) {
                $stmt = $pdo->prepare("SELECT referred_by FROM users WHERE Login = ?");
                $stmt->execute([$userLogin]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                if ($user && !empty($user['referred_by'])) {
                    $referrer = $user['referred_by'];
                    $bonusAmount = 100;
                    $stmt = $pdo->prepare("UPDATE bonuses SET balance = balance + ? WHERE login = ?");
                    $stmt->execute([$bonusAmount, $referrer]);
                    $stmt = $pdo->prepare("INSERT INTO bonus_history (login, amount, description) VALUES (?, ?, ?)");
                    $stmt->execute([$referrer, $bonusAmount, "Бонус за реферала $userLogin"]);
                    $stmt = $pdo->prepare("UPDATE referrals SET status = 'completed', completed_at = NOW() WHERE referred_login = ? AND referrer_login = ?");
                    $stmt->execute([$userLogin, $referrer]);
                }
            }
        }

        // ----- Сохранение адреса и установка его основным -----
        if ($userLogin !== 'guest' && !empty($deliveryAddress)) {
            // Проверяем, есть ли уже такой адрес
            $stmt = $pdo->prepare("SELECT id FROM user_addresses WHERE user_login = ? AND address = ?");
            $stmt->execute([$userLogin, $deliveryAddress]);
            $existing = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($existing) {
                $addressId = $existing['id'];
            } else {
                // Добавляем новый адрес (без метки)
                $stmt = $pdo->prepare("INSERT INTO user_addresses (user_login, address) VALUES (?, ?)");
                $stmt->execute([$userLogin, $deliveryAddress]);
                $addressId = $pdo->lastInsertId();
            }
            // Устанавливаем этот адрес как основной (сбрасываем у всех остальных)
            $stmt = $pdo->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_login = ?");
            $stmt->execute([$userLogin]);
            $stmt = $pdo->prepare("UPDATE user_addresses SET is_default = 1 WHERE id = ?");
            $stmt->execute([$addressId]);
        }

        $pdo->commit();

        echo json_encode([
            'status' => 'success',
            'message' => 'Заказ сохранен',
            'orderId' => $orderId,
            'orderNumber' => $orderNumber,
            'newBalance' => $newBalance,
            'discount' => $discount,
            'finalTotal' => $finalTotal
        ]);

    } catch (PDOException $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'Ошибка сохранения заказа: ' . $e->getMessage()]);
    }
}

// ============================================================
// 2. ПОЛУЧЕНИЕ СПИСКА ЗАКАЗОВ
// ============================================================
function handleGetOrders($pdo, $input) {
    $userLogin = $input['login'] ?? $_GET['login'] ?? '';
    try {
        $sql = "SELECT id, order_number, total, status, items, delivery_address, delivery_time,
                       promo_code, discount_amount, final_total,
                       customer_name, customer_phone, customer_email, order_date, user_login 
                FROM orders";
        if ($userLogin) {
            $sql .= " WHERE user_login = ?";
            $stmt = $pdo->prepare($sql . " ORDER BY order_date DESC");
            $stmt->execute([$userLogin]);
        } else {
            $sql .= " ORDER BY order_date DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
        }
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $result = [];
        foreach ($orders as $order) {
            $result[] = [
                'id' => $order['id'],
                'orderNumber' => $order['order_number'],
                'total' => (float)$order['total'],
                'status' => $order['status'],
                'items' => json_decode($order['items'], true),
                'date' => date('d.m.Y H:i', strtotime($order['order_date'])),
                'deliveryAddress' => $order['delivery_address'] ?? '',
                'deliveryTime' => $order['delivery_time'] ?? '',
                'promoCode' => $order['promo_code'] ?? '',
                'discountAmount' => (float)($order['discount_amount'] ?? 0),
                'finalTotal' => (float)($order['final_total'] ?? $order['total']),
                'customerName' => $order['customer_name'] ?? '',
                'customerPhone' => $order['customer_phone'] ?? '',
                'customerEmail' => $order['customer_email'] ?? '',
                'userLogin' => $order['user_login']
            ];
        }
        echo json_encode(['status' => 'success', 'orders' => $result]);
    } catch(PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка получения заказов: ' . $e->getMessage()]);
    }
}

// ============================================================
// 3. ОБНОВЛЕНИЕ СТАТУСА ЗАКАЗА
// ============================================================
function handleUpdateStatus($pdo, $input) {
    $orderId = isset($input['orderId']) ? (int)$input['orderId'] : 0;
    $newStatus = trim($input['status'] ?? '');
    if (!$orderId || !$newStatus) {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
        return;
    }
    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
    if ($stmt->execute([$newStatus, $orderId])) {
        echo json_encode(['status' => 'success', 'message' => 'Статус обновлён']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}

// ============================================================
// 4. ПОЛУЧЕНИЕ ЗАКАЗА ПО НОМЕРУ
// ============================================================
function handleGetOrderByNumber($pdo, $input) {
    $orderNumber = trim($input['orderNumber'] ?? $_GET['orderNumber'] ?? $_POST['orderNumber'] ?? '');
    if (empty($orderNumber)) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан номер заказа']);
        return;
    }
    $stmt = $pdo->prepare("SELECT id, order_number, total, status, items, delivery_address, delivery_time,
                                  promo_code, discount_amount, final_total,
                                  customer_name, customer_phone, customer_email, order_date, user_login 
                           FROM orders WHERE order_number = ?");
    $stmt->execute([$orderNumber]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$order) {
        echo json_encode(['status' => 'error', 'message' => 'Заказ не найден']);
        return;
    }
    $result = [
        'id' => $order['id'],
        'orderNumber' => $order['order_number'],
        'total' => (float)$order['total'],
        'status' => $order['status'],
        'items' => json_decode($order['items'], true),
        'date' => date('d.m.Y H:i', strtotime($order['order_date'])),
        'deliveryAddress' => $order['delivery_address'] ?? '',
        'deliveryTime' => $order['delivery_time'] ?? '',
        'promoCode' => $order['promo_code'] ?? '',
        'discountAmount' => (float)($order['discount_amount'] ?? 0),
        'finalTotal' => (float)($order['final_total'] ?? $order['total']),
        'customerName' => $order['customer_name'] ?? '',
        'customerPhone' => $order['customer_phone'] ?? '',
        'customerEmail' => $order['customer_email'] ?? '',
        'userLogin' => $order['user_login']
    ];
    echo json_encode(['status' => 'success', 'order' => $result]);
}

// ============================================================
// 5. ПРОВЕРКА ПРОМОКОДА
// ============================================================
function handleApplyPromo($pdo, $input) {
    $code = trim($input['code'] ?? '');
    $login = trim($input['login'] ?? '');
    $orderTotal = (float)($input['orderTotal'] ?? 0);
    if (empty($code)) {
        echo json_encode(['status' => 'error', 'message' => 'Введите промокод']);
        return;
    }
    $discount = applyPromoCode($pdo, $code, $login, $orderTotal);
    if ($discount === false) {
        echo json_encode(['status' => 'error', 'message' => 'Промокод недействителен или истёк']);
        return;
    }
    echo json_encode([
        'status' => 'success',
        'message' => 'Промокод применён',
        'discount' => $discount,
        'finalTotal' => $orderTotal - $discount
    ]);
}

// ============================================================
// 6. ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ПРИМЕНЕНИЯ ПРОМОКОДА
// ============================================================
function applyPromoCode($pdo, $code, $login, $orderTotal) {
    $stmt = $pdo->prepare("SELECT * FROM promo_codes WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW()) AND (usage_limit IS NULL OR used_count < usage_limit)");
    $stmt->execute([$code]);
    $promo = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$promo) return false;
    if ($promo['min_order_amount'] > $orderTotal) return false;
    $discount = 0;
    if ($promo['discount_type'] == 'percent') {
        $discount = $orderTotal * ($promo['discount_value'] / 100);
        if ($promo['max_discount'] !== null && $discount > $promo['max_discount']) {
            $discount = $promo['max_discount'];
        }
    } else {
        $discount = $promo['discount_value'];
    }
    return $discount;
}
?>