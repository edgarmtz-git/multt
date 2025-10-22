#!/usr/bin/env tsx
/**
 * Script para validar la configuración de storage antes del deploy
 */

import { existsSync } from 'fs'
import { join } from 'path'

type StorageProvider = 'local' | 'vercel-blob' | 's3'

interface ValidationResult {
  valid: boolean
  provider: StorageProvider
  errors: string[]
  warnings: string[]
  info: string[]
}

function validateStorageConfig(): ValidationResult {
  const provider = (process.env.STORAGE_PROVIDER || 'local') as StorageProvider
  const result: ValidationResult = {
    valid: true,
    provider,
    errors: [],
    warnings: [],
    info: []
  }

  result.info.push('Provider configurado: ' + provider)

  switch (provider) {
    case 'local':
      validateLocalStorage(result)
      break
    case 'vercel-blob':
      validateVercelBlob(result)
      break
    case 's3':
      validateS3Storage(result)
      break
    default:
      result.errors.push('Provider desconocido: ' + provider)
      result.valid = false
  }

  return result
}

function validateLocalStorage(result: ValidationResult) {
  result.info.push('Validando Local Storage...')

  const publicDir = join(process.cwd(), 'public')
  if (!existsSync(publicDir)) {
    result.errors.push('Directorio /public no encontrado')
    result.valid = false
    return
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    result.warnings.push('NEXT_PUBLIC_APP_URL no configurado')
  }

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    result.errors.push('Local storage NO funciona en serverless')
    result.valid = false
    return
  }

  result.info.push('Local storage configurado correctamente')
}

function validateVercelBlob(result: ValidationResult) {
  result.info.push('Validando Vercel Blob...')

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    result.errors.push('BLOB_READ_WRITE_TOKEN no configurado')
    result.valid = false
    return
  }

  const packageJsonPath = join(process.cwd(), 'package.json')
  if (existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath)
    const hasVercelBlob =
      packageJson.dependencies?.['@vercel/blob'] ||
      packageJson.devDependencies?.['@vercel/blob']

    if (!hasVercelBlob) {
      result.errors.push('Dependencia @vercel/blob no instalada')
      result.errors.push('Ejecutar: pnpm add @vercel/blob')
      result.valid = false
      return
    }
  }

  result.info.push('Vercel Blob configurado correctamente')
}

function validateS3Storage(result: ValidationResult) {
  result.info.push('Validando S3 Storage...')

  const requiredVars = [
    'S3_BUCKET',
    'S3_REGION',
    'S3_ACCESS_KEY_ID',
    'S3_SECRET_ACCESS_KEY'
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])

  if (missingVars.length > 0) {
    result.errors.push('Variables faltantes: ' + missingVars.join(', '))
    result.valid = false
    return
  }

  const packageJsonPath = join(process.cwd(), 'package.json')
  if (existsSync(packageJsonPath)) {
    const packageJson = require(packageJsonPath)
    const hasAwsSdk =
      packageJson.dependencies?.['@aws-sdk/client-s3'] ||
      packageJson.devDependencies?.['@aws-sdk/client-s3']

    if (!hasAwsSdk) {
      result.errors.push('Dependencia @aws-sdk/client-s3 no instalada')
      result.errors.push('Ejecutar: pnpm add @aws-sdk/client-s3')
      result.valid = false
      return
    }
  }

  result.info.push('S3 configurado correctamente')
  result.info.push('Bucket: ' + process.env.S3_BUCKET)
  result.info.push('Region: ' + process.env.S3_REGION)
}

function main() {
  console.log('Validando configuracion de storage...\n')

  const result = validateStorageConfig()

  if (result.info.length > 0) {
    result.info.forEach(msg => console.log(msg))
    console.log('')
  }

  if (result.warnings.length > 0) {
    result.warnings.forEach(msg => console.log('Warning:', msg))
    console.log('')
  }

  if (result.errors.length > 0) {
    result.errors.forEach(msg => console.log('Error:', msg))
    console.log('')
  }

  if (result.valid) {
    console.log('Configuracion valida\n')
    process.exit(0)
  } else {
    console.log('Configuracion invalida\n')
    process.exit(1)
  }
}

main()
