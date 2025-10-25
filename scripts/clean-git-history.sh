#!/bin/bash

# ============================================
# Script para limpiar archivos sensibles del historial de Git
# ============================================
# ADVERTENCIA: Este script reescribe el historial de Git
# Asegúrate de tener un backup antes de ejecutar
# ============================================

set -e  # Exit on error

echo "🔍 Limpieza de archivos sensibles del historial de Git"
echo "======================================================"
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en un repositorio Git
if [ ! -d .git ]; then
    echo -e "${RED}❌ Error: No estás en un repositorio Git${NC}"
    exit 1
fi

# Verificar que estamos en la raíz del proyecto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No estás en la raíz del proyecto${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  ADVERTENCIA:${NC}"
echo "Este script va a:"
echo "1. Crear un backup completo del repositorio"
echo "2. Remover archivos sensibles del HISTORIAL completo de Git"
echo "3. Hacer un FORCE PUSH al repositorio remoto"
echo ""
echo -e "${RED}Esto REESCRIBIRÁ el historial de Git${NC}"
echo ""

read -p "¿Estás seguro de continuar? (escribe 'SI' para confirmar): " confirm
if [ "$confirm" != "SI" ]; then
    echo "Operación cancelada"
    exit 0
fi

# 1. Crear backup
echo ""
echo -e "${GREEN}📦 Paso 1: Creando backup...${NC}"
BACKUP_DIR="../multt-backup-$(date +%Y%m%d-%H%M%S)"
cp -r . "$BACKUP_DIR"
echo -e "${GREEN}✅ Backup creado en: $BACKUP_DIR${NC}"

# 2. Verificar archivos sensibles en el historial
echo ""
echo -e "${GREEN}🔍 Paso 2: Buscando archivos sensibles en el historial...${NC}"
SENSITIVE_FILES=$(git log --all --pretty=format: --name-only --diff-filter=A | \
  grep -E '\.(db|sqlite|env\.local|backup)$' | sort -u || true)

if [ -z "$SENSITIVE_FILES" ]; then
    echo -e "${GREEN}✅ No se encontraron archivos sensibles en el historial${NC}"
    exit 0
fi

echo -e "${YELLOW}Archivos encontrados:${NC}"
echo "$SENSITIVE_FILES"
echo ""

# 3. Verificar si BFG está instalado
echo -e "${GREEN}🔧 Paso 3: Verificando herramientas...${NC}"
if command -v bfg &> /dev/null; then
    USE_BFG=true
    echo "✅ BFG Repo-Cleaner encontrado"
else
    USE_BFG=false
    echo "⚠️  BFG no encontrado, usando git filter-branch (más lento)"
fi

# 4. Limpiar historial
echo ""
echo -e "${GREEN}🧹 Paso 4: Limpiando historial...${NC}"

if [ "$USE_BFG" = true ]; then
    # Usar BFG (más rápido)
    bfg --delete-files '*.db'
    bfg --delete-files '*.db.backup-*'
    bfg --delete-files '*.sqlite*'
    bfg --delete-files '.env.local'
else
    # Usar git filter-branch
    echo "Removiendo *.db..."
    git filter-branch --force --index-filter \
      'git rm --cached --ignore-unmatch "*.db" "*.db.backup-*" "*.sqlite*" ".env.local"' \
      --prune-empty --tag-name-filter cat -- --all
fi

# 5. Limpiar referencias
echo ""
echo -e "${GREEN}🗑️  Paso 5: Limpiando referencias y garbage collection...${NC}"
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 6. Verificar
echo ""
echo -e "${GREEN}✅ Paso 6: Verificando limpieza...${NC}"
REMAINING=$(git log --all --pretty=format: --name-only --diff-filter=A | \
  grep -E '\.(db|sqlite|env\.local|backup)$' | sort -u || true)

if [ -z "$REMAINING" ]; then
    echo -e "${GREEN}✅ Historial limpio - No quedan archivos sensibles${NC}"
else
    echo -e "${RED}❌ Aún quedan archivos:${NC}"
    echo "$REMAINING"
    echo ""
    echo "Por favor revisa manualmente"
    exit 1
fi

# 7. Mostrar tamaño antes/después
echo ""
echo -e "${GREEN}📊 Comparación de tamaños:${NC}"
BACKUP_SIZE=$(du -sh "$BACKUP_DIR/.git" | cut -f1)
CURRENT_SIZE=$(du -sh .git | cut -f1)
echo "Antes:  $BACKUP_SIZE"
echo "Después: $CURRENT_SIZE"

# 8. Confirmar push
echo ""
echo -e "${YELLOW}⚠️  ÚLTIMO PASO: Force Push${NC}"
echo "El historial ha sido limpiado localmente."
echo "Ahora necesitas hacer FORCE PUSH para actualizar GitHub."
echo ""
echo -e "${RED}ADVERTENCIA:${NC}"
echo "- Esto reescribirá el historial en GitHub"
echo "- Otros colaboradores necesitarán re-clonar o hacer reset"
echo "- No se puede deshacer fácilmente"
echo ""

read -p "¿Hacer force push ahora? (escribe 'PUSH' para confirmar): " push_confirm
if [ "$push_confirm" = "PUSH" ]; then
    echo ""
    echo -e "${GREEN}🚀 Haciendo force push...${NC}"
    git push origin --force --all
    git push origin --force --tags

    echo ""
    echo -e "${GREEN}✅ ¡Completado!${NC}"
    echo ""
    echo -e "${YELLOW}📋 SIGUIENTE PASO CRÍTICO:${NC}"
    echo "Como los archivos estuvieron expuestos, debes:"
    echo "1. Cambiar TODAS las contraseñas de usuarios"
    echo "2. Rotar NEXTAUTH_SECRET en Vercel"
    echo "3. Rotar cualquier API key que esté en la BD"
    echo ""
    echo "Backup guardado en: $BACKUP_DIR"
else
    echo ""
    echo "Force push cancelado."
    echo "Puedes hacerlo manualmente con:"
    echo "  git push origin --force --all"
    echo "  git push origin --force --tags"
fi

echo ""
echo -e "${GREEN}✅ Script completado${NC}"
