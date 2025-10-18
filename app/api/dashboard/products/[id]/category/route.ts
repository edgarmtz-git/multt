import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH /api/dashboard/products/[id]/category - Cambiar categoría de producto
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { categoryId } = body

    // Verificar que el producto existe y pertenece al usuario
    const product = await prisma.product.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    // Si se proporciona categoryId, verificar que la categoría existe y pertenece al usuario
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          userId: session.user.id,
          isActive: true
        }
      })

      if (!category) {
        return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
      }
    }

    // Actualizar las categorías del producto usando transacción
    const updatedProduct = await prisma.$transaction(async (tx: any) => {
      // Eliminar todas las relaciones existentes
      await tx.categoryProduct.deleteMany({
        where: { productId: id }
      })

      // Si se proporciona categoryId, crear la nueva relación
      if (categoryId) {
        await tx.categoryProduct.create({
          data: {
            categoryId,
            productId: id,
            order: 0
          }
        })
      }

      // Obtener el producto actualizado con sus categorías
      return await tx.product.findUnique({
        where: { id },
        include: {
          categoryProducts: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                  icon: true
                }
              }
            },
            orderBy: { order: 'asc' }
          },
          variants: {
            where: { isActive: true },
            orderBy: { name: 'asc' }
          },
          images: {
            orderBy: { order: 'asc' }
          }
        }
      })
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error al cambiar categoría del producto:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
