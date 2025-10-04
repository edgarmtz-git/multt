/**
 * Sistema de Diseño Estandarizado
 * Basado en shadcn/ui con estilo "new-york" y base color "zinc"
 */

export const designSystem = {
  // Tipografía estandarizada
  typography: {
    // Títulos principales - más pequeños y con negrita
    h1: "text-2xl font-bold tracking-tight", // Era text-3xl, ahora más compacto
    h2: "text-xl font-semibold tracking-tight", // Para subtítulos
    h3: "text-lg font-semibold", // Para secciones
    h4: "text-base font-semibold", // Para tarjetas y elementos importantes
    
    // Texto del cuerpo
    body: "text-sm", // Tamaño base más compacto
    bodyLarge: "text-base", // Para texto importante
    bodySmall: "text-xs", // Para texto secundario
    
    // Texto especializado
    label: "text-sm font-medium", // Para etiquetas de formularios
    caption: "text-xs text-muted-foreground", // Para texto de ayuda
    code: "text-xs font-mono bg-muted px-1.5 py-0.5 rounded",
    
    // Navegación y menús
    nav: "text-sm font-medium", // Para elementos de navegación
    navActive: "text-sm font-semibold text-primary", // Para elemento activo
  },

  // Espaciado estandarizado
  spacing: {
    // Contenedores
    container: "space-y-4", // Espaciado entre secciones principales
    section: "space-y-3", // Espaciado dentro de secciones
    card: "space-y-2", // Espaciado dentro de tarjetas
    
    // Elementos
    element: "space-y-2", // Espaciado entre elementos relacionados
    compact: "space-y-1", // Espaciado compacto
  },

  // Tarjetas estandarizadas
  cards: {
    // Tarjeta principal
    primary: "bg-card text-card-foreground border rounded-lg shadow-sm",
    // Tarjeta con hover
    interactive: "bg-card text-card-foreground border rounded-lg shadow-sm hover:shadow-md transition-shadow",
    // Tarjeta compacta
    compact: "bg-card text-card-foreground border rounded-md shadow-sm",
  },

  // Botones estandarizados
  buttons: {
    // Botón primario
    primary: "h-9 px-4 py-2 text-sm font-medium", // Altura fija más compacta
    // Botón secundario
    secondary: "h-9 px-4 py-2 text-sm font-medium",
    // Botón pequeño
    small: "h-8 px-3 py-1 text-xs font-medium",
    // Botón grande
    large: "h-10 px-6 py-2 text-sm font-medium",
  },

  // Formularios estandarizados
  forms: {
    // Input estándar
    input: "h-9 px-3 py-2 text-sm",
    // Label estándar
    label: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
    // Textarea estándar
    textarea: "min-h-[80px] px-3 py-2 text-sm",
    // Select estándar
    select: "h-9 px-3 py-2 text-sm",
  },

  // Badges estandarizados
  badges: {
    // Badge estándar
    default: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
    // Badge de estado
    status: "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
    // Badge compacto
    compact: "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
  },

  // Layout responsivo
  responsive: {
    // Contenedor principal
    container: "container mx-auto px-4 sm:px-6 lg:px-8",
    // Grid responsivo
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
    // Flex responsivo
    flex: "flex flex-col sm:flex-row gap-4",
  },

  // Breakpoints personalizados
  breakpoints: {
    sm: "640px",   // Tablets pequeñas
    md: "768px",   // Tablets
    lg: "1024px",  // Laptops
    xl: "1280px",  // Desktops
    "2xl": "1536px", // Pantallas grandes
  }
} as const

// Clases de utilidad para tipografía responsiva
export const responsiveTypography = {
  // Títulos que se adaptan al dispositivo
  h1: {
    mobile: "text-xl font-bold tracking-tight",
    tablet: "text-2xl font-bold tracking-tight", 
    desktop: "text-2xl font-bold tracking-tight"
  },
  h2: {
    mobile: "text-lg font-semibold tracking-tight",
    tablet: "text-xl font-semibold tracking-tight",
    desktop: "text-xl font-semibold tracking-tight"
  },
  h3: {
    mobile: "text-base font-semibold",
    tablet: "text-lg font-semibold",
    desktop: "text-lg font-semibold"
  },
  // Texto del cuerpo responsivo
  body: {
    mobile: "text-xs",
    tablet: "text-sm", 
    desktop: "text-sm"
  },
  bodyLarge: {
    mobile: "text-sm",
    tablet: "text-base",
    desktop: "text-base"
  }
} as const

// Clases de utilidad para componentes específicos
export const componentClasses = {
  // Header de página
  pageHeader: "flex items-center justify-between mb-6",
  pageTitle: "text-2xl font-bold tracking-tight",
  
  // Navegación de pestañas
  tabNav: "flex border-b",
  tabButton: "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
  tabButtonActive: "border-primary text-primary",
  tabButtonInactive: "border-transparent text-muted-foreground hover:text-foreground",
  
  // Lista de elementos
  listContainer: "bg-card text-card-foreground border rounded-lg shadow-sm",
  listHeader: "flex items-center p-4 border-b bg-muted/50",
  listItem: "flex items-center p-4 hover:bg-muted/50 transition-colors",
  listItemCompact: "flex items-center p-3 hover:bg-muted/50 transition-colors",
  
  // Formularios
  formContainer: "space-y-4",
  formSection: "space-y-3",
  formField: "space-y-2",
  formLabel: "text-sm font-medium leading-none",
  formInput: "h-9 px-3 py-2 text-sm",
  formTextarea: "min-h-[80px] px-3 py-2 text-sm",
  
  // Botones de acción
  actionButton: "h-9 px-4 py-2 text-sm font-medium",
  actionButtonSmall: "h-8 px-3 py-1 text-xs font-medium",
  
  // Badges de estado
  statusBadge: "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
  statusBadgeVisible: "bg-green-100 text-green-800",
  statusBadgeHidden: "bg-gray-100 text-gray-800",
  
  // Dropdown de acciones
  actionsDropdown: "w-48",
  actionsButton: "h-auto p-2",
  actionsButtonText: "font-semibold text-sm",
  
  // Modal
  modalContainer: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50",
  modalContent: "bg-white rounded-lg max-w-md w-full",
  modalHeader: "flex items-center justify-between p-6 border-b",
  modalTitle: "text-xl font-semibold",
  modalBody: "p-6",
  modalFooter: "flex justify-end p-6 border-t",
} as const
