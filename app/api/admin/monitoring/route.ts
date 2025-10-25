import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { monitoring } from '@/lib/monitoring'
import { handleError, Errors } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    // Obtener métricas de rendimiento
    const performanceMetrics = monitoring.getPerformanceMetrics()
    const businessMetrics = monitoring.getBusinessMetrics()
    
    // Calcular métricas de rendimiento
    const averageResponseTime = performanceMetrics.length > 0 
      ? performanceMetrics.reduce((sum, metric) => sum + metric.duration, 0) / performanceMetrics.length
      : 0
    
    const totalRequests = performanceMetrics.length
    const errorRate = 0 // TODO: Implementar cálculo de tasa de error
    
    // Obtener métricas de negocio de la base de datos
    const [totalUsers, activeStores, totalOrders, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.storeSettings.count({ where: { storeActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true }
      })
    ])
    
    // Obtener errores recientes (simulado - en producción vendría de Sentry)
    const recentErrors = [
      {
        id: '1',
        message: 'Error de conexión a la base de datos',
        level: 'critical',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        user: 'user-123',
        store: 'tienda-ejemplo'
      },
      {
        id: '2',
        message: 'Timeout en API de pagos',
        level: 'warning',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        user: 'user-456',
        store: 'restaurante-mexicano'
      },
      {
        id: '3',
        message: 'Imagen no encontrada',
        level: 'info',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        user: 'user-789',
        store: 'cafe-buenos-aires'
      }
    ]
    
    // Calcular estadísticas de errores
    const errorStats = {
      critical: recentErrors.filter(e => e.level === 'critical').length,
      warning: recentErrors.filter(e => e.level === 'warning').length,
      info: recentErrors.filter(e => e.level === 'info').length
    }
    
    // Formatear métricas de rendimiento
    const formattedPerformanceMetrics = performanceMetrics.slice(-20).map(metric => ({
      name: metric.name,
      duration: metric.duration,
      timestamp: metric.timestamp.toISOString()
    }))
    
    // Formatear métricas de negocio
    const formattedBusinessMetrics = businessMetrics.slice(-20).map(metric => ({
      event: metric.event,
      userId: metric.userId,
      storeSlug: metric.storeSlug,
      timestamp: new Date().toISOString()
    }))
    
    const monitoringData = {
      performance: {
        averageResponseTime,
        totalRequests,
        errorRate,
        uptime: 99.9 // TODO: Implementar cálculo real de uptime
      },
      business: {
        totalUsers,
        activeStores,
        totalOrders,
        revenue: totalRevenue._sum.total || 0
      },
      errors: {
        ...errorStats,
        recent: recentErrors
      },
      metrics: {
        performance: formattedPerformanceMetrics,
        business: formattedBusinessMetrics
      }
    }
    
    return NextResponse.json(monitoringData)
    
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body
    
    switch (action) {
      case 'clear_metrics':
        monitoring.clearMetrics()
        return NextResponse.json({ success: true, message: 'Métricas limpiadas' })
        
      case 'export_data':
        const performanceMetrics = monitoring.getPerformanceMetrics()
        const businessMetrics = monitoring.getBusinessMetrics()
        
        return NextResponse.json({
          success: true,
          data: {
            performance: performanceMetrics,
            business: businessMetrics,
            timestamp: new Date().toISOString()
          }
        })
        
      case 'test_error':
        // Simular un error para testing
        const testError = new Error('Error de prueba para monitoreo')
        monitoring.captureError(testError, {
          action: 'test_error',
          metadata: { test: true }
        })
        return NextResponse.json({ success: true, message: 'Error de prueba enviado' })
        
      default:
        throw Errors.invalidInput('Acción no válida')
    }
    
  } catch (error) {
    return handleError(error)
  }
}
