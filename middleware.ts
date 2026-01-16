import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value)
            })
            response = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
            })
          } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
              console.error('Cookie error:', error)
            }
          }
        },
      },
    }
  )

  try {
    // Skip middleware for admin login page to prevent redirect loop
    if (request.nextUrl.pathname === '/admin/login') {
      await supabase.auth.getUser()
      return response
    }

    // Only protect /admin routes (but not /admin/login)
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const { data: { user } } = await supabase.auth.getUser()

      // Not logged in - redirect to admin login
      if (!user) {
        const redirectUrl = new URL('/admin/login', request.url)
        return NextResponse.redirect(redirectUrl)
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle()

      if (!userData?.is_admin) {
        const redirectUrl = new URL('/admin/login', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    } else {
      // For non-admin routes, just refresh the session
      await supabase.auth.getUser()
    }
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Auth error:', error)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
