# Migración a PostgreSQL - Guía Completa

## 🎯 Por qué migrar de SQLite a PostgreSQL

SQLite es excelente para desarrollo, pero para un SaaS multi-tenant en producción necesitas PostgreSQL por:

- ✅ **Concurrencia**: Múltiples clientes escribiendo simultáneamente
- ✅ **Escalabilidad**: Crecimiento sin límites de tamaño
- ✅ **Confiabilidad**: Sin corrupción de datos bajo carga
- ✅ **Features avanzados**: Full-text search, JSON ops, geoespacial
- ✅ **Backups automáticos**: Proveedores cloud ofrecen esto

---

## 📋 Opciones de Hosting PostgreSQL

### **Opción 1: Vercel Postgres (Recomendada para Next.js)** ⭐
```bash
# Desde tu proyecto en Vercel:
# 1. Storage → Create Database → Postgres
# 2. Copiar connection string automáticamente a env vars
# 3. Precio: $20/mes (Hobby plan incluye 256MB)
```

**Pros:**
- Integración nativa con Vercel
- Auto-setup de env vars
- Backups automáticos
- Pool de conexiones incluido

**Cons:**
- Un poco más caro que alternativas
- Limitado a región seleccionada

### **Opción 2: Supabase (Mejor para funcionalidad extra)**
```bash
# 1. Crear proyecto en https://supabase.com
# 2. Copiar connection string de Settings → Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

**Pros:**
- Free tier generoso (500MB)
- Auth, Storage, Realtime incluidos
- API REST auto-generada
- Dashboard excelente

**Cons:**
- Más features = más complejidad
- Free tier con límites de conexiones

### **Opción 3: Railway (Más económica)**
```bash
# 1. Crear proyecto en https://railway.app
# 2. Add PostgreSQL service
# 3. Copiar DATABASE_URL de variables
```

**Pros:**
- $5/mes plan inicial
- Deploy automático desde GitHub
- Muy simple

**Cons:**
- Menos features que otros
- Sin dashboard avanzado

### **Opción 4: Neon (Serverless, moderna)**
```bash
# 1. Crear proyecto en https://neon.tech
# 2. Copiar connection string
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb"
```

**Pros:**
- Serverless (paga por uso)
- Branching de bases de datos (súper útil)
- Free tier muy generoso (3GB)

**Cons:**
- Relativamente nuevo
- Cold starts en free tier

---

## 🔧 Pasos de Migración

### **Paso 1: Instalar dependencias necesarias**

```bash
# PostgreSQL driver ya incluido en @prisma/client
# Solo verifica que tengas las últimas versiones
pnpm install @prisma/client@latest prisma@latest
```

### **Paso 2: Actualizar schema.prisma** ✅ (Ya hecho)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### **Paso 3: Configurar DATABASE_URL**

**Para desarrollo local con Docker:**
```bash
# docker-compose.yml (crear este archivo)
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: multt
      POSTGRES_PASSWORD: multt123
      POSTGRES_DB: multt
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

# Ejecutar:
docker-compose up -d

# .env.local
DATABASE_URL="postgresql://multt:multt123@localhost:5432/multt"
```

**Para producción (elige un proveedor):**
```bash
# .env.production (en Vercel/Railway como env vars)
DATABASE_URL="postgresql://[provider-connection-string]"
```

### **Paso 4: Crear y aplicar migraciones**

```bash
# 1. Generar migración inicial desde schema actual
pnpm prisma migrate dev --name init

# 2. Verificar migración creada en prisma/migrations/

# 3. Si hay errores, resetear y recrear:
pnpm prisma migrate reset
pnpm prisma migrate dev --name init

# 4. Generar Prisma Client
pnpm prisma generate
```

### **Paso 5: Migrar datos existentes (si tienes datos en SQLite)**

```bash
# Script de migración de datos
node scripts/migrate-sqlite-to-postgres.js
```

Crear archivo `scripts/migrate-sqlite-to-postgres.js`:

```javascript
const { PrismaClient: SQLiteClient } = require('@prisma/client')
const { PrismaClient: PostgresClient } = require('@prisma/client')

// Cliente SQLite
const sqliteClient = new SQLiteClient({
  datasources: { db: { url: 'file:./prisma/dev.db' } }
})

// Cliente PostgreSQL
const postgresClient = new PostgresClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
})

async function migrate() {
  console.log('🔄 Iniciando migración...')

  try {
    // 1. Migrar usuarios
    const users = await sqliteClient.user.findMany({
      include: {
        storeSettings: true,
        categories: true,
        products: true,
        orders: true
      }
    })

    for (const user of users) {
      await postgresClient.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          password: user.password,
          role: user.role,
          // ... resto de campos
          storeSettings: user.storeSettings ? {
            create: { ...user.storeSettings }
          } : undefined
        }
      })
      console.log(`✅ Usuario migrado: ${user.email}`)
    }

    console.log('✨ Migración completada exitosamente')
  } catch (error) {
    console.error('❌ Error en migración:', error)
  } finally {
    await sqliteClient.$disconnect()
    await postgresClient.$disconnect()
  }
}

migrate()
```

### **Paso 6: Testing de la migración**

```bash
# 1. Verificar conexión
pnpm prisma db push

# 2. Abrir Prisma Studio y verificar datos
pnpm db:studio

# 3. Seed de datos de prueba
pnpm db:seed

# 4. Probar app localmente
pnpm dev
```

### **Paso 7: Deploy a producción**

```bash
# Vercel
# 1. Conectar Vercel Postgres en dashboard
# 2. Variables de entorno se agregan automáticamente
# 3. Deploy
vercel --prod

# Railway/Otros
# 1. Configurar DATABASE_URL en env vars
# 2. Agregar comando de migración en build:
#    "build": "prisma migrate deploy && next build"
# 3. Deploy desde GitHub
```

---

## 🔒 Configuración de Producción Segura

### **Connection Pooling (Importante para serverless)**

```bash
# Instalar Prisma Accelerate (para edge/serverless)
pnpm add @prisma/extension-accelerate

# O usar Prisma Data Proxy
# En schema.prisma:
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["dataProxy"]
}

# DATABASE_URL debe tener connection pooling:
# Vercel Postgres ya lo incluye
# Supabase: usar URL con puerto 6543 (pooler)
DATABASE_URL="postgresql://postgres:pass@db.project.supabase.co:6543/postgres?pgbouncer=true"
```

### **Índices para performance**

Ya tienes algunos en el schema, pero agrega estos críticos:

```prisma
model Product {
  // ... campos existentes

  @@index([userId, isActive]) // Lista de productos activos por user
  @@index([createdAt]) // Ordenamiento por fecha
}

model Order {
  // ... campos existentes

  @@index([userId, status]) // Filtrar pedidos por estado
  @@index([createdAt]) // Reportes por fecha
}
```

### **Backups automáticos**

```bash
# Vercel Postgres: Backups automáticos incluidos
# Supabase: Backups diarios automáticos en plan Pro

# Script manual de backup (opcional):
#!/bin/bash
# backup.sh
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restaurar backup:
psql $DATABASE_URL < backup_20241007.sql
```

---

## ⚠️ Problemas Comunes y Soluciones

### **Error: "Too many connections"**
```bash
# Solución: Usar connection pooling
# PgBouncer en Supabase (puerto 6543)
# O Prisma Accelerate
```

### **Error: "SSL required"**
```bash
# Agregar a DATABASE_URL:
?sslmode=require

# Ejemplo completo:
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### **Error: "Column type mismatch"**
```bash
# SQLite es más flexible con tipos
# PostgreSQL es estricto
# Revisar schema y ajustar tipos:

# Antes (SQLite acepta):
createdAt DateTime

# PostgreSQL necesita:
createdAt DateTime @default(now())
```

### **Migraciones fallan**
```bash
# 1. Resetear migraciones
pnpm prisma migrate reset

# 2. Crear migración fresh
pnpm prisma migrate dev --name fresh_start

# 3. Si aún falla, usar push (no recomendado en prod):
pnpm prisma db push
```

---

## 📊 Verificación Post-Migración

### **Checklist de verificación:**

- [ ] ✅ Conexión a PostgreSQL exitosa
- [ ] ✅ Todas las migraciones aplicadas
- [ ] ✅ Datos migrados correctamente (si aplica)
- [ ] ✅ Autenticación funciona
- [ ] ✅ CRUD de productos funciona
- [ ] ✅ Sistema de pedidos funciona
- [ ] ✅ Uploads de imágenes funcionan
- [ ] ✅ Performance aceptable (< 500ms queries)
- [ ] ✅ Backups configurados
- [ ] ✅ Monitoreo configurado

### **Script de verificación:**

```bash
# test-postgres.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  try {
    // Test 1: Conexión
    await prisma.$connect()
    console.log('✅ Conexión exitosa')

    // Test 2: Query simple
    const count = await prisma.user.count()
    console.log(`✅ Usuarios en DB: ${count}`)

    // Test 3: Transacción
    await prisma.$transaction([
      prisma.user.count(),
      prisma.product.count()
    ])
    console.log('✅ Transacciones funcionando')

    // Test 4: Performance
    const start = Date.now()
    await prisma.product.findMany({ take: 100 })
    console.log(`✅ Query performance: ${Date.now() - start}ms`)

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

test()
```

---

## 🚀 Próximos Pasos

Después de migrar a PostgreSQL:

1. **Configurar CDN para imágenes** (siguiente bloqueador)
2. **Implementar emails** (Resend/SendGrid)
3. **Configurar monitoring** (Vercel Analytics + Sentry)
4. **Rate limiting con Redis** (Upstash)

---

## 📚 Recursos Adicionales

- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [Railway PostgreSQL](https://docs.railway.app/databases/postgresql)

---

**¿Dudas?** Consulta la documentación oficial de Prisma o el proveedor de PostgreSQL elegido.
