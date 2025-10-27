import { prisma } from '@/lib/prisma'

export interface AuditLogEntry {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
}

// Tipos de acciones auditables
export const AUDIT_ACTIONS = {
  // Autenticación
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  
  // Usuarios
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  USER_SUSPEND: 'USER_SUSPEND',
  USER_ACTIVATE: 'USER_ACTIVATE',
  
  // Productos
  PRODUCT_CREATE: 'PRODUCT_CREATE',
  PRODUCT_UPDATE: 'PRODUCT_UPDATE',
  PRODUCT_DELETE: 'PRODUCT_DELETE',
  
  // Pedidos
  ORDER_CREATE: 'ORDER_CREATE',
  ORDER_UPDATE: 'ORDER_UPDATE',
  ORDER_CANCEL: 'ORDER_CANCEL',
  
  // Configuración
  SETTINGS_UPDATE: 'SETTINGS_UPDATE',
  
  // Archivos
  FILE_UPLOAD: 'FILE_UPLOAD',
  FILE_DELETE: 'FILE_DELETE',
  
  // Seguridad
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY'
} as const

// Recursos auditables
export const AUDIT_RESOURCES = {
  USER: 'USER',
  PRODUCT: 'PRODUCT',
  ORDER: 'ORDER',
  SETTINGS: 'SETTINGS',
  FILE: 'FILE',
  AUTH: 'AUTH',
  SYSTEM: 'SYSTEM'
} as const

class AuditLogger {
  private static instance: AuditLogger
  
  private constructor() {}
  
  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }
  
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      // En producción, también enviar a servicio externo de logging
      if (process.env.NODE_ENV === 'production') {
        // Aquí se podría integrar con servicios como:
        // - AWS CloudWatch
        // - Google Cloud Logging
        // - Datadog
        // - Sentry
        console.log('🔍 AUDIT LOG:', JSON.stringify(entry, null, 2))
      } else {
        console.log('🔍 AUDIT LOG:', JSON.stringify(entry, null, 2))
      }

      // ✅ Guardar en base de datos
      await prisma.auditLog.create({
        data: {
          userId: entry.userId,
          action: entry.action,
          resource: entry.resource,
          resourceId: entry.resourceId,
          details: entry.details ? JSON.stringify(entry.details) : null,
          ipAddress: entry.ipAddress,
          userAgent: entry.userAgent,
          success: entry.success,
          // errorMessage removed - entry.errorMessage
        }
      })

    } catch (error) {
      console.error('Error logging audit entry:', error)
      // No lanzar error para no afectar la operación principal
    }
  }
  
  // Métodos de conveniencia para acciones comunes
  async logLogin(userId: string, success: boolean, ipAddress?: string, userAgent?: string, errorMessage?: string): Promise<void> {
    await this.log({
      userId,
      action: success ? AUDIT_ACTIONS.LOGIN : AUDIT_ACTIONS.LOGIN_FAILED,
      resource: AUDIT_RESOURCES.AUTH,
      success,
      ipAddress,
      userAgent,
      errorMessage
    })
  }
  
  async logLogout(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      action: AUDIT_ACTIONS.LOGOUT,
      resource: AUDIT_RESOURCES.AUTH,
      success: true,
      ipAddress,
      userAgent
    })
  }
  
  async logUserAction(
    userId: string, 
    action: string, 
    resource: string, 
    resourceId?: string, 
    details?: Record<string, any>,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource,
      resourceId,
      details,
      success,
      errorMessage
    })
  }
  
  async logSecurityEvent(
    action: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      action,
      resource: AUDIT_RESOURCES.SYSTEM,
      details,
      success: false,
      ipAddress,
      userAgent
    })
  }
  
  async logOrderAction(
    userId: string,
    action: string,
    orderId: string,
    details?: Record<string, any>,
    success: boolean = true
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource: AUDIT_RESOURCES.ORDER,
      resourceId: orderId,
      details,
      success
    })
  }
  
  // Método para obtener logs (para dashboard de admin)
  async getLogs(filters: {
    userId?: string
    action?: string
    resource?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  } = {}): Promise<AuditLogEntry[]> {
    // En una implementación real, esto consultaría la base de datos
    // Por ahora retornamos array vacío
    return []
  }
  
  // Método para detectar actividad sospechosa
  async detectSuspiciousActivity(userId: string, ipAddress: string): Promise<boolean> {
    // Implementar lógica para detectar:
    // - Múltiples intentos de login fallidos
    // - Acceso desde IPs diferentes en poco tiempo
    // - Acciones no autorizadas
    // - Patrones de comportamiento anómalos
    
    return false // Por ahora siempre retorna false
  }
}

// Instancia singleton
export const auditLogger = AuditLogger.getInstance()

// Función helper para logging rápido
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  await auditLogger.log(entry)
}

// Middleware para logging automático de requests
export function createAuditMiddleware() {
  return async (req: any, res: any, next: any) => {
    const startTime = Date.now()
    
    // Interceptar response para logging
    const originalSend = res.send
    res.send = function(data: any) {
      const duration = Date.now() - startTime
      
      // Log de la request
      auditLogger.log({
        action: `${req.method} ${req.path}`,
        resource: 'API',
        details: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration,
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip || req.connection.remoteAddress
        },
        success: res.statusCode < 400,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      })
      
      return originalSend.call(this, data)
    }
    
    next()
  }
}
