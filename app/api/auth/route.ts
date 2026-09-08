import { cookies } from "next/headers";
import { authenticateAccount, createAccount, getCurrentAccount } from "@/app/lib/account-store";
import { AccountError } from "@/app/lib/account-memory";
import { accountFailure, accountJson, readAccountBody, requireSameOrigin } from "@/app/lib/account-http";
import { clearAccountCookies, createSupabaseAdmin, createSupabaseServer, hasSupabaseConfiguration, sessionCookieOptions } from "@/app/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const demoCookie = "leela_session";
const demoSession = "leela-demo";
const demoUser = { id: "demo", name: "Demo visitor", email: "demo@leela.app", memory: {} };

export async function GET() {
  try {
    if ((await cookies()).get(demoCookie)?.value === demoSession) return accountJson({ user: demoUser });
    if (!hasSupabaseConfiguration()) return accountJson({ user: null });
    const user = await getCurrentAccount(await createSupabaseServer());
    return accountJson({ user });
  } catch (error) { return accountFailure(error); }
}

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const body = await readAccountBody(request);
    if (body.mode === "demo") {
      await clearAccountCookies();
      (await cookies()).set(demoCookie, demoSession, sessionCookieOptions);
      return accountJson({ user: demoUser });
    }
    if (body.mode !== "login" && body.mode !== "signup") throw new AccountError("Choose login or signup.");
    const client = await createSupabaseServer();
    const result = body.mode === "signup"
      ? await createAccount(client, { name: body.name, email: body.email, password: body.password })
      : { user: await authenticateAccount(client, { email: body.email, password: body.password }) };
    // The old file-store cookie must never authenticate a real Supabase account.
    (await cookies()).set(demoCookie, "", { ...sessionCookieOptions, maxAge: 0 });
    return accountJson(result);
  } catch (error) { return accountFailure(error); }
}

export async function DELETE(request: Request) {
  try {
    requireSameOrigin(request);
    const deleteAccount = new URL(request.url).searchParams.get("deleteAccount") === "true";
    const isDemo = (await cookies()).get(demoCookie)?.value === demoSession;
    if (deleteAccount) {
      if (isDemo) throw new AccountError("Sign in to a personal account before deleting it.", 401);
      const account = await getCurrentAccount(await createSupabaseServer());
      if (!account) throw new AccountError("Please sign in before deleting your account.", 401);
      // No user ID is accepted from the request. Database rows cascade on delete.
      const { error } = await createSupabaseAdmin().auth.admin.deleteUser(account.id);
      if (error) throw new AccountError("Your account could not be deleted. Please try again.", 503);
    } else if (!isDemo && hasSupabaseConfiguration()) {
      const { error } = await (await createSupabaseServer()).auth.signOut({ scope: "local" });
      if (error && error.status !== 401 && error.status !== 403) {
        throw new AccountError("Unable to sign out right now. Please try again.", 503);
      }
    }
    await clearAccountCookies();
    return accountJson({ user: null, deleted: deleteAccount });
  } catch (error) { return accountFailure(error); }
}
