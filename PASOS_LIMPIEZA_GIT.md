# 🧹 Pasos para Limpiar el Historial de Git

**Fecha:** 2025-10-24
**Estado:** Listo para ejecutar

---

## 📊 ANÁLISIS ACTUAL

### Archivos sensibles encontrados en el historial:
```
✅ prisma/dev.db (en 5 commits)
✅ prisma/dev.db.backup-20251007-141843 (en 2 commits)
✅ prisma/dev.db.backup-20251007-231207 (en 2 commits)
✅ components/menu/product-modal.tsx.backup
✅ prisma/schema.prisma.backup
```

### Tamaño actual del repositorio:
```
11M (.git directory)
```

### Commits afectados:
```
181197d - 🔒 CRÍTICO: Remove sensitive files from repository
c9986b5 - feat: Mejoras de UI en modales y checkout
53a57e5 - feat: Sistema listo para producción con todas las mejoras críticas
b71c8b7 - feat: Mejoras en UI del modal de ubicación y optimización del sistema
1f30f83 - feat: Sistema SaaS completo con seguridad empresarial
```

---

## ⚠️ IMPORTANTE: Lee esto antes de continuar

Esta operación va a:
- ✅ Crear un backup automático
- ✅ Reescribir TODO el historial de Git
- ✅ Remover los archivos sensibles de TODOS los commits
- ⚠️ Requerir un FORCE PUSH a GitHub
- ⚠️ Los colaboradores necesitarán re-clonar el repo

**NO SE PUEDE DESHACER FÁCILMENTE**

---

## 🚀 EJECUTA ESTOS COMANDOS EN ORDEN

### Paso 1: Crear Backup (OBLIGATORIO)
```bash
cd /home/frikilancer
cp -r multt multt-backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup creado"
cd multt
```

### Paso 2: Verificar que no hay cambios sin commitear
```bash
git status
# Si hay cambios, hacer commit primero
```

### Paso 3: Limpiar el historial con git filter-branch
```bash
# Esto tomará unos segundos
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch prisma/dev.db prisma/dev.db.backup-* prisma/*.db prisma/*.backup *.backup components/**/*.backup' \
  --prune-empty --tag-name-filter cat -- --all
```

### Paso 4: Limpiar referencias y hacer garbage collection
```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Paso 5: Verificar que el historial está limpio
```bash
# Este comando NO debe mostrar nada
git log --all --pretty=format: --name-only | grep -E '\.(db|backup)$'

# Verificar nuevo tamaño
du -sh .git
```

### Paso 6: Force push a GitHub
```bash
# ADVERTENCIA: Esto reescribe el historial en GitHub
git push origin --force --all
git push origin --force --tags
```

---

## ✅ VERIFICACIÓN FINAL

Después del push, verifica en GitHub:
1. Ve a: https://github.com/edgarmtz-git/multt/commits/main
2. Abre algunos commits antiguos
3. Verifica que `prisma/dev.db` YA NO aparece

---

## 🔐 SIGUIENTE PASO CRÍTICO

Como los archivos estuvieron expuestos, debes:

### 1. Rotar NEXTAUTH_SECRET en Vercel
```bash
# Generar nuevo secret
openssl rand -base64 32

# Ir a Vercel:
# Settings → Environment Variables → NEXTAUTH_SECRET → Edit
# Pegar el nuevo valor
# Redeploy
```

### 2. Cambiar contraseñas de usuarios
```bash
# Opción A: Usar script
pnpm tsx scripts/reset-password.ts admin@sistema.com nueva_contraseña_segura

# Opción B: Eliminar usuarios antiguos y crear nuevos
pnpm db:reset
pnpm db:seed
```

---

## 📝 NOTAS

- El backup está en: `/home/frikilancer/multt-backup-YYYYMMDD-HHMMSS`
- Si algo sale mal, puedes restaurar desde el backup
- El tamaño del repositorio debería reducirse significativamente
- Todos los commits mantendrán sus mensajes y autores

---

## 🆘 Si algo sale mal

```bash
# Restaurar desde backup
cd /home/frikilancer
rm -rf multt
mv multt-backup-YYYYMMDD-HHMMSS multt
cd multt
```

---

**¿Listo para ejecutar?** Copia y pega cada comando en tu terminal, uno por uno.
