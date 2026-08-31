import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getAccountBySession, normalizeMemory, updateAccountMemory, type AccountMemory } from "@/app/lib/account-store";

async function currentAccount() {
  const token = (await cookies()).get("leela_session")?.value;
  return getAccountBySession(token);
}

export async function GET() {
  const account = await currentAccount();
  if (!account) {
    return NextResponse.json({ error: "Adult account required." }, { status: 401 });
  }
  return NextResponse.json({
    profileId: account.id,
    memory: account.memory || {},
    storage: "account-file-store",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { memory?: AccountMemory };
    const account = await currentAccount();
    if (!account) {
      return NextResponse.json({ error: "Adult account required." }, { status: 401 });
    }
    const updated = updateAccountMemory(account.id, normalizeMemory(body.memory || {}));
    return NextResponse.json({ profileId: updated.id, memory: updated.memory, storage: "account-file-store" });
  } catch {
    return NextResponse.json({ error: "Unable to save memory." }, { status: 500 });
  }
}
