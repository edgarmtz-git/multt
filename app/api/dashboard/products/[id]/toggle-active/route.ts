import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'CLIENT') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { id: productId } = await params
    const body = await request.json()
    const { isActive } = body

    // Verificar que el producto pertenece al usuario
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: session.user.id
      }
    })

    if (!product) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el estado activo (toggle si no se especifica, o usar el valor proporcionado)
    const newActiveState = isActive !== undefined ? isActive : !product.isActive
    
    const updatedProduct = await prisma.product.update({
      where: { 
        id: productId,
        userId: session.user.id  // ✅ SEGURIDAD: Verificar que pertenece al usuario
      },
      data: { isActive: newActiveState }
    })

    return NextResponse.json({
      message: 'Estado del producto actualizado',
      product: updatedProduct
    })
  } catch (error) {
    console.error('Error toggling product status:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}