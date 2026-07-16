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

const storyRecommendations = [
  {
    keys: ["anxious", "anxiety", "worried", "worry", "scared", "fear", "afraid", "nervous"],
    titleIncludes: "Govardhan",
    opening: "When your heart feels worried, read Lifting Govardhan.",
    reason:
      "It is about Krishna creating shelter during a storm. It reminds us that fear becomes smaller when we find one safe step and stay close to people who care.",
    practice: "Try this before you read: breathe in slowly, breathe out slowly, and name one thing that makes you feel safe.",
  },
  {
    keys: ["angry", "mad", "fight", "mean", "forgive"],
    titleIncludes: "Kaliya",
    opening: "When anger feels hot, read Krishna and Kaliya.",
    reason:
      "It shows strength becoming calm instead of cruel. Krishna does not let harm continue, but he also teaches a better way forward.",
    practice: "Try this first: unclench your hands, take one breath, and wait before speaking.",
  },
  {
    keys: ["friend", "lonely", "alone", "miss", "share"],
    titleIncludes: "Sudama",
    opening: "For friendship, read Krishna and Sudama.",
    reason:
      "It is a gentle story about love that does not depend on gifts, money, or showing off.",
    practice: "After reading, send one kind message or smile to someone you care about.",
  },
  {
    keys: ["lie", "lied", "truth", "honest", "honesty"],
    titleIncludes: "Butter",
    opening: "For honesty, read The Butter Thief.",
    reason:
      "It lets a playful story become a small lesson about truth, love, and making things right.",
    practice: "Try saying one true thing kindly, even if your voice is small.",
  },
];

function extractOutputText(data: unknown) {
  if (typeof data !== "object" || data === null) return "";
  const outputText = (data as { output_text?: unknown }).output_text;
  if (typeof outputText === "string") return outputText.trim();
  const output = (data as { output?: Array<{ content?: Array<{ text?: string }> }> }).output;
  return output?.flatMap((item) => item.content || []).map((item) => item.text || "").join("").trim() || "";
}

async function makeOpenAIReply(message: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_KRISHNA_MODEL || "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You are Krishna AI in a children's Krishna stories app. The user may be a child. Reply like a loving older brother: warm, brief, emotionally safe, practical, and non-preachy. Do not claim to be the real Krishna. Do not invent Sanskrit. Do not ask for private information. If the child asks what story to read, recommend one specific Krishna story and explain why in 2-4 short sentences. Avoid dumping memory/profile details. Encourage one small real-life action when helpful.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_output_tokens: 280,
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  const text = extractOutputText(data);
  return text ? { text, mode: "openai-message-only" } : null;
}

function makeServerReply(message: string, memory: MemoryProfile) {
  const clean = message.toLowerCase();
  const recommendation = storyRecommendations.find((item) => item.keys.some((key) => clean.includes(key)));
  const story = recommendation
    ? stories.find((s) => s.title.toLowerCase().includes(recommendation.titleIncludes.toLowerCase())) || stories[0]
    : stories.find((s) =>
      [s.title, s.subtitle, s.intro, s.lesson, ...s.body].join(" ").toLowerCase().includes(clean),
    ) || stories[Math.abs([...message].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % stories.length];

  if (recommendation) {
    return {
      text: `${recommendation.opening}\n\n${recommendation.reason}\n\n${recommendation.practice}`,
      storyId: story.id,
      mode: "local-safe",
    };
  }

  const asksForStory = clean.includes("story") || clean.includes("read");
  const reminder = wisdom[Math.abs(message.length) % wisdom.length];
  const prefix = memory.name?.trim() ? `${memory.name.trim()}, ` : "";

  return {
    text: asksForStory
      ? `${prefix}I would read ${story.title}.\n\nIt is a good fit because: ${story.lesson}\n\nBefore you begin, take one quiet breath and let the story be small and gentle.`
      : `${prefix}I hear you.\n\nA small Krishna reminder: ${reminder}\n\nOne gentle next step: choose the kindest thing you can do in the next few minutes.\n\nA story that may help: ${story.title}.`,
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

    const openAIReply = await makeOpenAIReply(message);
    return NextResponse.json(openAIReply || makeServerReply(message, body.memory || {}));
  } catch {
    return NextResponse.json({ error: "Unable to prepare Krishna AI response." }, { status: 500 });
  }
}
