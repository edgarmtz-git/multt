import { prisma } from '@/lib/prisma'

async function checkProductsCategories() {
  console.log('🔍 CHECKING PRODUCTS AND CATEGORIES')
  console.log('===================================')

  try {
    // 1. Verificar categorías
    const categories = await prisma.category.findMany({
      where: {
        userId: 'cmfwsez430001s63iz8wh5xd2',
        isActive: true
      },
      include: {
        categoryProducts: {
          include: {
            product: true
          }
        }
      }
    })

    console.log('\n📁 CATEGORÍAS:')
    console.log(`Total: ${categories.length}`)
    categories.forEach(category => {
      console.log(`- ${category.name} (${category.categoryProducts.length} productos)`)
    })

    // 2. Verificar productos
    const products = await prisma.product.findMany({
      where: {
        userId: 'cmfwsez430001s63iz8wh5xd2',
        isActive: true
      }
    })

    console.log('\n📦 PRODUCTOS:')
    console.log(`Total: ${products.length}`)
    products.forEach(product => {
      console.log(`- ${product.name} ($${product.price})`)
    })

    // 3. Verificar relaciones
    const categoryProducts = await prisma.categoryProduct.findMany({
      where: {
        category: {
          userId: 'cmfwsez430001s63iz8wh5xd2'
        }
      },
      include: {
        category: true,
        product: true
      }
    })

    console.log('\n🔗 RELACIONES CATEGORÍA-PRODUCTO:')
    console.log(`Total: ${categoryProducts.length}`)
    categoryProducts.forEach(cp => {
      console.log(`- ${cp.category.name} → ${cp.product.name}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkProductsCategories().catch(console.error)
