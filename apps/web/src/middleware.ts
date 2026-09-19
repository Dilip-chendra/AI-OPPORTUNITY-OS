import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/', '/login', '/signup', '/pricing']
const authRoutes = ['/login', '/signup']
const onboardingRoute = '/onboard'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const rawToken = request.cookies.get('access_token')?.value || 
    request.headers.get('authorization')?.replace('Bearer ', '')
  const token = (rawToken && rawToken !== 'undefined' && rawToken !== 'null' && rawToken.trim() !== '') ? rawToken : null
  
  const isPublic = publicRoutes.some(r => pathname === r)
  const isAuth = authRoutes.some(r => pathname.startsWith(r))
  const isApp = pathname.startsWith('/overview') || pathname.startsWith('/radar') || 
    pathname.startsWith('/explore') || pathname.startsWith('/for-you') ||
    pathname.startsWith('/funding') || pathname.startsWith('/government') ||
    pathname.startsWith('/corporate') || pathname.startsWith('/global') ||
    pathname.startsWith('/partnerships') || pathname.startsWith('/innovation') ||
    pathname.startsWith('/research') || pathname.startsWith('/saved') ||
    pathname.startsWith('/applications') || pathname.startsWith('/workspace') ||
    pathname.startsWith('/ai-analyst') || pathname.startsWith('/business-dna') ||
    pathname.startsWith('/alerts') || pathname.startsWith('/analytics') ||
    pathname.startsWith('/whitespace') || pathname.startsWith('/settings')
  
  if (isApp && !token) {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.delete('access_token')
    return res
  }
  
  if (isAuth && token) {
    return NextResponse.redirect(new URL('/overview', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
