import { cookies } from "next/headers";
import { getCurrentAccount, updateAccountMemory } from "@/app/lib/account-store";
import { AccountError } from "@/app/lib/account-memory";
import { accountFailure, accountJson, readAccountBody, requireSameOrigin } from "@/app/lib/account-http";
import { createSupabaseServer } from "@/app/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authenticatedStore() {
  if ((await cookies()).get("leela_session")?.value === "leela-demo") {
    throw new AccountError("Adult account required.", 401);
  }
  const client = await createSupabaseServer();
  const account = await getCurrentAccount(client);
  if (!account) throw new AccountError("Adult account required.", 401);
  return { client, account };
}

export async function GET() {
  try {
    const { account } = await authenticatedStore();
    return accountJson({ profileId: account.id, memory: account.memory, storage: "supabase" });
  } catch (error) { return accountFailure(error); }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const { client, account } = await authenticatedStore();
    const body = await readAccountBody(request);
    if (body.memory === undefined) throw new AccountError("Journey information is required.");
    const memory = await updateAccountMemory(client, body.memory);
    return accountJson({ profileId: account.id, memory, storage: "supabase" });
  } catch (error) { return accountFailure(error); }
}
