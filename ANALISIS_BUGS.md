# 🐛 Análisis de Bugs y Sistema WhatsApp

## ✅ Estado Actual del Sistema WhatsApp

### **BUENA NOTICIA:** El sistema de WhatsApp YA ESTÁ IMPLEMENTADO ✅

Ubicación: `components/checkout/single-card-checkout.tsx:276-281`

```typescript
// Generar mensaje de WhatsApp
const whatsappMessage = generateWhatsAppMessage(orderData, orderResult.order?.id)

// Abrir WhatsApp
const whatsappUrl = `https://api.whatsapp.com/send?phone=${storeInfo?.whatsappMainNumber}&text=${encodeURIComponent(whatsappMessage)}`
window.open(whatsappUrl, '_blank')
```

**Qué hace:**
1. Cliente completa checkout
2. Pedido se guarda en base de datos (`/api/orders` POST)
3. Se genera mensaje automático con:
   - Número de pedido
   - Datos del cliente
   - Lista de productos con cantidades
   - Subtotal, envío, total
   - Método de pago
   - Dirección (si es delivery)
4. Se abre WhatsApp Web/App con el mensaje pre-cargado
5. Cliente solo presiona "enviar" para confirmar al restaurante

**Funciona correctamente** ✅

---

## 🐛 Problemas Identificados

### 1️⃣ **Error 404 en Tiendas No Encontradas**

**Ubicación:** `app/tienda/[cliente]/page.tsx:206-243`

**Problema:**
Cuando intentas acceder a una tienda que no existe (ej: `/tienda/no-existe`):

```typescript
const storeResponse = await fetch(`/api/tienda/${clienteId}`)
if (storeResponse.ok) {
  // Carga tienda real
} else {
  console.error('❌ Store response error:', storeResponse.status)
  // ⚠️ PROBLEMA: Carga datos hardcodeados de prueba
  setStoreInfo({
    storeName: 'Nanixhe Chicken',  // ← Datos fake
    storeSlug: 'mi-tienda-digital',
    // ...
  })
}
```

**Comportamiento actual:**
- Usuario entra a `/tienda/asdasd` (tienda que no existe)
- API responde 404
- En lugar de mostrar error, **muestra una tienda falsa** con productos de prueba
- Esto confunde al usuario y genera errores en consola

**Solución requerida:**
- Mostrar página 404 amigable
- Explicar que la tienda no existe
- Opción de buscar otra tienda
- No cargar datos de prueba

---

### 2️⃣ **Datos Hardcodeados de Fallback**

**Ubicación:** `app/tienda/[cliente]/page.tsx:254-294`

**Problema:**
Si las categorías no cargan (404), se insertan productos de prueba:

```typescript
if (!categoriesResponse.ok) {
  setCategories([
    {
      id: '1',
      name: 'Bebidas',
      products: [{
        name: 'Café Americano',  // ← Producto fake
        price: 35,
        // ...
      }]
    }
  ])
}
```

**Por qué es un problema:**
- El usuario ve productos que no existen
- Puede intentar comprarlos
- Genera confusión
- Error silencioso (no se notifica al usuario)

**Solución:**
- Eliminar datos de prueba
- Mostrar mensaje claro: "Esta tienda no tiene productos aún"
- No permitir interacción con datos falsos

---

### 3️⃣ **API Endpoint Faltante**

**Problema:** No encontré el endpoint `/api/tienda/[slug]/route.ts`

Cuando se hace:
```typescript
const storeResponse = await fetch(`/api/tienda/${clienteId}`)
```

Este endpoint debería:
1. Buscar la tienda por slug
2. Verificar si está activa
3. Retornar 404 si no existe
4. Retornar datos de la tienda si existe

**Estado:** Necesito verificar si existe este endpoint.

---

## 🔧 Soluciones a Implementar

### **Solución 1: Página 404 para Tiendas No Encontradas**

**Archivo:** `app/tienda/[cliente]/page.tsx`

**Cambios:**

```typescript
// Estado para controlar si la tienda existe
const [storeExists, setStoreExists] = useState<boolean | null>(null)

const loadStoreData = async () => {
  try {
    setLoading(true)

    const storeResponse = await fetch(`/api/tienda/${clienteId}`)

    if (storeResponse.ok) {
      const storeData = await storeResponse.json()
      setStoreInfo(storeData)
      setStoreExists(true)
      setIsOpen(checkIfOpen(storeData))
    } else if (storeResponse.status === 404) {
      // ✅ Tienda no encontrada
      setStoreExists(false)
      setStoreInfo(null)
    } else {
      // Otro error del servidor
      toast.error('Error al cargar la tienda')
      setStoreExists(false)
    }

    // Solo cargar categorías si la tienda existe
    if (storeResponse.ok) {
      const categoriesResponse = await fetch(`/api/tienda/${clienteId}/categories`)
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)
      } else {
        // ✅ Tienda existe pero sin categorías
        setCategories([])
      }
    }
  } catch (error) {
    console.error('Error loading store:', error)
    toast.error('Error de conexión')
    setStoreExists(false)
  } finally {
    setLoading(false)
  }
}

// Renderizado condicional
if (loading) {
  return <LoadingScreen />
}

if (storeExists === false) {
  return <StoreNotFoundPage clienteId={clienteId} />
}

if (!storeInfo || !storeInfo.storeActive) {
  return <StoreInactivePage storeName={storeInfo?.storeName} />
}
```

---

### **Solución 2: Componente de Tienda No Encontrada**

**Archivo:** `components/store/store-not-found.tsx` (crear)

```tsx
interface StoreNotFoundPageProps {
  clienteId: string
}

export function StoreNotFoundPage({ clienteId }: StoreNotFoundPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono */}
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Store className="w-12 h-12 text-gray-400" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tienda no encontrada
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">
          No encontramos ninguna tienda con el slug <span className="font-mono bg-gray-100 px-2 py-1 rounded">{clienteId}</span>
        </p>

        {/* Posibles causas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-900 font-medium mb-2">
            Posibles causas:
          </p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>El link está mal escrito</li>
            <li>La tienda fue desactivada</li>
            <li>El slug cambió recientemente</li>
          </ul>
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <Button
            onClick={() => window.history.back()}
            className="w-full"
          >
            Volver atrás
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Ir al inicio
          </Button>
        </div>

        {/* Soporte */}
        <p className="text-xs text-gray-500 mt-6">
          ¿Crees que esto es un error?{' '}
          <a href="mailto:soporte@tudominio.com" className="text-blue-600 hover:underline">
            Contacta a soporte
          </a>
        </p>
      </div>
    </div>
  )
}
```

---

### **Solución 3: Verificar/Crear Endpoint de Tienda**

**Archivo:** `app/api/tienda/[slug]/route.ts` (verificar si existe)

Si no existe, crear:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Buscar tienda por slug
    const store = await prisma.storeSettings.findUnique({
      where: { storeSlug: slug },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isSuspended: true,
            isActive: true
          }
        }
      }
    })

    // Tienda no encontrada
    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      )
    }

    // Usuario suspendido o inactivo
    if (store.user.isSuspended || !store.user.isActive) {
      return NextResponse.json(
        {
          error: 'Tienda no disponible',
          reason: 'suspended'
        },
        { status: 403 }
      )
    }

    // Tienda inactiva
    if (!store.storeActive) {
      return NextResponse.json(
        {
          error: 'Tienda no disponible',
          reason: 'inactive'
        },
        { status: 403 }
      )
    }

    // Retornar datos de la tienda
    return NextResponse.json({
      id: store.id,
      storeName: store.storeName,
      storeSlug: store.storeSlug,
      email: store.contactEmail,
      address: store.address,
      whatsappMainNumber: store.whatsappMainNumber,
      phoneNumber: store.phoneNumber,
      country: store.country,
      currency: store.currency,
      deliveryEnabled: store.deliveryEnabled,
      useBasePrice: store.useBasePrice,
      baseDeliveryPrice: store.baseDeliveryPrice,
      baseDeliveryThreshold: store.baseDeliveryThreshold,
      deliveryScheduleEnabled: store.deliveryScheduleEnabled,
      scheduleType: store.scheduleType,
      advanceDays: store.advanceDays,
      serviceHours: store.serviceHours,
      unifiedSchedule: store.unifiedSchedule,
      storeActive: store.storeActive,
      passwordProtected: store.passwordProtected,
      bannerImage: store.bannerImage,
      profileImage: store.profileImage,
    })

  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
```

---

## 📋 Checklist de Correcciones

### Parte 1: Manejo de Errores 404
- [ ] Crear `components/store/store-not-found.tsx`
- [ ] Crear `components/store/store-inactive.tsx`
- [ ] Actualizar `app/tienda/[cliente]/page.tsx`:
  - [ ] Añadir estado `storeExists`
  - [ ] Eliminar datos hardcodeados de fallback
  - [ ] Implementar renderizado condicional
  - [ ] Mejorar manejo de errores
- [ ] Verificar endpoint `/api/tienda/[slug]/route.ts`
- [ ] Crear endpoint si no existe
- [ ] Probar con slugs inválidos

### Parte 2: Sistema WhatsApp (Ya funciona)
- [x] Verificar integración de WhatsApp ✅
- [x] Confirmar que se genera mensaje correcto ✅
- [x] Confirmar que se abre WhatsApp ✅
- [ ] Opcional: Mejorar formato del mensaje
- [ ] Opcional: Añadir link de tracking al mensaje

### Parte 3: Emails (Pendiente)
- [ ] Implementar emails según EMAIL_IMPLEMENTATION_MAP.md
- [ ] Priorizar:
  1. Invitación a nuevo cliente
  2. Invitación aceptada
  3. Cliente suspendido/reactivado
  4. Recordatorios de renovación

---

## 🎯 Próximos Pasos

1. **INMEDIATO:** Arreglar manejo de tiendas 404
2. **IMPORTANTE:** Implementar emails prioritarios
3. **FUTURO:** Mejorar mensaje de WhatsApp con tracking

¿Quieres que empiece con las correcciones del 404 o prefieres que vaya directo a implementar los emails?
