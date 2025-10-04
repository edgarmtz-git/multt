import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabase() {
  console.log('🔍 Verificando estado de la base de datos...\n')

  try {
    // Verificar invitaciones
    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log(`📧 Total de invitaciones: ${invitations.length}`)
    console.log('\n📋 Lista de invitaciones:')
    
    invitations.forEach((invitation, index) => {
      console.log(`${index + 1}. ${invitation.clientName} (${invitation.clientEmail})`)
      console.log(`   - Estado: ${invitation.status}`)
      console.log(`   - Slug: ${invitation.slug}`)
      console.log(`   - Creada: ${invitation.createdAt}`)
      console.log(`   - Expira: ${invitation.expiresAt}`)
      if (invitation.usedAt) {
        console.log(`   - Usada: ${invitation.usedAt}`)
      }
      console.log('')
    })

    // Verificar usuarios
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    })

    console.log(`👥 Total de usuarios: ${users.length}`)
    console.log('\n👤 Lista de usuarios:')
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`)
      console.log(`   - Rol: ${user.role}`)
      console.log(`   - Empresa: ${user.company}`)
      console.log(`   - Activo: ${user.isActive}`)
      console.log(`   - Creado: ${user.createdAt}`)
      console.log('')
    })

    // Verificar productos
    const products = await prisma.product.findMany()
    console.log(`📦 Total de productos: ${products.length}`)

    // Verificar pedidos
    const orders = await prisma.order.findMany()
    console.log(`🛒 Total de pedidos: ${orders.length}`)

    console.log('\n✅ Verificación completada')

  } catch (error) {
    console.error('❌ Error verificando base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
