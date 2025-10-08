// Configuración dinámica del sistema
export function getServerConfig() {
  // Detectar puerto automáticamente
  const port = process.env.PORT || '3000'

  // Detectar URL base
  const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${port}`

  return {
    port: parseInt(port),
    baseUrl,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production'
  }
}

// Configuración para NextAuth
export function getNextAuthConfig() {
  const config = getServerConfig()

  return {
    url: config.baseUrl,
    secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
    pages: {
      signIn: '/login',
    }
  }
}

// Validación de slug
export function validateSlug(slug: string): { isValid: boolean; message?: string } {
  if (!slug) {
    return { isValid: false, message: 'El slug es requerido' }
  }

  // Solo letras minúsculas, números y guiones
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!slugRegex.test(slug)) {
    return {
      isValid: false,
      message: 'Solo letras minúsculas, números y guiones. Sin espacios ni caracteres especiales.'
    }
  }

  // Longitud mínima y máxima
  if (slug.length < 3) {
    return { isValid: false, message: 'El slug debe tener al menos 3 caracteres' }
  }

  if (slug.length > 50) {
    return { isValid: false, message: 'El slug no puede tener más de 50 caracteres' }
  }

  // No puede empezar o terminar con guión
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { isValid: false, message: 'El slug no puede empezar o terminar con guión' }
  }

  return { isValid: true }
}

// Validación de email
export function validateEmail(email: string): { isValid: boolean; message?: string } {
  if (!email) {
    return { isValid: false, message: 'El email es requerido' }
  }

  // Regex básico para email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Formato de email inválido' }
  }

  // Longitud máxima
  if (email.length > 100) {
    return { isValid: false, message: 'El email es demasiado largo' }
  }

  return { isValid: true }
}