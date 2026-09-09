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

const thematicScenes = {
  childhood: {
    src: "/images/stories/krishna-childhood.png",
    alt: "Painted storybook scene of young Krishna in a sunny Gokul courtyard with butter pots, calves, and friends",
    focus: "center 42%",
  },
  friendship: {
    src: "/images/stories/krishna-friendship.png",
    alt: "Painted storybook scene of Krishna playing the flute with friends, a calf, lotus flowers, and a temple lamp in Vrindavan",
    focus: "center 40%",
  },
  courage: {
    src: "/images/stories/krishna-courage.png",
    alt: "Painted storybook scene of Krishna calmly sheltering friends and animals during a Vrindavan storm",
    focus: "center 42%",
  },
} as const;

function thematicSceneFor(story: Story) {
  const text = `${story.id} ${story.title} ${story.subtitle} ${story.intro}`.toLowerCase();
  if (/storm|fire|danger|fear|brave|courage|kaliya|govardhan|protect|shelter/.test(text)) return thematicScenes.courage;
  if (/butter|baby|yashoda|mother|child|fruit|sweet|mischief|play|muddy/.test(text)) return thematicScenes.childhood;
  return thematicScenes.friendship;
}

export function resolveStoryImage(story: Story): ResolvedStoryImage {
  const missing = !story.image?.trim() || !story.imageAlt?.trim();
  const legacyPlaceholder = story.image?.includes("/placeholders/") ?? false;
  const thematic = legacyPlaceholder ? thematicSceneFor(story) : null;

  if (process.env.NODE_ENV !== "production" && missing && !warnedStoryIds.has(story.id)) {
    warnedStoryIds.add(story.id);
    console.warn(`[Leela story artwork] ${story.id}: missing mapping; using fallback`);
  }

  return {
    src: missing ? STORY_IMAGE_FALLBACK : thematic?.src ?? story.image,
    alt: missing ? `Warm storybook artwork for ${story.title}` : thematic ? `${thematic.alt}, accompanying ${story.title}` : story.imageAlt,
    objectPosition: story.imageFocus || thematic?.focus || curatedFocus[story.id] || "center",
    temporary: false,
  };
}
