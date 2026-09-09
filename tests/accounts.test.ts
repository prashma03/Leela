import assert from "node:assert/strict";
import { test } from "node:test";
import { createServerClient } from "@supabase/ssr";
import { AccountError, completeMemory, normalizeMemory } from "../app/lib/account-memory";
import { authenticateAccount, createAccount, getCurrentAccount, updateAccountMemory } from "../app/lib/account-store";

// Exercise the real Supabase SDK/session-cookie machinery against a fake Auth/
// REST transport. This is not a substitute for running the SQL RLS tests.
function fixture() {
  const id = "10000000-0000-4000-8000-000000000001";
  const user = { id, aud: "authenticated", role: "authenticated", email: "test@example.test", user_metadata: { name: "Test" }, created_at: new Date().toISOString() };
  const profile = { id, name: "Test", memory: { savedStories: ["gita-2-47"] } as Record<string, unknown> };
  const jar = new Map<string, string>();
  let refreshes = 0;
  let outage = false;
  let missingProfile = false;
  let serial = 0;
  const reply = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
  const session = () => {
    const payload = { sub: id, aud: "authenticated", role: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600 };
    const access_token = [Buffer.from('{"alg":"HS256","typ":"JWT"}').toString("base64url"), Buffer.from(JSON.stringify(payload)).toString("base64url"), "test-signature-" + (++serial)].join(".");
    return { user, access_token, refresh_token: "refresh-" + serial, expires_in: 3600, token_type: "bearer" };
  };
  const transport: typeof fetch = async (input, init) => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    if (outage) return reply({ msg: "Unavailable" }, 503);
    if (url.pathname === "/auth/v1/token") {
      const body = await request.json();
      if (url.searchParams.get("grant_type") === "refresh_token") {
        assert.match(body.refresh_token, /^refresh-/);
        refreshes++;
        return reply(session());
      }
      if (body.password !== "valid-password") return reply({ code: "invalid_credentials", msg: "Invalid credentials" }, 400);
      return reply(session());
    }
    if (url.pathname === "/auth/v1/user") return reply(user);
    if (url.pathname === "/auth/v1/signup") return reply(user);
    if (url.pathname === "/auth/v1/logout") return new Response(null, { status: 204 });
    if (url.pathname === "/rest/v1/leela_profiles") {
      assert.equal(url.searchParams.get("id"), "eq." + id);
      return missingProfile ? reply({ code: "PGRST116", message: "No rows" }, 406) : reply(profile);
    }
    if (url.pathname === "/rest/v1/rpc/leela_update_memory") {
      const body = await request.json();
      assert.deepEqual(Object.keys(body), ["patch"]);
      profile.memory = { ...profile.memory, ...body.patch };
      if (body.patch.name) profile.name = body.patch.name;
      return reply(profile);
    }
    throw new Error("Unexpected test endpoint: " + url.pathname);
  };
  const client = () => createServerClient("https://test-project.supabase.co", "test-publishable-key", {
    cookieOptions: { name: "leela-auth", httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 90 * 86400 },
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: updates => updates.forEach(({ name, value, options }) => {
        assert.equal(options.httpOnly, true);
        if (options.maxAge === 0) jar.delete(name);
        else jar.set(name, value);
      }),
    },
    global: { fetch: transport },
  });
  return { client, jar, profile, refreshes: () => refreshes,
    outage: () => { outage = true; }, missingProfile: () => { missingProfile = true; } };
}

test("memory validation preserves missing fields and bounds untrusted values", () => {
  assert.deepEqual(normalizeMemory({ savedStories: ["a", "a", "b"], admin: true }), { savedStories: ["a", "b"] });
  assert.deepEqual(normalizeMemory({ readStories: ["story-a", "story-a", "story-b"] }), { readStories: ["story-a", "story-b"] });
  assert.deepEqual(normalizeMemory({ mood: "calm" }), { mood: "calm" });
  assert.equal(normalizeMemory({ name: "x".repeat(100) }).name?.length, 60);
  assert.equal(normalizeMemory({ savedStories: Array.from({ length: 200 }, (_, i) => "" + i) }).savedStories?.length, 120);
  assert.equal(normalizeMemory({ readStories: Array.from({ length: 300 }, (_, i) => "story-" + i) }).readStories?.length, 250);
  for (const value of [null, [], "text", { dailyAdventureDone: "false" }, { savedStories: [1] }]) {
    assert.throws(() => normalizeMemory(value), AccountError);
  }
  const empty = completeMemory({}, "New user");
  assert.deepEqual(empty.savedStories, []);
  assert.deepEqual(empty.readStories, []);
  assert.equal(empty.favoriteAnimal, "");
  assert.equal(empty.name, "New user");
});

test("login persists in cookies and restores through a new server client", async () => {
  const f = fixture();
  const account = await authenticateAccount(f.client(), { email: " TEST@example.test ", password: "valid-password" });
  assert.ok(f.jar.size > 0);
  assert.equal(account.email, "test@example.test");
  assert.equal("password" in account, false);
  assert.equal("access_token" in account, false);
  assert.deepEqual(await getCurrentAccount(f.client()), account);
});

test("expired access tokens renew after reopening without losing journey data", async t => {
  t.mock.timers.enable({ apis: ["Date"], now: Date.now() });
  const f = fixture();
  await authenticateAccount(f.client(), { email: "test@example.test", password: "valid-password" });
  const originalCookie = [...f.jar.values()].join("");
  t.mock.timers.tick(3_601_000);
  const restored = await getCurrentAccount(f.client());
  assert.equal(f.refreshes(), 1);
  assert.notEqual([...f.jar.values()].join(""), originalCookie);
  assert.deepEqual(restored?.memory.savedStories, ["gita-2-47"]);
});

test("journey updates use atomic patches and survive a fresh client", async () => {
  const f = fixture();
  const client = f.client();
  await authenticateAccount(client, { email: "test@example.test", password: "valid-password" });
  await updateAccountMemory(client, { mood: "calm" });
  const restored = await getCurrentAccount(f.client());
  assert.equal(restored?.memory.mood, "calm");
  assert.deepEqual(restored?.memory.savedStories, ["gita-2-47"]);
});

test("confirmation-required signup does not claim the user is signed in", async () => {
  const previous = process.env.LEELA_APP_URL;
  process.env.LEELA_APP_URL = "https://leela.example";
  try {
    const result = await createAccount(fixture().client(), { name: "Test", email: "test@example.test", password: "valid-password" });
    assert.equal(result.requiresEmailConfirmation, true);
    assert.equal(result.user, null);
  } finally {
    if (previous === undefined) delete process.env.LEELA_APP_URL;
    else process.env.LEELA_APP_URL = previous;
  }
});

test("bad credentials, missing profiles and outages fail instead of creating empty stores", async () => {
  const f = fixture();
  await assert.rejects(authenticateAccount(f.client(), { email: "test@example.test", password: "wrong-password" }), (error: unknown) => error instanceof AccountError && error.status === 401);
  await authenticateAccount(f.client(), { email: "test@example.test", password: "valid-password" });
  f.missingProfile();
  await assert.rejects(getCurrentAccount(f.client()), (error: unknown) => error instanceof AccountError && error.status === 503);
  f.outage();
  await assert.rejects(getCurrentAccount(f.client()), (error: unknown) => error instanceof AccountError && error.status === 503);
});

test("signout clears persisted auth cookies", async () => {
  const f = fixture();
  const client = f.client();
  await authenticateAccount(client, { email: "test@example.test", password: "valid-password" });
  const { error } = await client.auth.signOut({ scope: "local" });
  assert.equal(error, null);
  assert.equal(f.jar.size, 0);
  assert.equal(await getCurrentAccount(f.client()), null);
});
