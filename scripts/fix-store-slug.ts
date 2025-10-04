import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixStoreSlug() {
  console.log('🔧 Verificando y corrigiendo storeSlug...\n')

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
    
    if (!client.storeSettings) {
      console.log('❌ No hay configuración de tienda, creando...')
      
      const storeSettings = await prisma.storeSettings.create({
        data: {
          userId: client.id,
          storeName: 'Mi Tienda Digital',
          storeSlug: 'mi-tienda-digital',
          country: 'Mexico',
          language: 'es',
          currency: 'MXN',
          distanceUnit: 'km',
          mapProvider: 'openstreetmap',
          taxRate: 0.0,
          taxMethod: 'included',
          enableBusinessHours: false,
          disableCheckoutOutsideHours: false,
          paymentsEnabled: true,
          storeActive: true,
          passwordProtected: false
        }
      })
      
      console.log('✅ Configuración de tienda creada:')
      console.log(`   Nombre: ${storeSettings.storeName}`)
      console.log(`   Slug: ${storeSettings.storeSlug}`)
    } else {
      console.log('✅ Configuración de tienda existente:')
      console.log(`   Nombre: ${client.storeSettings.storeName}`)
      console.log(`   Slug actual: ${client.storeSettings.storeSlug}`)
      
      // Verificar si el slug está vacío o es inválido
      if (!client.storeSettings.storeSlug || client.storeSettings.storeSlug.trim() === '') {
        console.log('⚠️  Slug vacío, actualizando...')
        
        const updatedSettings = await prisma.storeSettings.update({
          where: { id: client.storeSettings.id },
          data: { storeSlug: 'mi-tienda-digital' }
        })
        
        console.log('✅ Slug actualizado:')
        console.log(`   Nuevo slug: ${updatedSettings.storeSlug}`)
      } else {
        console.log('✅ Slug válido, no se requiere actualización')
      }
    }

    // Verificar la URL completa
    const finalSettings = await prisma.storeSettings.findFirst({
      where: { userId: client.id }
    })

    if (finalSettings) {
      console.log('\n🔗 URL completa de la tienda:')
      console.log(`   http://localhost:3000/tienda/${finalSettings.storeSlug}`)
      
      // Verificar que la API funciona
      try {
        const response = await fetch(`http://localhost:3000/api/tienda/${finalSettings.storeSlug}`)
        if (response.ok) {
          console.log('✅ URL de tienda funciona correctamente')
        } else {
          console.log(`❌ Error en URL de tienda: ${response.status}`)
        }
      } catch (error) {
        console.log(`❌ Error al verificar URL: ${error}`)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixStoreSlug()
