<?php
function handleBonusGet($pdo, $action) {
    $login = $_GET['login'] ?? '';
    if (empty($login)) {
        echo json_encode(['status' => 'error', 'message' => 'Логин не указан']);
        return;
    }

    if ($action === 'get_bonuses') {
        $stmt = $pdo->prepare("SELECT balance FROM bonuses WHERE login = ?");
        $stmt->execute([$login]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $balance = $row ? (int)$row['balance'] : 0;
        echo json_encode(['status' => 'success', 'bonuses' => $balance]);
        return;
    }

    if ($action === 'get_bonus_history') {
        $stmt = $pdo->prepare("SELECT amount, description, created_at FROM bonus_history WHERE login = ? ORDER BY created_at DESC LIMIT 50");
        $stmt->execute([$login]);
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'history' => $history]);
        return;
    }

    echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие для бонусов']);
}