'use client'

import { useState, useEffect, useCallback } from 'react'
import { getCached, invalidateCache } from '@/lib/cache'
import { logger } from '@/lib/logger'

interface UseOptimizedQueryOptions<T> {
  queryKey: string
  fetcher: () => Promise<T>
  ttl?: number
  tags?: string[]
  enabled?: boolean
  refetchOnMount?: boolean
  refetchOnWindowFocus?: boolean
}

interface UseOptimizedQueryResult<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  invalidate: () => Promise<void>
  fromCache: boolean
}

/**
 * Hook para consultas optimizadas con cache
 */
export function useOptimizedQuery<T>({
  queryKey,
  fetcher,
  ttl,
  tags,
  enabled = true,
  refetchOnMount = true,
  refetchOnWindowFocus = false
}: UseOptimizedQueryOptions<T>): UseOptimizedQueryResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [fromCache, setFromCache] = useState(false)

  const executeQuery = useCallback(async (force = false) => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await getCached(
        queryKey,
        fetcher,
        { ttl, tags, force }
      )

      setData(result.data)
      setFromCache(result.fromCache)

      logger.debug('Query executed', {
        queryKey,
        fromCache: result.fromCache,
        ttl: result.ttl
      })
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      logger.error('Query failed', { queryKey, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }, [queryKey, fetcher, ttl, tags, enabled])

  const refetch = useCallback(async () => {
    await executeQuery(true)
  }, [executeQuery])

  const invalidate = useCallback(async () => {
    await invalidateCache(queryKey)
    setData(null)
    setFromCache(false)
  }, [queryKey])

  useEffect(() => {
    if (enabled && refetchOnMount) {
      executeQuery()
    }
  }, [enabled, refetchOnMount, executeQuery])

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return

    const handleFocus = () => {
      executeQuery()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnWindowFocus, executeQuery])

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidate,
    fromCache
  }
}

/**
 * Hook específico para productos
 */
export function useProducts(
  userId: string,
  options: {
    isActive?: boolean
    categoryId?: string
    search?: string
    limit?: number
    offset?: number
  } = {}
) {
  return useOptimizedQuery({
    queryKey: `products:${userId}:${JSON.stringify(options)}`,
    fetcher: async () => {
      const response = await fetch(`/api/dashboard/products?${new URLSearchParams({
        ...options,
        limit: options.limit?.toString() || '50',
        offset: options.offset?.toString() || '0'
      })}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      return response.json()
    },
    ttl: 180, // 3 minutos
    tags: ['products', `user:${userId}`]
  })
}

/**
 * Hook específico para categorías
 */
export function useCategories(
  userId: string,
  options: {
    isActive?: boolean
    limit?: number
    offset?: number
  } = {}
) {
  return useOptimizedQuery({
    queryKey: `categories:${userId}:${JSON.stringify(options)}`,
    fetcher: async () => {
      const response = await fetch(`/api/dashboard/categories?${new URLSearchParams({
        ...options,
        limit: options.limit?.toString() || '50',
        offset: options.offset?.toString() || '0'
      })}`)
      if (!response.ok) throw new Error('Failed to fetch categories')
      return response.json()
    },
    ttl: 600, // 10 minutos
    tags: ['categories', `user:${userId}`]
  })
}

/**
 * Hook específico para órdenes
 */
export function useOrders(
  userId: string,
  options: {
    status?: string
    limit?: number
    offset?: number
    dateFrom?: string
    dateTo?: string
  } = {}
) {
  return useOptimizedQuery({
    queryKey: `orders:${userId}:${JSON.stringify(options)}`,
    fetcher: async () => {
      const response = await fetch(`/api/dashboard/orders?${new URLSearchParams({
        ...options,
        limit: options.limit?.toString() || '50',
        offset: options.offset?.toString() || '0'
      })}`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      return response.json()
    },
    ttl: 60, // 1 minuto
    tags: ['orders', `user:${userId}`]
  })
}

/**
 * Hook específico para configuración de tienda
 */
export function useStoreSettings(storeSlug: string) {
  return useOptimizedQuery({
    queryKey: `store:${storeSlug}`,
    fetcher: async () => {
      const response = await fetch(`/api/store/${storeSlug}`)
      if (!response.ok) throw new Error('Failed to fetch store settings')
      return response.json()
    },
    ttl: 300, // 5 minutos
    tags: ['store', `store:${storeSlug}`]
  })
}

/**
 * Hook específico para productos públicos
 */
export function usePublicProducts(
  storeSlug: string,
  options: {
    categoryId?: string
    search?: string
    limit?: number
    offset?: number
  } = {}
) {
  return useOptimizedQuery({
    queryKey: `public-products:${storeSlug}:${JSON.stringify(options)}`,
    fetcher: async () => {
      const response = await fetch(`/api/store/${storeSlug}/products?${new URLSearchParams({
        ...options,
        limit: options.limit?.toString() || '50',
        offset: options.offset?.toString() || '0'
      })}`)
      if (!response.ok) throw new Error('Failed to fetch public products')
      return response.json()
    },
    ttl: 180, // 3 minutos
    tags: ['public-products', `store:${storeSlug}`]
  })
}

/**
 * Hook específico para categorías públicas
 */
export function usePublicCategories(storeSlug: string) {
  return useOptimizedQuery({
    queryKey: `public-categories:${storeSlug}`,
    fetcher: async () => {
      const response = await fetch(`/api/store/${storeSlug}/categories`)
      if (!response.ok) throw new Error('Failed to fetch public categories')
      return response.json()
    },
    ttl: 600, // 10 minutos
    tags: ['public-categories', `store:${storeSlug}`]
  })
}

/**
 * Hook para estadísticas del dashboard
 */
export function useDashboardStats(userId: string) {
  return useOptimizedQuery({
    queryKey: `dashboard-stats:${userId}`,
    fetcher: async () => {
      const response = await fetch(`/api/dashboard/stats`)
      if (!response.ok) throw new Error('Failed to fetch dashboard stats')
      return response.json()
    },
    ttl: 300, // 5 minutos
    tags: ['stats', `user:${userId}`]
  })
}
