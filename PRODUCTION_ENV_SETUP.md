# Variables de Entorno de Producción - Guía de Seguridad

## 🎯 Por qué es crítico

Las variables de entorno actuales son inseguras para producción porque:

- 🔒 **NEXTAUTH_SECRET** es demasiado simple
- 🌐 **URLs** apuntan a localhost
- 🔑 **API keys** están expuestas o faltantes
- 🚨 **Sin separación** entre dev/staging/production

---

## 📋 Estrategia de Variables de Entorno

### **Estructura recomendada:**

```
.env.local          → Desarrollo local (Git ignored)
.env.example        → Template público (Git committed)
.env.production     → NO CREAR (usar Vercel UI)
.env.staging        → NO CREAR (usar Vercel UI)
```

---

## 🔐 Variables de Entorno Completas

### **Paso 1: Actualizar .env.example**

```bash
# ==============================================
# DATABASE
# ==============================================

# Development (SQLite - solo local)
# DATABASE_URL="file:./dev.db"

# Production (PostgreSQL - requerido)
# Vercel Postgres: Auto-configurado desde dashboard
# Supabase: postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
# Railway: postgresql://user:pass@containers-us-west-xxx.railway.app:5432/railway
# Neon: postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb
DATABASE_URL="postgresql://user:password@localhost:5432/multt"

# Connection pooling (para serverless - recomendado)
# DIRECT_URL se usa para migraciones
DIRECT_URL="postgresql://user:password@localhost:5432/multt"

# ==============================================
# NEXTAUTH
# ==============================================

# Secret para firmar JWT (generar con: openssl rand -base64 32)
NEXTAUTH_SECRET="your-super-secret-key-change-in-production"

# URL de la aplicación
NEXTAUTH_URL="http://localhost:3000"

# En producción:
# NEXTAUTH_URL="https://tudominio.com"

# ==============================================
# APP CONFIGURATION
# ==============================================

# URL pública de la app
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Nombre de la app (visible en UI)
NEXT_PUBLIC_APP_NAME="Multt"

# Dominio raíz para multi-tenant
# Desarrollo: localhost:3000
# Producción: tudominio.com
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"

# Environment
NODE_ENV="development"

# ==============================================
# COMPANY INFO
# ==============================================

ADMIN_EMAIL="admin@tuempresa.com"
SUPPORT_EMAIL="soporte@tuempresa.com"
COMPANY_NAME="TuEmpresa"
DEFAULT_SUSPENSION_REASON="Pago pendiente - renovación vencida"

# ==============================================
# EMAIL SERVICE (Resend)
# ==============================================

# API Key de Resend (obtener en: https://resend.com/api-keys)
RESEND_API_KEY="re_123456789"

# Email "from" por defecto
RESEND_FROM_EMAIL="pedidos@tudominio.com"

# ==============================================
# FILE STORAGE (Vercel Blob)
# ==============================================

# Token de Vercel Blob (auto-configurado en Vercel)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# ==============================================
# MAPS & GEOLOCATION
# ==============================================

# Google Maps API Key (opcional - fallback a OpenStreetMap)
GOOGLE_MAPS_API_KEY="AIza..."

# Mapbox API Key (alternativa a Google Maps)
# MAPBOX_ACCESS_TOKEN="pk.ey..."

# ==============================================
# PAYMENT PROVIDERS (Futuro)
# ==============================================

# Stripe
# STRIPE_SECRET_KEY="sk_test_..."
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# MercadoPago
# MERCADOPAGO_ACCESS_TOKEN="APP_USR-..."
# NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY="APP_USR-..."

# ==============================================
# MONITORING & ANALYTICS
# ==============================================

# Vercel Analytics (auto-configurado)
# NEXT_PUBLIC_VERCEL_ANALYTICS_ID="..."

# Sentry (error tracking)
# SENTRY_DSN="https://...@sentry.io/..."
# NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."

# Google Analytics
# NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."

# ==============================================
# RATE LIMITING (Upstash Redis)
# ==============================================

# Upstash Redis URL (para rate limiting en producción)
# UPSTASH_REDIS_REST_URL="https://..."
# UPSTASH_REDIS_REST_TOKEN="..."

# ==============================================
# FEATURE FLAGS
# ==============================================

# Habilitar features en desarrollo
NEXT_PUBLIC_ENABLE_PWA="true"
NEXT_PUBLIC_ENABLE_ANALYTICS="false"

# ==============================================
# SECURITY
# ==============================================

# Deshabilitar telemetría de Next.js
NEXT_TELEMETRY_DISABLED=1

# Allowed origins para CORS
ALLOWED_ORIGINS="http://localhost:3000,https://tudominio.com"
```

### **Paso 2: Generar secretos seguros**

```bash
# 1. Generar NEXTAUTH_SECRET
openssl rand -base64 32

# Output ejemplo:
# Kx7j9mP2nQ8rL5tY1vW3zA6bC4dE0fG8H

# 2. Generar API keys internas (si necesitas)
openssl rand -hex 32

# 3. Generar hash para passwords
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### **Paso 3: Configurar en Vercel (Producción)**

#### **Via Dashboard:**

1. Ir a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agregar cada variable:

```bash
# Production environment
DATABASE_URL = [PostgreSQL URL de Vercel Postgres]
NEXTAUTH_SECRET = [Generar nuevo con openssl]
NEXTAUTH_URL = https://tudominio.com
NEXT_PUBLIC_APP_URL = https://tudominio.com
NEXT_PUBLIC_ROOT_DOMAIN = tudominio.com
RESEND_API_KEY = [Tu API key de Resend]
BLOB_READ_WRITE_TOKEN = [Auto-configurado por Vercel Blob]
```

#### **Via CLI (alternativa):**

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Agregar variables
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
vercel env add RESEND_API_KEY

# Listar variables
vercel env ls

# Pull variables a local (para testing)
vercel env pull .env.local
```

### **Paso 4: Configurar por Environment**

Vercel permite diferentes valores por environment:

```bash
# Development (Vercel Preview)
DATABASE_URL = [PostgreSQL development]
NEXTAUTH_URL = https://proyecto-git-dev-username.vercel.app

# Preview (Git branches)
DATABASE_URL = [PostgreSQL staging]
NEXTAUTH_URL = https://proyecto-git-feature-username.vercel.app

# Production (main branch)
DATABASE_URL = [PostgreSQL production]
NEXTAUTH_URL = https://tudominio.com
```

---

## 🔒 Mejores Prácticas de Seguridad

### **1. NEVER commit secrets**

```bash
# .gitignore (verificar que incluye):
.env
.env.local
.env.*.local
.env.production
.env.staging
```

### **2. Validar variables en runtime**

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_ROOT_DOMAIN: z.string(),

  // Email
  RESEND_API_KEY: z.string().startsWith('re_'),

  // Storage
  BLOB_READ_WRITE_TOKEN: z.string().optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);

// Uso:
import { env } from '@/lib/env';
console.log(env.NEXTAUTH_SECRET); // Type-safe y validado
```

### **3. Rotar secretos regularmente**

```bash
# Cada 90 días:
# 1. Generar nuevo NEXTAUTH_SECRET
openssl rand -base64 32

# 2. Actualizar en Vercel
vercel env rm NEXTAUTH_SECRET production
vercel env add NEXTAUTH_SECRET production

# 3. Re-deploy
vercel --prod
```

### **4. Usar diferentes secrets por environment**

```bash
# Development
NEXTAUTH_SECRET_DEV="..."

# Production
NEXTAUTH_SECRET_PROD="..."

# En código:
const secret = process.env.NODE_ENV === 'production'
  ? process.env.NEXTAUTH_SECRET_PROD
  : process.env.NEXTAUTH_SECRET_DEV;
```

---

## 🚨 Checklist de Seguridad

### **Pre-producción:**

- [ ] ✅ Generar NEXTAUTH_SECRET único y seguro (32+ chars)
- [ ] ✅ Configurar DATABASE_URL de PostgreSQL
- [ ] ✅ Configurar RESEND_API_KEY
- [ ] ✅ Configurar BLOB_READ_WRITE_TOKEN
- [ ] ✅ Actualizar NEXTAUTH_URL a dominio de producción
- [ ] ✅ Actualizar NEXT_PUBLIC_APP_URL
- [ ] ✅ Actualizar NEXT_PUBLIC_ROOT_DOMAIN
- [ ] ✅ Verificar que .env.local está en .gitignore
- [ ] ✅ Eliminar console.logs con información sensible
- [ ] ✅ Configurar CORS con dominios permitidos
- [ ] ✅ Habilitar HTTPS only
- [ ] ✅ Configurar CSP headers

### **Post-deploy:**

- [ ] ✅ Verificar que env vars están configuradas en Vercel
- [ ] ✅ Testing de autenticación en producción
- [ ] ✅ Verificar emails se envían correctamente
- [ ] ✅ Testing de uploads de imágenes
- [ ] ✅ Verificar conexión a base de datos
- [ ] ✅ Monitorear logs por errores de env vars

---

## 🔍 Debugging de Variables

### **Verificar que variables están cargadas:**

```typescript
// app/api/debug/env/route.ts (SOLO EN DEV)
import { NextResponse } from 'next/server';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
  }

  // Mostrar variables (sin valores sensibles)
  const envCheck = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    BLOB_READ_WRITE_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json(envCheck);
}
```

### **En consola del navegador (solo públicas):**

```javascript
// Variables NEXT_PUBLIC_ son accesibles en cliente
console.log({
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN,
});
```

---

## 🌍 Multi-Environment Setup

### **Setup para 3 ambientes:**

```bash
# 1. Development (local)
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"

# 2. Staging (Vercel Preview)
DATABASE_URL="postgresql://staging..."
NEXTAUTH_URL="https://staging.tudominio.com"

# 3. Production (Vercel Production)
DATABASE_URL="postgresql://production..."
NEXTAUTH_URL="https://tudominio.com"
```

### **Branch strategy:**

```bash
main → Production (tudominio.com)
staging → Staging (staging.tudominio.com)
dev → Development (dev.tudominio.com)
feature/* → Preview (feature-xxx.vercel.app)
```

---

## 📊 Variables por Servicio

### **Vercel Postgres (auto-configuradas):**

Al crear Vercel Postgres, estas variables se agregan automáticamente:

```bash
POSTGRES_URL="postgres://default:..."
POSTGRES_PRISMA_URL="postgres://default:...?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://default:..."
```

Usar en Prisma:

```bash
# Para queries normales (con pooling)
DATABASE_URL=$POSTGRES_PRISMA_URL

# Para migraciones (directa sin pooling)
DIRECT_URL=$POSTGRES_URL_NON_POOLING
```

### **Vercel Blob (auto-configurado):**

```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

### **Resend (manual):**

```bash
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="pedidos@tudominio.com"
```

---

## ✅ Script de Verificación

```bash
#!/bin/bash
# scripts/check-env.sh

echo "🔍 Verificando variables de entorno..."

# Check required vars
required_vars=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
  "NEXT_PUBLIC_APP_URL"
)

missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  else
    echo "✅ $var está configurada"
  fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
  echo ""
  echo "✨ Todas las variables requeridas están configuradas"
  exit 0
else
  echo ""
  echo "❌ Variables faltantes:"
  printf '%s\n' "${missing_vars[@]}"
  exit 1
fi
```

Ejecutar:

```bash
chmod +x scripts/check-env.sh
./scripts/check-env.sh
```

---

## 🎯 Resumen de Acción

1. **Actualizar `.env.example`** con todas las variables ✅
2. **Generar secrets seguros** con openssl ✅
3. **Configurar en Vercel** todas las env vars ✅
4. **Validar en runtime** con zod ✅
5. **Testing** en staging antes de production ✅
6. **Monitorear** errores relacionados con env vars ✅

---

## 🚀 PROYECTO LISTO PARA PRODUCCIÓN

Con estos 4 bloqueadores resueltos, tu proyecto está listo para deploy:

1. ✅ **PostgreSQL** - Base de datos escalable
2. ✅ **CDN Imágenes** - Vercel Blob configurado
3. ✅ **Sistema de Emails** - Resend implementado
4. ✅ **Env Vars Seguras** - Todas configuradas

**Próximos pasos opcionales:**
- Monitoring (Sentry)
- Analytics avanzado
- Testing automatizado
- CI/CD pipeline
