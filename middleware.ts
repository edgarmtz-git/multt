import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from "next-auth/jwt";
import { simpleRateLimit, applyBasicSecurityHeaders, logSecurityEvent } from '@/lib/security-simple'
import { rootDomain } from '@/lib/utils';

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Local development environment
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes('.localhost')) {
      return hostname.split('.')[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(':')[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);
  
  // Aplicar headers de seguridad a todas las respuestas
  const response = NextResponse.next();
  applyBasicSecurityHeaders(response);

  // Rate limiting básico para APIs
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || 'unknown'
    const maxRequests = pathname.includes('/auth/') ? 5 : 100
    
    if (!simpleRateLimit(ip, maxRequests)) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { path: pathname, ip })
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/', '/login', '/register', '/tienda', '/tracking/'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute && !pathname.startsWith('/admin') && !pathname.startsWith('/dashboard')) {
    return response;
  }

  // Para rutas protegidas, verificar autenticación
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    // Permitir rutas de validación sin autenticación
    if (pathname.includes('/validate-email') || pathname.includes('/validate-slug')) {
      return response;
    }

    const token = await getToken({ req: request });

    if (!token) {
      // Log intento de acceso no autorizado
      logSecurityEvent('UNAUTHORIZED_ACCESS', { path: pathname, reason: 'No token', ip: request.ip })
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Validación básica del token
    if (!token.role || !['ADMIN', 'CLIENT'].includes(token.role)) {
      logSecurityEvent('UNAUTHORIZED_ACCESS', { path: pathname, reason: 'Invalid role', role: token.role, ip: request.ip })
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verificación básica de token válido
    if (!token.id || !token.role) {
      logSecurityEvent('UNAUTHORIZED_ACCESS', { path: pathname, reason: 'Invalid token', ip: request.ip })
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verificar permisos para rutas de admin
    if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
      logSecurityEvent('UNAUTHORIZED_ACCESS', { path: pathname, reason: 'Insufficient permissions', role: token.role, ip: request.ip })
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Verificar permisos para rutas de dashboard
    if (pathname.startsWith('/dashboard') && token.role !== 'CLIENT') {
      logSecurityEvent('UNAUTHORIZED_ACCESS', { path: pathname, reason: 'Insufficient permissions', role: token.role, ip: request.ip })
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Si está en /login pero ya está autenticado, redirigir según su rol
  if (pathname === '/login') {
    const token = await getToken({ req: request });
    
    if (token && token.role && token.id) {
      // Ya está autenticado, redirigir según su rol
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (token.role === 'CLIENT') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  if (subdomain) {
    // Block access to admin and dashboard pages from subdomains
    if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Block access to auth pages from subdomains
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // For the root path on a subdomain, rewrite to the subdomain page
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/s/${subdomain}`, request.url));
    }
  }

  // On the root domain, allow normal access to all routes
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. all root files inside /public (e.g. /favicon.ico)
     */
    '/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\.[\\w-]+).*)'
  ]
};