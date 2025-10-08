# Configuración de CDN para Imágenes - Guía Completa

## 🎯 Por qué necesitas CDN para imágenes

Actualmente tienes imágenes en `/public/uploads/` lo cual es un **bloqueador crítico** porque:

- ❌ **No escalable**: Las imágenes se almacenan en el servidor
- ❌ **Sin persistencia**: Vercel serverless no persiste archivos
- ❌ **Performance**: Sin optimización automática de imágenes
- ❌ **Sin CDN global**: Carga lenta para usuarios lejanos
- ❌ **Sin transformaciones**: No puedes redimensionar on-the-fly

---

## 📋 Opciones de CDN (Mejores para Next.js)

### **Opción 1: Vercel Blob (Recomendada)** ⭐

```bash
# Instalación
pnpm add @vercel/blob

# Configuración automática en Vercel
# Settings → Storage → Create Blob Store
```

**Pros:**
- Integración nativa con Next.js
- Sin configuración compleja
- CDN global incluido
- Precio justo ($0.15/GB storage, $0.20/GB transfer)
- Next.js Image Optimization automática

**Cons:**
- Solo para proyectos en Vercel
- Un poco más caro que S3

**Código de ejemplo:**

```typescript
// app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  const blob = await put(filename!, request.body!, {
    access: 'public',
  });

  return NextResponse.json(blob);
}

// Cliente
async function uploadImage(file: File) {
  const response = await fetch(
    `/api/upload?filename=${file.name}`,
    {
      method: 'POST',
      body: file,
    },
  );

  const { url } = await response.json();
  return url; // https://[random].public.blob.vercel-storage.com/...
}
```

### **Opción 2: Cloudinary (Mejor para transformaciones)**

```bash
# Instalación
pnpm add cloudinary next-cloudinary

# Configuración
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Pros:**
- Free tier generoso (25 créditos/mes)
- Transformaciones avanzadas (resize, crop, filters)
- AI features (auto-crop, background removal)
- Widgets de upload pre-construidos

**Cons:**
- Más complejo de configurar
- Puede ser caro en escala

**Código de ejemplo:**

```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'multt' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
}

// Uso con transformaciones
<Image
  src="https://res.cloudinary.com/demo/image/upload/w_400,h_300,c_fill/sample.jpg"
  width={400}
  height={300}
/>
```

### **Opción 3: AWS S3 + CloudFront (Más económico en escala)**

```bash
# Instalación
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Configuración
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=multt-images
```

**Pros:**
- Muy económico ($0.023/GB storage)
- Infinitamente escalable
- Control total

**Cons:**
- Configuración más compleja
- No incluye transformaciones (necesitas Sharp o similar)

**Código de ejemplo:**

```typescript
// lib/s3.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: File, key: string) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`;
}
```

### **Opción 4: UploadThing (Más fácil para empezar)**

```bash
# Instalación
pnpm add uploadthing @uploadthing/react

# Configuración simple
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=your_app_id
```

**Pros:**
- Setup en 5 minutos
- React components pre-construidos
- Free tier generoso (2GB)
- Validación de archivos incluida

**Cons:**
- Menos features avanzados
- Dependencia de tercero

---

## 🔧 Implementación Recomendada: Vercel Blob

Voy a mostrarte cómo migrar tu sistema actual a Vercel Blob:

### **Paso 1: Instalar dependencias**

```bash
pnpm add @vercel/blob
```

### **Paso 2: Configurar variables de entorno**

En Vercel Dashboard:
1. Settings → Storage → Create Blob Store
2. Variables se agregan automáticamente:
   - `BLOB_READ_WRITE_TOKEN`

Para desarrollo local, crea `.env.local`:
```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

### **Paso 3: Crear API endpoint para upload**

```typescript
// app/api/upload/image/route.ts
import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Tipo de archivo no permitido' }, { status: 400 });
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Archivo muy grande (max 5MB)' }, { status: 400 });
    }

    // Generar nombre único
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = file.name.split('.').pop();
    const filename = `${session.user.id}/${timestamp}-${randomString}.${extension}`;

    // Upload a Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      url: blob.url,
      filename: blob.pathname,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 });
  }
}

// DELETE - Eliminar imagen
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 });
    }

    const { del } = await import('@vercel/blob');
    await del(url);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Error al eliminar archivo' }, { status: 500 });
  }
}
```

### **Paso 4: Componente de Upload**

```typescript
// components/upload/image-upload.tsx
'use client';

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al subir imagen');
      }

      const data = await response.json();
      onChange(data.url);
      toast.success('Imagen subida correctamente');

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al subir imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      await fetch(`/api/upload/image?url=${encodeURIComponent(value)}`, {
        method: 'DELETE',
      });

      onRemove?.();
      toast.success('Imagen eliminada');

    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Error al eliminar imagen');
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative group">
          <div className="relative w-full h-64 rounded-lg overflow-hidden">
            <Image
              src={value}
              alt="Upload"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-3" />
            ) : (
              <Upload className="h-10 w-10 text-gray-400 mb-3" />
            )}
            <p className="text-sm text-gray-500">
              {isUploading ? 'Subiendo...' : 'Click para subir imagen'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WEBP (max 5MB)
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}
```

### **Paso 5: Integrar en formularios existentes**

```typescript
// app/dashboard/products/[id]/page.tsx
import { ImageUpload } from '@/components/upload/image-upload';

export default function ProductForm() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <form>
      {/* ... otros campos ... */}

      <div>
        <Label>Imagen del producto</Label>
        <ImageUpload
          value={imageUrl}
          onChange={setImageUrl}
          onRemove={() => setImageUrl('')}
        />
      </div>

      {/* Guardar imageUrl en la base de datos */}
    </form>
  );
}
```

### **Paso 6: Optimización con Next.js Image**

```typescript
// components/product-image.tsx
import Image from 'next/image';

export function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      className="rounded-lg"
      placeholder="blur"
      blurDataURL="/placeholder.png"
      priority={false}
    />
  );
}
```

---

## 🔄 Migración de Imágenes Existentes

Si ya tienes imágenes en `/public/uploads/`, migrarlas:

```typescript
// scripts/migrate-images-to-blob.ts
import { readdir, readFile } from 'fs/promises';
import { put } from '@vercel/blob';
import path from 'path';

async function migrateImages() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const files = await readdir(uploadsDir, { recursive: true });

  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      const filePath = path.join(uploadsDir, file);
      const buffer = await readFile(filePath);

      const blob = await put(file, buffer, {
        access: 'public',
      });

      console.log(`Migrated: ${file} -> ${blob.url}`);

      // Actualizar URL en base de datos
      await prisma.product.updateMany({
        where: { imageUrl: `/uploads/${file}` },
        data: { imageUrl: blob.url }
      });
    }
  }

  console.log('Migration complete!');
}

migrateImages();
```

---

## 📊 Costos Estimados

### **Vercel Blob (Recomendado para tu caso)**
- Storage: $0.15/GB/mes
- Bandwidth: $0.20/GB
- **Estimado para 100 clientes**: ~$20/mes

### **Cloudinary**
- Free: 25 créditos/mes (suficiente para empezar)
- Paid: $89/mes (25GB storage, 25GB bandwidth)

### **AWS S3 + CloudFront**
- Storage: $0.023/GB/mes
- CloudFront: $0.085/GB (primeros 10TB)
- **Estimado para 100 clientes**: ~$10/mes

---

## ✅ Checklist Post-Implementación

- [ ] Upload de imágenes funciona
- [ ] Delete de imágenes funciona
- [ ] URLs públicas accesibles
- [ ] Optimización con Next.js Image
- [ ] Validación de tipos y tamaños
- [ ] Imágenes antiguas migradas
- [ ] CDN funcionando globalmente
- [ ] Costos monitoreados

---

## 🚀 Próximo Paso

Con imágenes en CDN resuelto, el siguiente bloqueador es:
**Sistema de Emails para Notificaciones** (Resend/SendGrid)
