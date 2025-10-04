import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const protocol =
  process.env.NODE_ENV === 'production' ? 'https' : 'http';
export const rootDomain =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Obtiene la URL base de la aplicación de forma dinámica
 * Funciona tanto en desarrollo como en producción
 */
export function getAppUrl(): string {
  // En el cliente, usar window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // En el servidor, usar las variables de entorno
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Fallback para desarrollo
  if (process.env.NODE_ENV === 'development') {
    return `http://localhost:${process.env.PORT || '3000'}`;
  }
  
  // Fallback para producción
  return `https://${process.env.VERCEL_URL || 'localhost:3000'}`;
}

/**
 * Construye una URL completa para una ruta específica
 */
export function buildUrl(path: string): string {
  const baseUrl = getAppUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}
