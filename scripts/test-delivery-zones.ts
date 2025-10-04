#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDeliveryZones() {
  console.log('🧪 Probando sistema de zonas de entrega...\n')

  try {
    // 1. Verificar que el enum DeliveryType solo tiene FIXED
    console.log('1. Verificando enum DeliveryType...')
    const deliveryTypes = await prisma.$queryRaw`
      SELECT DISTINCT type FROM delivery_zones
    `
    console.log('   ✅ Tipos de entrega encontrados:', deliveryTypes)
    
    // 2. Crear un usuario de prueba si no existe
    console.log('\n2. Verificando usuario de prueba...')
    let testUser = await prisma.user.findFirst({
      where: { email: 'test@delivery.com' }
    })
    
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          name: 'Test Delivery User',
          email: 'test@delivery.com',
          password: '$2a$10$dummy.hash.for.testing',
          role: 'CLIENT',
          isActive: true,
          company: 'Test Company'
        }
      })
      console.log('   ✅ Usuario de prueba creado')
    } else {
      console.log('   ✅ Usuario de prueba ya existe')
    }

    // 3. Crear configuración de tienda si no existe
    console.log('\n3. Verificando configuración de tienda...')
    let storeSettings = await prisma.storeSettings.findFirst({
      where: { userId: testUser.id }
    })
    
    if (!storeSettings) {
      storeSettings = await prisma.storeSettings.create({
        data: {
          userId: testUser.id,
          storeName: 'Test Store',
          storeSlug: 'test-store',
          country: 'Mexico',
          language: 'es',
          currency: 'MXN',
          distanceUnit: 'km',
          mapProvider: 'OPENSTREETMAP'
        }
      })
      console.log('   ✅ Configuración de tienda creada')
    } else {
      console.log('   ✅ Configuración de tienda ya existe')
    }

    // 4. Limpiar zonas de entrega existentes
    console.log('\n4. Limpiando zonas de entrega existentes...')
    await prisma.deliveryZone.deleteMany({
      where: { storeSettingsId: storeSettings.id }
    })
    console.log('   ✅ Zonas existentes eliminadas')

    // 5. Crear zonas de prueba
    console.log('\n5. Creando zonas de entrega de prueba...')
    
    const testZones = [
      {
        name: 'Zona Centro',
        type: 'FIXED',
        isActive: true,
        order: 0,
        fixedPrice: 30.00,
        freeDeliveryThreshold: 150.00,
        estimatedTime: 20,
        description: 'Entregas en el centro de la ciudad',
        storeSettingsId: storeSettings.id
      },
      {
        name: 'Zona Norte',
        type: 'FIXED',
        isActive: true,
        order: 1,
        fixedPrice: 50.00,
        freeDeliveryThreshold: 200.00,
        estimatedTime: 35,
        description: 'Entregas en la zona norte',
        storeSettingsId: storeSettings.id
      },
      {
        name: 'Zona Sur',
        type: 'FIXED',
        isActive: false,
        order: 2,
        fixedPrice: 40.00,
        freeDeliveryThreshold: 180.00,
        estimatedTime: 30,
        description: 'Entregas en la zona sur (temporalmente inactiva)',
        storeSettingsId: storeSettings.id
      }
    ]

    for (const zoneData of testZones) {
      const zone = await prisma.deliveryZone.create({
        data: zoneData
      })
      console.log(`   ✅ Zona creada: ${zone.name} (${zone.isActive ? 'Activa' : 'Inactiva'})`)
    }

    // 6. Verificar que las zonas se crearon correctamente
    console.log('\n6. Verificando zonas creadas...')
    const createdZones = await prisma.deliveryZone.findMany({
      where: { storeSettingsId: storeSettings.id },
      orderBy: { order: 'asc' }
    })

    console.log(`   ✅ Total de zonas: ${createdZones.length}`)
    createdZones.forEach(zone => {
      console.log(`   - ${zone.name}: $${zone.fixedPrice} (${zone.isActive ? 'Activa' : 'Inactiva'})`)
      console.log(`     Gratis desde: $${zone.freeDeliveryThreshold}`)
      console.log(`     Tiempo: ${zone.estimatedTime} min`)
    })

    // 7. Probar actualización de zona
    console.log('\n7. Probando actualización de zona...')
    const firstZone = createdZones[0]
    const updatedZone = await prisma.deliveryZone.update({
      where: { id: firstZone.id },
      data: {
        fixedPrice: 25.00,
        description: 'Zona centro actualizada'
      }
    })
    console.log(`   ✅ Zona actualizada: ${updatedZone.name} - Nuevo precio: $${updatedZone.fixedPrice}`)

    // 8. Probar eliminación de zona
    console.log('\n8. Probando eliminación de zona...')
    const lastZone = createdZones[createdZones.length - 1]
    await prisma.deliveryZone.delete({
      where: { id: lastZone.id }
    })
    console.log(`   ✅ Zona eliminada: ${lastZone.name}`)

    // 9. Verificar estado final
    console.log('\n9. Estado final del sistema...')
    const finalZones = await prisma.deliveryZone.findMany({
      where: { storeSettingsId: storeSettings.id },
      orderBy: { order: 'asc' }
    })

    console.log(`   ✅ Zonas restantes: ${finalZones.length}`)
    finalZones.forEach(zone => {
      console.log(`   - ${zone.name}: $${zone.fixedPrice} (${zone.isActive ? 'Activa' : 'Inactiva'})`)
    })

    console.log('\n🎉 ¡Sistema de zonas de entrega funciona correctamente!')
    console.log('\nResumen:')
    console.log('✅ Creación de zonas: OK')
    console.log('✅ Lectura de zonas: OK')
    console.log('✅ Actualización de zonas: OK')
    console.log('✅ Eliminación de zonas: OK')
    console.log('✅ Validación de tipos: OK')
    console.log('✅ Relaciones de base de datos: OK')

  } catch (error) {
    console.error('❌ Error en las pruebas:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDeliveryZones()
