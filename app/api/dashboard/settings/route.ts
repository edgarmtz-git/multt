import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserSlug } from '@/lib/get-user-slug'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// Función para guardar imagen base64 en el sistema de archivos
async function saveImageToFile(base64Data: string, filename: string): Promise<string> {
  try {
    // Crear directorio si no existe
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'store-images')
    await mkdir(uploadsDir, { recursive: true })
    
    // Extraer datos base64 (remover el prefijo data:image/...;base64,)
    const base64String = base64Data.split(',')[1]
    const buffer = Buffer.from(base64String, 'base64')
    
    // Determinar la extensión basada en el tipo MIME
    let extension = '.jpg' // Por defecto
    if (base64Data.includes('data:image/png')) {
      extension = '.png'
    } else if (base64Data.includes('data:image/gif')) {
      extension = '.gif'
    } else if (base64Data.includes('data:image/webp')) {
      extension = '.webp'
    }
    
    // Actualizar el filename con la extensión correcta
    const finalFilename = filename.includes('.') ? 
      filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, extension) : 
      filename + extension
    
    // Guardar archivo
    const filePath = join(uploadsDir, finalFilename)
    await writeFile(filePath, buffer)
    
    console.log('🔍 Image saved:', {
      originalFilename: filename,
      finalFilename: finalFilename,
      mimeType: base64Data.split(',')[0],
      fileSize: buffer.length
    })
    
    // Retornar URL relativa
    return `/uploads/store-images/${finalFilename}`
  } catch (error) {
    console.error('Error saving image:', error)
    throw error
  }
}

// GET - Obtener configuración de la tienda
export async function GET() {
  try {
    console.log('🔍 GET endpoint called')
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('❌ No session found')
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }
    console.log('✅ Session found:', session.user.id)

    // ✅ VALIDACIÓN ROBUSTA: Verificar que el usuario existe y está activo
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isSuspended: true,
        suspensionReason: true
      }
    })

    if (!user) {
      console.log('❌ User not found:', session.user.id)
      return NextResponse.json(
        { message: 'Usuario no encontrado' }, 
        { status: 404 }
      )
    }

    if (!user.isActive) {
      console.log('❌ User inactive:', session.user.id)
      return NextResponse.json(
        { message: 'Cuenta de usuario inactiva' }, 
        { status: 403 }
      )
    }

    if (user.isSuspended) {
      console.log('❌ User suspended:', session.user.id)
      return NextResponse.json(
        { 
          message: 'Cuenta suspendida',
          suspensionReason: user.suspensionReason
        }, 
        { status: 403 }
      )
    }

    if (user.role !== 'CLIENT') {
      console.log('❌ Invalid role:', user.role)
      return NextResponse.json(
        { message: 'Acceso denegado: rol no válido' }, 
        { status: 403 }
      )
    }

    console.log('✅ User validation passed:', user.email)

    // Buscar configuración existente
    let settings = await prisma.storeSettings.findUnique({
      where: { userId: session.user.id }
    })

    // Si no existe, crear configuración por defecto
    if (!settings) {
      console.log('📝 Creating default settings for user:', user.email)

      // Obtener slug correcto desde invitación o generar uno apropiado
      const slug = await getUserSlug(session.user.id, user.email)

      settings = await prisma.storeSettings.create({
        data: {
          userId: session.user.id,
          storeName: 'Mi Tienda',
          storeSlug: slug,
          country: 'Mexico',
          language: 'es',
          currency: 'MXN',
          distanceUnit: 'km',
          mapProvider: 'openstreetmap',
          taxRate: 0.0,
          taxMethod: 'included',
          enableBusinessHours: false,
          disableCheckoutOutsideHours: false,
          paymentsEnabled: true,
          storeActive: true,
          passwordProtected: false,

          // Configuración de envío por defecto
          deliveryCalculationMethod: 'manual',
          pricePerKm: 15,
          maxDeliveryDistance: 7,
          manualDeliveryMessage: 'El costo de envío se calculará al confirmar el pedido.'
        }
      })

      console.log('✅ Auto-created StoreSettings with proper slug:', slug)
    }

    // Parsear JSON fields
    console.log('🔍 GET - Settings from DB:', {
      deliveryEnabled: settings.deliveryEnabled,
      deliveryScheduleEnabled: settings.deliveryScheduleEnabled,
      scheduleType: settings.scheduleType,
      advanceDays: settings.advanceDays,
      serviceHours: settings.serviceHours
    })
    
    console.log('🔍 GET - All settings keys:', Object.keys(settings))
    
    const parsedSettings = {
      ...settings,
      address: settings.address ? (() => {
        try {
          return JSON.parse(settings.address as string)
        } catch {
          return undefined
        }
      })() : undefined,
      // TODO: whatsappSequentialNumbers field missing from schema - add to StoreSettings model
      // whatsappSequentialNumbers: settings.whatsappSequentialNumbers ? (() => {
      //   try {
      //     return JSON.parse(settings.whatsappSequentialNumbers)
      //   } catch {
      //     return []
      //   }
      // })() : [],
      businessHours: settings.businessHours ? (() => {
        try {
          return JSON.parse(settings.businessHours as string)
        } catch {
          return {}
        }
      })() : {},
      serviceHours: settings.serviceHours ? (() => {
        try {
          return JSON.parse(settings.serviceHours as string)
        } catch {
          return {}
        }
      })() : {},
      unifiedSchedule: settings.unifiedSchedule ? (() => {
        try {
          return JSON.parse(settings.unifiedSchedule as string)
        } catch {
          return {}
        }
      })() : {},
      // Nuevos campos de imágenes
      bannerImage: settings.bannerImage || null,
      profileImage: settings.profileImage || null
    }

    console.log('🔍 GET - Parsed settings:', {
      deliveryScheduleEnabled: parsedSettings.deliveryScheduleEnabled,
      scheduleType: parsedSettings.scheduleType,
      advanceDays: parsedSettings.advanceDays,
      serviceHours: parsedSettings.serviceHours
    })

    return NextResponse.json(parsedSettings)
  } catch (error) {
    console.error('Error fetching store settings:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar configuración de la tienda
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 PUT /api/dashboard/settings - Iniciando...')
    
    const session = await getServerSession(authOptions)
    console.log('🔍 Session:', session ? 'Found' : 'Not found')
    console.log('🔍 User ID:', session?.user?.id)
    
    if (!session?.user?.id) {
      console.log('❌ No autorizado - sin sesión')
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    console.log('🔍 Body recibido:', JSON.stringify(body, null, 2))
    console.log('🔍 Body type:', typeof body)
    console.log('🔍 Body keys:', Object.keys(body))
    
    const {
      storeName,
      storeSlug,
      email,
      address,
      whatsappMainNumber,
      phoneNumber,
      country,
      language,
      currency,
      distanceUnit,
      mapProvider,
      taxRate,
      taxMethod,
      tagId,
      enableBusinessHours,
      disableCheckoutOutsideHours,
      businessHours,
      deliveryEnabled,
      instagramLink,
      facebookLink,
      paymentsEnabled,
      // Campos de configuración de pagos
      cashPaymentEnabled,
      cashPaymentInstructions,
      bankTransferEnabled,
      bankName,
      accountNumber,
      accountHolder,
      clabe,
      transferInstructions,
      paymentInstructions,
      storeActive,
      passwordProtected,
      accessPassword,
      // Campos de horarios de entrega
      deliveryScheduleEnabled,
      scheduleType,
      advanceDays,
      serviceHours,
      // Campos de cálculo de envío
      deliveryCalculationMethod,
      pricePerKm,
      maxDeliveryDistance,
      manualDeliveryMessage,
      // Campos de imágenes
      bannerImage,
      profileImage
    } = body
    
    console.log('🔍 Campos extraídos:', {
      deliveryEnabled,
      deliveryScheduleEnabled,
      scheduleType,
      advanceDays,
      serviceHours,
      bannerImage: bannerImage ? 'Present' : 'Missing',
      profileImage: profileImage ? 'Present' : 'Missing'
    })
    
    console.log('🔍 Banner image details:', {
      type: typeof bannerImage,
      length: bannerImage ? bannerImage.length : 0,
      startsWith: bannerImage ? bannerImage.substring(0, 50) : 'N/A'
    })
    
    console.log('🔍 Body completo:', JSON.stringify(body, null, 2))

    // Validar que el slug sea único (si se está cambiando)
    if (storeSlug) {
      const existingSettings = await prisma.storeSettings.findFirst({
        where: {
          storeSlug,
          userId: { not: session.user.id }
        }
      })

      if (existingSettings) {
        return NextResponse.json(
          { message: 'El enlace de la tienda ya está en uso' },
          { status: 400 }
        )
      }
    }

    // Actualizar o crear configuración
    console.log('🔍 Iniciando upsert en base de datos...')
    console.log('🔍 User ID para upsert:', session.user.id)
    console.log('🔍 Banner image length:', bannerImage ? bannerImage.length : 0)
    console.log('🔍 Profile image length:', profileImage ? profileImage.length : 0)
    console.log('🔍 deliveryScheduleEnabled:', deliveryScheduleEnabled)
    console.log('🔍 scheduleType:', scheduleType)
    console.log('🔍 advanceDays:', advanceDays)
    console.log('🔍 serviceHours:', serviceHours)
    console.log('🔍 bannerImage:', bannerImage ? 'Presente' : 'Ausente')
    console.log('🔍 profileImage:', profileImage ? 'Presente' : 'Ausente')
    
    // Validar tamaño de imágenes base64
    if (bannerImage && bannerImage.length > 1000000) { // 1MB limit
      console.error('❌ Banner image too large:', bannerImage.length, 'characters')
      return NextResponse.json(
        { message: 'La imagen del banner es demasiado grande' },
        { status: 400 }
      )
    }
    
    if (profileImage && profileImage.length > 1000000) { // 1MB limit
      console.error('❌ Profile image too large:', profileImage.length, 'characters')
      return NextResponse.json(
        { message: 'La imagen de perfil es demasiado grande' },
        { status: 400 }
      )
    }

    // Procesar imágenes: guardar en archivos si son base64
    let processedBannerImage = bannerImage
    let processedProfileImage = profileImage
    
    if (bannerImage && bannerImage.startsWith('data:image/')) {
      try {
        console.log('🔍 Processing banner image...')
        const filename = `banner-${session.user.id}-${Date.now()}`
        processedBannerImage = await saveImageToFile(bannerImage, filename)
        console.log('🔍 Banner image saved to file:', processedBannerImage)
      } catch (error) {
        console.error('❌ Error saving banner image:', error)
        processedBannerImage = null
      }
    } else {
      console.log('🔍 Banner image not base64 or missing:', {
        hasBanner: !!bannerImage,
        isBase64: bannerImage ? bannerImage.startsWith('data:image/') : false
      })
    }
    
    if (profileImage && profileImage.startsWith('data:image/')) {
      try {
        const filename = `profile-${session.user.id}-${Date.now()}`
        processedProfileImage = await saveImageToFile(profileImage, filename)
        console.log('🔍 Profile image saved to file:', processedProfileImage)
      } catch (error) {
        console.error('❌ Error saving profile image:', error)
        processedProfileImage = null
      }
    }
    
    let updatedSettings
    try {
      console.log('🔍 Ejecutando upsert en base de datos...')
      console.log('🔍 Banner image length after processing:', processedBannerImage ? processedBannerImage.length : 0)
      console.log('🔍 Profile image length after processing:', processedProfileImage ? processedProfileImage.length : 0)
      updatedSettings = await prisma.storeSettings.upsert({
      where: { userId: session.user.id },
      update: {
        storeName: storeName || 'Mi Tienda',
        storeSlug: storeSlug || `tienda-${Date.now()}`,
        email,
        address: address ? JSON.stringify(address) : null,
        whatsappMainNumber,
        phoneNumber,
        country: country || 'Mexico',
        language: language || 'es',
        currency: currency || 'MXN',
        distanceUnit: distanceUnit || 'km',
        mapProvider: mapProvider || 'openstreetmap',
        taxRate: taxRate || 0.0,
        taxMethod: taxMethod || 'included',
        tagId,
        enableBusinessHours: enableBusinessHours || false,
        disableCheckoutOutsideHours: disableCheckoutOutsideHours || false,
        businessHours: businessHours ? JSON.stringify(businessHours) : undefined,
        deliveryEnabled: deliveryEnabled !== undefined ? deliveryEnabled : true,
        instagramLink,
        facebookLink,
        paymentsEnabled: paymentsEnabled !== undefined ? paymentsEnabled : true,
        // Campos de configuración de pagos
        cashPaymentEnabled: cashPaymentEnabled !== undefined ? cashPaymentEnabled : true,
        cashPaymentInstructions,
        bankTransferEnabled: bankTransferEnabled !== undefined ? bankTransferEnabled : false,
        bankName,
        accountNumber,
        accountHolder,
        clabe,
        transferInstructions,
        paymentInstructions,
        storeActive: storeActive !== undefined ? storeActive : true,
        passwordProtected: passwordProtected || false,
        accessPassword: passwordProtected ? accessPassword : null,
        // Campos de horarios de entrega
        deliveryScheduleEnabled: deliveryScheduleEnabled || false,
        scheduleType: scheduleType || 'date',
        advanceDays: advanceDays || 1,
        serviceHours: serviceHours ? JSON.stringify(serviceHours) : undefined,
        // Campos de cálculo de envío
        deliveryCalculationMethod: deliveryCalculationMethod || 'distance',
        pricePerKm: pricePerKm || 0,
        maxDeliveryDistance: maxDeliveryDistance || 7,
        manualDeliveryMessage: manualDeliveryMessage || 'El costo de envío se calculará al confirmar el pedido y se te enviará por WhatsApp.',
        // Campos de imágenes
        bannerImage: processedBannerImage || undefined,
        profileImage: processedProfileImage || undefined
      },
      create: {
        userId: session.user.id,
        storeName: storeName || 'Mi Tienda',
        storeSlug: storeSlug || `tienda-${Date.now()}`,
        email,
        address: address ? JSON.stringify(address) : null,
        whatsappMainNumber,
        phoneNumber,
        country: country || 'Mexico',
        language: language || 'es',
        currency: currency || 'MXN',
        distanceUnit: distanceUnit || 'km',
        mapProvider: mapProvider || 'openstreetmap',
        taxRate: taxRate || 0.0,
        taxMethod: taxMethod || 'included',
        tagId,
        enableBusinessHours: enableBusinessHours || false,
        disableCheckoutOutsideHours: disableCheckoutOutsideHours || false,
        businessHours: businessHours ? JSON.stringify(businessHours) : undefined,
        deliveryEnabled: deliveryEnabled !== undefined ? deliveryEnabled : true,
        instagramLink,
        facebookLink,
        paymentsEnabled: paymentsEnabled !== undefined ? paymentsEnabled : true,
        // Campos de configuración de pagos
        cashPaymentEnabled: cashPaymentEnabled !== undefined ? cashPaymentEnabled : true,
        cashPaymentInstructions,
        bankTransferEnabled: bankTransferEnabled !== undefined ? bankTransferEnabled : false,
        bankName,
        accountNumber,
        accountHolder,
        clabe,
        transferInstructions,
        paymentInstructions,
        storeActive: storeActive !== undefined ? storeActive : true,
        passwordProtected: passwordProtected || false,
        accessPassword: passwordProtected ? accessPassword : null,
        // Campos de horarios de entrega
        deliveryScheduleEnabled: deliveryScheduleEnabled || false,
        scheduleType: scheduleType || 'date',
        advanceDays: advanceDays || 1,
        serviceHours: serviceHours ? JSON.stringify(serviceHours) : undefined,
        // Campos de cálculo de envío
        deliveryCalculationMethod: deliveryCalculationMethod || 'distance',
        pricePerKm: pricePerKm || 0,
        maxDeliveryDistance: maxDeliveryDistance || 7,
        manualDeliveryMessage: manualDeliveryMessage || 'El costo de envío se calculará al confirmar el pedido y se te enviará por WhatsApp.',
        // Campos de imágenes
        bannerImage: processedBannerImage || undefined,
        profileImage: processedProfileImage || undefined
      }
    })
    console.log('✅ Upsert exitoso en base de datos')
    console.log('🔍 Settings actualizados:', updatedSettings.id)
    } catch (dbError) {
      console.error('❌ Database error during upsert:', dbError)
      console.error('❌ Database error details:', {
        name: dbError instanceof Error ? dbError.name : 'Unknown',
        message: dbError instanceof Error ? dbError.message : 'Unknown error',
        cause: dbError instanceof Error ? dbError.cause : undefined
      })
      return NextResponse.json(
        { message: 'Error al guardar en la base de datos' },
        { status: 500 }
      )
    }

    // Parsear JSON fields para la respuesta
    const parsedSettings = {
      ...updatedSettings,
      address: updatedSettings.address ? (() => {
        try {
          return JSON.parse(updatedSettings.address as string)
        } catch {
          return undefined
        }
      })() : undefined,
      // TODO: whatsappSequentialNumbers field missing from schema - add to StoreSettings model
      // whatsappSequentialNumbers: updatedSettings.whatsappSequentialNumbers ? (() => {
      //   try {
      //     return JSON.parse(updatedSettings.whatsappSequentialNumbers)
      //   } catch {
      //     return []
      //   }
      // })() : [],
      businessHours: updatedSettings.businessHours ? (() => {
        try {
          return JSON.parse(updatedSettings.businessHours as string)
        } catch {
          return {}
        }
      })() : {}
    }

    return NextResponse.json(parsedSettings)
  } catch (error) {
    console.error('❌ Error updating store settings:', error)
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
    console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      cause: error instanceof Error ? error.cause : undefined
    })
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
