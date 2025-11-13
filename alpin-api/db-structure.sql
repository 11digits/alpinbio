-- Create syntax for TABLE 'customers'
CREATE TABLE `customers` (
  `id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `billing_address` text,
  `import_source` varchar(20) DEFAULT 'mssql',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 'invoices'
CREATE TABLE `invoices` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `number` varchar(50) NOT NULL,
  `issued_at` date NOT NULL,
  `due_at` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `balance` decimal(10,2) NOT NULL,
  `status` enum('paid','unpaid') DEFAULT 'unpaid',
  `source` varchar(20) DEFAULT 'mssql',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `inv_num` (`number`),
  KEY `customer_id` (`customer_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 'payments'
CREATE TABLE `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `invoice_id` varchar(36) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `paid_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('pending','confirmed','failed') DEFAULT 'pending',
  `payment_method` varchar(30) DEFAULT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `import_source` varchar(20) DEFAULT 'manual',
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create syntax for TABLE 'sessions'
CREATE TABLE `sessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(36) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `verification_code` varchar(10) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;