import { NextRequest, NextResponse } from 'next/server'

// Rate limiting storage (en producción usar Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number // Ventana de tiempo en ms
  maxRequests: number // Máximo de requests por ventana
  message?: string
}

// Configuraciones de rate limiting por endpoint
const rateLimitConfigs: Record<string, RateLimitConfig> = {
  '/api/auth/signin': {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 intentos de login por 15 minutos
    message: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.'
  },
  '/api/orders': {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 10, // 10 pedidos por minuto
    message: 'Demasiados pedidos. Espera un momento antes de intentar de nuevo.'
  },
  '/api/dashboard/settings': {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 20, // 20 actualizaciones por minuto
    message: 'Demasiadas actualizaciones. Espera un momento.'
  },
  '/api/dashboard/upload-image': {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 5, // 5 uploads por minuto
    message: 'Demasiadas subidas de imágenes. Espera un momento.'
  },
  default: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100, // 100 requests por minuto
    message: 'Demasiadas solicitudes. Espera un momento.'
  }
}

export function rateLimit(request: NextRequest, endpoint?: string): NextResponse | null {
  const ip = getClientIP(request)
  const config = rateLimitConfigs[endpoint || 'default'] || rateLimitConfigs.default
  const key = `${ip}:${endpoint || 'default'}`
  
  const now = Date.now()
  const windowStart = now - config.windowMs
  
  // Limpiar entradas expiradas
  for (const [k, v] of rateLimitMap.entries()) {
    if (v.resetTime < now) {
      rateLimitMap.delete(k)
    }
  }
  
  // Obtener o crear entrada para esta IP/endpoint
  let entry = rateLimitMap.get(key)
  
  if (!entry || entry.resetTime < now) {
    // Nueva ventana de tiempo
    entry = {
      count: 1,
      resetTime: now + config.windowMs
    }
    rateLimitMap.set(key, entry)
  } else {
    // Incrementar contador
    entry.count++
    
    if (entry.count > config.maxRequests) {
      // Rate limit excedido
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: config.message,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString()
          }
        }
      )
    }
  }
  
  // Agregar headers informativos
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', (config.maxRequests - entry.count).toString())
  response.headers.set('X-RateLimit-Reset', entry.resetTime.toString())
  
  return null
}

function getClientIP(request: NextRequest): string {
  // Intentar obtener IP real considerando proxies
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return request.ip || 'unknown'
}

// Función para limpiar rate limiting (llamar periódicamente)
export function cleanupRateLimit(): void {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key)
    }
  }
}

// Limpiar cada 5 minutos
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimit, 5 * 60 * 1000)
}
