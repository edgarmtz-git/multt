import { NextResponse } from 'next/server'

/**
 * Sistema simplificado de manejo de errores
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

/**
 * Errores comunes predefinidos
 */
export const Errors = {
  // Autenticación
  unauthorized: (message = 'No autorizado') => new AppError(message, 401, 'UNAUTHORIZED'),
  forbidden: (message = 'Acceso denegado') => new AppError(message, 403, 'FORBIDDEN'),
  
  // Validación
  validation: (message = 'Error de validación') => new AppError(message, 400, 'VALIDATION_ERROR'),
  invalidInput: (message = 'Datos inválidos') => new AppError(message, 400, 'INVALID_INPUT'),
  
  // Recursos
  notFound: (message = 'Recurso no encontrado') => new AppError(message, 404, 'NOT_FOUND'),
  conflict: (message = 'Conflicto de recurso') => new AppError(message, 409, 'CONFLICT'),
  
  // Sistema
  internal: (message = 'Error interno del servidor') => new AppError(message, 500, 'INTERNAL_ERROR'),
  database: (message = 'Error de base de datos') => new AppError(message, 500, 'DATABASE_ERROR')
}

/**
 * Maneja errores y devuelve respuesta consistente
 */
export function handleError(error: unknown): NextResponse {
  // Si es un AppError, devolver directamente
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message
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
          { error: { code: 'CONFLICT', message: 'El recurso ya existe' } },
          { status: 409 }
        )
      case 'P2025':
        return NextResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Recurso no encontrado' } },
          { status: 404 }
        )
      default:
        return NextResponse.json(
          { error: { code: 'DATABASE_ERROR', message: 'Error de base de datos' } },
          { status: 500 }
        )
    }
  }
  
  // Error genérico
  console.error('Unhandled error:', error)
  
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      }
    },
    { status: 500 }
  )
}

/**
 * Wrapper para API routes con manejo de errores
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleError(error)
    }
  }
}
