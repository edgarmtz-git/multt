import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { randomBytes } from 'crypto'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener todas las invitaciones
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(invitations)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva invitación
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { clientName, clientEmail, clientPhone, slug, expiresInDays } = body

    // Validaciones
    if (!clientName || !clientEmail || !slug) {
      return NextResponse.json(
        { message: 'Nombre, email y slug son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el slug no esté en uso
    const existingSlug = await prisma.user.findFirst({
      where: { company: slug }
    })

    if (existingSlug) {
      return NextResponse.json(
        { message: 'El slug ya está en uso' },
        { status: 400 }
      )
    }

    // Verificar que el email no esté en uso
    const existingEmail = await prisma.user.findFirst({
      where: { email: clientEmail }
    })

    if (existingEmail) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Generar código único
    const code = randomBytes(12).toString('hex')
    
    // Calcular fecha de expiración
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (expiresInDays || 7))

    // Crear invitación
    const invitation = await prisma.invitation.create({
      data: {
        code,
        clientName,
        clientEmail,
        clientPhone,
        slug,
        expiresAt,
        createdBy: session.user.id,
        status: 'PENDING'
      }
    })

    // 📧 Enviar email de invitación
    try {
      const { sendInvitationEmail } = await import('@/lib/email/send-emails')
      await sendInvitationEmail({
        clientName,
        clientEmail,
        invitationCode: code,
        slug,
        expiresAt
      })
    } catch (emailError) {
      console.error('Error enviando email de invitación:', emailError)
      // No bloquear la respuesta si falla el email
    }

    return NextResponse.json(invitation)
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
