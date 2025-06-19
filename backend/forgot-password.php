<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'db_local.php';

require 'PHPMailer-master/PHPMailerAutoload.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$email = trim($_POST['email'] ?? '');

if (empty($email)) {
    echo json_encode(['success' => false, 'message' => 'Email est requis.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT userId FROM user WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['success' => true, 'message' => 'Si cette adresse email existe, vous recevrez les instructions de réinitialisation.']);
        exit;
    }

    $resetToken = bin2hex(random_bytes(32));
    $tokenExpiry = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $stmt = $pdo->prepare("UPDATE user SET reset_token = ?, reset_token_expiry = ? WHERE email = ?");
    $stmt->execute([$resetToken, $tokenExpiry, $email]);

    $mail = new PHPMailer;
    $mail->isSMTP();
    $mail->SMTPSecure = 'ssl';
    $mail->SMTPAuth = true;
    $mail->Host = 'smtp.gmail.com';
    $mail->Port = 465;
    $mail->Username = 'maximilin.lhote@gmail.com';
    $mail->Password = 'vfau elsc tshx rwed';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

    $mail->setFrom('maximilien.lhote@gmail.com', 'ZenHome');
    $mail->addAddress($email);

    $resetLink = "http://localhost:3000/reset-password?token=" . $resetToken;
    
    $mail->isHTML(true);
    $mail->Subject = 'Réinitialisation de mot de passe';
    $mail->Body = "
        <h2>Réinitialisation de mot de passe</h2>
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <p><a href='{$resetLink}'>Réinitialiser mon mot de passe</a></p>
        <p>Ce lien expirera dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    ";

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Si cette adresse email existe, vous recevrez les instructions de réinitialisation.']);

} catch(Exception $e) {
    error_log("Password reset error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Une erreur est survenue. Veuillez réessayer plus tard.']);
} 