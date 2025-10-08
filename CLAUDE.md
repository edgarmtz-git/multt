# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **multi-tenant SaaS platform** for e-commerce stores built with Next.js 15. Each client gets their own customizable online store accessible via unique slugs (e.g., `/tienda/cliente-slug`). The system features role-based authentication, product management, order tracking, and delivery zone configuration.

## Tech Stack

- **Framework:** Next.js 15 with App Router and Turbopack
- **Database:** SQLite with Prisma ORM
- **Authentication:** NextAuth.js v4 with JWT strategy
- **UI:** shadcn/ui (new-york style, zinc base color) + Tailwind CSS 4
- **Maps:** OpenStreetMap (Leaflet) with optional Google Maps support
- **State:** Zustand for client-side state
- **Package Manager:** pnpm 10.12.4

## Key Commands

### Development
```bash
pnpm dev              # Start dev server with Turbopack
pnpm build            # Production build
pnpm start            # Production server
```

### Database
```bash
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes to DB (development)
pnpm db:migrate       # Create and apply migrations (production)
pnpm db:seed          # Seed database with initial data
pnpm db:studio        # Open Prisma Studio (visual DB editor)
pnpm db:reset         # Reset database (WARNING: deletes all data)
```

## Architecture

### Multi-Tenant Routing

The application supports two routing patterns:

1. **Subdomain-based (production):** `cliente.tudominio.com`
2. **Path-based (development/fallback):** `tudominio.com/tienda/cliente-slug`

**Middleware (`middleware.ts`)** handles:
- Subdomain extraction across environments (localhost, production, Vercel previews)
- Authentication enforcement for `/admin` and `/dashboard` routes
- Role-based access control (ADMIN vs CLIENT)
- Rate limiting for API routes (5 req/min for auth, 100 req/min for others)
- Security headers via `lib/security-simple.ts`
- Redirection: logged-in users visiting `/login` go to their respective dashboard

### Authentication Flow

**NextAuth.js configuration** (`lib/auth.ts`):
- Credentials provider with bcrypt password hashing
- JWT tokens with 24-hour sessions
- Role included in JWT (`ADMIN` or `CLIENT`)
- Account lockout after failed login attempts
- Last login tracking

**User roles:**
- `ADMIN`: Access to `/admin` (manages all clients, invitations, system settings)
- `CLIENT`: Access to `/dashboard` (manages their own store, products, orders)

### Database Schema

**Core models:**
- `User`: Authenticated users (ADMIN or CLIENT role) with security fields (loginAttempts, lockedUntil, isSuspended)
- `StoreSettings`: Per-client store configuration (slug, delivery settings, payment methods, branding)
- `Category`: Product categories with visibility settings
- `Product`: Products with variants, options, stock tracking, delivery preferences
- `Order`: Customer orders with status tracking
- `Invitation`: Client invitation system with unique codes and expiry
- `AuditLog`: Security event logging

**Key relationships:**
- Categories use many-to-many with Products via `CategoryProduct`
- Products support both variants (`ProductVariant`) and customizable options (`ProductOption`, `GlobalOption`)
- Delivery zones (`DeliveryZone`) are tied to `StoreSettings`

### Route Structure

```
app/
├── (root)/                 # Main landing page
├── login/                  # Unified login for ADMIN and CLIENT
├── admin/                  # Admin panel (ADMIN role only)
│   ├── clients/           # Client management
│   └── invitations/       # Invitation system
├── dashboard/             # Client dashboard (CLIENT role only)
│   ├── categories/
│   ├── products/
│   ├── orders/
│   ├── settings/
│   ├── availability/      # Real-time product/option availability
│   └── global-options/    # Reusable product options
├── tienda/[cliente]/      # Public storefront (no auth required)
├── tracking/              # Order tracking (public)
└── api/
    ├── auth/[...nextauth]/ # NextAuth endpoints
    ├── admin/             # Admin-only APIs
    ├── dashboard/         # Client-scoped APIs
    ├── store/[slug]/      # Public store data
    └── delivery/          # Delivery calculation
```

### Security Implementation

**Middleware protections:**
- `/admin` requires ADMIN role, redirects CLIENT to `/dashboard`
- `/dashboard` requires CLIENT role, redirects ADMIN to `/admin`
- `/api/*` endpoints have rate limiting (see `lib/security-simple.ts`)
- Security events logged via `lib/audit-logger.ts`

**Data isolation:**
- All client data queries filtered by `userId` from session
- Prisma cascading deletes prevent orphaned records
- Sensitive fields (passwords, secrets) never sent to client

**Important:** Never bypass authentication checks. Always use `getServerSession(authOptions)` in API routes and server components.

### Design System

Follow the standardized design system documented in `DESIGN_SYSTEM.md`:

**Typography:**
- Page titles: `text-2xl font-bold tracking-tight`
- Section titles: `text-xl font-semibold tracking-tight`
- Body text: `text-sm`
- Muted text: `text-xs text-muted-foreground`

**Components:**
- Use `lib/design-system.ts` for standardized className sets
- Prefer shadcn/ui components over custom UI
- Maintain consistent spacing with Tailwind's 4px scale

**Form patterns:**
- Use `react-hook-form` with Zod validation (`lib/validation.ts`)
- Show validation errors inline
- Disable submit buttons during submission

### Environment Variables

Required in `.env.local` (see `.env.example`):

```bash
DATABASE_URL="file:./dev.db"                    # SQLite for dev, Postgres for prod
NEXTAUTH_SECRET="generate-with-openssl-rand"    # For JWT signing
NEXTAUTH_URL="http://localhost:3000"            # App base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"     # Public-facing URL
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"        # For subdomain routing
```

Optional:
- `ADMIN_EMAIL`, `SUPPORT_EMAIL`, `COMPANY_NAME` for email notifications
- Google Maps API key for enhanced geocoding (falls back to OSM)

### Common Patterns

**Server-side data fetching:**
```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function Page() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const data = await prisma.product.findMany({
    where: { userId: session.user.id }
  })
  // ...
}
```

**API route protection:**
```typescript
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }
  // ...
}
```

**Client-side forms:**
```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema } from "@/lib/validation"

const form = useForm({
  resolver: zodResolver(productSchema),
  defaultValues: { name: "", price: 0 }
})
```

### Testing Credentials

After running `pnpm db:seed`:

**Admin:**
- Email: `admin@sistema.com`
- Password: `admin123`

**Client:**
- Email: `cliente@empresa.com`
- Password: `cliente123`

### File Upload

Product images and store branding uploaded to `/public/uploads/` via API routes using `multer` (see `app/api/dashboard/products/*/upload/`). Files served statically at `/uploads/*`.

### Geolocation & Maps

- **Default:** OpenStreetMap with Leaflet (`lib/geolocation.ts`)
- **Optional:** Google Maps for geocoding (requires API key in `.env.local`)
- Delivery zones support distance-based, zone-based, or manual pricing
- Store addresses can be set via Google Maps URL or coordinates

### Payment Configuration

Stores can enable:
- Cash on delivery with custom instructions
- Bank transfer (bank details stored in `StoreSettings`)

PayPal/Stripe integration not yet implemented but schema supports extensibility.

### Special Features

**Invitation system:**
- Admins create invitation codes with expiry dates
- Clients register via `/invite/[code]`
- Invitations track service start/renewal dates

**Global options:**
- Reusable product options (e.g., "Toppings") managed at `/dashboard/global-options`
- Can be attached to multiple products with per-product overrides

**Availability management:**
- Real-time control over product/option availability without changing stock
- Useful for temporary shortages or maintenance

### Database Migrations

When modifying `prisma/schema.prisma`:

1. **Development:** `pnpm db:push` (no migration files)
2. **Production:** `pnpm db:migrate` (creates migration in `prisma/migrations/`)

Always test schema changes locally before deploying.

### Debugging

- **Auth issues:** Check `NEXTAUTH_SECRET` is set and NextAuth logs in dev console
- **Database errors:** Run `pnpm db:studio` to inspect data directly
- **Middleware:** Add console.logs in `middleware.ts` to trace request flow
- **Scripts:** Many helper scripts in `/scripts/` for database inspection

### Known Patterns

- All timestamps use Prisma's `@default(now())` and `@updatedAt`
- Soft deletes not implemented; use `isActive` fields where needed
- Image URLs stored as strings (relative paths like `/uploads/...`)
- Prices stored as `Float` (consider `Decimal` for production)
- Currency/locale in `StoreSettings` (default: MXN, es, Mexico)

### Code Style

- Server components by default, add `"use client"` only when needed
- Use `cn()` helper from `lib/utils.ts` for conditional classes
- Prefer `async/await` over `.then()` for promises
- Use TypeScript types from Prisma Client (`import type { User } from "@prisma/client"`)
- Follow Next.js App Router conventions (no `getServerSideProps`)

### Production Considerations

- Migrate from SQLite to PostgreSQL (update `DATABASE_URL` and `datasource db.provider`)
- Set secure `NEXTAUTH_SECRET` (e.g., `openssl rand -base64 32`)
- Enable subdomain routing with wildcard DNS (`*.yourdomain.com`)
- Configure CDN for `/uploads/` or migrate to cloud storage (S3, Cloudinary)
- Set up database backups
- Review `AuditLog` retention policy
