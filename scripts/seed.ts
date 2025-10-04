import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sistema.com' },
    update: {},
    create: {
      email: 'admin@sistema.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
      company: 'Sistema',
    },
  })
  console.log('✅ Usuario admin creado:', admin.email)

  // Crear usuario cliente de ejemplo
  const clientPassword = await bcrypt.hash('cliente123', 12)
  const client = await prisma.user.upsert({
    where: { email: 'cliente@empresa.com' },
    update: {},
    create: {
      email: 'cliente@empresa.com',
      name: 'Juan Pérez',
      password: clientPassword,
      role: 'CLIENT',
      company: 'Tech Corp',
    },
  })
  console.log('✅ Usuario cliente creado:', client.email)

  // Crear categorías de ejemplo
  const categories = [
    {
      name: 'Electrónicos',
      description: 'Dispositivos electrónicos y tecnología',
      color: '#3B82F6',
      icon: '📱',
      isVisibleInStore: true,
    },
    {
      name: 'Audio',
      description: 'Equipos de audio y sonido',
      color: '#10B981',
      icon: '🎵',
      isVisibleInStore: true,
    },
    {
      name: 'Accesorios',
      description: 'Accesorios y complementos',
      color: '#F59E0B',
      icon: '🎧',
      isVisibleInStore: false,
    },
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.create({
      data: {
        ...category,
        userId: client.id,
      },
    })
    createdCategories.push(created)
  }
  console.log('✅ Categorías de ejemplo creadas')

  // Crear productos de ejemplo para el cliente
  const products = [
    {
      name: 'Laptop Gaming Pro',
      description: 'Laptop de alta gama para gaming y trabajo profesional',
      price: 1299.99,
      stock: 15,
    },
    {
      name: 'Smartphone X1',
      description: 'Smartphone con cámara profesional y batería de larga duración',
      price: 899.99,
      stock: 8,
    },
    {
      name: 'Auriculares Wireless',
      description: 'Auriculares inalámbricos con cancelación de ruido',
      price: 199.99,
      stock: 25,
    },
  ]

  const createdProducts = []
  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        ...product,
        userId: client.id,
      },
    })
    createdProducts.push(created)
  }
  console.log('✅ Productos de ejemplo creados')

  // Crear relaciones many-to-many entre categorías y productos
  await prisma.categoryProduct.createMany({
    data: [
      { categoryId: createdCategories[0].id, productId: createdProducts[0].id, order: 1 },
      { categoryId: createdCategories[0].id, productId: createdProducts[1].id, order: 2 },
      { categoryId: createdCategories[1].id, productId: createdProducts[2].id, order: 1 },
    ]
  })
  console.log('✅ Relaciones categoría-producto creadas')

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
