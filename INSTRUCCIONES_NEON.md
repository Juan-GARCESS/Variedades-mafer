# 🚀 Guía de Configuración de Base de Datos Neon para Variedades Mafer

## 📋 Pasos para crear tu base de datos en Neon

### 1. Crear cuenta en Neon (si no tienes)
- Ve a: https://neon.tech
- Haz clic en "Sign Up" o "Get Started"
- Puedes registrarte con GitHub, Google o email

### 2. Crear un nuevo proyecto
1. Una vez dentro del dashboard de Neon, haz clic en **"New Project"**
2. Configura tu proyecto:
   - **Project Name**: `variedades-mafer` (o el nombre que prefieras)
   - **Region**: Elige la más cercana a ti (ej: US East para mejor latencia)
   - **PostgreSQL version**: Deja la versión recomendada (16)
3. Haz clic en **"Create Project"**

### 3. Obtener la cadena de conexión
1. En tu proyecto recién creado, busca la sección **"Connection Details"**
2. Verás algo como esto:
   ```
   postgresql://usuario:contraseña@ep-xxxx-xxxx.us-east-1.aws.neon.tech/nombredb?sslmode=require
   ```
3. **COPIA ESTA URL COMPLETA** (la necesitarás en el siguiente paso)

## ⚙️ Configuración del Proyecto

### PASO 1: Instalar dependencias
Abre PowerShell en VS Code y ejecuta:
```powershell
npm install
```

Esto instalará:
- `@prisma/client` - Cliente de base de datos
- `prisma` - CLI de Prisma
- `bcryptjs` - Encriptación de contraseñas
- `tsx` - Para ejecutar TypeScript

### PASO 2: Configurar la variable de entorno
1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza `tu-url-de-neon-aqui` con la URL que copiaste de Neon
3. Debe quedar así:
   ```
   DATABASE_URL="postgresql://usuario:contraseña@ep-xxxx-xxxx.us-east-1.aws.neon.tech/nombredb?sslmode=require"
   ```
4. **GUARDA EL ARCHIVO** (.env)

### PASO 3: Generar el cliente de Prisma
```powershell
npm run prisma:generate
```

Esto creará los tipos de TypeScript y el cliente de Prisma basándose en tu schema.

### PASO 4: Crear las tablas en la base de datos
```powershell
npm run prisma:push
```

Esto enviará el esquema a tu base de datos en Neon y creará todas las tablas.

### PASO 5: Inicializar datos (usuario admin y categorías)
```powershell
npm run prisma:seed
```

Esto creará:
- ✅ Usuario administrador: `Mafe@admin.com` / `Luisfelipe17`
- ✅ Categorías por defecto (Cuadernos, Escritura, Papel, etc.)

### PASO 6: Iniciar el servidor
```powershell
npm run dev
```

## 🎯 Verificación

### Opción 1: Usar Prisma Studio (Interfaz visual)
```powershell
npm run prisma:studio
```
Esto abrirá una interfaz web donde puedes ver y editar tus datos directamente.

### Opción 2: Probar en la aplicación
1. Ve a `http://localhost:3000`
2. Inicia sesión con: `Mafe@admin.com` / `Luisfelipe17`
3. Crea una categoría
4. Crea un producto
5. Haz una venta de 9 unidades (si el producto tiene 10)
6. Verifica que el producto quede con stock de 1 (no se elimine)
7. La categoría no debe desaparecer

## 🔧 ¿Qué se arregló con la base de datos?

### ❌ Problemas anteriores (en memoria):
- Los datos se perdían al reiniciar el servidor
- Las categorías desaparecían al asignarlas a productos
- Los productos se eliminaban completamente en lugar de actualizar stock
- Vender 9 de 10 productos eliminaba todo
- No había persistencia real

### ✅ Ahora con Neon PostgreSQL:
- **Persistencia total**: Los datos nunca se pierden
- **Integridad referencial**: Las categorías NO desaparecen al usarlas
- **Stock correcto**: Vender 9 de 10 productos = queda 1 en stock
- **Validación**: No permite eliminar categorías con productos
- **Transacciones**: Las ventas actualizan el stock de forma atómica
- **Escalabilidad**: Base de datos profesional en la nube
- **Backups automáticos**: Neon hace respaldos automáticos

## 📊 Modelos de la base de datos

Tu base de datos ahora tiene estas tablas:

1. **User** - Usuarios del sistema (empleados y admin)
2. **Category** - Categorías de productos con descripción
3. **Product** - Productos (con relación a categorías)
4. **Sale** - Ventas registradas
5. **SaleItem** - Detalles de productos en cada venta (con CASCADE delete)
6. **Service** - Servicios adicionales (fotocopias, etc.)
7. **Expense** - Egresos/Gastos del negocio

## 🔄 Relaciones importantes

- **Product → Category**: Un producto pertenece a una categoría
  - No se puede eliminar una categoría con productos
- **Sale → SaleItem**: Una venta tiene múltiples items
  - Al eliminar una venta, se eliminan sus items (CASCADE)
- **SaleItem → Product**: Cada item referencia un producto
  - Mantiene el precio al momento de la venta

## 🆘 Solución de problemas

### Error: "Environment variable not found: DATABASE_URL"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Asegúrate de haber pegado la URL correcta de Neon
- La URL debe estar entre comillas dobles
- Reinicia el servidor (`Ctrl+C` y luego `npm run dev`)

### Error: "Can't reach database server"
- Verifica que la URL de conexión sea correcta
- Asegúrate de tener conexión a internet
- Verifica que el proyecto en Neon esté activo
- Comprueba que no haya espacios extra en la URL

### Error: "Invalid `prisma.xxx.findMany()` invocation"
- Ejecuta: `npm run prisma:generate` nuevamente
- Reinicia VS Code
- Reinicia el servidor

### Error al inicializar: "User already exists"
- Es normal si ya ejecutaste el seed antes
- Los datos ya están en la base de datos

### Categoría se elimina al asignarla (ERROR RESUELTO)
- Ya NO sucede con Prisma
- La relación está protegida
- No se puede eliminar una categoría con productos

### Producto desaparece al vender (ERROR RESUELTO)
- Ya NO sucede con Prisma
- Solo se actualiza el stock
- El producto permanece aunque tenga stock 0

## 📝 Comandos útiles

```powershell
# Ver datos en interfaz gráfica
npm run prisma:studio

# Regenerar cliente Prisma (después de cambios en schema)
npm run prisma:generate

# Aplicar cambios del schema a la base de datos
npm run prisma:push

# Crear datos iniciales (admin + categorías)
npm run prisma:seed

# Ver el estado de la base de datos
npx prisma db pull

# Reiniciar base de datos (CUIDADO: borra todos los datos)
npx prisma db push --force-reset
```

## 🎉 ¡Todo listo!

Ahora tu sistema está conectado a una base de datos profesional en Neon PostgreSQL. 

### ✅ Checklist final:
- [ ] Base de datos creada en Neon
- [ ] URL de conexión configurada en `.env`
- [ ] Dependencias instaladas (`npm install`)
- [ ] Cliente Prisma generado (`npm run prisma:generate`)
- [ ] Tablas creadas (`npm run prisma:push`)
- [ ] Datos iniciales creados (`npm run prisma:seed`)
- [ ] Servidor funcionando (`npm run dev`)
- [ ] Login exitoso como admin
- [ ] Prueba de crear categoría y producto
- [ ] Prueba de venta (stock se actualiza correctamente)

---

**¿Necesitas ayuda?** Si tienes algún error durante la configuración, avísame y te ayudo a resolverlo.

