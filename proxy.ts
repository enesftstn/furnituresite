import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Skip admin routes - they handle their own auth with sessionStorage
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return response
  }

  // Handle Supabase auth for non-admin routes
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
    await supabase.auth.getUser()
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
