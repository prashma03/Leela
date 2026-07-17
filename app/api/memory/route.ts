import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getAccountBySession, normalizeMemory, updateAccountMemory, type AccountMemory } from "@/app/lib/account-store";

const memoryStore = new Map<string, AccountMemory>();

async function currentAccount() {
  const token = (await cookies()).get("leela_session")?.value;
  return getAccountBySession(token);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const profileId = url.searchParams.get("profileId") || "local-child";
  const account = await currentAccount();
  if (account) {
    return NextResponse.json({
      profileId: account.id,
      memory: account.memory || {},
      storage: "account-file-store",
    });
  }
  return NextResponse.json({
    profileId,
    memory: memoryStore.get(profileId) || {},
    storage: "ephemeral-server-memory",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { profileId?: string; memory?: AccountMemory };
    const account = await currentAccount();
    if (account) {
      const updated = updateAccountMemory(account.id, normalizeMemory(body.memory || {}));
      return NextResponse.json({ profileId: updated.id, memory: updated.memory, storage: "account-file-store" });
    }
    const profileId = body.profileId || "local-child";
    const memory = normalizeMemory(body.memory || {});
    memoryStore.set(profileId, memory);
    return NextResponse.json({ profileId, memory, storage: "ephemeral-server-memory" });
  } catch {
    return NextResponse.json({ error: "Unable to save memory." }, { status: 500 });
  }
}
