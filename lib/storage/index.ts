// Factory para crear el provider de storage correcto según configuración
// Permite cambiar entre Local, Vercel Blob, o S3 sin cambiar código

import type { StorageAdapter, StorageProvider } from './types'

// Lazy imports de providers
async function getLocalProvider() {
  const { LocalStorageProvider } = await import('./local-provider')
  return new LocalStorageProvider()
}

async function getVercelBlobProvider() {
  try {
    const { VercelBlobProvider } = await import('./vercel-blob-provider')
    return new VercelBlobProvider()
  } catch (error) {
    console.warn('Vercel Blob provider not available, falling back to local storage')
    return await getLocalProvider()
  }
}

async function getS3Provider() {
  try {
    const { S3StorageProvider } = await import('./s3-provider')
    return new S3StorageProvider()
  } catch (error) {
    console.warn('S3 provider not available, falling back to local storage')
    return await getLocalProvider()
  }
}

// Singleton para evitar crear múltiples instancias
let cachedProvider: StorageAdapter | null = null

export async function getStorageProvider(): Promise<StorageAdapter> {
  // Si ya existe una instancia, retornarla
  if (cachedProvider) {
    return cachedProvider
  }

  // Leer configuración de ambiente
  const providerType = (process.env.STORAGE_PROVIDER || 'local') as StorageProvider

  console.log('🔧 Storage Provider Configuration:', {
    providerType,
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    hasS3Config: !!(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY),
    nodeEnv: process.env.NODE_ENV
  })

  // Crear provider según configuración
  try {
    switch (providerType) {
      case 'vercel-blob':
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
          console.warn('⚠️ Vercel Blob configurado pero BLOB_READ_WRITE_TOKEN no encontrado, usando local storage')
          cachedProvider = await getLocalProvider()
        } else {
          cachedProvider = await getVercelBlobProvider()
        }
        break
      case 's3':
        if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
          console.warn('⚠️ S3 configurado pero credenciales no encontradas, usando local storage')
          cachedProvider = await getLocalProvider()
        } else {
          cachedProvider = await getS3Provider()
        }
        break
      case 'local':
      default:
        cachedProvider = await getLocalProvider()
        break
    }
  } catch (error) {
    console.error('❌ Error creating storage provider:', error)
    console.log('🔄 Falling back to local storage')
    cachedProvider = await getLocalProvider()
  }

  return cachedProvider
}

// Helper para resetear cache (útil en tests)
export function resetStorageProvider() {
  cachedProvider = null
}

// Re-exportar tipos para facilitar imports
export type { StorageAdapter, StorageProvider, UploadResult } from './types'
