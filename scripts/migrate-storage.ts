#!/usr/bin/env tsx
/**
 * Script para migrar imágenes entre diferentes providers de storage
 *
 * Uso:
 *   pnpm tsx scripts/migrate-storage.ts
 *
 * Este script:
 * 1. Lee todas las URLs de imágenes de la base de datos
 * 2. Descarga las imágenes del provider actual
 * 3. Las sube al nuevo provider configurado
 * 4. Actualiza las URLs en la base de datos
 *
 * IMPORTANTE: Haz backup de tu base de datos antes de ejecutar esto
 */

import { PrismaClient } from '@prisma/client'
import { getStorageProvider } from '../lib/storage'
import readline from 'readline'

const prisma = new PrismaClient()

interface ImageReference {
  table: string
  id: string
  field: string
  url: string
}

async function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise(resolve => {
    rl.question(question + ' (yes/no): ', answer => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y')
    })
  })
}

async function collectImageReferences(): Promise<ImageReference[]> {
  const references: ImageReference[] = []

  console.log('📊 Recopilando referencias de imágenes...\n')

  // 1. StoreSettings (banners y profile images)
  const storeSettings = await prisma.storeSettings.findMany({
    select: { id: true, bannerImage: true, profileImage: true }
  })

  for (const store of storeSettings) {
    if (store.bannerImage) {
      references.push({
        table: 'storeSettings',
        id: store.id,
        field: 'bannerImage',
        url: store.bannerImage
      })
    }
    if (store.profileImage) {
      references.push({
        table: 'storeSettings',
        id: store.id,
        field: 'profileImage',
        url: store.profileImage
      })
    }
  }

  // 2. Products (imageUrl)
  const products = await prisma.product.findMany({
    select: { id: true, imageUrl: true }
  })

  for (const product of products) {
    if (product.imageUrl) {
      references.push({
        table: 'product',
        id: product.id,
        field: 'imageUrl',
        url: product.imageUrl
      })
    }
  }

  // 3. ProductImages
  const productImages = await prisma.productImage.findMany({
    select: { id: true, url: true }
  })

  for (const image of productImages) {
    references.push({
      table: 'productImage',
      id: image.id,
      field: 'url',
      url: image.url
    })
  }

  // 4. ProductVariants (imageUrl)
  const variants = await prisma.productVariant.findMany({
    select: { id: true, imageUrl: true }
  })

  for (const variant of variants) {
    if (variant.imageUrl) {
      references.push({
        table: 'productVariant',
        id: variant.id,
        field: 'imageUrl',
        url: variant.imageUrl
      })
    }
  }

  // 5. Categories (imageUrl)
  const categories = await prisma.category.findMany({
    select: { id: true, imageUrl: true }
  })

  for (const category of categories) {
    if (category.imageUrl) {
      references.push({
        table: 'category',
        id: category.id,
        field: 'imageUrl',
        url: category.imageUrl
      })
    }
  }

  return references
}

async function downloadImage(url: string): Promise<File> {
  // Si es una URL local (/uploads/...), convertirla a URL completa
  const fullUrl = url.startsWith('http')
    ? url
    : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${url}`

  const response = await fetch(fullUrl)
  if (!response.ok) {
    throw new Error(`Failed to download ${fullUrl}: ${response.statusText}`)
  }

  const blob = await response.blob()
  const filename = url.split('/').pop() || 'image.jpg'

  // Convertir Blob a File
  return new File([blob], filename, { type: blob.type })
}

async function migrateImage(ref: ImageReference, storage: any): Promise<string> {
  try {
    // Descargar imagen
    const file = await downloadImage(ref.url)

    // Determinar path basado en el campo
    let path = 'general'
    if (ref.field.includes('banner')) path = 'banners'
    else if (ref.field.includes('profile')) path = 'profile'
    else if (ref.table === 'product') path = 'products'
    else if (ref.table === 'category') path = 'categories'

    // Subir al nuevo provider
    const result = await storage.upload(file, path)

    return result.url
  } catch (error) {
    console.error(`❌ Error migrando ${ref.url}:`, error)
    throw error
  }
}

async function updateDatabase(ref: ImageReference, newUrl: string) {
  switch (ref.table) {
    case 'storeSettings':
      await prisma.storeSettings.update({
        where: { id: ref.id },
        data: { [ref.field]: newUrl }
      })
      break
    case 'product':
      await prisma.product.update({
        where: { id: ref.id },
        data: { imageUrl: newUrl }
      })
      break
    case 'productImage':
      await prisma.productImage.update({
        where: { id: ref.id },
        data: { url: newUrl }
      })
      break
    case 'productVariant':
      await prisma.productVariant.update({
        where: { id: ref.id },
        data: { imageUrl: newUrl }
      })
      break
    case 'category':
      await prisma.category.update({
        where: { id: ref.id },
        data: { imageUrl: newUrl }
      })
      break
  }
}

async function main() {
  console.log('🔄 Migración de Storage\n')
  console.log('Provider configurado:', process.env.STORAGE_PROVIDER || 'local')
  console.log('')

  // Recopilar referencias
  const references = await collectImageReferences()

  console.log(`�� Encontradas ${references.length} imágenes para migrar\n`)

  if (references.length === 0) {
    console.log('✅ No hay imágenes para migrar')
    await prisma.$disconnect()
    return
  }

  // Mostrar muestra
  console.log('Ejemplos de imágenes a migrar:')
  references.slice(0, 5).forEach(ref => {
    console.log(`  - ${ref.table}.${ref.field}: ${ref.url}`)
  })
  if (references.length > 5) {
    console.log(`  ... y ${references.length - 5} más`)
  }
  console.log('')

  // Confirmar
  console.log('⚠️  ADVERTENCIA: Este proceso:')
  console.log('   1. Descargará todas las imágenes')
  console.log('   2. Las subirá al nuevo provider')
  console.log('   3. Actualizará las URLs en la base de datos')
  console.log('')
  console.log('   Asegúrate de haber hecho backup de tu base de datos')
  console.log('')

  const confirmed = await askConfirmation('¿Continuar con la migración?')

  if (!confirmed) {
    console.log('❌ Migración cancelada')
    await prisma.$disconnect()
    return
  }

  // Obtener storage provider
  const storage = await getStorageProvider()

  // Migrar cada imagen
  console.log('\n🚀 Iniciando migración...\n')

  let succeeded = 0
  let failed = 0

  for (let i = 0; i < references.length; i++) {
    const ref = references[i]
    const progress = `[${i + 1}/${references.length}]`

    try {
      console.log(`${progress} Migrando ${ref.table}.${ref.field}...`)

      const newUrl = await migrateImage(ref, storage)
      await updateDatabase(ref, newUrl)

      console.log(`   ✅ ${ref.url} → ${newUrl}`)
      succeeded++
    } catch (error) {
      console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      failed++
    }
  }

  console.log('\n📊 Resultados de la migración:')
  console.log(`   ✅ Exitosas: ${succeeded}`)
  console.log(`   ❌ Fallidas: ${failed}`)
  console.log('')

  if (failed === 0) {
    console.log('✅ Migración completada exitosamente')
  } else {
    console.log('⚠️  Migración completada con errores')
    console.log('   Revisa los logs arriba para ver qué imágenes fallaron')
  }

  await prisma.$disconnect()
}

main().catch(error => {
  console.error('❌ Error fatal:', error)
  prisma.$disconnect()
  process.exit(1)
})
