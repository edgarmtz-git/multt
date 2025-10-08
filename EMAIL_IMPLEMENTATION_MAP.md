# 📧 Mapa de Implementación del Sistema de Email

## 🎯 Análisis Completo del Proyecto

Después de analizar todo el código, he identificado **7 flujos críticos** donde se debe implementar email.

---

## 📍 Puntos de Integración Identificados

### 1️⃣ **NUEVO PEDIDO** (CRÍTICO - Alta Prioridad)

**Archivo:** `app/api/orders/route.ts` (línea 157-163)

**Flujo actual:**
```typescript
console.log('✅ Pedido creado:', {
  orderId: result.order.id,
  orderNumber,
  customerName,
  total,
  itemsCount: result.orderItems.length
})
```

**Implementación de email:**

**A) Email al CLIENTE** (quien hace el pedido)
- **Asunto:** `Pedido #${orderNumber} confirmado - ${storeName}`
- **Contenido:**
  - Confirmación del pedido
  - Resumen de productos
  - Total a pagar
  - Método de pago seleccionado
  - Método de entrega (pickup/delivery)
  - Dirección si es delivery
  - Link de tracking: `/tracking/order/${orderNumber}`
  - Datos de contacto del restaurante
  - Tiempo estimado de preparación

**B) Email al RESTAURANTE** (vendedor)
- **Asunto:** `🔔 Nuevo pedido #${orderNumber} - ${customerName}`
- **Contenido:**
  - Alerta de nuevo pedido
  - Datos del cliente (nombre, teléfono, email)
  - Resumen de productos con detalles
  - Total
  - Método de pago
  - Dirección de entrega si aplica
  - Observaciones del cliente
  - Link directo al dashboard: `/dashboard/orders`

**Destinatarios:**
- Cliente: `order.customerEmail` (si proporcionó email)
- Restaurante: `store.user.email` + `store.contactEmail` (si existe)

**Condiciones:**
- Solo enviar si el pedido se creó exitosamente
- Solo enviar al cliente si proporcionó email
- Siempre enviar al restaurante

---

### 2️⃣ **CAMBIO DE ESTADO DE PEDIDO** (Importante)

**Archivo:** `app/api/orders/[id]/route.ts` (línea 147-151)

**Flujo actual:**
```typescript
console.log('✅ Pedido actualizado:', {
  orderId: updatedOrder.id,
  newStatus: status,
  customerName: updatedOrder.customerName
})
```

**Implementación de email:**

**Email al CLIENTE** (solo para estados importantes)
- **Triggers:**
  - `CONFIRMED` → "Tu pedido ha sido confirmado"
  - `PREPARING` → "Estamos preparando tu pedido"
  - `READY` → "Tu pedido está listo para recoger/entregar"
  - `DELIVERED` → "Tu pedido ha sido entregado"
  - `CANCELLED` → "Tu pedido ha sido cancelado"

**Contenido por estado:**

```typescript
{
  CONFIRMED: {
    asunto: "Pedido confirmado",
    mensaje: "Hemos confirmado tu pedido. Tiempo estimado: 30-45 min"
  },
  PREPARING: {
    asunto: "Estamos preparando tu pedido",
    mensaje: "Tu pedido está siendo preparado con cuidado"
  },
  READY: {
    asunto: "¡Tu pedido está listo!",
    mensaje: deliveryMethod === 'PICKUP'
      ? "Puedes pasar a recogerlo"
      : "El repartidor saldrá en breve"
  },
  DELIVERED: {
    asunto: "Pedido entregado",
    mensaje: "¡Gracias por tu compra! Esperamos verte pronto"
  },
  CANCELLED: {
    asunto: "Pedido cancelado",
    mensaje: "Tu pedido ha sido cancelado. Cualquier cargo será reembolsado"
  }
}
```

**Destinatario:**
- Cliente: `order.customerEmail` (si existe)

**Condiciones:**
- Solo enviar si el cliente proporcionó email
- No enviar para `PENDING` (ya se envió confirmación inicial)

---

### 3️⃣ **INVITACIÓN A NUEVO CLIENTE** (CRÍTICO)

**Archivo:** `app/api/admin/invitations/route.ts` (línea 95)

**Flujo actual:**
```typescript
const invitation = await prisma.invitation.create({...})
return NextResponse.json(invitation) // ❌ No se envía email
```

**Implementación de email:**

**Email al NUEVO CLIENTE**
- **Asunto:** `Bienvenido a ${COMPANY_NAME} - Invitación para ${clientName}`
- **Contenido:**
  - Mensaje de bienvenida del admin
  - Explicación del servicio
  - Link de activación: `${APP_URL}/invite/${code}`
  - Datos de la cuenta:
    - Nombre de la tienda: `clientName`
    - Slug: `slug`
    - Email: `clientEmail`
  - Instrucciones para crear contraseña
  - Fecha de expiración de la invitación
  - Datos de contacto de soporte

**Destinatario:**
- `invitation.clientEmail`

**Condiciones:**
- Enviar inmediatamente después de crear la invitación
- Incluir fecha de expiración
- Solo si la invitación se creó exitosamente

---

### 4️⃣ **INVITACIÓN ACEPTADA** (Importante)

**Archivo:** `app/api/invitations/[code]/accept/route.ts` (línea 137-145)

**Flujo actual:**
```typescript
return NextResponse.json({
  message: 'Usuario creado exitosamente',
  user: {...}
}) // ❌ No notifica al admin
```

**Implementación de email:**

**A) Email al NUEVO CLIENTE** (Bienvenida)
- **Asunto:** `¡Bienvenido a ${COMPANY_NAME}!`
- **Contenido:**
  - Felicitaciones por activar la cuenta
  - Credenciales de acceso:
    - Email: `user.email`
    - Slug de la tienda: `user.company`
  - Links importantes:
    - Dashboard: `${APP_URL}/dashboard`
    - Tienda pública: `${APP_URL}/tienda/${user.company}`
  - Primeros pasos:
    - Personalizar tienda en Settings
    - Agregar productos
    - Configurar métodos de pago
    - Compartir link de la tienda
  - Datos de soporte

**B) Email al ADMIN** (Notificación)
- **Asunto:** `Nuevo cliente activado: ${user.name}`
- **Contenido:**
  - Notificación de nueva activación
  - Datos del cliente:
    - Nombre: `user.name`
    - Email: `user.email`
    - Slug: `user.company`
  - Fecha de activación
  - Fecha de renovación del servicio
  - Link al panel de admin: `${APP_URL}/admin/clients`

**Destinatarios:**
- Cliente: `user.email`
- Admin: `ADMIN_EMAIL` (variable de entorno)

---

### 5️⃣ **CLIENTE SUSPENDIDO** (CRÍTICO)

**Archivo:** `app/api/admin/clients/[id]/suspend/route.ts` (línea 46)

**Flujo actual:**
```typescript
await prisma.user.update({
  where: { id },
  data: {
    isSuspended: true,
    suspensionReason: reason || 'Pago pendiente - renovación vencida',
    suspendedAt: new Date()
  }
}) // ❌ No notifica al cliente
```

**Implementación de email:**

**Email al CLIENTE SUSPENDIDO**
- **Asunto:** `⚠️ Cuenta suspendida - ${storeName}`
- **Contenido:**
  - Notificación de suspensión
  - Motivo: `suspensionReason`
  - Fecha de suspensión: `suspendedAt`
  - Consecuencias:
    - No puede acceder al dashboard
    - Su tienda pública está desactivada
    - No puede recibir nuevos pedidos
  - Instrucciones para reactivación:
    - Contactar a soporte
    - Realizar pago pendiente
    - Link de contacto
  - Datos de contacto de soporte

**Email al ADMIN** (Copia)
- **Asunto:** `Cliente suspendido: ${client.name}`
- **Contenido:**
  - Confirmación de suspensión
  - Cliente: `client.name` (`client.email`)
  - Motivo: `suspensionReason`
  - Fecha: `suspendedAt`

**Destinatarios:**
- Cliente: `client.email`
- Admin: `ADMIN_EMAIL`

---

### 6️⃣ **CLIENTE REACTIVADO** (Importante)

**Archivo:** `app/api/admin/clients/[id]/activate/route.ts`

**Flujo:** Similar al de suspensión

**Implementación de email:**

**Email al CLIENTE REACTIVADO**
- **Asunto:** `✅ Cuenta reactivada - ${storeName}`
- **Contenido:**
  - Notificación de reactivación
  - Bienvenida de vuelta
  - Confirmación de servicios restaurados
  - Link al dashboard
  - Link a la tienda pública
  - Agradecimiento

**Destinatario:**
- Cliente: `client.email`

---

### 7️⃣ **RECORDATORIOS DE RENOVACIÓN** (Futuro - Recomendado)

**Archivo:** No existe - Requiere implementar **Cron Job**

**Flujo:**
- Ejecutar diariamente
- Buscar clientes cuya renovación esté próxima (7 días, 3 días, 1 día)
- Enviar email de recordatorio

**Implementación:**

**Email de Recordatorio**
- **Asunto:** `Recordatorio: Renovación en ${days} días`
- **Contenido:**
  - Notificación de próxima renovación
  - Fecha de renovación: `serviceRenewal`
  - Monto a pagar (si aplica)
  - Instrucciones de pago
  - Link de renovación
  - Contacto de soporte

**Cron Job:** `scripts/cron/check-renewals.ts`

---

## 📊 Resumen de Implementación

| Flujo | Prioridad | Destinatarios | Archivo de Integración |
|-------|-----------|---------------|------------------------|
| Nuevo Pedido | 🔴 CRÍTICO | Cliente + Restaurante | `app/api/orders/route.ts:157` |
| Cambio Estado Pedido | 🟡 Importante | Cliente | `app/api/orders/[id]/route.ts:147` |
| Invitación Enviada | 🔴 CRÍTICO | Nuevo Cliente | `app/api/admin/invitations/route.ts:95` |
| Invitación Aceptada | 🟡 Importante | Cliente + Admin | `app/api/invitations/[code]/accept/route.ts:137` |
| Cliente Suspendido | 🔴 CRÍTICO | Cliente + Admin | `app/api/admin/clients/[id]/suspend/route.ts:46` |
| Cliente Reactivado | 🟡 Importante | Cliente | `app/api/admin/clients/[id]/activate/route.ts` |
| Recordatorios | 🟢 Futuro | Cliente | `scripts/cron/check-renewals.ts` (crear) |

---

## 🏗️ Arquitectura de Implementación

### Estructura de archivos propuesta:

```
lib/
  └── email/
      ├── index.ts              # Funciones principales (sendEmail)
      ├── config.ts             # Configuración de Resend
      ├── templates/
      │   ├── order-confirmation-customer.tsx
      │   ├── order-confirmation-vendor.tsx
      │   ├── order-status-update.tsx
      │   ├── invitation-new-client.tsx
      │   ├── invitation-accepted-client.tsx
      │   ├── invitation-accepted-admin.tsx
      │   ├── client-suspended.tsx
      │   ├── client-activated.tsx
      │   └── renewal-reminder.tsx
      └── utils/
          ├── format-order.ts     # Formateo de datos de pedidos
          └── format-dates.ts     # Formateo de fechas

scripts/
  └── cron/
      └── check-renewals.ts      # Cron job de renovaciones
```

---

## 🔧 Variables de Entorno Necesarias

```bash
# Email Service (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="pedidos@tudominio.com"

# Company Info
ADMIN_EMAIL="admin@tudominio.com"
SUPPORT_EMAIL="soporte@tudominio.com"
COMPANY_NAME="TuEmpresa"

# App URLs
NEXT_PUBLIC_APP_URL="https://tudominio.com"
```

---

## 📝 Checklist de Implementación

### Fase 1: Setup Básico
- [ ] Instalar dependencias: `pnpm add resend react-email`
- [ ] Configurar Resend API key
- [ ] Crear estructura de carpetas
- [ ] Crear función base `sendEmail()`
- [ ] Crear componentes base de React Email

### Fase 2: Flujos Críticos (Pedidos)
- [ ] Template: Confirmación de pedido - Cliente
- [ ] Template: Confirmación de pedido - Restaurante
- [ ] Integrar en `app/api/orders/route.ts`
- [ ] Template: Cambio de estado de pedido
- [ ] Integrar en `app/api/orders/[id]/route.ts`
- [ ] Probar flujo completo de pedidos

### Fase 3: Flujos de Invitaciones
- [ ] Template: Invitación nueva
- [ ] Integrar en `app/api/admin/invitations/route.ts`
- [ ] Template: Bienvenida al cliente
- [ ] Template: Notificación al admin
- [ ] Integrar en `app/api/invitations/[code]/accept/route.ts`
- [ ] Probar flujo de invitación completo

### Fase 4: Gestión de Clientes
- [ ] Template: Cliente suspendido
- [ ] Integrar en `app/api/admin/clients/[id]/suspend/route.ts`
- [ ] Template: Cliente reactivado
- [ ] Integrar en `app/api/admin/clients/[id]/activate/route.ts`
- [ ] Probar flujo de suspensión/reactivación

### Fase 5: Recordatorios (Futuro)
- [ ] Crear cron job de renovaciones
- [ ] Template: Recordatorio de renovación
- [ ] Configurar ejecución diaria
- [ ] Probar recordatorios

---

## 🚀 Ejemplo de Integración

### Antes (app/api/orders/route.ts):
```typescript
console.log('✅ Pedido creado:', {
  orderId: result.order.id,
  orderNumber,
  customerName,
  total
})

return NextResponse.json({
  success: true,
  message: 'Pedido creado exitosamente',
  order: orderData
})
```

### Después:
```typescript
console.log('✅ Pedido creado:', {
  orderId: result.order.id,
  orderNumber,
  customerName,
  total
})

// 📧 Enviar emails
try {
  // Email al cliente
  if (customerEmail) {
    await sendOrderConfirmationToCustomer({
      order: orderData,
      store: {
        name: store.storeName,
        email: store.contactEmail,
        phone: store.whatsappMainNumber
      }
    })
  }

  // Email al restaurante
  await sendOrderConfirmationToVendor({
    order: orderData,
    vendorEmail: store.user.email
  })
} catch (emailError) {
  // No bloquear la respuesta si falla el email
  console.error('Error enviando emails de pedido:', emailError)
}

return NextResponse.json({
  success: true,
  message: 'Pedido creado exitosamente',
  order: orderData
})
```

---

## 💡 Consideraciones Importantes

### 1. **No bloquear respuestas**
Los emails deben enviarse de forma **asíncrona** y nunca fallar el request principal.

```typescript
// ✅ CORRECTO
try {
  await sendEmail(...)
} catch (error) {
  console.error('Email error:', error)
  // Continuar normalmente
}

// ❌ INCORRECTO
await sendEmail(...) // Sin try-catch, podría romper el flujo
```

### 2. **Manejo de errores**
- Si el email falla, loguear pero no retornar error
- El pedido/acción principal debe completarse exitosamente
- Opcional: Guardar en tabla `EmailLog` para reintentos

### 3. **Rate Limits de Resend**
- Free tier: 100 emails/día
- Paid tier: Desde 3,000 emails/mes por $20
- Implementar queue para grandes volúmenes

### 4. **Testing**
- Usar emails de prueba en desarrollo
- Variable `NODE_ENV` para deshabilitar emails en dev
- Resend tiene modo sandbox

### 5. **Personalización**
- Cada restaurante puede tener su `contactEmail` en `StoreSettings`
- Emails pueden incluir logo del restaurante
- Colores del brand desde `StoreSettings`

---

## 📈 Próximos Pasos

1. **Revisar esta documentación con el usuario**
2. **Priorizar flujos** (empezar por pedidos)
3. **Implementar setup básico** (Resend + React Email)
4. **Crear templates uno por uno**
5. **Integrar en cada endpoint identificado**
6. **Testing exhaustivo**
7. **Deploy a producción**

---

## 🔗 Referencias

- [Resend Docs](https://resend.com/docs)
- [React Email](https://react.email)
- [Next.js Email Best Practices](https://nextjs.org/docs/app/building-your-application/optimizing/email)
