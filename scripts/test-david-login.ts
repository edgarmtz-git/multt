// Usando fetch nativo de Node.js

async function testDavidLogin() {
  console.log('🔐 Probando login de David Alberto Guzmán...\n')

  try {
    // Paso 1: Intentar login con las credenciales de David
    console.log('📱 Paso 1: Intentando login...')
    
    const loginResponse = await fetch('http://localhost:3000/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'david@restaurante-mexicano.com',
        password: 'david123',
        redirect: false
      })
    })

    console.log(`✅ Respuesta del login: ${loginResponse.status}`)
    
    if (loginResponse.ok) {
      console.log('✅ Login exitoso!')
    } else {
      const error = await loginResponse.text()
      console.log(`❌ Error en login: ${error}`)
    }

    // Paso 2: Verificar que las URLs funcionan
    console.log('\n🔗 Paso 2: Verificando URLs...')
    
    const urls = [
      'http://localhost:3000/login',
      'http://localhost:3000/dashboard', 
      'http://localhost:3000/tienda/restaurante-mexicano-david'
    ]

    for (const url of urls) {
      try {
        const response = await fetch(url)
        console.log(`✅ ${url} - Status: ${response.status}`)
      } catch (error) {
        console.log(`❌ ${url} - Error: ${error}`)
      }
    }

    console.log('\n🎉 ¡Verificación completada!')
    console.log('\n📋 Para probar manualmente:')
    console.log('1. Ve a: http://localhost:3000/login')
    console.log('2. Usa estas credenciales:')
    console.log('   📧 Email: david@restaurante-mexicano.com')
    console.log('   🔑 Contraseña: david123')
    console.log('3. Deberías ir al dashboard de David')
    console.log('4. Ve a: http://localhost:3000/tienda/restaurante-mexicano-david')
    console.log('5. Deberías ver los productos del restaurante mexicano')

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  }
}

testDavidLogin()
