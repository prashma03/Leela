import { NextResponse } from "next/server";

import { getShortChatReply } from "@/app/lib/chat-short-replies";
import { getKrishnaFactReply, isFactualQuestion } from "@/app/lib/krishna-facts";
import { checkRateLimit, rateLimitHeaders } from "@/app/lib/rate-limit";
import { timedRoute } from "@/app/lib/server-timing";
import { stories } from "@/app/stories";

type MemoryProfile = {
  name?: string;
  mood?: string;
  favoriteAnimal?: string;
  favoriteActivity?: string;
  goodDeeds?: string[];
  treasures?: string[];
};
type ChatTurn = { role: "user" | "ai"; text: string };

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

async function makeOpenAIReply(message: string, history: ChatTurn[] = []) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_KRISHNA_MODEL || "gpt-5-nano",
      input: [
        ...history.map(turn => ({
          role: turn.role,
          content: turn.text,
        })),
        {
          role: "system",
          content:
            "You are Leela, an educational guide for Krishna stories, the Mahabharata, and Bhagavad Gita reflections. The user may be a child. First identify the request type. If it is a factual who/what/where/when/how question, answer directly and briefly, with names or definitions first; do not start with emotional validation, advice, or a life lesson. If it is a story recommendation, recommend one specific story and explain why in 2-4 short sentences. If it is an emotional or advice request, respond warmly and practically. Match the length of the reply to the request. Never add advice, a story, or a spiritual lesson unless it is relevant to what the user asked. Do not claim to be Krishna, a deity, or a literal spiritual authority. Ground spiritual or religious claims in the app's curated Krishna stories and Gita paraphrases. Do not invent Sanskrit, verse numbers, quotations, or scriptural claims. If you are unsure, say you are not sure and offer a nearby related topic. Avoid dumping memory/profile details. Encourage one small real-life action only when helpful.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_output_tokens: 280,
    }),
    signal: AbortSignal.timeout(12_000),
  }).catch(() => null);

  if (!response?.ok) return null;
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
  const asksFact = isFactualQuestion(message);
  const reminder = wisdom[Math.abs(message.length) % wisdom.length];
  const prefix = memory.name?.trim() ? `${memory.name.trim()}, ` : "";

  return {
    text: asksFact
      ? `${prefix}I am not fully sure about that from Leela's saved notes yet.\n\nYou can ask about Krishna, the Pandavas, the Kauravas, Arjuna, Draupadi, the Bhagavad Gita, the Mahabharata, dharma, karma, Vrindavan, or Gokul.`
      : asksForStory
      ? `${prefix}I would read ${story.title}.\n\nIt is a good fit because: ${story.lesson}\n\nBefore you begin, take one quiet breath and let the story be small and gentle.`
      : `${prefix}I hear you.\n\nA small Krishna reminder: ${reminder}\n\nOne gentle next step: choose the kindest thing you can do in the next few minutes.\n\nA story that may help: ${story.title}.`,
    storyId: story.id,
    mode: "local-safe",
  };
}

export async function POST(request: Request) {
  return timedRoute("api/krishna POST", async () => {
  try {
    const rate = checkRateLimit(request, { scope: "krishna", limit: 24, windowMs: 60_000 });
    if (rate.limited) {
      return NextResponse.json(
        { error: "Ask Leela is receiving too many messages. Please wait a moment and try again." },
        { status: 429, headers: rateLimitHeaders(rate) },
      );
    }
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return NextResponse.json({ error: "Expected JSON." }, { status: 415 });
    }
    if (Number(request.headers.get("content-length")) > 32_768) {
      return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    }
    const body = await request.json() as { message?: string; memory?: MemoryProfile; history?: ChatTurn[] };
    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    const shortReply = getShortChatReply(message);
    if (shortReply) {
      return NextResponse.json({ text: shortReply, mode: "short-conversation" });
    }

    const factReply = getKrishnaFactReply(message);
    if (factReply) {
      return NextResponse.json(factReply);
    }

    const history = Array.isArray(body.history) ? body.history.filter(turn => turn && (turn.role === "user" || turn.role === "ai") && typeof turn.text === "string").slice(-12).map(turn => ({ role: turn.role, text: turn.text.slice(0, 1600) })) : [];
    const openAIReply = await makeOpenAIReply(message, history);
    return NextResponse.json(openAIReply || makeServerReply(message, body.memory || {}));
  } catch {
    return NextResponse.json({ error: "Unable to prepare Ask Leela response." }, { status: 500 });
  }
  });
}
