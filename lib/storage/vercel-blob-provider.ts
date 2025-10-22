// Provider VERCEL BLOB - Para hosting en Vercel
// Requiere: pnpm add @vercel/blob

import type { StorageAdapter, UploadResult } from './types'

export class VercelBlobProvider implements StorageAdapter {
  async upload(file: File, customPath?: string): Promise<UploadResult> {
    try {
      // Lazy import para no romper si @vercel/blob no está instalado
      const { put } = await import('@vercel/blob' as any)

      // Generar nombre único
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(7)
      const extension = file.name.split('.').pop()
      const filename = `${customPath || 'general'}/${timestamp}-${randomString}.${extension}`

      // Upload a Vercel Blob
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: false,
      })

      return {
        url: blob.url,
        key: blob.pathname,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error('Error uploading to Vercel Blob:', error)
      throw new Error('Failed to upload file to Vercel Blob. Make sure BLOB_READ_WRITE_TOKEN is configured.')
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const { del } = await import('@vercel/blob' as any)
      await del(key)
    } catch (error) {
      console.error('Error deleting from Vercel Blob:', error)
      throw new Error('Failed to delete file from Vercel Blob')
    }
  }

  getPublicUrl(key: string): string {
    // Vercel Blob URLs son directas
    return key
  }
}
