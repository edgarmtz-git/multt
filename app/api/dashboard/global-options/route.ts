import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener opciones globales del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const globalOptions = await prisma.globalOption.findMany({
      where: { userId: session.user.id },
      include: {
        choices: {
          include: {
            availability: true
          },
          orderBy: { order: 'asc' }
        },
        availability: true
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(globalOptions)
  } catch (error) {
    console.error('Error fetching global options:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva opción global
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      type,
      description,
      maxSelections,
      minSelections,
      isRequired,
      choices
    } = body

    // Validaciones
    if (!name || !type) {
      return NextResponse.json(
        { message: 'Nombre y tipo son requeridos' },
        { status: 400 }
      )
    }

    // Validar límites para opciones checkbox
    if (type === 'checkbox') {
      if (maxSelections && minSelections && maxSelections < minSelections) {
        return NextResponse.json(
          { message: 'El máximo de selecciones debe ser mayor o igual al mínimo' },
          { status: 400 }
        )
      }
    }

    // Crear opción global usando transacción
    const result = await prisma.$transaction(async (tx: any) => {
      // Crear la opción global
      const globalOption = await tx.globalOption.create({
        data: {
          name,
          type,
          description,
          maxSelections,
          minSelections,
          isRequired: isRequired || false,
          userId: session.user.id
        }
      })

      // Crear las elecciones si las tiene
      if (choices && choices.length > 0) {
        const choiceData = choices.map((choice: any, index: number) => ({
          name: choice.name,
          price: choice.price || 0,
          order: index + 1,
          globalOptionId: globalOption.id
        }))

        await tx.globalOptionChoice.createMany({
          data: choiceData
        })
      }

      // Obtener la opción creada con sus elecciones y disponibilidad
      return await tx.globalOption.findUnique({
        where: { id: globalOption.id },
        include: {
          choices: {
            include: {
              availability: true
            },
            orderBy: { order: 'asc' }
          },
          availability: true
        }
      })
    })

    return NextResponse.json({
      message: 'Opción global creada correctamente',
      globalOption: result
    })
  } catch (error) {
    console.error('Error creating global option:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
