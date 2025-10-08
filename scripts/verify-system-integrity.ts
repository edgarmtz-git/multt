// Script para verificar integridad del sistema
// Verifica relación entre Users y StoreSettings

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Verificando integridad del sistema...\n')

  // 1. Verificar todos los usuarios
  console.log('📊 === USUARIOS ===')
  const users = await prisma.user.findMany({
    include: {
      storeSettings: true
    }
  })

  console.log(`Total de usuarios: ${users.length}\n`)

  for (const user of users) {
    console.log(`Usuario: ${user.email}`)
    console.log(`  - ID: ${user.id}`)
    console.log(`  - Rol: ${user.role}`)
    console.log(`  - Nombre: ${user.name}`)
    console.log(`  - Activo: ${user.isActive}`)
    console.log(`  - Suspendido: ${user.isSuspended}`)
    console.log(`  - Company: ${user.company}`)

    if (user.role === 'CLIENT') {
      if (user.storeSettings) {
        console.log(`  ✅ Tiene StoreSettings:`)
        console.log(`     - Slug: ${user.storeSettings.storeSlug}`)
        console.log(`     - Nombre: ${user.storeSettings.storeName}`)
        console.log(`     - Activa: ${user.storeSettings.storeActive}`)
      } else {
        console.log(`  ❌ NO tiene StoreSettings (PROBLEMA)`)
      }
    }
    console.log('')
  }

  // 2. Verificar StoreSettings huérfanos
  console.log('\n📊 === STORE SETTINGS ===')
  const allStores = await prisma.storeSettings.findMany({
    include: {
      user: true
    }
  })

  console.log(`Total de tiendas: ${allStores.length}\n`)

  for (const store of allStores) {
    console.log(`Tienda: ${store.storeName}`)
    console.log(`  - ID: ${store.id}`)
    console.log(`  - Slug: ${store.storeSlug}`)
    console.log(`  - User ID: ${store.userId}`)

    if (!store.user) {
      console.log(`  ❌ Usuario NO existe (HUÉRFANO - PROBLEMA)`)
    } else {
      console.log(`  ✅ Usuario: ${store.user.email}`)
      console.log(`     - Usuario activo: ${store.user.isActive}`)
      console.log(`     - Usuario suspendido: ${store.user.isSuspended}`)
    }
    console.log('')
  }

  // 3. Verificar problemas específicos
  console.log('\n🔍 === VERIFICACIÓN DE PROBLEMAS ===\n')

  const clientsWithoutStore = users.filter(
    u => u.role === 'CLIENT' && !u.storeSettings
  )

  if (clientsWithoutStore.length > 0) {
    console.log(`❌ ${clientsWithoutStore.length} clientes SIN StoreSettings:`)
    clientsWithoutStore.forEach(u => {
      console.log(`   - ${u.email} (ID: ${u.id})`)
    })
  } else {
    console.log('✅ Todos los clientes tienen StoreSettings')
  }

  const orphanStores = allStores.filter(s => !s.user)

  if (orphanStores.length > 0) {
    console.log(`\n❌ ${orphanStores.length} StoreSettings HUÉRFANOS:`)
    orphanStores.forEach(s => {
      console.log(`   - ${s.storeName} (UserID: ${s.userId})`)
    })
  } else {
    console.log('\n✅ No hay StoreSettings huérfanos')
  }

  // 4. URLs accesibles
  console.log('\n📍 === URLs DE TIENDAS ===\n')
  for (const store of allStores) {
    const url = `http://localhost:3002/tienda/${store.storeSlug}`
    console.log(`${store.storeName}: ${url}`)
  }

  // 5. Resumen final
  console.log('\n📈 === RESUMEN ===')
  console.log(`Total usuarios: ${users.length}`)
  console.log(`  - Admins: ${users.filter(u => u.role === 'ADMIN').length}`)
  console.log(`  - Clientes: ${users.filter(u => u.role === 'CLIENT').length}`)
  console.log(`Total tiendas: ${allStores.length}`)
  console.log(`Problemas encontrados: ${clientsWithoutStore.length + orphanStores.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
