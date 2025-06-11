<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get POST data
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// Validate required fields
if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email et mot de passe sont requis.']);
    exit;
}

try {
    // Find user by email
    $stmt = $pdo->prepare("SELECT userId, nom, prenom, email, password FROM user WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect.']);
        exit;
    }
    
    // Verify password
    if (password_verify($password, $user['password'])) {
        // Remove password from response
        unset($user['password']);
        
        echo json_encode([
            'success' => true, 
            'message' => 'Connexion réussie !',
            'user' => $user
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Email ou mot de passe incorrect.']);
    }
    
} catch(PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erreur lors de la connexion. Veuillez réessayer.']);
}
?>