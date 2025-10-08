'use client'

import { Store, ArrowLeft, Home, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StoreNotFoundProps {
  slug: string
}

export function StoreNotFound({ slug }: StoreNotFoundProps) {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icono */}
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Store className="w-12 h-12 text-gray-400" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tienda no encontrada
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">
          No encontramos ninguna tienda con el nombre{' '}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
            {slug}
          </span>
        </p>

        {/* Posibles causas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-900 font-medium mb-2">
            Posibles causas:
          </p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>El enlace está mal escrito</li>
            <li>La tienda fue desactivada</li>
            <li>El nombre de la tienda cambió</li>
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
            ¿Crees que esto es un error?
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
