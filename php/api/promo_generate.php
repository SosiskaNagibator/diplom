<?php
function handleGeneratePromo($pdo) {
    $login = $_GET['login'] ?? $_POST['login'] ?? '';
    if (empty($login)) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан логин']);
        return;
    }

    require_once __DIR__ . '/levels.php';

    $stmt = $pdo->prepare("SELECT total_orders_sum FROM users WHERE Login = ?");
    $stmt->execute([$login]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $ordersSum = $row ? (int)$row['total_orders_sum'] : 0;

    $stmt = $pdo->prepare("SELECT * FROM levels WHERE min_bonus <= ? ORDER BY min_bonus DESC LIMIT 1");
    $stmt->execute([$ordersSum]);
    $level = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$level) {
        echo json_encode(['status' => 'error', 'message' => 'Уровень не найден']);
        return;
    }

    $stmt = $pdo->prepare("SELECT code FROM promo_codes WHERE user_login = ? AND level_id = ? AND is_used = 0 AND (expires_at IS NULL OR expires_at > NOW())");
    $stmt->execute([$login, $level['id']]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($existing) {
        echo json_encode(['status' => 'success', 'code' => $existing['code'], 'level' => $level]);
        return;
    }

    $discountValue = (int)$level['bonus_value'];
    $random = strtoupper(substr(md5(uniqid($login, true)), 0, 6));
    $code = "SAPORE-{$discountValue}-{$random}";

    $stmt = $pdo->prepare("INSERT INTO promo_codes (code, discount_type, discount_value, user_login, level_id, expires_at, is_active, usage_limit) 
                           VALUES (?, 'percent', ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY), 1, 1)");
    $stmt->execute([$code, $discountValue, $login, $level['id']]);

    echo json_encode([
        'status' => 'success',
        'code' => $code,
        'level' => $level,
        'message' => 'Промокод сгенерирован'
    ]);
}
?>