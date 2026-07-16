import { NextResponse } from "next/server";

type MemoryPayload = {
  name?: string;
  mood?: string;
  favoriteAnimal?: string;
  favoriteActivity?: string;
  goodDeeds?: string[];
  treasures?: string[];
  dailyAdventureDone?: boolean;
};

const memoryStore = new Map<string, MemoryPayload>();

function normalizeMemory(memory: MemoryPayload): MemoryPayload {
  return {
    name: memory.name?.slice(0, 60) || "",
    mood: memory.mood?.slice(0, 30) || "",
    favoriteAnimal: memory.favoriteAnimal?.slice(0, 60) || "",
    favoriteActivity: memory.favoriteActivity?.slice(0, 80) || "",
    goodDeeds: (memory.goodDeeds || []).slice(-40),
    treasures: (memory.treasures || []).slice(-20),
    dailyAdventureDone: Boolean(memory.dailyAdventureDone),
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const profileId = url.searchParams.get("profileId") || "local-child";
  return NextResponse.json({
    profileId,
    memory: memoryStore.get(profileId) || {},
    storage: "ephemeral-server-memory",
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { profileId?: string; memory?: MemoryPayload };
    const profileId = body.profileId || "local-child";
    const memory = normalizeMemory(body.memory || {});
    memoryStore.set(profileId, memory);
    return NextResponse.json({ profileId, memory, storage: "ephemeral-server-memory" });
  } catch {
    return NextResponse.json({ error: "Unable to save memory." }, { status: 500 });
  }
}
