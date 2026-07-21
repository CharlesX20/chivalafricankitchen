import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Define protected routes - REMOVE '/cart' from this list
const protectedRoutes = ['/admin', '/orders']
const adminRoutes = ['/admin']
const authRoutes = ['/admin/login']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Get session token from cookies
  const sessionToken = request.cookies.get('chival_session')?.value

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // If no session token and trying to access protected route (NOT including cart)
  if (!sessionToken && isProtectedRoute) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If session exists, verify it
  if (sessionToken) {
    try {
      const adminClient = createAdminClient()

      // Verify session exists and is not expired
      const { data: session, error } = await adminClient
        .from('sessions')
        .select('profile_id, expires_at')
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (error || !session) {
        // Invalid or expired session - delete cookie and redirect
        const response = NextResponse.redirect(new URL('/', request.url))
        response.cookies.delete('chival_session')
        return response
      }

      // If it's an admin route, check if user is admin
      if (isAdminRoute && !isAuthRoute) {
        const { data: profile } = await adminClient
          .from('profiles')
          .select('is_admin')
          .eq('id', session.profile_id)
          .single()

        // Check if user is admin
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
        const { data: profileEmail } = await adminClient
          .from('profiles')
          .select('email')
          .eq('id', session.profile_id)
          .single()

        const isAdmin = profileEmail?.email && adminEmails.includes(profileEmail.email)

        if (!isAdmin) {
          return NextResponse.redirect(new URL('/', request.url))
        }

        // Allow access to admin routes
        return NextResponse.next()
      }

      // If user is authenticated and trying to access auth route, redirect to admin dashboard
      if (isAuthRoute && pathname === '/admin/login') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }

      // Allow access to protected routes
      return NextResponse.next()

    } catch (error) {
      console.error('Middleware auth error:', error)
      // On error, redirect to home
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('chival_session')
      return response
    }
  }

  // If no session and trying to access admin login page, allow it
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // If no session and trying to access admin routes, redirect to login
  if (isAdminRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  // Allow all other requests (including /cart)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/orders/:path*',
  ],
}