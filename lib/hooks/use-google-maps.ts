'use client'

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    google: any
    initGoogleMaps?: () => void
  }
}

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Verificar si hay API key configurada
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || apiKey === 'undefined') {
      setError('Google Maps API key no configurada. Por favor configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu archivo .env')
      setIsLoading(false)
      return
    }

    // Si ya está cargado, no hacer nada
    if (window.google) {
      setIsLoaded(true)
      return
    }

    // Si ya está cargando, no hacer nada
    if (isLoading) return

    setIsLoading(true)
    setError(null)

    // Verificar si ya existe un script de Google Maps
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      // Si existe, esperar a que se cargue
      const checkLoaded = () => {
        if (window.google) {
          setIsLoaded(true)
          setIsLoading(false)
        } else {
          setTimeout(checkLoaded, 100)
        }
      }
      checkLoaded()
      return
    }

    // Crear el script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true
    
    // Callback global
    window.initGoogleMaps = () => {
      setIsLoaded(true)
      setIsLoading(false)
    }
    
    // Manejar errores
    script.onerror = () => {
      setError('Error al cargar Google Maps API. Verifica tu API key.')
      setIsLoading(false)
    }
    
    document.head.appendChild(script)

    // Cleanup
    return () => {
      if (window.initGoogleMaps) {
        window.initGoogleMaps = undefined
      }
    }
  }, [isLoading])

  return { isLoaded, isLoading, error }
}
