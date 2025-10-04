import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener opciones globales asignadas a un producto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'CLIENT') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { id: productId } = await params

    // Verificar que el producto existe y pertenece al usuario
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: session.user.id
      }
    })

    if (!product) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Obtener opciones globales asignadas al producto
    const productGlobalOptions = await prisma.productGlobalOption.findMany({
      where: { productId },
      include: {
        globalOption: {
          include: {
            choices: {
              orderBy: { order: 'asc' }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(productGlobalOptions)
  } catch (error) {
    console.error('Error fetching product global options:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Asignar opción global a producto
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'CLIENT') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { id: productId } = await params
    const body = await request.json()
    const {
      globalOptionId,
      maxSelections,
      minSelections,
      isRequired
    } = body

    // Verificar que el producto existe y pertenece al usuario
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: session.user.id
      }
    })

    if (!product) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que la opción global existe y pertenece al usuario
    const globalOption = await prisma.globalOption.findFirst({
      where: {
        id: globalOptionId,
        userId: session.user.id
      }
    })

    if (!globalOption) {
      return NextResponse.json(
        { message: 'Opción global no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que no esté ya asignada
    const existingAssignment = await prisma.productGlobalOption.findUnique({
      where: {
        productId_globalOptionId: {
          productId,
          globalOptionId
        }
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { message: 'Esta opción global ya está asignada al producto' },
        { status: 400 }
      )
    }

    // Asignar la opción global al producto
    const productGlobalOption = await prisma.productGlobalOption.create({
      data: {
        productId,
        globalOptionId,
        maxSelections,
        minSelections,
        isRequired: isRequired || false
      },
      include: {
        globalOption: {
          include: {
            choices: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Opción global asignada correctamente',
      productGlobalOption
    })
  } catch (error) {
    console.error('Error assigning global option to product:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Desasignar opción global de producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'CLIENT') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { id: productId } = await params
    const { searchParams } = new URL(request.url)
    const globalOptionId = searchParams.get('globalOptionId')

    if (!globalOptionId) {
      return NextResponse.json(
        { message: 'ID de opción global requerido' },
        { status: 400 }
      )
    }

    // Verificar que la asignación existe
    const productGlobalOption = await prisma.productGlobalOption.findUnique({
      where: {
        productId_globalOptionId: {
          productId,
          globalOptionId
        }
      }
    })

    if (!productGlobalOption) {
      return NextResponse.json(
        { message: 'Asignación no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar la asignación
    await prisma.productGlobalOption.delete({
      where: {
        productId_globalOptionId: {
          productId,
          globalOptionId
        }
      }
    })

    return NextResponse.json({
      message: 'Opción global desasignada correctamente'
    })
  } catch (error) {
    console.error('Error removing global option from product:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
