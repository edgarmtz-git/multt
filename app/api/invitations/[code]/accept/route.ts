import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST - Aceptar invitación y crear usuario
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { message: 'Contraseña es requerida' },
        { status: 400 }
      )
    }

    // Buscar la invitación
    const invitation = await prisma.invitation.findUnique({
      where: { code }
    })

    if (!invitation) {
      return NextResponse.json(
        { message: 'Invitación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la invitación esté pendiente
    if (invitation.status !== 'PENDING') {
      return NextResponse.json(
        { message: 'Esta invitación ya ha sido utilizada o cancelada' },
        { status: 400 }
      )
    }

    // Verificar que no haya expirado
    const now = new Date()
    if (now > invitation.expiresAt) {
      // Marcar como expirada
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      })
      
      return NextResponse.json(
        { message: 'Esta invitación ha expirado' },
        { status: 400 }
      )
    }

    // Verificar que el email no esté en uso
    const existingUser = await prisma.user.findFirst({
      where: { email: invitation.clientEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email ya está registrado' },
        { status: 400 }
      )
    }

    // Verificar que el slug no esté en uso en StoreSettings
    const existingStoreSlug = await prisma.storeSettings.findFirst({
      where: { storeSlug: invitation.slug }
    })

    if (existingStoreSlug) {
      return NextResponse.json(
        { message: 'Este slug ya está en uso. Contacta al administrador.' },
        { status: 400 }
      )
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario usando transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear el usuario
      const user = await tx.user.create({
        data: {
          email: invitation.clientEmail,
          name: invitation.clientName,
          password: hashedPassword,
          role: 'CLIENT',
          company: invitation.slug,
          isActive: true
        }
      })

      // Crear StoreSettings para el usuario
      await tx.storeSettings.create({
        data: {
          userId: user.id,
          storeName: invitation.clientName,
          storeSlug: invitation.slug,
          email: invitation.clientEmail,
          whatsappMainNumber: invitation.clientPhone || '',
          storeActive: true,
          country: 'Mexico',
          language: 'es',
          currency: 'MXN',
          distanceUnit: 'km',
          mapProvider: 'openstreetmap',
          taxRate: 0.0,
          taxMethod: 'included',
          deliveryEnabled: true,
          deliveryCalculationMethod: 'zones',
          pricePerKm: 10.0,
          minDeliveryFee: 30.0,
          maxDeliveryDistance: 10.0,
          enableBusinessHours: true,
          disableCheckoutOutsideHours: false,
          businessHours: {
            monday: { open: '09:00', close: '22:00', isOpen: true },
            tuesday: { open: '09:00', close: '22:00', isOpen: true },
            wednesday: { open: '09:00', close: '22:00', isOpen: true },
            thursday: { open: '09:00', close: '22:00', isOpen: true },
            friday: { open: '09:00', close: '23:00', isOpen: true },
            saturday: { open: '10:00', close: '23:00', isOpen: true },
            sunday: { open: '10:00', close: '21:00', isOpen: true }
          },
          paymentsEnabled: true,
          cashPaymentEnabled: true,
          cashPaymentInstructions: 'Pago en efectivo al recibir'
        }
      })

      // Marcar invitación como usada
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'USED',
          usedAt: new Date(),
          serviceStart: new Date(),
          serviceRenewal: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 año
          isActive: true
        }
      })

      return { user, updatedInvitation: await tx.invitation.findUnique({ where: { id: invitation.id } }) }
    })

    // 📧 Enviar emails de confirmación
    try {
      const { sendInvitationAcceptedClientEmail, sendInvitationAcceptedAdminEmail } = await import('@/lib/email/send-emails')

      // Email al cliente
      await sendInvitationAcceptedClientEmail({
        clientName: result.user.name,
        clientEmail: result.user.email,
        storeName: result.user.company || invitation.slug,
        storeSlug: invitation.slug
      })

      // Email al admin
      await sendInvitationAcceptedAdminEmail({
        clientName: result.user.name,
        clientEmail: result.user.email,
        storeName: result.user.company || invitation.slug,
        storeSlug: invitation.slug,
        activatedAt: new Date(),
        renewalDate: result.updatedInvitation?.serviceRenewal || new Date()
      })
    } catch (emailError) {
      console.error('Error enviando emails de confirmación:', emailError)
      // No bloquear la respuesta si falla el email
    }

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        company: result.user.company
      }
    })
  } catch (error) {
    console.error('❌ Error accepting invitation:', error)

    // Devolver el error específico en desarrollo
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Error details:', errorMessage)

    return NextResponse.json(
      {
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}
