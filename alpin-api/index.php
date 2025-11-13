<?php
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

$invoices = [
    [
        'id' => '2024-001',
        'customer_id' => 'CL-001',
        'number' => '2024-001',
        'issued_at' => '2024-03-01',
        'due_at' => '2024-03-30',
        'amount' => 5320.50,
        'status' => 'paid'
    ],
    [
        'id' => 'FB2023-001',
        'customer_id' => 'CL-001',
        'number' => 'FB2023-001',
        'issued_at' => '2023-12-15',
        'due_at' => '2024-01-31',
        'amount' => 150.75,
        'status' => 'unpaid'
    ],
    [
        'id' => 'FB2023-002',
        'customer_id' => 'CL-001',
        'number' => 'FB2023-002',
        'issued_at' => '2024-01-05',
        'due_at' => '2024-03-31',
        'amount' => 300.00,
        'status' => 'paid'
    ],
    [
        'id' => 'FB2023-003',
        'customer_id' => 'CL-001',
        'number' => 'FB2023-003',
        'issued_at' => '2024-02-02',
        'due_at' => '2024-03-31',
        'amount' => 410.50,
        'status' => 'due'
    ],
    [
        'id' => 'FB2023-004',
        'customer_id' => 'CL-001',
        'number' => 'FB2023-004',
        'issued_at' => '2024-02-15',
        'due_at' => '2024-03-31',
        'amount' => 89.90,
        'status' => 'unpaid'
    ],
    [
        'id' => 'FB2023-005',
        'customer_id' => 'CL-001',
        'number' => 'FB2023-005',
        'issued_at' => '2024-03-01',
        'due_at' => '2024-03-31',
        'amount' => 125.00,
        'status' => 'paid'
    ],
    [
        'id' => 'FB2023-006',
        'customer_id' => 'CL-001',
        'number' => 'FB2023-006',
        'issued_at' => '2024-03-05',
        'due_at' => '2024-03-31',
        'amount' => 210.00,
        'status' => 'due'
    ],
    [
        'id' => 'FB2023-007',
        'customer_id' => 'CL-001',
        'number' => 'FB2023-007',
        'issued_at' => '2024-03-10',
        'due_at' => '2024-04-15',
        'amount' => 98.40,
        'status' => 'unpaid'
    ],
    [
        'id' => 'FB2023-008',
        'customer_id' => 'CL-001',
        'number' => 'FB2023-008',
        'issued_at' => '2024-03-14',
        'due_at' => '2024-04-30',
        'amount' => 145.25,
        'status' => 'unpaid'
    ]
];

$customers = [
    [
        'id' => 'CL-001',
        'name' => 'Client Premium',
        'email' => 'client@alpinbio.ro',
        'phone' => '+40 712 345 678',
        'billing_address' => 'Str. Energiei 12, Alba Iulia, România'
    ]
];

function jsonResponse($data, $status = 200)
{
    http_response_code($status);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

function summarizeInvoices($invoices)
{
    $totals = [
        'count' => count($invoices),
        'amount_due' => 0,
        'amount_paid' => 0,
        'amount_due_soon' => 0
    ];

    foreach ($invoices as $invoice) {
        switch ($invoice['status']) {
            case 'paid':
                $totals['amount_paid'] += $invoice['amount'];
                break;
            case 'due':
                $totals['amount_due_soon'] += $invoice['amount'];
                break;
            default:
                $totals['amount_due'] += $invoice['amount'];
                break;
        }
    }

    return $totals;
}

if (empty($segments)) {
    jsonResponse([
        'service' => 'Alpin Bio Solution API',
        'version' => '1.0.0',
        'endpoints' => [
            'GET /alpin-api/invoices',
            'GET /alpin-api/invoices/{id}',
            'POST /alpin-api/payments',
            'GET /alpin-api/customers/{id}',
            'GET /alpin-api/schema'
        ]
    ]);
}

$resource = $segments[0];
$method = $_SERVER['REQUEST_METHOD'];

switch ($resource) {
    case 'invoices':
        if ($method === 'GET') {
            if (isset($segments[1])) {
                $id = $segments[1];
                foreach ($invoices as $invoice) {
                    if ($invoice['id'] === $id) {
                        jsonResponse($invoice);
                    }
                }

                jsonResponse(['message' => 'Factura nu a fost găsită.'], 404);
            }

            $summary = summarizeInvoices($invoices);
            jsonResponse([
                'data' => $invoices,
                'summary' => $summary
            ]);
        }

        jsonResponse(['message' => 'Metodă neacceptată.'], 405);
        break;

    case 'customers':
        if ($method === 'GET') {
            if (!isset($segments[1])) {
                jsonResponse(['data' => $customers]);
            }

            $id = $segments[1];
            foreach ($customers as $customer) {
                if ($customer['id'] === $id) {
                    $customer['invoices'] = array_values(array_filter(
                        $invoices,
                        fn($invoice) => $invoice['customer_id'] === $id
                    ));

                    jsonResponse($customer);
                }
            }

            jsonResponse(['message' => 'Clientul nu a fost găsit.'], 404);
        }

        jsonResponse(['message' => 'Metodă neacceptată.'], 405);
        break;

    case 'payments':
        if ($method === 'POST') {
            $payload = json_decode(file_get_contents('php://input'), true) ?? [];

            if (!isset($payload['invoice_id'], $payload['amount'])) {
                jsonResponse(['message' => 'Parametrii obligatorii lipsesc.'], 422);
            }

            $invoiceId = $payload['invoice_id'];
            $amount = (float) $payload['amount'];

            foreach ($invoices as $invoice) {
                if ($invoice['id'] === $invoiceId) {
                    jsonResponse([
                        'message' => 'Plata a fost înregistrată cu succes.',
                        'payment' => [
                            'invoice_id' => $invoiceId,
                            'amount' => $amount,
                            'status' => $amount >= $invoice['amount'] ? 'confirmed' : 'partial'
                        ]
                    ], 201);
                }
            }

            jsonResponse(['message' => 'Factura nu a fost găsită.'], 404);
        }

        jsonResponse(['message' => 'Metodă neacceptată.'], 405);
        break;

    case 'schema':
        if ($method === 'GET') {
            jsonResponse([
                'database' => 'alpinbio_payments',
                'tables' => [
                    [
                        'name' => 'customers',
                        'columns' => [
                            'id VARCHAR(36) PRIMARY KEY',
                            'name VARCHAR(150) NOT NULL',
                            'email VARCHAR(150) UNIQUE NOT NULL',
                            'phone VARCHAR(30) NOT NULL',
                            'billing_address TEXT',
                            'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
                        ]
                    ],
                    [
                        'name' => 'invoices',
                        'columns' => [
                            'id VARCHAR(36) PRIMARY KEY',
                            'customer_id VARCHAR(36) NOT NULL',
                            'number VARCHAR(50) UNIQUE NOT NULL',
                            'issued_at DATE NOT NULL',
                            'due_at DATE NOT NULL',
                            'amount DECIMAL(10,2) NOT NULL',
                            "status ENUM('paid','unpaid','due') DEFAULT 'unpaid'",
                            'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
                            'FOREIGN KEY (customer_id) REFERENCES customers(id)'
                        ]
                    ],
                    [
                        'name' => 'payments',
                        'columns' => [
                            'id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY',
                            'invoice_id VARCHAR(36) NOT NULL',
                            'amount DECIMAL(10,2) NOT NULL',
                            'paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
                            "status ENUM('pending','confirmed','failed') DEFAULT 'pending'",
                            'payment_method VARCHAR(30)',
                            'reference VARCHAR(100)',
                            'FOREIGN KEY (invoice_id) REFERENCES invoices(id)'
                        ]
                    ],
                    [
                        'name' => 'sessions',
                        'columns' => [
                            'id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY',
                            'customer_id VARCHAR(36) NOT NULL',
                            'phone VARCHAR(30) NOT NULL',
                            'verification_code VARCHAR(10) NOT NULL',
                            'expires_at TIMESTAMP NOT NULL',
                            'verified_at TIMESTAMP NULL',
                            'FOREIGN KEY (customer_id) REFERENCES customers(id)'
                        ]
                    ]
                ]
            ]);
        }

        jsonResponse(['message' => 'Metodă neacceptată.'], 405);
        break;

    default:
        jsonResponse(['message' => 'Resursa nu există.'], 404);
}
