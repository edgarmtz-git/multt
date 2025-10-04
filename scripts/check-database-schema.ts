import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabaseSchema() {
  try {
    console.log('🔍 VERIFICANDO ESQUEMA DE BASE DE DATOS\n')
    
    // Intentar obtener un registro de StoreSettings
    const storeSettings = await prisma.storeSettings.findFirst({
      select: {
        id: true,
        storeName: true,
        userId: true
      }
    })
    
    if (storeSettings) {
      console.log('✅ StoreSettings encontrado:')
      console.log(`  ID: ${storeSettings.id}`)
      console.log(`  Nombre: ${storeSettings.storeName}`)
      console.log(`  User ID: ${storeSettings.userId}`)
    } else {
      console.log('❌ No se encontró ningún StoreSettings')
    }
    
    // Intentar obtener todos los campos disponibles
    console.log('\n🔍 CAMPOS DISPONIBLES EN StoreSettings:')
    try {
      const allFields = await prisma.storeSettings.findFirst({
        select: {
          id: true,
          storeName: true,
          userId: true,
          storeSlug: true,
          email: true,
          address: true,
          whatsappMainNumber: true,
          whatsappSequentialNumbers: true,
          country: true,
          language: true,
          currency: true,
          distanceUnit: true,
          mapProvider: true,
          googleMapsApiKey: true,
          taxRate: true,
          taxMethod: true,
          tagId: true,
          enableBusinessHours: true,
          disableCheckoutOutsideHours: true,
          businessHours: true,
          whatsappCommunityLink: true,
          telegramCommunityLink: true,
          instagramLink: true,
          facebookLink: true,
          deliveryEnabled: true,
          useBasePrice: true,
          baseDeliveryPrice: true,
          baseDeliveryThreshold: true,
          paymentsEnabled: true,
          storeActive: true,
          passwordProtected: true,
          accessPassword: true,
          createdAt: true,
          updatedAt: true
        }
      })
      
      console.log('✅ Campos básicos disponibles')
      
      // Intentar el campo unifiedSchedule
      try {
        const withUnifiedSchedule = await prisma.storeSettings.findFirst({
          select: {
            unifiedSchedule: true
          }
        })
        console.log('✅ Campo unifiedSchedule disponible')
      } catch (error: any) {
        console.log('❌ Campo unifiedSchedule NO disponible')
        console.log(`   Error: ${error.message}`)
      }
      
    } catch (error: any) {
      console.log('❌ Error al verificar campos:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseSchema()
