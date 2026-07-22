<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$host = 'localhost';
$user = 'root';
$password = '';
$dbname = 'saporedb';

$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit;
}
$conn->set_charset("utf8");

// ---- Если передан id, возвращаем ОДНУ пиццу (для детальной страницы) ----
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id > 0) {
    $sql = "SELECT id, name, category, description, price, image, sizes, category_id, 
                   calories, protein, fat, carbs 
            FROM items WHERE id = $id";
    $result = $conn->query($sql);
    if ($result && $row = $result->fetch_assoc()) {
        $row['id'] = (int)$row['id'];
        $row['price'] = (int)$row['price'];
        $row['category_id'] = (int)$row['category_id'];
        $row['calories'] = (int)$row['calories'];
        $row['protein'] = (float)$row['protein'];
        $row['fat'] = (float)$row['fat'];
        $row['carbs'] = (float)$row['carbs'];
        // Получаем размеры
        $sizesResult = $conn->query("SELECT id, name, label, price_multiplier FROM pizza_sizes ORDER BY sort_order");
        $sizes = [];
        while ($s = $sizesResult->fetch_assoc()) {
            $sizes[] = $s;
        }
        $availableSizes = [];
        if ($row['sizes']) {
            $sizeIds = explode(',', $row['sizes']);
            foreach ($sizes as $size) {
                if (in_array($size['id'], $sizeIds)) {
                    $availableSizes[] = [
                        'id' => $size['id'],
                        'name' => $size['name'],
                        'label' => $size['label'],
                        'price_multiplier' => (float)$size['price_multiplier']
                    ];
                }
            }
        }
        $row['available_sizes'] = $availableSizes;
        echo json_encode(['status' => 'success', 'pizza' => $row]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Пицца не найдена']);
    }
    $conn->close();
    exit;
}

// ---- Иначе — список с пагинацией и фильтром (каталог) ----
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 9;
$offset = ($page - 1) * $limit;
$categoryId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;

$categoriesResult = $conn->query("SELECT id, name FROM categories ORDER BY sort_order");
$categories = [];
while ($row = $categoriesResult->fetch_assoc()) {
    $categories[] = $row;
}

$sizesResult = $conn->query("SELECT id, name, label, price_multiplier FROM pizza_sizes ORDER BY sort_order");
$sizes = [];
while ($row = $sizesResult->fetch_assoc()) {
    $sizes[] = $row;
}

$where = '';
if ($categoryId > 0) {
    $where = " WHERE category_id = $categoryId";
}

$countSql = "SELECT COUNT(*) as total FROM items" . $where;
$countResult = $conn->query($countSql);
$totalRow = $countResult->fetch_assoc();
$total = (int)$totalRow['total'];

$sql = "SELECT id, name, category, description, price, image, sizes, category_id,
               calories, protein, fat, carbs 
        FROM items" . $where . " ORDER BY id LIMIT $limit OFFSET $offset";
$result = $conn->query($sql);
if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка выполнения запроса']);
    $conn->close();
    exit;
}

$pizzas = [];
while ($row = $result->fetch_assoc()) {
    $row['id'] = (int)$row['id'];
    $row['price'] = (int)$row['price'];
    $row['category_id'] = (int)$row['category_id'];
    $row['calories'] = (int)$row['calories'];
    $row['protein'] = (float)$row['protein'];
    $row['fat'] = (float)$row['fat'];
    $row['carbs'] = (float)$row['carbs'];

    $availableSizes = [];
    if ($row['sizes']) {
        $sizeIds = explode(',', $row['sizes']);
        foreach ($sizes as $size) {
            if (in_array($size['id'], $sizeIds)) {
                $availableSizes[] = [
                    'id' => $size['id'],
                    'name' => $size['name'],
                    'label' => $size['label'],
                    'price_multiplier' => (float)$size['price_multiplier']
                ];
            }
        }
    }
    $row['available_sizes'] = $availableSizes;
    $pizzas[] = $row;
}

$conn->close();

echo json_encode([
    'pizzas' => $pizzas,
    'sizes' => $sizes,
    'categories' => $categories,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => $total,
        'totalPages' => ceil($total / $limit)
    ]
]);