import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createDavidUser() {
  console.log('🎯 Creando usuario completo para David Alberto Guzmán...\n')

  try {
    // Paso 1: Crear invitación
    console.log('📧 Paso 1: Creando invitación...')
    const invitation = await prisma.invitation.create({
      data: {
        code: Math.random().toString(36).substring(2, 15),
        clientName: 'David Alberto Guzmán',
        clientEmail: 'david@restaurante-mexicano.com',
        clientPhone: '+52 55 1234-5678',
        slug: 'restaurante-mexicano-david',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        createdBy: 'admin-script',
        status: 'PENDING'
      }
    })
    
    console.log('✅ Invitación creada:')
    console.log(`   - Código: ${invitation.code}`)
    console.log(`   - Email: ${invitation.clientEmail}`)
    console.log(`   - Slug: ${invitation.slug}`)
    console.log(`   - Link: http://localhost:3000/invite/${invitation.code}`)

    // Paso 2: Crear usuario directamente (simulando aceptación de invitación)
    console.log('\n👤 Paso 2: Creando usuario...')
    const hashedPassword = await bcrypt.hash(
      process.env.SEED_CLIENT_PASSWORD || 'david123', 
      12
    )
    
    const result = await prisma.$transaction(async (tx) => {
      // Crear el usuario
      const user = await tx.user.create({
        data: {
          email: invitation.clientEmail,
          name: invitation.clientName,
          password: hashedPassword,
          role: 'CLIENT',
          company: invitation.slug,
          isActive: true
        }
      })

      // Crear productos de ejemplo para el nuevo usuario
      const sampleProducts = [
        {
          name: "Tacos al Pastor",
          description: "Deliciosos tacos de cerdo marinado con piña",
          price: 25.00,
          category: "Tacos",
          stock: 50,
          userId: user.id
        },
        {
          name: "Quesadillas de Queso",
          description: "Quesadillas tradicionales con queso Oaxaca",
          price: 35.00,
          category: "Quesadillas",
          stock: 30,
          userId: user.id
        },
        {
          name: "Pozole Rojo",
          description: "Pozole tradicional con carne de cerdo",
          price: 45.00,
          category: "Sopas",
          stock: 20,
          userId: user.id
        },
        {
          name: "Agua de Horchata",
          description: "Bebida refrescante de arroz y canela",
          price: 15.00,
          category: "Bebidas",
          stock: 100,
          userId: user.id
        }
      ]

      await tx.product.createMany({
        data: sampleProducts
      })

      // Marcar invitación como usada
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'USED',
          usedAt: new Date(),
          serviceStart: new Date(),
          serviceRenewal: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 año
          isActive: true
        }
      })

      return user
    })

    console.log('✅ Usuario creado:')
    console.log(`   - Nombre: ${result.name}`)
    console.log(`   - Email: ${result.email}`)
    console.log(`   - Empresa: ${result.company}`)
    console.log(`   - Contraseña: ${process.env.SEED_CLIENT_PASSWORD || 'david123'}`)

    // Paso 3: Verificar productos creados
    console.log('\n📦 Paso 3: Verificando productos...')
    const products = await prisma.product.findMany({
      where: { userId: result.id }
    })
    
    console.log(`✅ ${products.length} productos creados:`)
    products.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} - $${product.price} (Stock: ${product.stock})`)
    })

    // Paso 4: Mostrar URLs para probar
    console.log('\n🔗 Paso 4: URLs para probar:')
    console.log(`   📱 Login: http://localhost:3000/login`)
    console.log(`   👤 Dashboard: http://localhost:3000/dashboard`)
    console.log(`   🏪 Tienda pública: http://localhost:3000/tienda/${result.company}`)
    console.log(`   📧 Invitación original: http://localhost:3000/invite/${invitation.code}`)

    console.log('\n🎉 ¡Proceso completado exitosamente!')
    console.log('\n📋 Credenciales de David:')
    console.log(`   Email: ${result.email}`)
    console.log(`   Contraseña: ${process.env.SEED_CLIENT_PASSWORD || 'david123'}`)

  } catch (error) {
    console.error('❌ Error en el proceso:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDavidUser()
