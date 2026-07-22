<?php
function handleGetUserProfile($pdo, $login) {
    $stmt = $pdo->prepare("SELECT full_name, phone, email FROM users WHERE Login = ?");
    $stmt->execute([$login]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($user) {
        $stmt = $pdo->prepare("SELECT balance FROM bonuses WHERE login = ?");
        $stmt->execute([$login]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $balance = $row ? (int)$row['balance'] : 0;
        echo json_encode([
            'status' => 'success',
            'user' => [
                'fullName' => $user['full_name'] ?? '',
                'phone' => $user['phone'] ?? '',
                'email' => $user['email'] ?? ''
            ],
            'bonuses' => $balance
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Пользователь не найден']);
    }
}