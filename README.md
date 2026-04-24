# Roundnet Chile App

Plataforma comunitaria para jugadores de Roundnet (Spikeball) en Chile. Centraliza información de torneos, rankings, perfiles de jugadores y noticias en una web app mobile-first.

## Features

- **Torneos** — Próximos, en curso e histórico con links de inscripción a Fwango
- **Ranking** — Tabla de posiciones por temporada, categorías Varones y Damas
- **Jugadores** — Directorio de jugadores con ciudad, región e Instagram
- **Noticias** — Resultados, reglamento y anuncios de la comunidad
- **Comunidad** — Estadísticas y sobre Roundnet Chile
- **Panel Admin** — Gestión de torneos, noticias y usuarios (solo admins)
- **Autenticación** — Email/contraseña y Google OAuth via Supabase

## Tech Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Auth & Base de datos | Supabase (PostgreSQL + Auth + RLS) |
| Estilos | Tailwind CSS 3 con tema personalizado |
| Iconos | Lucide React |
| Deployment | Vercel |

## Variables de entorno

Crea `.env.local` en la raíz del proyecto con las credenciales de tu proyecto Supabase (**Settings → API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

## Instalación y desarrollo local

```bash
git clone https://github.com/csauad-hub/roundnet-chile-app.git
cd roundnet-chile-app
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

> Las páginas públicas (home, torneos, ranking, noticias, jugadores, comunidad) leen datos reales de Supabase. Para desarrollar sin conexión puedes restaurar temporalmente los imports de `lib/mock-data.ts`.

## Configurar Supabase

### 1. Crear las tablas

Ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql) en el **SQL Editor** de tu dashboard de Supabase. Crea las tablas:

| Tabla | Descripción |
|---|---|
| `profiles` | Perfiles de usuario (nombre, ciudad, región, rol, visibilidad) |
| `tournaments` | Torneos con estado y links externos |
| `ranking` | Posiciones por temporada y categoría |
| `news` | Noticias y anuncios |

El schema incluye RLS (Row Level Security) y un trigger que crea automáticamente un perfil cuando alguien se registra.

### 2. Configurar Google OAuth

**En Google Cloud Console:**
1. Crear credenciales OAuth 2.0 (tipo: Aplicación web)
2. Agregar en **Authorized redirect URIs**:
   ```
   https://<tu-proyecto>.supabase.co/auth/v1/callback
   ```

**En Supabase Dashboard → Authentication → Providers → Google:**
1. Activar Google
2. Ingresar Client ID y Client Secret de Google Cloud

**En Supabase Dashboard → Authentication → URL Configuration:**
1. **Site URL** → URL de producción (ej: `https://tu-app.vercel.app`)
2. **Redirect URLs** → Agregar:
   ```
   https://tu-app.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```

### 3. Asignar rol admin

Para dar acceso al panel `/admin` a un usuario, ejecuta en el SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = '<uuid-del-usuario>';
```

El UUID se obtiene en **Authentication → Users** en el dashboard de Supabase.

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Ejecutar build de producción
npm run lint     # Verificación ESLint
```

## Estructura del proyecto

```
roundnet-chile-app/
├── app/
│   ├── admin/            # Rutas protegidas (solo admin)
│   ├── auth/             # Login, registro, callback OAuth
│   ├── perfil/           # Perfil de usuario (protegido)
│   ├── ranking/          # Tabla de posiciones
│   ├── jugadores/        # Directorio de jugadores
│   ├── torneos/          # Listado de torneos
│   ├── noticias/         # Noticias y artículos
│   ├── comunidad/        # Estadísticas y comunidad
│   └── api/me/           # API route para obtener rol del usuario
├── components/
│   └── layout/           # Topbar, BottomNav
├── lib/
│   ├── mock-data.ts      # Datos de prueba para desarrollo local
│   ├── supabase/         # Clientes Supabase (server y client)
│   └── utils.ts          # Helpers compartidos
├── supabase/
│   └── schema.sql        # Schema completo de la base de datos
├── types/                # Interfaces TypeScript
└── middleware.ts         # Protección de rutas /admin y /perfil
```

## Roles y permisos

| Rol | Acceso |
|---|---|
| **Guest** | Solo páginas públicas (sin sesión) |
| **User** | Perfil personal + páginas públicas |
| **Admin** | Todo lo anterior + panel `/admin` |

El rol se determina server-side via `/api/me` consultando la tabla `profiles`.

## Despliegue en Vercel

1. Push el repositorio a GitHub
2. Importar el proyecto en [Vercel](https://vercel.com)
3. Agregar las 3 variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
4. Desplegar

> Importante: después de obtener la URL de Vercel, agrégala en **Supabase → Authentication → URL Configuration** como Site URL y en Redirect URLs, de lo contrario el login con Google no funcionará en producción.
