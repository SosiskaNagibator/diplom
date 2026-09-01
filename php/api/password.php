<?php
require_once __DIR__ . '/../PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../PHPMailer/src/SMTP.php';
require_once __DIR__ . '/../PHPMailer/src/Exception.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function handlePasswordReset($pdo, $action) {
    if ($action === 'password_reset_request') {
        handleResetRequest($pdo);
    } elseif ($action === 'password_reset_confirm') {
        handleResetConfirm($pdo);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие']);
    }
}

function handleResetRequest($pdo) {
    $email = sanitize($_POST['email'] ?? '');
    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'Некорректный email']);
        return;
    }
    $stmt = $pdo->prepare("SELECT Login FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user) {
        echo json_encode(['status' => 'success', 'message' => 'Если пользователь существует, ссылка отправлена']);
        return;
    }
    $login = $user['Login'];
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+5 hours'));
    $stmt = $pdo->prepare("DELETE FROM password_resets WHERE email = ?");
    $stmt->execute([$email]);
    $stmt = $pdo->prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)");
    $stmt->execute([$email, $token, $expires]);

    $resetLink = "http://vladskv.xsph.ru/reset-password?token=$token&email=$email";

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.mail.ru';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'miniontop52@mail.ru';
        $mail->Password   = 'gKq4NdMa0fcayv6OZI75';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;
        $mail->CharSet    = 'UTF-8';
        $mail->Encoding   = 'base64';

        $mail->setFrom('miniontop52@mail.ru', 'Sapore');
        $mail->addAddress($email);
        $mail->Subject = 'Восстановление пароля на Sapore';
        $mail->Body    = "Здравствуйте!\n\nДля сброса пароля перейдите по ссылке:\n$resetLink\n\nСсылка действительна 5 часов.\n\nЕсли вы не запрашивали сброс, проигнорируйте это письмо.";

        $mail->send();
        echo json_encode(['status' => 'success', 'message' => 'Ссылка для сброса отправлена на вашу почту']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Не удалось отправить письмо: ' . $mail->ErrorInfo]);
    }
}

function handleResetConfirm($pdo) {
    $token = sanitize($_POST['token'] ?? '');
    $email = sanitize($_POST['email'] ?? '');
    $newPassword = $_POST['password'] ?? '';
    if (empty($token) || empty($email) || empty($newPassword) || strlen($newPassword) < 4) {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
        return;
    }
    $stmt = $pdo->prepare("SELECT * FROM password_resets WHERE email = ? AND token = ? AND expires_at > NOW()");
    $stmt->execute([$email, $token]);
    $reset = $stmt->fetch();
    if (!$reset) {
        echo json_encode(['status' => 'error', 'message' => 'Ссылка недействительна или истекла']);
        return;
    }

    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET Password = ? WHERE email = ?");
    if ($stmt->execute([$hashedPassword, $email])) {
        $stmt = $pdo->prepare("DELETE FROM password_resets WHERE email = ?");
        $stmt->execute([$email]);
        echo json_encode(['status' => 'success', 'message' => 'Пароль успешно изменён']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления пароля']);
    }
}