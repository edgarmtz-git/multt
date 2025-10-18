# 🔐 CÓMO ACCEDER AL DASHBOARD

## 🚀 ACCESO RÁPIDO (Desarrollo Local)

### Opción 1: Usar Credenciales del Seed

Si ya ejecutaste `pnpm db:seed`, puedes usar estas credenciales:

**👤 Dashboard del Cliente (Dueño de Tienda):**
```
URL: http://localhost:3000/login
Email: cliente@empresa.com
Password: cliente123
```

Después del login, serás redirigido a: `http://localhost:3000/dashboard`

**🔧 Panel de Administrador:**
```
URL: http://localhost:3000/login
Email: admin@sistema.com
Password: admin123
```

Después del login, serás redirigido a: `http://localhost:3000/admin`

---

### Opción 2: Crear Usuario de Prueba Rápido

Si no has ejecutado el seed o quieres crear un nuevo usuario:

```bash
# Ejecutar el seed completo
pnpm db:seed
```

Esto creará:
- ✅ Usuario ADMIN (admin@sistema.com / admin123)
- ✅ Usuario CLIENT (cliente@empresa.com / cliente123)
- ✅ Tienda de ejemplo con slug: cliente-slug
- ✅ Categorías y productos de ejemplo

---

## 🎯 NAVEGACIÓN EN EL DASHBOARD

### Dashboard del Cliente (CLIENT)

Una vez dentro de `http://localhost:3000/dashboard`, verás el menú lateral:

```
📊 Dashboard          → /dashboard
📦 Productos          → /dashboard/products
📂 Categorías         → /dashboard/categories
📋 Órdenes            → /dashboard/orders (si existe)
⚙️  Configuración     → /dashboard/settings
```

**En Configuración (`/dashboard/settings`) encontrarás:**

1. **General**
   - Nombre de la tienda
   - Slug de la tienda
   - Email de contacto

2. **Envío** ⭐ (IMPORTANTE)
   - `deliveryEnabled` (checkbox)
     - ✅ Activado: Clientes pueden elegir "Delivery" o "Pickup"
     - ❌ Desactivado: Clientes solo pueden elegir "Pickup"

   - Método de cálculo de envío:
     - `distance`: Por distancia GPS
     - `zones`: Por zonas predefinidas
     - `manual`: Confirmación manual después

3. **Pagos**
   - Pago en efectivo
   - Transferencia bancaria

4. **Horarios**
   - Horario de atención
   - Deshabilitar checkout fuera de horario

---

## 🔧 CONFIGURAR ENVÍO COMO OPCIONAL

### Paso 1: Acceder a Configuración

1. Login con `cliente@empresa.com / cliente123`
2. Click en "Configuración" en el menú lateral
3. Ve a la pestaña "Envío"

### Paso 2: Desactivar Delivery (Solo Pickup)

Si **NO quieres ofrecer envío a domicilio**:

1. **Desmarca** el checkbox `"Habilitar envío a domicilio"`
2. Click en "Guardar cambios"

**Resultado:**
- ✅ En el checkout, solo aparecerá "Recoger en local"
- ✅ NO se pedirá dirección al cliente
- ✅ Total = Subtotal (sin costo de envío)

### Paso 3: Activar Delivery (Pickup + Delivery)

Si **SÍ quieres ofrecer envío a domicilio**:

1. **Marca** el checkbox `"Habilitar envío a domicilio"`
2. Selecciona el método de cálculo:
   - **Por distancia**: Usa GPS del cliente
   - **Por zonas**: Define zonas con precio fijo
   - **Manual**: Confirmas costo por WhatsApp después
3. Configura los parámetros según el método elegido
4. Click en "Guardar cambios"

**Resultado:**
- ✅ En el checkout, aparecerán 2 opciones:
  - "Recoger en local" (sin costo)
  - "Entrega a domicilio" (con costo)
- ✅ Si elige delivery: se pide dirección completa
- ✅ Si elige pickup: NO se pide dirección

---

## 🛠️ DESACTIVAR PRODUCTOS MANUALMENTE

### Paso 1: Ir a Productos

1. Login al dashboard
2. Click en "Productos" en el menú lateral

### Paso 2: Desactivar Producto Sin Stock

1. Encuentra el producto sin stock
2. Hay un **toggle/switch** al lado del producto
3. Click en el toggle para desactivar

**Estados:**
- ✅ Verde/Activado: Producto visible en el menú del cliente
- ❌ Gris/Desactivado: Producto **NO** aparece en el menú

**API usada:**
```
POST /api/dashboard/products/[id]/toggle-active
{ "isActive": false }
```

### Paso 3: Reactivar Cuando Hay Stock

1. Mismo toggle/switch
2. Click para activar de nuevo
3. El producto vuelve a aparecer en el menú del cliente

---

## 📱 VER CÓMO SE VE TU TIENDA PÚBLICA

Desde el dashboard, puedes ver tu tienda pública:

**URL de la tienda:**
```
http://localhost:3000/tienda/[tu-slug]
```

Ejemplo con el seed:
```
http://localhost:3000/tienda/cliente-slug
```

**En esta vista verás:**
- Todos los productos ACTIVOS
- Categorías visibles
- El checkout configurado según tus ajustes
- Si delivery está desactivado: solo opción "Pickup"
- Si delivery está activado: opciones "Pickup" y "Delivery"

---

## 🔍 PROBAR FLUJO COMPLETO

### Test 1: Solo Pickup (Sin Delivery)

1. Dashboard → Configuración → Envío → Desmarcar "Habilitar envío"
2. Guardar cambios
3. Abrir tienda pública: `http://localhost:3000/tienda/cliente-slug`
4. Agregar productos al carrito
5. Checkout:
   - ✅ Solo aparece "Recoger en local"
   - ✅ NO pide dirección
   - ✅ Total = Subtotal

### Test 2: Pickup + Delivery

1. Dashboard → Configuración → Envío → Marcar "Habilitar envío"
2. Seleccionar método (ej: "Manual")
3. Guardar cambios
4. Abrir tienda pública
5. Agregar productos al carrito
6. Checkout:
   - ✅ Aparecen 2 opciones: "Pickup" y "Delivery"
   - ✅ Si elige Delivery: pide dirección
   - ✅ Si elige Pickup: NO pide dirección

---

## 🆘 TROUBLESHOOTING

### No puedo hacer login

```bash
# Verificar que la DB existe
ls -la dev.db

# Si no existe, crear y seedear:
echo 'DATABASE_URL="file:./dev.db"' > .env
pnpm db:push
pnpm db:seed
```

### El dashboard está vacío

```bash
# Ejecutar seed para datos de ejemplo
pnpm db:seed
```

### No veo la opción de envío en settings

1. Verifica que estás en `/dashboard/settings`
2. Busca la pestaña "Envío" o "Delivery"
3. Si no aparece, puede estar en una sección llamada "General"

### Los cambios no se reflejan en la tienda

1. Guarda cambios en dashboard
2. Recarga la página de la tienda pública (F5)
3. Limpia caché del navegador si es necesario

---

## 🎓 RESUMEN

| Acción | Dónde | Cómo |
|--------|-------|------|
| Desactivar producto | `/dashboard/products` | Toggle al lado del producto |
| Desactivar delivery | `/dashboard/settings` → Envío | Desmarcar checkbox |
| Ver tienda pública | Navegador | `/tienda/[tu-slug]` |
| Crear usuario | Terminal | `pnpm db:seed` |
| Login dashboard | `/login` | cliente@empresa.com / cliente123 |

---

**¿Dudas?** Consulta:
- [CLAUDE.md](./CLAUDE.md) - Arquitectura completa
- [DEPLOYMENT_READY.md](./DEPLOYMENT_READY.md) - Deploy a producción
- [ORDEN_SYSTEM_VALIDATION_REPORT.md](./ORDEN_SYSTEM_VALIDATION_REPORT.md) - Sistema de órdenes

---

**Última actualización:** 18 de Octubre, 2025
