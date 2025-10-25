/**
 * Tipos específicos para APIs
 */

// Tipos de respuesta de API
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: {
    code: string
    message: string
    requestId?: string
  }
}

// Tipos para órdenes
export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  variantName?: string
  variantId?: string
  options?: Array<{
    name: string
    value: string
  }>
}

export interface OrderAddress {
  street: string
  number: string
  neighborhood: string
  reference?: string
  houseType?: 'casa' | 'departamento' | 'oficina' | 'otro'
}

export interface CreateOrderRequest {
  customerName: string
  customerWhatsApp: string
  customerEmail?: string
  deliveryMethod: 'delivery' | 'pickup'
  paymentMethod: 'cash' | 'transfer'
  address?: OrderAddress
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  observations?: string
  orderNumber: string
  amountPaid: number
  change: number
  storeSlug: string
}

// Tipos para productos
export interface ProductOption {
  name: string
  required: boolean
  maxSelections: number
  variants: Array<{
    name: string
    price: number
    isActive: boolean
  }>
}

export interface CreateProductRequest {
  name: string
  description?: string
  price: number
  categoryId: string
  isActive?: boolean
  isAvailable?: boolean
  imageUrl?: string
  options?: ProductOption[]
}

// Tipos para categorías
export interface CreateCategoryRequest {
  name: string
  description?: string
  imageUrl?: string
  isActive?: boolean
  order?: number
}

// Tipos para configuración de tienda
export interface StoreSettingsRequest {
  storeName: string
  storeSlug: string
  country: string
  language: string
  currency: string
  distanceUnit: 'km' | 'mi'
  mapProvider?: 'GOOGLE' | 'FALLBACK'
  googleMapsApiKey?: string
  taxRate: number
  taxMethod: 'included' | 'excluded'
  enableBusinessHours?: boolean
  disableCheckoutOutsideHours?: boolean
  deliveryEnabled?: boolean
  useBasePrice?: boolean
  baseDeliveryPrice?: number
  baseDeliveryThreshold?: number
  paymentsEnabled?: boolean
  storeActive?: boolean
  passwordProtected?: boolean
}

// Tipos para usuarios
export interface CreateUserRequest {
  name: string
  email: string
  password: string
  company: string
  phone?: string
  role: 'ADMIN' | 'CLIENT'
  isActive?: boolean
  isSuspended?: boolean
}

// Tipos para paginación
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
  limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Tipos para filtros
export interface ProductFilters {
  categoryId?: string
  isActive?: boolean
  isAvailable?: boolean
  minPrice?: number
  maxPrice?: number
  search?: string
}

export interface OrderFilters {
  status?: string
  customerName?: string
  dateFrom?: string
  dateTo?: string
  minTotal?: number
  maxTotal?: number
}

// Tipos para estadísticas
export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalCategories: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    customerName: string
    total: number
    status: string
    createdAt: string
  }>
}

// Tipos para archivos
export interface FileUploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
}

// Tipos para geolocalización
export interface Coordinates {
  latitude: number
  longitude: number
}

export interface AddressWithCoordinates {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  coordinates?: Coordinates
}

// Tipos para configuración de entrega
export interface DeliveryConfig {
  method: 'distance' | 'zones' | 'manual'
  pricePerKm?: number
  maxDistance?: number
  manualMessage?: string
  zones?: Array<{
    name: string
    price: number
    area: string
  }>
}

// Tipos para horarios de negocio
export interface BusinessHours {
  monday: { open: string; close: string; closed: boolean }
  tuesday: { open: string; close: string; closed: boolean }
  wednesday: { open: string; close: string; closed: boolean }
  thursday: { open: string; close: string; closed: boolean }
  friday: { open: string; close: string; closed: boolean }
  saturday: { open: string; close: string; closed: boolean }
  sunday: { open: string; close: string; closed: boolean }
}

// Tipos para notificaciones
export interface NotificationConfig {
  email: {
    enabled: boolean
    templates: {
      orderConfirmation: string
      orderUpdate: string
      orderCancelled: string
    }
  }
  whatsapp: {
    enabled: boolean
    phoneNumber: string
    templates: {
      orderConfirmation: string
      orderUpdate: string
      orderCancelled: string
    }
  }
}
