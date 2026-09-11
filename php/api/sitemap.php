<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/xml; charset=utf-8');

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    http_response_code(500);
    echo '<?xml version="1.0" encoding="UTF-8"?><error>DB connection error</error>';
    exit;
}
$conn->set_charset("utf8");

$base = SITE_URL;

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

$staticUrls = [
    ['/', '1.0'],
    ['/catalog', '0.9'],
    ['/constructor', '0.7'],
    ['/contacts', '0.5'],
    ['/privacy', '0.3'],
    ['/offer', '0.3'],
];

foreach ($staticUrls as $u) {
    $loc = htmlspecialchars($base . $u[0]);
    echo "  <url><loc>{$loc}</loc><changefreq>weekly</changefreq><priority>{$u[1]}</priority></url>\n";
}

$cats = $conn->query("SELECT slug FROM categories WHERE slug IS NOT NULL AND slug != ''");
if ($cats) {
    while ($c = $cats->fetch_assoc()) {
        $s = htmlspecialchars($c['slug']);
        echo "  <url><loc>{$base}/category/{$s}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n";
    }
}

$items = $conn->query("SELECT slug FROM items WHERE slug IS NOT NULL AND slug != ''");
if ($items) {
    while ($i = $items->fetch_assoc()) {
        $s = htmlspecialchars($i['slug']);
        echo "  <url><loc>{$base}/product/{$s}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n";
    }
}

echo '</urlset>';
$conn->close();