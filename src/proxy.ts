import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'super-secret-key-for-assignment-only';
const key = new TextEncoder().encode(secretKey);

export default async function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  // Protect /dashboard and /projects and /api/tasks, etc.
  if (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/projects')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      await jwtVerify(session, key, { algorithms: ['HS256'] });
      return NextResponse.next();
    } catch (error) {
      // Invalid token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // Redirect authenticated users away from login/signup
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
    if (session) {
      try {
        await jwtVerify(session, key, { algorithms: ['HS256'] });
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (error) {
        // Just continue to login if token is invalid
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/login', '/signup'],
};
