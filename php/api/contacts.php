<?php
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
        $mail->Host       = 'smtp.mail.ru';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'miniontop52@mail.ru';
        $mail->Password   = 'gKq4NdMa0fcayv6OZI75';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;

        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        $mail->setFrom('miniontop52@mail.ru', 'Sapore');
        $mail->addAddress('miniontop52@mail.ru');

        $mail->isHTML(false);
        $mail->Subject = "Новое сообщение с сайта Sapore от $name";
        $mail->Body    = "Имя: $name\nEmail: $email\nСообщение:\n$message";

        $mail->send();
        echo json_encode(['status' => 'success', 'message' => 'Сообщение отправлено! Мы свяжемся с вами.']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка отправки: ' . $mail->ErrorInfo]);
    }
}