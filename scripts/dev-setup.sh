#!/bin/bash

# Script para configurar el entorno de desarrollo local con SQLite
# Este script NO afecta la configuración de producción en Vercel

echo "🔧 Configurando entorno de desarrollo local..."

# 1. Verificar que existe .env
if [ ! -f ".env" ]; then
  echo "📝 Creando archivo .env para desarrollo local..."
  cat > .env << 'EOF'
# Configuración de desarrollo local (SQLite)
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="5KSP8LszSi3F+MaSpCEsO90nRq4B7hW5OfGh21xiqQc="
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
EOF
  echo "✅ Archivo .env creado"
else
  echo "✅ Archivo .env ya existe"
fi

# 2. Verificar schema.prisma
PROVIDER=$(grep -A 1 "datasource db" prisma/schema.prisma | grep "provider" | awk '{print $3}' | tr -d '"')
echo "📊 Provider de Prisma: $PROVIDER"

# 3. Crear schema temporal para desarrollo con SQLite
echo "📝 Creando schema temporal para desarrollo..."
cp prisma/schema.prisma prisma/schema.prisma.backup
sed -i 's/provider = "postgresql"/provider = "sqlite"/g' prisma/schema.prisma

# 4. Generar Prisma Client para SQLite
echo "⚙️  Generando Prisma Client para SQLite..."
DATABASE_URL="file:./prisma/dev.db" pnpm db:generate

# 5. Crear/actualizar base de datos SQLite
if [ ! -f "prisma/dev.db" ]; then
  echo "🗄️  Creando base de datos SQLite..."
  DATABASE_URL="file:./prisma/dev.db" pnpm db:push

  echo "🌱 Sembrando datos de prueba..."
  DATABASE_URL="file:./prisma/dev.db" pnpm db:seed
else
  echo "✅ Base de datos SQLite ya existe"
  echo "💡 Si quieres resetearla, ejecuta: rm prisma/dev.db && pnpm run dev:setup"
fi

# 6. Restaurar schema original para git
echo "🔄 Restaurando schema.prisma original..."
mv prisma/schema.prisma.backup prisma/schema.prisma

echo ""
echo "✨ ¡Configuración completada!"
echo ""
echo "📝 Resumen:"
echo "  • Base de datos local: prisma/dev.db (SQLite)"
echo "  • Variables de entorno: .env (no se sube a Git)"
echo "  • Schema original: prisma/schema.prisma (PostgreSQL para Vercel)"
echo ""
echo "🚀 Para iniciar el servidor de desarrollo:"
echo "  pnpm dev"
echo ""
echo "⚠️  IMPORTANTE:"
echo "  • Tu base de datos local (SQLite) NO afecta la producción"
echo "  • Vercel seguirá usando PostgreSQL automáticamente"
echo "  • Los archivos .env y *.db están en .gitignore"
echo ""
