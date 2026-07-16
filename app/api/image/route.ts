import { NextResponse } from "next/server";

const palettes: Record<string, string> = {
  gold: "soft gold, cream, peacock teal",
  blue: "Yamuna blue, moonlight silver, soft gold",
  rose: "lotus rose, cream, temple gold",
  green: "Vrindavan green, butter yellow, river blue",
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      name?: string;
      animal?: string;
      activity?: string;
      color?: string;
    };
    const name = body.name?.trim() || "a little friend";
    const animal = body.animal?.trim() || "a gentle calf";
    const activity = body.activity?.trim() || "drawing";
    const palette = palettes[body.color || "gold"] || palettes.gold;

    return NextResponse.json({
      mode: "local-safe-prompt",
      prompt:
        `A sacred, child-friendly Krishna storybook illustration of ${name} in Vrindavan with ${animal}, enjoying ${activity}. Peaceful expression, soft ${palette}, warm aura, no cartoon exaggeration, no fake Sanskrit text.`,
      note:
        "External AI image generation is not enabled because it may transmit child-provided data. Connect an approved image provider only after privacy review.",
    });
  } catch {
    return NextResponse.json({ error: "Unable to prepare image prompt." }, { status: 500 });
  }
}
