# Sección Perfil — Arquitectura y Guía de Cambios

## Archivos de esta sección

```
app/perfil/
├── page.tsx              ← Server Component (carga datos, renderiza vista)
├── PlayerProfileForm.tsx ← Client Component (formulario editable)
└── README.md             ← Este archivo

app/api/profile/
└── route.ts              ← API Route PATCH (persiste cambios en Supabase)
```

---

## Tabla en Supabase: `profiles`

```sql
CREATE TABLE public.profiles (
  id                   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username             text,
  full_name            text,
  nickname             text,        -- apodo opcional; tiene prioridad sobre full_name para mostrar al usuario
  avatar_url           text,
  city                 text,
  region               text,
  instagram            text,        -- sin @
  phone                text,        -- formato libre, ej: +56 9 1234 5678
  role                 text DEFAULT 'user',   -- 'user' | 'admin'
  visible_in_directory boolean DEFAULT false,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);
```

> **Migración para bases de datos existentes** — ejecutar una sola vez en Supabase SQL Editor:
> ```sql
> ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname text;
> ```

**Creación automática:** El trigger `handle_new_user()` crea una fila en `profiles` cada vez que un usuario nuevo se registra en `auth.users`, poblando `full_name` y `avatar_url` desde `raw_user_meta_data` (útil para OAuth con Google).

### Row Level Security (RLS)

| Policy | Acción | Regla |
|--------|--------|-------|
| `profiles_select_all` | SELECT | Lectura pública |
| `profiles_update_own` | UPDATE | Solo el propietario (`auth.uid() = id`) |
| `profiles_insert_own` | INSERT | Solo puede crear su propio perfil |

> El API route bypasea RLS usando el `adminClient` con `SERVICE_ROLE_KEY`. Nunca exponer esta clave al cliente.

---

## Flujo de datos

### 1. Carga del perfil (Server-side)

```
[Navegador] GET /perfil
    ↓
middleware.ts → verifica sesión
    ↓ (sin sesión → redirect /auth?next=/perfil)
app/perfil/page.tsx  [Server Component]
    ↓
createClient()           ← lib/supabase/server.ts  (anon key + cookies)
supabase.auth.getUser()  ← obtiene usuario autenticado
    ↓ (sin usuario → redirect '/auth?next=/perfil')
createAdminClient()      ← lib/supabase/admin.ts  (service role, bypasea RLS)
admin.from('profiles').select('*').eq('id', user.id).single()
    ↓
Renderiza vista read-only (avatar, email, rol, fecha de membresía)
    + pasa props a <PlayerProfileForm profile={...} />
```

### 2. Guardar cambios (Client → API → DB)

```
[Usuario] edita campos → hace click en "Guardar cambios"
    ↓
PlayerProfileForm.tsx  [Client Component]
handleSave()
    ↓
fetch('PATCH /api/profile', body: { full_name, city, region, instagram, phone, visible_in_directory })
    ↓
app/api/profile/route.ts
    ↓
createServerClient()     ← verifica sesión por cookies (anon key)
supabase.auth.getUser()  ← (sin sesión → 401)
    ↓
createAdminClient()
admin.from('profiles').update({...}).eq('id', user.id)
    ↓ (si updateError → 500)
admin.from('profiles').select('id, full_name, visible_in_directory').eq('id', user.id).single()
    ↓ (si no existe fila → INSERT como fallback)
Retorna { ok: true, saved: { id, full_name, visible_in_directory } }
    ↓
PlayerProfileForm sincroniza estado con datos reales de DB
Muestra "¡Guardado ✓" por 3 segundos
```

---

## Clientes Supabase utilizados

| Cliente | Archivo | Key usada | Dónde se usa | RLS |
|---------|---------|-----------|-------------|-----|
| `createClient()` | `lib/supabase/server.ts` | `ANON_KEY` + cookies | Server Components, getUser() | Activo |
| `createBrowserClient()` | `lib/supabase/client.ts` | `ANON_KEY` | Client Components | Activo |
| `createAdminClient()` | `lib/supabase/admin.ts` | `SERVICE_ROLE_KEY` | Server Components, API Routes | **Bypaseado** |

**Regla de oro:** `createAdminClient()` solo se importa en archivos server-side (`page.tsx` de servidor, `route.ts`). Nunca en archivos con `'use client'`.

---

## Props de `PlayerProfileForm`

```typescript
type Props = {
  profile: {
    id: string
    full_name: string | null
    nickname: string | null     -- apodo opcional; prioridad sobre full_name en toda la app
    city: string | null
    region: string | null       // debe ser una de las 16 regiones de REGIONS[]
    instagram: string | null    // sin @
    phone: string | null
    visible_in_directory: boolean
  }
}
```

Campos que el usuario puede editar: `nickname`, `full_name`, `city`, `region`, `instagram`, `phone`, `visible_in_directory`.

Campos solo de lectura (mostrados en `page.tsx`): `email`, `role`, `created_at` (fecha de membresía), `avatar_url`.

---

## Lógica de nombre de visualización

En toda la app el nombre se resuelve con esta prioridad:

```
nickname || full_name || fallback
```

| Contexto | Fallback |
|----------|---------|
| Header del perfil (`page.tsx`) | `email.split('@')[0]` → `'Usuario'` |
| Posts y comentarios del foro (`BlogFeed.tsx`) | `'Jugador'` |
| Panel de moderación admin | `'Usuario'` |

## Validaciones y transformaciones

| Campo | Transformación |
|-------|---------------|
| `instagram` | `.replace('@', '')` — tanto en el form al escribir como en el API route al guardar |
| `nickname` | Texto libre, se guarda como `null` si está vacío |
| Campos de texto vacíos | Se envían como `null` (no string vacío) |
| `visible_in_directory` | Forzado a `boolean`: `body.visible_in_directory === true` |
| `updated_at` | Seteado a `new Date().toISOString()` en cada PATCH |

---

## Conexión con otras secciones

### Directorio de Jugadores (`/jugadores`)

```typescript
// app/jugadores/page.tsx
admin.from('profiles')
  .select('id, full_name, avatar_url, city, region, instagram, phone')
  .eq('visible_in_directory', true)
  .order('full_name', { ascending: true, nullsFirst: false })
```

El campo `visible_in_directory` en el perfil controla directamente si un usuario aparece en esta página.

### Detalle de Jugador (`/jugadores/[id]`)

```typescript
// app/jugadores/[id]/page.tsx
admin.from('profiles')
  .select('id, full_name, avatar_url, city, region, instagram, phone, visible_in_directory')
  .eq('id', playerId)
  .eq('visible_in_directory', true)
  .single()
```

Solo accesible si el usuario activó su visibilidad en el perfil.

### Topbar (`/components/layout/Topbar.tsx`)

Hace `GET /api/me` para obtener `{ role }` y mostrar acciones de admin. Lee de `profiles.role`.

---

## Variables de entorno requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=https://<proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>   ← nunca exponer al cliente
```

---

## Regiones disponibles (constante `REGIONS` en `PlayerProfileForm.tsx`)

```
Arica y Parinacota, Tarapacá, Antofagasta, Atacama, Coquimbo,
Valparaíso, Metropolitana, O'Higgins, Maule, Ñuble,
Biobío, Araucanía, Los Ríos, Los Lagos, Aysén, Magallanes
```

Si se agrega una región, actualizar el array `REGIONS` en [PlayerProfileForm.tsx](./PlayerProfileForm.tsx).

---

## Guía para hacer cambios

### Agregar un campo nuevo al perfil

1. **Supabase:** Agregar columna en la tabla `profiles` via migración SQL. Actualizar también `supabase/schema.sql`.
2. **`page.tsx`:** El `select('*')` ya lo traerá; pasar el nuevo campo como prop a `<PlayerProfileForm>`.
3. **`PlayerProfileForm.tsx`:** Agregar al type `Props`, al estado inicial `form`, al JSX del formulario, y al body del `fetch` en `handleSave()`.
4. **`route.ts`:** Agregar el campo al objeto del `.update({...})` y al `.insert({...})` del fallback.
5. Si debe mostrarse en `/jugadores`, actualizar el `.select()` en `app/jugadores/page.tsx` y/o `app/jugadores/[id]/page.tsx`.

### Cambiar cómo se muestra el nombre de un usuario

La lógica `nickname || full_name || fallback` está en tres lugares:
- `app/perfil/page.tsx` → línea del `displayName`
- `app/comunidad/BlogFeed.tsx` → variables `authorName` y `cName`
- `app/admin/comunidad/page.tsx` → construcción del `authorMap`

### Cambiar la lógica de guardado

Solo modificar `app/api/profile/route.ts`. No tocar `PlayerProfileForm.tsx` salvo que cambie la UI o los campos enviados.

### Cambiar la vista read-only (avatar, email, rol)

Solo modificar `app/perfil/page.tsx`. Es un Server Component, los cambios ahí no afectan el formulario.

### Agregar validación server-side

Agregar antes del `.update()` en `route.ts`. El cliente muestra `data.error` si la respuesta no es `ok`.

### Cambiar quién puede ser admin

El campo `profiles.role` se gestiona directamente en Supabase (no hay UI para ello en la app). Cambiar el valor a `'admin'` manualmente en el dashboard de Supabase o via script con el `SERVICE_ROLE_KEY`.

---

## Estados del botón "Guardar cambios"

| Estado | `saving` | `saved` | Visual |
|--------|----------|---------|--------|
| Normal | `false` | `false` | Azul — "Guardar cambios" |
| Guardando | `true` | `false` | Azul opaco — "Guardando..." (disabled) |
| Éxito | `false` | `true` | Verde — "¡Guardado ✓" (3 segundos) |
| Error | `false` | `false` | Botón normal + mensaje rojo arriba |
