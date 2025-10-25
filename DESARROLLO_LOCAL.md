# 🛠️ Guía de Desarrollo Local

Este documento explica cómo trabajar en local **sin afectar** la base de datos de producción en Vercel.

## 📋 Resumen

- **Local (desarrollo):** SQLite (`prisma/dev.db`)
- **Vercel (producción):** PostgreSQL (configurado en Vercel)
- **Son completamente independientes** - los cambios en local NO afectan producción

## 🚀 Configuración Inicial (Primera vez)

### Opción 1: Automática (Recomendada)

```bash
pnpm run dev:setup
```

Este comando:
1. Crea el archivo `.env` con SQLite
2. Genera el Prisma Client para SQLite
3. Crea la base de datos local
4. Siembra datos de prueba

### Opción 2: Manual

1. Crea un archivo `.env` en la raíz del proyecto:

```bash
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="5KSP8LszSi3F+MaSpCEsO90nRq4B7hW5OfGh21xiqQc="
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
```

2. Genera Prisma Client y crea la base de datos:

```bash
DATABASE_URL="file:./prisma/dev.db" pnpm db:generate
DATABASE_URL="file:./prisma/dev.db" pnpm db:push
DATABASE_URL="file:./prisma/dev.db" pnpm db:seed
```

## 💻 Uso Diario

### Iniciar el servidor de desarrollo

```bash
pnpm dev
```

El comando `pnpm dev` automáticamente usa SQLite en local. No necesitas hacer nada más.

### Credenciales de prueba

**Restaurante:**
- Email: `restaurante@lacasadelsabor.com`
- Password: `restaurante123`
- Dashboard: http://localhost:3000/dashboard

**Admin:**
- Email: `admin@sistema.com`
- Password: `admin123`
- Panel: http://localhost:3000/admin

## 🔄 Git y Despliegue

### ¿Qué se sube a Git?

✅ **SÍ se sube:**
- `prisma/schema.prisma` (con `provider = "postgresql"`)
- `package.json`
- Código fuente

❌ **NO se sube (en `.gitignore`):**
- `.env` (tu configuración local)
- `prisma/dev.db` (tu base de datos local)
- `.env.local`
- Cualquier archivo `*.db`

### Al hacer git push

1. **Tu local:** Sigue usando SQLite
2. **GitHub:** Recibe el código con `prisma/schema.prisma` configurado para PostgreSQL
3. **Vercel:** Hace build usando su propia `DATABASE_URL` (PostgreSQL)

**✨ Resultado:** Tu base de datos local NO afecta producción.

## 🗄️ Base de Datos

### Resetear base de datos local

```bash
rm prisma/dev.db
pnpm run dev:setup
```

### Ver la base de datos

```bash
pnpm db:studio
```

Esto abre Prisma Studio en http://localhost:5555

### Aplicar cambios en el schema

Si modificas `prisma/schema.prisma`:

```bash
DATABASE_URL="file:./prisma/dev.db" pnpm db:push
```

## ⚠️ Importante

### NO modifiques en `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  # ⚠️ Déjalo como postgresql
  url      = env("DATABASE_URL")
}
```

Aunque uses SQLite en local, el schema debe quedar como `"postgresql"` para que Vercel funcione correctamente.

### Cómo funciona la "magia"

1. `prisma/schema.prisma` dice `provider = "postgresql"` (para Vercel)
2. Tu archivo `.env` dice `DATABASE_URL="file:./prisma/dev.db"` (SQLite)
3. El comando `pnpm dev` en `package.json` fuerza el uso de SQLite
4. Prisma detecta automáticamente que es SQLite por el prefijo `file:`

## 🐛 Troubleshooting

### Error: "the URL must start with the protocol `file:`"

Tienes una variable de entorno del sistema configurada. Solución:

```bash
# Reinicia el servidor
pnpm dev
```

El comando `dev` ya sobrescribe automáticamente la variable.

### Error: "Can't reach database server at localhost:5434"

Estás intentando usar PostgreSQL. Verifica que existe el archivo `.env` con:

```bash
cat .env
```

Debería mostrar `DATABASE_URL="file:./prisma/dev.db"`

### No puedo hacer login

1. Verifica que la base de datos existe:
```bash
ls -lh prisma/dev.db
```

2. Si no existe, créala:
```bash
pnpm run dev:setup
```

3. Reinicia el servidor:
```bash
# Ctrl+C para detener
pnpm dev
```

## 📚 Comandos Útiles

```bash
# Desarrollo
pnpm dev                    # Iniciar servidor (SQLite automático)
pnpm dev:turbo              # Iniciar con Turbopack (más rápido)
pnpm dev:setup              # Configurar entorno de desarrollo

# Base de datos
pnpm db:studio              # Ver base de datos en navegador
pnpm db:generate            # Regenerar Prisma Client
pnpm db:push                # Aplicar cambios del schema
pnpm db:seed                # Sembrar datos de prueba

# Testing
pnpm test                   # Ejecutar tests
pnpm test:ui                # Tests con interfaz
pnpm test:coverage          # Tests con cobertura

# Build (para probar build local)
pnpm build                  # Build de producción (usa PostgreSQL si existe)
pnpm start                  # Ejecutar build
```

## 🎯 Flujo de Trabajo Completo

```bash
# 1. Primera vez (configuración inicial)
git clone <repo>
cd multt
pnpm install
pnpm run dev:setup

# 2. Desarrollo diario
pnpm dev                    # Iniciar servidor
# ... hacer cambios en el código ...

# 3. Probar cambios
pnpm test                   # Ejecutar tests

# 4. Subir cambios
git add .
git commit -m "feat: nueva funcionalidad"
git push                    # Vercel se actualiza automáticamente

# 5. Verificar en Vercel
# Abre tu URL de Vercel y verifica que todo funciona
```

## 🔐 Seguridad

### Archivos que NUNCA debes subir a Git:

- `.env` - Configuración local
- `prisma/dev.db` - Base de datos local
- `*.log` - Logs
- `/public/uploads/*` - Archivos de usuarios

Todos están en [.gitignore](.gitignore) automáticamente.

## ❓ Preguntas Frecuentes

### ¿Por qué usar SQLite en local y PostgreSQL en producción?

- **SQLite:** Simple, sin configuración, perfecto para desarrollo
- **PostgreSQL:** Robusto, escalable, mejor para producción

### ¿Mis cambios en local afectan a Vercel?

**NO.** Son bases de datos completamente separadas:
- Tu SQLite local: `prisma/dev.db` (solo en tu computadora)
- Vercel PostgreSQL: En la nube (usa su propia `DATABASE_URL`)

### ¿Qué pasa si modifico prisma/schema.prisma?

1. **En local:** Ejecuta `DATABASE_URL="file:./prisma/dev.db" pnpm db:push`
2. **En Vercel:** Al hacer `git push`, Vercel ejecuta migraciones automáticamente

### ¿Puedo usar PostgreSQL en local también?

Sí, pero no es recomendado para desarrollo casual. SQLite es más simple.

Si quieres usar PostgreSQL local:
1. Instala PostgreSQL
2. Modifica `.env` con tu URL de PostgreSQL local
3. Ejecuta `pnpm db:push`

---

**💡 Consejo:** Si algo no funciona, intenta:

1. Borrar base de datos: `rm prisma/dev.db`
2. Regenerar todo: `pnpm run dev:setup`
3. Reiniciar servidor: `pnpm dev`
