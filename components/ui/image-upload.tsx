"use client"

// Componente universal de upload de imágenes
// Funciona con cualquier storage provider (Local, Vercel Blob, S3)

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string
  onChange: (url: string, key: string) => void
  onRemove?: () => void
  disabled?: boolean
  className?: string
  path?: string // Subdirectorio para organizar archivos (ej: "products", "banners")
  maxSize?: number // En MB, default 5MB
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto'
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
  path = 'general',
  maxSize = 5,
  aspectRatio = 'auto'
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño
    const maxBytes = maxSize * 1024 * 1024
    if (file.size > maxBytes) {
      setError(`El archivo es demasiado grande. Máximo ${maxSize}MB`)
      return
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Crear FormData
      const formData = new FormData()
      formData.append('file', file)
      formData.append('path', path)

      // Subir a API universal
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir imagen')
      }

      // Notificar al componente padre
      onChange(data.url, data.key)

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Error al subir imagen')
    } finally {
      setLoading(false)
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleRemove = async () => {
    if (!value || !onRemove) return

    try {
      setLoading(true)
      onRemove()
    } finally {
      setLoading(false)
    }
  }

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
    auto: ''
  }[aspectRatio]

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn(
        'relative rounded-lg border-2 border-dashed transition-colors',
        value ? 'border-transparent' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        disabled && 'opacity-50 cursor-not-allowed',
        aspectRatioClass
      )}>
        {value ? (
          // Preview de imagen
          <div className="relative w-full h-full min-h-[200px]">
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        ) : (
          // Upload zone
          <label
            className={cn(
              'flex flex-col items-center justify-center w-full h-full min-h-[200px] cursor-pointer',
              disabled && 'cursor-not-allowed'
            )}
          >
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              {loading ? (
                <>
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <p className="text-sm">Subiendo...</p>
                </>
              ) : (
                <>
                  <div className="rounded-full bg-muted p-3">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Haz clic para subir imagen
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WebP o GIF (máx. {maxSize}MB)
                    </p>
                  </div>
                </>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={disabled || loading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <X className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
