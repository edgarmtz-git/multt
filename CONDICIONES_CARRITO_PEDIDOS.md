# 📋 CONDICIONES Y VALIDACIONES DEL CARRITO Y FINALIZACIÓN DE PEDIDO

## 🔐 **VALIDACIONES DEL FORMULARIO (Frontend)**

### **Información del Cliente**
- ✅ **Nombre**: Obligatorio, mínimo 2 caracteres, máximo 100
- ✅ **WhatsApp**: Obligatorio, formato válido (10-20 caracteres), solo números y símbolos permitidos
- ✅ **Email**: Opcional, formato de email válido

### **Método de Entrega**
- ✅ **Pickup/Delivery**: Selección obligatoria
- ✅ **Si es Delivery**: Campos de dirección obligatorios:
  - Calle (obligatorio)
  - Número (obligatorio) 
  - Colonia (obligatorio)
  - Tipo de casa (obligatorio)
  - Ciudad, Estado, Código postal (opcionales)
  - Referencias (opcional)

### **Método de Pago**
- ✅ **Efectivo/Transferencia**: Selección obligatoria
- ✅ **Si es Efectivo**: 
  - Monto debe ser mayor o igual al total
  - Se calcula cambio automáticamente

### **Botón de Envío**
- ✅ **Deshabilitado si**:
  - Está cargando (`isLoading`)
  - Nombre está vacío (`!customerName.trim()`)
  - WhatsApp no es válido (`!validateWhatsApp(customerWhatsApp)`)

---

## 🛡️ **VALIDACIONES DEL BACKEND (API)**

### **Esquema de Validación (Zod)**
- ✅ **customerName**: Nombre válido (2-100 caracteres, solo letras y espacios)
- ✅ **customerWhatsApp**: Formato WhatsApp válido (10-20 caracteres)
- ✅ **customerEmail**: Email válido (opcional)
- ✅ **deliveryMethod**: Solo 'DELIVERY' o 'PICKUP'
- ✅ **paymentMethod**: Solo 'CASH', 'CARD' o 'TRANSFER'
- ✅ **address**: Objeto de dirección válido (opcional)
- ✅ **items**: Array con mínimo 1 producto
- ✅ **subtotal**: Precio válido (0-999,999.99)
- ✅ **deliveryFee**: Precio válido (0-999,999.99)
- ✅ **total**: Precio válido (0-999,999.99)
- ✅ **observations**: Máximo 500 caracteres (opcional)

### **Validaciones de Negocio**
- ✅ **Tienda existe**: Debe existir el `storeSlug`
- ✅ **Tienda activa**: `storeActive` debe ser `true`
- ✅ **Productos válidos**: Cada item debe tener ID, nombre, cantidad y precio válidos
- ✅ **Cantidades**: Entre 1 y 999 por producto
- ✅ **Precios**: No negativos, máximo 999,999.99

---

## 🚚 **CONDICIONES DE ENVÍO**

### **Método por Zonas**
- ✅ **Zona seleccionada**: Obligatorio para calcular costo
- ✅ **Cálculo dinámico**: Se recalcula automáticamente cuando cambia el subtotal
- ✅ **Umbrales de envío gratis**: Si subtotal >= umbral, envío = $0
- ✅ **Precios fijos**: Cada zona tiene precio fijo definido

### **Método por Distancia**
- ✅ **Ubicación GPS**: Se obtiene automáticamente
- ✅ **Cálculo por km**: Precio por kilómetro configurado
- ✅ **Rango máximo**: Distancia máxima configurada
- ✅ **Precio mínimo**: Tarifa mínima de envío

### **Método Manual**
- ✅ **Mensaje informativo**: Se muestra mensaje configurado
- ✅ **Cálculo posterior**: El costo se calcula después del pedido

---

## 💰 **CONDICIONES DE PAGO**

### **Pago en Efectivo**
- ✅ **Monto suficiente**: Debe ser >= total del pedido
- ✅ **Cálculo de cambio**: Automático si monto > total
- ✅ **Validación**: Se valida antes de enviar

### **Pago por Transferencia**
- ✅ **Datos bancarios**: Se muestran datos de la tienda
- ✅ **Instrucciones**: Se incluyen instrucciones de pago
- ✅ **Sin validación de monto**: No se requiere monto específico

---

## 📦 **CONDICIONES DE PRODUCTOS**

### **Items del Carrito**
- ✅ **Mínimo 1 producto**: No se puede enviar carrito vacío
- ✅ **Precios calculados**: Incluyen variantes y opciones
- ✅ **Cantidades válidas**: Entre 1 y 999 por producto
- ✅ **Opciones**: Se guardan todas las opciones seleccionadas

### **Cálculo de Precios**
- ✅ **Precio unitario**: Base + variantes + opciones
- ✅ **Precio total**: Unitario × cantidad
- ✅ **Subtotal**: Suma de todos los items
- ✅ **Total final**: Subtotal + envío

---

## ⚠️ **CONDICIONES DE ERROR**

### **Errores de Validación**
- ❌ **Campos obligatorios vacíos**: Muestra toast de error
- ❌ **Formato inválido**: Muestra mensaje específico
- ❌ **Monto insuficiente**: Error en pago en efectivo
- ❌ **Dirección incompleta**: Error en método delivery

### **Errores de Sistema**
- ❌ **Tienda no encontrada**: Error 404
- ❌ **Tienda inactiva**: Error 403
- ❌ **Error de red**: Muestra mensaje genérico
- ❌ **Error de servidor**: Muestra mensaje de error

---

## 🔄 **FLUJO DE VALIDACIÓN**

1. **Frontend**: Valida formulario antes de enviar
2. **API**: Valida con esquema Zod
3. **Negocio**: Verifica tienda y productos
4. **Base de datos**: Crea pedido con transacción
5. **Respuesta**: Confirma creación exitosa

---

## ✅ **RESUMEN**

**Todas las condiciones están implementadas correctamente** y cubren:
- ✅ Validación completa del formulario
- ✅ Validación robusta del backend
- ✅ Cálculo correcto de precios y envíos
- ✅ Manejo de errores apropiado
- ✅ Flujo de validación completo

**El sistema es seguro y robusto** para manejar pedidos en producción.
