import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProducts() {
  console.log('📦 Verificando productos...\n')

  try {
    const products = await prisma.product.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            company: true
          }
        }
      }
    })

    console.log(`📦 Total de productos: ${products.length}`)
    console.log('\n📋 Lista de productos:')
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   - Precio: $${product.price}`)
      console.log(`   - Categoría: Sin categoría`)
      console.log(`   - Stock: ${product.stock}`)
      console.log(`   - Usuario: ${product.user.name} (${product.user.email})`)
      console.log(`   - Empresa: ${product.user.company}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error verificando productos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProducts()
