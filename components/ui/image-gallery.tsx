'use client'

import { useState, useCallback } from 'react'
import { OptimizedImage, ProductImage } from './optimized-image'
import { LazyLoad } from './lazy-load'
import { Button } from './button'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'

interface ImageGalleryProps {
  images: string[]
  alt: string
  className?: string
  showThumbnails?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  showFullscreen?: boolean
  priority?: boolean
}

export function ImageGallery({
  images,
  alt,
  className,
  showThumbnails = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  showFullscreen = true,
  priority = false
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const goToImage = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const openFullscreen = useCallback(() => {
    setIsFullscreen(true)
  }, [])

  const closeFullscreen = useCallback(() => {
    setIsFullscreen(false)
  }, [])

  // Auto play
  useState(() => {
    if (!autoPlay || images.length <= 1) return

    const interval = setInterval(nextImage, autoPlayInterval)
    return () => clearInterval(interval)
  })

  if (images.length === 0) {
    return (
      <div className={cn("bg-gray-100 flex items-center justify-center rounded-lg", className)}>
        <div className="text-center text-gray-500 p-8">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
          <p>No hay imágenes disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={cn("relative", className)}>
        {/* Imagen principal */}
        <div className="relative group">
          <LazyLoad
            fallback={<div className="animate-pulse bg-gray-200 rounded-lg h-64" />}
            threshold={0.1}
          >
            <ProductImage
              src={images[currentIndex]}
              alt={`${alt} - Imagen ${currentIndex + 1}`}
              className="w-full h-full object-cover rounded-lg"
              priority={priority}
            />
          </LazyLoad>

          {/* Overlay con controles */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={prevImage}
                    className="h-10 w-10 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={nextImage}
                    className="h-10 w-10 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              {showFullscreen && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={openFullscreen}
                  className="h-10 w-10 p-0"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Indicadores de posición */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-200",
                    index === currentIndex
                      ? "bg-white"
                      : "bg-white bg-opacity-50 hover:bg-opacity-75"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="mt-4 flex space-x-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                  index === currentIndex
                    ? "border-blue-500"
                    : "border-transparent hover:border-gray-300"
                )}
              >
                <LazyLoad
                  fallback={<div className="animate-pulse bg-gray-200 w-full h-full" />}
                  threshold={0.1}
                >
                  <OptimizedImage
                    src={image}
                    alt={`${alt} - Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </LazyLoad>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de pantalla completa */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="relative max-w-7xl max-h-full p-4">
            {/* Botón de cerrar */}
            <Button
              variant="secondary"
              size="sm"
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 h-10 w-10 p-0"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Imagen en pantalla completa */}
            <OptimizedImage
              src={images[currentIndex]}
              alt={`${alt} - Pantalla completa`}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
              priority={true}
            />

            {/* Controles de navegación */}
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 p-0"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-200",
                    index === currentIndex
                      ? "bg-white"
                      : "bg-white bg-opacity-50 hover:bg-opacity-75"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Componente para galería de productos
 */
export function ProductImageGallery({
  images,
  productName,
  className
}: {
  images: string[]
  productName: string
  className?: string
}) {
  return (
    <ImageGallery
      images={images}
      alt={productName}
      className={className}
      showThumbnails={true}
      showFullscreen={true}
      priority={true}
    />
  )
}

/**
 * Componente para galería de banners
 */
export function BannerImageGallery({
  images,
  alt,
  className
}: {
  images: string[]
  alt: string
  className?: string
}) {
  return (
    <ImageGallery
      images={images}
      alt={alt}
      className={className}
      showThumbnails={false}
      autoPlay={true}
      autoPlayInterval={5000}
      showFullscreen={false}
      priority={true}
    />
  )
}
