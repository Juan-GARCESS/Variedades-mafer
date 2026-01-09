-- ============================================
-- Script de Configuración Completa para Neon
-- Sistema de Gestión - Variedades Mafer
-- ============================================

-- Eliminar tablas existentes si es necesario (opcional)
DROP TABLE IF EXISTS "SaleItem" CASCADE;
DROP TABLE IF EXISTS "Sale" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Category" CASCADE;
DROP TABLE IF EXISTS "Service" CASCADE;
DROP TABLE IF EXISTS "Expense" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- ============================================
-- TABLA: User (Usuarios del Sistema)
-- ============================================
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'employee',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: Category (Categorías de Productos)
-- ============================================
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: Product (Productos)
-- ============================================
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_categoriaId_fkey" FOREIGN KEY ("categoriaId") 
        REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================
-- TABLA: Sale (Ventas)
-- ============================================
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'completada',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: SaleItem (Detalles de Ventas)
-- ============================================
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") 
        REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") 
        REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================
-- TABLA: Service (Servicios Adicionales)
-- ============================================
CREATE TABLE "Service" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: Expense (Egresos/Gastos)
-- ============================================
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ÍNDICES para mejorar el rendimiento
-- ============================================
-- El índice único User_email_key se crea automáticamente con la restricción UNIQUE
DROP INDEX IF EXISTS "Product_categoriaId_idx";
DROP INDEX IF EXISTS "SaleItem_saleId_idx";
DROP INDEX IF EXISTS "SaleItem_productId_idx";

CREATE INDEX "Product_categoriaId_idx" ON "Product"("categoriaId");
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");
CREATE INDEX "SaleItem_productId_idx" ON "SaleItem"("productId");

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Usuario Administrador (Contraseña: Luisfelipe17)
-- Hash bcrypt de "Luisfelipe17" con salt rounds = 10
INSERT INTO "User" ("id", "email", "password", "name", "role", "createdAt", "updatedAt")
VALUES (
    'admin-' || substring(md5(random()::text), 1, 20),
    'Mafe@admin.com',
    '$2a$10$8nLVvLXsH5cJZx9g0jJXa.ZX7UprJRKFN8YWqZZ6kTzGJzNvH3Obi',
    'Mafe',
    'admin',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Categorías Iniciales
INSERT INTO "Category" ("id", "nombre", "descripcion", "createdAt", "updatedAt")
VALUES 
    ('cat-' || substring(md5(random()::text), 1, 20), 'Cuadernos', 'Cuadernos de todo tipo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-' || substring(md5(random()::text), 1, 20), 'Escritura', 'Lápices, bolígrafos, marcadores', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-' || substring(md5(random()::text), 1, 20), 'Papel', 'Hojas, resmas, papel especial', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-' || substring(md5(random()::text), 1, 20), 'Accesorios', 'Tijeras, pegamento, clips', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cat-' || substring(md5(random()::text), 1, 20), 'Electrónicos', 'Calculadoras y dispositivos', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ============================================
-- VERIFICACIÓN
-- ============================================
SELECT 'Usuario Administrador creado: ' || email || ' (' || name || ')' as resultado FROM "User" WHERE role = 'admin';
SELECT 'Categorías creadas: ' || COUNT(*)::text as resultado FROM "Category";

-- ============================================
-- ¡CONFIGURACIÓN COMPLETADA!
-- ============================================
