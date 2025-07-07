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

// 入力データの検証
if (!isset($_POST['title']) || empty(trim($_POST['title']))) {
    $_SESSION['error'] = 'タイトルが入力されていません';
    header('Location: blog.php');
    exit;
}

if (!isset($_POST['md']) || empty(trim($_POST['md']))) {
    $_SESSION['error'] = 'コンテンツが入力されていません';
    header('Location: blog.php');
    exit;
}

$title = trim($_POST['title']);
$content = trim($_POST['md']);
$tags = isset($_POST['tags']) ? trim($_POST['tags']) : '';
$id = isset($_POST['id']) && !empty(trim($_POST['id'])) ? trim($_POST['id']) : null;

// タグの処理（カンマ区切りを配列に変換）
$tagArray = [];
if (!empty($tags)) {
    $tagArray = array_map('trim', explode(',', $tags));
    $tagArray = array_filter($tagArray, function($tag) {
        return !empty($tag);
    });
}

try {
    // データベース接続
    require_once '../include/sanae.tokyo.php';
    $pdoHandler = connectMySql();
    
    if ($id) {
        // 更新処理
        
        // 既存のブログが存在するかチェック
        $checkQuery = "SELECT COUNT(*) as count FROM blog WHERE id = ?";
        $result = $pdoHandler->executionQuery($checkQuery, [$id]);
        
        if (empty($result) || $result[0]['count'] == 0) {
            $_SESSION['error'] = "指定されたブログ（ID: {$id}）が見つかりません";
            header('Location: blog.php');
            exit;
        }
        
        // ブログを更新
        $updateQuery = "UPDATE blog SET title = ?, content = ? WHERE id = ?";
        $rowCount = $pdoHandler->executionQuery($updateQuery, [$title, $content, $id]);
        
        if ($rowCount > 0) {
            // 既存のタグを削除
            $deleteTagsQuery = "DELETE FROM tag WHERE blog_id = ?";
            $pdoHandler->executionQuery($deleteTagsQuery, [$id]);
            
            // 新しいタグを追加
            foreach ($tagArray as $tag) {
                try {
                    $insertTagQuery = "INSERT INTO tag (blog_id, name) VALUES (?, ?)";
                    $pdoHandler->executionQuery($insertTagQuery, [$id, $tag]);
                } catch (Exception $e) {
                    // 重複エラーは無視（UNIQUE制約違反）
                    if (strpos($e->getMessage(), 'Duplicate entry') === false) {
                        throw $e; // 重複以外のエラーは再スロー
                    }
                }
            }
            
            $_SESSION['success'] = "ブログ「{$title}」を更新しました";
        } else {
            $_SESSION['error'] = "ブログの更新に失敗しました";
        }
        
    } else {
        // 新規追加処理
        
        // 新しいブログを追加
        $insertQuery = "INSERT INTO blog (title, content, created_at) VALUES (?, ?, CURRENT_DATE)";
        $rowCount = $pdoHandler->executionQuery($insertQuery, [$title, $content]);
        
        if ($rowCount > 0) {
            $newId = $pdoHandler->getLastInsertId();
            
            // タグを追加
            foreach ($tagArray as $tag) {
                try {
                    $insertTagQuery = "INSERT INTO tag (blog_id, name) VALUES (?, ?)";
                    $pdoHandler->executionQuery($insertTagQuery, [$newId, $tag]);
                } catch (Exception $e) {
                    // 重複エラーは無視（UNIQUE制約違反）
                    if (strpos($e->getMessage(), 'Duplicate entry') === false) {
                        throw $e; // 重複以外のエラーは再スロー
                    }
                }
            }
            
            $_SESSION['success'] = "新しいブログ「{$title}」を作成しました（ID: {$newId}）";
        } else {
            $_SESSION['error'] = "ブログの作成に失敗しました";
        }
    }
    
} catch (Exception $e) {
    error_log("Error in update-blog.php: " . $e->getMessage());
    $_SESSION['error'] = "データベースエラーが発生しました";
}

// ブログページにリダイレクト
header('Location: blog.php');
exit;
