import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener opción global específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'CLIENT') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const globalOption = await prisma.globalOption.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        choices: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!globalOption) {
      return NextResponse.json(
        { message: 'Opción global no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(globalOption)
  } catch (error) {
    console.error('Error fetching global option:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar opción global
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'CLIENT') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      name,
      type,
      description,
      maxSelections,
      minSelections,
      isRequired,
      isActive,
      choices
    } = body

    // Verificar que la opción existe y pertenece al usuario
    const existingOption = await prisma.globalOption.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingOption) {
      return NextResponse.json(
        { message: 'Opción global no encontrada' },
        { status: 404 }
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

    // Actualizar usando transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar la opción global
      const updatedOption = await tx.globalOption.update({
        where: { id },
        data: {
          name,
          type,
          description,
          maxSelections,
          minSelections,
          isRequired,
          isActive
        }
      })

      // Actualizar elecciones si se proporcionan
      if (choices !== undefined) {
        // Eliminar elecciones existentes
        await tx.globalOptionChoice.deleteMany({
          where: { globalOptionId: id }
        })

        // Crear nuevas elecciones
        if (choices.length > 0) {
          const choiceData = choices.map((choice: any, index: number) => ({
            name: choice.name,
            price: choice.price || 0,
            order: index + 1,
            globalOptionId: id
          }))

          await tx.globalOptionChoice.createMany({
            data: choiceData
          })
        }
      }

      // Obtener la opción actualizada con sus elecciones
      return await tx.globalOption.findUnique({
        where: { id },
        include: {
          choices: {
            orderBy: { order: 'asc' }
          }
        }
      })
    })

    return NextResponse.json({
      message: 'Opción global actualizada correctamente',
      globalOption: result
    })
  } catch (error) {
    console.error('Error updating global option:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar opción global
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'CLIENT') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Verificar que la opción existe y pertenece al usuario
    const existingOption = await prisma.globalOption.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingOption) {
      return NextResponse.json(
        { message: 'Opción global no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si está siendo usada por algún producto
    const productUsage = await prisma.productGlobalOption.findFirst({
      where: { globalOptionId: id }
    })

    if (productUsage) {
      return NextResponse.json(
        { message: 'No se puede eliminar la opción porque está siendo usada por uno o más productos' },
        { status: 400 }
      )
    }

    // Eliminar la opción (las elecciones se eliminan por cascada)
    await prisma.globalOption.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Opción global eliminada correctamente'
    })
  } catch (error) {
    console.error('Error deleting global option:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
