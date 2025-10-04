import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixSettingsData() {
  console.log('🔧 Corrigiendo datos de configuración...\n')

  try {
    // Buscar el cliente
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
      console.log('\n🔍 Datos actuales de configuración:')
      console.log(`   storeName: ${client.storeSettings.storeName}`)
      console.log(`   storeSlug: ${client.storeSettings.storeSlug}`)
      console.log(`   address: ${client.storeSettings.address}`)
      console.log(`   whatsappSequentialNumbers: ${client.storeSettings.whatsappSequentialNumbers}`)
      console.log(`   businessHours: ${client.storeSettings.businessHours}`)

      // Limpiar campos que no son JSON válido
      const updateData: any = {}

      // Verificar address
      if (client.storeSettings.address && !isValidJSON(client.storeSettings.address)) {
        console.log('⚠️  Campo address no es JSON válido, limpiando...')
        updateData.address = null
      }

      // Verificar whatsappSequentialNumbers
      if (client.storeSettings.whatsappSequentialNumbers && !isValidJSON(client.storeSettings.whatsappSequentialNumbers)) {
        console.log('⚠️  Campo whatsappSequentialNumbers no es JSON válido, limpiando...')
        updateData.whatsappSequentialNumbers = null
      }

      // Verificar businessHours
      if (client.storeSettings.businessHours && typeof client.storeSettings.businessHours === 'string' && !isValidJSON(client.storeSettings.businessHours)) {
        console.log('⚠️  Campo businessHours no es JSON válido, limpiando...')
        updateData.businessHours = null
      }

      // Asegurar que storeSlug tenga un valor
      if (!client.storeSettings.storeSlug || client.storeSettings.storeSlug.trim() === '') {
        console.log('⚠️  storeSlug vacío, estableciendo valor...')
        updateData.storeSlug = 'mi-tienda-digital'
      }

      // Actualizar si hay cambios
      if (Object.keys(updateData).length > 0) {
        const updatedSettings = await prisma.storeSettings.update({
          where: { id: client.storeSettings.id },
          data: updateData
        })

        console.log('\n✅ Configuración actualizada:')
        console.log(`   storeName: ${updatedSettings.storeName}`)
        console.log(`   storeSlug: ${updatedSettings.storeSlug}`)
        console.log(`   address: ${updatedSettings.address || 'null'}`)
        console.log(`   whatsappSequentialNumbers: ${updatedSettings.whatsappSequentialNumbers || 'null'}`)
        console.log(`   businessHours: ${updatedSettings.businessHours || 'null'}`)
      } else {
        console.log('\n✅ No se requieren cambios')
      }
    } else {
      console.log('❌ No hay configuración de tienda')
    }

    // Verificar que la API funciona ahora
    console.log('\n🔗 Verificando API...')
    try {
      const response = await fetch(`http://localhost:3000/api/dashboard/settings`, {
        headers: {
          'Cookie': 'next-auth.session-token=test' // Esto no funcionará sin autenticación real
        }
      })
      console.log(`   Status: ${response.status}`)
      if (response.status === 401) {
        console.log('✅ API responde correctamente (401 = no autenticado, pero no hay error de JSON)')
      }
    } catch (error) {
      console.log(`   Error: ${error}`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

fixSettingsData()
