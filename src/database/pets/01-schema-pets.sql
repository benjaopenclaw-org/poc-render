CREATE DATABASE IF NOT EXISTS `pets`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'pets_user'@'%' IDENTIFIED BY 'replace_me';
GRANT ALL PRIVILEGES ON `pets`.* TO 'pets_user'@'%';

USE `pets`;

CREATE TABLE IF NOT EXISTS `pets` (
  `id` CHAR(36) NOT NULL COMMENT 'Identificador UUID de la mascota.',
  `name` VARCHAR(120) NOT NULL COMMENT 'Nombre visible de la mascota dentro del hogar.',
  `species` VARCHAR(80) NOT NULL COMMENT 'Especie declarada para agrupar y resumir mascotas.',
  `breed` VARCHAR(120) NOT NULL COMMENT 'Raza o variedad informativa de la mascota.',
  `age_years` INT UNSIGNED NOT NULL COMMENT 'Edad aproximada de la mascota expresada en años.',
  `health_status` ENUM('healthy', 'attention', 'checkup') NOT NULL DEFAULT 'healthy' COMMENT 'Estado sanitario resumido usado por el dashboard.',
  `vaccination_status` ENUM('up_to_date', 'pending', 'overdue') NOT NULL DEFAULT 'up_to_date' COMMENT 'Estado del calendario de vacunación de la mascota.',
  `photo_url` VARCHAR(255) NOT NULL DEFAULT '' COMMENT 'URL opcional para mostrar foto o avatar de la mascota.',
  `notes` TEXT NOT NULL COMMENT 'Observaciones libres sobre hábitos, carácter o instrucciones del hogar.',
  `next_care_at` DATETIME NULL COMMENT 'Próxima fecha relevante de cuidado o control veterinario.',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro.',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización del registro.',
  PRIMARY KEY (`id`),
  KEY `idx_pets_species` (`species`),
  KEY `idx_pets_health_status` (`health_status`),
  KEY `idx_pets_vaccination_status` (`vaccination_status`),
  KEY `idx_pets_next_care_at` (`next_care_at`)
) ENGINE=InnoDB COMMENT='Tabla principal con la ficha CRUD de mascotas del hogar.';

FLUSH PRIVILEGES;
