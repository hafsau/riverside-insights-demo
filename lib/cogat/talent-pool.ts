import { BATTERIES, localPercentile, type Battery } from "@/lib/cogat/scores";
import { DISTRICT_SAMPLE, type Student } from "@/lib/data/roster";

/*
 * Talent-pool screening rules. Districts set these, not Riverside, so Reach
 * makes the rule explicit and shows its consequences instead of hiding it in a
 * report filter.
 */

export type Norms = "national" | "local";
export type Scope = "composite" | "any";

export type Rule = { norms: Norms; scope: Scope; cutoff: number };

export const DEFAULT_RULE: Rule = { norms: "local", scope: "any", cutoff: 90 };
export const NATIONAL_DEFAULT_CUTOFF = 97;

export type ScoreKey = Battery | "C";
export const SCORE_LABEL: Record<ScoreKey, string> = { V: "Verbal", Q: "Quantitative", N: "Nonverbal", C: "Composite" };

export function percentileFor(s: Student, key: ScoreKey, norms: Norms): number {
  if (norms === "national") return s.pr[key];
  const sas = key === "C" ? s.composite : s.sas[key];
  return localPercentile(sas, DISTRICT_SAMPLE);
}

export type Screen = {
  student: Student;
  qualifies: boolean;
  /** Scores that met the cutoff. */
  via: ScoreKey[];
  /** Would qualify, except the qualifying score carries a warning flag. */
  checkFirst: boolean;
};

export function screen(s: Student, rule: Rule): Screen {
  const keys: ScoreKey[] = rule.scope === "composite" ? ["C"] : ["C", ...BATTERIES];
  const via: ScoreKey[] = [];
  let flaggedHit = false;
  for (const k of keys) {
    if (percentileFor(s, k, rule.norms) < rule.cutoff) continue;
    const flagged = k === "C" ? !!s.flags && Object.keys(s.flags).length > 0 : !!s.flags?.[k];
    if (flagged) flaggedHit = true;
    else via.push(k);
  }
  return { student: s, qualifies: via.length > 0, via, checkFirst: !via.length && flaggedHit };
}

export function screenAll(students: Student[], rule: Rule): Screen[] {
  return students.map((s) => screen(s, rule));
}

/**
 * Students this rule reaches that a composite-only rule would miss. Usually
 * lopsided profiles, often English learners whose Verbal score lags.
 */
export function missedByComposite(students: Student[], rule: Rule): Student[] {
  if (rule.scope === "composite") return [];
  const compositeOnly = { ...rule, scope: "composite" as const };
  return students.filter((s) => screen(s, rule).qualifies && !screen(s, compositeOnly).qualifies);
}

export function describeRule(rule: Rule): string {
  const where = rule.scope === "composite" ? "composite" : "composite or any one battery";
  const norms = rule.norms === "national" ? "national age norms" : "district (local) norms";
  return `${ruleThreshold(rule)} on the ${where}, using ${norms}`;
}

export function ruleThreshold(rule: Rule): string {
  return `${rule.cutoff}th percentile or higher`;
}
