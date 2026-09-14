export type ChatHistoryMessage = { id: number; role: "user" | "ai"; text: string; storyId?: string };

export type AccountMemory = {
  name?: string;
  mood?: string;
  favoriteAnimal?: string;
  favoriteActivity?: string;
  goodDeeds?: string[];
  treasures?: string[];
  savedStories?: string[];
  readStories?: string[];
  dailyAdventureDone?: boolean;
  chatHistory?: ChatHistoryMessage[];
};

export type PublicAccount = {
  id: string;
  name: string;
  email: string;
  memory: AccountMemory;
};

export class AccountError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "AccountError";
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Whitelist and bound JSON received from browsers or the database. */
export function normalizeMemory(value: unknown): AccountMemory {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AccountError("Journey information must be an object.");
  }
  const source = value as Record<string, unknown>;
  const result: AccountMemory = {};
  for (const [key, limit] of [
    ["name", 60], ["mood", 30], ["favoriteAnimal", 60], ["favoriteActivity", 80],
  ] as const) {
    if (source[key] !== undefined) {
      if (typeof source[key] !== "string") throw new AccountError("Invalid profile information.");
      result[key] = source[key].trim().slice(0, limit);
    }
  }
  for (const [key, limit] of [["goodDeeds", 80], ["treasures", 30], ["savedStories", 120], ["readStories", 250]] as const) {
    const list = source[key];
    if (list !== undefined) {
      if (!Array.isArray(list) || list.some(item => typeof item !== "string")) {
        throw new AccountError("Saved journey items must be text.");
      }
      result[key] = [...new Set(list.map(item => item.trim().slice(0, 300)).filter(Boolean))].slice(-limit);
    }
  }
  if (source.dailyAdventureDone !== undefined) {
    if (typeof source.dailyAdventureDone !== "boolean") throw new AccountError("Invalid adventure status.");
    result.dailyAdventureDone = source.dailyAdventureDone;
  }
  if (source.chatHistory !== undefined) {
    if (!Array.isArray(source.chatHistory)) throw new AccountError("Saved chats must be a list.");
    result.chatHistory = source.chatHistory.map((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) throw new AccountError("A saved chat is invalid.");
      const message = item as Record<string, unknown>;
      const role = message.role;
      if ((role !== "user" && role !== "ai") || typeof message.text !== "string") throw new AccountError("A saved chat is invalid.");
      const safeRole: ChatHistoryMessage["role"] = role;
      return { id: typeof message.id === "number" && Number.isFinite(message.id) ? message.id : index + 1, role: safeRole, text: message.text.trim().slice(0, 1600), ...(typeof message.storyId === "string" ? { storyId: message.storyId.trim().slice(0, 120) } : {}) };
    }).filter(message => message.text).slice(-80);
  }
  return result;
}

/** Empty remote values must replace, not inherit, a previous device user's data. */
export function completeMemory(value: unknown, name: string): Required<AccountMemory> {
  return {
    mood: "happy", favoriteAnimal: "", favoriteActivity: "",
    goodDeeds: [], treasures: [], savedStories: [], readStories: [], dailyAdventureDone: false, chatHistory: [],
    ...normalizeMemory(value), name,
  };
}
