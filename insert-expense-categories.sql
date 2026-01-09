-- Script para insertar categorías de egresos por defecto
-- Ejecuta esto en la consola SQL de Neon (https://console.neon.tech)

INSERT INTO "ExpenseCategory" (id, nombre, "createdAt", "updatedAt")
VALUES
  ('exp-cat-' || gen_random_uuid()::text, 'Compra de Inventario', NOW(), NOW()),
  ('exp-cat-' || gen_random_uuid()::text, 'Servicios Públicos', NOW(), NOW()),
  ('exp-cat-' || gen_random_uuid()::text, 'Transporte', NOW(), NOW()),
  ('exp-cat-' || gen_random_uuid()::text, 'Pago a Proveedores', NOW(), NOW()),
  ('exp-cat-' || gen_random_uuid()::text, 'Mantenimiento', NOW(), NOW()),
  ('exp-cat-' || gen_random_uuid()::text, 'Arriendo', NOW(), NOW()),
  ('exp-cat-' || gen_random_uuid()::text, 'Otros Gastos', NOW(), NOW())
ON CONFLICT (nombre) DO NOTHING;

-- Verifica que se crearon
SELECT * FROM "ExpenseCategory" ORDER BY nombre;
