import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Este endpoint solo debe ser llamado UNA VEZ para inicializar la base de datos
export async function POST(request: NextRequest) {
  try {
    // Verificar que no haya usuarios ya creados
    const existingUsers = await prisma.user.count()

    if (existingUsers > 0) {
      return NextResponse.json({
        error: 'Database already seeded. Users exist.',
        count: existingUsers
      }, { status: 400 })
    }

    // Crear usuario admin
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.create({
      data: {
        email: 'admin@sistema.com',
        password: adminPassword,
        name: 'Administrador',
        role: 'ADMIN',
        isActive: true
      }
    })

    // Crear usuario cliente
    const clientPassword = await bcrypt.hash('cliente123', 12)
    const client = await prisma.user.create({
      data: {
        email: 'cliente@empresa.com',
        password: clientPassword,
        name: 'La Casa del Sabor',
        company: 'La Casa del Sabor',
        role: 'CLIENT',
        isActive: true
      }
    })

    // Crear configuración de tienda para el cliente
    const store = await prisma.storeSettings.create({
      data: {
        userId: client.id,
        storeName: 'La Casa del Sabor',
        storeSlug: 'lacasadelsabor',
        storeActive: true,
        country: 'Mexico',
        language: 'es',
        currency: 'MXN',
        distanceUnit: 'km',
        whatsappMainNumber: '+525512345678',
        cashPaymentEnabled: true,
        deliveryEnabled: true,
        paymentsEnabled: true,
        enableBusinessHours: false,
        deliveryCalculationMethod: 'manual',
        manualDeliveryMessage: 'Contacta con nosotros para calcular el costo de envío'
      }
    })

    // Crear UNA categoría de ejemplo
    const category = await prisma.category.create({
      data: {
        userId: client.id,
        name: 'Pizzas',
        description: 'Nuestras deliciosas pizzas artesanales',
        isActive: true,
        isVisibleInStore: true,
        order: 1,
        color: '#FF6B6B'
      }
    })

    // Crear UN producto con variante y opción
    const product = await prisma.product.create({
      data: {
        userId: client.id,
        name: 'Pizza Margarita',
        description: 'Pizza clásica con tomate, mozzarella y albahaca fresca',
        price: 150.00,
        stock: 50,
        isActive: true,
        hasVariants: true,
        variantType: 'size',
        variantLabel: 'Tamaño',
        trackQuantity: false,
        allowPickup: true,
        allowShipping: true,
        categoryProducts: {
          create: {
            categoryId: category.id,
            order: 1
          }
        },
        // Crear 1 variante (Tamaño)
        variants: {
          create: [
            {
              name: 'Tamaño',
              value: 'Chica',
              price: 120.00,
              isActive: true
            },
            {
              name: 'Tamaño',
              value: 'Mediana',
              price: 150.00,
              isActive: true
            },
            {
              name: 'Tamaño',
              value: 'Grande',
              price: 180.00,
              isActive: true
            }
          ]
        },
        // Crear 1 opción (Ingredientes extras)
        options: {
          create: {
            name: 'Ingredientes extras',
            required: false,
            maxSelections: 3,
            choices: {
              create: [
                {
                  name: 'Extra queso',
                  price: 20.00,
                  isActive: true,
                  order: 1
                },
                {
                  name: 'Pepperoni',
                  price: 25.00,
                  isActive: true,
                  order: 2
                },
                {
                  name: 'Champiñones',
                  price: 15.00,
                  isActive: true,
                  order: 3
                },
                {
                  name: 'Aceitunas',
                  price: 15.00,
                  isActive: true,
                  order: 4
                }
              ]
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        admin: {
          email: admin.email,
          password: 'admin123'
        },
        client: {
          email: client.email,
          password: 'cliente123',
          storeName: store.storeName,
          storeSlug: store.storeSlug,
          storeUrl: `/tienda/${store.storeSlug}`
        },
        category: {
          name: category.name,
          id: category.id
        },
        product: {
          name: product.name,
          id: product.id,
          hasVariants: true,
          variantsCount: 3,
          hasOptions: true,
          optionsCount: 1,
          optionChoicesCount: 4
        }
      }
    })

  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({
      error: 'Failed to seed database',
      details: error.message
    }, { status: 500 })
  }
}

// GET para verificar el estado
export async function GET() {
  try {
    const userCount = await prisma.user.count()
    const storeCount = await prisma.storeSettings.count()
    const productCount = await prisma.product.count()

    return NextResponse.json({
      seeded: userCount > 0,
      stats: {
        users: userCount,
        stores: storeCount,
        products: productCount
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to check database status',
      details: error.message
    }, { status: 500 })
  }
}
