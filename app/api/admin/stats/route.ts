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

    // Obtener estadísticas del sistema
    const [
      totalUsers,
      activeUsers,
      totalCompanies,
      activeCompanies
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { isActive: true }
      }),
      prisma.storeSettings.count(),
      prisma.storeSettings.count({
        where: { storeActive: true }
      })
    ])

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalCompanies,
      activeCompanies
    })

  } catch (error) {
    console.error('Error fetching system stats:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
