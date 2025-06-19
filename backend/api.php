<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'romantcham.fr';
$dbname = 'Domotic_db';
$user = 'G7B';
$password = 'aqwzsx';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    if (isset($_GET['id_composant'])) {
        $id = (int) $_GET['id_composant'];
        $stmt = $pdo->prepare("SELECT date, valeur FROM mesure WHERE id_composant = ? ORDER BY date ASC");
        $stmt->execute([$id]);
        $mesures = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($mesures);
        exit;
    }

    $stmt = $pdo->query("SELECT * FROM composant");
    $composants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($composants as &$comp) {
        $comp['unite'] = match (strtolower($comp['nom'])) {
            "capteur lumière" => "lux",
            "capteur température" => "°C",
            "capteur humidité" => "%",
            "distance" => "cm",
            default => "",
        };

        if ($comp['is_capteur']) {
            $id = $comp['id'];
            $stmt2 = $pdo->prepare("SELECT * FROM mesure WHERE id_composant = ? ORDER BY date DESC LIMIT 1");
            $stmt2->execute([$id]);
            $last = $stmt2->fetch(PDO::FETCH_ASSOC);
            $comp['valeur'] = $last ? $last['valeur'] : null;
            $comp['date'] = $last ? $last['date'] : null;
        } else {
            $comp['valeur'] = null;
            $comp['date'] = null;
        }
    }

    echo json_encode($composants);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Erreur : " . $e->getMessage()]);
}
// test