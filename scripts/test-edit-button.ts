import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testEditButton() {
  try {
    // Verificar que hay productos en la BD
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        images: true,
        categoryProducts: {
          include: {
            category: true
          }
        }
      }
    });

    console.log('Productos en la base de datos:');
    products.forEach(product => {
      console.log(`- ${product.name} (ID: ${product.id})`);
      const categoryName = product.categoryProducts[0]?.category?.name || 'Sin categoría';
      console.log(`  Categoría: ${categoryName}`);
      console.log(`  Activo: ${product.isActive}`);
      console.log(`  Variantes: ${product.variants.length}`);
      console.log(`  Imágenes: ${product.images.length}`);
      console.log('---');
    });

    if (products.length === 0) {
      console.log('No hay productos para probar. Crea algunos productos primero.');
    }

  } catch (error) {
    console.error('Error al verificar productos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEditButton();
