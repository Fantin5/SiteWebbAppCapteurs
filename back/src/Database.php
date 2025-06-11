<?php
declare(strict_types=1);

namespace App;

use PDO;
use PDOException;

class Database {
    private static ?PDO $connection = null;

    public static function getConnection(): PDO {
        if (self::$connection === null) {
            try {
                $dsn = sprintf(
                    "mysql:host=%s;dbname=%s;charset=utf8mb4",
                    "db",
                    "site_db"
                );

                self::$connection = new PDO(
                    $dsn,
                    "user",
                    "userpass",
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                    ]
                );
            } catch (PDOException $e) {
                throw new PDOException($e->getMessage(), (int)$e->getCode());
            }
        }
        return self::$connection;
    }
} 