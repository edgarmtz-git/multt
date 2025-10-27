# 🚀 Flujo de Trabajo - Desarrollo Seguro

Esta guía describe el flujo de trabajo optimizado para desarrollar localmente y desplegar a producción sin riesgos.

## 📋 Índice

1. [Configuración Inicial](#configuración-inicial)
2. [Desarrollo Local](#desarrollo-local)
3. [Validación Pre-Push](#validación-pre-push)
4. [Despliegue a Producción](#despliegue-a-producción)
5. [Comandos Disponibles](#comandos-disponibles)
6. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Configuración Inicial

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd multt
pnpm install
```

### 2. Configurar variables de entorno locales

El archivo `.env.local` ya está configurado para desarrollo local con SQLite:

```bash
# Ya configurado automáticamente
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="dev-secret-local-only-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
```

**⚠️ IMPORTANTE:**
- `.env.local` NO se sube a Git (está en `.gitignore`)
- Usa SQLite localmente, NO afecta la base de datos de producción
- La base de datos de producción está en Neon PostgreSQL (configurada en Vercel)

### 3. Inicializar base de datos local

```bash
# Generar cliente Prisma
pnpm db:generate

# Aplicar schema a base de datos local
pnpm db:push

# Llenar con datos de prueba
pnpm db:seed:clean
```

Esto crea en tu base de datos LOCAL:
- Admin: `admin@multisaas.com` / `admin2025`
- Cliente: `pizzeria@lacasa.com` / `pizza2025`
- Tienda: `pizzeria-lacasa`

---

## 💻 Desarrollo Local

### Iniciar servidor de desarrollo

```bash
# Modo turbopack (más rápido)
pnpm dev

# Modo webpack tradicional
pnpm dev:webpack

# Limpiar cache y reiniciar
pnpm dev:clean
```

El servidor se ejecuta en `http://localhost:3000`

### Rutas disponibles en desarrollo

- **Landing:** `http://localhost:3000`
- **Login:** `http://localhost:3000/login`
- **Admin:** `http://localhost:3000/admin` (admin@multisaas.com)
- **Dashboard:** `http://localhost:3000/dashboard` (pizzeria@lacasa.com)
- **Tienda:** `http://localhost:3000/tienda/pizzeria-lacasa`

### Trabajar con la base de datos

```bash
# Ver datos en interfaz gráfica
pnpm db:studio

# Actualizar schema (desarrollo)
pnpm db:push

# Crear migración (producción)
pnpm db:migrate

# Resetear BD local completamente
pnpm db:reset
```

**💡 Tip:** Usa `pnpm db:studio` para inspeccionar y editar datos visualmente.

---

## ✅ Validación Pre-Push

### Sistema automático (Git Hook)

Cuando hagas `git push`, **automáticamente** se ejecutan estas validaciones:

1. ✅ **TypeScript** - Verifica que no haya errores de tipos
2. ✅ **Prisma** - Valida el schema y genera el cliente
3. ✅ **Build** - Compila la aplicación Next.js
4. ✅ **Variables de entorno** - Verifica configuración de producción

**Si alguna falla, el push se bloquea automáticamente.**

### Validación manual (antes de push)

Puedes ejecutar las validaciones manualmente:

```bash
# Ejecutar TODAS las validaciones
pnpm build:check

# O individualmente:
pnpm validate:types        # Solo TypeScript
pnpm validate:prisma       # Solo Prisma
pnpm validate:env          # Solo variables de entorno
pnpm build                 # Solo build de Next.js
```

### Ejemplo de flujo completo

```bash
# 1. Desarrollar localmente
pnpm dev

# 2. Hacer cambios en el código
# ... editar archivos ...

# 3. Probar localmente
# ... verificar que funciona en http://localhost:3000 ...

# 4. Validar antes de commit (opcional)
pnpm build:check

# 5. Commit
git add .
git commit -m "feat: nueva funcionalidad"

# 6. Push (validación automática)
git push origin main
# ⚡ Se ejecuta pre-push hook automáticamente
# ✅ Si pasa, se sube a GitHub y despliega en Vercel
# ❌ Si falla, el push se bloquea y debes corregir
```

---

## 🚀 Despliegue a Producción

### Flujo automático (recomendado)

1. Desarrolla localmente
2. Valida con `pnpm build:check`
3. Haz commit y push
4. **Vercel detecta el push automáticamente**
5. Ejecuta build en la nube
6. Despliega si todo pasa

### Variables de entorno en producción

Las variables de producción están configuradas en Vercel Dashboard:

```bash
# Ver variables en Vercel
vercel env ls

# Agregar nueva variable
vercel env add NOMBRE_VARIABLE production

# Descargar variables localmente (para debugging)
vercel env pull .env.vercel
```

**⚠️ NUNCA** edites las variables de producción directamente en Vercel sin verificar localmente primero.

### Base de datos de producción

- **Proveedor:** Neon PostgreSQL (serverless)
- **Conexión:** Configurada en `DATABASE_URL` en Vercel
- **Migraciones:** Se aplican automáticamente en deploy

```bash
# Ver estado de la BD de producción
DATABASE_URL="postgresql://..." pnpm prisma db pull

# Aplicar migraciones manualmente (si es necesario)
DATABASE_URL="postgresql://..." pnpm db:migrate:deploy
```

---

## 📦 Comandos Disponibles

### Desarrollo

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia servidor con Turbopack |
| `pnpm dev:webpack` | Inicia servidor con Webpack |
| `pnpm dev:clean` | Limpia cache y reinicia |
| `pnpm dev:setup` | Script de setup inicial |

### Base de Datos

| Comando | Descripción |
|---------|-------------|
| `pnpm db:generate` | Genera cliente Prisma |
| `pnpm db:push` | Sincroniza schema (dev) |
| `pnpm db:migrate` | Crea migración (prod) |
| `pnpm db:seed` | Seed completo |
| `pnpm db:seed:clean` | Seed simplificado |
| `pnpm db:studio` | Interfaz gráfica BD |
| `pnpm db:reset` | Resetea BD local |

### Validación

| Comando | Descripción |
|---------|-------------|
| `pnpm build:check` | **Validación completa pre-push** |
| `pnpm validate:types` | Solo TypeScript |
| `pnpm validate:prisma` | Solo Prisma |
| `pnpm validate:env` | Solo variables de entorno |
| `pnpm build` | Build completo |

### Testing

| Comando | Descripción |
|---------|-------------|
| `pnpm test` | Ejecuta tests en modo watch |
| `pnpm test:run` | Ejecuta tests una vez |
| `pnpm test:ui` | Interfaz gráfica de tests |
| `pnpm test:coverage` | Tests con coverage |

### Producción

| Comando | Descripción |
|---------|-------------|
| `pnpm start` | Servidor de producción |
| `pnpm verify:production` | Verifica config de producción |

---

## 🔧 Solución de Problemas

### Error: "Environment variable not found: DATABASE_URL"

**Causa:** No tienes `.env.local` configurado

**Solución:**
```bash
cp .env.example .env.local
# Editar .env.local con tus valores
```

### Error: "Prisma Client did not initialize yet"

**Causa:** Cliente de Prisma no está generado

**Solución:**
```bash
pnpm db:generate
```

### Error: "Pre-push validation failed"

**Causa:** Hay errores de TypeScript, Prisma o Build

**Solución:**
```bash
# Ver detalles específicos
pnpm validate:types   # Ver errores de tipos
pnpm validate:prisma  # Ver errores de schema
pnpm build            # Ver errores de build
```

### La base de datos local está corrupta

**Solución:**
```bash
# Resetear completamente
rm prisma/dev.db
pnpm db:push
pnpm db:seed:clean
```

### El push se bloquea pero localmente todo funciona

**Causa:** Las validaciones de producción son más estrictas

**Solución:**
```bash
# Ejecutar validación completa localmente
pnpm build:check

# Ver qué está fallando específicamente
pnpm validate:env
```

### Quiero saltarme las validaciones (NO RECOMENDADO)

**Solo en casos extremos:**
```bash
git push --no-verify
```

**⚠️ ADVERTENCIA:** Esto puede romper producción. Úsalo solo si sabes lo que haces.

---

## 🎯 Mejores Prácticas

### ✅ DO (Hacer)

1. **Siempre** desarrolla localmente primero
2. **Siempre** prueba en `http://localhost:3000` antes de push
3. **Siempre** ejecuta `pnpm build:check` antes de push importante
4. Usa `pnpm db:studio` para inspeccionar datos
5. Haz commits pequeños y frecuentes
6. Escribe mensajes de commit descriptivos

### ❌ DON'T (No hacer)

1. **NUNCA** edites variables de producción sin probar localmente
2. **NUNCA** hagas push sin validar localmente
3. **NUNCA** uses `--no-verify` a menos que sea absolutamente necesario
4. **NUNCA** conectes tu desarrollo local a la BD de producción
5. **NUNCA** subas `.env.local` a Git
6. **NUNCA** uses `pnpm db:reset` con la BD de producción

---

## 📚 Recursos Adicionales

- **Documentación del proyecto:** `CLAUDE.md`
- **Sistema de diseño:** `DESIGN_SYSTEM.md`
- **Variables de entorno:** `.env.example`
- **Schema de BD:** `prisma/schema.prisma`
- **Configuración de Next.js:** `next.config.ts`

---

## 🆘 Obtener Ayuda

Si encuentras problemas:

1. Revisa esta guía primero
2. Verifica los logs: `pnpm dev` (desarrollo) o `vercel logs` (producción)
3. Inspecciona la BD: `pnpm db:studio`
4. Ejecuta validaciones: `pnpm build:check`
5. Revisa la documentación en `CLAUDE.md`

---

**¡Feliz desarrollo! 🎉**
