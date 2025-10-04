import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSuspendDavid() {
  console.log('🧪 Probando suspensión de David...\n')

  try {
    // 1. Buscar a David
    const david = await prisma.user.findFirst({
      where: { email: 'david@restaurante-mexicano.com' }
    })

    if (!david) {
      console.log('❌ David no encontrado')
      return
    }

    console.log(`✅ David encontrado: ${david.name} (${david.email})`)
    console.log(`📊 Estado actual: isSuspended = ${david.isSuspended}`)

    // 2. Suspender a David
    console.log('\n⏸️ Suspendiendo a David...')
    await prisma.user.update({
      where: { id: david.id },
      data: {
        isSuspended: true,
        suspensionReason: 'Pago pendiente - renovación vencida',
        suspendedAt: new Date()
      }
    })

    console.log('✅ David suspendido exitosamente')

    // 3. Verificar el estado
    const davidUpdated = await prisma.user.findUnique({
      where: { id: david.id }
    })

    console.log('\n📊 Estado después de suspensión:')
    console.log(`   - isSuspended: ${davidUpdated?.isSuspended}`)
    console.log(`   - suspensionReason: ${davidUpdated?.suspensionReason}`)
    console.log(`   - suspendedAt: ${davidUpdated?.suspendedAt}`)

    console.log('\n🔗 URLs para probar:')
    console.log(`   📱 Login: http://localhost:3001/login`)
    console.log(`   👤 Dashboard: http://localhost:3001/dashboard`)
    console.log(`   🏪 Tienda: http://localhost:3001/tienda/restaurante-mexicano-david`)
    console.log(`   👨‍💼 Admin: http://localhost:3001/admin/clients`)

    console.log('\n📋 Credenciales de David:')
    console.log(`   Email: ${david.email}`)
    console.log(`   Contraseña: david123`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSuspendDavid()
