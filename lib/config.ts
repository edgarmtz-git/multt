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