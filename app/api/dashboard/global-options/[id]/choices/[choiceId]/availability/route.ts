import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; choiceId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, choiceId } = await params
    const { isAvailable, reason } = await request.json()

    // Verificar que la opción global y la elección pertenecen al usuario
    const globalOption = await prisma.globalOption.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        choices: {
          where: { id: choiceId }
        }
      }
    })

    if (!globalOption || !globalOption.choices.length) {
      return NextResponse.json({ error: 'Choice not found' }, { status: 404 })
    }

    // Crear o actualizar la disponibilidad de la elección
    const availability = await prisma.globalOptionChoiceAvailability.upsert({
      where: { choiceId },
      update: {
        isAvailable,
        reason: reason || null,
        updatedAt: new Date()
      },
      create: {
        choiceId,
        isAvailable,
        reason: reason || null
      }
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Error updating choice availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
