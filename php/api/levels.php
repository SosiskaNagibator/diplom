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

    $stmt = $pdo->prepare("SELECT total_orders_sum FROM users WHERE Login = ?");
    $stmt->execute([$login]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $ordersSum = $row ? (int)$row['total_orders_sum'] : 0;

    $stmt = $pdo->prepare("SELECT * FROM levels WHERE min_bonus <= ? ORDER BY min_bonus DESC LIMIT 1");
    $stmt->execute([$ordersSum]);
    $current = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$current) {
        $stmt = $pdo->query("SELECT * FROM levels ORDER BY min_bonus LIMIT 1");
        $current = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    $stmt = $pdo->prepare("SELECT * FROM levels WHERE min_bonus > ? ORDER BY min_bonus LIMIT 1");
    $stmt->execute([$ordersSum]);
    $next = $stmt->fetch(PDO::FETCH_ASSOC);

    $progress = 0;
    if ($next) {
        $currentMin = (int)$current['min_bonus'];
        $nextMin = (int)$next['min_bonus'];
        $progress = ($ordersSum - $currentMin) / ($nextMin - $currentMin) * 100;
        $progress = min(max($progress, 0), 100);
    } else {
        $progress = 100;
    }

    $stmt = $pdo->prepare("SELECT COUNT(*) FROM user_level_history WHERE user_login = ? AND level_id = ?");
    $stmt->execute([$login, $current['id']]);
    $isNew = $stmt->fetchColumn() == 0;

    $stmt = $pdo->prepare("SELECT balance FROM bonuses WHERE login = ?");
    $stmt->execute([$login]);
    $balanceRow = $stmt->fetch(PDO::FETCH_ASSOC);
    $bonuses = $balanceRow ? (int)$balanceRow['balance'] : 0;

    $stmt = $pdo->query("SELECT * FROM levels ORDER BY min_bonus");
    $allLevels = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'orders_sum' => $ordersSum,
        'bonuses' => $bonuses,
        'current_level' => $current,
        'next_level' => $next,
        'progress' => round($progress, 2),
        'is_new_level' => $isNew,
        'all_levels' => $allLevels,
    ]);
}

function updateUserLevel($pdo, $login) {
    if (empty($login)) return null;

    $stmt = $pdo->prepare("SELECT total_orders_sum FROM users WHERE Login = ?");
    $stmt->execute([$login]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $ordersSum = $row ? (int)$row['total_orders_sum'] : 0;

    $stmt = $pdo->prepare("SELECT * FROM levels WHERE min_bonus <= ? ORDER BY min_bonus DESC LIMIT 1");
    $stmt->execute([$ordersSum]);
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

function getUserActiveBonuses($pdo, $login) {
    if ($login === 'guest') {
        return [
            'discount' => 0,
            'bonus_multiplier' => 1.0,
            'referral_extra' => 0,
            'review_extra' => 0,
            'free_topping' => false,
            'free_delivery' => false,
            'cashback' => 0,
        ];
    }

    $stmt = $pdo->prepare("SELECT total_orders_sum FROM users WHERE Login = ?");
    $stmt->execute([$login]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $ordersSum = $row ? (int)$row['total_orders_sum'] : 0;

    $stmt = $pdo->prepare("SELECT bonus_type, bonus_value FROM levels WHERE min_bonus <= ?");
    $stmt->execute([$ordersSum]);
    $levels = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $bonuses = [
        'discount' => 0,
        'bonus_multiplier' => 1.0,
        'referral_extra' => 0,
        'review_extra' => 0,
        'free_topping' => false,
        'free_delivery' => false,
        'cashback' => 0,
    ];

    foreach ($levels as $level) {
        $type = $level['bonus_type'];
        $value = (float)$level['bonus_value'];
        switch ($type) {
            case 'discount':
                if ($value > $bonuses['discount']) {
                    $bonuses['discount'] = $value;
                }
                break;
            case 'bonus_multiplier':
                if ($value > $bonuses['bonus_multiplier']) {
                    $bonuses['bonus_multiplier'] = $value;
                }
                break;
            case 'referral_extra':
                if ($value > $bonuses['referral_extra']) {
                    $bonuses['referral_extra'] = $value;
                }
                break;
            case 'review_extra':
                if ($value > $bonuses['review_extra']) {
                    $bonuses['review_extra'] = $value;
                }
                break;
            case 'free_topping':
                $bonuses['free_topping'] = true;
                break;
            case 'free_delivery':
                $bonuses['free_delivery'] = true;
                break;
            case 'cashback':
                if ($value > $bonuses['cashback']) {
                    $bonuses['cashback'] = $value;
                }
                break;
        }
    }

    return $bonuses;
}

function calculateCartDiscount($pdo, $login, $cartTotal) {
    $bonuses = getUserActiveBonuses($pdo, $login);
    
    $freeDelivery = $bonuses['free_delivery'];
    $cashbackPercent = $bonuses['cashback'];
    $bonusMultiplier = $bonuses['bonus_multiplier'];
    
    $applied = [];
    if ($freeDelivery) {
        $applied[] = "Бесплатная доставка";
    }
    if ($cashbackPercent > 0) {
        $applied[] = "Кэшбэк $cashbackPercent%";
    }
    if ($bonusMultiplier > 1) {
        $applied[] = "Бонусы ×" . number_format($bonusMultiplier, 2);
    }
    
    return [
        'discount_percent' => 0,
        'discount_amount' => 0,
        'final_total' => round($cartTotal, 2),
        'free_delivery' => $freeDelivery,
        'cashback_percent' => (float)$cashbackPercent,
        'bonus_multiplier' => (float)$bonusMultiplier,
        'applied_bonuses' => $applied,
        'original_total' => $cartTotal,
    ];
}
?>