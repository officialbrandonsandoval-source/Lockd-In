import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function getBaseUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') ?? 'https';
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const baseUrl = getBaseUrl(request);

  if (code) {
    // Collect cookies so we can apply them to the final response
    let pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            pendingCookies = cookiesToSet;
            // Also update the request cookies so subsequent calls (getUser) see them
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Determine where to send the user
      let redirectTo = '/welcome';

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const createdAt = new Date(user.created_at).getTime();
        const lastSignIn = new Date(user.last_sign_in_at || user.created_at).getTime();
        const isNewUser = Math.abs(lastSignIn - createdAt) < 10000; // within 10 seconds
        redirectTo = isNewUser ? '/welcome' : '/dashboard';
      }

      // Create the redirect and apply auth cookies directly
      const response = NextResponse.redirect(new URL(redirectTo, baseUrl));
      pendingCookies.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options)
      );
      return response;
    }
  }

  // No code or exchange failed — send to landing page
  return NextResponse.redirect(new URL('/', baseUrl));
}
