import { BATTERY_NAME, ordinal, stanineBand, type Battery } from "@/lib/cogat/scores";
import { FLAG_HELP, type Student } from "@/lib/data/roster";

/*
 * Plain-language interpretation. Uses the student's first name rather than
 * pronouns, avoids "gifted/not gifted" verdicts, and says what a score can't
 * tell you. Two registers: teacher (actionable) and family (reassuring, no jargon).
 */

const REASONING: Record<Battery, string> = {
  V: "reasoning with words and pictures of everyday things",
  Q: "reasoning with numbers and quantities",
  N: "reasoning with shapes and figures",
};

const TEACH_TO: Record<Battery, string> = {
  V: "discussion, read-alouds with open questions, and analogies",
  Q: "number puzzles, patterns and estimation",
  N: "diagrams, visual organizers and hands-on spatial tasks",
};

function list(bs: Battery[]): string {
  const names = bs.map((b) => BATTERY_NAME[b]);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0];
}

export function headline(s: Student): string {
  const p = s.profile;
  const band = stanineBand(p.stanine);
  if (s.flags && Object.keys(s.flags).length) return `Check before using: one score may not reflect what ${s.first} can do.`;
  if (p.pattern === "A") return `${s.first} reasons at a ${band} level across words, numbers and shapes.`;
  if (p.pattern === "E") {
    const hi = p.strengths[0];
    const lo = p.weaknesses[0];
    if (hi && lo) return `${s.first} shows a large gap: much stronger in ${BATTERY_NAME[hi]} than ${BATTERY_NAME[lo]}.`;
    if (lo) return `${s.first}'s ${BATTERY_NAME[lo]} score is far below the other two.`;
    return `${s.first}'s ${BATTERY_NAME[hi!]} score is far above the other two.`;
  }
  if (p.strengths.length && p.weaknesses.length) return `${s.first} is relatively strong in ${list(p.strengths)} and relatively weaker in ${list(p.weaknesses)}.`;
  if (p.strengths.length) return `${s.first} has a relative strength in ${list(p.strengths)}.`;
  return `${s.first} has a relative weakness in ${list(p.weaknesses)}.`;
}

export function teacherNotes(s: Student): string[] {
  const p = s.profile;
  const notes: string[] = [];
  for (const [b, f] of Object.entries(s.flags ?? {}) as [Battery, keyof typeof FLAG_HELP][]) {
    notes.push(`${BATTERY_NAME[b]}: ${FLAG_HELP[f]} Consider retesting before any placement decision.`);
  }
  notes.push(`Overall, ${s.first}'s median score is in stanine ${p.stanine} (${stanineBand(p.stanine)}). The composite is at the ${ordinal(s.pr.C)} percentile for age.`);
  if (p.strengths.length) notes.push(`Build from strength: ${s.first} is strongest at ${p.strengths.map((b) => REASONING[b]).join(" and ")}. Try ${p.strengths.map((b) => TEACH_TO[b]).join("; ")}.`);
  if (p.weaknesses.length) notes.push(`Support, don't sort: ${BATTERY_NAME[p.weaknesses[0]]} is the relative weakness. Pair new ideas in that area with ${TEACH_TO[p.strengths[0] ?? "N"]}.`);
  if (p.pattern === "E") notes.push(`With an E profile the composite hides the story. Use the individual battery scores for any decision.`);
  if (s.supports?.includes("ELL") && p.weaknesses.includes("V")) notes.push(`${s.first} is an English learner. A lower Verbal score is expected and does not limit the Quantitative or Nonverbal results.`);
  return notes;
}

export function familySummary(s: Student): string {
  const p = s.profile;
  if (p.pattern === "A") return `${s.first}'s results show steady reasoning across all three areas: words, numbers and shapes. Overall, ${s.first} scored in the ${stanineBand(p.stanine)} range for children the same age.`;
  const strong = p.strengths.length ? `${s.first} is especially strong at ${p.strengths.map((b) => REASONING[b]).join(" and ")}. ` : "";
  return `${strong}Overall, ${s.first} scored in the ${stanineBand(p.stanine)} range for children the same age. Every child has a pattern of strengths; this one helps ${s.first}'s teacher choose how to teach.`;
}
