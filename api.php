<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $login = $_POST['Login'] ?? '';
    $password = $_POST['Password'] ?? '';
    $action = $_POST['action'] ?? 'login';

    if (empty($login) || empty($password)) {
        echo json_encode(['status' => 'error', 'message' => 'Заполните все поля']);
        exit;
    }

    $server = "localhost";
    $dbname = "pizzauserdb";
    $dblogin = "root";
    $dbpass = "";

    try {
        $dbstr = "mysql:host=$server;dbname=$dbname;charset=utf8";
        $pdo = new PDO($dbstr, $dblogin, $dbpass);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        if ($action === 'register') {
            $checkSql = "SELECT * FROM Users WHERE Login='$login'";
            $checkStmt = $pdo->query($checkSql);
            if ($checkStmt->rowCount() > 0) {
                echo json_encode(['status' => 'error', 'message' => 'Этот логин уже занят']);
                exit;
            }
            $insertSql = "INSERT INTO Users(Login, Password) VALUES ('$login', '$password')";
            $pdo->query($insertSql);
            echo json_encode(['status' => 'registered', 'message' => 'Вы зарегистрированы']);
        } else {
            $sql = "SELECT * FROM Users WHERE Login='$login' AND Password='$password'";
            $stmt = $pdo->query($sql);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['status' => 'success', 'message' => 'Успешный вход']);
            } else {
                echo json_encode(['status' => 'not_found', 'message' => 'Пользователь не найден']);
            }
        }

    } catch (PDOException $ex) {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка сервера']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Метод не поддерживается']);
}
?>