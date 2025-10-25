/**
 * Sistema de logging estructurado
 * Reemplaza console.log con logging estructurado
 */

interface LogContext {
  userId?: string
  requestId?: string
  action?: string
  resource?: string
  [key: string]: any
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logLevel = process.env.LOG_LEVEL || 'info'

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const messageLevelIndex = levels.indexOf(level)
    return messageLevelIndex >= currentLevelIndex
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, context))
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message, context))
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context))
    }
  }

  error(message: string, context?: LogContext, error?: Error): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        ...(error && {
          errorMessage: error.message,
          errorStack: this.isDevelopment ? error.stack : undefined
        })
      }
      console.error(this.formatMessage('error', message, errorContext))
    }
  }

  // Métodos específicos para diferentes tipos de logs
  apiRequest(method: string, url: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${url}`, {
      ...context,
      type: 'api_request'
    })
  }

  apiResponse(method: string, url: string, statusCode: number, context?: LogContext): void {
    const level = statusCode >= 400 ? 'error' : 'info'
    this[level](`API Response: ${method} ${url} - ${statusCode}`, {
      ...context,
      type: 'api_response',
      statusCode
    })
  }

  userAction(action: string, userId: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, {
      ...context,
      userId,
      type: 'user_action'
    })
  }

  databaseQuery(operation: string, table: string, context?: LogContext): void {
    this.debug(`Database ${operation}: ${table}`, {
      ...context,
      type: 'database_query'
    })
  }

  businessLogic(operation: string, context?: LogContext): void {
    this.info(`Business Logic: ${operation}`, {
      ...context,
      type: 'business_logic'
    })
  }

  security(event: string, context?: LogContext): void {
    this.warn(`Security Event: ${event}`, {
      ...context,
      type: 'security'
    })
  }

  performance(operation: string, duration: number, context?: LogContext): void {
    this.info(`Performance: ${operation} took ${duration}ms`, {
      ...context,
      type: 'performance',
      duration
    })
  }
}

// Exportar instancia singleton
export const logger = new Logger()

// Exportar tipos para uso en otros archivos
export type { LogContext }
