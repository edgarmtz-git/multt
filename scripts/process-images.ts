#!/usr/bin/env tsx

import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Script para procesar y optimizar imágenes
 * Genera múltiples tamaños y formatos para diferentes dispositivos
 */

interface ImageProcessingOptions {
  inputPath: string
  outputDir: string
  baseName: string
  quality?: number
  formats?: ('webp' | 'avif' | 'jpeg')[]
  sizes?: number[]
}

const DEFAULT_SIZES = [16, 32, 48, 64, 96, 128, 256, 384, 512, 768, 1024, 1200]
const DEFAULT_FORMATS = ['webp', 'avif', 'jpeg'] as const
const DEFAULT_QUALITY = 85

/**
 * Procesa una imagen y genera múltiples versiones optimizadas
 */
async function processImage(options: ImageProcessingOptions) {
  const {
    inputPath,
    outputDir,
    baseName,
    quality = DEFAULT_QUALITY,
    formats = DEFAULT_FORMATS,
    sizes = DEFAULT_SIZES
  } = options

  console.log(`🖼️  Procesando imagen: ${inputPath}`)

  try {
    // Crear directorio de salida si no existe
    await fs.mkdir(outputDir, { recursive: true })

    // Obtener metadatos de la imagen original
    const metadata = await sharp(inputPath).metadata()
    console.log(`   📏 Dimensiones originales: ${metadata.width}x${metadata.height}`)

    const results: string[] = []

    // Procesar cada tamaño
    for (const size of sizes) {
      // Solo procesar si el tamaño es menor o igual al original
      if (metadata.width && size > metadata.width) continue

      for (const format of formats) {
        const outputPath = path.join(outputDir, `${baseName}-${size}w.${format}`)
        
        let pipeline = sharp(inputPath)
          .resize(size, size, {
            fit: 'inside',
            withoutEnlargement: true
          })

        // Aplicar optimizaciones según el formato
        switch (format) {
          case 'webp':
            pipeline = pipeline.webp({ quality })
            break
          case 'avif':
            pipeline = pipeline.avif({ quality })
            break
          case 'jpeg':
            pipeline = pipeline.jpeg({ quality, progressive: true })
            break
        }

        await pipeline.toFile(outputPath)
        results.push(outputPath)
        console.log(`   ✅ Generado: ${outputPath}`)
      }
    }

    // Generar imagen de placeholder blur
    const blurPath = path.join(outputDir, `${baseName}-blur.webp`)
    await sharp(inputPath)
      .resize(20, 20, { fit: 'cover' })
      .blur(2)
      .webp({ quality: 20 })
      .toFile(blurPath)
    
    results.push(blurPath)
    console.log(`   ✅ Placeholder blur: ${blurPath}`)

    return results
  } catch (error) {
    console.error(`❌ Error procesando imagen ${inputPath}:`, error)
    throw error
  }
}

/**
 * Procesa todas las imágenes en un directorio
 */
async function processDirectory(inputDir: string, outputDir: string) {
  console.log(`📁 Procesando directorio: ${inputDir}`)
  
  try {
    const files = await fs.readdir(inputDir)
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp|avif)$/i.test(file)
    )

    console.log(`   📊 Encontradas ${imageFiles.length} imágenes`)

    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file)
      const baseName = path.parse(file).name
      
      await processImage({
        inputPath,
        outputDir: path.join(outputDir, baseName),
        baseName
      })
    }

    console.log(`🎉 Procesamiento completado`)
  } catch (error) {
    console.error(`❌ Error procesando directorio:`, error)
    throw error
  }
}

/**
 * Genera un manifest de imágenes procesadas
 */
async function generateImageManifest(outputDir: string) {
  console.log(`📋 Generando manifest de imágenes...`)
  
  try {
    const manifest: Record<string, any> = {}
    
    const walkDir = async (dir: string, basePath: string = '') => {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relativePath = path.join(basePath, entry.name)
        
        if (entry.isDirectory()) {
          await walkDir(fullPath, relativePath)
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name)
          const name = path.basename(entry.name, ext)
          const size = entry.name.match(/(\d+)w/)?.[1]
          
          if (!manifest[name]) {
            manifest[name] = {
              base: name,
              formats: {},
              sizes: []
            }
          }
          
          if (!manifest[name].formats[ext.slice(1)]) {
            manifest[name].formats[ext.slice(1)] = []
          }
          
          manifest[name].formats[ext.slice(1)].push({
            size: size ? parseInt(size) : null,
            path: relativePath
          })
          
          if (size && !manifest[name].sizes.includes(parseInt(size))) {
            manifest[name].sizes.push(parseInt(size))
          }
        }
      }
    }
    
    await walkDir(outputDir)
    
    // Ordenar tamaños
    Object.values(manifest).forEach((item: any) => {
      item.sizes.sort((a: number, b: number) => a - b)
    })
    
    const manifestPath = path.join(outputDir, 'images.json')
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
    
    console.log(`   ✅ Manifest generado: ${manifestPath}`)
    return manifest
  } catch (error) {
    console.error(`❌ Error generando manifest:`, error)
    throw error
  }
}

/**
 * Función principal
 */
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
🖼️  Procesador de Imágenes Optimizado

Uso:
  npm run tsx scripts/process-images.ts <directorio_entrada> [directorio_salida]
  
Ejemplos:
  npm run tsx scripts/process-images.ts ./public/uploads
  npm run tsx scripts/process-images.ts ./public/uploads ./public/optimized
    `)
    process.exit(1)
  }
  
  const inputDir = args[0]
  const outputDir = args[1] || path.join(inputDir, 'optimized')
  
  try {
    // Verificar que el directorio de entrada existe
    await fs.access(inputDir)
    
    console.log(`🚀 Iniciando procesamiento de imágenes`)
    console.log(`   📂 Entrada: ${inputDir}`)
    console.log(`   📂 Salida: ${outputDir}`)
    
    // Procesar directorio
    await processDirectory(inputDir, outputDir)
    
    // Generar manifest
    await generateImageManifest(outputDir)
    
    console.log(`\n🎉 ¡Procesamiento completado exitosamente!`)
    console.log(`\n📊 Estadísticas:`)
    console.log(`   • Tamaños generados: ${DEFAULT_SIZES.join(', ')}`)
    console.log(`   • Formatos: ${DEFAULT_FORMATS.join(', ')}`)
    console.log(`   • Calidad: ${DEFAULT_QUALITY}%`)
    
  } catch (error) {
    console.error(`❌ Error en el procesamiento:`, error)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

export { processImage, processDirectory, generateImageManifest }
