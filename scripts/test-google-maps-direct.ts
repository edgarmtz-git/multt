#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testGoogleMapsDirect() {
  console.log('🧪 Probando Google Maps directamente...\n')

  try {
    // 1. Obtener configuración de la base de datos
    console.log('1. Obteniendo configuración...')
    const settings = await prisma.storeSettings.findFirst({
      where: { mapProvider: 'GOOGLE' }
    })

    if (!settings) {
      console.log('❌ No se encontró configuración con Google Maps')
      return
    }

    console.log('✅ Configuración encontrada:')
    console.log(`   - Tienda: ${settings.storeName}`)
    console.log(`   - Proveedor: ${settings.mapProvider}`)
    console.log(`   - API Key: ${settings.googleMapsApiKey ? 'Configurada' : 'No configurada'}`)

    if (!settings.googleMapsApiKey) {
      console.log('❌ API Key no configurada')
      return
    }

    // 2. Crear un archivo HTML de prueba
    console.log('\n2. Creando archivo de prueba...')
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Google Maps Test</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        #map { height: 400px; width: 100%; border: 1px solid #ccc; }
        .info { margin: 10px 0; padding: 10px; background: #f0f0f0; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🗺️ Prueba de Google Maps</h1>
    <div class="info">
        <strong>API Key:</strong> ${settings.googleMapsApiKey.substring(0, 20)}...<br>
        <strong>Proveedor:</strong> ${settings.mapProvider}<br>
        <strong>Tienda:</strong> ${settings.storeName}
    </div>
    <div id="map"></div>
    <div class="info">
        <strong>Instrucciones:</strong> Haz clic en el mapa para seleccionar una ubicación
    </div>

    <script>
        let map;
        let marker;
        
        function initMap() {
            console.log('🗺️ Inicializando Google Maps...');
            
            // Centro en Ciudad de México
            const center = { lat: 19.4326, lng: -99.1332 };
            
            // Crear mapa
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 15,
                center: center,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
            
            // Crear marcador
            marker = new google.maps.Marker({
                position: center,
                map: map,
                draggable: true,
                title: 'Ubicación seleccionada'
            });
            
            // Evento cuando se arrastra el marcador
            marker.addListener('dragend', function() {
                const position = marker.getPosition();
                console.log('📍 Marcador movido:', position.lat(), position.lng());
                updateInfo(position.lat(), position.lng());
            });
            
            // Evento cuando se hace clic en el mapa
            map.addListener('click', function(event) {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                marker.setPosition({ lat, lng });
                console.log('🖱️ Clic en mapa:', lat, lng);
                updateInfo(lat, lng);
            });
            
            console.log('✅ Google Maps inicializado correctamente');
        }
        
        function updateInfo(lat, lng) {
            const info = document.querySelector('.info:last-child');
            info.innerHTML = \`<strong>Coordenadas:</strong> \${lat.toFixed(6)}, \${lng.toFixed(6)}<br>
                            <strong>Estado:</strong> ✅ Google Maps funcionando correctamente\`;
        }
        
        // Cargar Google Maps
        const script = document.createElement('script');
        script.src = 'https://maps.googleapis.com/maps/api/js?key=${settings.googleMapsApiKey}&callback=initMap';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    </script>
</body>
</html>
    `

    // Escribir archivo
    const fs = require('fs')
    const path = require('path')
    const filePath = path.join(__dirname, '..', 'public', 'google-maps-test.html')
    
    fs.writeFileSync(filePath, htmlContent)
    console.log(`✅ Archivo creado: ${filePath}`)

    console.log('\n🎯 Para probar Google Maps:')
    console.log('1. Abre tu navegador')
    console.log('2. Ve a: http://localhost:3001/google-maps-test.html')
    console.log('3. Deberías ver el mapa de Google Maps interactivo')
    console.log('4. Haz clic en el mapa o arrastra el marcador')

    console.log('\n📱 Funcionalidades a probar:')
    console.log('✅ Mapa interactivo de Google Maps')
    console.log('✅ Marcador arrastrable')
    console.log('✅ Clic en el mapa para seleccionar ubicación')
    console.log('✅ Coordenadas en tiempo real')
    console.log('✅ Controles de zoom y navegación')

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testGoogleMapsDirect()
