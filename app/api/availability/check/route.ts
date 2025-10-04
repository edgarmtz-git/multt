import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Availability Check - Iniciando...')
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    console.log(`📋 User ID: ${userId}`)
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }
    
    // Versión simplificada para debug
    const storeSettings = await prisma.storeSettings.findFirst({
      where: { userId },
      select: {
        storeName: true,
        unifiedSchedule: true
      }
    })
    
    console.log(`📊 StoreSettings: ${storeSettings ? 'Found' : 'Not found'}`)
    
    if (!storeSettings) {
      return NextResponse.json({ 
        error: 'Store not found',
        available: false 
      }, { status: 404 })
    }
    
    if (!storeSettings.unifiedSchedule) {
      return NextResponse.json({ 
        error: 'Schedule not configured',
        available: false 
      }, { status: 404 })
    }
    
    // Respuesta simplificada
    const result = {
      storeName: storeSettings.storeName,
      isOpen: true, // Simplificado para debug
      date: new Date().toISOString(),
      message: 'API funcionando correctamente'
    }
    
    console.log(`✅ Respuesta exitosa para ${storeSettings.storeName}`)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('❌ Error en API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      available: false 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}