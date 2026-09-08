import { NextResponse } from "next/server";
import { privateHeaders } from "@/app/lib/account-http";
import { createSupabaseServer } from "@/app/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  // A fixed destination avoids open redirects. Never log or echo the token.
  const destination = new URL("/login?confirmation=error", url.origin);
  if (tokenHash && tokenHash.length <= 1024 && url.searchParams.get("type") === "email") {
    try {
      const client = await createSupabaseServer();
      const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
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
