import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const prisma = new PrismaClient()

async function createTestClient() {
  console.log('🧪 Creando cliente de prueba completo...')

  try {
    // 1. Crear invitación de prueba
    const code = randomBytes(12).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expira en 7 días

    const invitation = await prisma.invitation.create({
      data: {
        code,
        clientName: 'María García López',
        clientEmail: `maria-${Date.now()}@techstartup.com`,
        clientPhone: '555-1234',
        slug: `tech-startup-maria-${Date.now()}`,
        expiresAt,
        createdBy: 'admin-id', // ID del admin (ajustar según tu BD)
        status: 'PENDING'
      }
    })

    console.log('✅ Invitación creada:', {
      id: invitation.id,
      code: invitation.code,
      clientName: invitation.clientName,
      clientEmail: invitation.clientEmail,
      slug: invitation.slug,
      link: `http://localhost:3000/invite/${invitation.code}`
    })

    // 2. Simular que el cliente acepta la invitación
    const hashedPassword = await bcrypt.hash('maria123', 12)
    
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const user = await tx.user.create({
        data: {
          email: invitation.clientEmail,
          name: invitation.clientName,
          password: hashedPassword,
          role: 'CLIENT',
          company: invitation.slug,
          isActive: true
        }
      })

      // Crear productos de ejemplo para el cliente
      const products = await tx.product.createMany({
        data: [
          {
            name: 'Sitio Web Corporativo',
            description: 'Desarrollo de sitio web completo para empresa',
            price: 2500.00,
            stock: 1,
            userId: user.id
          },
          {
            name: 'App Móvil iOS/Android',
            description: 'Aplicación móvil nativa para iOS y Android',
            price: 5000.00,
            stock: 1,
            userId: user.id
          },
          {
            name: 'Consultoría Técnica',
            description: 'Sesión de consultoría técnica de 2 horas',
            price: 150.00,
            stock: 10,
            userId: user.id
          }
        ]
      })

      // Crear algunos pedidos de ejemplo
      const order1 = await tx.order.create({
        data: {
          status: 'CONFIRMED',
          total: 2500.00,
          customerEmail: 'cliente1@empresa.com',
          customerName: 'Juan Pérez',
          notes: 'Sitio web urgente',
          userId: user.id
        }
      })

      const order2 = await tx.order.create({
        data: {
          status: 'PENDING',
          total: 150.00,
          customerEmail: 'cliente2@startup.com',
          customerName: 'Ana Martínez',
          notes: 'Consultoría para startup',
          userId: user.id
        }
      })

      // Obtener los productos creados para asociarlos a los pedidos
      const userProducts = await tx.product.findMany({
        where: { userId: user.id }
      })

      // Crear items para los pedidos
      await tx.orderItem.createMany({
        data: [
          {
            orderId: order1.id,
            productId: userProducts[0]?.id || '', // Sitio Web Corporativo
            quantity: 1,
            price: 2500.00
          },
          {
            orderId: order2.id,
            productId: userProducts[2]?.id || '', // Consultoría Técnica
            quantity: 1,
            price: 150.00
          }
        ]
      })

      // Marcar invitación como usada
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'USED',
          usedAt: new Date(),
          serviceStart: new Date(),
          serviceRenewal: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 año
          isActive: true
        }
      })

      return { user, products: products.count, orders: 2 }
    })

    console.log('✅ Cliente creado exitosamente:', {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      company: result.user.company,
      productos: result.products,
      pedidos: result.orders
    })

    // 3. Verificar que todo se creó correctamente
    const clientWithData = await prisma.user.findUnique({
      where: { id: result.user.id },
      include: {
        products: true,
        orders: {
          include: {
            items: true
          }
        }
      }
    })

    console.log('📊 Datos del cliente creado:', {
      productos: clientWithData?.products.length,
      pedidos: clientWithData?.orders.length,
      itemsEnPedidos: clientWithData?.orders.reduce((total, order) => total + order.items.length, 0)
    })

    // 4. Listar todos los clientes para verificar
    const allClients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      include: {
        _count: {
          select: {
            products: true,
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('\n👥 Lista de todos los clientes:')
    allClients.forEach((client, index) => {
      console.log(`${index + 1}. ${client.name} (${client.email})`)
      console.log(`   - Empresa: ${client.company}`)
      console.log(`   - Productos: ${client._count.products}`)
      console.log(`   - Pedidos: ${client._count.orders}`)
      console.log(`   - Activo: ${client.isActive ? 'Sí' : 'No'}`)
      console.log(`   - Registro: ${client.createdAt.toLocaleDateString()}`)
      console.log('')
    })

    console.log('🎯 Cliente de prueba creado exitosamente!')
    console.log('\n📋 Para verificar:')
    console.log('1. Ve a: http://localhost:3000/admin/clients')
    console.log('2. Inicia sesión como admin')
    console.log('3. Deberías ver a María García López en la lista')
    console.log('4. Puedes ver sus productos y pedidos')

  } catch (error) {
    console.error('❌ Error creando cliente de prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestClient()
