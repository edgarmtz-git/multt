import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCategories() {
  try {
    console.log('🌱 Iniciando seed de categorías...')

    // Obtener el primer usuario CLIENT
    const user = await prisma.user.findFirst({
      where: { role: 'CLIENT' }
    })

    if (!user) {
      console.log('❌ No se encontró ningún usuario CLIENT')
      return
    }

    console.log(`👤 Usuario encontrado: ${user.name} (${user.email})`)

    // Crear categorías de ejemplo
    const categories = [
      {
        name: 'Pizzas',
        description: 'Deliciosas pizzas artesanales',
        color: '#EF4444',
        icon: '🍕',
        order: 0
      },
      {
        name: 'Bebidas',
        description: 'Refrescantes bebidas y jugos',
        color: '#3B82F6',
        icon: '🥤',
        order: 1
      },
      {
        name: 'Postres',
        description: 'Dulces y postres caseros',
        color: '#EC4899',
        icon: '🍰',
        order: 2
      },
      {
        name: 'Ensaladas',
        description: 'Ensaladas frescas y saludables',
        color: '#10B981',
        icon: '🥗',
        order: 3
      },
      {
        name: 'Carnes',
        description: 'Cortes de carne y parrilla',
        color: '#92400E',
        icon: '🍖',
        order: 4
      }
    ]

    // Crear las categorías
    for (const categoryData of categories) {
      const category = await prisma.category.create({
        data: {
          ...categoryData,
          userId: user.id
        }
      })
      console.log(`✅ Categoría creada: ${category.name}`)
    }

    console.log('🎉 Seed de categorías completado exitosamente!')
  } catch (error) {
    console.error('❌ Error en seed de categorías:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedCategories()
