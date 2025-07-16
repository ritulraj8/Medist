import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// List of protected paths
const protectedPaths = ['/mainpage'];

// List of authentication paths (to prevent redirect loops)
const authPaths = ['/loginpage', '/signup'];

export async function middleware(request) {
  // Get the path from the request
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API and Next.js internal routes
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') ||
    pathname.includes('.') // Skip for static files
  ) {
    return NextResponse.next();
  }

  console.log('🔥 Middleware checking path:', pathname);
  
  // Check if this is a protected path
  const isProtectedPath = protectedPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // If it's not a protected path, allow the request to continue
  if (!isProtectedPath) {
    return NextResponse.next();
  }
  
  try {
    // Get the NextAuth.js token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    console.log('🎫 Auth check for:', pathname, 'Token exists:', !!token);
    
    // If no token found, redirect to login
    if (!token) {
      console.log('❌ No authentication token found - redirecting to login');
      
      // Store the current URL to redirect back after login
      const loginUrl = new URL('/loginpage', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      
      return NextResponse.redirect(loginUrl);
    }
    
    // User is authenticated, allow access
    console.log('✅ Auth successful - allowing access to:', pathname);
    return NextResponse.next();
    
  } catch (error) {
    console.error('🚨 Error in middleware:', error);
    // In case of any error, redirect to login
    return NextResponse.redirect(new URL('/loginpage', request.url));
  }
}

// Configure which paths middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};