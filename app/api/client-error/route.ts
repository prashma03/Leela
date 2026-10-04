import { NextResponse } from "next/server";

import { checkRateLimit } from "@/app/lib/rate-limit";
import { timedRoute } from "@/app/lib/server-timing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return timedRoute("api/client-error POST", async () => {
    const rate = await checkRateLimit(request, { scope: "client-error", limit: 20, windowMs: 60_000 });
    if (rate.limited) return new NextResponse(null, { status: 204 });
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return new NextResponse(null, { status: 204 });
    }
    if (Number(request.headers.get("content-length")) > 8_192) {
      return new NextResponse(null, { status: 204 });
    }

    try {
      const body = await request.json() as Record<string, unknown>;
      const type = typeof body.type === "string" ? body.type.slice(0, 60) : "client-error";
      const message = typeof body.message === "string" ? body.message.slice(0, 500) : "No message";
      const path = typeof body.path === "string" ? body.path.slice(0, 180) : "/";
      const stack = typeof body.stack === "string" ? body.stack.slice(0, 1200) : undefined;
      console.warn("[leela:client-error]", { type, message, path, stack });
    } catch {
      return new NextResponse(null, { status: 204 });
    }

    return new NextResponse(null, { status: 204 });
  });
}
