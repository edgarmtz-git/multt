import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const globalOption = await prisma.globalOption.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        availability: true,
        choices: {
          include: {
            availability: true
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!globalOption) {
      return NextResponse.json({ error: 'Global option not found' }, { status: 404 })
    }

    return NextResponse.json(globalOption)
  } catch (error) {
    console.error('Error fetching global option availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isAvailable, reason } = await request.json()

    // Verificar que la opción global pertenece al usuario
    const globalOption = await prisma.globalOption.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!globalOption) {
      return NextResponse.json({ error: 'Global option not found' }, { status: 404 })
    }

    // Crear o actualizar la disponibilidad
    const availability = await prisma.globalOptionAvailability.upsert({
      where: { globalOptionId: params.id },
      update: {
        isAvailable,
        reason: reason || null,
        updatedAt: new Date()
      },
      create: {
        globalOptionId: params.id,
        isAvailable,
        reason: reason || null
      }
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Error updating global option availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
