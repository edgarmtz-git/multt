import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'
import { validators, userSchema as centralizedUserSchema, productSchema as centralizedProductSchema, orderSchema as centralizedOrderSchema, storeSettingsSchema as centralizedStoreSettingsSchema } from './validators'

// Re-exportar esquemas centralizados
export const userSchema = centralizedUserSchema
export const productSchema = centralizedProductSchema  
export const orderSchema = centralizedOrderSchema
export const storeSettingsSchema = centralizedStoreSettingsSchema

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

// Re-exportar validadores centralizados
export { validators }