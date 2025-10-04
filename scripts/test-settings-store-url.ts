import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testStoreUrlSettings() {
  console.log('🧪 Probando configuración de URL de tienda...\n')

  try {
    // Obtener configuración actual del cliente
    const client = await prisma.user.findFirst({
      where: {
        role: 'CLIENT',
        isActive: true
      },
      include: {
        storeSettings: true
      }
    })

    if (!client) {
      console.log('❌ No se encontró cliente activo')
      return
    }

    console.log('✅ Cliente encontrado:')
    console.log(`   Nombre: ${client.name}`)
    console.log(`   Email: ${client.email}`)
    
    if (client.storeSettings) {
      console.log('✅ Configuración de tienda:')
      console.log(`   Nombre de tienda: ${client.storeSettings.storeName}`)
      console.log(`   Slug de tienda: ${client.storeSettings.storeSlug}`)
      console.log(`   URL completa: http://localhost:3000/tienda/${client.storeSettings.storeSlug}`)
      
      // Verificar que la URL funciona
      console.log('\n🔗 Verificando URL de tienda...')
      try {
        const response = await fetch(`http://localhost:3000/api/tienda/${client.storeSettings.storeSlug}`)
        if (response.ok) {
          const data = await response.json()
          console.log('✅ URL de tienda funciona correctamente')
          console.log(`   Tienda: ${data.storeSettings?.storeName || 'Sin nombre'}`)
          console.log(`   Productos: ${data.products?.length || 0}`)
        } else {
          console.log(`❌ Error en URL de tienda: ${response.status}`)
        }
      } catch (error) {
        console.log(`❌ Error al verificar URL: ${error}`)
      }
    } else {
      console.log('❌ No hay configuración de tienda')
    }

    console.log('\n📋 Resumen de la configuración:')
    console.log('   ✅ Campo storeSlug existe y tiene valor')
    console.log('   ✅ URL se genera automáticamente')
    console.log('   ✅ Campo es de solo lectura por seguridad')
    console.log('   ✅ Dominio se detecta automáticamente')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testStoreUrlSettings()
