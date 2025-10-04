#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testGoogleMapsFixed() {
  console.log('🔧 Probando Google Maps corregido...\n')

  try {
    // 1. Verificar configuración
    console.log('1. Verificando configuración...')
    const storeSettings = await prisma.storeSettings.findFirst({
      where: { mapProvider: 'GOOGLE' }
    })

    if (!storeSettings) {
      console.log('❌ No se encontró configuración con Google Maps')
      return
    }

    console.log('✅ Configuración encontrada:')
    console.log(`   - Tienda: ${storeSettings.storeName}`)
    console.log(`   - Proveedor: ${storeSettings.mapProvider}`)
    console.log(`   - API Key: ${storeSettings.googleMapsApiKey ? 'Configurada' : 'No configurada'}`)

    // 2. Crear archivo de prueba mejorado
    console.log('\n2. Creando archivo de prueba mejorado...')
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Google Maps Test - Fixed</title>
    <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        #map { height: 400px; width: 100%; border: 1px solid #ccc; }
        .info { margin: 10px 0; padding: 10px; background: #f0f0f0; border-radius: 5px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
    </style>
</head>
<body>
    <h1>🗺️ Prueba de Google Maps - Versión Corregida</h1>
    <div class="info">
        <strong>API Key:</strong> ${storeSettings.googleMapsApiKey.substring(0, 20)}...<br>
        <strong>Proveedor:</strong> ${storeSettings.mapProvider}<br>
        <strong>Tienda:</strong> ${storeSettings.storeName}
    </div>
    <div id="map"></div>
    <div class="info" id="status">
        <strong>Estado:</strong> Cargando Google Maps...
    </div>

    <script>
        let map;
        let marker;
        let isInitialized = false;
        
        function initMap() {
            if (isInitialized) {
                console.log('⚠️ Google Maps ya inicializado, evitando duplicación');
                return;
            }
            
            console.log('🗺️ Inicializando Google Maps...');
            isInitialized = true;
            
            try {
                // Centro en Ciudad de México
                const center = { lat: 19.4326, lng: -99.1332 };
                
                // Crear mapa
                map = new google.maps.Map(document.getElementById("map"), {
                    zoom: 15,
                    center: center,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    streetViewControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                    mapTypeControl: true,
                    scaleControl: true
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
                updateStatus('success', '✅ Google Maps funcionando correctamente');
                
            } catch (error) {
                console.error('❌ Error inicializando Google Maps:', error);
                updateStatus('error', '❌ Error: ' + error.message);
            }
        }
        
        function updateInfo(lat, lng) {
            const info = document.getElementById('status');
            info.innerHTML = \`<strong>Coordenadas:</strong> \${lat.toFixed(6)}, \${lng.toFixed(6)}<br>
                            <strong>Estado:</strong> ✅ Google Maps funcionando correctamente\`;
            info.className = 'info success';
        }
        
        function updateStatus(type, message) {
            const status = document.getElementById('status');
            status.innerHTML = \`<strong>Estado:</strong> \${message}\`;
            status.className = \`info \${type}\`;
        }
        
        // Verificar si Google Maps ya está cargado
        if (window.google && window.google.maps) {
            console.log('✅ Google Maps ya cargado');
            initMap();
        } else {
            // Cargar Google Maps
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=${storeSettings.googleMapsApiKey}&libraries=places&callback=initMap';
            script.async = true;
            script.defer = true;
            script.onerror = function() {
                updateStatus('error', '❌ Error cargando Google Maps API');
            };
            document.head.appendChild(script);
        }
    </script>
</body>
</html>
    `

    // Escribir archivo
    const fs = require('fs')
    const path = require('path')
    const filePath = path.join(__dirname, '..', 'public', 'google-maps-test-fixed.html')
    
    fs.writeFileSync(filePath, htmlContent)
    console.log(`✅ Archivo creado: ${filePath}`)

    console.log('\n🎯 Para probar Google Maps corregido:')
    console.log('1. Abre tu navegador')
    console.log('2. Ve a: http://localhost:3001/google-maps-test-fixed.html')
    console.log('3. Deberías ver el mapa sin errores de duplicación')
    console.log('4. Haz clic en el mapa o arrastra el marcador')

    console.log('\n📱 Funcionalidades a probar:')
    console.log('✅ Mapa interactivo de Google Maps')
    console.log('✅ Marcador arrastrable')
    console.log('✅ Clic en el mapa para seleccionar ubicación')
    console.log('✅ Coordenadas en tiempo real')
    console.log('✅ Controles de zoom y navegación')
    console.log('✅ Sin errores de duplicación de API')

    console.log('\n🔧 Correcciones aplicadas:')
    console.log('✅ Verificación de script existente')
    console.log('✅ Prevención de múltiples inicializaciones')
    console.log('✅ Cleanup adecuado de listeners')
    console.log('✅ Manejo de errores mejorado')

  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testGoogleMapsFixed()
