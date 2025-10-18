import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/dashboard/categories/[id] - Obtener categoría específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const category = await prisma.category.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        categoryProducts: {
          where: {
            product: {
              isActive: true
            }
          },
          include: {
            product: {
              include: {
                variants: {
                  where: { isActive: true },
                  orderBy: { name: 'asc' }
                },
                images: {
                  orderBy: { order: 'asc' }
                }
              }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            categoryProducts: {
              where: {
                product: { isActive: true }
              }
            }
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    // Transformar los datos para que sean compatibles con el formulario
    const transformedCategory = {
      ...category,
      products: category.categoryProducts?.map((cp: any) => cp.product) || [],
      _count: {
        products: category._count?.categoryProducts || 0
      }
    }

    return NextResponse.json(transformedCategory)
  } catch (error) {
    console.error("Error al obtener categoría:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PUT /api/dashboard/categories/[id] - Actualizar categoría
export async function PUT(
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
    const { name, description, color, icon, isActive, imageUrl, isVisibleInStore, products } = body

    // Verificar que la categoría existe y pertenece al usuario
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    // Validaciones
    if (name && !name.trim()) {
      return NextResponse.json(
        { error: "El nombre de la categoría es requerido" },
        { status: 400 }
      )
    }

    // Verificar que no exista otra categoría con el mismo nombre
    if (name && name.trim() !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          userId: session.user.id,
          name: name.trim(),
          isActive: true,
          id: { not: id }
        }
      })

      if (duplicateCategory) {
        return NextResponse.json(
          { error: "Ya existe una categoría con este nombre" },
          { status: 400 }
        )
      }
    }

    // Actualizar categoría usando transacción para manejar productos
    const updatedCategory = await prisma.$transaction(async (tx: any) => {
      // Actualizar datos básicos de la categoría
      const category = await tx.category.update({
        where: { 
          id,
          userId: session.user.id  // ✅ SEGURIDAD: Verificar que pertenece al usuario
        },
        data: {
          ...(name && { name: name.trim() }),
          ...(description !== undefined && { description: description?.trim() || null }),
          ...(color && { color }),
          ...(icon !== undefined && { icon: icon || null }),
          ...(isActive !== undefined && { isActive }),
          ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
          ...(isVisibleInStore !== undefined && { isVisibleInStore })
        }
      })

      // Si se proporciona el array de productos, actualizar las relaciones many-to-many
      if (products !== undefined) {
        // Primero, eliminar todas las relaciones existentes en CategoryProduct
        await tx.categoryProduct.deleteMany({
          where: { categoryId: id }
        })

        // Luego, crear las nuevas relaciones
        if (products.length > 0) {
          await tx.categoryProduct.createMany({
            data: products.map((product: any, index: number) => ({
              categoryId: id,
              productId: product.id,
              order: index + 1
            }))
          })
        }
      }

      // Obtener la categoría actualizada con sus productos a través de la relación many-to-many
      const categoryWithProducts = await tx.category.findUnique({
        where: { id },
        include: {
          categoryProducts: {
            include: {
              product: {
                include: {
                  variants: {
                    where: { isActive: true },
                    orderBy: { name: 'asc' }
                  },
                  images: {
                    orderBy: { order: 'asc' }
                  }
                }
              }
            },
            orderBy: { order: 'asc' }
          },
          _count: {
            select: {
              categoryProducts: {
                where: {
                  product: { isActive: true }
                }
              }
            }
          }
        }
      })

      // Transformar los datos para que sean compatibles con el formulario
      return {
        ...categoryWithProducts,
        products: categoryWithProducts?.categoryProducts?.map((cp: any) => cp.product) || [],
        _count: {
          products: categoryWithProducts?._count?.categoryProducts || 0
        }
      }
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Error al actualizar categoría:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE /api/dashboard/categories/[id] - Eliminar categoría
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    
    // Verificar que la categoría existe y pertenece al usuario
    const existingCategory = await prisma.category.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        _count: {
          select: {
            categoryProducts: true
          }
        }
      }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 })
    }

    // Verificar si tiene productos asociados
    if (existingCategory._count.categoryProducts > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar una categoría que tiene productos asociados" },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { 
        id,
        userId: session.user.id  // ✅ SEGURIDAD: Verificar que pertenece al usuario
      }
    })

    return NextResponse.json({ message: "Categoría eliminada exitosamente" })
  } catch (error) {
    console.error("Error al eliminar categoría:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
