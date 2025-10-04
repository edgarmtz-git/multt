import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener zona de entrega específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const deliveryZone = await prisma.deliveryZone.findFirst({
      where: {
        id,
        storeSettings: {
          userId: session.user.id
        }
      }
    })

    if (!deliveryZone) {
      return NextResponse.json(
        { error: 'Zona de entrega no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      deliveryZone: {
        ...deliveryZone,
      }
    })
  } catch (error) {
    console.error('Error al obtener zona de entrega:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar zona de entrega
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      name,
      type,
      isActive,
      order,
      fixedPrice,
      freeDeliveryThreshold,
      estimatedTime,
      description
    } = body

    // Verificar que la zona pertenece al usuario
    const existingZone = await prisma.deliveryZone.findFirst({
      where: {
        id,
        storeSettings: {
          userId: session.user.id
        }
      }
    })

    if (!existingZone) {
      return NextResponse.json(
        { error: 'Zona de entrega no encontrada' },
        { status: 404 }
      )
    }

    // Validar datos requeridos
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nombre y tipo son obligatorios' },
        { status: 400 }
      )
    }


    // Actualizar la zona de entrega
    const deliveryZone = await prisma.deliveryZone.update({
      where: { 
        id
      },
      data: {
        name,
        type,
        isActive: isActive ?? true,
        order: order ?? 0,
        fixedPrice: fixedPrice ?? null,
        freeDeliveryThreshold: freeDeliveryThreshold ?? null,
        estimatedTime: estimatedTime ?? null,
        description: description ?? null
      }
    })

    return NextResponse.json({
      deliveryZone: {
        ...deliveryZone,
      }
    })
  } catch (error) {
    console.error('Error al actualizar zona de entrega:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar zona de entrega
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    // Verificar que la zona pertenece al usuario
    const existingZone = await prisma.deliveryZone.findFirst({
      where: {
        id,
        storeSettings: {
          userId: session.user.id
        }
      }
    })

    if (!existingZone) {
      return NextResponse.json(
        { error: 'Zona de entrega no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar la zona de entrega
    await prisma.deliveryZone.delete({
      where: { 
        id
      }
    })

    return NextResponse.json({ message: 'Zona de entrega eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar zona de entrega:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
