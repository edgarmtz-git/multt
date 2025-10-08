import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Reactivar un cliente
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
      select: { id: true, name: true, email: true, role: true, isSuspended: true }
    })

    if (!client) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 })
    }

    if (client.role !== 'CLIENT') {
      return NextResponse.json({ message: 'Solo se pueden reactivar clientes' }, { status: 400 })
    }

    if (!client.isSuspended) {
      return NextResponse.json({ message: 'El cliente no está suspendido' }, { status: 400 })
    }

    // Reactivar el cliente
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isSuspended: false,
        suspensionReason: null,
        suspendedAt: null,
        isActive: true
      },
      include: {
        storeSettings: {
          select: {
            storeName: true,
            storeSlug: true
          }
        }
      }
    })

    // 📧 Enviar email de confirmación
    try {
      const { sendClientReactivatedEmail } = await import('@/lib/email/send-emails')

      const storeName = updatedUser.storeSettings?.storeName || updatedUser.company || 'Tu tienda'
      const storeSlug = updatedUser.storeSettings?.storeSlug || updatedUser.company || ''

      await sendClientReactivatedEmail({
        clientName: updatedUser.name,
        clientEmail: updatedUser.email,
        storeName,
        storeSlug,
        reactivatedAt: new Date()
      })
    } catch (emailError) {
      console.error('Error enviando email de reactivación:', emailError)
      // No bloquear la respuesta si falla el email
    }

    return NextResponse.json({
      message: 'Cliente reactivado exitosamente',
      client: {
        id: client.id,
        name: client.name,
        email: client.email
      }
    })
  } catch (error) {
    console.error('Error activating client:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor al reactivar cliente' },
      { status: 500 }
    )
  }
}
