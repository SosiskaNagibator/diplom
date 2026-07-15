<?php
function handleAuth($pdo) {
    $login = $_POST['Login'] ?? '';
    $password = $_POST['Password'] ?? '';
    $fullName = trim($_POST['FullName'] ?? '');
    $phone = trim($_POST['Phone'] ?? '');
    $email = trim($_POST['Email'] ?? '');
    $action = $_POST['action'] ?? 'login';

    if ($action === 'register') {
        if (empty($login) || empty($password) || empty($fullName) || empty($phone)) {
            echo json_encode(['status' => 'error', 'message' => 'Заполните все обязательные поля (логин, пароль, имя, телефон)']);
            return;
        }
        $phoneDigits = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($phoneDigits) < 10 || strlen($phoneDigits) > 11) {
            echo json_encode(['status' => 'error', 'message' => 'Некорректный номер телефона']);
            return;
        }
        if (strlen($phoneDigits) === 11 && $phoneDigits[0] === '8') {
            $phone = '+7' . substr($phoneDigits, 1);
        } elseif (strlen($phoneDigits) === 10) {
            $phone = '+7' . $phoneDigits;
        } elseif (strlen($phoneDigits) === 11 && $phoneDigits[0] === '7') {
            $phone = '+7' . substr($phoneDigits, 1);
        }


        if ($login === 'admin') {
            echo json_encode(['status' => 'error', 'message' => 'Этот логин занят']);
            return;
        }

        $stmt = $pdo->prepare("SELECT Login FROM users WHERE Login = ?");
        $stmt->execute([$login]);
        if ($stmt->fetch()) {
            echo json_encode(['status' => 'error', 'message' => 'Этот логин уже занят']);
            return;
        }

        $stmt = $pdo->prepare("INSERT INTO users (Login, Password, full_name, phone, email) VALUES (?, ?, ?, ?, ?)");
        if ($stmt->execute([$login, $password, $fullName, $phone, $email])) {
            $stmt = $pdo->prepare("INSERT INTO bonuses (login, balance) VALUES (?, 100)");
            $stmt->execute([$login]);
            $stmt = $pdo->prepare("INSERT INTO bonus_history (login, amount, description) VALUES (?, 100, 'Бонус за регистрацию')");
            $stmt->execute([$login]);

            echo json_encode([
                'status' => 'registered',
                'message' => 'Вы зарегистрированы',
                'bonuses' => 100,
                'user' => [
                    'login' => $login,
                    'fullName' => $fullName,
                    'phone' => $phone,
                    'email' => $email
                ]
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Ошибка регистрации']);
        }
        return;
    }

    if ($action === 'login') {
        if (empty($login) || empty($password)) {
            echo json_encode(['status' => 'error', 'message' => 'Заполните все поля']);
            return;
        }

        if ($login === 'admin' && $password === '11111') {
            $stmt = $pdo->prepare("SELECT Login, full_name, phone, email FROM users WHERE Login = 'admin'");
            $stmt->execute();
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$user) {
                $pdo->prepare("INSERT INTO users (Login, Password, full_name) VALUES ('admin', '11111', 'Администратор')")->execute();
                $pdo->prepare("INSERT INTO bonuses (login, balance) VALUES ('admin', 0)")->execute();
                $user = ['Login' => 'admin', 'full_name' => 'Администратор', 'phone' => '', 'email' => ''];
            }
            echo json_encode([
                'status' => 'success',
                'message' => 'Вход выполнен',
                'role' => 'admin',
                'user' => [
                    'login' => $user['Login'],
                    'fullName' => $user['full_name'],
                    'phone' => $user['phone'] ?? '',
                    'email' => $user['email'] ?? ''
                ]
            ]);
            return;
        }

        $stmt = $pdo->prepare("SELECT Login, full_name, phone, email FROM users WHERE Login = ? AND Password = ?");
        $stmt->execute([$login, $password]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            $stmt = $pdo->prepare("SELECT balance FROM bonuses WHERE login = ?");
            $stmt->execute([$login]);
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
        } else {
            $stmt = $pdo->prepare("SELECT Login FROM users WHERE Login = ?");
            $stmt->execute([$login]);
            if ($stmt->fetch()) {
                echo json_encode(['status' => 'error', 'message' => 'Неверный пароль']);
            } else {
                echo json_encode(['status' => 'not_found', 'message' => 'Пользователь не найден']);
            }
        }
        return;
    }

    echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие']);
}