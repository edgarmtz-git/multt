import { redis } from './redis'

/**
 * Rate limiting basado en Redis para producción
 * - Escalable horizontalmente (multi-instancia)
 * - Persistente entre reinicios
 * - Configurable por endpoint
 */
export async function redisRateLimit(
  ip: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): Promise<boolean> {
  const key = `rate-limit:${ip}`
  const now = Date.now()

  try {
    // Verificar que Redis esté configurado
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.warn('⚠️  Redis no configurado, usando rate limiting local')
      return fallbackRateLimit(ip, maxRequests, windowMs)
    }

    // Incrementar contador
    const count = await redis.incr(key)

    // Establecer expiración en la primera request
    if (count === 1) {
      await redis.pexpire(key, windowMs)
    }

    // Permitir si no excede el límite
    return count <= maxRequests
  } catch (error) {
    console.error('❌ Redis rate limit error:', error)
    // Fail open: en caso de error de Redis, permitir la request
    // (mejor disponibilidad que seguridad en este caso)
    return true
  }
}

/**
 * Fallback a rate limiting en memoria si Redis no está disponible
 * (solo para desarrollo o emergencias)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function fallbackRateLimit(ip: string, maxRequests: number, windowMs: number): boolean {
  const key = ip
  const now = Date.now()

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

/**
 * Configuración de rate limits por tipo de endpoint
 */
export const RATE_LIMITS = {
  AUTH: { max: 5, window: 60000 },        // 5 req/min para autenticación
  API_WRITE: { max: 30, window: 60000 },  // 30 req/min para escritura
  API_READ: { max: 100, window: 60000 },  // 100 req/min para lectura
  PUBLIC: { max: 60, window: 60000 }      // 60 req/min para rutas públicas
} as const
