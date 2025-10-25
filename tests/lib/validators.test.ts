import { describe, it, expect } from 'vitest'
import { validators, validateSlug, validateEmail } from '@/lib/validators'

describe('Validators', () => {
  describe('Email validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'test123@test-domain.com'
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
        'test..test@example.com',
        '',
        'test@.com'
      ]

      invalidEmails.forEach(email => {
        const result = validators.email.safeParse(email)
        expect(result.success).toBe(false)
      })
    })

    it('should transform email to lowercase and trim', () => {
      const result = validators.email.safeParse('  TEST@EXAMPLE.COM  ')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('test@example.com')
      }
    })
  })

  describe('Password validation', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'Password123!',
        'MyStr0ng#Pass',
        'Test123@Pass',
        'SecureP@ss1'
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
        '', // Empty
        'a'.repeat(129) // Too long
      ]

      weakPasswords.forEach(password => {
        const result = validators.password.safeParse(password)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Name validation', () => {
    it('should validate correct names', () => {
      const validNames = [
        'John Doe',
        'María José',
        'José María',
        'Jean-Pierre',
        'O\'Connor',
        '李小明'
      ]

      validNames.forEach(name => {
        const result = validators.name.safeParse(name)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid names', () => {
      const invalidNames = [
        'John123', // Contains numbers
        'John@Doe', // Contains special chars
        'J', // Too short
        'a'.repeat(101), // Too long
        '', // Empty
        'John   Doe' // Multiple spaces
      ]

      invalidNames.forEach(name => {
        const result = validators.name.safeParse(name)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Slug validation', () => {
    it('should validate correct slugs', () => {
      const validSlugs = [
        'my-store',
        'tienda-123',
        'restaurant-name',
        'cafe-buenos-aires'
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
        'my.store', // Dots
        'my-store-', // Trailing dash
        '-my-store', // Leading dash
        'a', // Too short
        'a'.repeat(51), // Too long
        '' // Empty
      ]

      invalidSlugs.forEach(slug => {
        const result = validators.slug.safeParse(slug)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('WhatsApp validation', () => {
    it('should validate correct WhatsApp numbers', () => {
      const validNumbers = [
        '1234567890',
        '+1234567890',
        '(123) 456-7890',
        '123-456-7890',
        '+1 (123) 456-7890'
      ]

      validNumbers.forEach(number => {
        const result = validators.whatsapp.safeParse(number)
        expect(result.success).toBe(true)
      })
    })

    it('should transform WhatsApp numbers correctly', () => {
      const result = validators.whatsapp.safeParse('(123) 456-7890')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('1234567890')
      }
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

    it('should reject invalid prices', () => {
      const invalidPrices = [-1, 1000000, 10.123, NaN, Infinity]

      invalidPrices.forEach(price => {
        const result = validators.price.safeParse(price)
        expect(result.success).toBe(false)
      })
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
      const invalidQuantities = [0, -1, 101, 1.5, NaN]

      invalidQuantities.forEach(quantity => {
        const result = validators.quantity.safeParse(quantity)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Helper functions', () => {
    describe('validateSlug', () => {
      it('should return valid for correct slugs', () => {
        const result = validateSlug('my-store')
        expect(result.isValid).toBe(true)
        expect(result.message).toBeUndefined()
      })

      it('should return invalid for incorrect slugs', () => {
        const result = validateSlug('My Store')
        expect(result.isValid).toBe(false)
        expect(result.message).toBeDefined()
      })
    })

    describe('validateEmail', () => {
      it('should return valid for correct emails', () => {
        const result = validateEmail('test@example.com')
        expect(result.isValid).toBe(true)
        expect(result.message).toBeUndefined()
      })

      it('should return invalid for incorrect emails', () => {
        const result = validateEmail('invalid-email')
        expect(result.isValid).toBe(false)
        expect(result.message).toBeDefined()
      })
    })
  })
})
