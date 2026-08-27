<?php
require_once 'api/levels.php';

$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'saporedb';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Ошибка БД: " . $e->getMessage());
}

$login = 'test1'; // подставьте свой логин

$bonuses = getUserActiveBonuses($pdo, $login);
echo "<pre>";
print_r($bonuses);
echo "</pre>";
?>