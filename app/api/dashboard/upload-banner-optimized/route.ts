import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStorageProvider } from '@/lib/storage'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const formData = await request.formData()
    const image = formData.get('image') as File

    if (!image) {
      return NextResponse.json({ message: 'Imagen requerida' }, { status: 400 })
    }

    const buffer = Buffer.from(await image.arrayBuffer())

    console.log('🔍 Procesando banner optimizado:', {
      originalName: image.name,
      mimeType: image.type,
      originalSize: buffer.length
    })

    // Obtener metadatos de la imagen original
    const metadata = await sharp(buffer).metadata()
    console.log('🔍 Metadata original:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    })

    // Dimensiones exactas de la cabecera (basadas en el CSS real)
    const headerDimensions = {
      mobile: { width: 800, height: 160 },  // h-40 = 160px
      desktop: { width: 1200, height: 192 } // lg:h-48 = 192px
    }

    // Usar dimensiones de desktop como estándar (más grande)
    const targetWidth = headerDimensions.desktop.width
    const targetHeight = headerDimensions.desktop.height

    // Calcular relación de aspecto
    const aspectRatio = targetWidth / targetHeight
    const originalAspectRatio = (metadata.width || 1) / (metadata.height || 1)

    console.log('🔍 Dimensiones objetivo:', {
      targetWidth,
      targetHeight,
      aspectRatio,
      originalAspectRatio
    })

    // Procesar imagen con Sharp - redimensionar al tamaño exacto de la cabecera
    const processedBuffer = await sharp(buffer)
      .resize(targetWidth, targetHeight, {
        fit: 'cover', // Cubrir completamente el área, recortando si es necesario
        position: 'center' // Centrar la imagen al recortar
      })
      .jpeg({
        quality: 90,
        progressive: true,
        mozjpeg: true
      })
      .toBuffer()

    // Crear un File desde el buffer procesado
    const processedFile = new File(
      [processedBuffer],
      `banner-${Date.now()}.jpg`,
      { type: 'image/jpeg' }
    )

    // Usar el sistema de storage multi-provider
    const storage = await getStorageProvider()
    const userId = session.user.id
    const uploadResult = await storage.upload(processedFile, `store-${userId}/banners`)

    console.log('✅ Banner subido al storage:', uploadResult)

    // Eliminar imagen anterior si existe (solo si es del mismo provider)
    const currentSettings = await prisma.storeSettings.findUnique({
      where: { userId: session.user.id },
      select: { bannerImage: true }
    })

    if (currentSettings?.bannerImage) {
      try {
        // Intentar extraer el key de la URL anterior
        // Para local: /uploads/store-xxx/banners/...
        // Para Blob: https://xxx.blob.vercel-storage.com/store-xxx/banners/...
        const oldImageUrl = currentSettings.bannerImage

        if (oldImageUrl.startsWith(`/uploads/store-${userId}/`)) {
          // Es del storage local, extraer el key
          const key = oldImageUrl.replace('/uploads/', '')
          await storage.delete(key)
          console.log('✅ Imagen anterior eliminada:', key)
        } else if (oldImageUrl.includes(`store-${userId}/banners/`)) {
          // Es de Blob o S3, intentar extraer el key
          const keyMatch = oldImageUrl.match(/store-[^/]+\/banners\/.+$/)
          if (keyMatch) {
            await storage.delete(keyMatch[0])
            console.log('✅ Imagen anterior eliminada:', keyMatch[0])
          }
        }
      } catch (error) {
        console.log('⚠️ No se pudo eliminar imagen anterior:', error)
      }
    }

    // Actualizar en la base de datos
    await prisma.storeSettings.upsert({
      where: { userId: session.user.id },
      update: { bannerImage: uploadResult.url },
      create: {
        userId: session.user.id,
        storeName: 'Mi Tienda',
        storeSlug: `tienda-${session.user.id}-${Date.now()}`,
        country: 'Mexico',
        language: 'es',
        currency: 'MXN',
        distanceUnit: 'km',
        mapProvider: 'openstreetmap',
        taxRate: 0.0,
        taxMethod: 'included',
        enableBusinessHours: false,
        disableCheckoutOutsideHours: false,
        paymentsEnabled: true,
        storeActive: false,
        passwordProtected: false,
        bannerImage: uploadResult.url
      }
    })

    const compressionRatio = Math.round((1 - processedBuffer.length / buffer.length) * 100)

    console.log('✅ Banner optimizado y guardado:', {
      imageUrl: uploadResult.url,
      originalSize: buffer.length,
      processedSize: processedBuffer.length,
      compressionRatio: compressionRatio + '%',
      originalDimensions: `${metadata.width}x${metadata.height}`,
      targetDimensions: `${targetWidth}x${targetHeight}`,
      aspectRatioChange: aspectRatio > originalAspectRatio ? 'más ancho' : 'más alto'
    })

    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.url,
      originalSize: buffer.length,
      processedSize: processedBuffer.length,
      compressionRatio: compressionRatio + '%',
      originalDimensions: `${metadata.width}x${metadata.height}`,
      targetDimensions: `${targetWidth}x${targetHeight}`,
      aspectRatio: aspectRatio,
      originalAspectRatio: originalAspectRatio
    })

  } catch (error) {
    console.error('❌ Error en upload-banner-optimized:', error)
    return NextResponse.json({
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
