import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake here can make it very
  // hard to debug session issues in production.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes: redirect unauthenticated users to homepage
  const pathname = request.nextUrl.pathname;
  const protectedPaths = [
    '/dashboard',
    '/blueprint',
    '/checkin',
    '/pulse',
    '/streaks',
    '/share',
    '/settings',
    '/invite',
  ];

  const isProtectedRoute = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login (they're already signed in)
  const loginOnlyPaths = ['/login'];
  const isLoginRoute = loginOnlyPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // FIX 1: Prevent completed users from re-entering onboarding and overwriting their blueprint.
  // This covers /welcome, /assessment, /generating, and /blueprint-reveal.
  // Non-completed users CAN still access /welcome so the dashboard CTA works correctly.
  const onboardingPaths = ['/welcome', '/assessment', '/generating', '/blueprint-reveal'];
  const isOnboardingRoute = onboardingPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  if (isOnboardingRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    if (profile?.onboarding_completed === true) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
