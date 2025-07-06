<?php
require_once __DIR__.'/sanae.tokyo.php';
require_once __DIR__.'/sql.php';

$pdoHandler = connectMySql();

if(isset($_GET['req']) && $_GET['req'] === 'tag') {
    try {
        echo json_encode($pdoHandler->executionQuery("SELECT name, COUNT(*) as count FROM tag GROUP BY name ORDER BY count DESC"), 0);
        exit;
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }
}
if(isset($_GET['req']) && $_GET['req'] === 'blog') {
    try {
        $tag = htmlspecialchars(isset($_GET['tag']) ? $_GET['tag'] : '', ENT_QUOTES, 'UTF-8');
        $result = [];

        if(empty($tag)) {
            echo json_encode($pdoHandler->executionQuery("SELECT * FROM blog ORDER BY created_at DESC"));
        }else {
            $query = "SELECT blog.* FROM blog
                      JOIN tag ON blog.id = tag.blog_id
                      WHERE tag.name = ?
                      ORDER BY blog.created_at DESC";
            $params = [$tag];
            echo json_encode($pdoHandler->executionQuery($query, $params));
        }
        exit;
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }

}
if(isset($_GET['req']) && $_GET['req'] === 'blog_detail') {
    if(!isset($_GET['id'])) {
        echo json_encode(['error' => 'ID is required']);
        exit;
    }
    try {
        $id = intval($_GET['id']);
        $query = "SELECT * FROM blog WHERE id = ?";
        $params = [$id];
        $result = $pdoHandler->executionQuery($query, $params);
        if(empty($result)) {
            echo json_encode(['error' => 'Blog not found']);
            exit;
        }
        echo json_encode($result[0], 0);
        exit;
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }
}

if(isset($_GET['req']) && $_GET['req'] === 'notice') {
    try {
        echo json_encode($pdoHandler->executionQuery("SELECT * FROM notice ORDER BY created_at DESC"), 0);
        exit;
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
        exit;
    }
}
?>