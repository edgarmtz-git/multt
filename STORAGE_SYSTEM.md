# 📦 Sistema de Almacenamiento Multi-Provider - Multt

## 🎯 Descripción

Sistema de almacenamiento **agnóstico de plataforma** que permite cambiar entre diferentes servicios de storage (Local, Vercel Blob, S3) **sin modificar código**. Solo cambiando variables de entorno.

## ✅ Características

- **Multi-Provider**: Soporte para Local (VPS), Vercel Blob, y S3-compatible (AWS, MinIO, DigitalOcean Spaces)
- **Portable**: Migra fácilmente entre providers
- **Multi-Tenant**: Aislamiento automático de archivos por usuario
- **Type-Safe**: TypeScript con interfaces bien definidas
- **Lazy Loading**: Las dependencias se cargan solo cuando se necesitan
- **Validación**: Scripts para verificar configuración antes de deploy

---

## 🚀 Quick Start

### 1. Elige Tu Provider

**Para desarrollo local / VPS / Railway:**
```bash
# .env.local
STORAGE_PROVIDER="local"
```

**Para Vercel:**
```bash
# .env.local
STORAGE_PROVIDER="vercel-blob"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Instalar dependencia
pnpm add @vercel/blob
```

**Para S3 (AWS, DigitalOcean, MinIO):**
```bash
# .env.local
STORAGE_PROVIDER="s3"
S3_BUCKET="mi-bucket"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="AKIAxxxxx"
S3_SECRET_ACCESS_KEY="xxxxx"

# Instalar dependencia
pnpm add @aws-sdk/client-s3
```

### 2. Validar Configuración

```bash
pnpm tsx scripts/validate-storage-config.ts
```

### 3. ¡Listo!

El sistema usará automáticamente el provider configurado. No necesitas cambiar código.

---

## 🏗️ Arquitectura

### Estructura de Archivos

```
lib/storage/
├── types.ts                 # Interfaces TypeScript
├── local-provider.ts        # Provider para filesystem local
├── vercel-blob-provider.ts  # Provider para Vercel Blob
├── s3-provider.ts          # Provider para S3-compatible
└── index.ts                # Factory + exports

scripts/
├── validate-storage-config.ts  # Validar configuración
└── migrate-storage.ts         # Migrar entre providers
```

### Diagrama de Flujo

```
┌─────────────────┐
│  API Endpoint   │ (POST /api/upload/image)
│  /api/upload    │
└────────┬────────┘
         │
         v
┌─────────────────┐
│ getStorageProvider()  │ (Factory)
└────────┬────────┘
         │
         v
    ┌────────────┐
    │ Provider?  │
    └─────┬──────┘
          │
    ┌─────┴─────┬─────────┐
    │           │         │
    v           v         v
┌────────┐  ┌──────┐  ┌──────┐
│ Local  │  │ Blob │  │  S3  │
└────────┘  └──────┘  └──────┘
    │           │         │
    v           v         v
 /public/   Vercel     AWS S3
 uploads/   Blob      MinIO
            Storage   DO Spaces
```

### Interface `StorageAdapter`

```typescript
interface StorageAdapter {
  // Sube un archivo al storage
  upload(file: File, path?: string): Promise<UploadResult>

  // Elimina un archivo del storage
  delete(key: string): Promise<void>

  // Obtiene la URL pública de un archivo
  getPublicUrl(key: string): string
}

interface UploadResult {
  url: string    // URL pública del archivo
  key: string    // Key único (para eliminación)
  size: number   // Tamaño en bytes
  type: string   // MIME type
}
```

---

## 📁 Organización Multi-Tenant

Los archivos se organizan automáticamente por usuario:

```
/uploads/
  ├── store-{userId-1}/
  │   ├── products/
  │   │   ├── 1635789123-a4k2j9.jpg
  │   │   └── 1635789456-x8m3k1.png
  │   ├── banners/
  │   └── profile/
  ├── store-{userId-2}/
  │   ├── products/
  │   └── banners/
  └── store-{userId-3}/
      └── products/
```

**Aislamiento automático:**
- El API extrae `userId` de la sesión
- Construye el path como `store-{userId}/{category}`
- Valida permisos al eliminar (no puedes borrar archivos de otros usuarios)

---

## 🔧 Uso en Código

### API Routes

```typescript
import { getStorageProvider } from '@/lib/storage'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const formData = await req.formData()
  const file = formData.get('file') as File

  // Obtener provider configurado
  const storage = await getStorageProvider()

  // Upload con aislamiento multi-tenant
  const userId = session.user.id
  const result = await storage.upload(file, `store-${userId}/products`)

  return NextResponse.json(result)
}
```

### Componentes React

```typescript
async function handleUpload(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('path', 'products')

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData
  })

  const data = await response.json()
  // { url: "...", key: "store-xxx/products/...", size: 1234, type: "image/jpeg" }
}
```

---

## ⚙️ Configuración por Provider

### Local Storage (VPS/Railway)

**Variables:**
```bash
STORAGE_PROVIDER="local"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Características:**
- ✅ Gratis
- ✅ Sin configuración adicional
- ✅ Control total
- ❌ No funciona en serverless (Vercel, Lambda)
- ❌ No escalable horizontalmente

**Archivos guardados en:** `/public/uploads/`

---

### Vercel Blob

**Variables:**
```bash
STORAGE_PROVIDER="vercel-blob"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

**Setup:**
1. Vercel Dashboard → Storage → Create Database → Blob
2. Vercel auto-configura `BLOB_READ_WRITE_TOKEN`
3. `pnpm add @vercel/blob`

**Características:**
- ✅ Integración perfecta con Vercel
- ✅ CDN global automático
- ✅ Escalable automáticamente
- ❌ Solo funciona en Vercel
- ❌ Costos por storage y tráfico

**Precios:**
- Storage: $0.15/GB/mes
- Tráfico: $0.40/GB
- Free tier: 500MB + 10GB tráfico

---

### S3-Compatible (AWS, MinIO, DigitalOcean)

**Variables:**
```bash
STORAGE_PROVIDER="s3"
S3_BUCKET="mi-bucket"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="AKIAxxxxx"
S3_SECRET_ACCESS_KEY="xxxxx"

# Opcional para MinIO/DigitalOcean
S3_ENDPOINT="https://nyc3.digitaloceanspaces.com"
S3_PUBLIC_URL="https://bucket.nyc3.cdn.digitaloceanspaces.com"
```

**Setup AWS S3:**
1. Crear bucket en S3
2. Configurar IAM user con permisos: `s3:PutObject`, `s3:DeleteObject`, `s3:GetObject`
3. Hacer bucket público o configurar CloudFront
4. `pnpm add @aws-sdk/client-s3`

**Setup DigitalOcean Spaces:**
1. Crear Space en DigitalOcean
2. Generar Access Key en API → Spaces Keys
3. CDN incluido gratis
4. `pnpm add @aws-sdk/client-s3`

**Características:**
- ✅ Compatible con múltiples providers
- ✅ Precios competitivos (DO Spaces: $5/mes flat)
- ✅ CDN opcional
- ❌ Configuración más compleja

---

## 🔄 Migración Entre Providers

### Escenario: De Local a Vercel Blob

```bash
# 1. Configurar nuevo provider en .env
STORAGE_PROVIDER="vercel-blob"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# 2. Instalar dependencia
pnpm add @vercel/blob

# 3. Validar configuración
pnpm tsx scripts/validate-storage-config.ts

# 4. Migrar imágenes existentes
pnpm tsx scripts/migrate-storage.ts

# 5. Deploy
vercel --prod
```

### Escenario: De Vercel a VPS (con S3)

```bash
# 1. Configurar S3 en tu VPS
STORAGE_PROVIDER="s3"
S3_BUCKET="multt-images"
S3_ENDPOINT="https://minio.tudominio.com:9000"
# ... resto de variables

# 2. Instalar dependencia
pnpm add @aws-sdk/client-s3

# 3. Validar configuración
pnpm tsx scripts/validate-storage-config.ts

# 4. Ejecutar migración
pnpm tsx scripts/migrate-storage.ts
```

**IMPORTANTE:** Haz backup de tu base de datos antes de migrar.

---

## 🛠️ Scripts Disponibles

### Validar Configuración

```bash
pnpm tsx scripts/validate-storage-config.ts
```

**Verifica:**
- Que `STORAGE_PROVIDER` sea válido
- Que las variables requeridas estén configuradas
- Que las dependencias necesarias estén instaladas
- Que el entorno sea compatible con el provider

**Output de ejemplo:**
```
🔍 Validando configuración de storage...

✅ Storage provider configurado: vercel-blob
☁️  Validando Vercel Blob...
✅ Vercel Blob configurado correctamente
   Token encontrado: vercel_blob_rw_xxxx...

✅ Configuración de storage válida
```

### Migrar Storage

```bash
pnpm tsx scripts/migrate-storage.ts
```

**Hace:**
1. Recopila todas las URLs de imágenes en la DB
2. Descarga cada imagen del provider actual
3. Las sube al nuevo provider configurado
4. Actualiza las URLs en la base de datos

**Output de ejemplo:**
```
🔄 Migración de Storage

Provider configurado: s3

📊 Recopilando referencias de imágenes...
📸 Encontradas 45 imágenes para migrar

Ejemplos de imágenes a migrar:
  - storeSettings.bannerImage: /uploads/store-images/banner-xxx.jpg
  - product.imageUrl: /uploads/product-images/product-yyy.jpg
  ... y 43 más

⚠️  ADVERTENCIA: Este proceso:
   1. Descargará todas las imágenes
   2. Las subirá al nuevo provider
   3. Actualizará las URLs en la base de datos

   Asegúrate de haber hecho backup de tu base de datos

¿Continuar con la migración? (yes/no): yes

🚀 Iniciando migración...

[1/45] Migrando storeSettings.bannerImage...
   ✅ /uploads/... → https://s3.amazonaws.com/...

📊 Resultados de la migración:
   ✅ Exitosas: 45
   ❌ Fallidas: 0

✅ Migración completada exitosamente
```

---

## 💰 Comparación de Costos

| Provider | Storage | Tráfico | Ejemplo (10GB + 100GB tráfico/mes) | Ideal para |
|----------|---------|---------|-------------------------------------|------------|
| **Local (VPS)** | Incluido | Incluido | $0 (ya pagas el VPS) | VPS, Railway |
| **Vercel Blob** | $0.15/GB/mes | $0.40/GB | $41.50/mes | Hosting en Vercel |
| **DO Spaces** | $5/mes (250GB inc) | $0.01/GB (1TB inc) | $5/mes | Mejor relación calidad-precio |
| **AWS S3** | $0.023/GB/mes | $0.09/GB | $9.23/mes | Flexibilidad, integración AWS |

**Recomendación:**
- Desarrollo: Local
- Vercel: Vercel Blob (conveniente pero costoso)
- Producción VPS: DigitalOcean Spaces (mejor precio)

---

## 🔒 Seguridad

### Validaciones Implementadas

✅ **Autenticación obligatoria** - Solo usuarios logueados pueden subir  
✅ **Aislamiento por tenant** - Cada usuario tiene su propia carpeta  
✅ **Validación de permisos** - No puedes eliminar archivos de otros  
✅ **Validación de tipo** - Solo imágenes permitidas (JPEG, PNG, WebP, GIF)  
✅ **Validación de tamaño** - 5MB máximo  
✅ **Nombres únicos** - timestamp + random para evitar colisiones  
✅ **Logs de seguridad** - Se registran intentos de acceso no autorizado  

### Ejemplo de Validación

```typescript
// Usuario A (id: cm123) intenta eliminar archivo de Usuario B
DELETE /api/upload/image?key=store-cm456/products/image.jpg

// Response: 403 Forbidden
{
  "error": "No tienes permiso para eliminar este archivo"
}

// Console warning:
// "Intento de eliminar archivo de otro usuario: userA@example.com intentó eliminar store-cm456/products/image.jpg"
```

---

## 🐛 Troubleshooting

### Error: "Failed to upload file"

**Causa:** Provider mal configurado

**Solución:**
1. Verifica `STORAGE_PROVIDER` en `.env`
2. Ejecuta `pnpm tsx scripts/validate-storage-config.ts`
3. Verifica credenciales del provider

---

### Error: "Cannot find module '@vercel/blob'"

**Causa:** Dependencia no instalada

**Solución:**
```bash
pnpm add @vercel/blob
```

---

### Error: "S3 credentials invalid"

**Causa:** Access Key o Secret incorrectos

**Solución:**
1. Verifica credenciales en AWS Console / DigitalOcean
2. Verifica permisos IAM
3. Prueba con AWS CLI primero:
```bash
aws s3 ls s3://tu-bucket --profile tu-perfil
```

---

### Migración falla con "Failed to download"

**Causa:** URLs locales no accesibles desde donde corres el script

**Solución:**
1. Asegúrate de que `NEXT_PUBLIC_APP_URL` apunte a tu servidor
2. Si migras desde producción, ejecuta el script en el servidor
3. O actualiza las URLs temporalmente para que sean accesibles

---

## 📚 Ejemplos de Uso

### Upload Básico

```typescript
// En un API route
const storage = await getStorageProvider()
const result = await storage.upload(file, 'products')
// { url: "...", key: "products/1234-abc.jpg", size: 1234, type: "image/jpeg" }
```

### Upload Multi-Tenant

```typescript
// Con aislamiento automático por usuario
const userId = session.user.id
const result = await storage.upload(file, `store-${userId}/banners`)
// { url: "...", key: "store-cm123/banners/1234-abc.jpg", ... }
```

### Delete

```typescript
const storage = await getStorageProvider()
await storage.delete('store-cm123/products/1234-abc.jpg')
```

### Get Public URL

```typescript
const storage = await getStorageProvider()
const url = storage.getPublicUrl('store-cm123/products/1234-abc.jpg')
// Local: http://localhost:3000/uploads/store-cm123/products/1234-abc.jpg
// Blob: https://xxx.public.blob.vercel-storage.com/...
// S3: https://bucket.s3.region.amazonaws.com/store-cm123/products/1234-abc.jpg
```

---

## ✅ Checklist de Producción

### Antes del Deploy

- [ ] Elegir provider (`local`, `vercel-blob`, o `s3`)
- [ ] Configurar variables de entorno
- [ ] Instalar dependencias necesarias
- [ ] Ejecutar `pnpm tsx scripts/validate-storage-config.ts`
- [ ] Probar upload/delete en desarrollo

### Al Migrar de Provider

- [ ] Hacer backup de base de datos
- [ ] Configurar nuevo provider en `.env`
- [ ] Instalar dependencias del nuevo provider
- [ ] Validar configuración con script
- [ ] Ejecutar `pnpm tsx scripts/migrate-storage.ts`
- [ ] Verificar que las imágenes se vean correctamente
- [ ] (Opcional) Eliminar archivos del provider anterior

### Configuración Recomendada por Entorno

**Desarrollo:**
```bash
STORAGE_PROVIDER="local"
```

**Staging (Vercel Preview):**
```bash
STORAGE_PROVIDER="vercel-blob"
BLOB_READ_WRITE_TOKEN="..."
```

**Producción (Vercel):**
```bash
STORAGE_PROVIDER="vercel-blob"
BLOB_READ_WRITE_TOKEN="..."
```

**Producción (VPS):**
```bash
STORAGE_PROVIDER="s3"
S3_BUCKET="multt-production"
S3_ENDPOINT="https://nyc3.digitaloceanspaces.com"
# ... resto de variables
```

---

## 🚀 Mejoras Futuras

- [ ] Compresión automática de imágenes con Sharp
- [ ] Generación de thumbnails
- [ ] Soporte para múltiples tamaños (responsive images)
- [ ] Watermarks automáticos
- [ ] Escaneo de virus (ClamAV)
- [ ] Cuotas de storage por tenant
- [ ] Backup automático por tenant
- [ ] UI para gestionar archivos
- [ ] CDN integration para Local provider

---

## 📖 Referencias

- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [AWS S3 Docs](https://docs.aws.amazon.com/s3/)
- [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces)
- [MinIO Docs](https://min.io/docs/minio/linux/index.html)

---

**Implementado en:** Multt v1.0  
**Última actualización:** Octubre 2025  
**Maintainer:** [@edgarmartinez](https://github.com/edgarmartinez)
