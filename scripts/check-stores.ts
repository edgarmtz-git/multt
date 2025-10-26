import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStores() {
  try {
    console.log('📊 Checking stores in database...\n')

    const stores = await prisma.storeSettings.findMany({
      select: {
        id: true,
        storeSlug: true,
        storeName: true,
        storeActive: true,
        user: {
          select: {
            email: true,
            isActive: true,
            isSuspended: true
          }
        }
      }
    })

    if (stores.length === 0) {
      console.log('❌ No stores found in database')
      console.log('\n💡 Run `pnpm db:seed` to create sample data')
      return
    }

    console.log(`✅ Found ${stores.length} store(s):\n`)

    stores.forEach((store, index) => {
      console.log(`${index + 1}. Store: "${store.storeName}"`)
      console.log(`   - Slug: ${store.storeSlug}`)
      console.log(`   - ID: ${store.id}`)
      console.log(`   - Store Active: ${store.storeActive}`)
      console.log(`   - User Email: ${store.user.email}`)
      console.log(`   - User Active: ${store.user.isActive}`)
      console.log(`   - User Suspended: ${store.user.isSuspended}`)
      console.log(`   - URL: http://localhost:3000/tienda/${store.storeSlug}`)
      console.log('')
    })

    console.log('\n💡 To view a store, visit: http://localhost:3000/tienda/[slug]')

  } catch (error) {
    console.error('❌ Error checking stores:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkStores()
