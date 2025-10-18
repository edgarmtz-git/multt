import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener producto específico
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

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: session.user.id
      },
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
        options: {
          include: {
            choices: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        productGlobalOptions: {
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
        },
        images: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    console.log('🔍 Product API - productGlobalOptions:', product.productGlobalOptions)
    console.log('🔍 Product API - productGlobalOptions length:', product.productGlobalOptions?.length)

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar producto
export async function PUT(
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
      name, 
      description, 
      categoryId, 
      sku,
      weight,
      price, 
      originalPrice,
      imageUrl,
      isActive,
      type,
      deliveryMethods,
      variants,
      options,
      globalOptions,
      inventory,
      tags
    } = body

    // Validaciones básicas
    if (!name) {
      return NextResponse.json(
        { message: 'El nombre es requerido' },
        { status: 400 }
      )
    }

    // Solo validar categoría para productos nuevos (no al editar)
    if (!categoryId && categoryId !== 'no-category') {
      return NextResponse.json(
        { message: 'La categoría es requerida' },
        { status: 400 }
      )
    }

    if (!price || price <= 0) {
      return NextResponse.json(
        { message: 'El precio debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Verificar que el producto pertenece al usuario
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: session.user.id
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { message: 'Producto no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar el producto usando transacción
    const result = await prisma.$transaction(async (tx: any) => {
      // Actualizar el producto
      const updatedProduct = await tx.product.update({
        where: { 
          id: productId,
          userId: session.user.id  // ✅ SEGURIDAD: Verificar que pertenece al usuario
        },
        data: {
          name,
          description: description || '',
          price,
          isActive: isActive !== undefined ? isActive : existingProduct.isActive,
          allowPickup: deliveryMethods?.pickup !== undefined ? deliveryMethods.pickup : existingProduct.allowPickup,
          allowShipping: deliveryMethods?.shipping !== undefined ? deliveryMethods.shipping : existingProduct.allowShipping,
          // Sistema de inventario
          trackQuantity: inventory?.trackQuantity !== undefined ? inventory.trackQuantity : existingProduct.trackQuantity,
          stock: inventory?.stock !== undefined ? inventory.stock : existingProduct.stock,
          dailyCapacity: inventory?.dailyCapacity !== undefined ? inventory.dailyCapacity : existingProduct.dailyCapacity,
          maxDailySales: inventory?.maxDailySales !== undefined ? inventory.maxDailySales : existingProduct.maxDailySales,
          maxOrderQuantity: inventory?.maxOrderQuantity !== undefined ? inventory.maxOrderQuantity : existingProduct.maxOrderQuantity,
          maxQuantity: inventory?.maxQuantity !== undefined ? inventory.maxQuantity : existingProduct.maxQuantity,
          minOrderQuantity: inventory?.minOrderQuantity !== undefined ? inventory.minOrderQuantity : existingProduct.minOrderQuantity,
          minQuantity: inventory?.minQuantity !== undefined ? inventory.minQuantity : existingProduct.minQuantity
        }
      })

      // Actualizar categorías si se proporcionan
      if (categoryId !== undefined) {
        // Eliminar relaciones de categoría existentes
        await tx.categoryProduct.deleteMany({
          where: { productId }
        })

        // Crear nueva relación de categoría solo si no es 'no-category'
        if (categoryId && categoryId !== 'no-category') {
          await tx.categoryProduct.create({
            data: {
              productId,
              categoryId
            }
          })
        }
      }

      // Actualizar variantes si se proporcionan
      if (variants !== undefined) {
        // Eliminar variantes existentes
        await tx.productVariant.deleteMany({
          where: { productId }
        })

        // Crear nuevas variantes
        if (variants.length > 0) {
          const variantData = variants.map((variant: any) => ({
            name: variant.name,
            value: variant.sku || variant.name,
            price: variant.price,
            originalPrice: variant.originalPrice || null,
            imageUrl: variant.imageUrl || null,
            sku: variant.sku || null,
            stock: variant.stock || null,
            productId
          }))

          await tx.productVariant.createMany({
            data: variantData
          })
        }
      }

      // Actualizar opciones si se proporcionan
      if (options !== undefined) {
        // Eliminar opciones existentes (esto también eliminará las elecciones por cascada)
        await tx.productOption.deleteMany({
          where: { productId }
        })

        // Crear nuevas opciones
        if (options.length > 0) {
          for (let i = 0; i < options.length; i++) {
            const option = options[i]
            const createdOption = await tx.productOption.create({
              data: {
                name: option.name,
                type: option.type,
                isRequired: option.isRequired || false,
                enableQuantity: option.enableQuantity || false,
                order: i + 1,
                productId
              }
            })

            // Crear las elecciones de la opción si las tiene
            if (option.choices && option.choices.length > 0) {
              const choiceData = option.choices.map((choice: any, choiceIndex: number) => ({
                name: choice.name,
                price: choice.price || 0,
                order: choiceIndex + 1,
                optionId: createdOption.id
              }))

              await tx.productOptionChoice.createMany({
                data: choiceData
              })
            }
          }
        }
      }

      // Manejar opciones globales
      if (globalOptions !== undefined) {
        // Eliminar opciones globales existentes
        await tx.productGlobalOption.deleteMany({
          where: { productId }
        })

        // Crear nuevas opciones globales
        if (globalOptions.length > 0) {
          const productGlobalOptionData = globalOptions.map((globalOption: any, index: number) => ({
            productId,
            globalOptionId: globalOption.globalOptionId,
            maxSelections: globalOption.maxSelections || null,
            minSelections: globalOption.minSelections || null,
            isRequired: globalOption.isRequired || false,
            order: index + 1
          }))

          await tx.productGlobalOption.createMany({
            data: productGlobalOptionData
          })
        }
      }

      // Actualizar imagen principal si se proporciona
      if (imageUrl !== undefined) {
        // Eliminar imagen principal existente
        await tx.productImage.deleteMany({
          where: { 
            productId,
            isMain: true
          }
        })

        // Crear nueva imagen principal
        if (imageUrl) {
          await tx.productImage.create({
            data: {
              url: imageUrl,
              alt: `${name} - Imagen principal`,
              order: 0,
              isMain: true,
              productId
            }
          })
        }
      }

      // Obtener el producto actualizado con todas las relaciones
      const finalProduct = await tx.product.findUnique({
        where: { id: productId },
        include: {
          variants: {
            where: { isActive: true },
            orderBy: { name: 'asc' }
          },
          options: {
            include: {
              choices: {
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { order: 'asc' }
          },
          productGlobalOptions: {
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
          },
          images: {
            orderBy: { order: 'asc' }
          }
        }
      })

      return finalProduct
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor al actualizar producto' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar producto
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

    // Verificar que el producto pertenece al usuario
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

    // Eliminar el producto (esto también eliminará las variantes e imágenes por cascada)
    await prisma.product.delete({
      where: { 
        id: productId,
        userId: session.user.id  // ✅ SEGURIDAD: Verificar que pertenece al usuario
      }
    })

    return NextResponse.json({ message: 'Producto eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor al eliminar producto' },
      { status: 500 }
    )
  }
}