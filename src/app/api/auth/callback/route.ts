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
        // FIX 2: Reliable new-user check via DB instead of fragile timestamp math
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        const isNewUser = !profile?.onboarding_completed;
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
