<?php
function handleLevelsAction($pdo, $action, $login = null) {
    switch ($action) {
        case 'get_levels':
            getLevels($pdo);
            break;
        case 'get_user_level':
            getUserLevel($pdo, $login);
            break;
        default:
            echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие для уровней']);
    }
}

function getLevels($pdo) {
    $stmt = $pdo->query("SELECT * FROM levels ORDER BY min_bonus");
    $levels = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'levels' => $levels]);
}

function getUserLevel($pdo, $login) {
    if (empty($login)) {
        echo json_encode(['status' => 'error', 'message' => 'Логин не указан']);
        return;
    }

    $stmt = $pdo->prepare("SELECT balance FROM bonuses WHERE login = ?");
    $stmt->execute([$login]);
    $balanceRow = $stmt->fetch(PDO::FETCH_ASSOC);
    $bonuses = $balanceRow ? (int)$balanceRow['balance'] : 0;

    $stmt = $pdo->prepare("SELECT * FROM levels WHERE min_bonus <= ? ORDER BY min_bonus DESC LIMIT 1");
    $stmt->execute([$bonuses]);
    $current = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$current) {
        $stmt = $pdo->query("SELECT * FROM levels ORDER BY min_bonus LIMIT 1");
        $current = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    $stmt = $pdo->prepare("SELECT * FROM levels WHERE min_bonus > ? ORDER BY min_bonus LIMIT 1");
    $stmt->execute([$bonuses]);
    $next = $stmt->fetch(PDO::FETCH_ASSOC);

    $progress = 0;
    if ($next) {
        $currentMin = (int)$current['min_bonus'];
        $nextMin = (int)$next['min_bonus'];
        $progress = ($bonuses - $currentMin) / ($nextMin - $currentMin) * 100;
        $progress = min(max($progress, 0), 100);
    } else {
        $progress = 100;
    }

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_level_history WHERE user_login = ? AND level_id = ?");
    $stmt->execute([$login, $current['id']]);
    $isNew = $stmt->fetchColumn() == 0;

    echo json_encode([
        'status' => 'success',
        'bonuses' => $bonuses,
        'current_level' => $current,
        'next_level' => $next,
        'progress' => round($progress, 2),
        'is_new_level' => $isNew,
    ]);
}

function updateUserLevel($pdo, $login) {
    if (empty($login)) return null;

    $stmt = $pdo->prepare("SELECT balance FROM bonuses WHERE login = ?");
    $stmt->execute([$login]);
    $balanceRow = $stmt->fetch(PDO::FETCH_ASSOC);
    $bonuses = $balanceRow ? (int)$balanceRow['balance'] : 0;

    $stmt = $pdo->prepare("SELECT * FROM levels WHERE min_bonus <= ? ORDER BY min_bonus DESC LIMIT 1");
    $stmt->execute([$bonuses]);
    $level = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$level) return null;

    $stmt = $pdo->prepare("SELECT id FROM user_level_history WHERE user_login = ? AND level_id = ?");
    $stmt->execute([$login, $level['id']]);
    if ($stmt->fetch()) {
        return null;
    }

    $stmt = $pdo->prepare("INSERT INTO user_level_history (user_login, level_id) VALUES (?, ?)");
    $stmt->execute([$login, $level['id']]);

    return $level;
}
?>