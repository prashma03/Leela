import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { privateHeaders } from "@/app/lib/account-http";
import { createSupabaseServer } from "@/app/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = confirmationType(url.searchParams.get("type"));
  // A fixed destination avoids open redirects. Never log or echo the token.
  const destination = new URL("/login?confirmation=error", url.origin);
  if ((code && code.length <= 2048) || (tokenHash && tokenHash.length <= 1024 && type)) {
    try {
      const client = await createSupabaseServer();
      const { error } = code
        ? await client.auth.exchangeCodeForSession(code)
        : await client.auth.verifyOtp({ token_hash: tokenHash!, type: type! });
      if (!error) {
        destination.pathname = "/";
        destination.search = "";
      }
    } catch { /* Show a recoverable message; never expose configuration or tokens. */ }
  }
  return NextResponse.redirect(destination, { status: 303, headers: {
    ...privateHeaders, "Referrer-Policy": "no-referrer",
  } });
}

function confirmationType(type: string | null): EmailOtpType | null {
  if (type === "email" || type === "signup" || type === "email_change") return type;
  return null;
}
