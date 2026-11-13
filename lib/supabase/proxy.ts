import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { supabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

/**
 * Refreshes the Supabase session cookie on every request and does an optimistic
 * redirect for admin pages. Real authorisation happens in route handlers and RLS.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  if (!supabaseConfigured()) return response;

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [k, v] of Object.entries(headers ?? {})) response.headers.set(k, v);
      },
    },
  });

  // Do not run code between createServerClient and getClaims — it keeps the session in sync.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  const path = request.nextUrl.pathname;
  if (path.startsWith('/admin') && !path.startsWith('/admin/login') && !signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    const redirect = NextResponse.redirect(url);
    for (const c of response.cookies.getAll()) redirect.cookies.set(c);
    return redirect;
  }
  return response;
}
