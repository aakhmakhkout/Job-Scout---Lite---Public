import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminAuth/session';

const PROTECTED_PREFIXES = ['/dashboard', '/jobs', '/internships', '/applications', '/interviews', '/profile'];
const AUTH_PAGES = ['/login', '/signup', '/reset-password'];
const ADMIN_LOGIN_PAGE = '/admin/login';
const ADMIN_LOGIN_API = '/api/admin/login';
const ADMIN_LOGOUT_API = '/api/admin/logout';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Admin routes are gated entirely separately from everything below —
  // different cookie (ADMIN_SESSION_COOKIE, not Supabase's), different
  // signing mechanism (HMAC via session.js, not a Supabase session),
  // zero overlap with PROTECTED_PREFIXES/AUTH_PAGES. A bug in one auth
  // system should never be able to grant access through the other.
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    return handleAdminRouting(request, pathname);
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // Refreshing the session here (rather than only in Server Components)
  // is what keeps auth working on Vercel's free tier without a paid
  // "Edge Config" or extra infra — it's just cookie read/write per request.
  //
  // Wrapped in try/catch: if Supabase itself is unreachable (a transient
  // network blip, since this runs on every single request site-wide) we
  // fail closed — treat the request as unauthenticated rather than
  // crashing the whole app. Worst case someone gets bounced to /login and
  // can retry; the alternative (an unhandled exception here) would take
  // down every page, not just the protected ones.
  let user = null;
  try {
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    user = fetchedUser;
  } catch (err) {
    console.error('middleware: failed to fetch Supabase session', err);
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (!user && isProtected) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

// Handles both admin pages (/admin/*) and admin API routes
// (/api/admin/*) with one shared check: is there a valid, unexpired
// HMAC-signed admin session cookie? Pages redirect to /admin/login on
// failure; API routes get a clean 401 JSON response instead, since a
// redirect makes no sense for a fetch() call.
async function handleAdminRouting(request, pathname) {
  const isLoginPage = pathname === ADMIN_LOGIN_PAGE;
  const isLoginOrLogoutApi = pathname === ADMIN_LOGIN_API || pathname === ADMIN_LOGOUT_API;
  const isApiRoute = pathname.startsWith('/api/admin');

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(token, process.env.ADMIN_SESSION_SECRET);

  if (!session && !isLoginPage && !isLoginOrLogoutApi) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Not authenticated as admin' }, { status: 401 });
    }
    return NextResponse.redirect(new URL(ADMIN_LOGIN_PAGE, request.url));
  }

  // Already logged in and hitting the login page itself — bounce
  // straight to the dashboard instead of showing the form again.
  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next({ request: { headers: request.headers } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/jobs/cache).*)',
  ],
};
