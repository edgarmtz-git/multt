import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Analizando estado actual de órdenes...\n')

  // Contar órdenes
  const orderCount = await prisma.order.count()
  console.log(`Total de órdenes: ${orderCount}`)

  // Obtener una orden de muestra si existe
  if (orderCount > 0) {
    const sampleOrder = await prisma.order.findFirst({
      include: {
        items: true
      }
    })
    console.log('\n📦 Muestra de orden existente:')
    console.log(JSON.stringify(sampleOrder, null, 2))
  }

  // Verificar esquema actual
  console.log('\n🔍 Campos actuales en Order:')
  const orderFields = await prisma.$queryRaw<any[]>`PRAGMA table_info(orders);`
  orderFields.forEach((field: any) => {
    console.log(`  - ${field.name}: ${field.type} ${field.notnull ? 'NOT NULL' : 'NULL'} ${field.dflt_value ? `DEFAULT ${field.dflt_value}` : ''}`)
  })

  console.log('\n🔍 Campos actuales en OrderItem:')
  const orderItemFields = await prisma.$queryRaw<any[]>`PRAGMA table_info(order_items);`
  orderItemFields.forEach((field: any) => {
    console.log(`  - ${field.name}: ${field.type} ${field.notnull ? 'NOT NULL' : 'NULL'} ${field.dflt_value ? `DEFAULT ${field.dflt_value}` : ''}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
