import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Obtener productos del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'CLIENT') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    // Construir filtros de búsqueda
    const whereClause: any = {
      userId: session.user.id,
      categoryProducts: {
        some: {} // Solo productos que tienen al menos una categoría
      }
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { variants: { some: { name: { contains: search, mode: 'insensitive' } } } },
        { variants: { some: { value: { contains: search, mode: 'insensitive' } } } }
      ]
    }

    // Obtener total de productos para paginación
    const total = await prisma.product.count({
      where: whereClause
    })

    // Obtener productos con paginación
    const products = await prisma.product.findMany({
      where: whereClause,
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
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    // Transformar productos para incluir información adicional
    const transformedProducts = products.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images.find((img: any) => img.isMain)?.url || product.images[0]?.url,
      isActive: product.isActive,
      isNew: new Date(product.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Últimos 7 días
      sku: product.variants.length > 0 ? product.variants[0].value : undefined,
      variants: product.variants,
      categories: product.categoryProducts.map((cp: any) => cp.category),
      createdAt: product.createdAt
    }))

    return NextResponse.json({
      products: transformedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'CLIENT') {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

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
    if (!name || !categoryId) {
      return NextResponse.json(
        { message: 'Nombre y categoría son requeridos' },
        { status: 400 }
      )
    }

    if (!price || price <= 0) {
      return NextResponse.json(
        { message: 'El precio debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Crear producto usando transacción
    const result = await prisma.$transaction(async (tx: any) => {
      // Crear el producto
      const product = await tx.product.create({
        data: {
          name,
          description: description || '',
          price,
          isActive: isActive !== undefined ? isActive : true,
          allowPickup: deliveryMethods?.pickup !== undefined ? deliveryMethods.pickup : true,
          allowShipping: deliveryMethods?.shipping !== undefined ? deliveryMethods.shipping : true,
          // Sistema de inventario
          trackQuantity: inventory?.trackQuantity || false,
          stock: inventory?.stock || 0,
          dailyCapacity: inventory?.dailyCapacity || false,
          maxDailySales: inventory?.maxDailySales || null,
          maxOrderQuantity: inventory?.maxOrderQuantity || false,
          maxQuantity: inventory?.maxQuantity || null,
          minOrderQuantity: inventory?.minOrderQuantity || false,
          minQuantity: inventory?.minQuantity || null,
          userId: session.user.id
        }
      })

      // Crear relación con categoría
      if (categoryId) {
        await tx.categoryProduct.create({
          data: {
            productId: product.id,
            categoryId
          }
        })
      }

      // Si tiene variantes, crearlas
      if (variants && variants.length > 0) {
        const variantData = variants.map((variant: any) => ({
          name: variant.name,
          value: variant.sku || variant.name, // Usar SKU como value o el nombre
          price: variant.price,
          originalPrice: variant.originalPrice || null,
          imageUrl: variant.imageUrl || null,
          sku: variant.sku || null,
          stock: variant.stock || null,
          productId: product.id
        }))

        await tx.productVariant.createMany({
          data: variantData
        })
      }

      // Si tiene opciones, crearlas
      if (options && options.length > 0) {
        for (let i = 0; i < options.length; i++) {
          const option = options[i]
          const createdOption = await tx.productOption.create({
            data: {
              name: option.name,
              type: option.type,
              isRequired: option.isRequired || false,
              enableQuantity: option.enableQuantity || false,
              order: i + 1,
              productId: product.id
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

      // Si tiene opciones globales, asignarlas
      if (globalOptions && globalOptions.length > 0) {
        const productGlobalOptionData = globalOptions.map((globalOption: any, index: number) => ({
          productId: product.id,
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

      // Crear imagen principal si se proporciona
      if (imageUrl) {
        await tx.productImage.create({
          data: {
            url: imageUrl,
            alt: `${name} - Imagen principal`,
            order: 0,
            isMain: true,
            productId: product.id
          }
        })
      }

      // Obtener las variantes, opciones e imágenes creadas
      const createdVariants = await tx.productVariant.findMany({
        where: { productId: product.id }
      })

      const createdOptions = await tx.productOption.findMany({
        where: { productId: product.id },
        include: {
          choices: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      })

      const createdImages = await tx.productImage.findMany({
        where: { productId: product.id },
        orderBy: { order: 'asc' }
      })

      return {
        ...product,
        variants: createdVariants,
        options: createdOptions,
        images: createdImages
      }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor al crear producto' },
      { status: 500 }
    )
  }
}
