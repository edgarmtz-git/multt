import { describe, it, expect } from 'vitest'
import { validators } from '@/lib/validators'

describe('Validators - Simple Tests', () => {
  describe('Email validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ]

      validEmails.forEach(email => {
        const result = validators.email.safeParse(email)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        ''
      ]

      invalidEmails.forEach(email => {
        const result = validators.email.safeParse(email)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Password validation', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'Password123!',
        'MyStr0ng#Pass',
        'Test123@Pass'
      ]

      strongPasswords.forEach(password => {
        const result = validators.password.safeParse(password)
        expect(result.success).toBe(true)
      })
    })

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'password', // No uppercase, numbers, or special chars
        'PASSWORD', // No lowercase, numbers, or special chars
        'Password', // No numbers or special chars
        '12345678', // No letters or special chars
        'Pass123', // No special chars
        'Pass!', // Too short
        '' // Empty
      ]

      weakPasswords.forEach(password => {
        const result = validators.password.safeParse(password)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Slug validation', () => {
    it('should validate correct slugs', () => {
      const validSlugs = [
        'my-store',
        'tienda-123',
        'restaurant-name'
      ]

      validSlugs.forEach(slug => {
        const result = validators.slug.safeParse(slug)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid slugs', () => {
      const invalidSlugs = [
        'My-Store', // Uppercase
        'my store', // Spaces
        'my@store', // Special chars
        'my_store', // Underscores
        'a', // Too short
        '' // Empty
      ]

      invalidSlugs.forEach(slug => {
        const result = validators.slug.safeParse(slug)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Price validation', () => {
    it('should validate correct prices', () => {
      const validPrices = [0, 10.50, 999.99, 1000, 0.01]

      validPrices.forEach(price => {
        const result = validators.price.safeParse(price)
        expect(result.success).toBe(true)
      })
    })

    it('should reject negative prices', () => {
      const result = validators.price.safeParse(-1)
      expect(result.success).toBe(false)
    })
  })

  describe('Quantity validation', () => {
    it('should validate correct quantities', () => {
      const validQuantities = [1, 10, 50, 100]

      validQuantities.forEach(quantity => {
        const result = validators.quantity.safeParse(quantity)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid quantities', () => {
      const invalidQuantities = [0, -1, 1000]

      invalidQuantities.forEach(quantity => {
        const result = validators.quantity.safeParse(quantity)
        expect(result.success).toBe(false)
      })
    })
  })
})
