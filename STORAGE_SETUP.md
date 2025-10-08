# 📦 Sistema de Almacenamiento Multi-Provider

## 🎯 Descripción

El sistema de almacenamiento está diseñado para ser **provider-agnostic**, permitiéndote cambiar entre diferentes servicios de almacenamiento **sin modificar código**. Solo necesitas cambiar una variable de entorno.

## ✅ Providers Soportados

| Provider | Uso Recomendado | Costo | Configuración |
|----------|----------------|-------|---------------|
| **Local** | VPS, Railway | Gratis | Ninguna |
| **Vercel Blob** | Vercel hosting | ~$0.15/GB | Token |
| **S3-Compatible** | AWS, MinIO, DigitalOcean | Variable | Credenciales |

---

## 🚀 Quick Start

### 1️⃣ Configurar Provider

Edita tu archivo `.env`:

```bash
# Opción 1: Local Storage (VPS/Railway)
STORAGE_PROVIDER="local"

# Opción 2: Vercel Blob
STORAGE_PROVIDER="vercel-blob"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."

# Opción 3: S3-Compatible
STORAGE_PROVIDER="s3"
S3_BUCKET="mi-bucket"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="AKIAxxxxx"
S3_SECRET_ACCESS_KEY="xxxxx"
```

### 2️⃣ Usar en tu Componente

```tsx
import { ImageUpload } from '@/components/ui/image-upload'

export function MyForm() {
  const [imageUrl, setImageUrl] = useState('')
  const [imageKey, setImageKey] = useState('')

  return (
    <ImageUpload
      value={imageUrl}
      onChange={(url, key) => {
        setImageUrl(url)
        setImageKey(key)
      }}
      onRemove={() => {
        setImageUrl('')
        setImageKey('')
      }}
      path="products" // Subdirectorio para organizar
      maxSize={5} // MB
      aspectRatio="square"
    />
  )
}
```

### 3️⃣ Usar Directamente la API

```typescript
// Upload
const formData = new FormData()
formData.append('file', file)
formData.append('path', 'products')

const response = await fetch('/api/upload/image', {
  method: 'POST',
  body: formData,
})

const data = await response.json()
// { success: true, url: "...", key: "...", size: 1234, type: "image/jpeg" }

// Delete
await fetch(`/api/upload/image?key=${imageKey}`, {
  method: 'DELETE',
})
```

---

## 🔧 Configuración Detallada

### Provider 1: Local Storage (Filesystem)

**Ventajas:**
- ✅ Gratis
- ✅ Sin configuración adicional
- ✅ Control total

**Desventajas:**
- ❌ No escalable horizontalmente
- ❌ No sirve para serverless (Vercel, Lambda)
- ❌ Requiere backups manuales

**Configuración:**

```bash
STORAGE_PROVIDER="local"
NEXT_PUBLIC_APP_URL="http://localhost:3000" # O tu dominio
```

Los archivos se guardan en `/public/uploads/` y son accesibles en `/uploads/...`

**Ideal para:** VPS, Railway, hosting tradicional

---

### Provider 2: Vercel Blob

**Ventajas:**
- ✅ Integración perfecta con Vercel
- ✅ CDN global automático
- ✅ Escalable automáticamente
- ✅ Setup en 2 minutos

**Desventajas:**
- ❌ Solo funciona en Vercel
- ❌ Costos por storage y tráfico

**Configuración:**

1. En Vercel Dashboard → Storage → Create Database → Blob
2. Vercel auto-configura `BLOB_READ_WRITE_TOKEN`
3. Actualiza `.env`:

```bash
STORAGE_PROVIDER="vercel-blob"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..." # Auto-configurado
```

**Instalación de dependencias:**

```bash
pnpm add @vercel/blob
```

**Ideal para:** Hosting en Vercel

---

### Provider 3: S3-Compatible

**Ventajas:**
- ✅ Compatible con AWS S3, MinIO, DigitalOcean Spaces, Backblaze
- ✅ Precios muy competitivos
- ✅ CDN opcional
- ✅ Control total

**Desventajas:**
- ❌ Configuración más compleja
- ❌ Requiere gestionar credenciales

#### Opción 3A: AWS S3

```bash
STORAGE_PROVIDER="s3"
S3_BUCKET="mi-bucket-multt"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="AKIAxxxxxxxxxxxxx"
S3_SECRET_ACCESS_KEY="xxxxxxxxxxxxxxxxxxxxxx"
```

**Setup:**
1. Crear bucket en AWS S3
2. Configurar IAM user con permisos `s3:PutObject`, `s3:DeleteObject`, `s3:GetObject`
3. Hacer bucket público o configurar CloudFront

#### Opción 3B: DigitalOcean Spaces

```bash
STORAGE_PROVIDER="s3"
S3_BUCKET="mi-bucket"
S3_REGION="us-east-1"
S3_ENDPOINT="https://nyc3.digitaloceanspaces.com"
S3_PUBLIC_URL="https://mi-bucket.nyc3.cdn.digitaloceanspaces.com"
S3_ACCESS_KEY_ID="DO00xxxxxxxxxxxxx"
S3_SECRET_ACCESS_KEY="xxxxxxxxxxxxxxxxxxxxxx"
```

**Setup:**
1. Crear Space en DigitalOcean
2. Generar Access Key en API → Spaces Keys
3. Configurar CDN (incluido gratis)

#### Opción 3C: MinIO (Self-hosted)

```bash
STORAGE_PROVIDER="s3"
S3_BUCKET="multt-images"
S3_REGION="us-east-1"
S3_ENDPOINT="http://minio.tudominio.com:9000"
S3_PUBLIC_URL="http://minio.tudominio.com:9000"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
```

**Instalación de dependencias:**

```bash
pnpm add @aws-sdk/client-s3
```

**Ideal para:** Flexibilidad, costos bajos, self-hosting

---

## 📁 Estructura de Archivos Multi-Tenant

El sistema organiza archivos **automáticamente por tenant** para máxima seguridad:

```
/uploads/
  ├── store-cm123abc/          ← Restaurante A
  │   ├── products/
  │   │   ├── 1635789123-a4k2j9.jpg
  │   │   └── 1635789456-x8m3k1.png
  │   ├── banners/
  │   │   └── 1635789789-p9n2m4.jpg
  │   └── profile/
  │       └── 1635789012-q3w7r5.jpg
  ├── store-cm456def/          ← Restaurante B
  │   ├── products/
  │   │   └── 1635790123-b7n4k2.jpg
  │   └── banners/
  │       └── 1635790456-m3p8q1.jpg
  └── store-cm789ghi/          ← Restaurante C
      └── products/
          └── 1635791123-x2w9r5.jpg
```

### 🔒 Aislamiento Automático

**No necesitas hacer nada especial.** El sistema automáticamente:

1. Extrae el `userId` de la sesión
2. Crea el path como `store-{userId}/{category}`
3. Valida permisos al eliminar (un tenant no puede borrar archivos de otro)

```tsx
// Tú solo usas:
<ImageUpload path="products" />

// Internamente se convierte en:
// store-cm123abc/products/1635789123-a4k2j9.jpg
```

### 📂 Categorías Recomendadas

```tsx
<ImageUpload path="products" />      // Imágenes de productos
<ImageUpload path="banners" />       // Banners de la tienda
<ImageUpload path="profile" />       // Logo/foto de perfil
<ImageUpload path="categories" />    // Imágenes de categorías
<ImageUpload path="promotions" />    // Imágenes de promociones
```

---

## 🔄 Migrar Entre Providers

### Escenario: De Local a Vercel Blob

1. **Subir imágenes existentes a Vercel Blob:**

```bash
node scripts/migrate-images-to-blob.js
```

2. **Actualizar `.env`:**

```bash
STORAGE_PROVIDER="vercel-blob"
```

3. **Actualizar URLs en base de datos:**

```bash
pnpm prisma studio
# Actualizar manualmente o usar script de migración
```

### Escenario: De Local a S3

Similar al anterior, pero configurando S3 y usando `migrate-images-to-s3.js`

---

## 🛠️ API Reference

### Upload Image

**Endpoint:** `POST /api/upload/image`

**Request:**
```typescript
FormData {
  file: File
  path?: string // Opcional, default: "general"
}
```

**Response:**
```typescript
{
  success: true,
  url: "https://...",
  key: "products/1635789123-a4k2j9.jpg",
  size: 245678,
  type: "image/jpeg"
}
```

**Validaciones:**
- Tamaño máximo: 5MB
- Tipos permitidos: JPEG, PNG, WebP, GIF

### Delete Image

**Endpoint:** `DELETE /api/upload/image?key=<key>`

**Response:**
```typescript
{
  success: true,
  message: "Imagen eliminada"
}
```

---

## 🧪 Testing

```bash
# Test local provider
STORAGE_PROVIDER="local" pnpm dev

# Test Vercel Blob
STORAGE_PROVIDER="vercel-blob" pnpm dev

# Test S3
STORAGE_PROVIDER="s3" pnpm dev
```

---

## 🎨 Componente ImageUpload Props

```typescript
interface ImageUploadProps {
  value?: string           // URL actual de la imagen
  onChange: (url: string, key: string) => void
  onRemove?: () => void
  disabled?: boolean
  className?: string
  path?: string           // Subdirectorio (ej: "products")
  maxSize?: number        // MB, default: 5
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto'
}
```

**Ejemplo con react-hook-form:**

```tsx
import { useForm } from 'react-hook-form'

function ProductForm() {
  const form = useForm()

  return (
    <ImageUpload
      value={form.watch('image')}
      onChange={(url, key) => {
        form.setValue('image', url)
        form.setValue('imageKey', key)
      }}
      onRemove={() => {
        form.setValue('image', '')
        form.setValue('imageKey', '')
      }}
      path="products"
      aspectRatio="square"
    />
  )
}
```

---

## 💰 Comparación de Costos

### Local (VPS/Railway)
- **Storage:** Incluido en el plan VPS
- **Tráfico:** Incluido
- **Total:** $0 (ya pagas el VPS)

### Vercel Blob
- **Storage:** $0.15/GB/mes
- **Tráfico:** $0.40/GB
- **Ejemplo:** 10GB storage + 100GB tráfico = $41.50/mes
- **Free tier:** 500MB + 10GB tráfico

### DigitalOcean Spaces
- **Storage:** $5/mes (250GB incluidos)
- **Tráfico:** $0.01/GB (1TB incluido)
- **CDN:** Incluido gratis
- **Total:** $5/mes (para la mayoría de apps)

### AWS S3
- **Storage:** $0.023/GB/mes
- **Tráfico:** $0.09/GB
- **Ejemplo:** 10GB storage + 100GB tráfico = $9.23/mes

**Recomendación:** DigitalOcean Spaces es el sweet spot calidad-precio.

---

## 🔒 Seguridad Multi-Tenant

### Validaciones Implementadas

✅ **Autenticación obligatoria** - Solo usuarios logueados pueden subir
✅ **Aislamiento por tenant** - Cada restaurante tiene su propia carpeta
✅ **Validación de permisos** - No puedes eliminar archivos de otros tenants
✅ **Validación de tipo** - Solo imágenes permitidas
✅ **Validación de tamaño** - 5MB máximo
✅ **Nombres únicos** - timestamp + random
✅ **Logs de seguridad** - Se registran intentos de acceso no autorizado

### Ejemplo de Validación

```typescript
// Si Usuario A (id: cm123) intenta eliminar archivo de Usuario B:
DELETE /api/upload/image?key=store-cm456/products/image.jpg

// Response: 403 Forbidden
{
  error: "No tienes permiso para eliminar este archivo"
}

// Console warning:
// "Intento de eliminar archivo de otro usuario: user@example.com intentó eliminar store-cm456/products/image.jpg"
```

### Mejoras Recomendadas (Producción)

- [ ] Escaneo de virus (ClamAV)
- [ ] Compresión de imágenes (Sharp)
- [ ] Watermarks automáticos
- [ ] Rate limiting por usuario
- [ ] Cuotas de storage por tenant (ej: 1GB/restaurante)
- [ ] Logs de auditoría en base de datos
- [ ] Backup automático por tenant

---

## 🐛 Troubleshooting

### "Failed to upload file"

**Causa:** Provider mal configurado

**Solución:**
1. Verifica `STORAGE_PROVIDER` en `.env`
2. Verifica credenciales del provider
3. Revisa logs en consola

### "File too large"

**Causa:** Archivo > 5MB

**Solución:**
1. Comprimir imagen
2. Aumentar `MAX_FILE_SIZE` en `/api/upload/image/route.ts`

### "Cannot find module '@vercel/blob'"

**Causa:** Dependencia no instalada

**Solución:**
```bash
pnpm add @vercel/blob
```

### "S3 credentials invalid"

**Causa:** Access Key o Secret incorrectos

**Solución:**
1. Verifica credenciales en AWS/DO
2. Verifica permisos IAM
3. Prueba con AWS CLI primero

---

## 📚 Recursos

- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [AWS S3 Docs](https://docs.aws.amazon.com/s3/)
- [DigitalOcean Spaces](https://www.digitalocean.com/products/spaces)
- [MinIO Docs](https://min.io/docs/minio/linux/index.html)

---

## ✅ Checklist de Migración

Cuando decidas cambiar de provider:

- [ ] Configurar nuevo provider en `.env`
- [ ] Instalar dependencias necesarias (`@vercel/blob` o `@aws-sdk/client-s3`)
- [ ] Probar upload en desarrollo
- [ ] Migrar imágenes existentes
- [ ] Actualizar URLs en base de datos
- [ ] Probar en producción
- [ ] Eliminar archivos del provider anterior
- [ ] Actualizar documentación de despliegue
