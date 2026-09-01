<?php
function handleAddressAction($pdo, $action) {
    $login = $_SESSION['user_login'] ?? '';
    if (empty($login)) {
        echo json_encode(['status' => 'error', 'message' => 'Не авторизован']);
        return;
    }

    switch ($action) {
        case 'get_user_addresses':
            getAddresses($pdo, $login);
            break;
        case 'add_user_address':
            addAddress($pdo, $login);
            break;
        case 'delete_user_address':
            deleteAddress($pdo, $login);
            break;
        case 'set_default_address':
            setDefaultAddress($pdo, $login);
            break;
        case 'update_address_label':
            updateAddressLabel($pdo, $login);
            break;
        default:
            echo json_encode(['status' => 'error', 'message' => 'Неизвестное действие']);
    }
}

function getAddresses($pdo, $login) {
    $stmt = $pdo->prepare("SELECT id, address, label, is_default FROM user_addresses WHERE user_login = ? ORDER BY is_default DESC, created_at DESC");
    $stmt->execute([$login]);
    $addresses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'addresses' => $addresses]);
}

function addAddress($pdo, $login) {
    $address = trim($_POST['address'] ?? '');
    $label = trim($_POST['label'] ?? '');
    $isDefault = (int)($_POST['is_default'] ?? 0);
    if (empty($address)) {
        echo json_encode(['status' => 'error', 'message' => 'Адрес не указан']);
        return;
    }
    $stmt = $pdo->prepare("SELECT id FROM user_addresses WHERE user_login = ? AND address = ?");
    $stmt->execute([$login, $address]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Адрес уже сохранён']);
        return;
    }
    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM user_addresses WHERE user_login = ?");
    $countStmt->execute([$login]);
    $count = $countStmt->fetchColumn();
    if ($count == 0) $isDefault = 1;

    $stmt = $pdo->prepare("INSERT INTO user_addresses (user_login, address, label, is_default) VALUES (?, ?, ?, ?)");
    $stmt->execute([$login, $address, $label, $isDefault]);
    $id = $pdo->lastInsertId();

    if ($isDefault) {
        $stmt = $pdo->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_login = ? AND id != ?");
        $stmt->execute([$login, $id]);
    }

    echo json_encode(['status' => 'success', 'message' => 'Адрес сохранён', 'id' => $id]);
}

function deleteAddress($pdo, $login) {
    $id = (int)($_POST['id'] ?? 0);
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан ID']);
        return;
    }
    $stmt = $pdo->prepare("SELECT user_login FROM user_addresses WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row || $row['user_login'] !== $login) {
        echo json_encode(['status' => 'error', 'message' => 'Нет прав на удаление этого адреса']);
        return;
    }
    $stmt = $pdo->prepare("DELETE FROM user_addresses WHERE id = ?");
    if ($stmt->execute([$id])) {
        echo json_encode(['status' => 'success', 'message' => 'Адрес удалён']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка удаления']);
    }
}

function setDefaultAddress($pdo, $login) {
    $id = (int)($_POST['id'] ?? 0);
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан ID']);
        return;
    }
    $pdo->prepare("UPDATE user_addresses SET is_default = 0 WHERE user_login = ?")->execute([$login]);
    $stmt = $pdo->prepare("UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_login = ?");
    if ($stmt->execute([$id, $login])) {
        echo json_encode(['status' => 'success', 'message' => 'Адрес установлен по умолчанию']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}

function updateAddressLabel($pdo, $login) {
    $id = (int)($_POST['id'] ?? 0);
    $label = trim($_POST['label'] ?? '');
    if (!$id) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан ID']);
        return;
    }
    $stmt = $pdo->prepare("SELECT user_login FROM user_addresses WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row || $row['user_login'] !== $login) {
        echo json_encode(['status' => 'error', 'message' => 'Нет прав']);
        return;
    }
    $stmt = $pdo->prepare("UPDATE user_addresses SET label = ? WHERE id = ?");
    if ($stmt->execute([$label ?: null, $id])) {
        echo json_encode(['status' => 'success', 'message' => 'Метка обновлена']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}