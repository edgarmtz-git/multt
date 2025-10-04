// Script simple para probar el menú
console.log('🧪 TESTING SIMPLE MENU')
console.log('=====================')

// Simular datos de prueba
const testStoreInfo = {
  id: 'test',
  storeName: 'Nanixhe Chicken',
  storeSlug: 'mi-tienda-digital',
  email: 'test@test.com',
  address: null,
  whatsappMainNumber: '+1234567890',
  country: 'MX',
  currency: 'MXN',
  deliveryEnabled: false,
  useBasePrice: false,
  baseDeliveryPrice: 0,
  baseDeliveryThreshold: 0,
  deliveryScheduleEnabled: false,
  scheduleType: 'date',
  advanceDays: 1,
  serviceHours: {},
  unifiedSchedule: {},
  storeActive: true
}

const testCategories = [
  {
    id: '1',
    name: 'Bebidas',
    description: 'Bebidas frías y calientes',
    color: '#3B82F6',
    icon: '🥤',
    order: 1,
    isActive: true,
    imageUrl: null,
    isVisibleInStore: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'test',
    products: [
      {
        id: '1',
        name: 'Café Americano',
        description: 'Café negro americano',
        price: 35,
        stock: 0,
        imageUrl: null,
        isActive: true,
        hasVariants: false,
        variantType: null,
        variantLabel: null,
        deliveryHome: true,
        deliveryStore: false,
        deliveryBoth: true,
        trackQuantity: false,
        dailyCapacity: false,
        maxDailySales: null,
        maxOrderQuantity: false,
        maxQuantity: null,
        minOrderQuantity: false,
        minQuantity: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'test',
        variants: [],
        options: []
      }
    ]
  }
]

console.log('✅ Test data created:')
console.log('Store:', testStoreInfo.storeName)
console.log('Categories:', testCategories.length)
console.log('Products:', testCategories[0].products.length)

console.log('\n🌐 Open browser at: http://localhost:3002/tienda/mi-tienda-digital')
console.log('📱 The menu should show:')
console.log('  - Header with "Nanixhe Chicken"')
console.log('  - Search bar')
console.log('  - Category: "Bebidas"')
console.log('  - Product: "Café Americano"')
