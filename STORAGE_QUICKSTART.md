# 🚀 Storage System - Quick Start

## Para Desarrolladores

### Opción 1: Local Storage (Desarrollo)

```bash
# .env.local
STORAGE_PROVIDER="local"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

✅ Listo! Los archivos se guardarán en `/public/uploads/`

---

### Opción 2: Vercel Blob (Producción en Vercel)

```bash
# 1. Crear Vercel Blob en Dashboard
# Vercel Dashboard → Storage → Blob → Create

# 2. Instalar dependencia
pnpm add @vercel/blob

# 3. Configurar en Vercel
# El token BLOB_READ_WRITE_TOKEN se auto-configura

# 4. Configurar localmente para testing
echo 'STORAGE_PROVIDER="vercel-blob"' >> .env.local
echo 'BLOB_READ_WRITE_TOKEN="tu_token_aqui"' >> .env.local

# 5. Validar
pnpm storage:validate
```

---

### Opción 3: DigitalOcean Spaces (Mejor Precio)

```bash
# 1. Crear Space en DigitalOcean
# https://cloud.digitalocean.com/spaces

# 2. Generar API Keys
# API → Spaces Keys → Generate New Key

# 3. Instalar dependencia
pnpm add @aws-sdk/client-s3

# 4. Configurar .env.local
cat >> .env.local << 'ENV'
STORAGE_PROVIDER="s3"
S3_BUCKET="tu-bucket-name"
S3_REGION="us-east-1"
S3_ENDPOINT="https://nyc3.digitaloceanspaces.com"
S3_PUBLIC_URL="https://tu-bucket-name.nyc3.cdn.digitaloceanspaces.com"
S3_ACCESS_KEY_ID="DO00XXXXXXXXXXXXX"
S3_SECRET_ACCESS_KEY="xxxxxxxxxxxxxxxxxxxxx"
ENV

# 5. Validar
pnpm storage:validate
```

---

## Comandos Útiles

```bash
# Validar configuración actual
pnpm storage:validate

# Migrar de un provider a otro
pnpm storage:migrate

# Desarrollo
pnpm dev

# Build para producción
pnpm build
```

---

## Uso en Código

### Subir imagen desde API

```typescript
import { getStorageProvider } from '@/lib/storage'

const storage = await getStorageProvider()
const result = await storage.upload(file, 'products')
// { url: "...", key: "...", size: 1234, type: "image/jpeg" }
```

### Desde el cliente

```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('path', 'products')

const response = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData
})

const data = await response.json()
```

---

## Troubleshooting

### "Failed to upload"

```bash
# Verificar configuración
pnpm storage:validate

# Ver logs de Next.js
pnpm dev
```

### "Module not found"

```bash
# Para Vercel Blob
pnpm add @vercel/blob

# Para S3
pnpm add @aws-sdk/client-s3
```

### Migrar de Local a Vercel

```bash
# 1. Configurar Vercel Blob en .env
STORAGE_PROVIDER="vercel-blob"

# 2. Validar
pnpm storage:validate

# 3. Migrar imágenes existentes
pnpm storage:migrate

# 4. Deploy
git add . && git commit -m "chore: Migrate to Vercel Blob" && git push
```

---

Para más detalles, consulta [STORAGE_SYSTEM.md](./STORAGE_SYSTEM.md)
