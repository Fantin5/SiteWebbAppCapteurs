<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *"); // autorise toutes les origines (à restreindre en prod)
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
require_once 'db_local.php';  // inclut ta connexion PDO

if (!isset($_GET['user_id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'user_id manquant']);
    exit;
}

$user_id = intval($_GET['user_id']);

try {
    $stmt = $pdo->prepare("SELECT userId, nom, prenom, email, isAdmin FROM User WHERE userId = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'Utilisateur non trouvé']);
        exit;
    }

    // Convertir isAdmin en booléen
    $user['isAdmin'] = (bool) $user['isAdmin'];

    echo json_encode($user);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur : ' . $e->getMessage()]);
}
