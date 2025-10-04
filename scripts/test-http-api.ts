import fetch from 'node-fetch'

async function testHTTPAPI() {
  try {
    console.log('🌐 PROBANDO API HTTP\n')
    
    const userId = 'cmfwsez430001s63iz8wh5xd2'
    const url = `http://localhost:3000/api/availability/check?userId=${userId}`
    
    console.log(`📡 URL: ${url}`)
    
    const response = await fetch(url)
    const data = await response.json()
    
    console.log(`📊 Status: ${response.status}`)
    console.log(`📋 Response:`, JSON.stringify(data, null, 2))
    
    if (response.ok) {
      console.log('\n✅ API HTTP FUNCIONANDO!')
    } else {
      console.log('\n❌ Error en API HTTP')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testHTTPAPI()
