<?php
function handleReferralInfo($pdo) {
    $login = $_GET['login'] ?? '';
    if (empty($login)) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан логин']);
        return;
    }

    // Получаем реферальный код пользователя
    $stmt = $pdo->prepare("SELECT referral_code FROM users WHERE Login = ?");
    $stmt->execute([$login]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user || empty($user['referral_code'])) {
        echo json_encode(['status' => 'error', 'message' => 'Реферальный код не найден']);
        return;
    }
    $code = $user['referral_code'];

    $stmt = $pdo->prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed FROM referrals WHERE referrer_login = ?");
    $stmt->execute([$login]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    require_once __DIR__ . '/levels.php';
    $bonuses = getUserActiveBonuses($pdo, $login);
    $referralExtra = $bonuses['referral_extra'] ?? 0; 

    $baseBonus = 100;
    $bonusAmount = $baseBonus;
    if ($referralExtra > 0) {
        $bonusAmount = $baseBonus + (int)($baseBonus * ($referralExtra / 100));
    }

    echo json_encode([
        'status' => 'success',
        'referral_code' => $code,
        'referral_link' => "http://localhost:5173/register?ref=" . $code,
        'total_referrals' => (int)$stats['total'],
        'completed_referrals' => (int)$stats['completed'],
        'bonus_per_referral' => $bonusAmount, 
    ]);
}
?>