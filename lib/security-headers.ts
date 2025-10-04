import { NextResponse } from 'next/server'

// Configuración de headers de seguridad
export const securityHeaders = {
  // Prevenir clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevenir MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Habilitar XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Política de referrer
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss:",
    "media-src 'self' data: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // Permissions Policy (antes Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=()',
    'battery=()',
    'bluetooth=()',
    'clipboard-read=()',
    'clipboard-write=(self)',
    'display-capture=()',
    'document-domain=()',
    'encrypted-media=()',
    'fullscreen=(self)',
    'gamepad=()',
    'midi=()',
    'notifications=()',
    'picture-in-picture=()',
    'publickey-credentials-get=(self)',
    'screen-wake-lock=()',
    'sync-xhr=()',
    'web-share=()',
    'xr-spatial-tracking=()'
  ].join(', '),
  
  // Strict Transport Security (solo en HTTPS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
}

// Función para aplicar headers de seguridad
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// Headers específicos para APIs
export const apiSecurityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store'
}

// Función para aplicar headers de seguridad a APIs
export function applyApiSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(apiSecurityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// Headers para archivos estáticos
export const staticSecurityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'public, max-age=31536000, immutable'
}

// Función para aplicar headers a archivos estáticos
export function applyStaticSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(staticSecurityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}
