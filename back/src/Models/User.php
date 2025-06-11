<?php
declare(strict_types=1);

namespace App\Models;

use App\Database;
use PDO;

class User {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function create(string $nom, string $prenom, string $email, string $password, bool $isAdmin = false): ?int {
        $sql = 'INSERT INTO User (nom, prenom, email, password, isAdmin) VALUES (:nom, :prenom, :email, :password, :isAdmin)';
        $stmt = $this->db->prepare($sql);
        
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        $success = $stmt->execute([
            ':nom' => $nom,
            ':prenom' => $prenom,
            ':email' => $email,
            ':password' => $hashedPassword,
            ':isAdmin' => (int)$isAdmin
        ]);

        return $success ? (int)$this->db->lastInsertId() : null;
    }

    public function authenticate(string $email, string $password): ?array {
        $sql = 'SELECT * FROM User WHERE email = :email';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            unset($user['password']); 
            return $user;
        }

        return null;
    }

    public function getById(int $userId): ?array {
        $sql = 'SELECT userId, nom, prenom, email, isAdmin FROM User WHERE userId = :userId';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':userId' => $userId]);
        return $stmt->fetch() ?: null;
    }

    public function update(int $userId, array $data): bool {
        $allowedFields = ['nom', 'prenom', 'email', 'password', 'isAdmin'];
        $updates = array_intersect_key($data, array_flip($allowedFields));
        
        if (empty($updates)) {
            return false;
        }

        if (isset($updates['password'])) {
            $updates['password'] = password_hash($updates['password'], PASSWORD_DEFAULT);
        }

        $setClauses = [];
        foreach ($updates as $field => $value) {
            $setClauses[] = "`$field` = :$field";
        }

        $sql = 'UPDATE User SET ' . implode(', ', $setClauses) . ' WHERE userId = :userId';
        $stmt = $this->db->prepare($sql);
        
        $updates['userId'] = $userId;
        return $stmt->execute($updates);
    }

    public function delete(int $userId): bool {
        $sql = 'DELETE FROM User WHERE userId = :userId';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([':userId' => $userId]);
    }

    public function getAll(): array {
        $sql = 'SELECT userId, nom, prenom, email, isAdmin FROM User';
        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function emailExists(string $email): bool {
        $sql = 'SELECT COUNT(*) FROM User WHERE email = :email';
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':email' => $email]);
        return (bool)$stmt->fetchColumn();
    }
} 