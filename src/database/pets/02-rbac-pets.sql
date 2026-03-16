USE `pets`;

INSERT INTO `pets` (
  `id`,
  `name`,
  `species`,
  `breed`,
  `age_years`,
  `health_status`,
  `vaccination_status`,
  `photo_url`,
  `notes`,
  `next_care_at`
) VALUES
  (
    'd3d0190d-ff1a-4d03-9d05-1910e5e99a11',
    'Bruno',
    'Perro',
    'Beagle',
    5,
    'healthy',
    'up_to_date',
    'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=300&q=80',
    'Le gusta dormir cerca de la ventana del living.',
    DATE_ADD(NOW(), INTERVAL 12 DAY)
  ),
  (
    '5be8e3e5-2e3a-4c8c-84c5-a6dc73f301cc',
    'Luna',
    'Gato',
    'Siamés',
    3,
    'checkup',
    'pending',
    'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=300&q=80',
    'Control dental pendiente con el veterinario.',
    DATE_ADD(NOW(), INTERVAL 7 DAY)
  ),
  (
    '79e62813-33fe-4dd3-b84c-c736159c2f24',
    'Pepe',
    'Hámster',
    'Sirio',
    1,
    'attention',
    'overdue',
    'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?auto=format&fit=crop&w=300&q=80',
    'Revisar fórmula alimenticia y vacuna vencida.',
    DATE_ADD(NOW(), INTERVAL 3 DAY)
  ),
  (
    'f9c9d7d1-65fc-4d6d-b64f-2d8c8dcbf652',
    'Mora',
    'Perro',
    'Mestiza',
    8,
    'healthy',
    'up_to_date',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=300&q=80',
    'Requiere paseo largo al menos tres veces por semana.',
    DATE_ADD(NOW(), INTERVAL 24 DAY)
  )
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `species` = VALUES(`species`),
  `breed` = VALUES(`breed`),
  `age_years` = VALUES(`age_years`),
  `health_status` = VALUES(`health_status`),
  `vaccination_status` = VALUES(`vaccination_status`),
  `photo_url` = VALUES(`photo_url`),
  `notes` = VALUES(`notes`),
  `next_care_at` = VALUES(`next_care_at`);
