import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { AccountError } from "../account-memory";

export const authCookieName = "leela-auth";
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 90,
};

export function hasSupabaseConfiguration() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
}

function configuration() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new AccountError("Account storage is not connected yet. Please try again after Leela’s Supabase setup is complete.", 503);
  }
  return { url, key };
}

/**
 * Route handlers ONLY: they can persist renewed cookies.
 * The browser never uses a Supabase client or receives tokens in JSON.
 * Static pages remain public; /api/auth restores and renews sessions on reopen.
 * All callers must return the private/no-store headers from account-http.ts.
 */
export async function createSupabaseServer() {
  const { url, key } = configuration();
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookieOptions: { name: authCookieName, ...sessionCookieOptions },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: updates => {
        for (const { name, value, options } of updates) {
          cookieStore.set(name, value, { ...options, httpOnly: true, secure: sessionCookieOptions.secure, sameSite: "lax", path: "/" });
        }
      },
    },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

/** Only used after verifying identity, for deletion of that exact auth user. */
export function createSupabaseAdmin() {
  const { url } = configuration();
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new AccountError("Account deletion is not configured. Please contact Leela support.", 503);
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
}

export async function clearAccountCookies() {
  const cookieStore = await cookies();
  for (const { name } of cookieStore.getAll()) {
    if (name === "leela_session" || name === authCookieName || name.startsWith(authCookieName + ".")) {
      cookieStore.set(name, "", { ...sessionCookieOptions, maxAge: 0 });
    }
  }
}
