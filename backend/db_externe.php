<?php
// Configuration de la base de données externe
$host = 'romantcham.fr';
$dbname = 'Domotic_db';
$username = 'G7B';
$password = 'aqwzsx';

// Headers CORS pour permettre les requêtes depuis votre frontend
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Gestion des requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Connexion à la base de données externe
    $pdoExterne = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdoExterne->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Paramètres de la requête
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 100;
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;
    $sensorType = isset($_GET['sensor_type']) ? $_GET['sensor_type'] : 'all'; // 'temperature', 'humidity', 'all'
    
    // Construction de la requête SQL de base
    $baseQuery = "SELECT 
        id,
        timestamp,
        sensor_type,
        sensor_value,
        unit,
        location,
        DATE_FORMAT(timestamp, '%d/%m/%Y') as date_formatted,
        DATE_FORMAT(timestamp, '%H:%i:%s') as time_formatted
    FROM sensor_data 
    WHERE 1=1";
    
    $params = [];
    
    // Filtrage par type de capteur
    if ($sensorType !== 'all') {
        if ($sensorType === 'temperature') {
            $baseQuery .= " AND (sensor_type = 'temperature' OR sensor_type = 'temp')";
        } elseif ($sensorType === 'humidity') {
            $baseQuery .= " AND (sensor_type = 'humidity' OR sensor_type = 'hum')";
        }
    } else {
        $baseQuery .= " AND sensor_type IN ('temperature', 'temp', 'humidity', 'hum')";
    }
    
    // Filtrage par date
    if ($startDate) {
        $baseQuery .= " AND DATE(timestamp) >= :start_date";
        $params['start_date'] = $startDate;
    }
    
    if ($endDate) {
        $baseQuery .= " AND DATE(timestamp) <= :end_date";
        $params['end_date'] = $endDate;
    }
    
    // Tri et limite
    $baseQuery .= " ORDER BY timestamp DESC LIMIT :limit";
    $params['limit'] = $limit;
    
    // Exécution de la requête
    $stmt = $pdoExterne->prepare($baseQuery);
    
    // Binding des paramètres
    foreach ($params as $key => $value) {
        if ($key === 'limit') {
            $stmt->bindValue(":$key", $value, PDO::PARAM_INT);
        } else {
            $stmt->bindValue(":$key", $value, PDO::PARAM_STR);
        }
    }
    
    $stmt->execute();
    $rawData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Formatage des données pour correspondre à votre structure existante
    $formattedData = [];
    $groupedByTimestamp = [];
    
    // Grouper les données par timestamp pour avoir température et humidité ensemble
    foreach ($rawData as $row) {
        $timestamp = $row['timestamp'];
        if (!isset($groupedByTimestamp[$timestamp])) {
            $groupedByTimestamp[$timestamp] = [
                'timestamp' => $timestamp,
                'date' => $row['date_formatted'],
                'time' => $row['time_formatted'],
                'location' => $row['location'] ?? 'Unknown',
                'sensors' => []
            ];
        }
        
        // Déterminer l'ID du capteur basé sur le type
        $sensorId = 1; // Par défaut température
        if (in_array(strtolower($row['sensor_type']), ['humidity', 'hum'])) {
            $sensorId = 2;
        }
        
        $groupedByTimestamp[$timestamp]['sensors'][] = [
            'id' => $sensorId,
            'type' => $row['sensor_type'],
            'value' => floatval($row['sensor_value']),
            'unit' => $row['unit'] ?? '',
            'status' => 'active'
        ];
    }
    
    // Convertir en format final
    foreach ($groupedByTimestamp as $entry) {
        $formattedData[] = $entry;
    }
    
    // Statistiques supplémentaires
    $stats = [
        'total_records' => count($rawData),
        'date_range' => [
            'start' => $startDate,
            'end' => $endDate
        ],
        'sensor_types' => array_unique(array_column($rawData, 'sensor_type'))
    ];
    
    // Réponse JSON
    $response = [
        'success' => true,
        'data' => $formattedData,
        'stats' => $stats,
        'query_params' => [
            'limit' => $limit,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'sensor_type' => $sensorType
        ]
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de base de données',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

// Fonction utilitaire pour générer du CSV directement depuis PHP (optionnel)
function generateCSV($data, $filename = null) {
    if (!$filename) {
        $filename = 'donnees_capteurs_' . date('Y-m-d') . '.csv';
    }
    
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    
    // BOM UTF-8 pour Excel
    echo "\xEF\xBB\xBF";
    
    $output = fopen('php://output', 'w');
    
    // En-têtes CSV
    $headers = [
        'Date',
        'Heure', 
        'Timestamp_ISO',
        'Temperature_Celsius',
        'Humidite_Pourcentage',
        'Localisation'
    ];
    
    fputcsv($output, $headers, ';');
    
    // Données
    foreach ($data as $row) {
        $temp = null;
        $humidity = null;
        
        foreach ($row['sensors'] as $sensor) {
            if ($sensor['id'] == 1) $temp = $sensor['value'];
            if ($sensor['id'] == 2) $humidity = $sensor['value'];
        }
        
        $csvRow = [
            $row['date'],
            $row['time'],
            $row['timestamp'],
            $temp !== null ? number_format($temp, 1, ',', '') : 'Inactif',
            $humidity !== null ? number_format($humidity, 0, ',', '') : 'Inactif',
            $row['location']
        ];
        
        fputcsv($output, $csvRow, ';');
    }
    
    fclose($output);
    exit();
}

// Si le paramètre 'export=csv' est présent, générer directement le CSV
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    // Re-exécuter la requête pour obtenir les données
    // (code répété pour simplicité - vous pourriez optimiser)
    try {
        $stmt->execute();
        $rawData = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Même logique de formatage que ci-dessus
        $formattedData = [];
        $groupedByTimestamp = [];
        
        foreach ($rawData as $row) {
            $timestamp = $row['timestamp'];
            if (!isset($groupedByTimestamp[$timestamp])) {
                $groupedByTimestamp[$timestamp] = [
                    'timestamp' => $timestamp,
                    'date' => $row['date_formatted'],
                    'time' => $row['time_formatted'],
                    'location' => $row['location'] ?? 'Unknown',
                    'sensors' => []
                ];
            }
            
            $sensorId = 1;
            if (in_array(strtolower($row['sensor_type']), ['humidity', 'hum'])) {
                $sensorId = 2;
            }
            
            $groupedByTimestamp[$timestamp]['sensors'][] = [
                'id' => $sensorId,
                'type' => $row['sensor_type'],
                'value' => floatval($row['sensor_value']),
                'unit' => $row['unit'] ?? '',
                'status' => 'active'
            ];
        }
        
        foreach ($groupedByTimestamp as $entry) {
            $formattedData[] = $entry;
        }
        
        generateCSV($formattedData);
        
    } catch(Exception $e) {
        http_response_code(500);
        echo "Erreur lors de l'export CSV: " . $e->getMessage();
    }
}
?>