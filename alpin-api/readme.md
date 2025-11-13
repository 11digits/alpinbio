Authentication (Required)

All API requests must include this header:

x-api-key: YOUR_SECRET_KEY


Replace YOUR_SECRET_KEY with the value provided by the backend.

🔴 If the header is missing or incorrect

Response:

401 Unauthorized

{
  "message": "Unauthorized"
}

📂 Endpoints Overview
Method	Endpoint	Description
GET	/customers	List all customers
GET	/customers/{id}	Get customer details + invoices
GET	/customers/{id}/invoices	Get invoices for a customer
GET	/invoices/{id}	Get a single invoice
GET	/payments	List all payments
POST	/payments	Register a payment
🧾 1. Customers
GET /customers
Headers (required)
x-api-key: YOUR_SECRET_KEY

Response (200)
{
  "data": [
    {
      "id": "CL-001",
      "name": "Client Premium",
      "email": "client@example.com",
      "phone": "+40 700 000 000",
      "billing_address": "Strada ...",
      "created_at": "2024-03-01 10:00:00"
    }
  ]
}

GET /customers/{id}
Response (200)
{
  "id": "CL-001",
  "name": "Client Premium",
  "email": "client@example.com",
  "phone": "+40 700 000 000",
  "billing_address": "Strada ...",
  "invoices": [
    {
      "id": "INV1",
      "number": "2024-001",
      "issued_at": "2024-03-01",
      "amount": "5320.50",
      "status": "paid"
    }
  ]
}

🧾 2. Invoices
GET /invoices/{id}
Response (200)
{
  "id": "2024-001",
  "customer_id": "CL-001",
  "number": "2024-001",
  "issued_at": "2024-03-01",
  "due_at": "2024-03-30",
  "amount": "5320.50",
  "balance": "0.00",
  "status": "paid"
}

💳 3. Payments
GET /payments
Response
{
  "data": [
    {
      "id": 15,
      "invoice_id": "2024-001",
      "amount": "5320.50",
      "status": "confirmed",
      "paid_at": "2024-03-02 12:41:00",
      "invoice_number": "2024-001"
    }
  ]
}

POST /payments
Headers
x-api-key: YOUR_SECRET_KEY
Content-Type: application/json

Payload
{
  "invoice_id": "2024-001",
  "amount": 5320.50,
  "payment_method": "card",
  "reference": "EUP123456789"
}

Response (201)
{
  "message": "Plata a fost înregistrată.",
  "payment_id": 56
}

⚠️ Error Format

All errors return:

{
  "message": "Description"
}


Examples:

401 Unauthorized

404 Not found

422 Validation problem
