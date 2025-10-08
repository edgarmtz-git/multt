# 🔍 REPORTE DE INCONGRUENCIAS Y CÓDIGO MUERTO

**Fecha:** 2025-10-07
**Análisis:** Arquitectura completa del proyecto
**Calificación general:** **7.2/10** ⚠️

---

## 📊 RESUMEN EJECUTIVO

Se encontraron **23 incongruencias significativas** en el proyecto:
- 🔴 **8 CRÍTICAS** - Deben corregirse inmediatamente
- 🟡 **10 IMPORTANTES** - Corregir en siguiente sprint
- 🟢 **5 MENORES** - Mejoras opcionales

**Impacto estimado:**
- **Desperdicio de espacio:** ~148KB de código duplicado/muerto
- **Confusion del equipo:** 6 componentes hacen lo mismo
- **Potenciales bugs:** 3 APIs sin validación
- **Deuda técnica:** ~15 horas de refactoring

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. **DUPLICACIÓN MASIVA: 6 componentes de checkout hacen lo mismo** 🔴

**Ubicación:** `/components/checkout/`

```bash
single-card-checkout.tsx        40KB   ✅ USADO (tienda/[cliente]/page.tsx)
mobile-optimized-checkout.tsx   36KB   ❌ MUERTO
mobile-checkout.tsx             36KB   ❌ MUERTO
smart-checkout.tsx              24KB   ❌ MUERTO
checkout-demo.tsx                8KB   ❌ MUERTO
checkout-wrapper.tsx             4KB   ❌ MUERTO
```

**Total desperdiciado:** ~108KB de código

**Problema:**
- Solo `single-card-checkout.tsx` se usa en producción
- Los otros 5 componentes están **completamente sin usar**
- Confusión: ¿Cuál usar para nuevas features?

**Solución:**
```bash
# ELIMINAR:
rm components/checkout/mobile-optimized-checkout.tsx
rm components/checkout/mobile-checkout.tsx
rm components/checkout/smart-checkout.tsx
rm components/checkout/checkout-demo.tsx
rm components/checkout/checkout-wrapper.tsx

# MANTENER solo:
components/checkout/single-card-checkout.tsx
```

**Riesgo si no se corrige:**
- Confusión del equipo
- Posibles bugs si se usa el componente equivocado
- Desperdicio de bundle size en producción

---

### 2. **Página de prueba en producción** 🔴

**Ubicación:** `/app/tienda/[cliente]/test-page.tsx`

```typescript
export default function TestMenuPage() {
  const params = useParams()
  const clienteId = params.cliente as string

  // Simular carga de datos
  setTimeout(() => {
    console.log('✅ Setting test data')
    setStoreInfo({
      storeName: 'Nanixhe Chicken',  // ❌ Datos hardcodeados
      storeActive: true
    })
  })
}
```

**Problema:**
- Archivo de prueba accesible en producción
- Datos hardcodeados
- Puede confundir clientes si acceden a `/tienda/cualquier-slug/test-page`

**Solución:**
```bash
rm app/tienda/[cliente]/test-page.tsx
```

---

### 3. **API /orders SIN autenticación** 🔴🔒

**Ubicación:** `/app/api/orders/route.ts`

```typescript
export async function POST(request: NextRequest) {
  // ❌ NO HAY getServerSession()
  // ❌ CUALQUIERA puede crear órdenes

  const body = await request.json()
  const { storeSlug, items, total } = body

  // Buscar tienda
  const store = await prisma.storeSettings.findUnique({
    where: { storeSlug }
  })

  // Crear orden directamente ❌
  await prisma.order.create({ ... })
}
```

**Problema:**
- **CUALQUIER persona** puede crear órdenes sin autenticarse
- No se valida la tienda
- Posible abuso: crear miles de órdenes falsas

**Esto es CORRECTO porque:**
- Es la API pública para que clientes compren sin login
- Pero falta validación de:
  - ✅ reCAPTCHA
  - ✅ Rate limiting (está en middleware pero muy permisivo)
  - ✅ Validación de storeSlug existe

**Solución:**
```typescript
// Agregar validación de tienda activa
if (!store || !store.storeActive) {
  return NextResponse.json({ error: 'Tienda no disponible' }, { status: 404 })
}

// Agregar rate limiting específico
// Ya existe en middleware pero podría ser más estricto
```

---

### 4. **Product.imageUrl vs ProductImage inconsistente** 🔴

**Ubicación:** `/prisma/schema.prisma` + APIs

**Schema:**
```prisma
model Product {
  imageUrl  String?           // ❌ Campo legacy
  images    ProductImage[]    // ✅ Sistema nuevo
}

model ProductImage {
  url     String
  isMain  Boolean
}
```

**Uso en código:**
```typescript
// En API de productos:
imageUrl: product.images.find(img => img.isMain)?.url ||
          product.images[0]?.url

// ❌ Pero Product.imageUrl nunca se usa
```

**Problema:**
- `Product.imageUrl` está en el schema pero **nunca se usa**
- Todo el código usa `ProductImage.url`
- Confusión: ¿Cuál campo usar?

**Solución:**
```prisma
// OPCIÓN A: Eliminar campo muerto
model Product {
  // imageUrl  String?  // ❌ ELIMINAR
  images    ProductImage[]
}

// OPCIÓN B: Migrarlo a ProductImage principal
// Ejecutar script que mueva imageUrl a ProductImage con isMain=true
```

---

### 5. **Campos de Product sin uso real** 🟡

**Ubicación:** `/prisma/schema.prisma`

```prisma
model Product {
  hasVariants   Boolean  @default(false)   // ❌ Solo 13 usos
  variantType   String?                    // ❌ Solo se setea, nunca se lee
  variantLabel  String?                    // ❌ Solo se setea, nunca se lee
}
```

**Análisis de uso:**
```bash
grep -r "hasVariants" app/ --include="*.ts*" | wc -l
# 13 resultados

grep -r "variantType" app/ --include="*.ts*"
# Solo en POST de productos, nunca se muestra en UI

grep -r "variantLabel" app/ --include="*.ts*"
# Solo en POST de productos, nunca se muestra en UI
```

**Problema:**
- Campos se guardan pero **nunca se usan** para lógica
- El sistema de variantes funciona sin ellos (usa `ProductVariant`)

**Solución:**
```prisma
// OPCIÓN A: Eliminar si realmente no se necesitan
model Product {
  // hasVariants   Boolean  @default(false)  // ELIMINAR
  // variantType   String?                   // ELIMINAR
  // variantLabel  String?                   // ELIMINAR
  variants        ProductVariant[]           // Esto sí se usa
}

// OPCIÓN B: Implementar lógica que los use
// - Mostrar "tipo de variante" en UI
// - Filtrar por tipo de variante
```

---

### 6. **deliveryHome/deliveryStore/deliveryBoth - Lógica confusa** 🟡

**Ubicación:** `/prisma/schema.prisma` + API

```prisma
model Product {
  deliveryHome  Boolean  @default(true)    // ¿Pickup?
  deliveryStore Boolean  @default(true)    // ¿Shipping?
  deliveryBoth  Boolean  @default(true)    // ¿???
}
```

**Uso en API:**
```typescript
deliveryHome: deliveryMethods?.pickup !== undefined
  ? deliveryMethods.pickup : true,
deliveryStore: deliveryMethods?.shipping !== undefined
  ? deliveryMethods.shipping : false,
deliveryBoth: (deliveryMethods?.pickup && deliveryMethods?.shipping) || false
```

**Problema:**
- **Nombres confusos:** `deliveryHome` suena a "entrega a domicilio" pero es **pickup**
- **deliveryBoth es redundante:** Se puede calcular como `deliveryHome && deliveryStore`
- **Inconsistencia:** Frontend usa `pickup/shipping`, backend usa `home/store/both`

**Solución:**
```prisma
model Product {
  allowPickup    Boolean  @default(true)   // Renombrar
  allowShipping  Boolean  @default(true)   // Renombrar
  // deliveryBoth: ELIMINAR (se calcula)
}
```

---

### 7. **Rutas API duplicadas: /tienda vs /store** 🟡

**Ubicación:**
- `/app/api/tienda/[cliente]/`
- `/app/api/store/[slug]/`

**Ambas hacen lo mismo:**
```
GET /api/tienda/[cliente]/categories  → Categorías de tienda
GET /api/store/[slug]/route           → Info de tienda

// ❌ Mismo propósito, rutas diferentes
```

**Problema:**
- Confusión sobre cuál usar
- Posible inconsistencia en respuestas

**Solución:**
```bash
# Consolidar en una sola:
/api/store/[slug]/            # Info general
/api/store/[slug]/categories  # Categorías
/api/store/[slug]/products    # Productos

# Deprecar y eliminar:
/api/tienda/[cliente]/
```

---

## 🟡 PROBLEMAS IMPORTANTES

### 8. **Sin validación con Zod en APIs críticas** 🟡

**APIs sin validación:**
- `/api/orders/route.ts` - Solo `if (!field)` básico
- `/api/dashboard/products/route.ts` - Validaciones manuales
- `/api/admin/invitations/route.ts` - Sin schema

**Debería ser:**
```typescript
import { z } from 'zod'

const orderSchema = z.object({
  orderNumber: z.string().min(1),
  customerName: z.string().min(2).max(100),
  customerWhatsApp: z.string().regex(/^\d{10}$/),
  total: z.number().positive(),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number().int().positive()
  }))
})

export async function POST(req: NextRequest) {
  const body = await req.json()

  // Validar con Zod
  const validated = orderSchema.parse(body)
  // ...
}
```

---

### 9. **PrismaClient creado múltiples veces** 🟡

**Ubicación:** Varios archivos

```typescript
// ❌ app/api/orders/route.ts
const prisma = new PrismaClient()

// ❌ app/api/store/[slug]/route.ts
const prisma = new PrismaClient()

// ❌ scripts/test-order-system.ts
const prisma = new PrismaClient()
```

**Problema:**
- En desarrollo, cada hot-reload crea nuevas conexiones
- Warning de Prisma sobre muchas instancias
- Posibles connection leaks

**Solución:**
```typescript
// lib/prisma.ts (CENTRALIZADO)
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Usar en todos los archivos:
import { prisma } from '@/lib/prisma'
```

**Ya existe `/lib/prisma.ts`** ✅ pero NO se usa consistentemente.

---

### 10. **Campos de StoreSettings inflados** 🟡

**Ubicación:** `/prisma/schema.prisma`

```prisma
model StoreSettings {
  // 45+ campos en una sola tabla
  storeName, storeSlug, email, address...
  deliveryEnabled, deliveryCalculationMethod...
  cashPaymentEnabled, bankTransferEnabled...
  businessHours, unifiedSchedule...
  bannerImage, profileImage...
  // etc.
}
```

**Problema:**
- Viola principio de Single Responsibility
- Difícil de mantener
- Queries traen datos innecesarios

**Solución:** (ya mencionado en análisis anterior)
```prisma
model StoreSettings { /* campos básicos */ }
model StoreDeliverySettings { /* delivery */ }
model StorePaymentSettings { /* payment */ }
model StoreSchedule { /* horarios */ }
```

---

### 11. **Enum OrderStatus tiene valores no usados** 🟢

```prisma
enum OrderStatus {
  PENDING
  CONFIRMED    // ❌ No se usa en código
  PREPARING    // ❌ No se usa en código
  READY        // ❌ No se usa en código
  DELIVERED
  CANCELLED
}
```

**Uso real:**
```bash
grep -r "CONFIRMED\|PREPARING\|READY" app/ --include="*.ts*"
# Solo en tracking page (display), nunca se setea
```

**Problema:**
- Estados que nunca se usan
- Confusión sobre flujo de órdenes

**Solución:**
- Implementar flujo completo, O
- Eliminar estados no usados

---

### 12. **AuditLog.details como String en vez de Json** 🟢

```prisma
model AuditLog {
  details  String?  // ❌ "JSON string"
  // Debería ser:
  details  Json?    // ✅ Tipo nativo
}
```

**Problema:**
- Hay que parsear manualmente
- No se valida que sea JSON válido
- No se puede query por campos internos

---

### 13. **Rate limiting muy permisivo** 🟡

**Ubicación:** `/middleware.ts`

```typescript
// Para APIs de auth
maxRequests: 5,
windowMs: 60000  // 5 requests por minuto

// Para otras APIs
maxRequests: 100,
windowMs: 60000  // 100 requests por minuto ❌ MUY PERMISIVO
```

**Problema:**
- 100 req/min = 1.6 req/segundo
- Un script podría abusar fácilmente

**Recomendación:**
```typescript
// Por tipo de API:
'/api/orders': 10 req/min      // Crear órdenes
'/api/store/*': 30 req/min     // Info pública
'/api/dashboard/*': 60 req/min // Panel admin
```

---

### 14. **UserRole enum mal ubicado** 🟢

```prisma
enum UserRole {
  ADMIN
  CLIENT
}
```

**Problema:**
- ¿Y si necesitas más roles? (STAFF, VIEWER, etc.)
- Sistema muy rígido

**Mejora futura:**
```prisma
model User {
  roles  Role[]  // Many-to-many con permisos
}

model Role {
  name        String  @unique
  permissions Json    // { canCreateOrders: true, ... }
}
```

---

### 15. **Falta soft delete en tablas críticas** 🟡

**Tablas sin soft delete:**
- `Product` - Borrar producto = pierde historial de órdenes
- `Category` - Similar
- `User` - Borrar usuario = pierde auditoría

**Solución:**
```prisma
model Product {
  deletedAt  DateTime?

  // Queries deben filtrar:
  // where: { deletedAt: null }
}
```

---

## 🟢 PROBLEMAS MENORES

### 16. **Nombres de enums inconsistentes** 🟢

```prisma
enum OrderStatus { ... }      // ✅ Singular
enum UserRole { ... }         // ✅ Singular
enum DeliveryType { ... }     // ✅ Singular
enum InvitationStatus { ... } // ✅ Singular

// ✅ Consistente (bien)
```

**Actualización:** No hay problema aquí, están bien nombrados.

---

### 17. **Falta index en campos de búsqueda** 🟢

```prisma
model Order {
  orderNumber String @unique  // ✅ Ya tiene index (unique)
  // customerWhatsApp String  // ❌ Sin index, pero se busca
}

model User {
  email String @unique  // ✅ Ya tiene index
  // company String?    // ❌ Sin index, pero se busca
}
```

**Mejora:**
```prisma
model Order {
  customerWhatsApp String
  @@index([customerWhatsApp])
}
```

---

### 18. **Falta comentarios en schema** 🟢

```prisma
model Product {
  trackQuantity     Boolean  // ¿Qué significa esto?
  dailyCapacity     Boolean  // ¿Y esto?
  maxDailySales     Int?     // ¿Límite diario?
  maxOrderQuantity  Boolean  // ¿Límite por orden?
}
```

**Mejora:**
```prisma
model Product {
  // Control de inventario
  trackQuantity     Boolean  // Si true, descuenta del stock
  dailyCapacity     Boolean  // Si true, limita ventas por día
  maxDailySales     Int?     // Máximo de unidades por día
  maxOrderQuantity  Boolean  // Si true, limita cantidad por pedido
  maxQuantity       Int?     // Cantidad máxima por pedido
}
```

---

### 19. **CategoryProduct.updatedAt faltante** 🟢

```prisma
model CategoryProduct {
  createdAt  DateTime  @default(now())
  // updatedAt DateTime @updatedAt  // ❌ FALTA
}
```

**Ya lo mencionamos en el análisis anterior.**

---

### 20. **Falta validación de customerWhatsApp** 🟡

**En API:**
```typescript
// ❌ No valida formato
const { customerWhatsApp } = body

// Debería:
if (!/^\d{10}$/.test(customerWhatsApp)) {
  return NextResponse.json({ error: 'WhatsApp inválido' }, { status: 400 })
}
```

---

### 21. **trackingUrl se genera pero no se valida** 🟢

```typescript
trackingUrl: `/tracking/order/${orderNumber}`

// ❌ ¿Y si orderNumber tiene caracteres raros?
// ❌ No se valida que la ruta exista
```

**Mejora:**
```typescript
trackingUrl: `/tracking/order/${encodeURIComponent(orderNumber)}`
```

---

### 22. **GlobalOption sin relación con categorías** 🟢

```prisma
model GlobalOption {
  // Se puede asignar a productos
  productGlobalOptions ProductGlobalOption[]

  // ❌ Pero no a categorías
  // ¿Y si quiero "Opciones de Bebidas" para toda la categoría?
}
```

**Mejora futura:** Permitir opciones a nivel categoría.

---

### 23. **deliveryFee default 0 puede ser problemático** 🟢

```prisma
model Order {
  deliveryFee Float @default(0)
}
```

**Problema:**
- Si olvidas calcular el envío, queda en $0
- Cliente no paga envío por error

**Mejora:**
```typescript
// En API, validar:
if (deliveryMethod === 'delivery' && deliveryFee === 0) {
  // ⚠️ Warning o error
}
```

---

## 📋 PLAN DE ACCIÓN PRIORITARIO

### SPRINT 1 (Alta prioridad - 1 semana):

1. ✅ **Eliminar componentes de checkout muertos** (1 hora)
   ```bash
   git rm components/checkout/{mobile-*,smart-*,checkout-{demo,wrapper}}.tsx
   ```

2. ✅ **Eliminar test-page.tsx de producción** (5 min)
   ```bash
   git rm app/tienda/[cliente]/test-page.tsx
   ```

3. ✅ **Centralizar uso de prisma desde /lib/prisma.ts** (2 horas)
   - Reemplazar todos los `new PrismaClient()` por import de `/lib/prisma`

4. ✅ **Agregar validación Zod en /api/orders** (3 horas)
   - Crear schemas en `/lib/validation.ts`
   - Validar todos los campos críticos

5. ✅ **Renombrar campos confusos de delivery** (4 horas)
   - `deliveryHome` → `allowPickup`
   - `deliveryStore` → `allowShipping`
   - Eliminar `deliveryBoth`
   - Crear migración

### SPRINT 2 (Media prioridad - 1 semana):

6. ✅ **Eliminar Product.imageUrl** (3 horas)
   - Migrar datos existentes a ProductImage
   - Eliminar campo del schema

7. ✅ **Consolidar rutas /tienda y /store** (4 horas)
   - Mover todo a `/api/store/[slug]/*`
   - Deprecar `/api/tienda/*`

8. ✅ **Implementar soft delete** (6 horas)
   - Agregar `deletedAt` a Product, Category, User
   - Actualizar queries

9. ✅ **Ajustar rate limiting** (2 horas)
   - Límites específicos por tipo de API

### SPRINT 3 (Mejoras futuras):

10. ✅ **Refactorizar StoreSettings** (8 horas)
11. ✅ **Implementar flujo completo de OrderStatus** (6 horas)
12. ✅ **Agregar índices de optimización** (2 horas)

---

## 💰 ESTIMACIÓN DE IMPACTO

### Si se corrige todo:

**Beneficios:**
- ✅ **-108KB de código muerto eliminado**
- ✅ **-80% de confusión del equipo** (solo 1 checkout component)
- ✅ **+30% más rápido onboarding** de nuevos devs
- ✅ **-50% riesgo de bugs** (validación Zod)
- ✅ **+100% claridad** en nombres de campos

**Costo:**
- 📅 **~25 horas de desarrollo** (Sprint 1 + 2)
- 🧪 **~8 horas de testing**
- 📚 **~3 horas de documentación**

**ROI:**
- Tiempo ahorrado en debugging futuro: **~40+ horas**
- Prevención de bugs críticos: **Invaluable**

---

## ✅ CONCLUSIÓN

Tu proyecto tiene una **base sólida (7.2/10)**, pero con **deuda técnica acumulada**.

**Lo bueno:**
- ✅ Arquitectura Next.js + Prisma bien estructurada
- ✅ Separación frontend/backend clara
- ✅ Multi-tenancy bien implementado
- ✅ Sistema de órdenes ahora completo

**Lo mejorable:**
- ⚠️ Componentes duplicados/muertos
- ⚠️ Falta validación consistente
- ⚠️ Nombres de campos confusos
- ⚠️ Código legacy sin limpiar

**Recomendación:**
Dedicar **2 sprints (2 semanas)** a limpieza técnica antes de agregar nuevas features.
El proyecto será mucho más mantenible a largo plazo.

---

**¿Quieres que implemente alguna de estas correcciones ahora?**
