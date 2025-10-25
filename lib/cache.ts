import { redis } from './redis'

/**
 * Sistema de cache con Redis
 * Implementa cache con TTL, invalidación y estrategias de cache
 */

interface CacheOptions {
  ttl?: number // Time to live en segundos
  tags?: string[] // Tags para invalidación por grupo
  force?: boolean // Forzar actualización
}

interface CacheResult<T> {
  data: T
  fromCache: boolean
  ttl?: number
}

// TTL por defecto para diferentes tipos de datos
export const CACHE_TTL = {
  // Datos estáticos (cambian raramente)
  STORE_SETTINGS: 300, // 5 minutos
  CATEGORIES: 600, // 10 minutos
  GLOBAL_OPTIONS: 1800, // 30 minutos
  
  // Datos dinámicos (cambian frecuentemente)
  PRODUCTS: 180, // 3 minutos
  ORDERS: 60, // 1 minuto
  USER_PROFILE: 300, // 5 minutos
  
  // Datos de sesión
  SESSION: 3600, // 1 hora
  
  // Datos de API externa
  GOOGLE_MAPS: 86400, // 24 horas
  WEATHER: 1800, // 30 minutos
} as const

/**
 * Obtiene datos del cache o los genera si no existen
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<CacheResult<T>> {
  const { ttl = CACHE_TTL.PRODUCTS, force = false } = options

  try {
    // Si se fuerza actualización, saltar cache
    if (force) {
      const data = await fetcher()
      await setCache(key, data, ttl, options.tags)
      return { data, fromCache: false }
    }

    // Intentar obtener del cache
    const cached = await redis.get(key)
    if (cached && typeof cached === 'string') {
      return {
        data: JSON.parse(cached),
        fromCache: true,
        ttl: await redis.ttl(key)
      }
    }

    // Si no está en cache, generar datos
    const data = await fetcher()
    await setCache(key, data, ttl, options.tags)
    
    return { data, fromCache: false }
  } catch (error) {
    console.error('Cache error:', error)
    // En caso de error de cache, ejecutar fetcher directamente
    const data = await fetcher()
    return { data, fromCache: false }
  }
}

/**
 * Almacena datos en el cache
 */
export async function setCache(
  key: string,
  data: any,
  ttl: number = CACHE_TTL.PRODUCTS,
  tags?: string[]
): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(data))
    
    // Si hay tags, almacenar relación key-tag
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await redis.sadd(`tag:${tag}`, key)
        await redis.expire(`tag:${tag}`, ttl)
      }
    }
  } catch (error) {
    console.error('Error setting cache:', error)
  }
}

/**
 * Invalida cache por clave
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Error invalidating cache:', error)
  }
}

/**
 * Invalida cache por tag (grupo de claves)
 */
export async function invalidateByTag(tag: string): Promise<void> {
  try {
    const keys = await redis.smembers(`tag:${tag}`)
    if (keys.length > 0) {
      await redis.del(...keys)
      await redis.del(`tag:${tag}`)
    }
  } catch (error) {
    console.error('Error invalidating cache by tag:', error)
  }
}

/**
 * Invalida múltiples tags
 */
export async function invalidateByTags(tags: string[]): Promise<void> {
  for (const tag of tags) {
    await invalidateByTag(tag)
  }
}

/**
 * Limpia todo el cache
 */
export async function clearCache(): Promise<void> {
  try {
    await redis.flushdb()
  } catch (error) {
    console.error('Error clearing cache:', error)
  }
}

/**
 * Obtiene estadísticas del cache
 */
export async function getCacheStats(): Promise<{
  keys: number
  memory: string
  hits: number
  misses: number
}> {
  try {
    const keys = await redis.dbsize()

    return {
      keys,
      memory: 'N/A', // Upstash Redis no soporta info command
      hits: 0, // Implementar contadores si es necesario
      misses: 0
    }
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return { keys: 0, memory: 'N/A', hits: 0, misses: 0 }
  }
}

// Funciones específicas para diferentes tipos de datos

/**
 * Cache para configuraciones de tienda
 */
export async function getCachedStoreSettings(
  storeSlug: string,
  fetcher: () => Promise<any>
) {
  return getCached(
    `store:${storeSlug}`,
    fetcher,
    { ttl: CACHE_TTL.STORE_SETTINGS, tags: ['store', `store:${storeSlug}`] }
  )
}

/**
 * Cache para productos de una tienda
 */
export async function getCachedProducts(
  storeSlug: string,
  fetcher: () => Promise<any>
) {
  return getCached(
    `products:${storeSlug}`,
    fetcher,
    { ttl: CACHE_TTL.PRODUCTS, tags: ['products', `store:${storeSlug}`] }
  )
}

/**
 * Cache para categorías de una tienda
 */
export async function getCachedCategories(
  storeSlug: string,
  fetcher: () => Promise<any>
) {
  return getCached(
    `categories:${storeSlug}`,
    fetcher,
    { ttl: CACHE_TTL.CATEGORIES, tags: ['categories', `store:${storeSlug}`] }
  )
}

/**
 * Cache para órdenes de un usuario
 */
export async function getCachedOrders(
  userId: string,
  fetcher: () => Promise<any>
) {
  return getCached(
    `orders:${userId}`,
    fetcher,
    { ttl: CACHE_TTL.ORDERS, tags: ['orders', `user:${userId}`] }
  )
}

/**
 * Invalida cache cuando se actualiza una tienda
 */
export async function invalidateStoreCache(storeSlug: string): Promise<void> {
  await invalidateByTags([`store:${storeSlug}`])
}

/**
 * Invalida cache cuando se actualiza un usuario
 */
export async function invalidateUserCache(userId: string): Promise<void> {
  await invalidateByTags([`user:${userId}`])
}

/**
 * Invalida cache cuando se actualiza un producto
 */
export async function invalidateProductCache(storeSlug: string): Promise<void> {
  await invalidateByTags([`store:${storeSlug}`, 'products'])
}

/**
 * Invalida cache cuando se actualiza una categoría
 */
export async function invalidateCategoryCache(storeSlug: string): Promise<void> {
  await invalidateByTags([`store:${storeSlug}`, 'categories'])
}
