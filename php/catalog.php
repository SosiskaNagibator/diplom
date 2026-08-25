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

// ---- Если передан id, возвращаем ОДНУ пиццу ----
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id > 0) {
    $stmt = $conn->prepare("SELECT id, name, category, description, price, image, sizes, category_id, 
                                   calories, protein, fat, carbs 
                            FROM items WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($row = $result->fetch_assoc()) {
        $row['id'] = (int)$row['id'];
        $row['price'] = (int)$row['price'];
        $row['category_id'] = (int)$row['category_id'];
        $row['calories'] = (int)$row['calories'];
        $row['protein'] = (float)$row['protein'];
        $row['fat'] = (float)$row['fat'];
        $row['carbs'] = (float)$row['carbs'];

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

// ---- Каталог с пагинацией, фильтром по категории и поиском ----
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 9;
$offset = ($page - 1) * $limit;
$categoryId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 0;
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

// Получаем категории
$categoriesResult = $conn->query("SELECT id, name FROM categories ORDER BY sort_order");
$categories = [];
while ($row = $categoriesResult->fetch_assoc()) {
    $categories[] = $row;
}

// Получаем размеры
$sizesResult = $conn->query("SELECT id, name, label, price_multiplier FROM pizza_sizes ORDER BY sort_order");
$sizes = [];
while ($row = $sizesResult->fetch_assoc()) {
    $sizes[] = $row;
}

// Строим WHERE-условие
$where = '';
$params = [];
$types = '';

if ($categoryId > 0) {
    $where = " WHERE category_id = ?";
    $params[] = $categoryId;
    $types .= 'i';
}

if (!empty($search)) {
    $like = '%' . $search . '%';
    if ($where) {
        $where .= " AND (name LIKE ? OR description LIKE ? OR category LIKE ?)";
    } else {
        $where = " WHERE (name LIKE ? OR description LIKE ? OR category LIKE ?)";
    }
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $types .= 'sss';
}

// Подсчёт общего количества
$countSql = "SELECT COUNT(*) as total FROM items" . $where;
$countStmt = $conn->prepare($countSql);
if (!empty($params)) {
    $countStmt->bind_param($types, ...$params);
}
$countStmt->execute();
$countResult = $countStmt->get_result();
$totalRow = $countResult->fetch_assoc();
$total = (int)$totalRow['total'];

// Основной запрос с пагинацией
$sql = "SELECT id, name, category, description, price, image, sizes, category_id,
               calories, protein, fat, carbs 
        FROM items" . $where . " ORDER BY id LIMIT ? OFFSET ?";
$params[] = $limit;
$params[] = $offset;
$types .= 'ii';

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
$stmt->execute();
$result = $stmt->get_result();

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