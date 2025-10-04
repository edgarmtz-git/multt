import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Activar un cliente suspendido
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar que el cliente existe
    const client = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!client) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 })
    }

    if (client.role !== 'CLIENT') {
      return NextResponse.json({ message: 'Solo se pueden activar clientes' }, { status: 400 })
    }

    // Activar el cliente (quitar suspensión)
    await prisma.user.update({
      where: { id },
      data: {
        isSuspended: false,
        suspensionReason: null,
        suspendedAt: null
      }
    })

    return NextResponse.json({ 
      message: 'Cliente activado exitosamente',
      client: {
        id: client.id,
        name: client.name,
        email: client.email
      }
    })
  } catch (error) {
    console.error('Error activating client:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor al activar cliente' },
      { status: 500 }
    )
  }
}
