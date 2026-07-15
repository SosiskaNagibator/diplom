<?php
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
        case 'admin_get_sauces':
            getSauces($pdo);
            break;
        case 'admin_add_sauce':
            addSauce($pdo);
            break;
        case 'admin_update_sauce':
            updateSauce($pdo);
            break;
        case 'admin_delete_sauce':
            deleteSauce($pdo);
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
        default:
            echo json_encode(['status' => 'error', 'message' => 'Неизвестное админ-действие']);
    }
}

function getOrders($pdo) {
    $stmt = $pdo->query("SELECT id, order_number, total, status, items, user_login, order_date, delivery_address, customer_name, customer_phone, customer_email FROM orders ORDER BY order_date DESC");
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'orders' => $orders]);
}

function updateOrderStatus($pdo) {
    $orderId = $_POST['order_id'] ?? 0;
    $newStatus = $_POST['status'] ?? '';
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
    $name = $_POST['name'] ?? '';
    $category = $_POST['category'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = (int)($_POST['price'] ?? 0);
    $sizes = $_POST['sizes'] ?? '1,2,3';
    
    $image = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/uploads/pizzas/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowed)) {
            echo json_encode(['status' => 'error', 'message' => 'Недопустимый формат файла. Разрешены: ' . implode(', ', $allowed)]);
            return;
        }
        $filename = uniqid() . '.' . $ext;
        $targetPath = $uploadDir . $filename;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
            $image = $filename;
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Ошибка сохранения файла']);
            return;
        }
    }

    if (empty($name) || empty($category) || $price <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Заполните обязательные поля']);
        return;
    }
    $stmt = $pdo->prepare("INSERT INTO items (name, category, description, price, image, sizes) VALUES (?, ?, ?, ?, ?, ?)");
    if ($stmt->execute([$name, $category, $description, $price, $image, $sizes])) {
        echo json_encode(['status' => 'success', 'message' => 'Пицца добавлена', 'id' => $pdo->lastInsertId()]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка добавления']);
    }
}

function updatePizza($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    $name = $_POST['name'] ?? '';
    $category = $_POST['category'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = (int)($_POST['price'] ?? 0);
    $sizes = $_POST['sizes'] ?? '1,2,3';
    
    $image = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/uploads/pizzas/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($ext, $allowed)) {
            echo json_encode(['status' => 'error', 'message' => 'Недопустимый формат файла. Разрешены: ' . implode(', ', $allowed)]);
            return;
        }
        $filename = uniqid() . '.' . $ext;
        $targetPath = $uploadDir . $filename;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
            $image = $filename;
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Ошибка сохранения файла']);
            return;
        }
    } else {
        $stmt = $pdo->prepare("SELECT image FROM items WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $image = $row['image'] ?? '';
    }

    if (!$id || empty($name) || empty($category) || $price <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Заполните обязательные поля']);
        return;
    }
    $stmt = $pdo->prepare("UPDATE items SET name=?, category=?, description=?, price=?, image=?, sizes=? WHERE id=?");
    if ($stmt->execute([$name, $category, $description, $price, $image, $sizes, $id])) {
        echo json_encode(['status' => 'success', 'message' => 'Пицца обновлена']);
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
        $filePath = __DIR__ . '/uploads/pizzas/' . $row['image'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }
    $stmt = $pdo->prepare("DELETE FROM items WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['status' => 'success', 'message' => 'Пицца удалена']);
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
    $login = $_POST['login'] ?? '';
    $newBalance = (int)($_POST['balance'] ?? 0);
    if (empty($login) || $login === 'admin' || $newBalance < 0) {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
        return;
    }
    $stmt = $pdo->prepare("UPDATE bonuses SET balance = ? WHERE login = ?");
    if ($stmt->execute([$newBalance, $login])) {
        $stmt = $pdo->prepare("INSERT INTO bonus_history (login, amount, description) VALUES (?, ?, ?)");
        $stmt->execute([$login, $newBalance, 'Админ изменил баланс']);
        echo json_encode(['status' => 'success', 'message' => 'Баланс обновлён']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}

function updateUser($pdo) {
    $login = $_POST['login'] ?? '';
    $fullName = trim($_POST['fullName'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $email = trim($_POST['email'] ?? '');
    if (empty($login) || $login === 'admin') {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
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

function getSauces($pdo) {
    $stmt = $pdo->query("SELECT * FROM constructor_sauces ORDER BY sort_order");
    $sauces = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'sauces' => $sauces]);
}

function addSauce($pdo) {
    $name = $_POST['name'] ?? '';
    $icon = $_POST['icon'] ?? '';
    $price = (int)($_POST['price'] ?? 0);
    $sort_order = (int)($_POST['sort_order'] ?? 0);
    if (empty($name) || empty($icon)) {
        echo json_encode(['status' => 'error', 'message' => 'Заполните обязательные поля']);
        return;
    }
    $stmt = $pdo->prepare("INSERT INTO constructor_sauces (name, icon, price, sort_order) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$name, $icon, $price, $sort_order])) {
        echo json_encode(['status' => 'success', 'message' => 'Соус добавлен']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка добавления']);
    }
}

function updateSauce($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    $name = $_POST['name'] ?? '';
    $icon = $_POST['icon'] ?? '';
    $price = (int)($_POST['price'] ?? 0);
    $sort_order = (int)($_POST['sort_order'] ?? 0);
    if (!$id || empty($name) || empty($icon)) {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
        return;
    }
    $stmt = $pdo->prepare("UPDATE constructor_sauces SET name=?, icon=?, price=?, sort_order=? WHERE id=?");
    if ($stmt->execute([$name, $icon, $price, $sort_order, $id])) {
        echo json_encode(['status' => 'success', 'message' => 'Соус обновлён']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}

function deleteSauce($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан ID']);
        return;
    }
    $stmt = $pdo->prepare("DELETE FROM constructor_sauces WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['status' => 'success', 'message' => 'Соус удалён']);
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
    $name = $_POST['name'] ?? '';
    $icon = $_POST['icon'] ?? '';
    $price = (int)($_POST['price'] ?? 0);
    $sort_order = (int)($_POST['sort_order'] ?? 0);
    if (empty($name) || empty($icon)) {
        echo json_encode(['status' => 'error', 'message' => 'Заполните обязательные поля']);
        return;
    }
    $stmt = $pdo->prepare("INSERT INTO constructor_toppings (name, icon, price, sort_order) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$name, $icon, $price, $sort_order])) {
        echo json_encode(['status' => 'success', 'message' => 'Начинка добавлена']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка добавления']);
    }
}

function updateTopping($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    $name = $_POST['name'] ?? '';
    $icon = $_POST['icon'] ?? '';
    $price = (int)($_POST['price'] ?? 0);
    $sort_order = (int)($_POST['sort_order'] ?? 0);
    if (!$id || empty($name) || empty($icon)) {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
        return;
    }
    $stmt = $pdo->prepare("UPDATE constructor_toppings SET name=?, icon=?, price=?, sort_order=? WHERE id=?");
    if ($stmt->execute([$name, $icon, $price, $sort_order, $id])) {
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
    $stmt = $pdo->prepare("DELETE FROM constructor_toppings WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['status' => 'success', 'message' => 'Начинка удалена']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка удаления']);
    }
}

function getCategories($pdo) {
    $stmt = $pdo->query("SELECT * FROM categories ORDER BY sort_order");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'categories' => $categories]);
}

function addCategory($pdo) {
    $name = trim($_POST['name'] ?? '');
    $sort_order = (int)($_POST['sort_order'] ?? 0);
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
    $stmt = $pdo->prepare("INSERT INTO categories (name, sort_order) VALUES (?, ?)");
    if ($stmt->execute([$name, $sort_order])) {
        echo json_encode(['status' => 'success', 'message' => 'Категория добавлена']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка добавления']);
    }
}

function updateCategory($pdo) {
    $id = (int)($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    $sort_order = (int)($_POST['sort_order'] ?? 0);
    if (!$id || empty($name)) {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
        return;
    }
    $stmt = $pdo->prepare("UPDATE categories SET name = ?, sort_order = ? WHERE id = ?");
    if ($stmt->execute([$name, $sort_order, $id])) {
        echo json_encode(['status' => 'success', 'message' => 'Категория обновлена']);
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
        echo json_encode(['status' => 'error', 'message' => "Нельзя удалить: $count пицц(а) используют эту категорию. Сначала измените их."]);
        return;
    }
    $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['status' => 'success', 'message' => 'Категория удалена']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка удаления']);
    }
}
?>