// Factory para crear el provider de storage correcto según configuración
// Permite cambiar entre Local, Vercel Blob, o S3 sin cambiar código

import type { StorageProvider, StorageProviderType } from './types'

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
let cachedProvider: StorageProvider | null = null

export async function getStorageProvider(): Promise<StorageProvider> {
  // Si ya existe una instancia, retornarla
  if (cachedProvider) {
    return cachedProvider
  }

  // Leer configuración de ambiente
  const providerType = (process.env.STORAGE_PROVIDER || 'local') as StorageProviderType

  // Crear provider según configuración
  switch (providerType) {
    case 'vercel-blob':
      cachedProvider = await getVercelBlobProvider()
      break
    case 's3':
      cachedProvider = await getS3Provider()
      break
    case 'local':
    default:
      cachedProvider = await getLocalProvider()
      break
  }

  return cachedProvider
}

// Helper para resetear cache (útil en tests)
export function resetStorageProvider() {
  cachedProvider = null
}

// Re-exportar tipos para facilitar imports
export type { StorageProvider, UploadResult, StorageProviderType } from './types'
