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

  if (process.env.NODE_ENV !== "production" && missing && !warnedStoryIds.has(story.id)) {
    warnedStoryIds.add(story.id);
    console.warn(`[Leela story artwork] ${story.id}: missing mapping; using fallback`);
  }

  return {
    src: missing ? STORY_IMAGE_FALLBACK : story.image,
    alt: missing ? `Warm storybook artwork for ${story.title}` : story.imageAlt,
    objectPosition: story.imageFocus || curatedFocus[story.id] || "center",
    temporary: false,
  };
}
