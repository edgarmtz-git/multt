import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creando datos limpios desde cero...\n')

  // Limpiar todo primero
  await prisma.orderItemOption.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.productGlobalOption.deleteMany()
  await prisma.globalOptionChoiceAvailability.deleteMany()
  await prisma.globalOptionAvailability.deleteMany()
  await prisma.globalOptionChoice.deleteMany()
  await prisma.globalOption.deleteMany()
  await prisma.productOptionChoice.deleteMany()
  await prisma.productOption.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.categoryProduct.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.deliveryZone.deleteMany()
  await prisma.storeSettings.deleteMany()
  await prisma.invitation.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Base de datos limpiada\n')

  // 1. CREAR ADMIN
  const adminPassword = await bcrypt.hash('admin2025', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@multisaas.com',
      password: adminPassword,
      name: 'Super Admin',
      role: 'ADMIN',
      isActive: true
    }
  })
  console.log('✅ Admin creado:')
  console.log('   Email:', admin.email)
  console.log('   Password: admin2025\n')

  // 2. CREAR CLIENTE
  const clientPassword = await bcrypt.hash('pizza2025', 12)
  const client = await prisma.user.create({
    data: {
      email: 'pizzeria@lacasa.com',
      password: clientPassword,
      name: 'Pizzería La Casa',
      company: 'Pizzería La Casa del Sabor',
      role: 'CLIENT',
      isActive: true
    }
  })
  console.log('✅ Cliente creado:')
  console.log('   Email:', client.email)
  console.log('   Password: pizza2025\n')

  // 3. CREAR TIENDA
  const store = await prisma.storeSettings.create({
    data: {
      userId: client.id,
      storeName: 'Pizzería La Casa',
      storeSlug: 'pizzeria-lacasa',
      storeActive: true,
      country: 'Mexico',
      language: 'es',
      currency: 'MXN',
      distanceUnit: 'km',
      whatsappMainNumber: '+5215512345678',
      cashPaymentEnabled: true,
      deliveryEnabled: true,
      paymentsEnabled: true,
      deliveryCalculationMethod: 'manual',
      manualDeliveryMessage: 'Contáctanos para calcular el envío'
    }
  })
  console.log('✅ Tienda creada:')
  console.log('   Nombre:', store.storeName)
  console.log('   Slug:', store.storeSlug)
  console.log('   URL: /tienda/' + store.storeSlug + '\n')

  // 4. CREAR CATEGORÍA
  const category = await prisma.category.create({
    data: {
      userId: client.id,
      name: 'Pizzas',
      description: 'Nuestras deliciosas pizzas artesanales',
      isActive: true,
      isVisibleInStore: true,
      order: 1,
      color: '#FF6B6B'
    }
  })
  console.log('✅ Categoría creada:', category.name + '\n')

  // 5. CREAR PRODUCTO CON VARIANTES Y OPCIONES
  const product = await prisma.product.create({
    data: {
      userId: client.id,
      name: 'Pizza Margarita',
      description: 'Clásica pizza con tomate, mozzarella y albahaca',
      price: 150.00,
      stock: 100,
      isActive: true,
      hasVariants: true,
      variantType: 'size',
      variantLabel: 'Tamaño',
      trackQuantity: false,
      allowPickup: true,
      allowShipping: true
    }
  })

  // Relacionar producto con categoría
  await prisma.categoryProduct.create({
    data: {
      categoryId: category.id,
      productId: product.id,
      order: 1
    }
  })

  // Crear variantes
  await prisma.productVariant.createMany({
    data: [
      {
        productId: product.id,
        name: 'Tamaño',
        value: 'Chica',
        price: 120.00,
        isActive: true
      },
      {
        productId: product.id,
        name: 'Tamaño',
        value: 'Mediana',
        price: 150.00,
        isActive: true
      },
      {
        productId: product.id,
        name: 'Tamaño',
        value: 'Grande',
        price: 180.00,
        isActive: true
      }
    ]
  })

  // Crear opción con choices
  const option = await prisma.productOption.create({
    data: {
      productId: product.id,
      name: 'Ingredientes Extra',
      required: false,
      maxSelections: 3
    }
  })

  await prisma.productOptionChoice.createMany({
    data: [
      {
        optionId: option.id,
        name: 'Extra Queso',
        price: 20.00,
        isActive: true,
        order: 1
      },
      {
        optionId: option.id,
        name: 'Pepperoni',
        price: 25.00,
        isActive: true,
        order: 2
      },
      {
        optionId: option.id,
        name: 'Champiñones',
        price: 15.00,
        isActive: true,
        order: 3
      },
      {
        optionId: option.id,
        name: 'Aceitunas',
        price: 15.00,
        isActive: true,
        order: 4
      }
    ]
  })

  console.log('✅ Producto creado:', product.name)
  console.log('   - 3 variantes de tamaño')
  console.log('   - 4 ingredientes extras\n')

  console.log('════════════════════════════════════════════')
  console.log('✅ SEED COMPLETADO')
  console.log('════════════════════════════════════════════\n')

  console.log('📋 CREDENCIALES DE ACCESO:\n')

  console.log('🔑 ADMIN:')
  console.log('   URL: https://multt.vercel.app/login')
  console.log('   Email: admin@multisaas.com')
  console.log('   Password: admin2025\n')

  console.log('🏪 CLIENTE (Dueño de la Pizzería):')
  console.log('   URL: https://multt.vercel.app/login')
  console.log('   Email: pizzeria@lacasa.com')
  console.log('   Password: pizza2025\n')

  console.log('🍕 TIENDA PÚBLICA:')
  console.log('   URL: https://multt.vercel.app/tienda/pizzeria-lacasa\n')

  console.log('════════════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
