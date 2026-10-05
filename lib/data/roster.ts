import type { AccommodationId } from "@/lib/accommodations";
import { abilityProfile, BATTERIES, compositeSas, sasToPercentile, sasToStanine, type AbilityProfile, type Battery } from "@/lib/cogat/scores";

/*
 * Synthetic class. Every name, score and school is invented. Scores are chosen
 * to cover the situations a teacher actually meets in a screening season: a
 * flat high profile, a lopsided English learner, a rushed section, a student
 * answering at chance, a student with an IEP whose extended time footnotes the score.
 */

export type ScoreFlag = "omitted" | "inconsistent" | "targeted";

export const FLAG_LABEL: Record<ScoreFlag, string> = {
  omitted: "Many items omitted",
  inconsistent: "Inconsistent response pattern",
  targeted: "Near chance level",
};

export const FLAG_HELP: Record<ScoreFlag, string> = {
  omitted: "The student skipped or ran out of time on many items. The score probably underestimates ability.",
  inconsistent: "Missed easy items while answering hard ones. Often guessing, distraction or a misunderstood direction.",
  targeted: "The number right is close to what guessing would produce. Treat this score as unknown, not low.",
};

export type Support = "ELL" | "IEP" | "504";

export type StudentSeed = {
  id: string;
  first: string;
  last: string;
  ageMonths: number;
  sas: Record<Battery, number>;
  flags?: Partial<Record<Battery, ScoreFlag>>;
  supports?: Support[];
  accommodations?: AccommodationId[];
};

export type Student = StudentSeed & {
  name: string;
  composite: number;
  pr: Record<Battery | "C", number>;
  stanine: Record<Battery | "C", number>;
  profile: AbilityProfile;
};

export const CLASS = {
  teacher: "Ms. Alvarez",
  grade: "Grade 2",
  level: "8",
  school: "Cedar Ridge Elementary",
  district: "Maple Valley Unified",
  window: "Oct 4 – 15, 2027",
  assessment: "CogAT-style screener",
};

const SEEDS: StudentSeed[] = [
  { id: "amara-okafor", first: "Amara", last: "Okafor", ageMonths: 95, sas: { V: 128, Q: 146, N: 134 } },
  { id: "mateo-hernandez", first: "Mateo", last: "Hernández", ageMonths: 91, sas: { V: 88, Q: 117, N: 127 }, supports: ["ELL"], accommodations: ["spanish-directions"] },
  { id: "eli-goldberg", first: "Eli", last: "Goldberg", ageMonths: 97, sas: { V: 112, Q: 101, N: 90 }, supports: ["IEP"], accommodations: ["read-aloud", "extended-time", "breaks"] },
  { id: "jaylen-brooks", first: "Jaylen", last: "Brooks", ageMonths: 93, sas: { V: 108, Q: 111, N: 79 }, flags: { N: "omitted" } },
  { id: "sophie-tran", first: "Sophie", last: "Tran", ageMonths: 90, sas: { V: 87, Q: 111, N: 110 }, flags: { V: "inconsistent" } },
  { id: "priya-raman", first: "Priya", last: "Raman", ageMonths: 96, sas: { V: 131, Q: 128, N: 124 } },
  { id: "noah-whitfield", first: "Noah", last: "Whitfield", ageMonths: 94, sas: { V: 101, Q: 98, N: 104 } },
  { id: "lucia-morales", first: "Lucía", last: "Morales", ageMonths: 89, sas: { V: 86, Q: 99, N: 112 }, supports: ["ELL"], accommodations: ["spanish-directions"] },
  { id: "kai-nakamura", first: "Kai", last: "Nakamura", ageMonths: 92, sas: { V: 118, Q: 122, N: 115 } },
  { id: "zoe-bennett", first: "Zoe", last: "Bennett", ageMonths: 98, sas: { V: 95, Q: 90, N: 97 } },
  { id: "omar-haddad", first: "Omar", last: "Haddad", ageMonths: 95, sas: { V: 98, Q: 112, N: 101 } },
  { id: "grace-liu", first: "Grace", last: "Liu", ageMonths: 90, sas: { V: 99, Q: 104, N: 101 } },
  { id: "darius-coleman", first: "Darius", last: "Coleman", ageMonths: 96, sas: { V: 110, Q: 96, N: 113 }, supports: ["504"], accommodations: ["breaks", "magnify"] },
  { id: "isabella-rossi", first: "Isabella", last: "Rossi", ageMonths: 93, sas: { V: 92, Q: 88, N: 95 } },
  { id: "ethan-park", first: "Ethan", last: "Park", ageMonths: 99, sas: { V: 107, Q: 124, N: 100 }, flags: { Q: "inconsistent" } },
  { id: "fatima-siddiqui", first: "Fatima", last: "Siddiqui", ageMonths: 91, sas: { V: 115, Q: 109, N: 126 } },
  { id: "liam-obrien", first: "Liam", last: "O'Brien", ageMonths: 97, sas: { V: 84, Q: 92, N: 90 } },
  { id: "maya-johnson", first: "Maya", last: "Johnson", ageMonths: 92, sas: { V: 102, Q: 99, N: 96 } },
  { id: "santiago-ruiz", first: "Santiago", last: "Ruiz", ageMonths: 94, sas: { V: 90, Q: 106, N: 118 }, supports: ["ELL"], accommodations: ["spanish-directions"] },
  { id: "hannah-schmidt", first: "Hannah", last: "Schmidt", ageMonths: 95, sas: { V: 97, Q: 101, N: 93 } },
  { id: "aiden-murphy", first: "Aiden", last: "Murphy", ageMonths: 98, sas: { V: 105, Q: 95, N: 99 }, supports: ["IEP"], accommodations: ["read-aloud", "switch-access"] },
  { id: "chloe-dubois", first: "Chloé", last: "Dubois", ageMonths: 90, sas: { V: 120, Q: 113, N: 111 } },
  { id: "ryan-patel", first: "Ryan", last: "Patel", ageMonths: 93, sas: { V: 93, Q: 72, N: 98 }, flags: { Q: "targeted" } },
  { id: "ava-thompson", first: "Ava", last: "Thompson", ageMonths: 96, sas: { V: 109, Q: 112, N: 106 } },
];

export function buildStudent(seed: StudentSeed): Student {
  const composite = compositeSas(BATTERIES.map((b) => seed.sas[b]));
  const pr = { V: sasToPercentile(seed.sas.V), Q: sasToPercentile(seed.sas.Q), N: sasToPercentile(seed.sas.N), C: sasToPercentile(composite) };
  const stanine = { V: sasToStanine(seed.sas.V), Q: sasToStanine(seed.sas.Q), N: sasToStanine(seed.sas.N), C: sasToStanine(composite) };
  return { ...seed, name: `${seed.first} ${seed.last}`, composite, pr, stanine, profile: abilityProfile(seed.sas) };
}

export const STUDENTS: Student[] = SEEDS.map(buildStudent);

export function getStudent(id: string): Student | undefined {
  return STUDENTS.find((s) => s.id === id);
}

export function formatAge(months: number): string {
  return `${Math.floor(months / 12)} yr ${months % 12} mo`;
}

export function hasFlags(s: Student): boolean {
  return !!s.flags && Object.keys(s.flags).length > 0;
}

/* ---------- District local norms ---------- */

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 1,840 synthetic Grade 2 scores for the district. Maple Valley sits a little
 * below the national mean, which is exactly when local norms change who gets
 * a second look.
 */
export const DISTRICT_SAMPLE: number[] = (() => {
  const rand = mulberry32(2027);
  const out: number[] = [];
  for (let i = 0; i < 1840; i++) {
    const z = Math.sqrt(-2 * Math.log(rand() || 1e-9)) * Math.cos(2 * Math.PI * rand());
    out.push(Math.max(50, Math.min(160, Math.round(96 + z * 15))));
  }
  return out;
})();

export const DISTRICT_N = DISTRICT_SAMPLE.length;
