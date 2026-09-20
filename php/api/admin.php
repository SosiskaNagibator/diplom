<?php
require_once __DIR__ . '/../autoload_intervention.php';
require_once __DIR__ . '/slugify.php';

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

function handleAdminAction($pdo, $action) {
    switch($action) {
        case 'admin_get_orders':
            getOrders($pdo);
            break;
        case 'admin_update_order_status':
            updateOrderStatus($pdo);
            break;
        case 'admin_get_pizzas':
            getPizzas($pdo);
            break;
        case 'admin_add_pizza':
            addPizza($pdo);
            break;
        case 'admin_update_pizza':
            updatePizza($pdo);
            break;
        case 'admin_delete_pizza':
            deletePizza($pdo);
            break;
        case 'admin_get_users':
            getUsers($pdo);
            break;
        case 'admin_update_user_bonus':
            updateUserBonus($pdo);
            break;
        case 'admin_update_user':
            updateUser($pdo);
            break;
        case 'admin_get_sizes':
            getSizes($pdo);
            break;
        case 'admin_add_size':
            addSize($pdo);
            break;
        case 'admin_update_size':
            updateSize($pdo);
            break;
        case 'admin_delete_size':
            deleteSize($pdo);
            break;
        case 'admin_get_toppings':
            getToppings($pdo);
            break;
        case 'admin_add_topping':
            addTopping($pdo);
            break;
        case 'admin_update_topping':
            updateTopping($pdo);
            break;
        case 'admin_delete_topping':
            deleteTopping($pdo);
            break;
        case 'admin_get_categories':
            getCategories($pdo);
            break;
        case 'admin_add_category':
            addCategory($pdo);
            break;
        case 'admin_update_category':
            updateCategory($pdo);
            break;
        case 'admin_delete_category':
            deleteCategory($pdo);
            break;
        case 'admin_get_pages_seo':
            require_once __DIR__ . '/seo.php';
            getPagesSeo($pdo);
            break;
        case 'admin_update_page_seo':
            require_once __DIR__ . '/seo.php';
            updatePageSeo($pdo);
            break;
        case 'admin_get_promos':
            getPromos($pdo);
            break;
        case 'admin_add_promo':
            addPromo($pdo);
            break;
        case 'admin_update_promo':
            updatePromo($pdo);
            break;
        case 'admin_delete_promo':
            deletePromo($pdo);
            break;
        case 'admin_toggle_promo':
            togglePromo($pdo);
            break;
        case 'admin_get_delivery_rules':
            require_once __DIR__ . '/delivery.php';
            getDeliveryRules($pdo);
            break;
        case 'admin_add_delivery_rule':
            require_once __DIR__ . '/delivery.php';
            addDeliveryRule($pdo);
            break;
        case 'admin_update_delivery_rule':
            require_once __DIR__ . '/delivery.php';
            updateDeliveryRule($pdo);
            break;
        case 'admin_delete_delivery_rule':
            require_once __DIR__ . '/delivery.php';
            deleteDeliveryRule($pdo);
            break;
        default:
            echo json_encode(['status' => 'error', 'message' => 'Неизвестное админ-действие']);
    }
}

function generateImageSizes($sourcePath, $uploadDir, $filename) {
    $manager = new ImageManager(new Driver());
    try {
        $image = $manager->read($sourcePath);
    } catch (Exception $e) {
        return false;
    }
    $sizes = [
        'thumb' => ['width' => 400, 'quality' => 78],
        'medium' => ['width' => 800, 'quality' => 82],
        'large' => ['width' => 1200, 'quality' => 85],
        '' => ['width' => null, 'quality' => 90]
    ];
    foreach ($sizes as $prefix => $params) {
        $img = clone $image;
        if ($params['width'] !== null && $image->width() > $params['width']) {
            $img->scale(width: $params['width']);
        }
        $saveName = $prefix ? $prefix . '_' . $filename : $filename;
        $savePath = $uploadDir . $saveName . '.webp';
        $img->toWebp($params['quality'])->save($savePath);
    }
    return true;
}

function deleteImageSizes($uploadDir, $filename) {
    $prefixes = ['thumb_', 'medium_', 'large_', ''];
    foreach ($prefixes as $prefix) {
        $filePath = $uploadDir . $prefix . $filename . '.webp';
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }
}

function getOrders($pdo) {
    $stmt = $pdo->query("SELECT id, order_number, total, status, items, user_login, order_date, delivery_address, delivery_time, promo_code, discount_amount, final_total, customer_name, customer_phone, customer_email FROM orders ORDER BY order_date DESC");
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'orders' => $orders]);
}

function updateOrderStatus($pdo) {
    $orderId = (int)($_POST['order_id'] ?? 0);
    $newStatus = sanitize($_POST['status'] ?? '');
    if (!$orderId || !$newStatus) {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
        return;
    }
    $stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
    if ($stmt->execute([$newStatus, $orderId])) {
        echo json_encode(['status' => 'success', 'message' => 'Статус обновлён']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}

function getPizzas($pdo) {
    $stmt = $pdo->query("SELECT * FROM items ORDER BY id");
    $pizzas = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'pizzas' => $pizzas]);
}

function addPizza($pdo) {
    $name = sanitize($_POST['name'] ?? '');
    $categoryId = (int)($_POST['category_id'] ?? 0);
    $description = sanitize($_POST['description'] ?? '');
    $price = (int)($_POST['price'] ?? 0);
    $sizes = sanitize($_POST['sizes'] ?? '');
    $calories = (int)($_POST['calories'] ?? 0);
    $protein = (float)($_POST['protein'] ?? 0);
    $fat = (float)($_POST['fat'] ?? 0);
    $carbs = (float)($_POST['carbs'] ?? 0);
    $seoTitle = trim($_POST['seo_title'] ?? '');
    $seoDescription = trim($_POST['seo_description'] ?? '');
    $seoH1 = trim($_POST['seo_h1'] ?? '');

    if (empty($name) || $price <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Заполните обязательные поля']);
        return;
    }
    if (!$categoryId) {
        echo json_encode(['status' => 'error', 'message' => 'Выберите категорию']);
        return;
    }
    if (strlen($name) > 100) {
        echo json_encode(['status' => 'error', 'message' => 'Название не более 100 символов']);
        return;
    }

    $stmt = $pdo->prepare("SELECT name FROM categories WHERE id = ?");
    $stmt->execute([$categoryId]);
    $cat = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$cat) {
        echo json_encode(['status' => 'error', 'message' => 'Категория не найдена']);
        return;
    }
    $category = $cat['name'];

    $slug = uniqueSlug($pdo, 'items', slugify($name));

    $uploadDir = __DIR__ . '/uploads/pizzas/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    $imageName = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowed)) {
            echo json_encode(['status' => 'error', 'message' => 'Недопустимый формат файла']);
            return;
        }
        $filename = uniqid();
        $sourcePath = $_FILES['image']['tmp_name'];
        if (!generateImageSizes($sourcePath, $uploadDir, $filename)) {
            echo json_encode(['status' => 'error', 'message' => 'Ошибка обработки изображения']);
            return;
        }
        $imageName = $filename . '.webp';
    }

    $stmt = $pdo->prepare("INSERT INTO items (name, slug, category, category_id, description, price, image, sizes, calories, protein, fat, carbs, seo_title, seo_description, seo_h1) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmt->execute([$name, $slug, $category, $categoryId, $description, $price, $imageName, $sizes, $calories, $protein, $fat, $carbs, $seoTitle ?: null, $seoDescription ?: null, $seoH1 ?: null])) {
        echo json_encode(['status' => 'success', 'message' => 'Товар добавлен', 'id' => $pdo->lastInsertId(), 'slug' => $slug]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка добавления']);
    }
}

function updatePizza($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    $name = sanitize($_POST['name'] ?? '');
    $categoryId = (int)($_POST['category_id'] ?? 0);
    $description = sanitize($_POST['description'] ?? '');
    $price = (int)($_POST['price'] ?? 0);
    $sizes = sanitize($_POST['sizes'] ?? '');
    $calories = (int)($_POST['calories'] ?? 0);
    $protein = (float)($_POST['protein'] ?? 0);
    $fat = (float)($_POST['fat'] ?? 0);
    $carbs = (float)($_POST['carbs'] ?? 0);
    $seoTitle = trim($_POST['seo_title'] ?? '');
    $seoDescription = trim($_POST['seo_description'] ?? '');
    $seoH1 = trim($_POST['seo_h1'] ?? '');

    if (!$id || empty($name) || $price <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Заполните обязательные поля']);
        return;
    }
    if (!$categoryId) {
        echo json_encode(['status' => 'error', 'message' => 'Выберите категорию']);
        return;
    }

    $stmt = $pdo->prepare("SELECT name FROM categories WHERE id = ?");
    $stmt->execute([$categoryId]);
    $cat = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$cat) {
        echo json_encode(['status' => 'error', 'message' => 'Категория не найдена']);
        return;
    }
    $category = $cat['name'];

    $uploadDir = __DIR__ . '/uploads/pizzas/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    $imageName = '';
    $oldImage = '';
    $stmt = $pdo->prepare("SELECT image FROM items WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) $oldImage = $row['image'];

    $slug = uniqueSlug($pdo, 'items', slugify($name), $id);

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowed)) {
            echo json_encode(['status' => 'error', 'message' => 'Недопустимый формат файла']);
            return;
        }
        if ($oldImage) {
            $base = pathinfo($oldImage, PATHINFO_FILENAME);
            deleteImageSizes($uploadDir, $base);
        }
        $filename = uniqid();
        $sourcePath = $_FILES['image']['tmp_name'];
        if (!generateImageSizes($sourcePath, $uploadDir, $filename)) {
            echo json_encode(['status' => 'error', 'message' => 'Ошибка обработки изображения']);
            return;
        }
        $imageName = $filename . '.webp';
    } else {
        $imageName = $oldImage;
    }

    $stmt = $pdo->prepare("UPDATE items SET name=?, slug=?, category=?, category_id=?, description=?, price=?, image=?, sizes=?, calories=?, protein=?, fat=?, carbs=?, seo_title=?, seo_description=?, seo_h1=? WHERE id=?");
    if ($stmt->execute([$name, $slug, $category, $categoryId, $description, $price, $imageName, $sizes, $calories, $protein, $fat, $carbs, $seoTitle ?: null, $seoDescription ?: null, $seoH1 ?: null, $id])) {
        echo json_encode(['status' => 'success', 'message' => 'Товар обновлён', 'slug' => $slug]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}

function deletePizza($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан ID']);
        return;
    }
    $stmt = $pdo->prepare("SELECT image FROM items WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row && $row['image']) {
        $uploadDir = __DIR__ . '/uploads/pizzas/';
        $base = pathinfo($row['image'], PATHINFO_FILENAME);
        deleteImageSizes($uploadDir, $base);
    }
    $stmt = $pdo->prepare("DELETE FROM items WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['status' => 'success', 'message' => 'Товар удалён']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка удаления']);
    }
}

function getUsers($pdo) {
    $stmt = $pdo->query("SELECT u.Login, u.full_name, u.phone, u.email, b.balance FROM users u LEFT JOIN bonuses b ON u.Login = b.login WHERE u.Login != 'admin' ORDER BY u.Login");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'users' => $users]);
}

function updateUserBonus($pdo) {
    $login = sanitize($_POST['login'] ?? '');
    $newBalance = (int)($_POST['balance'] ?? 0);
    if (empty($login) || $login === 'admin' || $newBalance < 0) {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
        return;
    }
    $stmt = $pdo->prepare("UPDATE bonuses SET balance = ? WHERE login = ?");
    if ($stmt->execute([$newBalance, $login])) {
        $stmt = $pdo->prepare("INSERT INTO bonus_history (login, amount, description) VALUES (?, ?, ?)");
        $stmt->execute([$login, $newBalance, 'Админ изменил баланс']);

        require_once __DIR__ . '/levels.php';
        updateUserLevel($pdo, $login);

        echo json_encode(['status' => 'success', 'message' => 'Баланс обновлён']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}

function updateUser($pdo) {
    $login = sanitize($_POST['login'] ?? '');
    $fullName = sanitize($_POST['fullName'] ?? '');
    $phone = sanitize($_POST['phone'] ?? '');
    $email = sanitize($_POST['email'] ?? '');
    if (empty($login) || $login === 'admin') {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
        return;
    }
    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'Некорректный email']);
        return;
    }
    $stmt = $pdo->prepare("UPDATE users SET full_name = ?, phone = ?, email = ? WHERE Login = ?");
    if ($stmt->execute([$fullName, $phone, $email, $login])) {
        echo json_encode(['status' => 'success', 'message' => 'Данные пользователя обновлены']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}

function getSizes($pdo) {
    $stmt = $pdo->query("SELECT * FROM constructor_sizes ORDER BY sort_order");
    $sizes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'sizes' => $sizes]);
}

function addSize($pdo) {
    $name = $_POST['name'] ?? '';
    $label = $_POST['label'] ?? '';
    $circle_size = (int)($_POST['circle_size'] ?? 0);
    $price = (int)($_POST['price'] ?? 0);
    $sort_order = (int)($_POST['sort_order'] ?? 0);
    if (empty($name) || empty($label) || $circle_size <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Заполните обязательные поля']);
        return;
    }
    $stmt = $pdo->prepare("INSERT INTO constructor_sizes (name, label, circle_size, price, sort_order) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$name, $label, $circle_size, $price, $sort_order])) {
        echo json_encode(['status' => 'success', 'message' => 'Размер добавлен']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка добавления']);
    }
}

function updateSize($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    $name = $_POST['name'] ?? '';
    $label = $_POST['label'] ?? '';
    $circle_size = (int)($_POST['circle_size'] ?? 0);
    $price = (int)($_POST['price'] ?? 0);
    $sort_order = (int)($_POST['sort_order'] ?? 0);
    if (!$id || empty($name) || empty($label) || $circle_size <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
        return;
    }
    $stmt = $pdo->prepare("UPDATE constructor_sizes SET name=?, label=?, circle_size=?, price=?, sort_order=? WHERE id=?");
    if ($stmt->execute([$name, $label, $circle_size, $price, $sort_order, $id])) {
        echo json_encode(['status' => 'success', 'message' => 'Размер обновлён']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}

function deleteSize($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан ID']);
        return;
    }
    $stmt = $pdo->prepare("DELETE FROM constructor_sizes WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['status' => 'success', 'message' => 'Размер удалён']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка удаления']);
    }
}

function getToppings($pdo) {
    $stmt = $pdo->query("SELECT * FROM constructor_toppings ORDER BY sort_order");
    $toppings = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'toppings' => $toppings]);
}

function addTopping($pdo) {
    $name = sanitize($_POST['name'] ?? '');
    $price = (int)($_POST['price'] ?? 0);
    $sort_order = (int)($_POST['sort_order'] ?? 0);

    if (empty($name)) {
        echo json_encode(['status' => 'error', 'message' => 'Введите название']);
        return;
    }
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['status' => 'error', 'message' => 'Загрузите изображение']);
        return;
    }

    $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!in_array($ext, $allowed)) {
        echo json_encode(['status' => 'error', 'message' => 'Недопустимый формат файла']);
        return;
    }

    $uploadDir = __DIR__ . '/uploads/constructor/toppings/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    $filename = uniqid();
    $sourcePath = $_FILES['image']['tmp_name'];

    $manager = new ImageManager(new Driver());
    try {
        $image = $manager->read($sourcePath);
        $image->scale(width: 400);
        $image->toWebp(85)->save($uploadDir . $filename . '.webp');
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обработки изображения']);
        return;
    }

    $imageName = $filename . '.webp';

    $stmt = $pdo->prepare("INSERT INTO constructor_toppings (name, image, price, sort_order) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$name, $imageName, $price, $sort_order])) {
        echo json_encode(['status' => 'success', 'message' => 'Начинка добавлена']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка добавления']);
    }
}

function updateTopping($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    $name = sanitize($_POST['name'] ?? '');
    $price = (int)($_POST['price'] ?? 0);
    $sort_order = (int)($_POST['sort_order'] ?? 0);

    if (!$id || empty($name)) {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
        return;
    }

    $uploadDir = __DIR__ . '/uploads/constructor/toppings/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    $stmt = $pdo->prepare("SELECT image FROM constructor_toppings WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $oldImage = $row ? $row['image'] : '';
    $imageName = $oldImage;

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowed)) {
            echo json_encode(['status' => 'error', 'message' => 'Недопустимый формат файла']);
            return;
        }

        if ($oldImage && file_exists($uploadDir . $oldImage)) {
            unlink($uploadDir . $oldImage);
        }

        $filename = uniqid();
        $sourcePath = $_FILES['image']['tmp_name'];

        $manager = new ImageManager(new Driver());
        try {
            $image = $manager->read($sourcePath);
            $image->scale(width: 400);
            $image->toWebp(85)->save($uploadDir . $filename . '.webp');
            $imageName = $filename . '.webp';
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => 'Ошибка обработки изображения']);
            return;
        }
    }

    $stmt = $pdo->prepare("UPDATE constructor_toppings SET name=?, image=?, price=?, sort_order=? WHERE id=?");
    if ($stmt->execute([$name, $imageName, $price, $sort_order, $id])) {
        echo json_encode(['status' => 'success', 'message' => 'Начинка обновлена']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}

function deleteTopping($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан ID']);
        return;
    }

    $stmt = $pdo->prepare("SELECT image FROM constructor_toppings WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row && $row['image']) {
        $uploadDir = __DIR__ . '/uploads/constructor/toppings/';
        $filePath = $uploadDir . $row['image'];
        if (file_exists($filePath)) unlink($filePath);
    }

    $stmt = $pdo->prepare("DELETE FROM constructor_toppings WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['status' => 'success', 'message' => 'Начинка удалена']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка удаления']);
    }
}

function getCategories($pdo) {
    $stmt = $pdo->query("SELECT id, name, slug, sort_order, seo_title, seo_description, seo_h1 FROM categories ORDER BY sort_order");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'categories' => $categories]);
}

function addCategory($pdo) {
    $name = trim($_POST['name'] ?? '');
    $sort_order = (int)($_POST['sort_order'] ?? 0);
    $seoTitle = trim($_POST['seo_title'] ?? '');
    $seoDescription = trim($_POST['seo_description'] ?? '');
    $seoH1 = trim($_POST['seo_h1'] ?? '');

    if (empty($name)) {
        echo json_encode(['status' => 'error', 'message' => 'Введите название']);
        return;
    }
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE name = ?");
    $stmt->execute([$name]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Категория уже существует']);
        return;
    }
    $slug = uniqueSlug($pdo, 'categories', slugify($name));
    $stmt = $pdo->prepare("INSERT INTO categories (name, slug, sort_order, seo_title, seo_description, seo_h1) VALUES (?, ?, ?, ?, ?, ?)");
    if ($stmt->execute([$name, $slug, $sort_order, $seoTitle ?: null, $seoDescription ?: null, $seoH1 ?: null])) {
        echo json_encode(['status' => 'success', 'message' => 'Категория добавлена', 'slug' => $slug]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка добавления']);
    }
}

function updateCategory($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $sort_order = (int)($_POST['sort_order'] ?? 0);
    $seoTitle = trim($_POST['seo_title'] ?? '');
    $seoDescription = trim($_POST['seo_description'] ?? '');
    $seoH1 = trim($_POST['seo_h1'] ?? '');

    if (!$id || empty($name)) {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
        return;
    }
    $slug = uniqueSlug($pdo, 'categories', slugify($name), $id);
    $stmt = $pdo->prepare("UPDATE categories SET name = ?, slug = ?, sort_order = ?, seo_title = ?, seo_description = ?, seo_h1 = ? WHERE id = ?");
    if ($stmt->execute([$name, $slug, $sort_order, $seoTitle ?: null, $seoDescription ?: null, $seoH1 ?: null, $id])) {
        echo json_encode(['status' => 'success', 'message' => 'Категория обновлена', 'slug' => $slug]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}

function deleteCategory($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан ID']);
        return;
    }
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM items WHERE category_id = ?");
    $stmt->execute([$id]);
    $count = $stmt->fetchColumn();
    if ($count > 0) {
        echo json_encode(['status' => 'error', 'message' => "Нельзя удалить: $count товаров используют эту категорию. Сначала измените их."]);
        return;
    }
    $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['status' => 'success', 'message' => 'Категория удалена']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка удаления']);
    }
}

function getPromos($pdo) {
    $stmt = $pdo->query("SELECT id, code, discount_type, discount_value, max_discount, min_order_amount, expires_at, usage_limit, used_count, is_active, created_at, user_login, level_id, is_used FROM promo_codes ORDER BY id DESC");
    $promos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'promos' => $promos]);
}

function addPromo($pdo) {
    $code = strtoupper(trim($_POST['code'] ?? ''));
    $discountType = $_POST['discount_type'] ?? 'percent';
    $discountValue = (float)($_POST['discount_value'] ?? 0);
    $maxDiscount = trim($_POST['max_discount'] ?? '');
    $minOrderAmount = (float)($_POST['min_order_amount'] ?? 0);
    $expiresAt = trim($_POST['expires_at'] ?? '');
    $usageLimit = trim($_POST['usage_limit'] ?? '');
    $isActive = (int)($_POST['is_active'] ?? 1);

    if (empty($code)) {
        echo json_encode(['status' => 'error', 'message' => 'Введите код промокода']);
        return;
    }
    if (!in_array($discountType, ['percent', 'fixed'])) {
        echo json_encode(['status' => 'error', 'message' => 'Неверный тип скидки']);
        return;
    }
    if ($discountValue <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Размер скидки должен быть больше 0']);
        return;
    }
    if ($discountType === 'percent' && $discountValue > 100) {
        echo json_encode(['status' => 'error', 'message' => 'Процент скидки не может быть больше 100']);
        return;
    }

    $stmt = $pdo->prepare("SELECT id FROM promo_codes WHERE code = ?");
    $stmt->execute([$code]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Промокод с таким кодом уже существует']);
        return;
    }

    $expiresAtFormatted = null;
    if (!empty($expiresAt)) {
        $expiresAtFormatted = str_replace('T', ' ', $expiresAt);
        if (strlen($expiresAtFormatted) === 16) {
            $expiresAtFormatted .= ':00';
        }
    }

    $stmt = $pdo->prepare("INSERT INTO promo_codes (code, discount_type, discount_value, max_discount, min_order_amount, expires_at, usage_limit, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    if ($stmt->execute([
        $code,
        $discountType,
        $discountValue,
        $maxDiscount !== '' ? (float)$maxDiscount : null,
        $minOrderAmount,
        $expiresAtFormatted,
        $usageLimit !== '' ? (int)$usageLimit : null,
        $isActive
    ])) {
        echo json_encode(['status' => 'success', 'message' => 'Промокод добавлен', 'id' => $pdo->lastInsertId()]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка добавления']);
    }
}

function updatePromo($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    $code = strtoupper(trim($_POST['code'] ?? ''));
    $discountType = $_POST['discount_type'] ?? 'percent';
    $discountValue = (float)($_POST['discount_value'] ?? 0);
    $maxDiscount = trim($_POST['max_discount'] ?? '');
    $minOrderAmount = (float)($_POST['min_order_amount'] ?? 0);
    $expiresAt = trim($_POST['expires_at'] ?? '');
    $usageLimit = trim($_POST['usage_limit'] ?? '');
    $isActive = (int)($_POST['is_active'] ?? 1);

    if (!$id || empty($code)) {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
        return;
    }
    if (!in_array($discountType, ['percent', 'fixed'])) {
        echo json_encode(['status' => 'error', 'message' => 'Неверный тип скидки']);
        return;
    }
    if ($discountValue <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Размер скидки должен быть больше 0']);
        return;
    }
    if ($discountType === 'percent' && $discountValue > 100) {
        echo json_encode(['status' => 'error', 'message' => 'Процент скидки не может быть больше 100']);
        return;
    }

    $stmt = $pdo->prepare("SELECT id FROM promo_codes WHERE code = ? AND id != ?");
    $stmt->execute([$code, $id]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Промокод с таким кодом уже существует']);
        return;
    }

    $expiresAtFormatted = null;
    if (!empty($expiresAt)) {
        $expiresAtFormatted = str_replace('T', ' ', $expiresAt);
        if (strlen($expiresAtFormatted) === 16) {
            $expiresAtFormatted .= ':00';
        }
    }

    $stmt = $pdo->prepare("UPDATE promo_codes SET code=?, discount_type=?, discount_value=?, max_discount=?, min_order_amount=?, expires_at=?, usage_limit=?, is_active=? WHERE id=?");
    if ($stmt->execute([
        $code,
        $discountType,
        $discountValue,
        $maxDiscount !== '' ? (float)$maxDiscount : null,
        $minOrderAmount,
        $expiresAtFormatted,
        $usageLimit !== '' ? (int)$usageLimit : null,
        $isActive,
        $id
    ])) {
        echo json_encode(['status' => 'success', 'message' => 'Промокод обновлён']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}

function deletePromo($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан ID']);
        return;
    }
    $stmt = $pdo->prepare("DELETE FROM promo_codes WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['status' => 'success', 'message' => 'Промокод удалён']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка удаления']);
    }
}

function togglePromo($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан ID']);
        return;
    }
    $stmt = $pdo->prepare("UPDATE promo_codes SET is_active = 1 - is_active WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['status' => 'success', 'message' => 'Статус изменён']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}