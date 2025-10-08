import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Suspender un cliente
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
    const body = await request.json()
    const { reason } = body

    // Verificar que el cliente existe
    const client = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true }
    })

    if (!client) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 })
    }

    if (client.role !== 'CLIENT') {
      return NextResponse.json({ message: 'Solo se pueden suspender clientes' }, { status: 400 })
    }

    // Suspender el cliente
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isSuspended: true,
        suspensionReason: reason || 'Pago pendiente - renovación vencida',
        suspendedAt: new Date()
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

    // 📧 Enviar emails de notificación
    try {
      const { sendClientSuspendedEmail, sendClientSuspendedAdminEmail } = await import('@/lib/email/send-emails')

      const storeName = updatedUser.storeSettings?.storeName || updatedUser.company || 'Tu tienda'
      const storeSlug = updatedUser.storeSettings?.storeSlug || updatedUser.company || ''
      const suspensionReason = updatedUser.suspensionReason || 'Suspensión administrativa'

      // Email al cliente
      await sendClientSuspendedEmail({
        clientName: updatedUser.name,
        clientEmail: updatedUser.email,
        storeName,
        suspensionReason,
        suspendedAt: updatedUser.suspendedAt || new Date()
      })

      // Email al admin
      await sendClientSuspendedAdminEmail({
        clientName: updatedUser.name,
        clientEmail: updatedUser.email,
        storeName,
        storeSlug,
        suspensionReason,
        suspendedAt: updatedUser.suspendedAt || new Date(),
        suspendedBy: session.user.name || session.user.email
      })
    } catch (emailError) {
      console.error('Error enviando emails de suspensión:', emailError)
      // No bloquear la respuesta si falla el email
    }

    return NextResponse.json({
      message: 'Cliente suspendido exitosamente',
      client: {
        id: client.id,
        name: client.name,
        email: client.email
      }
    })
  } catch (error) {
    console.error('Error suspending client:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor al suspender cliente' },
      { status: 500 }
    )
  }
}
