import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testSuspendButton() {
  console.log('🧪 Probando funcionalidad del botón de suspender...\n')

  try {
    // 1. Verificar estado actual de David
    const david = await prisma.user.findFirst({
      where: { email: 'david@restaurante-mexicano.com' }
    })

    if (!david) {
      console.log('❌ David no encontrado')
      return
    }

    console.log(`✅ David encontrado: ${david.name}`)
    console.log(`📊 Estado actual: isSuspended = ${david.isSuspended}`)

    // 2. Cambiar el estado para probar
    if (david.isSuspended) {
      console.log('\n🔄 Activando a David...')
      await prisma.user.update({
        where: { id: david.id },
        data: {
          isSuspended: false,
          suspensionReason: null,
          suspendedAt: null
        }
      })
      console.log('✅ David activado')
    } else {
      console.log('\n⏸️ Suspendiendo a David...')
      await prisma.user.update({
        where: { id: david.id },
        data: {
          isSuspended: true,
          suspensionReason: 'Pago pendiente - renovación vencida',
          suspendedAt: new Date()
        }
      })
      console.log('✅ David suspendido')
    }

    // 3. Verificar el cambio
    const davidUpdated = await prisma.user.findUnique({
      where: { id: david.id }
    })

    console.log('\n📊 Estado después del cambio:')
    console.log(`   - isSuspended: ${davidUpdated?.isSuspended}`)
    console.log(`   - suspensionReason: ${davidUpdated?.suspensionReason}`)

    console.log('\n🔗 URLs para probar:')
    console.log(`   👨‍💼 Admin (puerto 3001): http://localhost:3001/admin/clients`)
    console.log(`   👨‍💼 Admin (puerto 3000): http://localhost:3000/admin/clients`)
    console.log(`   📱 Login: http://localhost:3001/login`)
    console.log(`   👤 Dashboard: http://localhost:3001/dashboard`)
    console.log(`   🏪 Tienda: http://localhost:3001/tienda/restaurante-mexicano-david`)

    console.log('\n📋 Credenciales de prueba:')
    console.log(`   Admin: admin@sistema.com / admin123`)
    console.log(`   David: david@restaurante-mexicano.com / david123`)

    console.log('\n🎯 Pasos para probar:')
    console.log('1. Ve a http://localhost:3001/admin/clients')
    console.log('2. Inicia sesión como admin')
    console.log('3. Busca a David en la lista')
    console.log('4. Haz clic en "Suspender" o "Activar"')
    console.log('5. Verifica que el botón cambie y el estado se actualice')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSuspendButton()
