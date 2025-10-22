// Provider S3-COMPATIBLE - Para AWS S3, MinIO, DigitalOcean Spaces, etc.
// Requiere: pnpm add @aws-sdk/client-s3

import type { StorageProvider, UploadResult } from './types'

export class S3StorageProvider implements StorageProvider {
  private bucket: string
  private region: string
  private endpoint?: string
  private publicUrl?: string

  constructor() {
    this.bucket = process.env.S3_BUCKET || ''
    this.region = process.env.S3_REGION || 'us-east-1'
    this.endpoint = process.env.S3_ENDPOINT // Para MinIO o DigitalOcean Spaces
    this.publicUrl = process.env.S3_PUBLIC_URL // URL pública si usas CDN

    if (!this.bucket) {
      throw new Error('S3_BUCKET environment variable is required')
    }
  }

  async upload(file: File, customPath?: string): Promise<UploadResult> {
    try {
      // Lazy import
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3' as any)

      // Configurar cliente S3
      const s3Client = new S3Client({
        region: this.region,
        ...(this.endpoint && { endpoint: this.endpoint }),
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      })

      // Generar nombre único
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(7)
      const extension = file.name.split('.').pop()
      const key = `${customPath || 'general'}/${timestamp}-${randomString}.${extension}`

      // Convertir File a Buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload a S3
      await s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: file.type,
          ACL: 'public-read', // Hacer público
        })
      )

      // Construir URL pública
      const url = this.publicUrl
        ? `${this.publicUrl}/${key}`
        : this.endpoint
        ? `${this.endpoint}/${this.bucket}/${key}`
        : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`

      return {
        url,
        key,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error('Error uploading to S3:', error)
      throw new Error('Failed to upload file to S3. Check your S3 configuration.')
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3' as any)

      const s3Client = new S3Client({
        region: this.region,
        ...(this.endpoint && { endpoint: this.endpoint }),
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      })

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        })
      )
    } catch (error) {
      console.error('Error deleting from S3:', error)
      throw new Error('Failed to delete file from S3')
    }
  }

  getPublicUrl(key: string): string {
    return this.publicUrl
      ? `${this.publicUrl}/${key}`
      : this.endpoint
      ? `${this.endpoint}/${this.bucket}/${key}`
      : `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`
  }
}
