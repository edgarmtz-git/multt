// Funciones de seguridad simplificadas que no requieren dependencias externas

// Rate limiting simple en memoria
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function simpleRateLimit(ip: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const key = ip
  const now = Date.now()
  const windowStart = now - windowMs
  
  // Limpiar entradas expiradas
  for (const [k, v] of rateLimitMap.entries()) {
    if (v.resetTime < now) {
      rateLimitMap.delete(k)
    }
  }
  
  // Obtener o crear entrada para esta IP
  let entry = rateLimitMap.get(key)
  
  if (!entry || entry.resetTime < now) {
    // Nueva ventana de tiempo
    entry = {
      count: 1,
      resetTime: now + windowMs
    }
    rateLimitMap.set(key, entry)
    return true
  } else {
    // Incrementar contador
    entry.count++
    return entry.count <= maxRequests
  }
}

// Validación básica de email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validación básica de contraseña
export function isValidPassword(password: string): boolean {
  // Al menos 8 caracteres, una mayúscula, una minúscula, un número
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

// Sanitización básica de texto
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remover < y >
    .replace(/javascript:/gi, '') // Remover javascript:
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim()
}

// Headers de seguridad básicos
export const basicSecurityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}

// Función para aplicar headers básicos
export function applyBasicSecurityHeaders(response: Response): Response {
  Object.entries(basicSecurityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

// Logging simple
export function logSecurityEvent(event: string, details?: any): void {
  const timestamp = new Date().toISOString()
  console.log(`[${timestamp}] SECURITY: ${event}`, details || '')
}

// Validación de sesión básica
export function isSessionValid(session: any): boolean {
  if (!session || !session.user || !session.user.id) {
    return false
  }
  
  // Verificar expiración básica (2 horas)
  if (session.expires && new Date(session.expires) < new Date()) {
    return false
  }
  
  return true
}
