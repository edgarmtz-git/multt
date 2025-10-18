# ⚡ QUICK DEPLOY - Solo lo Esencial

## 🔑 TU NEXTAUTH_SECRET GENERADO

```bash
NEXTAUTH_SECRET="Q0y+MbrGOHXq/6QHhE1XR0gdLX4NPZRAKhkpPnCQLvQ="
```

**⚠️ Guárdalo en un lugar seguro. Lo necesitarás para Vercel.**

---

## 🚀 3 PASOS PARA DESPLEGAR

### 1️⃣ Crear Base de Datos en Vercel

1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Click en **"Storage"** → **"Create Database"**
4. Elige **"Postgres"**
5. Click **"Create"**
6. ✅ **Listo** - Vercel configura automáticamente `DATABASE_URL`

### 2️⃣ Agregar Variables de Entorno

Ve a **Settings** → **Environment Variables** y agrega:

```bash
# OBLIGATORIO
NEXTAUTH_SECRET = Q0y+MbrGOHXq/6QHhE1XR0gdLX4NPZRAKhkpPnCQLvQ=
NEXTAUTH_URL = https://tu-dominio.vercel.app
```

Selecciona: **Production, Preview, Development**

### 3️⃣ Ejecutar Migraciones

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Link proyecto
vercel link

# Descargar env vars
vercel env pull

# Ejecutar migraciones
pnpm prisma migrate deploy

# (OPCIONAL) Crear usuario admin inicial
pnpm db:seed
```

### 4️⃣ Deploy

```bash
git add .
git commit -m "feat: Ready for production"
git push origin main
```

**Vercel desplegará automáticamente** ✅

---

## 🧪 Verificar ANTES de Desplegar

```bash
# Verificar configuración local
pnpm verify:production
```

Este comando te dirá si falta algo crítico.

---

## ✅ Después del Deploy

Verifica que funcione:

1. Visita `https://tu-dominio.vercel.app`
2. Click en **Login**
3. Intenta hacer login con:
   - Email: `admin@sistema.com`
   - Password: `admin123`
4. Deberías ver el panel de admin ✅

---

## 🆘 Si Algo Falla

**Error "Database connection failed":**
```bash
# Verifica que Postgres esté creado en Vercel Storage
# Ve a: Vercel Dashboard → Storage → Postgres
```

**Error "Invalid session":**
```bash
# Verifica NEXTAUTH_SECRET en Vercel Environment Variables
# Debe ser: Q0y+MbrGOHXq/6QHhE1XR0gdLX4NPZRAKhkpPnCQLvQ=
```

**Error en migraciones:**
```bash
# Asegúrate de haber descargado las env vars primero
vercel env pull

# Luego ejecuta de nuevo
pnpm prisma migrate deploy
```

---

## 📚 Documentación Completa

- [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) - Guía paso a paso detallada
- [.env.example](./.env.example) - Todas las variables disponibles
- [CLAUDE.md](./CLAUDE.md) - Arquitectura del sistema

---

**Tiempo estimado:** 15-20 minutos

**¿Dudas?** Lee [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) para más detalles.
