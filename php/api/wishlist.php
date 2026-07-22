<?php
function handleWishlistToggle($pdo) {
    $login = sanitize($_POST['login'] ?? '');
    $pizzaId = (int)($_POST['pizza_id'] ?? 0);
    if (!$login || !$pizzaId) {
        echo json_encode(['status' => 'error', 'message' => 'Неверные данные']);
        return;
    }
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM wishlist WHERE user_login = ? AND pizza_id = ?");
    $stmt->execute([$login, $pizzaId]);
    $exists = $stmt->fetchColumn() > 0;
    if ($exists) {
        $stmt = $pdo->prepare("DELETE FROM wishlist WHERE user_login = ? AND pizza_id = ?");
        $stmt->execute([$login, $pizzaId]);
        echo json_encode(['status' => 'success', 'action' => 'removed']);
    } else {
        $stmt = $pdo->prepare("INSERT INTO wishlist (user_login, pizza_id) VALUES (?, ?)");
        $stmt->execute([$login, $pizzaId]);
        echo json_encode(['status' => 'success', 'action' => 'added']);
    }
}

function handleWishlistGet($pdo) {
    $login = sanitize($_GET['login'] ?? '');
    if (!$login) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан логин']);
        return;
    }
    $stmt = $pdo->prepare("SELECT pizza_id FROM wishlist WHERE user_login = ?");
    $stmt->execute([$login]);
    $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode(['status' => 'success', 'ids' => $ids]);
}