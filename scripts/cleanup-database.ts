import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupDatabase() {
  try {
    console.log('🧹 Limpiando base de datos...\n')

    // 1. Eliminar categorías duplicadas
    console.log('1️⃣ Eliminando categorías duplicadas...')
    
    // Encontrar categorías duplicadas
    const duplicateCategories = await prisma.category.groupBy({
      by: ['name', 'userId'],
      where: { userId: 'cmfwk91a90001s6eitouzsio1' }, // Usuario cliente
      _count: { name: true },
      having: {
        name: {
          _count: {
            gt: 1
          }
        }
      }
    })

    console.log(`   - Encontradas ${duplicateCategories.length} categorías duplicadas`)

    for (const dup of duplicateCategories) {
      // Obtener todas las categorías con este nombre
      const categories = await prisma.category.findMany({
        where: {
          name: dup.name,
          userId: 'cmfwk91a90001s6eitouzsio1'
        },
        orderBy: { createdAt: 'asc' }
      })

      // Mantener la primera y eliminar las demás
      const toKeep = categories[0]
      const toDelete = categories.slice(1)

      console.log(`   - Manteniendo: ${toKeep.name} (${toKeep.id})`)
      
      for (const cat of toDelete) {
        console.log(`   - Eliminando: ${cat.name} (${cat.id})`)
        
        // Mover relaciones a la categoría que se mantiene
        await prisma.categoryProduct.updateMany({
          where: { categoryId: cat.id },
          data: { categoryId: toKeep.id }
        })
        
        // Eliminar la categoría duplicada
        await prisma.category.delete({
          where: { id: cat.id }
        })
      }
    }

    console.log('✅ Categorías duplicadas eliminadas\n')

    // 2. Verificar integridad de relaciones
    console.log('2️⃣ Verificando integridad de relaciones...')
    
    const allRelations = await prisma.categoryProduct.findMany({
      include: {
        category: true,
        product: true
      }
    })

    let invalidRelations = 0
    for (const relation of allRelations) {
      if (!relation.category || !relation.product) {
        invalidRelations++
        console.log(`   - Relación inválida encontrada: ${relation.id}`)
        await prisma.categoryProduct.delete({
          where: { id: relation.id }
        })
      }
    }

    if (invalidRelations === 0) {
      console.log('✅ Todas las relaciones son válidas')
    } else {
      console.log(`✅ ${invalidRelations} relaciones inválidas eliminadas`)
    }
    console.log()

    // 3. Verificar estado final
    console.log('3️⃣ Estado final de la base de datos...')
    
    const finalCategories = await prisma.category.findMany({
      where: { userId: 'cmfwk91a90001s6eitouzsio1' },
      include: {
        _count: {
          select: {
            categoryProducts: true
          }
        }
      }
    })

    const finalProducts = await prisma.product.findMany({
      where: { userId: 'cmfwk91a90001s6eitouzsio1' }
    })

    const finalRelations = await prisma.categoryProduct.findMany()

    console.log(`   - Categorías: ${finalCategories.length}`)
    console.log(`   - Productos: ${finalProducts.length}`)
    console.log(`   - Relaciones: ${finalRelations.length}`)

    console.log('\n📋 Categorías finales:')
    finalCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.color}) - ${cat._count.categoryProducts} productos`)
    })

    console.log('\n🎉 Limpieza completada exitosamente!')

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanupDatabase()
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })
