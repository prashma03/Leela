import { NextResponse } from "next/server";
import { AccountError } from "./account-memory";

export const privateHeaders = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

export function accountJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: privateHeaders });
}

export function accountFailure(error: unknown) {
  return error instanceof AccountError
    ? accountJson({ error: error.message }, error.status)
    : accountJson({ error: "Account storage is temporarily unavailable. Please try again." }, 503);
}

/** Cookie-based mutations must come from Leela, not a third-party origin. */
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" ||
      (origin && origin !== new URL(request.url).origin)) {
    throw new AccountError("Please submit this request from Leela.", 403);
  }
}

export async function readAccountBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new AccountError("Expected JSON.", 415);
  }
  if (Number(request.headers.get("content-length")) > 65_536) {
    throw new AccountError("Request is too large.", 413);
  }
  // Bound streamed bodies as well; Content-Length is not always supplied.
  const reader = request.body?.getReader();
  if (!reader) throw new AccountError("Request body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 65_536) {
      await reader.cancel();
      throw new AccountError("Request is too large.", 413);
    }
    chunks.push(value);
  }
  let body: unknown;
  try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new AccountError("Invalid JSON."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new AccountError("Invalid request.");
  return body as Record<string, unknown>;
}
