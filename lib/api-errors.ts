import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

/**
 * Códigos de error estandarizados del sistema
 */
export const ERROR_CODES = {
  // Errores de autenticación
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Errores de validación
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Errores de recursos
  NOT_FOUND: 'NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  
  // Errores de negocio
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // Errores de sistema
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  
  // Errores de configuración
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  MISSING_ENVIRONMENT_VARIABLE: 'MISSING_ENVIRONMENT_VARIABLE'
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

/**
 * Clase de error personalizada para APIs
 */
export class ApiError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: any
  public readonly requestId: string

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: any,
    requestId?: string
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.requestId = requestId || uuidv4()
  }
}

/**
 * Errores predefinidos comunes
 */
export const ApiErrors = {
  // Autenticación
  unauthorized: (message = 'No autorizado') => 
    new ApiError(ERROR_CODES.UNAUTHORIZED, message, 401),
  
  forbidden: (message = 'Acceso denegado') => 
    new ApiError(ERROR_CODES.FORBIDDEN, message, 403),
  
  invalidCredentials: (message = 'Credenciales inválidas') => 
    new ApiError(ERROR_CODES.INVALID_CREDENTIALS, message, 401),
  
  sessionExpired: (message = 'Sesión expirada') => 
    new ApiError(ERROR_CODES.SESSION_EXPIRED, message, 401),
  
  // Validación
  validationError: (message = 'Error de validación', details?: any) => 
    new ApiError(ERROR_CODES.VALIDATION_ERROR, message, 400, details),
  
  invalidInput: (message = 'Datos de entrada inválidos') => 
    new ApiError(ERROR_CODES.INVALID_INPUT, message, 400),
  
  missingRequiredField: (field: string) => 
    new ApiError(ERROR_CODES.MISSING_REQUIRED_FIELD, `Campo requerido: ${field}`, 400),
  
  // Recursos
  notFound: (resource = 'Recurso') => 
    new ApiError(ERROR_CODES.NOT_FOUND, `${resource} no encontrado`, 404),
  
  resourceConflict: (message = 'Conflicto de recurso') => 
    new ApiError(ERROR_CODES.RESOURCE_CONFLICT, message, 409),
  
  duplicateResource: (resource = 'Recurso') => 
    new ApiError(ERROR_CODES.DUPLICATE_RESOURCE, `${resource} ya existe`, 409),
  
  // Negocio
  insufficientPermissions: (action = 'realizar esta acción') => 
    new ApiError(ERROR_CODES.INSUFFICIENT_PERMISSIONS, `No tienes permisos para ${action}`, 403),
  
  businessRuleViolation: (message = 'Violación de regla de negocio') => 
    new ApiError(ERROR_CODES.BUSINESS_RULE_VIOLATION, message, 422),
  
  quotaExceeded: (message = 'Cuota excedida') => 
    new ApiError(ERROR_CODES.QUOTA_EXCEEDED, message, 429),
  
  // Sistema
  internalError: (message = 'Error interno del servidor') => 
    new ApiError(ERROR_CODES.INTERNAL_ERROR, message, 500),
  
  databaseError: (message = 'Error de base de datos') => 
    new ApiError(ERROR_CODES.DATABASE_ERROR, message, 500),
  
  externalServiceError: (service = 'servicio externo') => 
    new ApiError(ERROR_CODES.EXTERNAL_SERVICE_ERROR, `Error en ${service}`, 502),
  
  rateLimitExceeded: (message = 'Límite de solicitudes excedido') => 
    new ApiError(ERROR_CODES.RATE_LIMIT_EXCEEDED, message, 429),
  
  // Configuración
  configurationError: (message = 'Error de configuración') => 
    new ApiError(ERROR_CODES.CONFIGURATION_ERROR, message, 500),
  
  missingEnvironmentVariable: (variable: string) => 
    new ApiError(ERROR_CODES.MISSING_ENVIRONMENT_VARIABLE, `Variable de entorno requerida: ${variable}`, 500)
}

/**
 * Maneja errores de API y devuelve respuesta consistente
 */
export function handleApiError(error: unknown, requestId?: string): NextResponse {
  const errorId = requestId || uuidv4()
  
  // Si es un ApiError, devolver directamente
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          requestId: error.requestId,
          ...(process.env.NODE_ENV === 'development' && {
            details: error.details,
            stack: error.stack
          })
        }
      },
      { status: error.statusCode }
    )
  }
  
  // Si es un error de Prisma
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any
    
    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: {
              code: ERROR_CODES.DUPLICATE_RESOURCE,
              message: 'El recurso ya existe',
              requestId: errorId
            }
          },
          { status: 409 }
        )
      
      case 'P2025':
        return NextResponse.json(
          {
            error: {
              code: ERROR_CODES.NOT_FOUND,
              message: 'Recurso no encontrado',
              requestId: errorId
            }
          },
          { status: 404 }
        )
      
      default:
        return NextResponse.json(
          {
            error: {
              code: ERROR_CODES.DATABASE_ERROR,
              message: 'Error de base de datos',
              requestId: errorId
            }
          },
          { status: 500 }
        )
    }
  }
  
  // Error genérico
  console.error('Unhandled API error:', error)
  
  return NextResponse.json(
    {
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: 'Error interno del servidor',
        requestId: errorId,
        ...(process.env.NODE_ENV === 'development' && {
          details: error instanceof Error ? error.message : String(error)
        })
      }
    },
    { status: 500 }
  )
}

/**
 * Wrapper para manejar errores en API routes
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Valida que un usuario esté autenticado
 */
export function requireAuth(session: any): void {
  if (!session || !session.user || !session.user.id) {
    throw ApiErrors.unauthorized()
  }
}

/**
 * Valida que un usuario tenga un rol específico
 */
export function requireRole(session: any, allowedRoles: string[]): void {
  requireAuth(session)
  
  if (!allowedRoles.includes(session.user.role)) {
    throw ApiErrors.insufficientPermissions()
  }
}

/**
 * Valida que un usuario sea admin
 */
export function requireAdmin(session: any): void {
  requireRole(session, ['ADMIN'])
}

/**
 * Valida que un usuario sea admin o cliente
 */
export function requireAdminOrClient(session: any): void {
  requireRole(session, ['ADMIN', 'CLIENT'])
}
