import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  console.log('🔍 Validating email API called')
  
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  console.log('📧 Email to validate:', email)

  if (!email) {
    return NextResponse.json({ message: 'Email es requerido' }, { status: 400 })
  }

  try {
    // Validación básica de formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format')
      return NextResponse.json({ message: 'Formato de email inválido' }, { status: 400 })
    }

    // Verificar si el email ya está en uso por un usuario
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true }
    })

    if (existingUser) {
      console.log('❌ Email already exists in users')
      return NextResponse.json({ 
        message: 'Este email ya está registrado en el sistema' 
      }, { status: 409 })
    }

    // Verificar si el email ya está en uso por una invitación pendiente
    const existingInvitation = await prisma.invitation.findFirst({
      where: { 
        clientEmail: email,
        status: 'PENDING'
      },
      select: { id: true, clientName: true }
    })

    if (existingInvitation) {
      console.log('❌ Email already exists in pending invitations')
      return NextResponse.json({ 
        message: 'Ya existe una invitación pendiente para este email' 
      }, { status: 409 })
    }

    console.log('✅ Email is available')
    return NextResponse.json({ message: 'Email disponible' }, { status: 200 })
  } catch (error) {
    console.error('❌ Error validating email:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor al validar email' },
      { status: 500 }
    )
  }
}
