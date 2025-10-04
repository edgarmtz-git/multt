# Sistema de Diseño Estandarizado

Este documento describe el sistema de diseño estandarizado implementado en el proyecto, basado en **shadcn/ui** con estilo "new-york" y base color "zinc".

## 🎨 Principios de Diseño

### Tipografía
- **Títulos más compactos**: Preferimos títulos medianos con negrita en lugar de títulos grandes
- **Jerarquía clara**: H1 → H2 → H3 → H4 con tamaños decrecientes
- **Legibilidad**: Tamaños de fuente optimizados para cada dispositivo

### Colores
- **Consistencia**: Usamos las variables CSS de shadcn/ui
- **Accesibilidad**: Colores que cumplen con estándares de contraste
- **Semántica**: Colores con significado (verde para éxito, rojo para error, etc.)

### Espaciado
- **Sistema de 4px**: Todos los espaciados son múltiplos de 4px
- **Consistencia**: Espaciados uniformes en toda la aplicación
- **Responsividad**: Espaciados que se adaptan al dispositivo

## 📏 Tipografía Estandarizada

### Títulos
```tsx
// Título principal de página
<h1 className="text-2xl font-bold tracking-tight">Título Principal</h1>

// Subtítulo de sección
<h2 className="text-xl font-semibold tracking-tight">Subtítulo</h2>

// Título de sección
<h3 className="text-lg font-semibold">Sección</h3>

// Título de tarjeta
<h4 className="text-base font-semibold">Tarjeta</h4>
```

### Texto del Cuerpo
```tsx
// Texto principal
<p className="text-sm">Texto principal</p>

// Texto importante
<p className="text-base">Texto importante</p>

// Texto secundario
<p className="text-xs text-muted-foreground">Texto secundario</p>
```

### Navegación
```tsx
// Elemento de navegación
<span className="text-sm font-medium">Navegación</span>

// Elemento activo
<span className="text-sm font-semibold text-primary">Activo</span>
```

## 🎯 Componentes Estandarizados

### Botones
```tsx
// Botón primario
<Button className="h-9 px-4 py-2 text-sm font-medium">Primario</Button>

// Botón secundario
<Button variant="outline" className="h-9 px-4 py-2 text-sm font-medium">Secundario</Button>

// Botón pequeño
<Button className="h-8 px-3 py-1 text-xs font-medium">Pequeño</Button>

// Botón grande
<Button className="h-10 px-6 py-2 text-sm font-medium">Grande</Button>
```

### Tarjetas
```tsx
// Tarjeta estándar
<Card className="bg-card text-card-foreground border rounded-lg shadow-sm">
  <CardContent className="p-4">
    Contenido
  </CardContent>
</Card>

// Tarjeta interactiva
<Card className="bg-card text-card-foreground border rounded-lg shadow-sm hover:shadow-md transition-shadow">
  <CardContent className="p-4">
    Contenido
  </CardContent>
</Card>
```

### Formularios
```tsx
// Contenedor de formulario
<div className="space-y-4">
  {/* Campos del formulario */}
</div>

// Campo de formulario
<div className="space-y-2">
  <Label className="text-sm font-medium leading-none">Etiqueta</Label>
  <Input className="h-9 px-3 py-2 text-sm" />
</div>

// Textarea
<Textarea className="min-h-[80px] px-3 py-2 text-sm" />
```

### Badges
```tsx
// Badge estándar
<Badge className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
  Estado
</Badge>

// Badge de estado visible
<Badge className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">
  VISIBLE
</Badge>

// Badge de estado oculto
<Badge className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
  OCULTO
</Badge>
```

## 📱 Layout Responsivo

### Contenedores
```tsx
// Contenedor principal
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  Contenido
</div>

// Grid responsivo
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  Elementos
</div>

// Flex responsivo
<div className="flex flex-col sm:flex-row gap-4">
  Elementos
</div>
```

### Breakpoints
- **sm**: 640px (Tablets pequeñas)
- **md**: 768px (Tablets)
- **lg**: 1024px (Laptops)
- **xl**: 1280px (Desktops)
- **2xl**: 1536px (Pantallas grandes)

## 🎨 Colores del Sistema

### Colores Primarios
- **Primary**: `hsl(var(--primary))` - Color principal de la marca
- **Primary Foreground**: `hsl(var(--primary-foreground))` - Texto sobre color primario

### Colores de Estado
- **Success**: Verde para estados exitosos
- **Error**: Rojo para errores y acciones destructivas
- **Warning**: Amarillo para advertencias
- **Info**: Azul para información

### Colores de Fondo
- **Background**: `hsl(var(--background))` - Fondo principal
- **Card**: `hsl(var(--card))` - Fondo de tarjetas
- **Muted**: `hsl(var(--muted))` - Fondo sutil

### Colores de Texto
- **Foreground**: `hsl(var(--foreground))` - Texto principal
- **Muted Foreground**: `hsl(var(--muted-foreground))` - Texto secundario

## 🔧 Uso del Sistema de Diseño

### Importar las Clases
```tsx
import { componentClasses } from "@/lib/design-system"

// Usar en componentes
<div className={componentClasses.pageHeader}>
  <h1 className={componentClasses.pageTitle}>Título</h1>
</div>
```

### Clases Disponibles
- `pageHeader`: Header de página
- `pageTitle`: Título de página
- `tabNav`: Navegación de pestañas
- `listContainer`: Contenedor de lista
- `listItem`: Elemento de lista
- `formContainer`: Contenedor de formulario
- `actionButton`: Botón de acción
- `statusBadge`: Badge de estado
- `modalContainer`: Contenedor de modal

## 📋 Checklist de Implementación

### Para cada página nueva:
- [ ] Usar `componentClasses.pageHeader` para el header
- [ ] Usar `componentClasses.pageTitle` para el título
- [ ] Aplicar tipografía estandarizada
- [ ] Usar colores del sistema
- [ ] Implementar layout responsivo
- [ ] Usar componentes estandarizados

### Para cada componente nuevo:
- [ ] Seguir el sistema de tipografía
- [ ] Usar colores consistentes
- [ ] Aplicar espaciado uniforme
- [ ] Considerar responsividad
- [ ] Documentar el componente

## 🚀 Próximos Pasos

1. **Aplicar a todas las páginas**: Implementar el sistema en todas las páginas del dashboard
2. **Componentes adicionales**: Crear componentes estandarizados para casos específicos
3. **Tema oscuro**: Implementar soporte completo para tema oscuro
4. **Animaciones**: Agregar animaciones consistentes
5. **Iconografía**: Estandarizar el uso de iconos

## 📚 Recursos

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Design System Best Practices](https://designsystemsrepo.com/)

---

**Nota**: Este sistema de diseño está en constante evolución. Cualquier cambio debe ser documentado y aplicado consistentemente en toda la aplicación.
