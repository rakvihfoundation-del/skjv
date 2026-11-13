import 'server-only';
import { NextResponse } from 'next/server';
import { getAdmin } from './auth';
import { SupabaseNotConfiguredError } from './supabase/env';
import type { AdminUser } from './types';

export const ok = <T extends object>(data: T, init?: ResponseInit) => NextResponse.json(data, init);
export const fail = (error: string, status = 400, extra: Record<string, unknown> = {}) =>
  NextResponse.json({ error, ...extra }, { status });

/** Reads a JSON body; returns {} for an empty or invalid body. */
export async function body(req: Request): Promise<Record<string, unknown>> {
  try {
    const b: unknown = await req.json();
    return b && typeof b === 'object' && !Array.isArray(b) ? (b as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** String field from a JSON body ('' when missing). */
export const str = (v: unknown): string => (v == null ? '' : String(v));

/** Turns any thrown error into a JSON error response. */
export function handleError(e: unknown): NextResponse {
  if (e instanceof SupabaseNotConfiguredError) return fail(e.message, 503);
  const message = e instanceof Error ? e.message : 'Server error';
  console.error(e);
  return fail(message || 'Server error', 500);
}

type RouteContext<P> = { params: Promise<P> };

/** Wraps an admin-only route handler: checks the Supabase session and the admins table. */
export function adminRoute<P = Record<string, string>>(
  handler: (req: Request, ctx: RouteContext<P>, admin: AdminUser) => Promise<Response>,
) {
  return async (req: Request, ctx: RouteContext<P>): Promise<Response> => {
    try {
      const admin = await getAdmin();
      if (!admin) return fail('Unauthorised', 401);
      return await handler(req, ctx, admin);
    } catch (e) {
      return handleError(e);
    }
  };
}

/** Wraps a public route handler with consistent error handling. */
export function publicRoute<P = Record<string, string>>(handler: (req: Request, ctx: RouteContext<P>) => Promise<Response>) {
  return async (req: Request, ctx: RouteContext<P>): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      return handleError(e);
    }
  };
}
