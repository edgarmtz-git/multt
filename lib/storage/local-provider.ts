// Provider LOCAL - Para VPS o Railway
// Almacena archivos en el filesystem

import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import type { StorageAdapter, UploadResult } from './types'

export class LocalStorageProvider implements StorageAdapter {
  private uploadDir: string
  private publicUrl: string

  constructor() {
    // Directory donde se guardan los archivos
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads')

    // URL pública para acceder a los archivos
    this.publicUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

    // Asegurar que el directorio existe
    this.ensureUploadDir()
  }

  private async ensureUploadDir() {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true })
    }
  }

  async upload(file: File, customPath?: string): Promise<UploadResult> {
    try {
      // En Vercel, el filesystem no es persistente, así que usamos una URL temporal
      if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
        console.warn('⚠️ Local storage en Vercel - archivos no serán persistentes')
        
        // Generar una URL temporal (esto es solo para evitar errores)
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(7)
        const extension = file.name.split('.').pop()
        const filename = `${timestamp}-${randomString}.${extension}`
        const subDir = customPath || 'general'
        
        // En Vercel, retornamos una URL placeholder
        const url = `https://via.placeholder.com/400x300/cccccc/666666?text=Image+Uploaded`
        
        return {
          url,
          key: `${subDir}/${filename}`,
          size: file.size,
          type: file.type
        }
      }

      // Generar nombre único
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(7)
      const extension = file.name.split('.').pop()
      const filename = `${timestamp}-${randomString}.${extension}`

      // Path completo
      const subDir = customPath || 'general'
      const dirPath = path.join(this.uploadDir, subDir)

      // Crear subdirectorio si no existe
      if (!existsSync(dirPath)) {
        await mkdir(dirPath, { recursive: true })
      }

      const filePath = path.join(dirPath, filename)

      // Convertir File a Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Guardar archivo
      await writeFile(filePath, buffer)

      // Construir URL pública
      const publicPath = `/uploads/${subDir}/${filename}`
      const url = `${this.publicUrl}${publicPath}`

      return {
        url,
        key: `${subDir}/${filename}`,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, key)
      if (existsSync(filePath)) {
        await unlink(filePath)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      throw new Error('Failed to delete file')
    }
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/uploads/${key}`
  }
}
