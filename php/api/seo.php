<?php
function handleGetPageSeo($pdo) {
    $page = $_GET['page'] ?? '';
    if (empty($page)) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан параметр page']);
        return;
    }

    $stmt = $pdo->prepare("SELECT seo_title, seo_description, seo_h1 FROM pages_seo WHERE page_key = ?");
    $stmt->execute([$page]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        echo json_encode(['status' => 'success', 'data' => null]);
        return;
    }

    echo json_encode([
        'status' => 'success',
        'data' => [
            'title' => $row['seo_title'] ?? '',
            'description' => $row['seo_description'] ?? '',
            'h1' => $row['seo_h1'] ?? '',
        ]
    ]);
}

function getPagesSeo($pdo) {
    $stmt = $pdo->query("SELECT page_key, seo_title, seo_description, seo_h1 FROM pages_seo ORDER BY page_key");
    $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'pages' => $pages]);
}

function updatePageSeo($pdo) {
    $pageKey = sanitize($_POST['page_key'] ?? '');
    $title = trim($_POST['seo_title'] ?? '');
    $description = trim($_POST['seo_description'] ?? '');
    $h1 = trim($_POST['seo_h1'] ?? '');

    if (empty($pageKey)) {
        echo json_encode(['status' => 'error', 'message' => 'Не указан page_key']);
        return;
    }

    $stmt = $pdo->prepare("SELECT page_key FROM pages_seo WHERE page_key = ?");
    $stmt->execute([$pageKey]);
    $exists = $stmt->fetch();

    if ($exists) {
        $stmt = $pdo->prepare("UPDATE pages_seo SET seo_title = ?, seo_description = ?, seo_h1 = ? WHERE page_key = ?");
        $ok = $stmt->execute([$title ?: null, $description ?: null, $h1 ?: null, $pageKey]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO pages_seo (page_key, seo_title, seo_description, seo_h1) VALUES (?, ?, ?, ?)");
        $ok = $stmt->execute([$pageKey, $title ?: null, $description ?: null, $h1 ?: null]);
    }

    if ($ok) {
        echo json_encode(['status' => 'success', 'message' => 'SEO обновлено']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка обновления']);
    }
}