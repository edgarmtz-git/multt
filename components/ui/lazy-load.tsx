'use client'

import { useState, useEffect, useRef, ReactNode, Suspense } from 'react'

interface LazyLoadProps {
  children: ReactNode
  fallback?: ReactNode
  threshold?: number
  rootMargin?: string
  once?: boolean
  className?: string
}

/**
 * Componente para lazy loading con Intersection Observer
 */
export function LazyLoad({
  children,
  fallback = <div className="animate-pulse bg-gray-200 rounded h-32" />,
  threshold = 0.1,
  rootMargin = '50px',
  once = true,
  className
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) {
            setHasBeenVisible(true)
            observer.disconnect()
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, once])

  return (
    <div ref={elementRef} className={className}>
      {isVisible || hasBeenVisible ? (
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      ) : (
        fallback
      )}
    </div>
  )
}

/**
 * Hook para lazy loading
 */
export function useLazyLoad(options: {
  threshold?: number
  rootMargin?: string
  once?: boolean
} = {}) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasBeenVisible, setHasBeenVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (options.once) {
            setHasBeenVisible(true)
            observer.disconnect()
          }
        } else if (!options.once) {
          setIsVisible(false)
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px'
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [options.threshold, options.rootMargin, options.once])

  return {
    elementRef,
    isVisible: isVisible || hasBeenVisible
  }
}

/**
 * Componente para lazy loading de imágenes
 */
export function LazyImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  ...props
}: {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  [key: string]: any
}) {
  const { elementRef, isVisible } = useLazyLoad({ once: true })

  if (priority) {
    // Si es prioritaria, cargar inmediatamente
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        {...props}
      />
    )
  }

  return (
    <div ref={elementRef} className={className}>
      {isVisible ? (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          {...props}
        />
      ) : (
        <div 
          className="bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-8 h-8 text-gray-400">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Componente para lazy loading de secciones
 */
export function LazySection({
  children,
  className,
  fallback,
  ...props
}: {
  children: ReactNode
  className?: string
  fallback?: ReactNode
  [key: string]: any
}) {
  return (
    <LazyLoad
      fallback={fallback || <div className="animate-pulse bg-gray-100 rounded h-64" />}
      className={className}
      {...props}
    >
      {children}
    </LazyLoad>
  )
}

/**
 * Componente para lazy loading de listas
 */
export function LazyList({
  items,
  renderItem,
  className,
  itemClassName,
  fallback,
  ...props
}: {
  items: any[]
  renderItem: (item: any, index: number) => ReactNode
  className?: string
  itemClassName?: string
  fallback?: ReactNode
  [key: string]: any
}) {
  return (
    <div className={className} {...props}>
      {items.map((item, index) => (
        <LazyLoad
          key={index}
          fallback={fallback || <div className="animate-pulse bg-gray-200 rounded h-20 mb-2" />}
          className={itemClassName}
        >
          {renderItem(item, index)}
        </LazyLoad>
      ))}
    </div>
  )
}
