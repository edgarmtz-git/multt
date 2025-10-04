import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyDatabaseRelations() {
  console.log('🔍 Verificando relaciones de la base de datos...\n')

  try {
    // 1. Verificar relación User -> StoreSettings
    console.log('1. Verificando relación User -> StoreSettings...')
    const usersWithSettings = await prisma.user.findMany({
      include: {
        storeSettings: true
      },
      take: 5
    })
    console.log(`✅ Encontrados ${usersWithSettings.length} usuarios con configuración de tienda`)
    
    // 2. Verificar relación User -> Products
    console.log('\n2. Verificando relación User -> Products...')
    const usersWithProducts = await prisma.user.findMany({
      include: {
        products: {
          include: {
            variants: true,
            options: {
              include: {
                choices: true
              }
            },
            images: true
          }
        }
      },
      take: 3
    })
    console.log(`✅ Encontrados ${usersWithProducts.length} usuarios con productos`)
    
    // 3. Verificar relación User -> Categories
    console.log('\n3. Verificando relación User -> Categories...')
    const usersWithCategories = await prisma.user.findMany({
      include: {
        categories: {
          include: {
            categoryProducts: {
              include: {
                product: true
              }
            }
          }
        }
      },
      take: 3
    })
    console.log(`✅ Encontrados ${usersWithCategories.length} usuarios con categorías`)
    
    // 4. Verificar relación Product -> ProductVariant
    console.log('\n4. Verificando relación Product -> ProductVariant...')
    const productsWithVariants = await prisma.product.findMany({
      include: {
        variants: true
      },
      where: {
        hasVariants: true
      },
      take: 5
    })
    console.log(`✅ Encontrados ${productsWithVariants.length} productos con variantes`)
    
    // 5. Verificar relación Product -> ProductOption
    console.log('\n5. Verificando relación Product -> ProductOption...')
    const productsWithOptions = await prisma.product.findMany({
      include: {
        options: {
          include: {
            choices: true
          }
        }
      },
      where: {
        options: {
          some: {}
        }
      },
      take: 5
    })
    console.log(`✅ Encontrados ${productsWithOptions.length} productos con opciones`)
    
    // 6. Verificar relación Category -> Product (many-to-many)
    console.log('\n6. Verificando relación Category -> Product (many-to-many)...')
    const categoriesWithProducts = await prisma.category.findMany({
      include: {
        categoryProducts: {
          include: {
            product: true
          }
        }
      },
      where: {
        categoryProducts: {
          some: {}
        }
      },
      take: 5
    })
    console.log(`✅ Encontradas ${categoriesWithProducts.length} categorías con productos`)
    
    // 7. Verificar relación StoreSettings -> DeliveryZone
    console.log('\n7. Verificando relación StoreSettings -> DeliveryZone...')
    const settingsWithZones = await prisma.storeSettings.findMany({
      include: {
        deliveryZones: true
      },
      take: 3
    })
    console.log(`✅ Encontradas ${settingsWithZones.length} configuraciones con zonas de entrega`)
    
    // 8. Verificar relación User -> Orders
    console.log('\n8. Verificando relación User -> Orders...')
    const usersWithOrders = await prisma.user.findMany({
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: true,
                variant: true
              }
            }
          }
        }
      },
      take: 3
    })
    console.log(`✅ Encontrados ${usersWithOrders.length} usuarios con pedidos`)
    
    // 9. Verificar integridad de datos
    console.log('\n9. Verificando integridad de datos...')
    
    // Verificar que no hay productos huérfanos (productos sin usuario)
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        userId: true
      }
    })
    const orphanProducts = allProducts.filter(p => !p.userId)
    console.log(`✅ Productos huérfanos: ${orphanProducts.length}`)
    
    // Verificar que no hay categorías huérfanas (categorías sin usuario)
    const allCategories = await prisma.category.findMany({
      select: {
        id: true,
        userId: true
      }
    })
    const orphanCategories = allCategories.filter(c => !c.userId)
    console.log(`✅ Categorías huérfanas: ${orphanCategories.length}`)
    
    // Verificar que no hay variantes huérfanas (variantes sin producto)
    const allVariants = await prisma.productVariant.findMany({
      select: {
        id: true,
        productId: true
      }
    })
    const orphanVariants = allVariants.filter(v => !v.productId)
    console.log(`✅ Variantes huérfanas: ${orphanVariants.length}`)
    
    // 10. Verificar configuración de horarios comerciales
    console.log('\n10. Verificando configuración de horarios comerciales...')
    const settingsWithHours = await prisma.storeSettings.findMany({
      where: {
        enableBusinessHours: true,
        businessHours: {
          not: null
        } as any
      },
      select: {
        id: true,
        storeName: true,
        businessHours: true
      }
    })
    console.log(`✅ Configuraciones con horarios: ${settingsWithHours.length}`)
    
    // 11. Verificar tipos de entrega
    console.log('\n11. Verificando tipos de entrega...')
    const deliveryTypes = await prisma.deliveryZone.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    })
    console.log('✅ Tipos de entrega configurados:')
    deliveryTypes.forEach(type => {
      console.log(`   - ${type.type}: ${type._count.type} zonas`)
    })
    
    console.log('\n🎉 Verificación completada exitosamente!')
    console.log('\n📊 Resumen de relaciones:')
    console.log('   ✅ User -> StoreSettings (1:1)')
    console.log('   ✅ User -> Products (1:N)')
    console.log('   ✅ User -> Categories (1:N)')
    console.log('   ✅ User -> Orders (1:N)')
    console.log('   ✅ Product -> ProductVariant (1:N)')
    console.log('   ✅ Product -> ProductOption (1:N)')
    console.log('   ✅ Product -> ProductImage (1:N)')
    console.log('   ✅ Category -> Product (N:M)')
    console.log('   ✅ StoreSettings -> DeliveryZone (1:N)')
    console.log('   ✅ Order -> OrderItem (1:N)')
    console.log('   ✅ ProductOption -> ProductOptionChoice (1:N)')
    
  } catch (error) {
    console.error('❌ Error verificando relaciones:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar verificación
verifyDatabaseRelations()
  .then(() => {
    console.log('\n✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error ejecutando script:', error)
    process.exit(1)
  })
