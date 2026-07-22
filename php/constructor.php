<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'saporedb';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к БД: ' . $e->getMessage()]);
    exit;
}

$result = [];

$stmt = $pdo->query("SELECT id, name, label, circle_size, price FROM constructor_sizes ORDER BY sort_order");
$result['sizes'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

$stmt = $pdo->query("SELECT id, name, icon, price FROM constructor_sauces ORDER BY sort_order");
$result['sauces'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

$stmt = $pdo->query("SELECT id, name, icon, price FROM constructor_toppings ORDER BY sort_order");
$result['toppings'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($result);
?>