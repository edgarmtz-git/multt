import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/orders/route'

// Mock dependencies
const mockPrisma = {
  storeSettings: {
    findUnique: vi.fn()
  },
  order: {
    create: vi.fn()
  },
  product: {
    findUnique: vi.fn(),
    update: vi.fn()
  },
  $transaction: vi.fn()
}

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}))

const mockLogger = {
  apiRequest: vi.fn(),
  warn: vi.fn(),
  businessLogic: vi.fn(),
  performance: vi.fn(),
  apiResponse: vi.fn()
}

vi.mock('@/lib/logger', () => ({
  logger: mockLogger
}))

const mockOrderSchema = {
  safeParse: vi.fn()
}

vi.mock('@/lib/validation', () => ({
  orderSchema: mockOrderSchema
}))

describe('/api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST', () => {
    it('should create order successfully', async () => {
      const mockOrderData = {
        customerName: 'John Doe',
        customerWhatsApp: '1234567890',
        customerEmail: 'john@example.com',
        deliveryMethod: 'delivery',
        paymentMethod: 'cash',
        address: {
          street: 'Main St',
          number: '123',
          neighborhood: 'Downtown'
        },
        items: [
          {
            id: 'product-1',
            name: 'Pizza',
            price: 15.99,
            quantity: 2,
            variantName: 'Large',
            variantId: 'variant-1'
          }
        ],
        subtotal: 31.98,
        deliveryFee: 5.00,
        total: 36.98,
        storeSlug: 'test-store'
      }

      const mockStore = {
        id: 'store-1',
        storeName: 'Test Store',
        storeActive: true,
        userId: 'user-1',
        user: { id: 'user-1', name: 'Store Owner' }
      }

      const mockCreatedOrder = {
        id: 'order-1',
        orderNumber: 'ORD-001',
        status: 'PENDING',
        total: 36.98,
        items: [
          {
            id: 'item-1',
            quantity: 2,
            price: 15.99,
            productId: 'product-1',
            variantId: 'variant-1',
            variantName: 'Large'
          }
        ]
      }

      mockOrderSchema.safeParse.mockReturnValue({
        success: true,
        data: mockOrderData
      })

      mockPrisma.storeSettings.findUnique.mockResolvedValue(mockStore)
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          order: {
            create: vi.fn().mockResolvedValue(mockCreatedOrder)
          },
          product: {
            findUnique: vi.fn().mockResolvedValue({ trackQuantity: false }),
            update: vi.fn()
          }
        })
      })

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(mockOrderData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.message).toBe('Pedido creado exitosamente')
      expect(responseData.order).toBeDefined()
      expect(mockLogger.apiRequest).toHaveBeenCalled()
      expect(mockLogger.businessLogic).toHaveBeenCalled()
      expect(mockLogger.performance).toHaveBeenCalled()
      expect(mockLogger.apiResponse).toHaveBeenCalled()
    })

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        customerName: '', // Invalid: empty name
        storeSlug: 'test-store'
      }

      mockOrderSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          issues: [{ message: 'Customer name is required' }]
        }
      })

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(422)
      expect(responseData.error).toBe('VALIDATION_ERROR')
      expect(responseData.message).toBe('Datos de pedido inválidos')
      expect(mockLogger.warn).toHaveBeenCalled()
    })

    it('should return 404 when store not found', async () => {
      const mockOrderData = {
        customerName: 'John Doe',
        customerWhatsApp: '1234567890',
        deliveryMethod: 'delivery',
        paymentMethod: 'cash',
        items: [{ id: 'product-1', name: 'Pizza', price: 15.99, quantity: 1 }],
        subtotal: 15.99,
        deliveryFee: 5.00,
        total: 20.99,
        storeSlug: 'non-existent-store'
      }

      mockOrderSchema.safeParse.mockReturnValue({
        success: true,
        data: mockOrderData
      })

      mockPrisma.storeSettings.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(mockOrderData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.error).toBe('NOT_FOUND')
      expect(responseData.message).toBe('Tienda no encontrada')
      expect(mockLogger.warn).toHaveBeenCalled()
    })

    it('should return 403 when store is inactive', async () => {
      const mockOrderData = {
        customerName: 'John Doe',
        customerWhatsApp: '1234567890',
        deliveryMethod: 'delivery',
        paymentMethod: 'cash',
        items: [{ id: 'product-1', name: 'Pizza', price: 15.99, quantity: 1 }],
        subtotal: 15.99,
        deliveryFee: 5.00,
        total: 20.99,
        storeSlug: 'inactive-store'
      }

      const mockStore = {
        id: 'store-1',
        storeName: 'Inactive Store',
        storeActive: false,
        userId: 'user-1',
        user: { id: 'user-1', name: 'Store Owner' }
      }

      mockOrderSchema.safeParse.mockReturnValue({
        success: true,
        data: mockOrderData
      })

      mockPrisma.storeSettings.findUnique.mockResolvedValue(mockStore)

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(mockOrderData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(403)
      expect(responseData.error).toBe('FORBIDDEN')
      expect(responseData.message).toBe('Tienda no disponible en este momento')
      expect(mockLogger.warn).toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      const mockOrderData = {
        customerName: 'John Doe',
        customerWhatsApp: '1234567890',
        deliveryMethod: 'delivery',
        paymentMethod: 'cash',
        items: [{ id: 'product-1', name: 'Pizza', price: 15.99, quantity: 1 }],
        subtotal: 15.99,
        deliveryFee: 5.00,
        total: 20.99,
        storeSlug: 'test-store'
      }

      const mockStore = {
        id: 'store-1',
        storeName: 'Test Store',
        storeActive: true,
        userId: 'user-1',
        user: { id: 'user-1', name: 'Store Owner' }
      }

      mockOrderSchema.safeParse.mockReturnValue({
        success: true,
        data: mockOrderData
      })

      mockPrisma.storeSettings.findUnique.mockResolvedValue(mockStore)
      mockPrisma.$transaction.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify(mockOrderData),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.error).toBe('INTERNAL_SERVER_ERROR')
      expect(responseData.message).toBe('An unexpected error occurred.')
    })
  })
})
