#!/usr/bin/env tsx
/**
 * Script para resetear la contraseña de un usuario
 * 
 * Uso:
 *   pnpm tsx scripts/reset-password.ts <email> <nueva-contraseña>
 * 
 * Ejemplo:
 *   pnpm tsx scripts/reset-password.ts pedidos@lacasadelsabor.com nuevapass123
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetPassword(email: string, newPassword: string) {
  try {
    // 1. Buscar el usuario
    console.log(`🔍 Buscando usuario: ${email}`)
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        company: true
      }
    })

    if (!user) {
      console.error(`❌ Usuario no encontrado: ${email}`)
      process.exit(1)
    }

    console.log(`✅ Usuario encontrado:`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Nombre: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Company: ${user.company}`)
    console.log('')

    // 2. Hashear la nueva contraseña
    console.log(`🔐 Hasheando nueva contraseña...`)
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 3. Actualizar en la base de datos
    console.log(`💾 Actualizando contraseña en la base de datos...`)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordChangedAt: new Date(),
        loginAttempts: 0, // Resetear intentos fallidos
        lockedUntil: null // Desbloquear cuenta si estaba bloqueada
      }
    })

    console.log('')
    console.log(`✅ Contraseña actualizada exitosamente!`)
    console.log('')
    console.log(`📋 Credenciales actualizadas:`)
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${newPassword}`)
    console.log('')
    console.log(`⚠️  IMPORTANTE: Guarda esta contraseña en un lugar seguro`)

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Obtener argumentos de la línea de comandos
const email = process.argv[2]
const newPassword = process.argv[3]

if (!email || !newPassword) {
  console.error('❌ Uso: pnpm tsx scripts/reset-password.ts <email> <nueva-contraseña>')
  console.error('')
  console.error('Ejemplo:')
  console.error('  pnpm tsx scripts/reset-password.ts pedidos@lacasadelsabor.com nuevapass123')
  process.exit(1)
}

resetPassword(email, newPassword)
