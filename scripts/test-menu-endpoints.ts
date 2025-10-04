async function testMenuEndpoints() {
  console.log('🧪 TESTING MENU ENDPOINTS')
  console.log('========================')

  const clienteId = 'mi-tienda-digital'

  try {
    // 1. Test store endpoint
    console.log('\n🏪 Testing store endpoint...')
    const storeResponse = await fetch(`http://localhost:3002/api/tienda/${clienteId}`)
    console.log('Status:', storeResponse.status)
    
    if (storeResponse.ok) {
      const storeData = await storeResponse.json()
      console.log('✅ Store data loaded:', {
        storeName: storeData.storeName,
        storeActive: storeData.storeActive,
        deliveryEnabled: storeData.deliveryEnabled
      })
    } else {
      console.log('❌ Store endpoint failed')
    }

    // 2. Test categories endpoint
    console.log('\n📁 Testing categories endpoint...')
    const categoriesResponse = await fetch(`http://localhost:3002/api/tienda/${clienteId}/categories`)
    console.log('Status:', categoriesResponse.status)
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json()
      console.log('✅ Categories loaded:', categoriesData.length, 'categories')
      categoriesData.forEach(category => {
        console.log(`  - ${category.name}: ${category.products.length} products`)
      })
    } else {
      console.log('❌ Categories endpoint failed')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testMenuEndpoints().catch(console.error)
