# Sistema de Configuración de Pagos

## Descripción General

El sistema de pagos permite a los vendedores configurar métodos de pago para sus tiendas, incluyendo pagos en efectivo y transferencias bancarias. Está diseñado para ser simple, seguro y fácil de usar.

## Características Principales

### 1. Configuración de Pagos en Efectivo
- **Habilitación/Deshabilitación**: Control total sobre la disponibilidad
- **Instrucciones personalizadas**: Mensajes específicos para los clientes
- **Validación automática**: El sistema valida que las instrucciones sean claras

### 2. Configuración de Transferencias Bancarias
- **Datos bancarios completos**: Banco, titular, cuenta, CLABE
- **Validación de CLABE**: Verificación automática de 18 dígitos
- **Instrucciones personalizadas**: Guías específicas para transferencias
- **Seguridad**: Los datos se almacenan de forma segura

### 3. Configuración General
- **Instrucciones globales**: Mensajes que ven todos los clientes
- **Control de disponibilidad**: Activar/desactivar el sistema completo
- **Resumen visual**: Estado actual de todos los métodos

## Estructura de la Base de Datos

### Nuevos Campos en StoreSettings

```sql
-- Configuración de métodos de pago
cashPaymentEnabled          Boolean        @default(true)
cashPaymentInstructions     String?        // Instrucciones para pago en efectivo
bankTransferEnabled         Boolean        @default(false)
bankName                    String?        // Nombre del banco
accountNumber              String?       // Número de cuenta
accountHolder               String?       // Titular de la cuenta
clabe                       String?       // CLABE interbancaria
transferInstructions        String?       // Instrucciones para transferencia
paymentInstructions         String?       // Instrucciones generales de pago
```

## API Endpoints

### 1. Configuración de Pagos (Dashboard)
- **GET** `/api/dashboard/payment-settings` - Obtener configuración actual
- **PUT** `/api/dashboard/payment-settings` - Actualizar configuración

### 2. Métodos de Pago (Frontend)
- **GET** `/api/store/[slug]/payment-methods` - Obtener métodos disponibles

## Componentes React

### 1. PaymentSettings (Dashboard)
Ubicación: `app/dashboard/settings/components/payment-settings.tsx`

**Características:**
- Interfaz completa de configuración
- Validación en tiempo real
- Resumen visual del estado
- Guardado automático

**Uso:**
```tsx
<PaymentSettings 
  settings={settings} 
  setSettings={setSettings} 
/>
```

### 2. PaymentMethods (Frontend)
Ubicación: `components/payment/payment-methods.tsx`

**Características:**
- Muestra métodos disponibles
- Selección visual
- Detalles bancarios
- Instrucciones claras

**Uso:**
```tsx
<PaymentMethods 
  storeSlug="mi-tienda"
  onPaymentMethodSelect={handleSelect}
  selectedMethod={selectedMethod}
/>
```

### 3. PaymentCheckout (Frontend)
Ubicación: `components/payment/payment-checkout.tsx`

**Características:**
- Proceso completo de checkout
- Copia de datos bancarios
- Validación de selección
- Resumen del pedido

**Uso:**
```tsx
<PaymentCheckout 
  storeSlug="mi-tienda"
  orderTotal={150.00}
  onPaymentComplete={handlePayment}
/>
```

## Flujo de Configuración

### 1. Configuración Inicial
1. Ir a `/dashboard/settings`
2. Seleccionar pestaña "Pagos"
3. Habilitar métodos deseados
4. Completar datos bancarios (si aplica)
5. Agregar instrucciones personalizadas
6. Guardar configuración

### 2. Validaciones Automáticas
- **CLABE**: Debe tener exactamente 18 dígitos
- **Campos bancarios**: Requeridos si se habilita transferencia
- **Instrucciones**: Recomendadas para mejor experiencia

### 3. Experiencia del Cliente
1. Cliente ve métodos disponibles
2. Selecciona método preferido
3. Ve instrucciones específicas
4. Para transferencias: copia datos bancarios
5. Confirma selección

## Mejores Prácticas

### Para Vendedores
1. **Instrucciones claras**: Escribe instrucciones específicas y fáciles de seguir
2. **Datos bancarios completos**: Incluye toda la información necesaria
3. **Comunicación**: Mantén contacto con clientes para confirmar pagos
4. **Verificación**: Siempre confirma pagos antes de entregar

### Para Desarrolladores
1. **Validación**: Implementa validaciones tanto en frontend como backend
2. **Seguridad**: Los datos bancarios son sensibles, maneja con cuidado
3. **UX**: Haz el proceso lo más simple posible
4. **Feedback**: Proporciona confirmaciones claras al usuario

## Casos de Uso Comunes

### 1. Tienda Solo Efectivo
```json
{
  "paymentsEnabled": true,
  "cashPaymentEnabled": true,
  "cashPaymentInstructions": "Pago en efectivo al momento de la entrega. Ten el monto exacto preparado.",
  "bankTransferEnabled": false
}
```

### 2. Tienda con Transferencias
```json
{
  "paymentsEnabled": true,
  "cashPaymentEnabled": true,
  "bankTransferEnabled": true,
  "bankName": "BBVA Bancomer",
  "accountNumber": "0123456789",
  "accountHolder": "Juan Pérez García",
  "clabe": "012345678901234567",
  "transferInstructions": "Realiza la transferencia y envía el comprobante por WhatsApp"
}
```

### 3. Tienda Deshabilitada
```json
{
  "paymentsEnabled": false
}
```

## Seguridad y Privacidad

1. **Datos bancarios**: Se almacenan de forma segura en la base de datos
2. **Validación**: Todas las entradas se validan antes de guardar
3. **Acceso**: Solo el propietario de la tienda puede modificar la configuración
4. **Auditoría**: Los cambios se registran con timestamps

## Troubleshooting

### Problemas Comunes

1. **CLABE no válida**: Verificar que tenga exactamente 18 dígitos
2. **Métodos no aparecen**: Verificar que estén habilitados en configuración
3. **Datos bancarios incompletos**: Completar todos los campos requeridos
4. **Error de guardado**: Verificar conexión y permisos

### Logs y Debugging

Los logs se encuentran en la consola del servidor:
- Configuración de pagos: `🔍 Payment settings`
- Errores de validación: `❌ Validation error`
- Operaciones exitosas: `✅ Payment settings updated`

## Futuras Mejoras

1. **Múltiples cuentas bancarias**: Soporte para varios bancos
2. **Pagos digitales**: Integración con Stripe, PayPal, etc.
3. **Notificaciones**: Alertas automáticas de pagos
4. **Analytics**: Estadísticas de métodos de pago más usados
5. **Plantillas**: Configuraciones predefinidas por tipo de negocio
