import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateCategoryRelations() {
  try {
    console.log('🔄 Iniciando migración de relaciones de categorías...')

    // 1. Obtener todos los productos que tienen categoryId
    const productsWithCategory = await prisma.product.findMany({
      include: {
        categoryProducts: {
          include: {
            category: true
          }
        }
      }
    })

    console.log(`📦 Encontrados ${productsWithCategory.length} productos con categoría directa`)

    // 2. Mostrar productos con categorías
    for (const product of productsWithCategory) {
      if (product.categoryProducts && product.categoryProducts.length > 0) {
        console.log(`✅ Producto ${product.name} tiene ${product.categoryProducts.length} categorías`)
      } else {
        console.log(`⚠️  Producto ${product.name} no tiene categorías asignadas`)
      }
    }

    // 3. Obtener productos (sin filtro de categoryName ya que no existe)
    const productsWithCategoryName = await prisma.product.findMany()

    console.log(`📦 Encontrados ${productsWithCategoryName.length} productos con categoryName legacy`)

    // 4. Mostrar información de productos
    for (const product of productsWithCategoryName) {
      console.log(`📦 Producto: ${product.name} (ID: ${product.id})`)
    }

    console.log('✅ Migración completada exitosamente!')
    
    // 5. Mostrar estadísticas finales
    const totalRelations = await prisma.categoryProduct.count()
    const totalCategories = await prisma.category.count()
    const totalProducts = await prisma.product.count()
    
    console.log('\n📊 Estadísticas finales:')
    console.log(`- Total categorías: ${totalCategories}`)
    console.log(`- Total productos: ${totalProducts}`)
    console.log(`- Total relaciones many-to-many: ${totalRelations}`)

  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateCategoryRelations()
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
