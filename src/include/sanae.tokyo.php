<?php
require_once __DIR__ . '/sql.php';
require_once __DIR__ . '/../vendor/autoload.php';
use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();
function connectMySql(): PDOHandler {
    return PDOHandler::getInstanceMYSQL($_ENV['DB_HOST'], $_ENV['DB_NAME'], $_ENV['DB_USER'], $_ENV['DB_PASSWORD']);
}
?>