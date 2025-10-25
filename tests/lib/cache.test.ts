import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { 
  getCached, 
  setCache, 
  invalidateCache, 
  invalidateByTag,
  clearCache,
  getCacheStats,
  CACHE_TTL 
} from '@/lib/cache'

// Mock Redis
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    flushdb: vi.fn(),
    dbsize: vi.fn(),
    info: vi.fn(),
    sadd: vi.fn(),
    smembers: vi.fn(),
    expire: vi.fn(),
    ttl: vi.fn()
  }
}))

describe('Cache System', () => {
  const { redis } = await import('@/lib/redis')
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getCached', () => {
    it('should return cached data when available', async () => {
      const mockData = { id: '1', name: 'Test' }
      vi.mocked(redis.get).mockResolvedValue(JSON.stringify(mockData))
      vi.mocked(redis.ttl).mockResolvedValue(300)

      const fetcher = vi.fn()
      const result = await getCached('test-key', fetcher)

      expect(result.data).toEqual(mockData)
      expect(result.fromCache).toBe(true)
      expect(fetcher).not.toHaveBeenCalled()
    })

    it('should call fetcher when cache miss', async () => {
      mockRedis.get.mockResolvedValue(null)
      mockRedis.setex.mockResolvedValue('OK')

      const mockData = { id: '1', name: 'Test' }
      const fetcher = vi.fn().mockResolvedValue(mockData)

      const result = await getCached('test-key', fetcher)

      expect(result.data).toEqual(mockData)
      expect(result.fromCache).toBe(false)
      expect(fetcher).toHaveBeenCalledOnce()
      expect(mockRedis.setex).toHaveBeenCalledWith('test-key', CACHE_TTL.PRODUCTS, JSON.stringify(mockData))
    })

    it('should handle fetcher errors gracefully', async () => {
      mockRedis.get.mockResolvedValue(null)
      const fetcher = vi.fn().mockRejectedValue(new Error('Fetcher error'))

      const result = await getCached('test-key', fetcher)

      expect(result.data).toBeUndefined()
      expect(result.fromCache).toBe(false)
    })

    it('should force refresh when force=true', async () => {
      const mockData = { id: '1', name: 'Test' }
      const fetcher = vi.fn().mockResolvedValue(mockData)
      mockRedis.setex.mockResolvedValue('OK')

      const result = await getCached('test-key', fetcher, { force: true })

      expect(result.data).toEqual(mockData)
      expect(result.fromCache).toBe(false)
      expect(mockRedis.get).not.toHaveBeenCalled()
    })

    it('should use custom TTL when provided', async () => {
      mockRedis.get.mockResolvedValue(null)
      mockRedis.setex.mockResolvedValue('OK')

      const fetcher = vi.fn().mockResolvedValue({})
      await getCached('test-key', fetcher, { ttl: 600 })

      expect(mockRedis.setex).toHaveBeenCalledWith('test-key', 600, JSON.stringify({}))
    })

    it('should handle tags correctly', async () => {
      mockRedis.get.mockResolvedValue(null)
      mockRedis.setex.mockResolvedValue('OK')
      mockRedis.sadd.mockResolvedValue(1)
      mockRedis.expire.mockResolvedValue(1)

      const fetcher = vi.fn().mockResolvedValue({})
      await getCached('test-key', fetcher, { tags: ['tag1', 'tag2'] })

      expect(mockRedis.sadd).toHaveBeenCalledWith('tag:tag1', 'test-key')
      expect(mockRedis.sadd).toHaveBeenCalledWith('tag:tag2', 'test-key')
      expect(mockRedis.expire).toHaveBeenCalledTimes(2)
    })
  })

  describe('setCache', () => {
    it('should store data with default TTL', async () => {
      const data = { id: '1', name: 'Test' }
      mockRedis.setex.mockResolvedValue('OK')

      await setCache('test-key', data)

      expect(mockRedis.setex).toHaveBeenCalledWith('test-key', CACHE_TTL.PRODUCTS, JSON.stringify(data))
    })

    it('should store data with custom TTL', async () => {
      const data = { id: '1', name: 'Test' }
      mockRedis.setex.mockResolvedValue('OK')

      await setCache('test-key', data, 600)

      expect(mockRedis.setex).toHaveBeenCalledWith('test-key', 600, JSON.stringify(data))
    })

    it('should handle tags when provided', async () => {
      const data = { id: '1', name: 'Test' }
      mockRedis.setex.mockResolvedValue('OK')
      mockRedis.sadd.mockResolvedValue(1)
      mockRedis.expire.mockResolvedValue(1)

      await setCache('test-key', data, 300, ['tag1', 'tag2'])

      expect(mockRedis.sadd).toHaveBeenCalledWith('tag:tag1', 'test-key')
      expect(mockRedis.sadd).toHaveBeenCalledWith('tag:tag2', 'test-key')
      expect(mockRedis.expire).toHaveBeenCalledTimes(2)
    })
  })

  describe('invalidateCache', () => {
    it('should delete cache key', async () => {
      mockRedis.del.mockResolvedValue(1)

      await invalidateCache('test-key')

      expect(mockRedis.del).toHaveBeenCalledWith('test-key')
    })
  })

  describe('invalidateByTag', () => {
    it('should delete all keys with tag', async () => {
      mockRedis.smembers.mockResolvedValue(['key1', 'key2'])
      mockRedis.del.mockResolvedValue(2)

      await invalidateByTag('test-tag')

      expect(mockRedis.smembers).toHaveBeenCalledWith('tag:test-tag')
      expect(mockRedis.del).toHaveBeenCalledWith('key1', 'key2')
      expect(mockRedis.del).toHaveBeenCalledWith('tag:test-tag')
    })

    it('should handle empty tag gracefully', async () => {
      mockRedis.smembers.mockResolvedValue([])

      await invalidateByTag('empty-tag')

      expect(mockRedis.del).not.toHaveBeenCalled()
    })
  })

  describe('clearCache', () => {
    it('should flush database', async () => {
      mockRedis.flushdb.mockResolvedValue('OK')

      await clearCache()

      expect(mockRedis.flushdb).toHaveBeenCalled()
    })
  })

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      mockRedis.dbsize.mockResolvedValue(100)
      mockRedis.info.mockResolvedValue('used_memory_human:1.5M')

      const stats = await getCacheStats()

      expect(stats.keys).toBe(100)
      expect(stats.memory).toBe('1.5M')
    })

    it('should handle errors gracefully', async () => {
      mockRedis.dbsize.mockRejectedValue(new Error('Redis error'))

      const stats = await getCacheStats()

      expect(stats.keys).toBe(0)
      expect(stats.memory).toBe('0B')
    })
  })

  describe('Cache TTL constants', () => {
    it('should have correct TTL values', () => {
      expect(CACHE_TTL.STORE_SETTINGS).toBe(300)
      expect(CACHE_TTL.CATEGORIES).toBe(600)
      expect(CACHE_TTL.PRODUCTS).toBe(180)
      expect(CACHE_TTL.ORDERS).toBe(60)
      expect(CACHE_TTL.SESSION).toBe(3600)
      expect(CACHE_TTL.GOOGLE_MAPS).toBe(86400)
    })
  })
})
