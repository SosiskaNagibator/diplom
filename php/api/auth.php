<?php
function handleAuth($pdo) {
    $login = sanitize($_POST['Login'] ?? '');
    $password = $_POST['Password'] ?? '';
    $fullName = sanitize($_POST['FullName'] ?? '');
    $phone = sanitize($_POST['Phone'] ?? '');
    $email = sanitize($_POST['Email'] ?? '');
    $referralCode = sanitize($_POST['ReferralCode'] ?? '');
    $action = $_POST['action'] ?? 'login';

    if ($action === 'register') {
        if (empty($login) || empty($password) || empty($fullName) || empty($phone)) {
            echo json_encode(['status' => 'error', 'message' => 'Заполните все обязательные поля']);
            return;
        }
        if (strlen($login) < 3 || strlen($login) > 50) {
            echo json_encode(['status' => 'error', 'message' => 'Логин от 3 до 50 символов']);
            return;
        }
        if (strlen($password) < 4) {
            echo json_encode(['status' => 'error', 'message' => 'Пароль не менее 4 символов']);
            return;
        }
        if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['status' => 'error', 'message' => 'Некорректный email']);
            return;
        }
        $phoneDigits = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($phoneDigits) < 10 || strlen($phoneDigits) > 11) {
            echo json_encode(['status' => 'error', 'message' => 'Некорректный телефон']);
            return;
        }
        $consentPersonal = isset($_POST['consent_personal_data']) && $_POST['consent_personal_data'] === 'true';
        $consentOffer = isset($_POST['consent_offer']) && $_POST['consent_offer'] === 'true';
        if (!$consentPersonal || !$consentOffer) {
            echo json_encode(['status' => 'error', 'message' => 'Примите условия']);
            return;
        }
        if ($login === 'admin') {
            echo json_encode(['status' => 'error', 'message' => 'Логин занят']);
            return;
        }
        $stmt = $pdo->prepare("SELECT Login FROM users WHERE Login = ?");
        $stmt->execute([$login]);
        if ($stmt->fetch()) {
            echo json_encode(['status' => 'error', 'message' => 'Логин уже занят']);
            return;
        }

        $userReferralCode = strtoupper(substr(md5($login . time()), 0, 8));
        $referrer = null;
        if (!empty($referralCode)) {
            $stmt = $pdo->prepare("SELECT Login FROM users WHERE referral_code = ?");
            $stmt->execute([$referralCode]);
            $referrer = $stmt->fetchColumn();
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("INSERT INTO users (Login, Password, full_name, phone, email, referral_code, referred_by, consent_personal_data, consent_offer) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$login, $hashedPassword, $fullName, $phone, $email, $userReferralCode, $referrer, (int)$consentPersonal, (int)$consentOffer]);

        $stmt = $pdo->prepare("INSERT INTO bonuses (login, balance) VALUES (?, 100)");
        $stmt->execute([$login]);
        $stmt = $pdo->prepare("INSERT INTO bonus_history (login, amount, description) VALUES (?, 100, 'Бонус за регистрацию')");
        $stmt->execute([$login]);

        if ($referrer) {
            $stmt = $pdo->prepare("INSERT INTO referrals (referrer_login, referred_login, bonus_amount, status) VALUES (?, ?, 100, 'pending')");
            $stmt->execute([$referrer, $login]);
        }

        session_regenerate_id(true);
        $_SESSION['user_login'] = $login;

        echo json_encode([
            'status' => 'registered',
            'message' => 'Регистрация успешна',
            'bonuses' => 100,
            'referral_code' => $userReferralCode,
            'user' => [
                'login' => $login,
                'fullName' => $fullName,
                'phone' => $phone,
                'email' => $email
            ]
        ]);
        return;
    }

    if ($action === 'login') {
        if (empty($login) || empty($password)) {
            echo json_encode(['status' => 'error', 'message' => 'Заполните поля']);
            return;
        }

        $stmt = $pdo->prepare("SELECT Login, full_name, phone, email, Password FROM users WHERE Login = ?");
        $stmt->execute([$login]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['Password'])) {
            echo json_encode(['status' => 'error', 'message' => 'Неверный логин или пароль']);
            return;
        }

        session_regenerate_id(true);
        $_SESSION['user_login'] = $user['Login'];

        if ($user['Login'] === 'admin') {
            $_SESSION['is_admin'] = true;
            echo json_encode([
                'status' => 'success',
                'message' => 'Вход выполнен',
                'role' => 'admin',
                'user' => [
                    'login' => 'admin',
                    'fullName' => $user['full_name'] ?? 'Администратор',
                    'phone' => $user['phone'] ?? '',
                    'email' => $user['email'] ?? ''
                ]
            ]);
            return;
        }

        $stmt = $pdo->prepare("SELECT balance FROM bonuses WHERE login = ?");
        $stmt->execute([$user['Login']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $balance = $row ? (int)$row['balance'] : 0;

        echo json_encode([
            'status' => 'success',
            'message' => 'Успешный вход',
            'bonuses' => $balance,
            'user' => [
                'login' => $user['Login'],
                'fullName' => $user['full_name'],
                'phone' => $user['phone'] ?? '',
                'email' => $user['email'] ?? ''
            ]
        ]);
        return;
    }
    echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие']);
}