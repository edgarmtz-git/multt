# 📋 PLAN DE MIGRACIÓN - CORRECCIÓN DE BASE DE DATOS

**Fecha:** 2025-10-07
**Estado actual:** 0 órdenes en BD (✅ Ideal para migrar sin pérdida de datos)
**Criticidad:** 🔴 ALTA - Sistema actualmente NO puede guardar pedidos completos

---

## 🔍 ANÁLISIS COMPLETO DEL SISTEMA

### 1. FLUJO ACTUAL DE PEDIDOS

```
Cliente en Tienda Web
    ↓
Agrega productos al carrito
    ↓
Va a Checkout (single-card-checkout.tsx)
    ↓
Llena formulario con:
  - customerName ✅
  - customerWhatsApp ❌ (no existe en DB)
  - deliveryMethod ❌ (no existe en DB)
  - paymentMethod ❌ (no existe en DB)
  - address ❌ (no existe en DB)
  - deliveryFee ❌ (no existe en DB)
  - amountPaid ❌ (no existe en DB)
  - change ❌ (no existe en DB)
  - observations ✅ (existe como 'notes')
  - items con opciones seleccionadas ❌ (no se guardan opciones)
    ↓
POST /api/orders (app/api/orders/route.ts)
    ↓
❌ FALLA PARCIAL: Solo guarda:
  - customerName
  - customerEmail
  - total
  - notes
  - userId
  - items (sin opciones seleccionadas)
    ↓
⚠️ PIERDE DATOS CRÍTICOS:
  - customerWhatsApp
  - deliveryMethod
  - paymentMethod
  - address
  - deliveryFee
  - amountPaid
  - change
  - opciones de productos seleccionadas
```

### 2. COMPONENTES AFECTADOS

#### APIs:
- ✅ `/app/api/orders/route.ts` - POST (crear) y GET (listar)
- ✅ `/app/api/orders/[id]/route.ts` - GET (detalle) y PUT (actualizar status)

#### Frontend:
- ✅ `/app/dashboard/orders/page.tsx` - Lista de órdenes (dashboard cliente)
- ✅ `/app/tracking/order/[orderId]/page.tsx` - Tracking público
- ✅ `/components/checkout/single-card-checkout.tsx` - Checkout principal
- ✅ `/app/tienda/[cliente]/page.tsx` - Usa el checkout

#### Scripts:
- ✅ `/scripts/seed.ts` - NO crea órdenes de ejemplo (solo users, products, categories)

---

## 🎯 PROBLEMAS IDENTIFICADOS

### PRIORIDAD CRÍTICA 🔴

#### **PROBLEMA 1: Modelo Order Incompleto**

**Schema actual:**
```prisma
model Order {
  id            String      @id @default(cuid())
  status        OrderStatus @default(PENDING)
  total         Float
  customerEmail String?
  customerName  String?
  notes         String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  userId        String
  items         OrderItem[]
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Campos faltantes CRÍTICOS:**
- `orderNumber` String - Usado en línea 330 de single-card-checkout.tsx
- `customerWhatsApp` String - Usado en línea 332
- `deliveryMethod` String - Usado en línea 333 ('pickup' | 'delivery')
- `paymentMethod` String - Usado en línea 334 ('cash' | 'transfer')
- `deliveryFee` Float - Usado en línea 338
- `amountPaid` Float? - Usado en línea 340
- `change` Float? - Usado en línea 341
- `address` Json? - Usado en línea 335 (objeto complejo)

**Evidencia de código:**
```typescript
// single-card-checkout.tsx:329-345
const orderData = {
  orderNumber: `PED${Date.now()}`,     // ❌ No existe
  customerName,                         // ✅ Existe
  customerWhatsApp,                     // ❌ No existe
  deliveryMethod,                       // ❌ No existe
  paymentMethod,                        // ❌ No existe
  address: deliveryMethod === 'delivery' ? addressFields : null, // ❌ No existe
  items: cartItems,
  subtotal: subtotal || 0,
  deliveryFee: ...,                     // ❌ No existe
  total: ...,                           // ✅ Existe
  amountPaid: ...,                      // ❌ No existe
  change: ...,                          // ❌ No existe
  observations,                         // ✅ Existe como 'notes'
  storeSlug,
  status: 'PENDING'
}
```

#### **PROBLEMA 2: OrderItem NO guarda opciones seleccionadas**

**Schema actual:**
```prisma
model OrderItem {
  id          String          @id @default(cuid())
  quantity    Int
  price       Float
  variantName String?         // ❌ Solo texto
  createdAt   DateTime        @default(now())
  orderId     String
  productId   String
  variantId   String?
  variant     ProductVariant? @relation(fields: [variantId], references: [id])
  product     Product         @relation(fields: [productId], references: [id])
  order       Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
}
```

**Problema:** Falta tabla `OrderItemOption` para guardar opciones seleccionadas.

**Ejemplo de datos perdidos:**
```
Usuario pide Pizza con:
  - Tamaño: Grande (variante: $150)
  - Extra queso: Sí (+$20)
  - Doble pepperoni: Sí (+$30)
  - Sin cebolla: Sí ($0)

Base de datos guarda:
  ✅ Pizza Grande - $200 (producto + variante)
  ❌ NO guarda: Extra queso, Doble pepperoni, Sin cebolla

Resultado: El restaurant NO sabe qué opciones pidió el cliente
```

#### **PROBLEMA 3: OrderItem.product sin onDelete strategy**

**Problema actual:**
```prisma
product Product @relation(fields: [productId], references: [id])
// ❌ Sin onDelete - por defecto es Restrict
```

**Efecto:** Si intentas borrar un producto que tiene órdenes históricas, FALLA.

**Solución:** Agregar `onDelete: Restrict` explícitamente (o soft delete).

#### **PROBLEMA 4: OrderItem.variant sin onDelete: SetNull**

**Problema actual:**
```prisma
variant ProductVariant? @relation(fields: [variantId], references: [id])
// ❌ Sin onDelete strategy
```

**Solución:** Debe ser `onDelete: SetNull` para preservar historial.

---

### PRIORIDAD MEDIA 🟡

#### **PROBLEMA 5: Invitation sin relaciones FK**

```prisma
model Invitation {
  createdBy String  // ❌ Debería ser FK a User (admin)
  // ❌ Falta: acceptedByUserId para relacionar con User creado
}
```

#### **PROBLEMA 6: Precios en Float**

- Problema de precisión: `0.1 + 0.2 = 0.30000000000000004`
- Recomendado: `Decimal` o almacenar en centavos (Int)

#### **PROBLEMA 7: DeliveryType enum con un solo valor**

```prisma
enum DeliveryType {
  FIXED  // ❌ Solo un valor
}
```

Debería tener: `FIXED`, `DISTANCE`, `ZONES`, `MANUAL`

---

## ✅ PLAN DE SOLUCIÓN

### FASE 1: Corrección del Modelo Order (CRÍTICO)

**Cambios en schema.prisma:**

```prisma
model Order {
  id                String      @id @default(cuid())
  orderNumber       String      @unique  // NUEVO
  status            OrderStatus @default(PENDING)
  total             Float
  subtotal          Float?                // NUEVO
  deliveryFee       Float       @default(0)  // NUEVO

  // Información del cliente
  customerName      String
  customerEmail     String?
  customerWhatsApp  String      // NUEVO - REQUERIDO

  // Delivery
  deliveryMethod    String      // NUEVO ('pickup' | 'delivery')
  address           Json?       // NUEVO - Objeto con calle, colonia, etc.

  // Pago
  paymentMethod     String      // NUEVO ('cash' | 'transfer')
  amountPaid        Float?      // NUEVO
  change            Float?      // NUEVO

  // Otros
  notes             String?
  trackingUrl       String?     // NUEVO - Para tracking público

  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  userId            String
  items             OrderItem[]
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("orders")
}
```

### FASE 2: Tabla OrderItemOption (CRÍTICO)

**Nueva tabla para opciones seleccionadas:**

```prisma
model OrderItemOption {
  id              String    @id @default(cuid())
  orderItemId     String
  optionName      String    // Nombre de la opción (ej: "Tamaño")
  choiceName      String    // Nombre de la elección (ej: "Grande")
  price           Float     // Precio de esta opción
  quantity        Int       @default(1)  // Para opciones con cantidad
  createdAt       DateTime  @default(now())

  orderItem       OrderItem @relation(fields: [orderItemId], references: [id], onDelete: Cascade)

  @@map("order_item_options")
}

// Actualizar OrderItem:
model OrderItem {
  id          String              @id @default(cuid())
  quantity    Int
  price       Float
  variantName String?
  createdAt   DateTime            @default(now())
  orderId     String
  productId   String
  variantId   String?

  options     OrderItemOption[]    // NUEVO
  variant     ProductVariant?      @relation(fields: [variantId], references: [id], onDelete: SetNull)  // CORREGIDO
  product     Product              @relation(fields: [productId], references: [id], onDelete: Restrict)  // CORREGIDO
  order       Order                @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("order_items")
}
```

### FASE 3: Correcciones Menores

**3.1 Expandir DeliveryType enum:**
```prisma
enum DeliveryType {
  FIXED
  DISTANCE
  ZONES
  MANUAL
}
```

**3.2 Agregar updatedAt a tablas que faltan:**
```prisma
model CategoryProduct {
  // ...
  updatedAt DateTime @updatedAt  // NUEVO
}

model ProductImage {
  // ...
  updatedAt DateTime @updatedAt  // NUEVO
}

model ProductOptionChoice {
  // ...
  updatedAt DateTime @updatedAt  // NUEVO
}

model GlobalOptionChoice {
  // ...
  updatedAt DateTime @updatedAt  // NUEVO
}
```

---

## 🛠️ ESTRATEGIA DE MIGRACIÓN

### PASO 1: Backup Preventivo

```bash
# Backup de la base de datos actual
cp prisma/dev.db prisma/dev.db.backup-$(date +%Y%m%d-%H%M%S)

# Backup del schema actual
cp prisma/schema.prisma prisma/schema.prisma.backup
```

### PASO 2: Actualizar Schema

Aplicar todos los cambios al archivo `prisma/schema.prisma`.

### PASO 3: Crear Migración

```bash
# Crear migración con nombre descriptivo
npx prisma migrate dev --name fix_order_model_and_add_order_item_options

# Esto generará:
# - prisma/migrations/XXXXXX_fix_order_model_and_add_order_item_options/migration.sql
```

### PASO 4: Verificar Migración

El archivo SQL generado debe contener:

```sql
-- AlterTable para Order
ALTER TABLE "orders" ADD COLUMN "orderNumber" TEXT;
ALTER TABLE "orders" ADD COLUMN "customerWhatsApp" TEXT;
ALTER TABLE "orders" ADD COLUMN "deliveryMethod" TEXT;
-- ... etc

-- CreateTable para OrderItemOption
CREATE TABLE "order_item_options" (...);

-- AlterTable para corregir onDelete
-- (SQLite requiere recrear tabla)
```

### PASO 5: Aplicar Migración

```bash
# Aplicar migración
npx prisma migrate deploy

# Regenerar cliente Prisma
npx prisma generate
```

### PASO 6: Actualizar Código API

Modificar `/app/api/orders/route.ts` para guardar TODOS los campos:

```typescript
// Línea 52-80 (POST handler)
const order = await tx.order.create({
  data: {
    orderNumber,              // NUEVO
    status: 'PENDING',
    total: total,
    subtotal,                 // NUEVO
    deliveryFee,              // NUEVO
    customerEmail: customerEmail || null,
    customerName: customerName,
    customerWhatsApp,         // NUEVO
    deliveryMethod,           // NUEVO
    address,                  // NUEVO (Json)
    paymentMethod,            // NUEVO
    amountPaid,               // NUEVO
    change,                   // NUEVO
    notes: observations || null,
    userId: store.userId
  }
})

// Crear items CON opciones
const orderItems = await Promise.all(
  items.map(async (item: any) => {
    const orderItem = await tx.orderItem.create({
      data: {
        quantity: item.quantity,
        price: item.price,
        variantName: item.variantName || null,
        orderId: order.id,
        productId: item.id,
        variantId: item.variantId || null  // Agregar si existe
      }
    })

    // NUEVO: Guardar opciones seleccionadas
    if (item.options && item.options.length > 0) {
      await tx.orderItemOption.createMany({
        data: item.options.map((opt: any) => ({
          orderItemId: orderItem.id,
          optionName: opt.optionName,
          choiceName: opt.choiceName,
          price: opt.price,
          quantity: opt.quantity || 1
        }))
      })
    }

    return orderItem
  })
)
```

### PASO 7: Actualizar Frontend Checkout

Modificar `/components/checkout/single-card-checkout.tsx`:

```typescript
// Línea 336: Asegurarse que items incluye opciones
items: cartItems.map(item => ({
  id: item.product.id,
  name: item.product.name,
  quantity: item.quantity,
  price: item.price,
  variantName: item.selectedVariants[0]?.name,
  variantId: item.selectedVariants[0]?.id,      // AGREGAR
  options: Object.entries(item.selectedOptions || {}).flatMap(([optionId, choices]) =>  // AGREGAR
    choices.map((choice: any) => ({
      optionName: choice.optionName || 'Opción',
      choiceName: choice.name,
      price: choice.price,
      quantity: choice.quantity || 1
    }))
  )
}))
```

### PASO 8: Testing

Crear script de prueba:

```bash
# scripts/test-order-creation.ts
```

Probar:
1. ✅ Crear orden con pickup + cash
2. ✅ Crear orden con delivery + transfer
3. ✅ Crear orden con opciones de productos
4. ✅ Verificar que se guardan TODOS los campos
5. ✅ Verificar tracking page
6. ✅ Verificar dashboard orders page

---

## 🔄 ESTRATEGIA DE ROLLBACK

### Si algo sale mal DURANTE la migración:

```bash
# 1. Restaurar base de datos
rm prisma/dev.db
cp prisma/dev.db.backup-XXXXXX prisma/dev.db

# 2. Restaurar schema
cp prisma/schema.prisma.backup prisma/schema.prisma

# 3. Regenerar cliente
npx prisma generate
```

### Si algo sale mal DESPUÉS de la migración:

Como no hay órdenes existentes, simplemente:

```bash
# Crear migración inversa
npx prisma migrate dev --name rollback_order_fixes

# Editar manualmente la migración para revertir cambios
```

---

## 📊 VALIDACIÓN POST-MIGRACIÓN

### Checklist de Verificación:

- [ ] Schema compilado sin errores
- [ ] Migración aplicada exitosamente
- [ ] Cliente Prisma regenerado
- [ ] Servidor dev arranca sin errores
- [ ] API POST /api/orders acepta todos los campos
- [ ] API GET /api/orders devuelve todos los campos
- [ ] Checkout guarda order completa
- [ ] Dashboard muestra órdenes correctamente
- [ ] Tracking page funciona
- [ ] Opciones de productos se guardan
- [ ] onDelete strategies funcionan correctamente

---

## 🎯 IMPACTO DE LA MIGRACIÓN

### Archivos que SE MODIFICARÁN:
1. ✅ `prisma/schema.prisma` - Modelo de datos
2. ✅ `app/api/orders/route.ts` - Lógica de creación
3. ✅ `app/api/orders/[id]/route.ts` - Retornar nuevos campos
4. ✅ `components/checkout/single-card-checkout.tsx` - Enviar opciones
5. ✅ (Opcional) Interfaces TypeScript si existen

### Archivos que NO REQUIEREN cambios:
- ❌ `app/dashboard/orders/page.tsx` - Ya usa campos existentes
- ❌ `app/tracking/order/[orderId]/page.tsx` - Ya usa campos existentes
- ❌ `lib/auth.ts`, `middleware.ts` - No relacionados

### Datos que SE PERDERÁN:
- **NINGUNO** - No hay órdenes existentes (count = 0)

### Funcionalidad que MEJORARÁ:
- ✅ Tracking completo de pedidos
- ✅ Información de contacto del cliente
- ✅ Historial de métodos de entrega
- ✅ Historial de métodos de pago
- ✅ Dirección completa de entrega
- ✅ Opciones personalizadas de productos
- ✅ Cálculo correcto de cambio
- ✅ Auditoría completa de órdenes

---

## 💰 BENEFICIOS ESPERADOS

### Antes (Estado actual):
```
Order guarda: 40% de la información
OrderItem: No guarda opciones seleccionadas
Bugs: Cliente no recibe lo que pidió (opciones)
```

### Después (Estado post-migración):
```
Order guarda: 100% de la información
OrderItem: Guarda TODAS las opciones seleccionadas
Bugs: CERO pérdida de datos
```

---

## ⏱️ TIEMPO ESTIMADO

- Backup: 2 min
- Actualizar schema: 10 min
- Crear migración: 2 min
- Actualizar API: 15 min
- Actualizar frontend: 10 min
- Testing: 15 min
- **TOTAL: ~1 hora**

---

## ✋ PRECAUCIONES

1. **NUNCA** ejecutar en producción sin probar en desarrollo
2. **SIEMPRE** hacer backup antes
3. **VALIDAR** que todos los campos son opcionales apropiadamente
4. **PROBAR** crear orden antes de dar por terminado
5. **VERIFICAR** que el frontend envía los datos correctos

---

## 🚦 ESTADO ACTUAL

- ✅ Análisis completo realizado
- ✅ Plan de migración creado
- ✅ Estrategia de rollback definida
- ⏸️ **PENDIENTE APROBACIÓN DEL CLIENTE**
- ⏸️ Ejecución de migración
- ⏸️ Testing y validación

---

**¿Proceder con la migración?** (Requiere confirmación explícita)
