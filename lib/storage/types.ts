// Tipos compartidos para el sistema de storage

export interface UploadResult {
  url: string
  key: string
  size: number
  type: string
}

export interface StorageProvider {
  upload(file: File, path?: string): Promise<UploadResult>
  delete(key: string): Promise<void>
  getUrl(key: string): string
}

export type StorageProviderType = 'local' | 'vercel-blob' | 's3'
