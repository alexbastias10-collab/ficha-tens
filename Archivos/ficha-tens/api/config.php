<?php
const DB_HOST = '127.0.0.1';
const DB_NAME = 'ficha_tens';
const DB_USER = 'root';
const DB_PASS = ''; // XAMPP: root sin contraseña. Cambiar en el servidor.

session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']); // en servidor con HTTPS: 'secure' => true
session_start();
header('Content-Type: application/json; charset=utf-8');

function db(): PDO {
    static $p;
    return $p ??= new PDO('mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4', DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
function fail(int $code, string $msg): void { http_response_code($code); echo json_encode(['error' => $msg]); exit; }
function out($d): void { echo json_encode($d); exit; }
set_exception_handler(function ($e) { error_log($e); fail(500, 'Error del servidor.'); });
