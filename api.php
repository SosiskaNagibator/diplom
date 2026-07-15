<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$server = "localhost";
$dbname = "saporedb";
$dblogin = "root";
$dbpass = "";

try {
    $dbstr = "mysql:host=$server;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dbstr, $dblogin, $dbpass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка подключения к БД']);
    exit;
}

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if ($action === 'get_bonuses' || $action === 'get_bonus_history') {
        require_once __DIR__ . '/api/bonuses.php';
        handleBonusGet($pdo, $action);
        exit;
    }

    if ($action === 'get_user_profile') {
        $login = $_GET['login'] ?? '';
        if (empty($login)) {
            echo json_encode(['status' => 'error', 'message' => 'Логин не указан']);
            exit;
        }
        require_once __DIR__ . '/api/profile.php';
        handleGetUserProfile($pdo, $login);
        exit;
    }

    echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие для GET']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? $_POST['action'] ?? '';

    if ($action === 'login' || $action === 'register') {
        require_once __DIR__ . '/api/auth.php';
        handleAuth($pdo);
        exit;
    }

    if ($action === 'contact') {
        require_once __DIR__ . '/api/contacts.php';
        handleContact($pdo);
        exit;
    }

    if (strpos($action, 'admin_') === 0) {
        require_once __DIR__ . '/api/admin.php';
        handleAdminAction($pdo, $action);
        exit;
    }

    echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие для POST: ' . $action]);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Метод не поддерживается']);