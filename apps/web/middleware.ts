import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isDemoSite(request: NextRequest): boolean {
  const host = request.headers.get('host') || '';
  const isDemo = process.env.NEXT_PUBLIC_DEMO_ONLY === 'true';
  
  // Never treat localhost as a demo site
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    return false;
  }
  
  return isDemo || host.includes('demo.') || host.includes('demo-');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (isDemoSite(request)) {
    // Allow homepage, demo page, API routes, and static assets
    if (pathname === '/' || 
        pathname.startsWith('/demo') || 
        pathname.startsWith('/api/') || 
        pathname.startsWith('/_next/') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.')) {
      return NextResponse.next();
    }
    
    // Block access to main game routes except with demo parameter
    if (pathname === '/game') {
      const searchParams = request.nextUrl.searchParams;
      const isDemoParam = searchParams.get('demo') === 'true';
      
      if (!isDemoParam) {
        // Redirect /game to /demo on demo sites
        const url = request.nextUrl.clone();
        url.pathname = '/demo';
        return NextResponse.redirect(url);
      }
    }
    
    // Block other game routes on demo sites
    if (pathname.startsWith('/forbes') || 
        pathname.startsWith('/battle') || 
        pathname.startsWith('/trade')) {
      const url = request.nextUrl.clone();
      url.pathname = '/demo';
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
