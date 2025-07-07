<?php
require_once __DIR__.'/sanae.tokyo.php';
require_once __DIR__.'/sql.php';

$pdoHandler = connectMySql();
const MAX_LIMIT = 10;

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
        $tag    = isset($_GET['tag'])    ? htmlspecialchars($_GET['tag'], ENT_QUOTES, 'UTF-8') : '';
        $search = isset($_GET['search']) ? htmlspecialchars($_GET['search'], ENT_QUOTES, 'UTF-8') : '';
        $skip   = isset($_GET['skip'])   ? intval($_GET['skip']) : 0;

        $params = [];
        if (empty($tag)) {
            $query = "SELECT * FROM blog";
            if (!empty($search)) {
                $query .= " WHERE title LIKE ?";
                $params[] = "%{$search}%";
            }
            $query .= " ORDER BY created_at DESC LIMIT " . MAX_LIMIT . " OFFSET " . MAX_LIMIT * $skip;
        } else {
            $query = "SELECT blog.* FROM blog
                      JOIN tag ON blog.id = tag.blog_id
                      WHERE tag.name = ?";
            $params[] = $tag;
            if (!empty($search)) {
                $query .= " AND blog.title LIKE ?";
                $params[] = "%{$search}%";
            }
            $query .= " ORDER BY blog.created_at DESC LIMIT " . MAX_LIMIT . " OFFSET " . MAX_LIMIT * $skip;
        }
        echo json_encode($pdoHandler->executionQuery($query, $params));
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