/**
 * Tipos comunes para el sistema de almacenamiento multi-provider
 * Soporta: Local (VPS), Vercel Blob, S3-compatible (AWS, DO Spaces, MinIO)
 */

export interface UploadResult {
  /** URL pública para acceder a la imagen */
  url: string
  /** Key/path único del archivo (usado para eliminación) */
  key: string
  /** Tamaño del archivo en bytes */
  size: number
  /** MIME type del archivo */
  type: string
}

export interface StorageAdapter {
  /**
   * Sube un archivo al storage
   * @param file - Archivo a subir
   * @param path - Ruta/directorio donde guardar (ej: "products", "banners")
   * @returns Información del archivo subido
   */
  upload(file: File, path?: string): Promise<UploadResult>

  /**
   * Elimina un archivo del storage
   * @param key - Key/path del archivo a eliminar
   */
  delete(key: string): Promise<void>

  /**
   * Obtiene la URL pública de un archivo
   * @param key - Key/path del archivo
   * @returns URL pública del archivo
   */
  getPublicUrl(key: string): string
}

export type StorageProvider = 'local' | 'vercel-blob' | 's3'
