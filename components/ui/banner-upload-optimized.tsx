'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Image, Trash, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface BannerUploadOptimizedProps {
  currentImage?: string | null
  onImageChange: (imageUrl: string | null) => void
  disabled?: boolean
}

export default function BannerUploadOptimized({ 
  currentImage, 
  onImageChange, 
  disabled = false 
}: BannerUploadOptimizedProps) {
  
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [processingInfo, setProcessingInfo] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen no puede ser mayor a 10MB')
      return
    }

    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Subir imagen
    uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    console.log('🚀 BannerUploadOptimized: Iniciando upload...')
    setUploading(true)
    setProcessingInfo(null)
    
    try {
      const formData = new FormData()
      formData.append('image', file)

      console.log('📤 BannerUploadOptimized: Enviando request...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })

      const response = await fetch('/api/dashboard/upload-banner-optimized', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      console.log('📥 BannerUploadOptimized: Response status:', response.status)
      console.log('📥 BannerUploadOptimized: Response headers:', Object.fromEntries(response.headers.entries()))

      const result = await response.json()
      console.log('📥 BannerUploadOptimized: Response data:', result)

      if (response.ok) {
        console.log('✅ BannerUploadOptimized: Upload exitoso')
        onImageChange(result.imageUrl)
        setPreview(null)
        setProcessingInfo(result)
        
        toast.success('Banner optimizado y guardado correctamente')
        
        // Mostrar información de procesamiento
        toast.info(
          `Imagen redimensionada: ${result.originalDimensions} → ${result.targetDimensions} (${result.compressionRatio} compresión)`,
          { duration: 5000 }
        )
      } else {
        console.error('❌ BannerUploadOptimized: Error response:', result)
        throw new Error(result.message || 'Error al subir imagen')
      }
    } catch (error) {
      console.error('❌ BannerUploadOptimized: Error en upload:', error)
      toast.error(error instanceof Error ? error.message : 'Error al subir banner')
      setPreview(null)
      setProcessingInfo(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch('/api/dashboard/delete-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'banner' }),
        credentials: 'include'
      })

      if (response.ok) {
        onImageChange(null)
        setPreview(null)
        setProcessingInfo(null)
        toast.success('Banner eliminado correctamente')
      } else {
        throw new Error('Error al eliminar banner')
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
      toast.error('Error al eliminar banner')
    }
  }

  const displayImage = preview || currentImage

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Banner de la Tienda (Optimizado)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          
          {/* Vista previa del banner */}
          {displayImage ? (
            <div className="relative group">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <h4 className="text-sm font-medium mb-2">Vista previa del banner:</h4>
                
                {/* Simulación del tamaño real de la cabecera */}
                <div className="relative">
                  <div className="h-40 lg:h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative mx-auto max-w-4xl">
                    <img 
                      src={displayImage} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Tamaño real en la tienda (160px móvil / 192px desktop)
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={uploading || disabled}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Eliminar Banner
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-sm text-gray-500 mb-4">No hay banner configurado</p>
              <p className="text-xs text-gray-400">Se optimizará automáticamente al tamaño de la cabecera</p>
            </div>
          )}
          
          {/* Información de procesamiento */}
          {processingInfo && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Procesamiento completado
              </h4>
              <div className="text-xs text-green-700 space-y-1">
                <p><strong>Dimensiones originales:</strong> {processingInfo.originalDimensions}</p>
                <p><strong>Dimensiones optimizadas:</strong> {processingInfo.targetDimensions}</p>
                <p><strong>Compresión:</strong> {processingInfo.compressionRatio}</p>
                <p><strong>Tamaño original:</strong> {Math.round(processingInfo.originalSize / 1024)}KB</p>
                <p><strong>Tamaño optimizado:</strong> {Math.round(processingInfo.processedSize / 1024)}KB</p>
              </div>
            </div>
          )}
          
          {/* Upload button */}
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || disabled}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Procesando...' : 'Subir Banner'}
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading || disabled}
          />


          {/* Loading overlay */}
          {uploading && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-800 text-sm">Optimizando banner para la cabecera...</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
