import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { valid: false, error: 'No session found' },
        { status: 401 }
      )
    }

    // Verificar que el usuario existe y está activo
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isSuspended: true,
        suspensionReason: true,
        suspendedAt: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { valid: false, error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { valid: false, error: 'User account is inactive' },
        { status: 403 }
      )
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'User account is suspended',
          suspensionReason: user.suspensionReason,
          suspendedAt: user.suspendedAt
        },
        { status: 403 }
      )
    }

    // Usuario válido
    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Error validating user:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
