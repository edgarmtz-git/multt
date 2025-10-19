// Importaciones condicionales para evitar errores en build
let z: any
let DOMPurify: any

try {
  z = require('zod')
} catch (error) {
  console.warn('Zod not available, validation will be disabled')
}

try {
  DOMPurify = require('isomorphic-dompurify')
} catch (error) {
  console.warn('DOMPurify not available, sanitization will be disabled')
}

// Esquemas de validación para diferentes entidades
export const userSchema = z.object({
  email: z.string()
    .email('Email inválido')
    .min(5, 'Email muy corto')
    .max(255, 'Email muy largo')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128, 'La contraseña es muy larga')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'),
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es muy largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .trim(),
  company: z.string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa es muy largo')
    .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$/, 'Caracteres no válidos en el nombre de la empresa')
    .trim()
    .optional()
})

export const productSchema = z.object({
  name: z.string()
    .min(1, 'El nombre del producto es requerido')
    .max(200, 'El nombre del producto es muy largo')
    .trim(),
  description: z.string()
    .max(2000, 'La descripción es muy larga')
    .trim()
    .optional(),
  price: z.number()
    .min(0, 'El precio no puede ser negativo')
    .max(999999.99, 'El precio es muy alto')
    .multipleOf(0.01, 'El precio debe tener máximo 2 decimales'),
  isActive: z.boolean().optional(),
  categoryId: z.string().cuid('ID de categoría inválido').optional()
})

export const orderSchema = z.object({
  customerName: z.string()
    .min(2, 'El nombre del cliente debe tener al menos 2 caracteres')
    .max(100, 'El nombre del cliente es muy largo')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios')
    .trim(),
  customerWhatsApp: z.string()
    .regex(/^\d{10}$/, 'El WhatsApp debe tener exactamente 10 dígitos'),
  customerEmail: z.string()
    .email('Email inválido')
    .optional(),
  deliveryMethod: z.enum(['delivery', 'pickup'], {
    errorMap: () => ({ message: 'Método de entrega inválido' })
  }),
  paymentMethod: z.enum(['cash', 'transfer'], {
    errorMap: () => ({ message: 'Método de pago inválido' })
  }),
  address: z.object({
    street: z.string().min(1, 'La calle es requerida').max(200, 'Calle muy larga').trim(),
    number: z.string().min(1, 'El número es requerido').max(20, 'Número muy largo').trim(),
    neighborhood: z.string().min(1, 'La colonia es requerida').max(100, 'Colonia muy larga').trim(),
    reference: z.string().max(500, 'Referencias muy largas').trim().optional(),
    houseType: z.enum(['casa', 'departamento', 'oficina', 'otro']).optional()
  }).optional(),
  items: z.array(z.object({
    id: z.string().cuid('ID de producto inválido'),
    name: z.string().min(1, 'Nombre de producto requerido'),
    price: z.number().min(0, 'Precio inválido'),
    quantity: z.number().int().min(1, 'Cantidad mínima: 1').max(100, 'Cantidad máxima: 100'),
    variantName: z.string().optional(),
    options: z.array(z.object({
      name: z.string(),
      value: z.string()
    })).optional()
  })).min(1, 'Debe incluir al menos un producto'),
  subtotal: z.number().min(0, 'Subtotal inválido'),
  deliveryFee: z.number().min(0, 'Costo de envío inválido'),
  total: z.number().min(0, 'Total inválido'),
  observations: z.string().max(1000, 'Observaciones muy largas').trim().optional()
})

export const storeSettingsSchema = z.object({
  storeName: z.string()
    .min(2, 'El nombre de la tienda debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la tienda es muy largo')
    .trim(),
  storeSlug: z.string()
    .min(2, 'El slug debe tener al menos 2 caracteres')
    .max(50, 'El slug es muy largo')
    .regex(/^[a-z0-9\-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones')
    .trim(),
  whatsappMainNumber: z.string()
    .regex(/^\d{10}$/, 'El WhatsApp debe tener exactamente 10 dígitos')
    .optional(),
  phoneNumber: z.string()
    .regex(/^\d{10}$/, 'El teléfono debe tener exactamente 10 dígitos')
    .optional(),
  address: z.string().max(500, 'Dirección muy larga').optional(),
  deliveryCalculationMethod: z.enum(['distance', 'zones', 'manual']).optional(),
  pricePerKm: z.number().min(0, 'Precio por km no puede ser negativo').max(1000, 'Precio por km muy alto').optional(),
  maxDeliveryDistance: z.number().min(0, 'Distancia máxima no puede ser negativa').max(100, 'Distancia máxima muy alta').optional(),
  manualDeliveryMessage: z.string().max(500, 'Mensaje muy largo').optional()
})

// Función para sanitizar HTML
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side
    const { JSDOM } = require('jsdom')
    const window = new JSDOM('').window
    const DOMPurify = require('isomorphic-dompurify')
    return DOMPurify.sanitize(html, { 
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    })
  } else {
    // Client-side
    return DOMPurify.sanitize(html, { 
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: []
    })
  }
}

// Función para sanitizar texto
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim()
}

// Función para validar y sanitizar datos
export function validateAndSanitize<T>(
  data: unknown,
  schema: any
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    // Validar con Zod
    const validatedData = schema.parse(data)
    
    // Sanitizar strings
    const sanitizedData = sanitizeObject(validatedData)
    
    return { success: true, data: sanitizedData }
  } catch (error: unknown) {
    if (z && error instanceof z.ZodError) {
      const zodError = error as any
      return {
        success: false,
        errors: zodError.errors.map((err: any) => err.message)
      }
    }
    return { 
      success: false, 
      errors: ['Error de validación desconocido'] 
    }
  }
}

// Función recursiva para sanitizar objetos
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeText(obj)
  } else if (Array.isArray(obj)) {
    return obj.map(sanitizeObject)
  } else if (obj && typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value)
    }
    return sanitized
  }
  return obj
}

// Función para validar archivos
export function validateFile(file: File, options: {
  maxSize?: number // en bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
}): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = [], allowedExtensions = [] } = options
  
  // Verificar tamaño
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `El archivo es muy grande. Máximo: ${Math.round(maxSize / 1024 / 1024)}MB` 
    }
  }
  
  // Verificar tipo MIME
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}` 
    }
  }
  
  // Verificar extensión
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !allowedExtensions.includes(extension)) {
      return { 
        valid: false, 
        error: `Extensión no permitida. Permitidas: ${allowedExtensions.join(', ')}` 
      }
    }
  }
  
  return { valid: true }
}
