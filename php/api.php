<?php
$allowedOrigins = ['http://localhost', 'http://localhost:5173', 'http://vladskv.xsph.ru', 'https://vladskv.xsph.ru'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: http://localhost");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

session_set_cookie_params([
    'lifetime' => 86400 * 7,
    'path' => '/',
    'domain' => '',
    'secure' => false,
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$server = "localhost";
$dbname = "vladskv_saporedb";
$dblogin = "vladskv_saporedb";
$dbpass = "Play999111.";

try {
    $dbstr = "mysql:host=$server;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dbstr, $dblogin, $dbpass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Ошибка подключения к БД: ' . $e->getMessage()]);
    exit;
}

function sanitize($data) {
    if (is_array($data)) {
        return array_map('sanitize', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

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

$action = $_GET['action'] ?? $_POST['action'] ?? '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && empty($action)) {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $limit = ($action === 'login' || $action === 'register') ? 10 : 60;
    checkRateLimit($pdo, $action, $limit, 60);
}

function require_api_file($filename) {
    $path = __DIR__ . '/api/' . $filename;
    if (!file_exists($path)) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => "Файл $filename не найден в папке api"]);
        exit;
    }
    require_once $path;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    switch ($action) {
        case 'get_bonuses':
        case 'get_bonus_history':
            require_api_file('bonuses.php');
            handleBonusGet($pdo, $action);
            exit;

        case 'get_user_profile':
            require_api_file('profile.php');
            handleGetUserProfile($pdo);
            exit;

        case 'wishlist_get':
            require_api_file('wishlist.php');
            handleWishlistGet($pdo);
            exit;

        case 'get_referral_info':
            require_api_file('referral.php');
            handleReferralInfo($pdo);
            exit;

        case 'get_user_addresses':
            require_api_file('addresses.php');
            handleAddressAction($pdo, $action);
            exit;

        case 'get_levels':
            require_api_file('levels.php');
            handleLevelsAction($pdo, $action);
            exit;

        case 'get_user_level':
            require_api_file('levels.php');
            $login = $_SESSION['user_login'] ?? '';
            handleLevelsAction($pdo, $action, $login);
            exit;

        case 'get_cart_discount':
            $total = (float)($_GET['total'] ?? 0);
            $login = $_SESSION['user_login'] ?? 'guest';
            require_api_file('levels.php');
            $discountData = calculateCartDiscount($pdo, $login, $total);
            echo json_encode(['status' => 'success', 'data' => $discountData]);
            exit;

        case 'generate_promo':
            require_api_file('promo_generate.php');
            handleGeneratePromo($pdo);
            exit;

        default:
            echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие для GET']);
            exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    switch ($action) {
        case 'login':
        case 'register':
            require_api_file('auth.php');
            handleAuth($pdo);
            exit;

        case 'contact':
            require_api_file('contacts.php');
            handleContact($pdo);
            exit;

        case 'wishlist_toggle':
            require_api_file('wishlist.php');
            handleWishlistToggle($pdo);
            exit;

        case 'password_reset_request':
        case 'password_reset_confirm':
            require_api_file('password.php');
            handlePasswordReset($pdo, $action);
            exit;

        case 'admin_logout':
            session_destroy();
            echo json_encode(['status' => 'success', 'message' => 'Выход выполнен']);
            exit;

        case 'add_user_address':
        case 'delete_user_address':
        case 'set_default_address':
        case 'update_address_label':
            require_api_file('addresses.php');
            handleAddressAction($pdo, $action);
            exit;

        default:
            if (strpos($action, 'admin_') === 0) {
                if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
                    http_response_code(403);
                    echo json_encode(['status' => 'error', 'message' => 'Доступ запрещён. Требуется авторизация администратора.']);
                    exit;
                }
                require_api_file('admin.php');
                handleAdminAction($pdo, $action);
                exit;
            }

            echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие для POST']);
            exit;
    }
}

http_response_code(405);
echo json_encode(['status' => 'error', 'message' => 'Метод не поддерживается']);