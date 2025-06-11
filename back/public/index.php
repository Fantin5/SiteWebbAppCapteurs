<?php
header('Content-Type: application/json');

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = trim($_SERVER['PATH_INFO'] ?? '/', '/');

// Include database connection and User class
require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/Models/User.php';

use App\Models\User;

// Initialize response array
$response = [];
$statusCode = 200;

try {
    $user = new User();

    // Router
    switch (true) {
        // GET / - API Info
        case $method === 'GET' && $path === '':
            $response = [
                'message' => 'User API',
                'endpoints' => [
                    'POST /register' => 'Register new user',
                    'POST /login' => 'Login user',
                    'GET /users' => 'Get all users',
                    'GET /users/{id}' => 'Get user by ID',
                    'PUT /users/{id}' => 'Update user',
                    'DELETE /users/{id}' => 'Delete user'
                ]
            ];
            break;

        // POST /register - Register new user
        case $method === 'POST' && $path === 'register':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            $requiredFields = ['nom', 'prenom', 'email', 'password'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    throw new Exception("Missing required field: $field", 400);
                }
            }

            // Check if email exists
            if ($user->emailExists($data['email'])) {
                throw new Exception('Email already registered', 400);
            }

            // Create user
            $userId = $user->create(
                $data['nom'],
                $data['prenom'],
                $data['email'],
                $data['password'],
                $data['isAdmin'] ?? false
            );

            if (!$userId) {
                throw new Exception('Failed to create user', 500);
            }

            $response = [
                'message' => 'User registered successfully',
                'userId' => $userId
            ];
            $statusCode = 201;
            break;

        // POST /login - Login user
        case $method === 'POST' && $path === 'login':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data['email']) || empty($data['password'])) {
                throw new Exception('Email and password are required', 400);
            }

            $userData = $user->authenticate($data['email'], $data['password']);
            if (!$userData) {
                throw new Exception('Invalid credentials', 401);
            }

            $response = [
                'message' => 'Login successful',
                'user' => $userData
            ];
            break;

        // GET /users - Get all users
        case $method === 'GET' && $path === 'users':
            $response = $user->getAll();
            break;

        // GET /users/{id} - Get user by ID
        case $method === 'GET' && preg_match('/^users\/(\d+)$/', $path, $matches):
            $userId = (int)$matches[1];
            $userData = $user->getById($userId);
            
            if (!$userData) {
                throw new Exception('User not found', 404);
            }

            $response = $userData;
            break;

        // PUT /users/{id} - Update user
        case $method === 'PUT' && preg_match('/^users\/(\d+)$/', $path, $matches):
            $userId = (int)$matches[1];
            $data = json_decode(file_get_contents('php://input'), true);

            if (!$user->update($userId, $data)) {
                throw new Exception('Failed to update user', 500);
            }

            $response = ['message' => 'User updated successfully'];
            break;

        // DELETE /users/{id} - Delete user
        case $method === 'DELETE' && preg_match('/^users\/(\d+)$/', $path, $matches):
            $userId = (int)$matches[1];

            if (!$user->delete($userId)) {
                throw new Exception('Failed to delete user', 500);
            }

            $response = ['message' => 'User deleted successfully'];
            break;

        default:
            throw new Exception('Not found', 404);
    }

} catch (Exception $e) {
    $code = $e->getCode();
    // Ensure we only use valid HTTP status codes
    $statusCode = ($code >= 100 && $code < 600) ? $code : 500;
    $response = [
        'error' => $e->getMessage()
    ];
}

// Send response
http_response_code($statusCode);
echo json_encode($response); 