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


    default:
        jsonResponse(['message' => 'Resursa nu există.'], 404);
}
