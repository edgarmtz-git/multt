import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar que sea administrador
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    // Obtener usuarios del sistema
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        company: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
