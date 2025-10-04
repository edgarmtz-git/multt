import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'CLIENT') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { categories } = body

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    // Actualizar el orden de las categorías
    const updatePromises = categories.map((category: { id: string; order: number }) =>
      prisma.category.update({
        where: {
          id: category.id,
          userId: session.user.id, // Asegurar que solo se actualicen las categorías del usuario
        },
        data: {
          order: category.order,
        },
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al reordenar categorías:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}