import { NextResponse } from "next/server";

import { stories } from "@/app/stories";

type MemoryProfile = {
  name?: string;
  mood?: string;
  favoriteAnimal?: string;
  favoriteActivity?: string;
  goodDeeds?: string[];
  treasures?: string[];
};

const wisdom = [
  "Focus on the kind action in front of you, not on controlling every result.",
  "A gentle heart can be brave without becoming harsh.",
  "When feelings are big, one slow breath can make the next step clearer.",
  "Friendship grows when we listen before we hurry to fix.",
];

function makeServerReply(message: string, memory: MemoryProfile) {
  const clean = message.toLowerCase();
  const name = memory.name?.trim();
  const story = stories.find((s) =>
    [s.title, s.subtitle, s.intro, s.lesson, ...s.body].join(" ").toLowerCase().includes(clean),
  ) || stories[Math.abs([...message].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % stories.length];
  const moodLine = memory.mood
    ? `I remember your heart recently felt ${memory.mood}. Let us be gentle with that.`
    : "Let us look at this gently.";
  const preferenceLine = memory.favoriteAnimal || memory.favoriteActivity
    ? `I also remember ${memory.favoriteAnimal ? `you like ${memory.favoriteAnimal}` : ""}${memory.favoriteAnimal && memory.favoriteActivity ? " and " : ""}${memory.favoriteActivity ? `you enjoy ${memory.favoriteActivity}` : ""}.`
    : "I am still learning what you love.";
  const deedLine = memory.goodDeeds?.length
    ? `Your kindness garden has ${memory.goodDeeds.length} flower${memory.goodDeeds.length === 1 ? "" : "s"} now.`
    : "Your kindness garden is ready for its first flower.";
  const treasureLine = memory.treasures?.length
    ? `You have found ${memory.treasures.length} Vrindavan treasure${memory.treasures.length === 1 ? "" : "s"}.`
    : "There are still Vrindavan treasures waiting for you.";
  const reminder = wisdom[Math.abs(message.length) % wisdom.length];

  return {
    text: `${name ? `${name}, ` : ""}${moodLine}\n\n${preferenceLine} ${deedLine} ${treasureLine}\n\nA small Krishna reminder: ${reminder}\n\nA story to read next: ${story.title}. Its lesson: ${story.lesson}`,
    storyId: story.id,
    mode: "local-safe",
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { message?: string; memory?: MemoryProfile };
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    return NextResponse.json(makeServerReply(message, body.memory || {}));
  } catch {
    return NextResponse.json({ error: "Unable to prepare Krishna AI response." }, { status: 500 });
  }
}
