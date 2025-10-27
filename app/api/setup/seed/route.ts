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

    // Crear algunas categorías de ejemplo
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          userId: client.id,
          name: 'Platillos principales',
          description: 'Nuestros mejores platillos',
          isActive: true,
          isVisibleInStore: true,
          order: 1
        }
      }),
      prisma.category.create({
        data: {
          userId: client.id,
          name: 'Bebidas',
          description: 'Bebidas refrescantes',
          isActive: true,
          isVisibleInStore: true,
          order: 2
        }
      }),
      prisma.category.create({
        data: {
          userId: client.id,
          name: 'Postres',
          description: 'Deliciosos postres',
          isActive: true,
          isVisibleInStore: true,
          order: 3
        }
      })
    ])

    // Crear algunos productos de ejemplo
    const products = await Promise.all([
      prisma.product.create({
        data: {
          userId: client.id,
          name: 'Tacos al Pastor',
          description: 'Deliciosos tacos con carne al pastor',
          price: 45.00,
          stock: 100,
          isActive: true,
          trackQuantity: false,
          allowPickup: true,
          allowShipping: true,
          categoryProducts: {
            create: {
              categoryId: categories[0].id,
              order: 1
            }
          }
        }
      }),
      prisma.product.create({
        data: {
          userId: client.id,
          name: 'Agua de Horchata',
          description: 'Refrescante agua de horchata',
          price: 25.00,
          stock: 50,
          isActive: true,
          trackQuantity: false,
          allowPickup: true,
          allowShipping: true,
          categoryProducts: {
            create: {
              categoryId: categories[1].id,
              order: 1
            }
          }
        }
      })
    ])

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
        categoriesCreated: categories.length,
        productsCreated: products.length
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
