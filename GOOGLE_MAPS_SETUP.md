# 🗺️ Configuración de Google Maps API

## 📋 **Pasos para Obtener tu API Key de Google Maps**

### **1. Crear una Cuenta en Google Cloud Console**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Crea un nuevo proyecto o selecciona uno existente

### **2. Habilitar la API de Google Maps**
1. En el menú lateral, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Maps JavaScript API"**
3. Haz clic en **"Habilitar"**
4. También habilita **"Geocoding API"** para mejor funcionalidad

### **3. Crear una API Key**
1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"** → **"Clave de API"**
3. Copia la API Key generada (formato: `AIzaSyBvOkBw...`)

### **4. Configurar Restricciones (Recomendado)**
1. Haz clic en la API Key creada
2. En **"Restricciones de aplicación"**:
   - Selecciona **"Sitios web HTTP"**
   - Agrega tu dominio: `https://tu-dominio.com/*`
   - Para desarrollo local: `http://localhost:3000/*`

3. En **"Restricciones de API"**:
   - Selecciona **"Restringir clave"**
   - Marca solo: **"Maps JavaScript API"** y **"Geocoding API"**

### **5. Configurar Facturación (Si es Necesario)**
- Google Maps tiene un límite gratuito generoso
- Para la mayoría de aplicaciones pequeñas, no necesitarás facturación
- Si excedes el límite, Google te notificará

## 🔧 **Configuración en la Aplicación**

### **1. Ir a Configuración**
1. Ve a **Dashboard** → **Configuración** → **Regional**
2. Selecciona **"Google Maps"** en el dropdown de proveedor
3. Pega tu API Key en el campo **"API Key de Google Maps"**
4. Haz clic en **"Guardar configuración"**

### **2. Verificar Funcionamiento**
1. Ve a **Configuración** → **Regional** → **"Editar"** dirección
2. El mapa debería mostrar el estilo de Google Maps
3. La geocodificación debería funcionar mejor

## ⚠️ **Consideraciones Importantes**

### **Seguridad**
- ✅ **Nunca** expongas tu API Key en el código frontend
- ✅ Usa restricciones de dominio
- ✅ Monitorea el uso en Google Cloud Console

### **Costos**
- ✅ **Gratuito** hasta 28,000 cargas de mapa por mes
- ✅ **Gratuito** hasta 40,000 solicitudes de geocodificación por mes
- 💰 Después de los límites: ~$7 por 1,000 cargas adicionales

### **Alternativas**
- **OpenStreetMap**: Completamente gratuito, sin API Key
- **Google Maps**: Mejor calidad visual, requiere API Key

## 🚀 **Beneficios de Google Maps**

### **Con API Key:**
- ✅ **Mejor calidad visual**
- ✅ **Geocodificación más precisa**
- ✅ **Información de tráfico en tiempo real**
- ✅ **Datos de negocios actualizados**
- ✅ **Mejor rendimiento**

### **Sin API Key (Fallback):**
- ⚠️ **Calidad limitada**
- ⚠️ **Puede tener restricciones de uso**
- ⚠️ **Menos funcionalidades**

## 🔍 **Solución de Problemas**

### **Error: "This API project is not authorized"**
- Verifica que la API esté habilitada
- Revisa las restricciones de la API Key

### **Error: "RefererNotAllowedMapError"**
- Agrega tu dominio a las restricciones de la API Key

### **Mapa no se carga**
- Verifica que la API Key sea correcta
- Revisa la consola del navegador para errores

### **Geocodificación no funciona**
- Habilita la "Geocoding API" en Google Cloud Console

## 📞 **Soporte**

Si tienes problemas:
1. Revisa la [documentación oficial de Google Maps](https://developers.google.com/maps/documentation)
2. Verifica tu configuración en Google Cloud Console
3. Revisa los logs en la consola del navegador
