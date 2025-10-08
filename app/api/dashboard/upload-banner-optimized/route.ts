import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'

function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

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

    // Crear directorio si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'store-images')
    await mkdir(uploadsDir, { recursive: true })

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
      mobile: { width: 800, height: 160 },  // h-40 = 160px, asumiendo ancho de 800px en móvil
      desktop: { width: 1200, height: 192 } // lg:h-48 = 192px, asumiendo ancho de 1200px en desktop
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

    // Generar nombre único para el archivo
    const fileName = `banner-${session.user.id}-${generateUniqueId()}.jpg`
    const filePath = join(uploadsDir, fileName)

    // Guardar imagen procesada
    await writeFile(filePath, processedBuffer)

    // Generar URL relativa
    const imageUrl = `/uploads/store-images/${fileName}`

    // Eliminar imagen anterior si existe
    const currentSettings = await prisma.storeSettings.findUnique({
      where: { userId: session.user.id },
      select: { bannerImage: true }
    })

    const currentImagePath = currentSettings?.bannerImage
    if (currentImagePath && currentImagePath.startsWith('/uploads/')) {
      const oldFilePath = join(process.cwd(), 'public', currentImagePath)
      try {
        await unlink(oldFilePath)
        console.log('✅ Imagen anterior eliminada:', oldFilePath)
      } catch (error) {
        console.log('⚠️ No se pudo eliminar imagen anterior:', error)
      }
    }

    // Actualizar en la base de datos
    await prisma.storeSettings.upsert({
      where: { userId: session.user.id },
      update: { bannerImage: imageUrl },
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
        bannerImage: imageUrl
      }
    })

    const compressionRatio = Math.round((1 - processedBuffer.length / buffer.length) * 100)
    
    console.log('✅ Banner optimizado y guardado:', {
      fileName,
      imageUrl,
      originalSize: buffer.length,
      processedSize: processedBuffer.length,
      compressionRatio: compressionRatio + '%',
      originalDimensions: `${metadata.width}x${metadata.height}`,
      targetDimensions: `${targetWidth}x${targetHeight}`,
      aspectRatioChange: aspectRatio > originalAspectRatio ? 'más ancho' : 'más alto'
    })

    return NextResponse.json({
      success: true,
      fileName,
      imageUrl,
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
