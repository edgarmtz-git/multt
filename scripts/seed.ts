import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // ==================== USUARIO ADMIN ====================
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sistema.com' },
    update: {},
    create: {
      email: 'admin@sistema.com',
      name: 'Administrador del Sistema',
      password: adminPassword,
      role: 'ADMIN',
      company: 'Sistema MultiTenant',
      isActive: true,
      isSuspended: false,
      loginAttempts: 0,
      twoFactorEnabled: false,
    },
  })
  console.log('✅ Usuario admin creado:', admin.email)

  // ==================== RESTAURANTE: LA CASA DEL SABOR ====================
  const restaurantPassword = await bcrypt.hash('restaurante123', 12)
  const restaurant = await prisma.user.upsert({
    where: { email: 'restaurante@lacasadelsabor.com' },
    update: {},
    create: {
      email: 'restaurante@lacasadelsabor.com',
      name: 'Carlos Hernández',
      password: restaurantPassword,
      role: 'CLIENT',
      company: 'La Casa del Sabor',
      isActive: true,
      isSuspended: false,
      loginAttempts: 0,
      twoFactorEnabled: false,
    },
  })
  console.log('✅ Usuario restaurante creado:', restaurant.email)

  // ==================== CONFIGURACIÓN DE LA TIENDA ====================
  const storeSettings = await prisma.storeSettings.upsert({
    where: { userId: restaurant.id },
    update: {},
    create: {
      userId: restaurant.id,
      storeName: 'La Casa del Sabor',
      storeSlug: 'lacasadelsabor',
      email: 'pedidos@lacasadelsabor.com',
      address: 'Av. Reforma 123, Col. Centro, CDMX',
      whatsappMainNumber: '+52 55 1234 5678',
      phoneNumber: '+52 55 8765 4321',
      country: 'Mexico',
      language: 'es',
      currency: 'MXN',
      distanceUnit: 'km',
      mapProvider: 'openstreetmap',
      taxRate: 0.0,
      taxMethod: 'included',

      // Horarios de negocio
      enableBusinessHours: true,
      disableCheckoutOutsideHours: false,
      businessHours: {
        monday: { open: '09:00', close: '22:00', isOpen: true },
        tuesday: { open: '09:00', close: '22:00', isOpen: true },
        wednesday: { open: '09:00', close: '22:00', isOpen: true },
        thursday: { open: '09:00', close: '22:00', isOpen: true },
        friday: { open: '09:00', close: '23:00', isOpen: true },
        saturday: { open: '10:00', close: '23:00', isOpen: true },
        sunday: { open: '10:00', close: '21:00', isOpen: true },
      },

      // Configuración de entrega
      deliveryEnabled: true,
      deliveryCalculationMethod: 'zones',
      pricePerKm: 10.0, // $10 por kilómetro (ejemplo para cuando se cambie a 'distance')
      minDeliveryFee: 30.0, // Costo mínimo de $30 para envíos cortos
      maxDeliveryDistance: 10.0,
      deliveryScheduleEnabled: true,
      scheduleType: 'unified',
      advanceDays: 1,
      unifiedSchedule: {
        monday: { slots: ['13:00-15:00', '19:00-22:00'], isAvailable: true },
        tuesday: { slots: ['13:00-15:00', '19:00-22:00'], isAvailable: true },
        wednesday: { slots: ['13:00-15:00', '19:00-22:00'], isAvailable: true },
        thursday: { slots: ['13:00-15:00', '19:00-22:00'], isAvailable: true },
        friday: { slots: ['13:00-15:00', '19:00-23:00'], isAvailable: true },
        saturday: { slots: ['13:00-16:00', '19:00-23:00'], isAvailable: true },
        sunday: { slots: ['13:00-16:00', '19:00-21:00'], isAvailable: true },
      },

      // Configuración de pagos
      paymentsEnabled: true,
      cashPaymentEnabled: true,
      cashPaymentInstructions: 'Aceptamos efectivo. Por favor ten el monto exacto o cambio disponible.',
      bankTransferEnabled: true,
      bankName: 'BBVA',
      accountNumber: '0123456789',
      accountHolder: 'La Casa del Sabor SA de CV',
      clabe: '012180001234567890',
      transferInstructions: 'Realiza tu transferencia y envíanos el comprobante por WhatsApp.',
      paymentInstructions: 'Puedes pagar en efectivo al recibir tu pedido o por transferencia bancaria.',

      // Estado de la tienda
      storeActive: true,
      passwordProtected: false,

      // Redes sociales
      instagramLink: 'https://instagram.com/lacasadelsabor',
      facebookLink: 'https://facebook.com/lacasadelsabor',
    },
  })
  console.log('✅ Configuración de tienda creada:', storeSettings.storeName)

  // ==================== ZONAS DE ENTREGA ====================
  const deliveryZones = [
    {
      name: 'Centro (Gratis)',
      type: 'FIXED' as const,
      isActive: true,
      order: 1,
      fixedPrice: 0,
      freeDeliveryThreshold: 0,
      estimatedTime: 30,
      description: 'Colonia Centro, Roma Norte, Condesa',
      storeSettingsId: storeSettings.id,
    },
    {
      name: 'Zonas Cercanas',
      type: 'FIXED' as const,
      isActive: true,
      order: 2,
      fixedPrice: 50,
      freeDeliveryThreshold: 300,
      estimatedTime: 45,
      description: 'Polanco, San Ángel, Coyoacán',
      storeSettingsId: storeSettings.id,
    },
    {
      name: 'Zona Extendida',
      type: 'FIXED' as const,
      isActive: true,
      order: 3,
      fixedPrice: 100,
      freeDeliveryThreshold: 500,
      estimatedTime: 60,
      description: 'Satélite, Santa Fe, Interlomas',
      storeSettingsId: storeSettings.id,
    },
  ]

  for (const zone of deliveryZones) {
    await prisma.deliveryZone.create({ data: zone })
  }
  console.log('✅ Zonas de entrega creadas')

  // ==================== CATEGORÍAS DEL RESTAURANTE ====================
  const categories = [
    {
      name: 'Platillos Fuertes',
      description: 'Nuestros platillos principales con las mejores recetas tradicionales',
      color: '#EF4444',
      icon: '🍽️',
      order: 1,
      isVisibleInStore: true,
      userId: restaurant.id,
    },
    {
      name: 'Entradas',
      description: 'Deliciosas entradas para comenzar tu comida',
      color: '#F59E0B',
      icon: '🥗',
      order: 2,
      isVisibleInStore: true,
      userId: restaurant.id,
    },
    {
      name: 'Bebidas',
      description: 'Refrescantes bebidas naturales y tradicionales',
      color: '#3B82F6',
      icon: '🥤',
      order: 3,
      isVisibleInStore: true,
      userId: restaurant.id,
    },
    {
      name: 'Postres',
      description: 'Dulces postres caseros para terminar tu comida',
      color: '#EC4899',
      icon: '🍰',
      order: 4,
      isVisibleInStore: true,
      userId: restaurant.id,
    },
    {
      name: 'Especialidades',
      description: 'Platillos especiales de la casa',
      color: '#8B5CF6',
      icon: '⭐',
      order: 5,
      isVisibleInStore: true,
      userId: restaurant.id,
    },
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.create({ data: category })
    createdCategories.push(created)
  }
  console.log('✅ Categorías creadas:', createdCategories.length)

  // ==================== OPCIONES GLOBALES ====================
  const globalOptions = [
    {
      name: 'Nivel de Picante',
      type: 'radio',
      description: 'Elige qué tan picante quieres tu platillo',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      isActive: true,
      order: 1,
      userId: restaurant.id,
      choices: [
        { name: 'Sin Picante', price: 0, order: 1 },
        { name: 'Poco Picante', price: 0, order: 2 },
        { name: 'Picante Medio', price: 0, order: 3 },
        { name: 'Muy Picante', price: 0, order: 4 },
        { name: 'Extremo 🔥', price: 0, order: 5 },
      ],
    },
    {
      name: 'Extras',
      type: 'checkbox',
      description: 'Agrega extras a tu platillo',
      minSelections: 0,
      maxSelections: null,
      isRequired: false,
      isActive: true,
      order: 2,
      userId: restaurant.id,
      choices: [
        { name: 'Aguacate Extra', price: 25, order: 1 },
        { name: 'Queso Gratinado', price: 30, order: 2 },
        { name: 'Crema', price: 15, order: 3 },
        { name: 'Frijoles Refritos', price: 20, order: 4 },
        { name: 'Arroz Blanco', price: 20, order: 5 },
      ],
    },
    {
      name: 'Tamaño de Porción',
      type: 'radio',
      description: 'Selecciona el tamaño de tu porción',
      minSelections: 1,
      maxSelections: 1,
      isRequired: true,
      isActive: true,
      order: 3,
      userId: restaurant.id,
      choices: [
        { name: 'Individual', price: 0, order: 1 },
        { name: 'Mediana (+2 personas)', price: 50, order: 2 },
        { name: 'Grande (+4 personas)', price: 100, order: 3 },
      ],
    },
  ]

  const createdGlobalOptions = []
  for (const option of globalOptions) {
    const { choices, ...optionData } = option
    const createdOption = await prisma.globalOption.create({
      data: {
        ...optionData,
        choices: {
          create: choices,
        },
      },
      include: { choices: true },
    })
    createdGlobalOptions.push(createdOption)
  }
  console.log('✅ Opciones globales creadas:', createdGlobalOptions.length)

  // ==================== PRODUCTOS DEL RESTAURANTE ====================
  const products = [
    // Platillos Fuertes
    {
      name: 'Enchiladas Suizas',
      description: 'Tortillas de maíz rellenas de pollo con salsa verde, gratinadas con queso y crema',
      price: 145,
      stock: 50,
      isActive: true,
      hasVariants: false,
      allowPickup: true,
      allowShipping: true,
      trackQuantity: true,
      dailyCapacity: false,
      maxOrderQuantity: true,
      maxQuantity: 5,
      userId: restaurant.id,
      categoryId: createdCategories[0].id,
      globalOptionIds: [createdGlobalOptions[0].id, createdGlobalOptions[1].id, createdGlobalOptions[2].id],
    },
    {
      name: 'Mole Poblano',
      description: 'Pechuga de pollo bañada en auténtico mole poblano con ajonjolí, arroz y tortillas',
      price: 165,
      stock: 30,
      isActive: true,
      hasVariants: false,
      allowPickup: true,
      allowShipping: true,
      trackQuantity: true,
      dailyCapacity: true,
      maxDailySales: 20,
      maxOrderQuantity: true,
      maxQuantity: 3,
      userId: restaurant.id,
      categoryId: createdCategories[0].id,
      globalOptionIds: [createdGlobalOptions[0].id, createdGlobalOptions[1].id, createdGlobalOptions[2].id],
    },
    {
      name: 'Tacos al Pastor',
      description: 'Tacos de carne al pastor con piña, cilantro, cebola y salsas',
      price: 85,
      stock: 100,
      isActive: true,
      hasVariants: true,
      variantType: 'Cantidad',
      variantLabel: 'Selecciona la cantidad',
      allowPickup: true,
      allowShipping: true,
      trackQuantity: false,
      userId: restaurant.id,
      categoryId: createdCategories[0].id,
      variants: [
        { name: 'Orden de 3', value: '3', price: 85, stock: 100, isActive: true },
        { name: 'Orden de 5', value: '5', price: 130, stock: 100, isActive: true },
        { name: 'Orden de 10', value: '10', price: 240, stock: 100, isActive: true },
      ],
      globalOptionIds: [createdGlobalOptions[0].id, createdGlobalOptions[1].id],
    },
    {
      name: 'Chiles en Nogada',
      description: 'Chile poblano relleno de picadillo, cubierto con salsa de nuez y granada (temporada)',
      price: 195,
      stock: 15,
      isActive: true,
      hasVariants: false,
      allowPickup: true,
      allowShipping: true,
      trackQuantity: true,
      dailyCapacity: true,
      maxDailySales: 10,
      maxOrderQuantity: true,
      maxQuantity: 2,
      userId: restaurant.id,
      categoryId: createdCategories[4].id, // Especialidades
      globalOptionIds: [createdGlobalOptions[2].id],
    },

    // Entradas
    {
      name: 'Guacamole con Totopos',
      description: 'Guacamole fresco preparado al momento con totopos de maíz',
      price: 65,
      stock: 40,
      isActive: true,
      hasVariants: false,
      allowPickup: true,
      allowShipping: true,
      trackQuantity: true,
      userId: restaurant.id,
      categoryId: createdCategories[1].id,
      globalOptionIds: [createdGlobalOptions[0].id],
    },
    {
      name: 'Quesadillas',
      description: 'Quesadillas de maíz con queso fundido',
      price: 75,
      stock: 60,
      isActive: true,
      hasVariants: true,
      variantType: 'Relleno',
      variantLabel: 'Elige tu relleno',
      allowPickup: true,
      allowShipping: true,
      trackQuantity: false,
      userId: restaurant.id,
      categoryId: createdCategories[1].id,
      variants: [
        { name: 'Queso', value: 'queso', price: 75, stock: null, isActive: true },
        { name: 'Champiñones', value: 'champinones', price: 85, stock: null, isActive: true },
        { name: 'Flor de Calabaza', value: 'flor', price: 90, stock: null, isActive: true },
        { name: 'Huitlacoche', value: 'huitlacoche', price: 95, stock: null, isActive: true },
      ],
      globalOptionIds: [createdGlobalOptions[0].id, createdGlobalOptions[1].id],
    },

    // Bebidas
    {
      name: 'Agua Fresca del Día',
      description: 'Agua fresca natural preparada diariamente',
      price: 35,
      stock: 80,
      isActive: true,
      hasVariants: true,
      variantType: 'Sabor',
      variantLabel: 'Elige tu sabor',
      allowPickup: true,
      allowShipping: true,
      trackQuantity: false,
      userId: restaurant.id,
      categoryId: createdCategories[2].id,
      variants: [
        { name: 'Jamaica', value: 'jamaica', price: 35, stock: null, isActive: true },
        { name: 'Horchata', value: 'horchata', price: 35, stock: null, isActive: true },
        { name: 'Tamarindo', value: 'tamarindo', price: 35, stock: null, isActive: true },
        { name: 'Limón con Chía', value: 'limon', price: 40, stock: null, isActive: true },
      ],
      globalOptionIds: [],
    },
    {
      name: 'Cerveza Nacional',
      description: 'Cervezas mexicanas frías',
      price: 45,
      stock: 100,
      isActive: true,
      hasVariants: true,
      variantType: 'Marca',
      variantLabel: 'Elige tu marca',
      allowPickup: true,
      allowShipping: true,
      trackQuantity: true,
      userId: restaurant.id,
      categoryId: createdCategories[2].id,
      variants: [
        { name: 'Corona', value: 'corona', price: 45, stock: 50, isActive: true },
        { name: 'Victoria', value: 'victoria', price: 40, stock: 30, isActive: true },
        { name: 'Modelo Especial', value: 'modelo', price: 45, stock: 20, isActive: true },
      ],
      globalOptionIds: [],
    },

    // Postres
    {
      name: 'Flan Napolitano',
      description: 'Flan casero con cajeta y nuez',
      price: 55,
      stock: 25,
      isActive: true,
      hasVariants: false,
      allowPickup: true,
      allowShipping: true,
      trackQuantity: true,
      dailyCapacity: true,
      maxDailySales: 15,
      userId: restaurant.id,
      categoryId: createdCategories[3].id,
      globalOptionIds: [],
    },
    {
      name: 'Pastel de Tres Leches',
      description: 'Esponjoso pastel bañado en tres leches',
      price: 65,
      stock: 20,
      isActive: true,
      hasVariants: false,
      allowPickup: true,
      allowShipping: true,
      trackQuantity: true,
      dailyCapacity: true,
      maxDailySales: 12,
      userId: restaurant.id,
      categoryId: createdCategories[3].id,
      globalOptionIds: [],
    },
  ]

  for (const product of products) {
    const { categoryId, globalOptionIds, variants, ...productData } = product

    const createdProduct = await prisma.product.create({
      data: productData,
    })

    // Relación con categoría
    await prisma.categoryProduct.create({
      data: {
        categoryId,
        productId: createdProduct.id,
        order: 0,
      },
    })

    // Relación con opciones globales
    if (globalOptionIds && globalOptionIds.length > 0) {
      for (let i = 0; i < globalOptionIds.length; i++) {
        const globalOption = createdGlobalOptions.find(go => go.id === globalOptionIds[i])
        await prisma.productGlobalOption.create({
          data: {
            productId: createdProduct.id,
            globalOptionId: globalOptionIds[i],
            minSelections: globalOption?.minSelections,
            maxSelections: globalOption?.maxSelections,
            isRequired: globalOption?.isRequired ?? false,
            order: i,
          },
        })
      }
    }

    // Crear variantes si las tiene
    if (variants && variants.length > 0) {
      for (const variant of variants) {
        await prisma.productVariant.create({
          data: {
            ...variant,
            productId: createdProduct.id,
          },
        })
      }
    }
  }
  console.log('✅ Productos creados:', products.length)

  // ==================== PEDIDOS DE EJEMPLO ====================
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber,
      status: 'CONFIRMED',
      userId: restaurant.id,
      customerName: 'María González',
      customerEmail: 'maria@example.com',
      customerWhatsApp: '+52 55 9876 5432',
      deliveryMethod: 'delivery',
      address: {
        street: 'Calle Morelos 45',
        colonia: 'Centro',
        city: 'Ciudad de México',
        postalCode: '06000',
        references: 'Casa azul, portón negro',
      },
      subtotal: 375,
      deliveryFee: 0,
      total: 375,
      paymentMethod: 'cash',
      notes: 'Sin cebolla en las enchiladas, por favor',
    },
  })

  // Obtener productos para el pedido
  const enchiladas = await prisma.product.findFirst({
    where: { name: 'Enchiladas Suizas', userId: restaurant.id },
  })
  const aguaFresca = await prisma.product.findFirst({
    where: { name: 'Agua Fresca del Día', userId: restaurant.id },
    include: { variants: true },
  })

  if (enchiladas) {
    await prisma.orderItem.create({
      data: {
        orderId: sampleOrder.id,
        productId: enchiladas.id,
        quantity: 2,
        price: enchiladas.price,
      },
    })
  }

  if (aguaFresca && aguaFresca.variants[0]) {
    await prisma.orderItem.create({
      data: {
        orderId: sampleOrder.id,
        productId: aguaFresca.id,
        variantId: aguaFresca.variants[0].id,
        variantName: aguaFresca.variants[0].name,
        quantity: 2,
        price: aguaFresca.variants[0].price,
      },
    })
  }

  console.log('✅ Pedido de ejemplo creado:', sampleOrder.orderNumber)

  // ==================== INVITACIÓN DE EJEMPLO ====================
  const invitationCode = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 días de validez

  const invitation = await prisma.invitation.create({
    data: {
      code: invitationCode,
      clientName: 'Nuevo Restaurante',
      clientEmail: 'nuevo@restaurante.com',
      clientPhone: '+52 55 1111 2222',
      slug: 'nuevorestaurante',
      status: 'PENDING',
      expiresAt,
      createdBy: admin.id,
      isActive: true,
    },
  })
  console.log('✅ Invitación de ejemplo creada:', invitation.code)

  // Obtener la URL de la aplicación desde las variables de entorno
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3001'

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('\n📋 CREDENCIALES DE ACCESO:')
  console.log('\n👨‍💼 ADMIN:')
  console.log('   Email: admin@sistema.com')
  console.log('   Password: admin123')
  console.log('   Panel: ' + appUrl + '/admin')
  console.log('\n🍴 RESTAURANTE (La Casa del Sabor):')
  console.log('   Email: restaurante@lacasadelsabor.com')
  console.log('   Password: restaurante123')
  console.log('   Slug: lacasadelsabor')
  console.log('   Dashboard: ' + appUrl + '/dashboard')
  console.log('   Tienda Pública: ' + appUrl + '/tienda/lacasadelsabor')
  console.log('\n🎫 INVITACIÓN PENDIENTE:')
  console.log('   Código:', invitation.code)
  console.log('   Para: ' + invitation.clientEmail)
  console.log('   URL: ' + appUrl + '/invite/' + invitation.code)
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
