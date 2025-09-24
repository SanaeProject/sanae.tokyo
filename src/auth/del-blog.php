<?php
require_once '../include/sanae.tokyo.php';
session_start();

$pdoHandler = connectMySql();

// POSTリクエストのみ許可
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: blog.php');
    exit;
}

// CSRFトークンのチェック
if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    $_SESSION['error'] = 'Invalid request';
    header('Location: blog.php');
    exit;
}

try{
    $id = isset($_POST['id']) && !empty(trim($_POST['id'])) ? intval($_POST['id']) : null;

    if (!$id) {
        $_SESSION['error'] = '無効なブログIDです';
        header('Location: blog.php');
        exit;
    }

    $pdoHandler->executionQuery("DELETE FROM blog WHERE id = ?", [$_POST['id']]);
    $_SESSION['success'] = 'ブログが正常に削除されました';
    header('Location: blog.php');
    exit;
}catch(Exception $e){
    error_log("Error in del-blog.php: " . $e->getMessage());
    $_SESSION['error'] = "エラーが発生しました";
}
?>