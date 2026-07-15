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
    default:
        echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие: ' . $action]);
}

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

    $stmt = $pdo->query("SELECT MAX(id) as max_id FROM orders");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $nextId = ($result['max_id'] ?? 0) + 1;
    $orderNumber = $nextId;

    try {
        $pdo->beginTransaction();
        
        $stmt = $pdo->prepare("
            INSERT INTO orders (
                order_number, total, status, items, user_login, 
                delivery_address, customer_name, customer_phone, customer_email, order_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $itemsJson = json_encode($items, JSON_UNESCAPED_UNICODE);
        $stmt->execute([
            $orderNumber, $total, $status, $itemsJson, $userLogin,
            $deliveryAddress, $customerName, $customerPhone, $customerEmail
        ]);
        $orderId = $pdo->lastInsertId();

        $newBalance = null;

        if ($userLogin !== 'guest') {
            $stmt = $pdo->prepare("SELECT balance FROM bonuses WHERE login = ? FOR UPDATE");
            $stmt->execute([$userLogin]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($row) {
                $currentBalance = (int)$row['balance'];
                $earned = ($bonusUsed > 0) ? 0 : (int)($originalTotal * 0.1);
                $newBalance = $currentBalance - $bonusUsed + $earned;
                
                $stmt = $pdo->prepare("UPDATE bonuses SET balance = ? WHERE login = ?");
                $stmt->execute([$newBalance, $userLogin]);

                if ($bonusUsed > 0) {
                    $stmt = $pdo->prepare("INSERT INTO bonus_history (login, amount, description, order_id) VALUES (?, ?, ?, ?)");
                    $stmt->execute([$userLogin, -$bonusUsed, "Списание бонусов за заказ #$orderNumber", $orderId]);
                }

                if ($earned > 0) {
                    $stmt = $pdo->prepare("INSERT INTO bonus_history (login, amount, description, order_id) VALUES (?, ?, ?, ?)");
                    $stmt->execute([$userLogin, $earned, "Начисление бонусов за заказ #$orderNumber", $orderId]);
                }
            }
        }

        $pdo->commit();

        echo json_encode([
            'status' => 'success',
            'message' => 'Заказ сохранен',
            'orderId' => $orderId,
            'orderNumber' => $orderNumber,
            'newBalance' => $newBalance
        ]);
        
    } catch(PDOException $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'Ошибка сохранения заказа: ' . $e->getMessage()]);
    }
}

function handleGetOrders($pdo, $input) {
    $userLogin = $input['login'] ?? $_GET['login'] ?? '';

    try {
        $sql = "SELECT id, order_number, total, status, items, delivery_address, 
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

function handleUpdateStatus($pdo, $input) {
    error_log("=== handleUpdateStatus START ===");
    error_log("Input: " . print_r($input, true));

    $orderId = isset($input['orderId']) ? (int)$input['orderId'] : 0;
    $orderNumber = isset($input['orderNumber']) ? trim($input['orderNumber']) : '';
    $newStatus = trim($input['status'] ?? '');

    error_log("Parsed: orderId=$orderId, orderNumber=$orderNumber, newStatus=$newStatus");

    if (!$newStatus) {
        error_log("ERROR: Empty status");
        echo json_encode(['status' => 'error', 'message' => 'Не указан статус']);
        return;
    }

    if (!empty($orderNumber) && $orderId == 0) {
        $stmt = $pdo->prepare("SELECT id, status FROM orders WHERE order_number = ?");
        $stmt->execute([$orderNumber]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$order) {
            error_log("ERROR: Order not found for number $orderNumber");
            echo json_encode(['status' => 'error', 'message' => 'Заказ с таким номером не найден']);
            return;
        }
        $orderId = (int)$order['id'];
        error_log("Found order by number: id=$orderId, current status=" . $order['status']);
    } else {
        $stmt = $pdo->prepare("SELECT id, status FROM orders WHERE id = ?");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$order) {
            error_log("ERROR: Order not found for ID $orderId");
            echo json_encode(['status' => 'error', 'message' => 'Заказ с таким ID не найден']);
            return;
        }
        error_log("Current status: " . $order['status'] . ", new status: $newStatus");
    }

    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
    if ($stmt->execute([$newStatus, $orderId])) {
        $affected = $stmt->rowCount();
        error_log("Rows affected: $affected");
        if ($affected > 0) {
            echo json_encode(['status' => 'success', 'message' => 'Статус обновлён']);
        } else {
            echo json_encode(['status' => 'success', 'message' => 'Статус уже установлен']);
        }
    } else {
        error_log("ERROR: Update failed");
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления статуса']);
    }
    error_log("=== handleUpdateStatus END ===");
}

function handleGetOrderByNumber($pdo, $input) {
    $orderNumber = trim($input['orderNumber'] ?? $_GET['orderNumber'] ?? $_POST['orderNumber'] ?? '');
    if (empty($orderNumber)) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан номер заказа']);
        return;
    }
    $stmt = $pdo->prepare("SELECT id, order_number, total, status, items, delivery_address, 
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
        'customerName' => $order['customer_name'] ?? '',
        'customerPhone' => $order['customer_phone'] ?? '',
        'customerEmail' => $order['customer_email'] ?? '',
        'userLogin' => $order['user_login']
    ];
    echo json_encode(['status' => 'success', 'order' => $result]);
}