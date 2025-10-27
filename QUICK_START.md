# ⚡ Quick Start - Desarrollo Local

Guía rápida para empezar a trabajar en el proyecto.

## 🚀 Setup Inicial (Primera vez)

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar base de datos local
pnpm db:push

# 3. Crear datos de prueba
pnpm db:seed:clean

# 4. Iniciar desarrollo
pnpm dev
```

**Listo!** Abre `http://localhost:3000`

---

## 🔑 Credenciales de Prueba

Después de ejecutar `pnpm db:seed:clean`:

### Admin
- **URL:** `http://localhost:3000/admin`
- **Email:** `admin@multisaas.com`
- **Password:** `admin2025`

### Cliente (Dueño de tienda)
- **URL:** `http://localhost:3000/dashboard`
- **Email:** `pizzeria@lacasa.com`
- **Password:** `pizza2025`

### Tienda Pública
- **URL:** `http://localhost:3000/tienda/pizzeria-lacasa`
- Sin login necesario

---

## 💻 Comandos Más Usados

```bash
# Desarrollo
pnpm dev                    # Iniciar servidor local
pnpm dev:clean              # Limpiar cache y reiniciar

# Base de datos
pnpm db:studio              # Ver/editar datos (GUI)
pnpm db:push                # Actualizar schema
pnpm db:seed:clean          # Recrear datos de prueba

# Validación antes de push
pnpm build:check            # ✅ Ejecutar ANTES de git push
pnpm validate:types         # Solo verificar TypeScript
pnpm build                  # Solo verificar build

# Testing
pnpm test                   # Ejecutar tests
pnpm test:ui                # Tests con interfaz gráfica
```

---

## 📁 Estructura del Proyecto

```
multt/
├── app/                    # Next.js App Router
│   ├── (root)/            # Landing page
│   ├── login/             # Autenticación
│   ├── admin/             # Panel de admin
│   ├── dashboard/         # Panel de cliente
│   ├── tienda/[cliente]/  # Storefront público
│   └── api/               # API routes
├── components/            # Componentes React
├── lib/                   # Utilidades y configuración
├── prisma/                # Schema y migraciones
│   ├── schema.prisma      # Definición de BD
│   └── dev.db             # SQLite local (no en Git)
├── public/                # Assets estáticos
└── scripts/               # Scripts de utilidad
```

---

## 🔄 Flujo de Trabajo Típico

```bash
# 1. Obtener últimos cambios
git pull origin main

# 2. Iniciar desarrollo
pnpm dev

# 3. Hacer cambios en el código
# ... editar archivos ...

# 4. Probar localmente
# Abrir http://localhost:3000 y verificar

# 5. Validar antes de commit
pnpm build:check

# 6. Hacer commit y push
git add .
git commit -m "feat: descripción del cambio"
git push origin main

# ✨ Pre-push hook valida automáticamente
# ✨ Vercel despliega automáticamente si todo pasa
```

---

## ⚠️ Reglas de Oro

1. **SIEMPRE** valida localmente antes de push: `pnpm build:check`
2. **NUNCA** edites la base de datos de producción directamente
3. **SIEMPRE** usa `.env.local` para desarrollo (no se sube a Git)
4. **NUNCA** uses `git push --no-verify` (saltea validaciones)

---

## 🆘 Problemas Comunes

### "Prisma Client did not initialize"
```bash
pnpm db:generate
```

### "Port 3000 already in use"
```bash
# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9
pnpm dev
```

### Base de datos corrupta
```bash
rm prisma/dev.db
pnpm db:push
pnpm db:seed:clean
```

### Pre-push falla pero localmente funciona
```bash
# Ver detalles específicos
pnpm validate:types
pnpm validate:prisma
pnpm build
```

---

## 📚 Más Información

- **Flujo completo:** Ver `WORKFLOW.md`
- **Arquitectura:** Ver `CLAUDE.md`
- **Sistema de diseño:** Ver `DESIGN_SYSTEM.md`

---

**¿Listo para comenzar?**

```bash
pnpm dev
```

Abre `http://localhost:3000` y comienza a desarrollar! 🚀
