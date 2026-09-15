<?php
function handleGetDeliveryRules($pdo) {
    $stmt = $pdo->query("SELECT id, min_amount, cost, sort_order FROM delivery_rules ORDER BY sort_order");
    $rules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rules as &$r) {
        $r['id'] = (int)$r['id'];
        $r['min_amount'] = (int)$r['min_amount'];
        $r['cost'] = (int)$r['cost'];
        $r['sort_order'] = (int)$r['sort_order'];
    }
    echo json_encode(['status' => 'success', 'rules' => $rules]);
}

function getDeliveryCost($pdo, $total) {
    $stmt = $pdo->prepare("SELECT cost FROM delivery_rules WHERE min_amount <= ? ORDER BY min_amount DESC LIMIT 1");
    $stmt->execute([$total]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ? (int)$row['cost'] : 0;
}

function getDeliveryRules($pdo) {
    $stmt = $pdo->query("SELECT id, min_amount, cost, sort_order FROM delivery_rules ORDER BY sort_order");
    $rules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'rules' => $rules]);
}

function addDeliveryRule($pdo) {
    $minAmount = (int)($_POST['min_amount'] ?? 0);
    $cost = (int)($_POST['cost'] ?? 0);
    $sortOrder = (int)($_POST['sort_order'] ?? 0);

    if ($minAmount < 0 || $cost < 0) {
        echo json_encode(['status' => 'error', 'message' => 'Значения не могут быть отрицательными']);
        return;
    }

    $stmt = $pdo->prepare("INSERT INTO delivery_rules (min_amount, cost, sort_order) VALUES (?, ?, ?)");
    if ($stmt->execute([$minAmount, $cost, $sortOrder])) {
        echo json_encode(['status' => 'success', 'message' => 'Правило добавлено']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка добавления']);
    }
}

function updateDeliveryRule($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    $minAmount = (int)($_POST['min_amount'] ?? 0);
    $cost = (int)($_POST['cost'] ?? 0);
    $sortOrder = (int)($_POST['sort_order'] ?? 0);

    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан ID']);
        return;
    }

    $stmt = $pdo->prepare("UPDATE delivery_rules SET min_amount=?, cost=?, sort_order=? WHERE id=?");
    if ($stmt->execute([$minAmount, $cost, $sortOrder, $id])) {
        echo json_encode(['status' => 'success', 'message' => 'Правило обновлено']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}

function deleteDeliveryRule($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан ID']);
        return;
    }
    $stmt = $pdo->prepare("DELETE FROM delivery_rules WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['status' => 'success', 'message' => 'Правило удалено']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка удаления']);
    }
}

function handleCheckFreeDelivery($pdo) {
    $login = $_SESSION['user_login'] ?? '';
    if (empty($login) || $login === 'guest') {
        echo json_encode(['status' => 'success', 'available' => false, 'has_bonus' => false]);
        return;
    }

    require_once __DIR__ . '/levels.php';
    $bonuses = getUserActiveBonuses($pdo, $login);
    if (!$bonuses['free_delivery']) {
        echo json_encode(['status' => 'success', 'available' => false, 'has_bonus' => false]);
        return;
    }

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM free_delivery_usage WHERE user_login = ? AND used_at >= DATE_FORMAT(NOW(), '%Y-%m-01')");
    $stmt->execute([$login]);
    $used = $stmt->fetchColumn() > 0;

    echo json_encode([
        'status' => 'success',
        'available' => !$used,
        'has_bonus' => true
    ]);
}