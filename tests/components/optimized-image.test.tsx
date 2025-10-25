import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { OptimizedImage, ProductImage, BannerImage, AvatarImage } from '@/components/ui/optimized-image'

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  )
}))

describe('OptimizedImage Components', () => {
  describe('OptimizedImage', () => {
    it('should render image with correct props', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          width={300}
          height={200}
        />
      )

      const image = screen.getByAltText('Test image')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
    })

    it('should show loading state initially', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          width={300}
          height={200}
        />
      )

      // Should show loading spinner initially
      expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('should handle error state', async () => {
      // Mock image load error
      const originalImage = window.Image
      window.Image = vi.fn().mockImplementation(() => {
        const img = new originalImage()
        setTimeout(() => {
          Object.defineProperty(img, 'complete', { value: false })
          Object.defineProperty(img, 'naturalWidth', { value: 0 })
          Object.defineProperty(img, 'naturalHeight', { value: 0 })
          img.onerror?.(new Event('error'))
        }, 0)
        return img
      })

      render(
        <OptimizedImage
          src="https://example.com/invalid-image.jpg"
          alt="Test image"
          width={300}
          height={200}
        />
      )

      await waitFor(() => {
        expect(screen.getByText('Imagen no disponible')).toBeInTheDocument()
      })

      // Restore original Image
      window.Image = originalImage
    })

    it('should apply custom className', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          width={300}
          height={200}
          className="custom-class"
        />
      )

      const container = screen.getByAltText('Test image').parentElement
      expect(container).toHaveClass('custom-class')
    })

    it('should handle priority loading', () => {
      render(
        <OptimizedImage
          src="https://example.com/image.jpg"
          alt="Test image"
          width={300}
          height={200}
          priority={true}
        />
      )

      const image = screen.getByAltText('Test image')
      expect(image).toBeInTheDocument()
    })
  })

  describe('ProductImage', () => {
    it('should render with product-specific props', () => {
      render(
        <ProductImage
          src="https://example.com/product.jpg"
          alt="Test product"
        />
      )

      const image = screen.getByAltText('Test product')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/product.jpg')
    })

    it('should apply product-specific className', () => {
      render(
        <ProductImage
          src="https://example.com/product.jpg"
          alt="Test product"
          className="product-class"
        />
      )

      const container = screen.getByAltText('Test product').parentElement
      expect(container).toHaveClass('product-class', 'rounded-lg')
    })

    it('should handle priority loading for products', () => {
      render(
        <ProductImage
          src="https://example.com/product.jpg"
          alt="Test product"
          priority={true}
        />
      )

      const image = screen.getByAltText('Test product')
      expect(image).toBeInTheDocument()
    })
  })

  describe('BannerImage', () => {
    it('should render with banner-specific props', () => {
      render(
        <BannerImage
          src="https://example.com/banner.jpg"
          alt="Test banner"
        />
      )

      const image = screen.getByAltText('Test banner')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/banner.jpg')
    })

    it('should apply banner-specific className', () => {
      render(
        <BannerImage
          src="https://example.com/banner.jpg"
          alt="Test banner"
          className="banner-class"
        />
      )

      const container = screen.getByAltText('Test banner').parentElement
      expect(container).toHaveClass('banner-class', 'rounded-lg')
    })

    it('should have priority loading by default', () => {
      render(
        <BannerImage
          src="https://example.com/banner.jpg"
          alt="Test banner"
        />
      )

      const image = screen.getByAltText('Test banner')
      expect(image).toBeInTheDocument()
    })
  })

  describe('AvatarImage', () => {
    it('should render with avatar-specific props', () => {
      render(
        <AvatarImage
          src="https://example.com/avatar.jpg"
          alt="Test avatar"
        />
      )

      const image = screen.getByAltText('Test avatar')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('should apply avatar-specific className', () => {
      render(
        <AvatarImage
          src="https://example.com/avatar.jpg"
          alt="Test avatar"
          className="avatar-class"
        />
      )

      const container = screen.getByAltText('Test avatar').parentElement
      expect(container).toHaveClass('avatar-class', 'rounded-full')
    })

    it('should use custom size', () => {
      render(
        <AvatarImage
          src="https://example.com/avatar.jpg"
          alt="Test avatar"
          size={64}
        />
      )

      const image = screen.getByAltText('Test avatar')
      expect(image).toBeInTheDocument()
    })

    it('should have priority loading by default', () => {
      render(
        <AvatarImage
          src="https://example.com/avatar.jpg"
          alt="Test avatar"
        />
      )

      const image = screen.getByAltText('Test avatar')
      expect(image).toBeInTheDocument()
    })
  })
})
