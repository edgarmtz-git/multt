import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    // Obtener datos del cuerpo
    const { type } = await request.json()

    if (!type || !['banner', 'profile'].includes(type)) {
      return NextResponse.json({ message: 'Tipo de imagen inválido' }, { status: 400 })
    }

    // Obtener configuración actual
    const storeSettings = await prisma.storeSettings.findFirst({
      where: { userId: session.user.id }
    })

    if (!storeSettings) {
      return NextResponse.json({ message: 'Configuración no encontrada' }, { status: 404 })
    }

    // Obtener URL de la imagen a eliminar
    const imageUrl = type === 'banner' ? storeSettings.bannerImage : storeSettings.profileImage

    if (imageUrl) {
      try {
        // Eliminar archivo del sistema de archivos
        const fileName = imageUrl.split('/').pop()
        if (fileName) {
          const filePath = join(process.cwd(), 'public', 'uploads', 'store-images', fileName)
          await unlink(filePath)
          console.log('✅ File deleted:', filePath)
        }
      } catch (fileError) {
        console.warn('⚠️ Could not delete file:', fileError)
        // Continuar aunque no se pueda eliminar el archivo
      }
    }

    // Actualizar en la base de datos
    const updateData = type === 'banner' 
      ? { bannerImage: null }
      : { profileImage: null }

    await prisma.storeSettings.update({
      where: { userId: session.user.id },
      data: updateData
    })

    console.log('✅ Image deleted from database:', {
      type,
      userId: session.user.id
    })

    return NextResponse.json({ 
      success: true, 
      message: `${type === 'banner' ? 'Banner' : 'Foto de perfil'} eliminada correctamente`
    })

  } catch (error) {
    console.error('❌ Error deleting image:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}













