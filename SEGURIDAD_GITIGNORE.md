# 🚨 Análisis de Seguridad - .gitignore

**Fecha:** 2025-10-24
**Severidad:** 🔴 CRÍTICA
**Estado:** ⚠️ ARCHIVOS SENSIBLES EXPUESTOS EN GIT

---

## ❌ PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. 🔴 BASE DE DATOS EN GIT (CRÍTICO)

**Archivos encontrados en repositorio:**
```
✅ Tracked by Git:
- prisma/dev.db (237 KB) - BASE DE DATOS COMPLETA
- prisma/dev.db.backup-20251007-141843
- prisma/dev.db.backup-20251007-231207
```

**Problema:**
- ❌ Base de datos SQLite con TODOS los datos está en el repositorio
- ❌ Contiene contraseñas hasheadas de usuarios
- ❌ Contiene datos de clientes, órdenes, productos
- ❌ Historial completo accesible en commits

**Impacto:**
- 🚨 **CRÍTICO:** Cualquiera con acceso al repo puede descargar la BD completa
- 🚨 Datos personales de clientes expuestos
- 🚨 Contraseñas hasheadas pueden ser atacadas (rainbow tables, brute force)
- 🚨 Información de negocio confidencial expuesta

**Solución URGENTE:**
```bash
# 1. Agregar a .gitignore
echo "*.db" >> .gitignore
echo "*.db.backup-*" >> .gitignore

# 2. Remover del repositorio (pero mantener localmente)
git rm --cached prisma/dev.db
git rm --cached prisma/dev.db.backup-*

# 3. Commit
git add .gitignore
git commit -m "security: Remove database files from repository"

# 4. SI ESTÁ EN GITHUB/GITLAB PÚBLICO:
# - Cambiar TODAS las contraseñas de usuarios inmediatamente
# - Rotar NEXTAUTH_SECRET
# - Considerar hacer el repo privado
# - O usar git filter-branch para eliminar del historial (avanzado)
```

---

### 2. 🟠 ARCHIVOS DE UPLOADS EN GIT (ALTO)

**Archivos encontrados:**
```
public/uploads/product-images/*.jpg
public/uploads/store-images/*.jpg
public/uploads/test/*.txt
```

**Problema:**
- ⚠️ Imágenes de productos/tiendas cargadas por usuarios en Git
- ⚠️ Aumenta tamaño del repositorio innecesariamente
- ⚠️ Archivos de prueba (test/) también incluidos

**Impacto:**
- 🟡 Repositorio crece exponencialmente con cada imagen
- 🟡 Clones/pulls muy lentos
- 🟡 No es la práctica recomendada (usar CDN/S3/Blob Storage)

**Solución:**
```bash
# 1. Agregar a .gitignore
echo "public/uploads/" >> .gitignore

# 2. Remover del repositorio
git rm -r --cached public/uploads/

# 3. Mantener solo .gitkeep para la estructura
mkdir -p public/uploads
touch public/uploads/.gitkeep
git add public/uploads/.gitkeep

# 4. Commit
git commit -m "chore: Move uploads to .gitignore, use cloud storage"
```

**Recomendación:**
- Migrar a Vercel Blob Storage (ya tienes el código en `lib/storage/`)
- O usar S3, Cloudinary, etc.
- Mantener `/uploads` solo localmente

---

### 3. 🟢 .gitignore ACTUAL - ANÁLISIS

**Estado actual de tu .gitignore:**

```gitignore
✅ BIEN configurado:
- .env* (todas las variables de entorno)
- .env*.local (específicamente)
- *.pem (certificados)
- node_modules/
- .next/, /out/, /build/
- .vercel/
- *.tsbuildinfo
- .DS_Store

❌ FALTA agregar:
- *.db (bases de datos SQLite)
- *.db-* (backups de bases de datos)
- *.sqlite, *.sqlite3
- public/uploads/ (archivos subidos por usuarios)
- /uploads/ (si existe en raíz)
- *.log (archivos de log)
- .vscode/ (configuración personal del editor)
- .idea/ (configuración de IDEs)

⚠️ REVISAR:
- cookies.txt (ya está, OK)
- verify-maria-deleted.js (ya está, OK)
```

---

## ✅ .gitignore RECOMENDADO COMPLETO

```gitignore
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*
!.env.example

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

/lib/generated/prisma

# temporary files
cookies.txt
verify-maria-deleted.js

# test files (keep next-env.d.ts for TypeScript)
.env*.local

# ============================================
# 🔴 ARCHIVOS SENSIBLES (AGREGADOS)
# ============================================

# Bases de datos
*.db
*.db-*
*.db.backup-*
*.sqlite
*.sqlite3
*.sqlite-journal
/prisma/*.db*

# Uploads de usuarios
/public/uploads/*
!/public/uploads/.gitkeep
/uploads/

# Logs
*.log
logs/
*.log.*

# IDEs y editores
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
.idea/
*.swp
*.swo
*~

# Sistema operativo
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Backups
*.bak
*.backup
*.tmp
*.temp

# Archivos de sesión
.session
sessions/

# Certificados y claves
*.key
*.cert
*.crt
*.p12
*.pfx

# Datos sensibles
credentials.json
secrets.json
service-account.json
```

---

## 🚨 PLAN DE ACCIÓN URGENTE

### Paso 1: INMEDIATO (AHORA)
```bash
# 1. Actualizar .gitignore
cat >> .gitignore << 'EOF'

# ============================================
# ARCHIVOS SENSIBLES
# ============================================

# Bases de datos
*.db
*.db-*
*.db.backup-*
*.sqlite
*.sqlite3
/prisma/*.db*

# Uploads de usuarios
/public/uploads/*
!/public/uploads/.gitkeep

# IDEs
.vscode/
.idea/

# Logs
*.log
logs/
EOF

# 2. Remover archivos sensibles del repositorio
git rm --cached prisma/dev.db
git rm --cached prisma/dev.db.backup-*
git rm -r --cached public/uploads/

# 3. Crear .gitkeep para estructura
mkdir -p public/uploads
touch public/uploads/.gitkeep

# 4. Commit
git add .gitignore public/uploads/.gitkeep
git commit -m "security: Remove sensitive files from repository

- Remove database files (*.db)
- Remove uploaded files (public/uploads/)
- Update .gitignore with security best practices
- Keep directory structure with .gitkeep"

# 5. Push
git push
```

### Paso 2: SI EL REPOSITORIO ES PÚBLICO
```bash
# CRÍTICO: Si el repo es público en GitHub/GitLab

# 1. Cambiar TODAS las contraseñas de usuarios
# 2. Rotar NEXTAUTH_SECRET
# 3. Considerar hacer el repo privado
# 4. O limpiar historial con git filter-branch (avanzado)

# Para limpiar historial (CUIDADO - solo si es necesario):
# git filter-branch --force --index-filter \
#   "git rm --cached --ignore-unmatch prisma/dev.db" \
#   --prune-empty --tag-name-filter cat -- --all
```

### Paso 3: Verificar
```bash
# Verificar que los archivos ya no están trackeados
git ls-files | grep -E "\.(db|sqlite)"
# Output debe estar vacío

git ls-files | grep "public/uploads"
# Output debe mostrar solo .gitkeep

# Verificar que .gitignore funciona
git check-ignore -v prisma/dev.db
# Output: .gitignore:XX:*.db    prisma/dev.db
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

- [ ] Actualizar .gitignore con todos los archivos sensibles
- [ ] Remover `prisma/dev.db` del repositorio
- [ ] Remover backups `prisma/dev.db.backup-*`
- [ ] Remover `public/uploads/` del repositorio
- [ ] Crear `public/uploads/.gitkeep`
- [ ] Commit y push cambios
- [ ] **SI REPO ES PÚBLICO:** Cambiar contraseñas de usuarios
- [ ] **SI REPO ES PÚBLICO:** Rotar NEXTAUTH_SECRET
- [ ] Verificar que archivos sensibles ya no están trackeados
- [ ] Considerar migrar uploads a Vercel Blob Storage
- [ ] Documentar en README que se necesita crear `dev.db` localmente

---

## 🎯 BUENAS PRÁCTICAS PARA EL FUTURO

### 1. Nunca Commitear:
- ❌ Bases de datos (.db, .sqlite)
- ❌ Variables de entorno (.env, .env.local)
- ❌ Archivos subidos por usuarios
- ❌ Certificados y claves privadas
- ❌ Logs con información sensible
- ❌ Backups de bases de datos

### 2. Siempre Commitear:
- ✅ .env.example (plantilla SIN valores)
- ✅ Migraciones de Prisma
- ✅ Schema de Prisma
- ✅ Scripts de seed (sin contraseñas reales)
- ✅ Estructura de directorios (.gitkeep)

### 3. Para Desarrollo:
- Usar `dev.db` localmente (en .gitignore)
- Seed data con contraseñas desde env vars
- Migraciones en `prisma/migrations/`
- README con instrucciones de setup

### 4. Para Producción:
- Base de datos en servidor (PostgreSQL)
- Uploads en cloud storage (Vercel Blob, S3)
- Secrets en Vercel Environment Variables
- Backups automáticos (no en Git)

---

## 📊 EVALUACIÓN DE RIESGO

| Archivo | Sensibilidad | En Git | Riesgo | Acción |
|---------|--------------|--------|--------|--------|
| prisma/dev.db | 🔴 CRÍTICA | ✅ SÍ | 🔴 ALTO | REMOVER URGENTE |
| prisma/*.backup | 🔴 CRÍTICA | ✅ SÍ | 🔴 ALTO | REMOVER URGENTE |
| public/uploads/ | 🟡 MEDIA | ✅ SÍ | 🟡 MEDIO | REMOVER |
| .env.local | 🔴 CRÍTICA | ❌ NO | ✅ OK | Mantener ignorado |
| .env.example | ✅ SEGURO | ✅ SÍ | ✅ OK | Mantener |

---

## 🔍 VERIFICACIÓN FINAL

Después de aplicar los cambios, ejecuta:

```bash
# 1. Ver qué archivos sensibles están en el repo
git ls-files | grep -E "\.(db|sqlite|env\.local|uploads)"

# 2. Ver el tamaño del repositorio
du -sh .git

# 3. Verificar .gitignore
git check-ignore -v prisma/dev.db public/uploads/test.jpg

# 4. Ver últimos commits
git log --oneline -5

# 5. Verificar estado limpio
git status
```

---

**RESUMEN:**
- 🔴 **URGENTE:** Base de datos completa está en Git (datos sensibles expuestos)
- 🟡 **IMPORTANTE:** Archivos de uploads aumentan tamaño del repo
- ✅ **ACCIÓN:** Actualizar .gitignore y remover archivos sensibles
- ⚠️ **SI PÚBLICO:** Rotar todas las credenciales inmediatamente

**Prioridad:** 🚨 MÁXIMA - Resolver HOY
