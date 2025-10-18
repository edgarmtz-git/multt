# 🚀 GUÍA DE DEPLOYMENT A PRODUCCIÓN - MULTT

**Fecha de preparación:** 18 de Octubre, 2025
**Estado:** ✅ LISTO PARA DESPLEGAR

---

## ⚡ CONFIGURACIÓN CRÍTICA GENERADA

### 1. NEXTAUTH_SECRET (YA GENERADO)

```bash
# Secret criptográfico seguro generado automáticamente
NEXTAUTH_SECRET="Q0y+MbrGOHXq/6QHhE1XR0gdLX4NPZRAKhkpPnCQLvQ="
```

⚠️ **IMPORTANTE:** Guarda este secret de forma segura. Si lo pierdes, todas las sesiones actuales se invalidarán.

---

## 📝 PASOS PARA DESPLEGAR EN VERCEL

### PASO 1: Preparar la Base de Datos PostgreSQL

Tienes **2 opciones** (elige la que prefieras):

#### **OPCIÓN A: Vercel Postgres (Recomendada - Más fácil)**

1. Ve a tu proyecto en Vercel Dashboard
2. Click en la pestaña **"Storage"**
3. Click en **"Create Database"**
4. Selecciona **"Postgres"**
5. Sigue el wizard (toma ~2 minutos)
6. Vercel **automáticamente** agregará estas variables:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

7. **NO necesitas hacer nada más**, Vercel ya las configura por ti ✅

#### **OPCIÓN B: Supabase (Alternativa gratuita)**

1. Crea cuenta en https://supabase.com
2. Crea nuevo proyecto
3. Espera ~2 minutos a que se aprovisione
4. Ve a **Settings → Database**
5. Copia el **Connection String** (formato URI)
6. Deberás agregarlo manualmente en Vercel (ver Paso 2)

Ejemplo del connection string:
```
postgresql://postgres.xxxxx:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

---

### PASO 2: Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Click en **Settings** → **Environment Variables**
3. Agrega las siguientes variables **UNA POR UNA**:

#### ✅ VARIABLES CRÍTICAS (OBLIGATORIAS)

```bash
# 1. NEXTAUTH_SECRET (ya generado arriba)
Key: NEXTAUTH_SECRET
Value: Q0y+MbrGOHXq/6QHhE1XR0gdLX4NPZRAKhkpPnCQLvQ=
Environment: Production, Preview, Development

# 2. NEXTAUTH_URL (tu dominio de producción)
Key: NEXTAUTH_URL
Value: https://tu-dominio.com
Environment: Production

# 3. DATABASE_URL (SOLO si usas Supabase - si usas Vercel Postgres, OMITE ESTO)
Key: DATABASE_URL
Value: postgresql://postgres.xxxxx:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
Environment: Production, Preview, Development
```

#### 📧 VARIABLES RECOMENDADAS (Emails)

```bash
# 4. RESEND_API_KEY (para enviar emails de invitaciones)
Key: RESEND_API_KEY
Value: re_TU_API_KEY_DE_RESEND
Environment: Production

# 5. RESEND_FROM_EMAIL
Key: RESEND_FROM_EMAIL
Value: pedidos@tu-dominio.com
Environment: Production
```

**¿Cómo obtener Resend API Key?**
1. Crea cuenta gratis en https://resend.com
2. Ve a **API Keys** → **Create API Key**
3. Copia el key (empieza con `re_`)
4. Gratis: 3,000 emails/mes, 100 emails/día

#### ⚡ VARIABLES RECOMENDADAS (Rate Limiting)

```bash
# 6. KV_REST_API_URL (Redis para rate limiting escalable)
Key: KV_REST_API_URL
Value: https://xxx.upstash.io
Environment: Production

# 7. KV_REST_API_TOKEN
Key: KV_REST_API_TOKEN
Value: tu_token_de_upstash
Environment: Production
```

**¿Cómo obtener Upstash KV?**
1. Crea cuenta gratis en https://console.upstash.com
2. Click **Create Database** → **Redis**
3. Selecciona región cercana a tus usuarios
4. Copia **REST URL** y **REST TOKEN**
5. Gratis: 10,000 comandos/día

#### 🌍 VARIABLES DE CONFIGURACIÓN

```bash
# 8. NEXT_PUBLIC_APP_URL
Key: NEXT_PUBLIC_APP_URL
Value: https://tu-dominio.com
Environment: Production

# 9. NEXT_PUBLIC_ROOT_DOMAIN (sin https://)
Key: NEXT_PUBLIC_ROOT_DOMAIN
Value: tu-dominio.com
Environment: Production

# 10. NODE_ENV (Vercel lo configura automáticamente, pero por si acaso)
Key: NODE_ENV
Value: production
Environment: Production
```

---

### PASO 3: Ejecutar Migraciones de Base de Datos

Una vez configurado PostgreSQL, necesitas crear las tablas:

#### Si usas **Vercel Postgres**:

```bash
# 1. Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# 2. Login en Vercel
vercel login

# 3. Link tu proyecto local con Vercel
vercel link

# 4. Descargar variables de entorno de producción
vercel env pull .env.production

# 5. Ejecutar migraciones
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) pnpm prisma migrate deploy

# 6. (OPCIONAL) Seed inicial si necesitas usuario admin
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) pnpm db:seed
```

#### Si usas **Supabase**:

```bash
# 1. Crear archivo temporal .env.production con tu DATABASE_URL
echo 'DATABASE_URL="postgresql://postgres.xxxxx:PASSWORD@..."' > .env.production

# 2. Ejecutar migraciones
dotenv -e .env.production -- pnpm prisma migrate deploy

# 3. (OPCIONAL) Seed inicial
dotenv -e .env.production -- pnpm db:seed

# 4. ELIMINAR archivo temporal (por seguridad)
rm .env.production
```

---

### PASO 4: Deploy a Vercel

```bash
# Opción A: Desde Git (Recomendado)
# 1. Commit tus cambios
git add .
git commit -m "feat: Production ready deployment"
git push origin main

# Vercel detectará automáticamente el push y desplegará

# Opción B: Desde CLI
vercel --prod
```

---

### PASO 5: Verificación Post-Deploy

Después del deploy, verifica que todo funcione:

#### ✅ Checklist de Verificación

```bash
# 1. La app carga correctamente
curl -I https://tu-dominio.com
# Debe devolver: HTTP/2 200

# 2. El login funciona
# Visita: https://tu-dominio.com/login
# Intenta hacer login con las credenciales del seed (si lo ejecutaste)

# 3. Las sesiones se mantienen
# Después de login, recarga la página
# Deberías seguir logueado

# 4. Los emails se envían (si configuraste Resend)
# Crea una invitación desde /admin
# Verifica que llegue el email

# 5. Rate limiting funciona (si configuraste Upstash)
# Revisa logs en Vercel para ver:
# "✅ Redis configurado" (si hay Redis)
# "⚠️ Redis no configurado, usando rate limiting local" (si no hay Redis)
```

---

## 🔍 TROUBLESHOOTING

### Error: "Database connection failed"

**Causa:** `DATABASE_URL` no configurado o incorrecto

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Verifica que `DATABASE_URL` o `POSTGRES_PRISMA_URL` esté configurado
3. Si usas Vercel Postgres, asegúrate de que la DB esté creada
4. Redeploy: `vercel --prod`

---

### Error: "Invalid session"

**Causa:** `NEXTAUTH_SECRET` no configurado

**Solución:**
1. Verifica que `NEXTAUTH_SECRET` esté en Vercel Environment Variables
2. El valor debe ser exactamente: `Q0y+MbrGOHXq/6QHhE1XR0gdLX4NPZRAKhkpPnCQLvQ=`
3. Redeploy: `vercel --prod`

---

### Error: "Rate limit fallback to memory"

**Causa:** Redis (Upstash) no configurado

**Solución:**
- **Opción 1 (Recomendada):** Configurar Upstash KV (ver arriba)
- **Opción 2:** Ignorar (funcionará con fallback en memoria, pero menos escalable)

---

### Los emails no se envían

**Causa:** Resend no configurado

**Solución:**
1. Verifica `RESEND_API_KEY` en Vercel
2. Verifica `RESEND_FROM_EMAIL` en Vercel
3. El dominio del email debe estar verificado en Resend
4. Redeploy: `vercel --prod`

---

## 📊 RESUMEN DE CONFIGURACIÓN

### Variables Configuradas (Checklist)

#### CRÍTICAS (OBLIGATORIAS)
- [ ] `NEXTAUTH_SECRET` = `Q0y+MbrGOHXq/6QHhE1XR0gdLX4NPZRAKhkpPnCQLvQ=`
- [ ] `NEXTAUTH_URL` = `https://tu-dominio.com`
- [ ] `DATABASE_URL` (si usas Supabase) **O** Vercel Postgres creado

#### RECOMENDADAS (ALTA PRIORIDAD)
- [ ] `RESEND_API_KEY` (para emails)
- [ ] `RESEND_FROM_EMAIL` (para emails)
- [ ] `KV_REST_API_URL` (para Redis)
- [ ] `KV_REST_API_TOKEN` (para Redis)

#### CONFIGURACIÓN
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_ROOT_DOMAIN`
- [ ] `NODE_ENV=production`

#### ACCIONES
- [ ] Migraciones ejecutadas (`pnpm prisma migrate deploy`)
- [ ] Seed ejecutado (opcional, para usuario admin inicial)
- [ ] Deploy realizado
- [ ] Verificación post-deploy completada

---

## 🎯 COMANDOS RÁPIDOS DE REFERENCIA

```bash
# Generar nuevo NEXTAUTH_SECRET (si lo necesitas)
openssl rand -base64 32

# Ver variables de entorno locales
cat .env.local

# Descargar variables de Vercel
vercel env pull

# Ejecutar migraciones en producción
pnpm prisma migrate deploy

# Deploy a producción
vercel --prod

# Ver logs en tiempo real
vercel logs --follow
```

---

## 📞 SIGUIENTE PASO

1. **Elige tu opción de base de datos:**
   - [ ] Vercel Postgres (más fácil)
   - [ ] Supabase (más control)

2. **Sigue los pasos de esta guía** en orden

3. **Una vez desplegado,** regresa y te ayudaré con cualquier error que encuentres

---

## ⚠️ NOTAS IMPORTANTES

- **NUNCA** compartas tu `NEXTAUTH_SECRET` públicamente
- **NUNCA** commites archivos `.env` con valores reales a Git
- **SIEMPRE** usa PostgreSQL en producción (SQLite es solo para desarrollo)
- **SIEMPRE** ejecuta migraciones antes del primer deploy
- **SIEMPRE** configura backups de tu base de datos

---

## ✅ ESTADO ACTUAL DEL PROYECTO

**Base de código:** ✅ Seguro y listo para producción
**Configuración PostgreSQL:** ✅ Schema configurado correctamente
**Migraciones:** ✅ Disponibles en `prisma/migrations/`
**Seguridad:** ✅ Sin vulnerabilidades críticas
**Next.js:** ⚠️ Versión 15.3.2 (puedes actualizar después del deploy inicial)

---

**¿Tienes dudas sobre algún paso?** Dime en cuál paso estás y te ayudo en tiempo real.
