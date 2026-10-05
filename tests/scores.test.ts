import { describe, expect, it } from "vitest";
import { ACCOMMODATIONS, constructEffect, flaggedBatteries } from "@/lib/accommodations";
import { abilityProfile, compositeSas, localPercentile, percentileToStanine, sasToPercentile, sasToStanine } from "@/lib/cogat/scores";
import { DEFAULT_RULE, missedByComposite, screen, screenAll } from "@/lib/cogat/talent-pool";
import { contrast, grade } from "@/lib/contrast";
import { getStudent, STUDENTS } from "@/lib/data/roster";

describe("SAS conversions", () => {
  it("puts SAS 100 at the 50th percentile, stanine 5", () => {
    expect(sasToPercentile(100)).toBe(50);
    expect(sasToStanine(100)).toBe(5);
  });

  it("matches published SAS ↔ percentile anchors (mean 100, SD 16)", () => {
    expect(sasToPercentile(116)).toBe(84); // +1 SD
    expect(sasToPercentile(84)).toBe(16); // −1 SD
    expect(sasToPercentile(132)).toBe(98); // +2 SD
    expect(sasToPercentile(130)).toBe(97);
  });

  it("clamps percentile ranks to 1–99", () => {
    expect(sasToPercentile(160)).toBe(99);
    expect(sasToPercentile(50)).toBe(1);
  });

  it("uses the 4-7-12-17-20-17-12-7-4 stanine bands", () => {
    expect([3, 4, 10, 11, 22, 23, 39, 40, 59, 60, 76, 77, 88, 89, 95, 96, 99].map(percentileToStanine)).toEqual([1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9]);
  });
});

describe("Ability Profiles", () => {
  it("A: all three scores at about the same level", () => {
    expect(abilityProfile({ V: 101, Q: 98, N: 104 }).code).toBe("5A");
  });

  it("B: one relative strength", () => {
    expect(abilityProfile({ V: 128, Q: 146, N: 134 }).code).toBe("9B (Q+)");
  });

  it("B: one relative weakness", () => {
    expect(abilityProfile({ V: 110, Q: 96, N: 113 }).code).toBe("6B (Q-)");
  });

  it("C: a strength and a weakness, listed in V-Q-N order", () => {
    expect(abilityProfile({ V: 112, Q: 101, N: 90 }).code).toBe("5C (V+ N-)");
  });

  it("E: two scores 24+ points apart", () => {
    expect(abilityProfile({ V: 88, Q: 117, N: 127 }).code).toBe("7E (V- N+)");
  });

  it("E always names the driver even when the median sits between", () => {
    const p = abilityProfile({ V: 88, Q: 100, N: 112 });
    expect(p.pattern).toBe("E");
    expect(p.code).toBe("5E (V- N+)");
  });

  it("composite spreads further from 100 than the mean", () => {
    expect(compositeSas([130, 130, 130])).toBeGreaterThan(130);
    expect(compositeSas([80, 80, 80])).toBeLessThan(80);
    expect(compositeSas([100, 100, 100])).toBe(100);
  });
});

describe("local norms and talent pool", () => {
  it("ranks within a local sample", () => {
    expect(localPercentile(5, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(45);
    expect(localPercentile(100, [1, 2, 3])).toBe(99);
  });

  it("local norms widen the pool in a district below the national mean", () => {
    const national = screenAll(STUDENTS, { norms: "national", scope: "any", cutoff: 97 }).filter((s) => s.qualifies);
    const local = screenAll(STUDENTS, DEFAULT_RULE).filter((s) => s.qualifies);
    expect(national.length).toBe(2);
    expect(local.length).toBe(7);
  });

  it("names who a composite-only rule would miss", () => {
    expect(missedByComposite(STUDENTS, DEFAULT_RULE).map((s) => s.first)).toEqual(["Mateo", "Santiago"]);
  });

  it("never qualifies a student on a flagged score; asks to check first", () => {
    const ethan = screen(getStudent("ethan-park")!, DEFAULT_RULE);
    expect(ethan.qualifies).toBe(false);
    expect(ethan.checkFirst).toBe(true);
  });
});

describe("accommodations", () => {
  it("read-aloud is neutral at primary levels and flags Verbal at upper levels", () => {
    expect(constructEffect("read-aloud", "V", "8")).toBe("neutral");
    expect(constructEffect("read-aloud", "V", "11")).toBe("flag");
    expect(constructEffect("read-aloud", "N", "11")).toBe("neutral");
  });

  it("extended time footnotes every battery", () => {
    expect(flaggedBatteries(["extended-time", "breaks"], "8")).toEqual(["V", "Q", "N"]);
  });

  it("every accommodation is described", () => {
    for (const a of ACCOMMODATIONS) expect(a.description.length).toBeGreaterThan(40);
  });
});

describe("contrast", () => {
  it("computes WCAG ratios", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrast("#ffffff", "#ffffff")).toBe(1);
  });

  it("Riverside's brand blue fails AA for body text; the text step passes", () => {
    expect(grade(contrast("#0380C4", "#ffffff"))).toBe("AA large");
    expect(grade(contrast("#036CA6", "#ffffff"))).toBe("AA");
  });

  it("control borders meet 3:1 on every surface (WCAG 1.4.11)", () => {
    for (const bg of ["#ffffff", "#f5fafe", "#eef6fc"]) expect(contrast("#7d8792", bg)).toBeGreaterThanOrEqual(3);
  });

  it("white on Riverside's green and navy buttons passes AA", () => {
    expect(contrast("#ffffff", "#4b8316")).toBeGreaterThanOrEqual(4.5);
    expect(contrast("#ffffff", "#003360")).toBeGreaterThanOrEqual(4.5);
  });
});
