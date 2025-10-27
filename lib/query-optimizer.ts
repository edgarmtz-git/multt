import { Prisma } from '@prisma/client'
import { prisma } from './prisma'

/**
 * Sistema de optimización de consultas
 * Implementa select específicos, includes optimizados y paginación
 */

// Tipos para consultas optimizadas
export interface OptimizedProductQuery {
  id: string
  name: string
  price: number
  imageUrl?: string
  isActive: boolean
  category?: {
    id: string
    name: string
  }
}

export interface OptimizedOrderQuery {
  id: string
  orderNumber: string
  status: string
  total: number
  customerName: string
  createdAt: Date
  items: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
    }
  }[]
}

export interface OptimizedCategoryQuery {
  id: string
  name: string
  order: number
  isActive: boolean
  _count: {
    categoryProducts: number
  }
}

/**
 * Obtiene productos optimizados con select específico
 */
export async function getOptimizedProducts(
  userId: string,
  options: {
    isActive?: boolean
    categoryId?: string
    limit?: number
    offset?: number
    search?: string
  } = {}
) {
  const {
    isActive = true,
    categoryId,
    limit = 50,
    offset = 0,
    search
  } = options

  const where: Prisma.ProductWhereInput = {
    userId,
    isActive
  }

  if (categoryId) {
    where.categoryProducts = {
      some: {
        categoryId
      }
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } }
    ]
  }

  return prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      price: true,
      imageUrl: true,
      isActive: true,
      categoryProducts: {
        select: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        },
        take: 1
      }
    },
    take: limit,
    skip: offset,
    orderBy: [
      { isActive: 'desc' },
      { createdAt: 'desc' }
    ]
  })
}

/**
 * Obtiene categorías optimizadas con conteo de productos
 */
export async function getOptimizedCategories(
  userId: string,
  options: {
    isActive?: boolean
    limit?: number
    offset?: number
  } = {}
) {
  const {
    isActive = true,
    limit = 50,
    offset = 0
  } = options

  return prisma.category.findMany({
    where: {
      userId,
      isActive
    },
    select: {
      id: true,
      name: true,
      order: true,
      isActive: true,
      _count: {
        select: {
          categoryProducts: true
        }
      }
    },
    take: limit,
    skip: offset,
    orderBy: [
      { order: 'asc' },
      { name: 'asc' }
    ]
  })
}

/**
 * Obtiene órdenes optimizadas con información básica
 */
export async function getOptimizedOrders(
  userId: string,
  options: {
    status?: string
    limit?: number
    offset?: number
    dateFrom?: Date
    dateTo?: Date
  } = {}
) {
  const {
    status,
    limit = 50,
    offset = 0,
    dateFrom,
    dateTo
  } = options

  const where: Prisma.OrderWhereInput = {
    userId
  }

  if (status) {
    where.status = status as any
  }

  if (dateFrom || dateTo) {
    where.createdAt = {}
    if (dateFrom) where.createdAt.gte = dateFrom
    if (dateTo) where.createdAt.lte = dateTo
  }

  return prisma.order.findMany({
    where,
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      customerName: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: {
            select: {
              name: true
            }
          }
        }
      }
    },
    take: limit,
    skip: offset,
    orderBy: {
      createdAt: 'desc'
    }
  })
}

/**
 * Obtiene configuración de tienda optimizada
 */
export async function getOptimizedStoreSettings(storeSlug: string) {
  return prisma.storeSettings.findUnique({
    where: { storeSlug },
    select: {
      id: true,
      storeName: true,
      storeSlug: true,
      country: true,
      language: true,
      currency: true,
      distanceUnit: true,
      mapProvider: true,
      googleMapsApiKey: true,
      taxRate: true,
      taxMethod: true,
      enableBusinessHours: true,
      disableCheckoutOutsideHours: true,
      deliveryEnabled: true,
      useBasePrice: true,
      baseDeliveryPrice: true,
      baseDeliveryThreshold: true,
      paymentsEnabled: true,
      storeActive: true,
      passwordProtected: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })
}

/**
 * Obtiene productos de una tienda pública optimizada
 */
export async function getOptimizedPublicProducts(
  storeSlug: string,
  options: {
    categoryId?: string
    limit?: number
    offset?: number
    search?: string
  } = {}
) {
  const {
    categoryId,
    limit = 50,
    offset = 0,
    search
  } = options

  // Primero obtener la tienda
  const store = await prisma.storeSettings.findUnique({
    where: { storeSlug },
    select: { userId: true, storeActive: true }
  })

  if (!store || !store.storeActive) {
    throw new Error('Tienda no encontrada o inactiva')
  }

  const where: Prisma.ProductWhereInput = {
    userId: store.userId,
    isActive: true
  }

  if (categoryId) {
    where.categoryProducts = {
      some: {
        categoryId
      }
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } }
    ]
  }

  return prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      imageUrl: true,
      hasVariants: true,
      variants: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          value: true,
          price: true,
          imageUrl: true
        }
      },
      options: {
        select: {
          id: true,
          name: true,
          required: true,
          type: true,
          choices: {
            select: {
              id: true,
              name: true,
              price: true,
              order: true
            }
          }
        }
      }
    },
    take: limit,
    skip: offset,
    orderBy: [
      { isActive: 'desc' },
      { createdAt: 'desc' }
    ]
  })
}

/**
 * Obtiene categorías de una tienda pública optimizada
 */
export async function getOptimizedPublicCategories(storeSlug: string) {
  // Primero obtener la tienda
  const store = await prisma.storeSettings.findUnique({
    where: { storeSlug },
    select: { userId: true, storeActive: true }
  })

  if (!store || !store.storeActive) {
    throw new Error('Tienda no encontrada o inactiva')
  }

  return prisma.category.findMany({
    where: {
      userId: store.userId,
      isActive: true,
      isVisibleInStore: true
    },
    select: {
      id: true,
      name: true,
      description: true,
      color: true,
      icon: true,
      imageUrl: true,
      order: true,
      _count: {
        select: {
          categoryProducts: {
            where: {
              product: {
                isActive: true
              }
            }
          }
        }
      }
    },
    orderBy: [
      { order: 'asc' },
      { name: 'asc' }
    ]
  })
}

/**
 * Obtiene estadísticas optimizadas del dashboard
 */
export async function getOptimizedDashboardStats(userId: string) {
  const [
    totalOrders,
    totalRevenue,
    totalProducts,
    totalCategories,
    recentOrders
  ] = await Promise.all([
    prisma.order.count({
      where: { userId }
    }),
    prisma.order.aggregate({
      where: { userId },
      _sum: { total: true }
    }),
    prisma.product.count({
      where: { userId, isActive: true }
    }),
    prisma.category.count({
      where: { userId, isActive: true }
    }),
    prisma.order.findMany({
      where: { userId },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
  ])

  return {
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    totalProducts,
    totalCategories,
    recentOrders
  }
}

/**
 * Obtiene productos con paginación optimizada
 */
export async function getPaginatedProducts(
  userId: string,
  page: number = 1,
  limit: number = 20,
  filters: {
    isActive?: boolean
    categoryId?: string
    search?: string
  } = {}
) {
  const offset = (page - 1) * limit
  
  const [products, total] = await Promise.all([
    getOptimizedProducts(userId, {
      ...filters,
      limit,
      offset
    }),
    prisma.product.count({
      where: {
        userId,
        ...(filters.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters.categoryId && {
          categoryProducts: {
            some: { categoryId: filters.categoryId }
          }
        }),
        ...(filters.search && {
          OR: [
            { name: { contains: filters.search } },
            { description: { contains: filters.search } }
          ]
        })
      }
    })
  ])

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  }
}

/**
 * Obtiene órdenes con paginación optimizada
 */
export async function getPaginatedOrders(
  userId: string,
  page: number = 1,
  limit: number = 20,
  filters: {
    status?: string
    dateFrom?: Date
    dateTo?: Date
  } = {}
) {
  const offset = (page - 1) * limit
  
  const where: Prisma.OrderWhereInput = {
    userId,
    ...(filters.status && { status: filters.status as any }),
    ...(filters.dateFrom || filters.dateTo) && {
      createdAt: {
        ...(filters.dateFrom && { gte: filters.dateFrom }),
        ...(filters.dateTo && { lte: filters.dateTo })
      }
    }
  }

  const [orders, total] = await Promise.all([
    getOptimizedOrders(userId, {
      ...filters,
      limit,
      offset
    }),
    prisma.order.count({ where })
  ])

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  }
}
