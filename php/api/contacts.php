<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../PHPMailer/src/Exception.php';
require_once __DIR__ . '/../PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

function handleContact($pdo) {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $message = trim($input['message'] ?? '');

    if (empty($name) || empty($email) || empty($message)) {
        echo json_encode(['status' => 'error', 'message' => 'Заполните все поля']);
        return;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'Некорректный email']);
        return;
    }

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = SMTP_PORT;

        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress(SMTP_TO_EMAIL);

        $mail->isHTML(false);
        $mail->Subject = "Новое сообщение с сайта Sapore от $name";
        $mail->Body    = "Имя: $name\nEmail: $email\nСообщение:\n$message";

        $mail->send();
        echo json_encode(['status' => 'success', 'message' => 'Сообщение отправлено! Мы свяжемся с вами.']);
    } catch (Exception $e) {
        error_log('Contact mail error: ' . $mail->ErrorInfo);
        echo json_encode(['status' => 'error', 'message' => 'Не удалось отправить сообщение. Попробуйте позже.']);
    }
}