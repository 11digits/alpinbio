<?php
// ---- API KEY AUTHENTICATION ---- //
$API_KEY = "1111-2222-3333-4444";

$incomingKey = $_SERVER['HTTP_X_API_KEY'] ?? null;

if (!$incomingKey || $incomingKey !== $API_KEY) {
    jsonResponse(['message' => 'Unauthorized'], 401);
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$uri = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$segments = array_values(array_filter(explode('/', $uri)));

if (!empty($segments) && $segments[0] === 'alpin-api') {
    array_shift($segments);
}

require_once __DIR__ . '/db.php'; // PDO connection

function jsonResponse($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

$resource = $segments[0] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

/**
 * ---------------------------------------------------------------------------
 *  HELPERS — DATABASE QUERIES
 * ---------------------------------------------------------------------------
 */

function getCustomers(PDO $db)
{
    $sql = "SELECT * FROM customers ORDER BY name";
    return $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
}

function getCustomer(PDO $db, $id)
{
    $sql = "SELECT * FROM customers WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getCustomerInvoices(PDO $db, $customerId)
{
    $sql = "SELECT * FROM invoices WHERE customer_id = ? ORDER BY issued_at DESC";
    $stmt = $db->prepare($sql);
    $stmt->execute([$customerId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getInvoice(PDO $db, $id)
{
    $sql = "SELECT * FROM invoices WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function getPayments(PDO $db)
{
    $sql = "SELECT p.*, i.number AS invoice_number
            FROM payments p
            LEFT JOIN invoices i ON i.id = p.invoice_id
            ORDER BY paid_at DESC";
    return $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
}

function createPayment(PDO $db, $invoiceId, $amount, $method, $ref)
{
    $sql = "INSERT INTO payments (invoice_id, amount, payment_method, reference, status)
            VALUES (?, ?, ?, ?, 'confirmed')";

    $stmt = $db->prepare($sql);
    $stmt->execute([$invoiceId, $amount, $method, $ref]);

    return $db->lastInsertId();
}

function normalizePhoneValue($value)
{
    return preg_replace('/[^0-9]/', '', $value ?? '');
}

function findCustomerByContact(PDO $db, $contact, $type)
{
    if ($type === 'phone') {
        $normalized = normalizePhoneValue($contact);
        $sql = "SELECT * FROM customers WHERE REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '+', ''), '-', ''), '(' , '') = ? LIMIT 1";
        $stmt = $db->prepare($sql);
        $stmt->execute([$normalized]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    $sql = "SELECT * FROM customers WHERE LOWER(email) = LOWER(?) LIMIT 1";
    $stmt = $db->prepare($sql);
    $stmt->execute([$contact]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function generateVerificationCode()
{
    return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
}

function createVerificationSession(PDO $db, $customerId, $contact, $code)
{
    $expiresAt = (new DateTime('+10 minutes'))->format('Y-m-d H:i:s');

    $sql = "INSERT INTO sessions (customer_id, phone, verification_code, expires_at)
            VALUES (?, ?, ?, ?)";
    $stmt = $db->prepare($sql);
    $stmt->execute([$customerId, $contact, $code, $expiresAt]);

    return [
        'id' => $db->lastInsertId(),
        'expires_at' => $expiresAt
    ];
}

function getVerificationSession(PDO $db, $sessionId)
{
    $sql = "SELECT * FROM sessions WHERE id = ? LIMIT 1";
    $stmt = $db->prepare($sql);
    $stmt->execute([$sessionId]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function markSessionVerified(PDO $db, $sessionId)
{
    $sql = "UPDATE sessions SET verified_at = NOW() WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute([$sessionId]);
}

function maskDisplayName($name)
{
    if (!$name) {
        return null;
    }

    $parts = preg_split('/\s+/', trim($name));
    $masked = array_map(function ($part) {
        $visible = strtoupper(substr($part, 0, 2));
        $remaining = max(strlen($part) - 2, 3);
        return $visible . str_repeat('*', $remaining);
    }, array_filter($parts));

    return implode(' ', $masked);
}

function maskContact($type, $value)
{
    if ($type === 'phone') {
        $numbers = normalizePhoneValue($value);
        if (strlen($numbers) <= 4) {
            return str_repeat('*', max(strlen($numbers) - 2, 0)) . substr($numbers, -2);
        }

        return substr($numbers, 0, 2) . str_repeat('*', strlen($numbers) - 4) . substr($numbers, -2);
    }

    if (!$value || strpos($value, '@') === false) {
        return $value;
    }

    [$local, $domain] = explode('@', $value, 2);
    $localVisible = substr($local, 0, 2);
    return $localVisible . str_repeat('*', max(strlen($local) - 2, 3)) . '@' . $domain;
}

/**
 * ---------------------------------------------------------------------------
 *  ROUTING
 * ---------------------------------------------------------------------------
 */

switch ($resource) {

    /**
     * -----------------------------------------------------------------------
     *  CUSTOMERS
     * -----------------------------------------------------------------------
     */
    case 'customers':
        if ($method === 'GET') {

            // /customers
            if (!isset($segments[1])) {
                jsonResponse(['data' => getCustomers($db)]);
            }

            // /customers/{id}
            $id = $segments[1];
            $customer = getCustomer($db, $id);

            if (!$customer) {
                jsonResponse(['message' => 'Clientul nu a fost găsit.'], 404);
            }

            $customer['invoices'] = getCustomerInvoices($db, $id);

            jsonResponse($customer);
        }

        jsonResponse(['message' => 'Metodă neacceptată.'], 405);
        break;


    /**
     * -----------------------------------------------------------------------
     *  CUSTOMER INVOICES
     *  GET /customers/{id}/invoices
     * -----------------------------------------------------------------------
     */
    case 'invoices':
        if ($method === 'GET') {

            // GET /invoices/{id}
            if (isset($segments[1])) {
                $invoice = getInvoice($db, $segments[1]);

                if (!$invoice) {
                    jsonResponse(['message' => 'Factura nu a fost găsită.'], 404);
                }

                jsonResponse($invoice);
            }

            jsonResponse(['message' => 'Trebuie specificat ID-ul facturii.'], 400);
        }

        jsonResponse(['message' => 'Metodă neacceptată.'], 405);
        break;


    /**
     * -----------------------------------------------------------------------
     *  PAYMENTS
     * -----------------------------------------------------------------------
     */
    case 'payments':

        // GET /payments
        if ($method === 'GET') {
            jsonResponse(['data' => getPayments($db)]);
        }

        // POST /payments
        if ($method === 'POST') {

            $payload = json_decode(file_get_contents('php://input'), true);

            if (!isset($payload['invoice_id'], $payload['amount'])) {
                jsonResponse(['message' => 'invoice_id și amount sunt obligatorii.'], 422);
            }

            $invoice = getInvoice($db, $payload['invoice_id']);
            if (!$invoice) {
                jsonResponse(['message' => 'Factura nu există.'], 404);
            }

            $paymentId = createPayment(
                $db,
                $payload['invoice_id'],
                $payload['amount'],
                $payload['payment_method'] ?? null,
                $payload['reference'] ?? null
            );

            jsonResponse([
                'message' => 'Plata a fost înregistrată.',
                'payment_id' => $paymentId
            ], 201);
        }

        jsonResponse(['message' => 'Metodă neacceptată.'], 405);
        break;


    case 'auth':
        if ($method === 'POST' && isset($segments[1]) && $segments[1] === 'start') {
            $payload = json_decode(file_get_contents('php://input'), true) ?? [];
            $type = strtolower($payload['type'] ?? 'email');
            $contact = trim($payload['contact'] ?? '');

            if (!in_array($type, ['email', 'phone'], true)) {
                jsonResponse(['message' => 'Tipul de contact nu este suportat.'], 422);
            }

            if ($contact === '') {
                $field = $type === 'phone' ? 'numărul de telefon' : 'adresa de email';
                jsonResponse(['message' => "Introduceți $field."], 422);
            }

            $customer = findCustomerByContact($db, $contact, $type);
            if (!$customer) {
                jsonResponse(['message' => 'Nu am găsit niciun client cu aceste informații.'], 404);
            }

            $code = generateVerificationCode();
            $session = createVerificationSession($db, $customer['id'], $type === 'phone' ? normalizePhoneValue($contact) : $contact, $code);

            jsonResponse([
                'message' => 'Codul de verificare a fost trimis.',
                'session_id' => $session['id'],
                'expires_at' => $session['expires_at'],
                'contact_type' => $type,
                'masked_contact' => maskContact($type, $contact),
                'customer_hint' => maskDisplayName($customer['name']),
                'debug_code' => $code
            ], 201);
        }

        if ($method === 'POST' && isset($segments[1]) && $segments[1] === 'verify') {
            $payload = json_decode(file_get_contents('php://input'), true) ?? [];
            $sessionId = $payload['session_id'] ?? null;
            $code = trim($payload['code'] ?? '');

            if (!$sessionId || $code === '') {
                jsonResponse(['message' => 'Sesiunea și codul sunt obligatorii.'], 422);
            }

            $session = getVerificationSession($db, $sessionId);
            if (!$session) {
                jsonResponse(['message' => 'Sesiunea nu există sau a expirat.'], 404);
            }

            if (strtotime($session['expires_at']) < time()) {
                jsonResponse(['message' => 'Codul a expirat. Solicită unul nou.'], 410);
            }

            if ($session['verification_code'] !== $code) {
                jsonResponse(['message' => 'Codul introdus nu este corect.'], 422);
            }

            $customer = getCustomer($db, $session['customer_id']);
            if (!$customer) {
                jsonResponse(['message' => 'Clientul nu a fost găsit.'], 404);
            }

            $customer['invoices'] = getCustomerInvoices($db, $customer['id']);
            markSessionVerified($db, $session['id']);

            jsonResponse([
                'message' => 'Autentificare reușită.',
                'customer' => $customer
            ]);
        }

        jsonResponse(['message' => 'Metodă neacceptată.'], 405);
        break;


    default:
        jsonResponse(['message' => 'Resursa nu există.'], 404);
}
