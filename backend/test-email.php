<?php
// Test file to debug PHPMailer configuration

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer-master/src/Exception.php';
require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';

$mail = new PHPMailer(true);

try {
    // Enable verbose debug output
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;
    $mail->isSMTP();
    
    // Gmail SMTP configuration
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'maximilin.lhote@gmail.com';
    $mail->Password   = 'vfau elsc tshx rwed';  // App password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;
    
    // Disable SSL verification for testing
    $mail->SMTPOptions = array(
        'ssl' => array(
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        )
    );

    // Recipients
    $mail->setFrom('maximilin.lhote@gmail.com', 'Test');
    $mail->addAddress('maximilin.lhote@gmail.com'); // Send to yourself for testing

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'Test Email';
    $mail->Body    = 'This is a test email from PHPMailer.';

    $mail->send();
    echo 'Test email sent successfully!';
    
} catch (Exception $e) {
    echo "Test email failed. Error: {$mail->ErrorInfo}";
    echo "\nException: " . $e->getMessage();
}
?>
