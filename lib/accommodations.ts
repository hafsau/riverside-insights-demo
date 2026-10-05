import type { Battery } from "@/lib/cogat/scores";

/*
 * Accommodations are where accessibility and psychometrics meet. Some supports
 * are construct-neutral: they change how a student reaches the item, not what
 * the item measures. Others change what is measured, so the score has to say
 * so. Reach treats that as data on every accommodation, by battery and level,
 * so the admin sees it when assigning, the player enforces it, and the score
 * report discloses it.
 */

export type AccommodationId =
  | "read-aloud"
  | "spanish-directions"
  | "extended-time"
  | "breaks"
  | "magnify"
  | "high-contrast"
  | "answer-eliminator"
  | "reduced-motion"
  | "switch-access";

/** neutral: no effect on the construct. directions: allowed for directions only. flag: allowed, but the score is footnoted. */
export type ConstructEffect = "neutral" | "directions" | "flag";

export type Accommodation = {
  id: AccommodationId;
  label: string;
  short: string;
  description: string;
  /** Effect at primary levels (5/6–8), where items are pictures with oral prompts. */
  primary: Record<Battery, ConstructEffect>;
  /** Effect at levels 9–17/18, where students read the items themselves. */
  upper: Record<Battery, ConstructEffect>;
  /** Users can turn this on for themselves in the player without an assignment. */
  universal: boolean;
};

const ALL_NEUTRAL: Record<Battery, ConstructEffect> = { V: "neutral", Q: "neutral", N: "neutral" };

export const ACCOMMODATIONS: Accommodation[] = [
  {
    id: "read-aloud",
    label: "Read aloud (text-to-speech)",
    short: "Read aloud",
    description: "Prompts and answer choices are spoken. At primary levels every prompt is oral anyway; at upper levels, reading verbal items aloud changes what the Verbal battery measures.",
    primary: ALL_NEUTRAL,
    upper: { V: "flag", Q: "neutral", N: "neutral" },
    universal: false,
  },
  {
    id: "spanish-directions",
    label: "Directions in Spanish",
    short: "Spanish directions",
    description: "Directions and practice items in Spanish. Items stay as written. Pair with the Nonverbal battery when a student is still learning English.",
    primary: { V: "directions", Q: "directions", N: "directions" },
    upper: { V: "directions", Q: "directions", N: "directions" },
    universal: false,
  },
  {
    id: "extended-time",
    label: "Extended time (1.5×)",
    short: "Extended time",
    description: "Subtest time limits extended by half. Norms assume standard timing, so extended-time scores carry a footnote.",
    primary: { V: "flag", Q: "flag", N: "flag" },
    upper: { V: "flag", Q: "flag", N: "flag" },
    universal: false,
  },
  {
    id: "breaks",
    label: "Breaks between items",
    short: "Breaks",
    description: "The student can pause the timer between items. The item on screen is hidden while paused.",
    primary: ALL_NEUTRAL,
    upper: ALL_NEUTRAL,
    universal: false,
  },
  {
    id: "magnify",
    label: "Magnification up to 200%",
    short: "Magnify",
    description: "Items and choices scale without horizontal scrolling. Figure items keep their proportions.",
    primary: ALL_NEUTRAL,
    upper: ALL_NEUTRAL,
    universal: true,
  },
  {
    id: "high-contrast",
    label: "High-contrast display",
    short: "High contrast",
    description: "Black on white with heavy outlines. Figure items are authored in shape and line weight, never color alone, so nothing is lost.",
    primary: ALL_NEUTRAL,
    upper: ALL_NEUTRAL,
    universal: true,
  },
  {
    id: "answer-eliminator",
    label: "Answer eliminator",
    short: "Eliminator",
    description: "The student can cross out choices they've ruled out. Crossed-out choices can still be selected.",
    primary: ALL_NEUTRAL,
    upper: ALL_NEUTRAL,
    universal: true,
  },
  {
    id: "reduced-motion",
    label: "Reduced motion",
    short: "Reduced motion",
    description: "No transitions or celebratory animation. Also follows the device setting automatically.",
    primary: ALL_NEUTRAL,
    upper: ALL_NEUTRAL,
    universal: true,
  },
  {
    id: "switch-access",
    label: "Switch and keyboard scanning",
    short: "Switch access",
    description: "Every action is reachable with one or two switches or the keyboard alone. Choices scan in reading order.",
    primary: ALL_NEUTRAL,
    upper: ALL_NEUTRAL,
    universal: false,
  },
];

export const ACCOMMODATION_BY_ID = Object.fromEntries(ACCOMMODATIONS.map((a) => [a.id, a])) as Record<AccommodationId, Accommodation>;

export function isPrimaryLevel(level: string): boolean {
  return ["5/6", "7", "8"].includes(level);
}

export function constructEffect(id: AccommodationId, battery: Battery, level: string): ConstructEffect {
  const a = ACCOMMODATION_BY_ID[id];
  return (isPrimaryLevel(level) ? a.primary : a.upper)[battery];
}

/** Batteries whose score should carry a footnote for this set of accommodations. */
export function flaggedBatteries(ids: AccommodationId[], level: string): Battery[] {
  const out = new Set<Battery>();
  for (const id of ids) for (const b of ["V", "Q", "N"] as Battery[]) if (constructEffect(id, b, level) === "flag") out.add(b);
  return [...out];
}

export const EFFECT_LABEL: Record<ConstructEffect, string> = {
  neutral: "No effect on scores",
  directions: "Directions only",
  flag: "Score footnoted",
};
