import "server-only";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { AccountError, completeMemory, normalizeEmail, normalizeMemory, type AccountMemory, type PublicAccount } from "./account-memory";

export type { AccountMemory, PublicAccount } from "./account-memory";

function authFailure(error: { status?: number; code?: string }, signingUp = false): never {
  if (error.status === 429) throw new AccountError("Too many attempts. Please wait before trying again.", 429);
  if (error.status && error.status >= 500) throw new AccountError("Sign-in is temporarily unavailable. Please try again.", 503);
  if (error.code === "email_not_confirmed") throw new AccountError("Please confirm your email before signing in.", 401);
  throw new AccountError(signingUp
    ? "Unable to create the account. Check your email and use a strong password of at least 8 characters."
    : "We couldn't sign you in. Check your email and password.", signingUp ? 400 : 401);
}

function credentials(input: { email: unknown; password: unknown }, signup: boolean) {
  if (typeof input.email !== "string" || typeof input.password !== "string") {
    throw new AccountError("Email and password are required.");
  }
  const email = normalizeEmail(input.email);
  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AccountError("Please enter a valid email.");
  }
  if (input.password.length < (signup ? 8 : 1) || input.password.length > 1024) {
    throw new AccountError("Please enter a password" + (signup ? " of at least 8 characters." : "."));
  }
  return { email, password: input.password };
}

async function profileForUser(client: SupabaseClient, user: User): Promise<PublicAccount> {
  const { data, error } = await client.from("leela_profiles").select("id,name,memory").eq("id", user.id).single();
  if (error || !data) throw new AccountError("Your account is signed in, but its journey could not be loaded. Please try again.", 503);
  return { id: user.id, email: user.email || "", name: data.name, memory: completeMemory(data.memory, data.name) };
}

export async function getCurrentAccount(client: SupabaseClient) {
  // getUser validates with Supabase Auth and refreshes expired access tokens.
  // Never authorize from the unverified user object in getSession().
  const { data, error } = await client.auth.getUser();
  if (error) {
    if (error.name === "AuthSessionMissingError" || error.status === 401 || error.status === 403 ||
        ["refresh_token_not_found", "refresh_token_already_used", "session_not_found"].includes(error.code || "")) return null;
    throw new AccountError("Unable to restore your session right now. Please try again.", 503);
  }
  return data.user ? profileForUser(client, data.user) : null;
}

export async function createAccount(client: SupabaseClient, input: {
  name: unknown; email: unknown; password: unknown;
}) {
  const login = credentials(input, true);
  if (input.name !== undefined && typeof input.name !== "string") throw new AccountError("Please enter a name.");
  const name = (typeof input.name === "string" ? input.name.trim().slice(0, 60) : "") || "Little friend";
  const appUrl = process.env.LEELA_APP_URL;
  if (!appUrl) throw new AccountError("Email confirmation is not configured yet. Please contact Leela support.", 503);
  const { data, error } = await client.auth.signUp({
    ...login,
    options: { data: { name }, emailRedirectTo: new URL("/auth/confirm", appUrl).href },
  });
  if (error) authFailure(error, true);
  // Supabase intentionally avoids exposing duplicate signups as a normal error
  // when email confirmation is enabled. In that case, it can return a user with
  // no identities, which means this email already belongs to an auth account.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new AccountError("An account already exists with this email. Please sign in instead.", 409);
  }
  // Email confirmation remains enabled; never create an unverified session ourselves.
  if (!data.session) return { user: null, requiresEmailConfirmation: true,
    message: "Check your email to confirm your account, then return to Leela and sign in." };
  if (!data.user) throw new AccountError("Unable to create the account.", 503);
  return { user: await profileForUser(client, data.user), requiresEmailConfirmation: false };
}

export async function authenticateAccount(client: SupabaseClient, input: { email: unknown; password: unknown }) {
  const { data, error } = await client.auth.signInWithPassword(credentials(input, false));
  if (error) authFailure(error);
  if (!data.user) throw new AccountError("Unable to sign in.", 401);
  return profileForUser(client, data.user);
}

export async function updateAccountMemory(client: SupabaseClient, memory: unknown): Promise<AccountMemory> {
  // Atomic JSON merge avoids a read/write race that could erase unrelated fields.
  // SQL obtains the owner from auth.uid(), never from a browser-supplied user ID.
  const { data, error } = await client.rpc("leela_update_memory", { patch: normalizeMemory(memory) });
  if (error || !data) throw new AccountError("Your journey could not be saved. Please try again.", 503);
  return completeMemory(data.memory, data.name);
}
