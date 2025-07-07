<?php
session_start();

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

// タグ名の検証
if (!isset($_POST['tag']) || empty(trim($_POST['tag']))) {
    $_SESSION['error'] = 'タグ名が指定されていません';
    header('Location: blog.php');
    exit;
}

$tagName = trim($_POST['tag']);

try {
    // データベース接続
    require_once '../include/sanae.tokyo.php';
    $pdoHandler = connectMySql();
    $deleteQuery = "DELETE FROM tag WHERE name = ?";
    $rowCount = $pdoHandler->executionQuery($deleteQuery, [$tagName]);
} catch (PDOException $e) {
    error_log("Database error in del-tag-btn.php: " . $e->getMessage());
    $_SESSION['error'] = "データベースエラーが発生しました";
} catch (Exception $e) {
    error_log("Error in del-tag-btn.php: " . $e->getMessage());
    $_SESSION['error'] = "予期しないエラーが発生しました";
}

// ブログページにリダイレクト
header('Location: blog.php');
exit;
