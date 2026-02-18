import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/onboarding/welcome';

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if this is an existing user or a new signup
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check when the user was created vs last sign in
        // If created_at and last_sign_in_at are within a few seconds, it's a new user
        const createdAt = new Date(user.created_at).getTime();
        const lastSignIn = new Date(user.last_sign_in_at || user.created_at).getTime();
        const isNewUser = Math.abs(lastSignIn - createdAt) < 10000; // within 10 seconds

        if (isNewUser) {
          // New user — send to onboarding
          const redirectUrl = new URL('/onboarding/welcome', origin);
          return NextResponse.redirect(redirectUrl.toString(), {
            headers: response.headers,
          });
        } else {
          // Existing user — send to dashboard
          const redirectUrl = new URL('/app/dashboard', origin);
          return NextResponse.redirect(redirectUrl.toString(), {
            headers: response.headers,
          });
        }
      }

      // Fallback: if we can't determine, go to the default next path
      return response;
    }
  }

  // If there's no code or an error occurred, redirect to login with error
  const redirectUrl = new URL('/login', origin);
  redirectUrl.searchParams.set('error', 'auth_callback_error');
  return NextResponse.redirect(redirectUrl.toString());
}
