import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Proteksi route admin (kecuali halaman login)
  // TODO: Aktifkan kembali setelah Supabase auth terhubung
  // if (pathname.startsWith('/admin/dashboard') && !user) {
  //   return NextResponse.redirect(new URL('/admin/login', request.url))
  // }

  // Proteksi checkout & history
  if ((pathname.startsWith('/checkout') || pathname.startsWith('/history')) && !user) {
    return NextResponse.redirect(new URL('/?login=required', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/checkout/:path*',
    '/history/:path*',
  ],
}