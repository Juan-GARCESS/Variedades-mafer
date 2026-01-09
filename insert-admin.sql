-- Script para insertar usuario administrador en Neon
-- Ejecuta esto en la consola SQL de Neon (https://console.neon.tech)

-- Primero elimina el admin anterior si existe
DELETE FROM "User" WHERE email = 'Mafe@admin.com';

-- Inserta el nuevo usuario admin
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'admin-' || gen_random_uuid()::text,
  'Mafe@admin.com',
  '$2b$10$qEBkWIixQhHwGXdhqZYOLe65YoKUSCxsB5TJpS7NFOhw5sB2CKA8W',
  'Administrador Mafer',
  'admin',
  NOW(),
  NOW()
);

-- Verifica que se creó correctamente
SELECT id, email, name, role, "createdAt" FROM "User" WHERE email = 'Mafe@admin.com';
