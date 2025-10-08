'use client'

import { ShieldOff, ArrowLeft, Home, Clock, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StoreInactiveProps {
  storeName?: string
  reason?: 'inactive' | 'suspended'
}

export function StoreInactive({ storeName, reason = 'inactive' }: StoreInactiveProps) {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  const isSuspended = reason === 'suspended'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono */}
        <div className={`w-24 h-24 ${isSuspended ? 'bg-red-100' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto mb-6`}>
          {isSuspended ? (
            <ShieldOff className="w-12 h-12 text-red-600" />
          ) : (
            <Clock className="w-12 h-12 text-orange-600" />
          )}
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isSuspended ? 'Tienda suspendida' : 'Tienda temporalmente cerrada'}
        </h1>

        {/* Nombre de la tienda */}
        {storeName && (
          <p className="text-lg font-medium text-gray-700 mb-4">
            {storeName}
          </p>
        )}

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">
          {isSuspended
            ? 'Esta tienda ha sido suspendida temporalmente y no está disponible para realizar pedidos.'
            : 'Esta tienda está temporalmente cerrada y no está aceptando pedidos en este momento.'}
        </p>

        {/* Info adicional */}
        <div className={`${isSuspended ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4 mb-6 text-left`}>
          <p className={`text-sm ${isSuspended ? 'text-red-900' : 'text-orange-900'} font-medium mb-2`}>
            {isSuspended ? 'Motivo de la suspensión:' : '¿Qué puedes hacer?'}
          </p>
          <ul className={`text-sm ${isSuspended ? 'text-red-800' : 'text-orange-800'} space-y-1 list-disc list-inside`}>
            {isSuspended ? (
              <>
                <li>Cuenta en proceso de renovación</li>
                <li>Mantenimiento temporal</li>
                <li>Problema administrativo</li>
              </>
            ) : (
              <>
                <li>Intenta nuevamente más tarde</li>
                <li>Contacta directamente a la tienda</li>
                <li>Revisa sus redes sociales</li>
              </>
            )}
          </ul>
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <Button
            onClick={handleGoBack}
            className="w-full"
            size="lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver atrás
          </Button>

          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full"
            size="lg"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir al inicio
          </Button>
        </div>

        {/* Soporte */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">
            ¿Tienes preguntas sobre esta tienda?
          </p>
          <a
            href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'soporte@tudominio.com'}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
          >
            <Mail className="w-4 h-4 mr-1" />
            Contactar a soporte
          </a>
        </div>
      </div>
    </div>
  )
}
