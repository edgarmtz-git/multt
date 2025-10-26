import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache de 60 segundos
export const revalidate = 60

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cliente: string }> }
) {
  try {
    const { cliente } = await params
    
    // Buscar la tienda por slug o ID
    const storeSettings = await prisma.storeSettings.findFirst({
      where: {
        OR: [
          { storeSlug: cliente },
          { id: cliente }
        ],
        storeActive: true
      },
      select: { id: true, userId: true }
    })

    if (!storeSettings) {
      return NextResponse.json(
        { message: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    // Obtener categorías con productos
    const categories = await prisma.category.findMany({
      where: {
        userId: storeSettings.userId,
        isActive: true
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
                images: {
                  where: {
                    isMain: true
                  }
                },
                variants: {
                  where: {
                    isActive: true
                  }
                },
                options: {
                  include: {
                    choices: true
                  }
                },
                productGlobalOptions: {
                  include: {
                    globalOption: {
                      include: {
                        choices: {
                          include: {
                            availability: true
                          }
                        },
                        availability: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })

    // Transformar los datos para que coincidan con la estructura esperada
    const categoriesWithProducts = categories
      .filter((category: any) => category.categoryProducts.length > 0)
      .map((category: any) => ({
        ...category,
        products: category.categoryProducts.map((cp: any) => ({
          ...cp.product,
          imageUrl: cp.product.images?.[0]?.url || cp.product.imageUrl,
          category: {
            id: category.id,
            name: category.name
          },
          // Incluir opciones globales como opciones normales para el frontend
          // Filtrar opciones globales que estén disponibles
          globalOptions: cp.product.productGlobalOptions
            ?.filter((pgo: any) => {
              // Si la opción global no está disponible, no incluirla
              if (pgo.globalOption.availability && !pgo.globalOption.availability.isAvailable) {
                return false
              }
              return true
            })
            ?.map((pgo: any) => ({
              id: pgo.globalOption.id,
              name: pgo.globalOption.name,
              type: pgo.globalOption.type,
              isRequired: pgo.isRequired,
              maxSelections: pgo.maxSelections,
              minSelections: pgo.minSelections,
              // Filtrar solo las elecciones disponibles
              choices: pgo.globalOption.choices.filter((choice: any) => 
                !choice.availability || choice.availability.isAvailable
              )
            }))
            ?.filter((option: any) => option.choices.length > 0) || [] // Solo incluir opciones que tengan al menos una elección disponible
        }))
      }))

    // Headers de cache HTTP
    const response = NextResponse.json(categoriesWithProducts)
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')

    return response
  } catch (error) {
    console.error('Error loading categories:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
