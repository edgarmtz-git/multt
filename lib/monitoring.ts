import * as Sentry from '@sentry/nextjs'
import { logger } from './logger'

/**
 * Sistema de monitoreo y observabilidad
 * Integra Sentry con logging estructurado
 */

interface PerformanceMetric {
  name: string
  duration: number
  timestamp: Date
  metadata?: Record<string, any>
}

interface BusinessMetric {
  event: string
  userId?: string
  storeSlug?: string
  metadata?: Record<string, any>
}

interface ErrorContext {
  userId?: string
  storeSlug?: string
  action?: string
  metadata?: Record<string, any>
}

/**
 * Clase principal de monitoreo
 */
export class MonitoringService {
  private static instance: MonitoringService
  private performanceMetrics: PerformanceMetric[] = []
  private businessMetrics: BusinessMetric[] = []

  private constructor() {}

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService()
    }
    return MonitoringService.instance
  }

  /**
   * Captura errores con contexto
   */
  captureError(error: Error, context?: ErrorContext): void {
    // Log estructurado
    logger.error('Error captured', {
      error: error.message,
      stack: error.stack,
      ...context
    })

    // Sentry
    Sentry.withScope((scope) => {
      if (context?.userId) {
        scope.setUser({ id: context.userId })
      }
      
      if (context?.storeSlug) {
        scope.setTag('storeSlug', context.storeSlug)
      }
      
      if (context?.action) {
        scope.setTag('action', context.action)
      }
      
      if (context?.metadata) {
        scope.setContext('metadata', context.metadata)
      }
      
      Sentry.captureException(error)
    })
  }

  /**
   * Captura mensajes con contexto
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
    // Log estructurado - mapear 'warning' a 'warn'
    const logLevel = level === 'warning' ? 'warn' : level
    logger[logLevel](message, context)

    // Sentry
    Sentry.withScope((scope) => {
      if (context?.userId) {
        scope.setUser({ id: context.userId })
      }
      
      if (context?.storeSlug) {
        scope.setTag('storeSlug', context.storeSlug)
      }
      
      if (context?.action) {
        scope.setTag('action', context.action)
      }
      
      if (context?.metadata) {
        scope.setContext('metadata', context.metadata)
      }
      
      Sentry.captureMessage(message, level)
    })
  }

  /**
   * Registra métricas de rendimiento
   */
  recordPerformance(metric: PerformanceMetric): void {
    this.performanceMetrics.push(metric)
    
    // Log estructurado
    logger.performance(metric.name, metric.duration, metric.metadata)

    // Sentry breadcrumb
    Sentry.addBreadcrumb({
      message: `Performance: ${metric.name}`,
      category: 'performance',
      data: {
        duration: metric.duration,
        ...metric.metadata
      },
      level: 'info'
    })

    // Limpiar métricas antiguas (mantener solo las últimas 100)
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100)
    }
  }

  /**
   * Registra métricas de negocio
   */
  recordBusinessMetric(metric: BusinessMetric): void {
    this.businessMetrics.push(metric)
    
    // Log estructurado
    logger.businessLogic(metric.event, {
      userId: metric.userId,
      storeSlug: metric.storeSlug,
      ...metric.metadata
    })

    // Sentry breadcrumb
    Sentry.addBreadcrumb({
      message: `Business: ${metric.event}`,
      category: 'business',
      data: {
        userId: metric.userId,
        storeSlug: metric.storeSlug,
        ...metric.metadata
      },
      level: 'info'
    })

    // Limpiar métricas antiguas (mantener solo las últimas 100)
    if (this.businessMetrics.length > 100) {
      this.businessMetrics = this.businessMetrics.slice(-100)
    }
  }

  /**
   * Inicia una transacción de rendimiento
   */
  startTransaction(name: string, op: string = 'custom'): ReturnType<typeof Sentry.startInactiveSpan> {
    return Sentry.startInactiveSpan({
      name,
      op,
      attributes: {
        environment: process.env.NODE_ENV
      }
    })
  }

  /**
   * Configura el contexto del usuario
   */
  setUserContext(user: { id: string; email?: string; name?: string }): void {
    Sentry.setUser(user)
  }

  /**
   * Configura el contexto de la tienda
   */
  setStoreContext(storeSlug: string, storeName?: string): void {
    Sentry.setTag('storeSlug', storeSlug)
    if (storeName) {
      Sentry.setTag('storeName', storeName)
    }
  }

  /**
   * Obtiene métricas de rendimiento
   */
  getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics]
  }

  /**
   * Obtiene métricas de negocio
   */
  getBusinessMetrics(): BusinessMetric[] {
    return [...this.businessMetrics]
  }

  /**
   * Limpia todas las métricas
   */
  clearMetrics(): void {
    this.performanceMetrics = []
    this.businessMetrics = []
  }
}

// Instancia singleton
export const monitoring = MonitoringService.getInstance()

/**
 * Funciones de conveniencia
 */

export function captureError(error: Error, context?: ErrorContext): void {
  monitoring.captureError(error, context)
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): void {
  monitoring.captureMessage(message, level, context)
}

export function recordPerformance(name: string, duration: number, metadata?: Record<string, any>): void {
  monitoring.recordPerformance({
    name,
    duration,
    timestamp: new Date(),
    metadata
  })
}

export function recordBusinessMetric(event: string, userId?: string, storeSlug?: string, metadata?: Record<string, any>): void {
  monitoring.recordBusinessMetric({
    event,
    userId,
    storeSlug,
    metadata
  })
}

export function startTransaction(name: string, op?: string): ReturnType<typeof Sentry.startInactiveSpan> {
  return monitoring.startTransaction(name, op)
}

export function setUserContext(user: { id: string; email?: string; name?: string }): void {
  monitoring.setUserContext(user)
}

export function setStoreContext(storeSlug: string, storeName?: string): void {
  monitoring.setStoreContext(storeSlug, storeName)
}

/**
 * HOC para monitoreo de componentes
 * Nota: Este HOC requiere React y debe ser usado en componentes
 */
export function withMonitoring<T extends Record<string, any>>(
  Component: any, // React.ComponentType<T>
  componentName: string
): any { // React.ComponentType<T>
  return function MonitoredComponent(props: T) {
    const transaction = startTransaction(`component.${componentName}`)
    
    try {
      // En un entorno real, esto sería JSX
      // return <Component {...props} />
      return Component(props)
    } catch (error) {
      captureError(error as Error, {
        action: `component.${componentName}`,
        metadata: { props }
      })
      throw error
    } finally {
      transaction.end()
    }
  }
}

/**
 * Decorator para monitoreo de métodos
 */
export function monitorMethod(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value

  descriptor.value = async function (...args: any[]) {
    const transaction = startTransaction(`method.${propertyName}`)
    
    try {
      const result = await method.apply(this, args)
      return result
    } catch (error) {
      captureError(error as Error, {
        action: `method.${propertyName}`,
        metadata: { args }
      })
      throw error
    } finally {
      transaction.end()
    }
  }
}

/**
 * Middleware para monitoreo de API routes
 */
export function withApiMonitoring(handler: Function) {
  return async (req: any, res: any) => {
    const transaction = startTransaction(`api.${req.url}`, 'http.server')
    
    try {
      const result = await handler(req, res)
      return result
    } catch (error) {
      captureError(error as Error, {
        action: `api.${req.url}`,
        metadata: {
          method: req.method,
          url: req.url,
          headers: req.headers
        }
      })
      throw error
    } finally {
      transaction.end()
    }
  }
}
