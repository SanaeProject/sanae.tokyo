<?php
require_once __DIR__.'/sanae.tokyo.php';
require_once __DIR__.'/sql.php';

$pdoHandler = connectMySql();
try{
    echo json_encode($pdoHandler->executionQuery("SELECT * FROM notice ORDER BY created_at DESC"),0);
}catch(Exception $e){
    echo json_encode(['error' => $e->getMessage()]);
}

?>