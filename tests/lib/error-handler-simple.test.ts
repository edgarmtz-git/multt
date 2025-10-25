import { describe, it, expect, vi } from 'vitest'
import { AppError, Errors } from '@/lib/error-handler'

describe('Error Handler - Simple Tests', () => {
  describe('AppError', () => {
    it('should create error with default values', () => {
      const error = new AppError('Test error')
      
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('INTERNAL_ERROR')
    })

    it('should create error with custom values', () => {
      const error = new AppError('Test error', 400, 'BAD_REQUEST')
      
      expect(error.message).toBe('Test error')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('BAD_REQUEST')
    })
  })

  describe('Errors factory', () => {
    it('should create validation error', () => {
      const error = Errors.validation('Invalid data')
      
      expect(error.message).toBe('Invalid data')
      expect(error.statusCode).toBe(400)
      expect(error.code).toBe('VALIDATION_ERROR')
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

    it('should create notFound error', () => {
      const error = Errors.notFound('Resource not found')
      
      expect(error.message).toBe('Resource not found')
      expect(error.statusCode).toBe(404)
      expect(error.code).toBe('NOT_FOUND')
    })

    it('should create internal error', () => {
      const error = Errors.internal('Server error')
      
      expect(error.message).toBe('Server error')
      expect(error.statusCode).toBe(500)
      expect(error.code).toBe('INTERNAL_ERROR')
    })
  })
})
