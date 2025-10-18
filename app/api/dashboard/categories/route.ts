import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/dashboard/categories - Obtener todas las categorías del usuario
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      where: { 
        userId: session.user.id
      },
      include: {
        categoryProducts: {
          where: {
            product: { isActive: true }
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true
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
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST /api/dashboard/categories - Crear nueva categoría
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, isActive, isVisibleInStore, imageUrl, products } = body

    // Validaciones
    if (!name?.trim()) {
      return NextResponse.json(
        { error: "El nombre de la categoría es requerido" },
        { status: 400 }
      )
    }

    // Verificar que no exista una categoría con el mismo nombre
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
        name: name.trim()
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: "Ya existe una categoría con este nombre" },
        { status: 400 }
      )
    }

    // Obtener el siguiente orden
    const lastCategory = await prisma.category.findFirst({
      where: { userId: session.user.id },
      orderBy: { order: 'desc' }
    })

    const nextOrder = lastCategory ? lastCategory.order + 1 : 0

    // Crear categoría usando transacción para manejar productos
    const result = await prisma.$transaction(async (tx: any) => {
      // Crear la categoría
      const category = await tx.category.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          color: "#3B82F6", // Color fijo azul
          icon: "📁", // Icono fijo
          order: nextOrder,
          isActive: isActive ?? true,
          isVisibleInStore: isVisibleInStore ?? false,
          imageUrl: imageUrl || null,
          userId: session.user.id
        }
      })

      // Si se proporciona el array de productos, crear las relaciones many-to-many
      if (products && Array.isArray(products) && products.length > 0) {
        await tx.categoryProduct.createMany({
          data: products.map((product: any, index: number) => ({
            categoryId: category.id,
            productId: product.id,
            order: index + 1
          }))
        })
      }

      // Obtener la categoría con sus productos
      return await tx.category.findUnique({
        where: { id: category.id },
        include: {
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
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error al crear categoría:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
