import { z } from 'zod'

/**
 * Validadores centralizados para evitar duplicación
 * Reemplaza las validaciones duplicadas en lib/validation.ts, lib/config.ts, lib/security-simple.ts
 */

// ==================== VALIDADORES BÁSICOS ====================

export const validators = {
  // Email - reemplaza las 3 implementaciones duplicadas
  email: z.string().email('Email inválido'),
  
  // Slug - reemplaza las 2 implementaciones duplicadas
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo letras minúsculas, números y guiones')
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(50, 'El slug no puede tener más de 50 caracteres')
    .refine(
      (slug) => !slug.startsWith('-') && !slug.endsWith('-'),
      'El slug no puede empezar o terminar con guión'
    ),
  
  // WhatsApp - validación específica
  whatsapp: z.string()
    .regex(/^[\d\s\-\+\(\)]{10,20}$/, 'Formato de WhatsApp inválido')
    .min(10, 'WhatsApp debe tener al menos 10 caracteres')
    .max(20, 'WhatsApp no puede tener más de 20 caracteres'),
  
  // Contraseña - validación robusta
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe contener al menos una mayúscula, una minúscula y un número'),
  
  // Teléfono - validación flexible
  phone: z.string()
    .regex(/^[\d\s\-\+\(\)]{10,15}$/, 'Formato de teléfono inválido')
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono no puede tener más de 15 dígitos'),
  
  // Nombre - validación básica
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  // Precio - validación monetaria
  price: z.number()
    .min(0, 'El precio no puede ser negativo')
    .max(999999.99, 'El precio no puede ser mayor a 999,999.99'),
  
  // Cantidad - validación numérica
  quantity: z.number()
    .int('La cantidad debe ser un número entero')
    .min(1, 'La cantidad debe ser al menos 1')
    .max(999, 'La cantidad no puede ser mayor a 999'),
  
  // URL - validación de enlaces
  url: z.string().url('URL inválida'),
  
  // Texto HTML - sanitización básica
  htmlText: z.string()
    .max(5000, 'El texto no puede tener más de 5000 caracteres')
    .refine(
      (text) => !/<script|javascript:|on\w+=/i.test(text),
      'El texto contiene código no permitido'
    )
}

// ==================== SCHEMAS COMPUESTOS ====================

export const userSchema = z.object({
  name: validators.name,
  email: validators.email,
  password: validators.password,
  company: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres').max(100),
  phone: validators.phone.optional(),
  role: z.enum(['ADMIN', 'CLIENT']),
  isActive: z.boolean().optional().default(true),
  isSuspended: z.boolean().optional().default(false)
})

export const storeSettingsSchema = z.object({
  storeName: validators.name,
  storeSlug: validators.slug,
  country: z.string().min(2).max(50),
  language: z.string().min(2).max(5),
  currency: z.string().min(3).max(3),
  distanceUnit: z.enum(['km', 'mi']),
  mapProvider: z.enum(['GOOGLE', 'FALLBACK']).optional(),
  googleMapsApiKey: z.string().optional(),
  taxRate: validators.price,
  taxMethod: z.enum(['included', 'excluded']),
  enableBusinessHours: z.boolean().optional().default(false),
  disableCheckoutOutsideHours: z.boolean().optional().default(false),
  deliveryEnabled: z.boolean().optional().default(false),
  useBasePrice: z.boolean().optional().default(false),
  baseDeliveryPrice: validators.price.optional().default(0),
  baseDeliveryThreshold: validators.price.optional().default(0),
  paymentsEnabled: z.boolean().optional().default(true),
  storeActive: z.boolean().optional().default(true),
  passwordProtected: z.boolean().optional().default(false)
})

export const productSchema = z.object({
  name: z.string().min(2, 'El nombre del producto debe tener al menos 2 caracteres').max(100),
  description: validators.htmlText.optional(),
  price: validators.price,
  categoryId: z.string().uuid('ID de categoría inválido'),
  isActive: z.boolean().optional().default(true),
  isAvailable: z.boolean().optional().default(true),
  imageUrl: validators.url.optional(),
  options: z.array(z.object({
    name: z.string().min(1).max(50),
    required: z.boolean().optional().default(false),
    maxSelections: z.number().int().min(1).max(10).optional().default(1),
    variants: z.array(z.object({
      name: z.string().min(1).max(50),
      price: validators.price,
      isActive: z.boolean().optional().default(true)
    })).min(1, 'Debe tener al menos una variante')
  })).optional().default([])
})

export const categorySchema = z.object({
  name: z.string().min(2, 'El nombre de la categoría debe tener al menos 2 caracteres').max(50),
  description: validators.htmlText.optional(),
  imageUrl: validators.url.optional(),
  isActive: z.boolean().optional().default(true),
  order: z.number().int().min(0).optional().default(0)
})

export const orderSchema = z.object({
  customerName: validators.name,
  customerWhatsApp: validators.whatsapp,
  customerEmail: validators.email.optional(),
  deliveryMethod: z.enum(['DELIVERY', 'PICKUP']),
  paymentMethod: z.enum(['CASH', 'CARD', 'TRANSFER']),
  address: z.object({
    street: z.string().min(5, 'La dirección debe tener al menos 5 caracteres').max(200),
    city: z.string().min(2, 'La ciudad debe tener al menos 2 caracteres').max(50),
    state: z.string().min(2, 'El estado debe tener al menos 2 caracteres').max(50),
    zipCode: z.string().min(3, 'El código postal debe tener al menos 3 caracteres').max(10),
    country: z.string().min(2, 'El país debe tener al menos 2 caracteres').max(50),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    }).optional()
  }),
  items: z.array(z.object({
    productId: z.string().uuid('ID de producto inválido'),
    quantity: validators.quantity,
    selectedOptions: z.array(z.object({
      optionName: z.string().min(1).max(50),
      variantName: z.string().min(1).max(50),
      price: validators.price
    })).optional().default([])
  })).min(1, 'Debe tener al menos un producto'),
  subtotal: validators.price,
  deliveryFee: validators.price,
  total: validators.price,
  observations: z.string().max(500, 'Las observaciones no pueden tener más de 500 caracteres').optional()
})

// ==================== FUNCIONES DE VALIDACIÓN ====================

/**
 * Valida un email y devuelve resultado estructurado
 */
export function validateEmail(email: string): { isValid: boolean; message?: string } {
  try {
    validators.email.parse(email)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, message: error.errors[0].message }
    }
    return { isValid: false, message: 'Email inválido' }
  }
}

/**
 * Valida un slug y devuelve resultado estructurado
 */
export function validateSlug(slug: string): { isValid: boolean; message?: string } {
  try {
    validators.slug.parse(slug)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, message: error.errors[0].message }
    }
    return { isValid: false, message: 'Slug inválido' }
  }
}

/**
 * Valida un WhatsApp y devuelve resultado estructurado
 */
export function validateWhatsApp(whatsapp: string): { isValid: boolean; message?: string } {
  try {
    validators.whatsapp.parse(whatsapp)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, message: error.errors[0].message }
    }
    return { isValid: false, message: 'WhatsApp inválido' }
  }
}

// ==================== EXPORTACIONES ====================

export { z }
export default validators
