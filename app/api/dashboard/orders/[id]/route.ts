import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH - Actualizar estado de la orden
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session || !session.user?.id || session.user?.role !== 'CLIENT') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Validar que el estado sea válido
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'IN_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    // Verificar que la orden pertenece al usuario
    const order = await prisma.order.findUnique({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar el estado
    const updatedOrder = await prisma.order.update({
      where: {
        id: id
      },
      data: {
        status: status
      }
    })

    return NextResponse.json({
      success: true,
      order: updatedOrder
    })

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la orden' },
      { status: 500 }
    )
  }
}
