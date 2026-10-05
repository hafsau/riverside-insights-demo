import { BATTERY_NAME, type Battery } from "@/lib/cogat/scores";
import type { ScoreFlag } from "@/lib/data/roster";

export type Row = { key: Battery | "C"; label: string; sas: number; flag?: ScoreFlag; footnote?: boolean };

export function batteryRows(sas: Record<Battery, number>, composite: number, flags?: Partial<Record<Battery, ScoreFlag>>, footnoted: Battery[] = []): Row[] {
  return [
    ...(["V", "Q", "N"] as Battery[]).map((b) => ({ key: b, label: BATTERY_NAME[b], sas: sas[b], flag: flags?.[b], footnote: footnoted.includes(b) })),
    { key: "C" as const, label: "Composite", sas: composite, footnote: footnoted.length > 0 },
  ];
}
