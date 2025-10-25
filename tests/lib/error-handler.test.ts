import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  CustomError, 
  Errors, 
  handleError, 
  withErrorHandler 
} from '@/lib/error-handler'
import { NextResponse } from 'next/server'

// Mock logger
const mockLogger = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}

vi.mock('@/lib/logger', () => ({
  logger: mockLogger
}))

describe('Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CustomError', () => {
    it('should create error with default values', () => {
      const error = new CustomError('Test error')
      
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('INTERNAL_SERVER_ERROR')
      expect(error.details).toBeUndefined()
    })

    it('should create error with custom values', () => {
      const error = new CustomError('Test error', 400, 'BAD_REQUEST', { field: 'test' })
      
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('BAD_REQUEST')
      expect(error.details).toEqual({ field: 'test' })
    })
  })

  describe('Errors factory', () => {
    it('should create badRequest error', () => {
      const error = Errors.badRequest('Invalid data')
      
      expect(error.message).toBe('Invalid data')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('BAD_REQUEST')
    })

    it('should create unauthorized error', () => {
      const error = Errors.unauthorized('Access denied')
      
      expect(error.message).toBe('Access denied')
      expect(error.statusCode).toBe(401)
      expect(error.code).toBe('UNAUTHORIZED')
    })

    it('should create forbidden error', () => {
      const error = Errors.forbidden('Not allowed')
      
      expect(error.message).toBe('Not allowed')
      expect(error.statusCode).toBe(403)
      expect(error.code).toBe('FORBIDDEN')
    })

    it('should create notFound error', () => {
      const error = Errors.notFound('Resource not found')
      
      expect(error.message).toBe('Resource not found')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
    })

    it('should create validation error', () => {
      const error = Errors.validation('Invalid input')
      
      expect(error.message).toBe('Invalid input')
      expect(error.statusCode).toBe(422)
      expect(error.code).toBe('VALIDATION_ERROR')
    })

    it('should create internal error', () => {
      const error = Errors.internal('Server error')
      
      expect(error.message).toBe('Server error')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('INTERNAL_SERVER_ERROR')
    })

    it('should use default messages when not provided', () => {
      const badRequest = Errors.badRequest()
      const unauthorized = Errors.unauthorized()
      const forbidden = Errors.forbidden()
      const notFound = Errors.notFound()
      const validation = Errors.validation()
      const internal = Errors.internal()

      expect(badRequest.message).toBe('Bad Request')
      expect(unauthorized.message).toBe('Unauthorized')
      expect(forbidden.message).toBe('Forbidden')
      expect(notFound.message).toBe('Not Found')
      expect(validation.message).toBe('Validation Error')
      expect(internal.message).toBe('Internal Server Error')
    })
  })

  describe('handleError', () => {
    it('should handle CustomError correctly', () => {
      const error = new CustomError('Test error', 400, 'BAD_REQUEST', { field: 'test' })
      const response = handleError(error)

      expect(response).toBeInstanceOf(NextResponse)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'API Error [BAD_REQUEST]: Test error',
        {
          statusCode: 400,
          code: 'BAD_REQUEST',
          details: { field: 'test' },
          stack: undefined
        }
      )
    })

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error')
      const response = handleError(error)

      expect(response).toBeInstanceOf(NextResponse)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unhandled API Error:',
        { error, stack: error.stack }
      )
    })

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development'
      
      const error = new CustomError('Test error', 400, 'BAD_REQUEST')
      handleError(error)

      expect(mockLogger.error).toHaveBeenCalledWith(
        'API Error [BAD_REQUEST]: Test error',
        expect.objectContaining({
          stack: expect.any(String)
        })
      )
    })

    it('should not include stack trace in production', () => {
      process.env.NODE_ENV = 'production'
      
      const error = new CustomError('Test error', 400, 'BAD_REQUEST')
      handleError(error)

      expect(mockLogger.error).toHaveBeenCalledWith(
        'API Error [BAD_REQUEST]: Test error',
        expect.objectContaining({
          stack: undefined
        })
      )
    })
  })

  describe('withErrorHandler', () => {
    it('should wrap handler and catch errors', async () => {
      const handler = vi.fn().mockRejectedValue(new Error('Handler error'))
      const wrappedHandler = withErrorHandler(handler)

      const result = await wrappedHandler('arg1', 'arg2')

      expect(result).toBeInstanceOf(NextResponse)
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should return handler result when no error', async () => {
      const expectedResult = { success: true, data: 'test' }
      const handler = vi.fn().mockResolvedValue(expectedResult)
      const wrappedHandler = withErrorHandler(handler)

      const result = await wrappedHandler('arg1', 'arg2')

      expect(result).toBe(expectedResult)
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should handle CustomError in wrapped handler', async () => {
      const customError = new CustomError('Custom error', 400, 'BAD_REQUEST')
      const handler = vi.fn().mockRejectedValue(customError)
      const wrappedHandler = withErrorHandler(handler)

      const result = await wrappedHandler('arg1', 'arg2')

      expect(result).toBeInstanceOf(NextResponse)
      expect(mockLogger.error).toHaveBeenCalledWith(
        'API Error [BAD_REQUEST]: Custom error',
        expect.any(Object)
      )
    })
  })
})
