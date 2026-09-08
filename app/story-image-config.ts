import type { Story } from "./stories";

export const STORY_IMAGE_FALLBACK = "/images/stories/story-fallback.svg";

export type ResolvedStoryImage = {
  src: string;
  alt: string;
  objectPosition: string;
  temporary: boolean;
};

const warnedStoryIds = new Set<string>();

const curatedFocus: Record<string, string> = {
  butter: "center 34%",
  kaliya: "center 38%",
  govardhan: "center 34%",
  flute: "center 32%",
  sudama: "center 30%",
  universe: "center 34%",
};

export function resolveStoryImage(story: Story): ResolvedStoryImage {
  const missing = !story.image?.trim() || !story.imageAlt?.trim();
  const temporary = story.image?.includes("/placeholders/") ?? false;

  if (process.env.NODE_ENV !== "production" && (missing || temporary) && !warnedStoryIds.has(story.id)) {
    warnedStoryIds.add(story.id);
    console.warn(`[Leela story artwork] ${story.id}: ${missing ? "missing mapping; using fallback" : "temporary placeholder still needs final artwork"}`);
  }

  return {
    src: missing ? STORY_IMAGE_FALLBACK : story.image,
    alt: story.imageAlt?.trim() || `Warm illustrated placeholder for ${story.title}`,
    objectPosition: story.imageFocus || curatedFocus[story.id] || "center",
    temporary,
  };
}
