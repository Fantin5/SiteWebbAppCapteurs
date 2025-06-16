<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_local.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get POST data
$nom = trim($_POST['nom'] ?? '');
$prenom = trim($_POST['prenom'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = $_POST['password'] ?? '';

// Validate required fields
if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email et mot de passe sont requis.']);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Format d\'email invalide.']);
    exit;
}

try {
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT userId FROM user WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Cette adresse email est déjà utilisée.']);
        exit;
    }
    
    // Hash password for security
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $pdo->prepare("INSERT INTO user (nom, prenom, email, password) VALUES (?, ?, ?, ?)");
    
    // Handle empty strings as NULL for optional fields
    $nomValue = empty($nom) ? null : $nom;
    $prenomValue = empty($prenom) ? null : $prenom;
    
    $stmt->execute([$nomValue, $prenomValue, $email, $hashedPassword]);
    
    // Get the newly created user data
    $userId = $pdo->lastInsertId();
    $newUser = [
        'userId' => $userId,
        'nom' => $nomValue,
        'prenom' => $prenomValue,
        'email' => $email
    ];
    
    echo json_encode([
        'success' => true, 
        'message' => 'Inscription réussie !',
        'user' => $newUser
    ]);
    
} catch(PDOException $e) {
    error_log("Registration error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Erreur lors de l\'inscription. Veuillez réessayer.']);
}
?>