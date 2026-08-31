import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { tmpdir } from "node:os";

export type AccountMemory = {
  name?: string;
  mood?: string;
  favoriteAnimal?: string;
  favoriteActivity?: string;
  goodDeeds?: string[];
  treasures?: string[];
  savedStories?: string[];
  dailyAdventureDone?: boolean;
};

export type PublicAccount = {
  id: string;
  name: string;
  email: string;
  memory: AccountMemory;
};

type StoredAccount = PublicAccount & {
  passwordHash: string;
  salt: string;
  sessions: string[];
  createdAt: string;
  updatedAt: string;
};

type StoreShape = {
  users: StoredAccount[];
};

const storePath = join(
  process.env.LEELA_DATA_DIR || (process.env.VERCEL ? tmpdir() : join(process.cwd(), ".data")),
  "leela-users.json",
);

function emptyStore(): StoreShape {
  return { users: [] };
}

function readStore(): StoreShape {
  try {
    if (!existsSync(storePath)) return emptyStore();
    return JSON.parse(readFileSync(storePath, "utf8")) as StoreShape;
  } catch {
    return emptyStore();
  }
}

function writeStore(store: StoreShape) {
  mkdirSync(dirname(storePath), { recursive: true });
  writeFileSync(storePath, JSON.stringify(store, null, 2));
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function safeCompare(left: string, right: string) {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function toPublic(user: StoredAccount): PublicAccount {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    memory: user.memory || {},
  };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase().slice(0, 180);
}

export function normalizeMemory(memory: AccountMemory): AccountMemory {
  return {
    name: memory.name?.slice(0, 60) || "",
    mood: memory.mood?.slice(0, 30) || "",
    favoriteAnimal: memory.favoriteAnimal?.slice(0, 60) || "",
    favoriteActivity: memory.favoriteActivity?.slice(0, 80) || "",
    goodDeeds: (memory.goodDeeds || []).slice(-80),
    treasures: (memory.treasures || []).slice(-30),
    savedStories: (memory.savedStories || []).slice(-120),
    dailyAdventureDone: Boolean(memory.dailyAdventureDone),
  };
}

export function createAccount(input: { name: string; email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const name = input.name.trim().slice(0, 60) || "Little friend";
  if (!email.includes("@")) throw new Error("Please enter a valid email.");
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.");

  const store = readStore();
  if (store.users.some((user) => user.email === email)) {
    throw new Error("An account with this email already exists.");
  }

  const salt = randomBytes(16).toString("hex");
  const now = new Date().toISOString();
  const user: StoredAccount = {
    id: randomBytes(12).toString("hex"),
    name,
    email,
    salt,
    passwordHash: hashPassword(input.password, salt),
    sessions: [],
    memory: { name },
    createdAt: now,
    updatedAt: now,
  };

  store.users.push(user);
  writeStore(store);
  return toPublic(user);
}

export function authenticateAccount(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const store = readStore();
  const user = store.users.find((item) => item.email === email);
  if (!user || !safeCompare(hashPassword(input.password, user.salt), user.passwordHash)) {
    throw new Error("We couldn't sign you in. Check your email and password. If you're new to Leela, create an account first.");
  }
  return toPublic(user);
}

export function createSession(userId: string) {
  const store = readStore();
  const user = store.users.find((item) => item.id === userId);
  if (!user) throw new Error("Account not found.");
  const token = randomBytes(32).toString("hex");
  user.sessions = [token, ...user.sessions].slice(0, 8);
  user.updatedAt = new Date().toISOString();
  writeStore(store);
  return token;
}

export function getAccountBySession(token?: string) {
  if (!token) return null;
  const user = readStore().users.find((item) => item.sessions.includes(token));
  return user ? toPublic(user) : null;
}

export function clearSession(token?: string) {
  if (!token) return;
  const store = readStore();
  let changed = false;
  for (const user of store.users) {
    const nextSessions = user.sessions.filter((session) => session !== token);
    if (nextSessions.length !== user.sessions.length) {
      user.sessions = nextSessions;
      user.updatedAt = new Date().toISOString();
      changed = true;
    }
  }
  if (changed) writeStore(store);
}

export function deleteAccountBySession(token?: string) {
  if (!token) return false;
  const store = readStore();
  const remainingUsers = store.users.filter((user) => !user.sessions.includes(token));
  if (remainingUsers.length === store.users.length) return false;
  writeStore({ users: remainingUsers });
  return true;
}

export function updateAccountMemory(userId: string, memory: AccountMemory) {
  const store = readStore();
  const user = store.users.find((item) => item.id === userId);
  if (!user) throw new Error("Account not found.");
  user.memory = normalizeMemory({ ...(user.memory || {}), ...memory });
  user.name = user.memory.name || user.name;
  user.updatedAt = new Date().toISOString();
  writeStore(store);
  return toPublic(user);
}
