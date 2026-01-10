# 🚀 Guía de Deployment a Vercel

## ⚠️ IMPORTANTE - Checklist Pre-Deploy

### 1. Variables de Entorno en Vercel
Antes de hacer deploy, configura esta variable en Vercel:

**En Vercel Dashboard → Settings → Environment Variables:**
```
DATABASE_URL = postgresql://neondb_owner:npg_5SdatgI9YwxJ@ep-jolly-base-ah9uqcbp-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. Git Commands para Deploy

```bash
# 1. Verificar cambios
git status

# 2. Agregar todos los cambios
git add .

# 3. Commit con mensaje descriptivo
git commit -m "fix: Optimización para producción - eliminados duplicados y mejorado build"

# 4. Push a GitHub (Vercel detectará automáticamente el cambio)
git push origin main
```

### 3. Después del Deploy

- ✅ Vercel ejecutará automáticamente `prisma generate`
- ✅ Las migraciones ya están aplicadas en Neon
- ✅ El usuario admin ya existe en la base de datos

### 4. Verificación Post-Deploy

1. Accede a tu URL de producción
2. Inicia sesión con:
   - Email: `Mafe@admin.com`
   - Contraseña: `Luisfelipe17`
3. Verifica que:
   - Dashboard cargue correctamente
   - Productos se muestren
   - Ventas funcionen
   - Servicios funcionen

## 🛡️ Seguridad

- ✅ `.env` está en `.gitignore` (no se sube a GitHub)
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Validación de usuarios en cada API route
- ✅ Roles (admin/employee) implementados

## 📝 Cambios Aplicados en Este Parche

1. **Eliminados archivos duplicados**: `auth.ts`, `AuthContext.tsx`, `data.ts` de la raíz
2. **Optimizado script de build**: Removido `prisma db push` (no necesario en Vercel)
3. **Mejorado `.gitignore`**: Mayor seguridad para archivos `.env`
4. **Agregado `vercel.json`**: Configuración optimizada para deploy

## ⚡ Build Time Optimization

El build anterior incluía `prisma db push` que no es necesario en producción porque:
- La base de datos ya está configurada en Neon
- Las migraciones ya están aplicadas
- Solo necesitamos generar el cliente de Prisma

## 🔄 Rollback (si algo falla)

Si necesitas revertir cambios:
```bash
git log --oneline  # Ver commits
git revert HEAD    # Revertir último commit
git push origin main
```

## 📞 Soporte

Si encuentras problemas:
1. Verifica los logs en Vercel Dashboard
2. Revisa que DATABASE_URL esté correctamente configurada
3. Verifica que Neon esté accesible
