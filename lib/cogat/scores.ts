/*
 * CogAT score formats, as Riverside publishes them in the Form 7 score
 * interpretation materials:
 *
 *  - Standard Age Score (SAS): normalized, mean 100, SD 16, reported 50–160.
 *  - Age percentile rank (PR) and age stanine (1–9), derived from SAS.
 *  - Three batteries: Verbal (V), Quantitative (Q), Nonverbal (N), plus composites.
 *  - Ability Profile: median age stanine + a pattern letter + relative strengths
 *    and weaknesses, e.g. "9B (V+)", "5C (Q+ N-)", "7E (V- N+)".
 *
 * The real profile rules compare each battery's confidence band to the others.
 * This module uses a published-rules approximation, documented on the
 * accessibility and case-study pages: a battery is a relative strength or
 * weakness when it sits 10+ SAS points from the median battery, and the profile
 * is "E" (extreme) when two batteries are 24+ points apart.
 */

export type Battery = "V" | "Q" | "N";
export const BATTERIES: Battery[] = ["V", "Q", "N"];

export const BATTERY_NAME: Record<Battery, string> = {
  V: "Verbal",
  Q: "Quantitative",
  N: "Nonverbal",
};

export const SAS_MEAN = 100;
export const SAS_SD = 16;
export const SAS_MIN = 50;
export const SAS_MAX = 160;
/** Roughly one standard error of measurement, used for the confidence band. */
export const SAS_BAND = 5;

/** Abramowitz–Stegun approximation of the standard normal CDF. Good to ~1e-7. */
export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
}

export function clampSas(sas: number): number {
  return Math.max(SAS_MIN, Math.min(SAS_MAX, Math.round(sas)));
}

/** Percentile ranks are reported 1–99. */
export function sasToPercentile(sas: number): number {
  const pr = Math.round(normalCdf((sas - SAS_MEAN) / SAS_SD) * 100);
  return Math.max(1, Math.min(99, pr));
}

/** Stanine bands by percentile rank: 4-7-12-17-20-17-12-7-4 percent of students. */
const STANINE_UPPER_PR = [3, 10, 22, 39, 59, 76, 88, 95, 99];

export function percentileToStanine(pr: number): number {
  const i = STANINE_UPPER_PR.findIndex((upper) => pr <= upper);
  return i === -1 ? 9 : i + 1;
}

export function sasToStanine(sas: number): number {
  return percentileToStanine(sasToPercentile(sas));
}

export type StanineBand = "below average" | "average" | "above average" | "very high";

export function stanineBand(stanine: number): StanineBand {
  if (stanine <= 3) return "below average";
  if (stanine <= 6) return "average";
  if (stanine <= 8) return "above average";
  return "very high";
}

export type ProfilePattern = "A" | "B" | "C" | "E";

export type AbilityProfile = {
  /** Median age stanine across the three batteries. */
  stanine: number;
  pattern: ProfilePattern;
  strengths: Battery[];
  weaknesses: Battery[];
  /** Formatted the way CogAT reports print it, e.g. "7E (V- N+)". */
  code: string;
};

export const SIGNIFICANT_DIFF = 10;
export const EXTREME_DIFF = 24;

export function abilityProfile(sas: Record<Battery, number>): AbilityProfile {
  const sorted = [...BATTERIES].sort((a, b) => sas[a] - sas[b]);
  const medianSas = sas[sorted[1]];
  const stanine = sasToStanine(medianSas);

  const strengths: Battery[] = [];
  const weaknesses: Battery[] = [];
  for (const b of BATTERIES) {
    const dev = sas[b] - medianSas;
    if (dev >= SIGNIFICANT_DIFF) strengths.push(b);
    else if (dev <= -SIGNIFICANT_DIFF) weaknesses.push(b);
  }

  const range = sas[sorted[2]] - sas[sorted[0]];
  let pattern: ProfilePattern;
  if (range >= EXTREME_DIFF) pattern = "E";
  else if (strengths.length && weaknesses.length) pattern = "C";
  else if (strengths.length || weaknesses.length) pattern = "B";
  else pattern = "A";

  // An E profile always names the batteries that drive the gap.
  if (pattern === "E" && !strengths.length && !weaknesses.length) {
    strengths.push(sorted[2]);
    weaknesses.push(sorted[0]);
  }

  const marks = [...BATTERIES.filter((b) => strengths.includes(b)).map((b) => `${b}+`), ...BATTERIES.filter((b) => weaknesses.includes(b)).map((b) => `${b}-`)]
    // Keep V, Q, N order regardless of sign, as the printed reports do.
    .sort((a, b) => BATTERIES.indexOf(a[0] as Battery) - BATTERIES.indexOf(b[0] as Battery));

  const code = `${stanine}${pattern}${marks.length ? ` (${marks.join(" ")})` : ""}`;
  return { stanine, pattern, strengths, weaknesses, code };
}

export const PATTERN_MEANING: Record<ProfilePattern, string> = {
  A: "All three scores are at about the same level.",
  B: "One score is above or below the other two.",
  C: "One score is above and one is below the third: a contrast.",
  E: "Two scores are extremely different (24+ points apart). Read the composite with care.",
};

/**
 * Composites are not simple averages: a student high on all three batteries is
 * rarer than one high on any single battery, so composite SAS spreads further
 * from 100 than the mean does.
 */
export function compositeSas(scores: number[]): number {
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  return clampSas(SAS_MEAN + (mean - SAS_MEAN) * 1.08);
}

/** Percentile rank of a value within a local sample, reported 1–99. */
export function localPercentile(value: number, sample: number[]): number {
  if (!sample.length) return 50;
  let below = 0;
  let equal = 0;
  for (const s of sample) {
    if (s < value) below++;
    else if (s === value) equal++;
  }
  const pr = Math.round(((below + equal / 2) / sample.length) * 100);
  return Math.max(1, Math.min(99, pr));
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
