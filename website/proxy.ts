import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, isTokenExpired } from '@/lib/auth/jwt'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't need authentication
  const publicRoutes = ['/access-code', '/_next', '/api/_next']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('access-token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/access-code', request.url))
  }

  // Verify token
  const decoded = verifyToken(token)

  if (!decoded || isTokenExpired(decoded)) {
    const response = NextResponse.redirect(new URL('/access-code', request.url))
    response.cookies.delete('access-token')
    return response
  }

  // Check admin routes
  if (pathname.startsWith('/admin') && !decoded.isAdmin) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
