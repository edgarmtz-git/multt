'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Store, Edit, Trash, MapPin, Upload, Image, Camera, X, Phone, MessageCircle, Plus, Minus } from 'lucide-react'
import BannerUploadOptimized from '@/components/ui/banner-upload-optimized'
import { toast } from 'sonner'
import SimpleAddressModal from '@/components/modals/simple-address-modal'
import SimpleMap from '@/components/map/simple-map'

interface AddressData {
  address: string
  latitude?: number
  longitude?: number
  googleMapsUrl?: string
}

interface ProfileSettingsProps {
  settings: any
  setSettings: (settings: any) => void
}

export default function ProfileSettings({ settings, setSettings }: ProfileSettingsProps) {
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [imageTimestamp, setImageTimestamp] = useState(Date.now())
  
  // Referencias para los inputs de archivo
  const profileInputRef = useRef<HTMLInputElement>(null)

  const handleAddressSave = async (address: AddressData) => {
    try {
      // Actualizar el estado local
      setSettings((prev: any) => ({ ...prev, address }))
      
      // Guardar automáticamente en la base de datos
      const response = await fetch('/api/dashboard/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          address
        })
      })

      if (response.ok) {
        toast.success('Dirección guardada correctamente')
      } else {
        toast.error('Error al guardar la dirección')
      }
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Error al guardar la dirección')
    }
  }

  // Función para subir foto de perfil
  const handleProfileUpload = async (file: File) => {
    try {
      // Validar tamaño del archivo (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('La imagen es demasiado grande. Máximo 2MB permitido.')
        return
      }

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen.')
        return
      }

      setUploadingProfile(true)

      // Crear FormData para enviar el archivo
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'profile')

      const response = await fetch('/api/dashboard/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (response.ok) {
        const result = await response.json()
        
        // Actualizar el estado local
        setSettings((prev: any) => ({ 
          ...prev, 
          profileImage: result.imageUrl 
        }))
        
        // Actualizar timestamp para forzar recarga de imagen
        setImageTimestamp(Date.now())
        
        toast.success('Foto de perfil actualizada correctamente')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Error al actualizar foto de perfil')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Error al subir la imagen')
    } finally {
      setUploadingProfile(false)
    }
  }

  // Función para eliminar foto de perfil
  const handleProfileDelete = async () => {
    try {
      const response = await fetch('/api/dashboard/delete-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile' }),
        credentials: 'include'
      })

      if (response.ok) {
        // Actualizar el estado local
        setSettings((prev: any) => ({ 
          ...prev, 
          profileImage: null 
        }))
        
        // Actualizar timestamp para forzar recarga de imagen
        setImageTimestamp(Date.now())
        
        toast.success('Foto de perfil eliminada correctamente')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Error al eliminar foto de perfil')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Error al eliminar la imagen')
    }
  }

  return (
    <div className="space-y-6">
      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Información de la Tienda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="storeName">Nombre de la tienda</Label>
              <Input
                id="storeName"
                value={settings.storeName || ''}
                onChange={(e) => setSettings((prev: any) => ({ ...prev, storeName: e.target.value }))}
                placeholder="Ej: Mi Tienda Digital"
              />
            </div>
            <div>
              <Label htmlFor="email">Email de contacto</Label>
              <Input
                id="email"
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings((prev: any) => ({ ...prev, email: e.target.value }))}
                placeholder="contacto@mitienda.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Configuración de WhatsApp
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configura los números de WhatsApp para que los clientes puedan contactarte
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* WhatsApp Principal */}
          <div className="space-y-2">
            <Label htmlFor="whatsappMain">Número principal de WhatsApp</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="whatsappMain"
                  type="tel"
                  value={settings.whatsappMainNumber || ''}
                  onChange={(e) => setSettings((prev: any) => ({ 
                    ...prev, 
                    whatsappMainNumber: e.target.value 
                  }))}
                  placeholder="+52 55 1234 5678"
                />
              </div>
              {settings.whatsappMainNumber && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const cleanNumber = settings.whatsappMainNumber.replace(/\D/g, '')
                    const whatsappUrl = `https://wa.me/${cleanNumber}`
                    window.open(whatsappUrl, '_blank')
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Este será el número principal que verán los clientes
            </p>
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="phone">Número de teléfono</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phoneNumber || ''}
                  onChange={(e) => setSettings((prev: any) => ({ 
                    ...prev, 
                    phoneNumber: e.target.value 
                  }))}
                  placeholder="+52 55 1234 5678"
                />
              </div>
              {settings.phoneNumber && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const cleanNumber = settings.phoneNumber.replace(/\D/g, '')
                    const phoneUrl = `tel:${cleanNumber}`
                    window.open(phoneUrl, '_self')
                  }}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Número de teléfono para llamadas directas
            </p>
          </div>


          {/* Resumen de configuración */}
          {(settings.whatsappMainNumber || settings.phoneNumber) && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Configuración actual:</h4>
              <div className="space-y-1 text-sm text-green-800">
                {settings.whatsappMainNumber && (
                  <p><strong>WhatsApp:</strong> {settings.whatsappMainNumber}</p>
                )}
                {settings.phoneNumber && (
                  <p><strong>Teléfono:</strong> {settings.phoneNumber}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Banner de la tienda - Optimizado */}
      <BannerUploadOptimized
        currentImage={settings.bannerImage}
        onImageChange={(imageUrl) => {
          setSettings((prev: any) => ({ 
            ...prev, 
            bannerImage: imageUrl 
          }))
          // Actualizar timestamp para forzar recarga de imagen
          setImageTimestamp(Date.now())
        }}
        disabled={false}
      />

      {/* Foto de perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Foto de Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.profileImage ? (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <img 
                    src={`${settings.profileImage}?t=${imageTimestamp}`} 
                    alt="Perfil" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={handleProfileDelete}
                    disabled={uploadingProfile}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-medium">Foto de perfil configurada</p>
                  <p className="text-xs text-gray-500">Aparecerá centrada en el banner</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <Camera className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">No hay foto de perfil</p>
                  <p className="text-xs text-gray-400">Recomendado: 200x200px, formato cuadrado</p>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => profileInputRef.current?.click()}
                disabled={uploadingProfile}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingProfile ? 'Subiendo...' : 'Subir Foto de Perfil'}
              </Button>
              
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleProfileUpload(file)
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dirección */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Dirección de la Tienda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.address ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Dirección actual:</p>
                <p className="text-sm text-gray-600">{settings.address.address}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddressModal(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSettings((prev: any) => ({ ...prev, address: null }))}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
                {settings.address.latitude && settings.address.longitude && (
                  <div className="mt-4">
                    <SimpleMap
                      latitude={settings.address.latitude}
                      longitude={settings.address.longitude}
                      address={settings.address.address}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-500 mb-4">No hay dirección configurada</p>
                <Button onClick={() => setShowAddressModal(true)}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Agregar Dirección
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de dirección */}
      <SimpleAddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSave={handleAddressSave}
        initialAddress={settings.address}
      />
    </div>
  )
}