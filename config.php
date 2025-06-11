<?php
// Database configuration
$host = '127.0.0.1';
$dbname = 'site_db';
$username = 'root';  // Change this to your MySQL username
$password = '';      // Change this to your MySQL password

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>