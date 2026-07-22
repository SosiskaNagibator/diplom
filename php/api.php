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

// ---- Rate Limiting ----
function checkRateLimit($pdo, $action, $limit = 30, $period = 60) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $now = date('Y-m-d H:i:s');
    $expire = date('Y-m-d H:i:s', strtotime("-$period seconds"));
    $stmt = $pdo->prepare("DELETE FROM rate_limits WHERE last_request < ?");
    $stmt->execute([$expire]);

    $stmt = $pdo->prepare("SELECT count FROM rate_limits WHERE ip = ? AND action = ?");
    $stmt->execute([$ip, $action]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row && $row['count'] >= $limit) {
        http_response_code(429);
        echo json_encode(['status' => 'error', 'message' => 'Слишком много запросов. Попробуйте позже.']);
        exit;
    }
    if ($row) {
        $stmt = $pdo->prepare("UPDATE rate_limits SET count = count + 1, last_request = ? WHERE ip = ? AND action = ?");
        $stmt->execute([$now, $ip, $action]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO rate_limits (ip, action, count, first_request, last_request) VALUES (?, ?, 1, ?, ?)");
        $stmt->execute([$ip, $action, $now, $now]);
    }
}

function sanitize($data) {
    if (is_array($data)) {
        return array_map('sanitize', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

// ---- Обработка POST-запросов с ограничением ----
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? $_POST['action'] ?? '';
    $limit = ($action === 'login' || $action === 'register') ? 10 : 60;
    checkRateLimit($pdo, $action, $limit, 60);
}

// ---- Действия ----
$action = $_GET['action'] ?? $_POST['action'] ?? '';

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
    if ($action === 'wishlist_get') {
        require_once __DIR__ . '/api/wishlist.php';
        handleWishlistGet($pdo);
        exit;
    }
    echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие для GET']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
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
    if ($action === 'wishlist_toggle') {
        require_once __DIR__ . '/api/wishlist.php';
        handleWishlistToggle($pdo);
        exit;
    }
    if ($action === 'password_reset_request' || $action === 'password_reset_confirm') {
        require_once __DIR__ . '/api/password.php';
        handlePasswordReset($pdo, $action);
        exit;
    }
    if (strpos($action, 'admin_') === 0) {
        require_once __DIR__ . '/api/admin.php';
        handleAdminAction($pdo, $action);
        exit;
    }
    echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие для POST']);
    exit;
}

echo json_encode(['status' => 'error', 'message' => 'Метод не поддерживается']);