# Sistema de Gestión - Papelería Variedades Mafer

Sistema completo de gestión para papelería desarrollado con Next.js, React, TypeScript y Tailwind CSS v4.0. Diseño minimalista en blanco y negro.

## � Deploy a Vercel

**Ver [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) para instrucciones completas de deployment.**

## �🚀 Características

- **Autenticación segura** con contraseñas encriptadas
- **Dashboard interactivo** con métricas en tiempo real
- **Gestión de Productos** con control de inventario y alertas de stock bajo
- **Módulo de Ventas** para registrar transacciones
- **Historial General** con filtros avanzados (ingresos/egresos, fechas)
- **Servicios Adicionales** para registrar ingresos no relacionados con inventario (fotocopias, hojas de vida, etc.)
- **Panel de Administración** para gestionar usuarios y permisos
- **Navbar funcional** con acceso rápido a todas las secciones
- **Diseño responsive** optimizado para desktop y móvil

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn

## 🛠️ Instalación

1. El proyecto ya está configurado en `C:\Users\Usuario\Desktop\VariedadesMafer`

2. Las dependencias ya están instaladas. Si necesitas reinstalarlas:
```bash
npm install
```

## 🎯 Uso

### Iniciar el servidor de desarrollo

```bash
npm run dev
```

El servidor estará disponible en [http://localhost:3000](http://localhost:3000)

### Credenciales de Acceso

**Administrador:**
- Email: `Mafe@admin.com`
- Contraseña: `Luisfelipe17`

## 📁 Estructura del Proyecto

```
VariedadesMafer/
├── app/
│   ├── page.tsx                 # Página de inicio de sesión
│   ├── dashboard/               # Dashboard principal
│   ├── productos/               # Gestión de inventario
│   ├── ventas/                  # Registro de ventas
│   ├── historial/               # Historial general con filtros
│   ├── servicios/               # Servicios adicionales
│   ├── admin/                   # Panel de administración
│   └── api/                     # Endpoints de la API
├── components/
│   └── Navbar.tsx               # Barra de navegación
├── contexts/
│   └── AuthContext.tsx          # Contexto de autenticación
├── lib/
│   ├── auth.ts                  # Lógica de autenticación
│   └── data.ts                  # Datos y funciones del sistema
└── public/                      # Archivos estáticos
```

## 🎨 Diseño

El sistema utiliza un esquema de colores **blanco y negro** exclusivamente, con:
- Fondo blanco para las páginas
- Elementos negros para botones y acentos
- Grises para bordes y elementos secundarios
- Sin colores adicionales en la interfaz principal

## 📊 Módulos

### 1. Dashboard
- Métricas principales del negocio
- Productos con stock bajo
- Productos más vendidos
- Alertas y notificaciones

### 2. Productos
- Listado completo del inventario
- Búsqueda y filtros
- Agregar/editar productos
- Control de stock y stock mínimo

### 3. Ventas
- Registro de ventas de productos
- Historial de transacciones
- Estado de ventas (completada/pendiente)

### 4. Historial General
- Vista unificada de todas las transacciones
- Filtros por tipo (ingresos/egresos)
- Filtros por rango de fechas
- Resumen financiero con balance

### 5. Servicios Adicionales
- Registro de fotocopias
- Servicios de arreglo de hojas de vida
- Ventas externas no registradas en inventario
- Otros servicios ocasionales

### 6. Panel de Administración
- Gestión de usuarios trabajadores
- Asignación de permisos granulares
- Control de acceso por módulo
- Solo accesible para administradores

## 🔒 Seguridad

- Contraseñas encriptadas con bcryptjs
- Validación de permisos por rol
- Protección de rutas administrativas
- Sesiones almacenadas de forma segura

## 🛣️ Rutas

- `/` - Inicio de sesión
- `/dashboard` - Dashboard principal
- `/productos` - Gestión de productos
- `/ventas` - Gestión de ventas
- `/historial` - Historial general
- `/servicios` - Servicios adicionales
- `/admin` - Panel de administración (solo admin)

## 🔧 Tecnologías

- **Next.js 16** - Framework React
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS v4.0** - Estilos
- **bcryptjs** - Encriptación de contraseñas
- **lucide-react** - Iconos
- **date-fns** - Manejo de fechas

## 📝 Notas

- Los módulos de "Clientes" y "Proveedores" fueron eliminados según requerimientos
- El historial incluye un signo (+/-) para identificar ingresos y egresos
- Los servicios adicionales permiten registrar ingresos fuera del inventario
- El sistema es completamente funcional y listo para producción

## 🚀 Compilación para Producción

```bash
npm run build
npm start
```

## 👥 Autor

Sistema desarrollado para Variedades Mafer

## 📄 Licencia

Proyecto privado - Todos los derechos reservados
