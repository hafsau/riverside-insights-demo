"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RuleControl } from "@/components/educator/rule-control";
import { BatteryLabel, BatteryShape, Card, Chip, FlagChip, LinkButton, PageHeader, ProfileBadge } from "@/components/ui";
import { ACCOMMODATION_BY_ID } from "@/lib/accommodations";
import { BATTERIES, BATTERY_NAME, type Battery } from "@/lib/cogat/scores";
import { describeRule, missedByComposite, screenAll, type Screen } from "@/lib/cogat/talent-pool";
import { CLASS, DISTRICT_N, formatAge, hasFlags, STUDENTS, type Student } from "@/lib/data/roster";
import { useStore } from "@/lib/store";

type SortKey = "name" | "age" | Battery | "composite" | "profile";
type Filter = "all" | "pool" | "check" | "extreme" | "supported";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All students" },
  { value: "pool", label: "Talent pool review" },
  { value: "check", label: "Check first" },
  { value: "extreme", label: "Large gaps (E)" },
  { value: "supported", label: "With accommodations" },
];

export function ClassResults() {
  const { rule, setRule, accommodations } = useStore();
  const [sort, setSort] = useState<{ key: SortKey; dir: "ascending" | "descending" }>({ key: "composite", dir: "descending" });
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const screens = useMemo(() => screenAll(STUDENTS, rule), [rule]);
  const pool = screens.filter((s) => s.qualifies);
  const check = STUDENTS.filter(hasFlags);
  const missed = missedByComposite(STUDENTS, rule);
  const byId = useMemo(() => Object.fromEntries(screens.map((s) => [s.student.id, s])) as Record<string, Screen>, [screens]);

  const groups = (["V", "Q", "N"] as Battery[]).map((b) => ({ b, students: STUDENTS.filter((s) => s.profile.strengths.includes(b) && !s.flags?.[b]) }));

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = STUDENTS.filter((s) => !q || s.name.toLowerCase().includes(q));
    if (filter === "pool") list = list.filter((s) => byId[s.id].qualifies);
    if (filter === "check") list = list.filter(hasFlags);
    if (filter === "extreme") list = list.filter((s) => s.profile.pattern === "E");
    if (filter === "supported") list = list.filter((s) => (accommodations[s.id] ?? []).length > 0);
    const val = (s: Student): string | number =>
      sort.key === "name" ? s.last : sort.key === "age" ? s.ageMonths : sort.key === "composite" ? s.composite : sort.key === "profile" ? s.profile.stanine * 10 + "ABCE".indexOf(s.profile.pattern) : s.sas[sort.key];
    return [...list].sort((a, b) => {
      const [x, y] = [val(a), val(b)];
      const c = typeof x === "string" ? x.localeCompare(y as string) : (x as number) - (y as number);
      return sort.dir === "ascending" ? c : -c;
    });
  }, [query, filter, sort, byId, accommodations]);

  const sortBy = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key && s.dir === "descending" ? "ascending" : key === "name" ? "ascending" : "descending" }));

  return (
    <>
      <PageHeader
        eyebrow={`${CLASS.teacher} · ${CLASS.grade} · ${CLASS.school}`}
        title="Fall screening results"
        actions={
          <>
            <LinkButton variant="secondary" href="/admin">
              Testing setup
            </LinkButton>
          </>
        }
      >
        {CLASS.assessment}, Level {CLASS.level}. {STUDENTS.length} students tested {CLASS.window}. Scores are Standard Age Scores (SAS): 100 is average for age.
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="sr-only">Decisions</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* 1. Talent pool */}
          <Card className="flex flex-col p-5 lg:col-span-1">
            <p className="eyebrow">Decision 1 · Talent pool</p>
            <h3 className="mt-1 text-2xl font-extrabold text-ink" aria-live="polite">
              <span className="tnum">{pool.length}</span> to review
            </h3>
            <p className="mt-1 text-sm text-muted">{describeRule(rule)}.</p>
            <div className="mt-3">
              <RuleControl rule={rule} onChange={setRule} />
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {pool.map((s) => (
                <li key={s.student.id}>
                  <Link href={`/educator/${s.student.id}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-good/40 bg-good-soft px-3 text-sm font-bold text-good hover:border-good">
                    {s.student.name}
                    <span className="text-xs font-normal text-good">via {s.via.map((v) => (v === "C" ? "Comp" : v)).join(", ")}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {missed.length > 0 && (
              <p className="mt-4 rounded-lg bg-brand-soft px-3 py-2 text-sm text-body">
                <strong className="text-ink">Equity check:</strong> a composite-only rule would miss {missed.map((s) => s.first).join(" and ")}.{" "}
                {missed.every((s) => s.supports?.includes("ELL")) ? "Both are English learners whose strengths show in Quantitative or Nonverbal reasoning." : ""}
              </p>
            )}
            {rule.norms === "local" && <p className="mt-2 text-xs text-dim">District norms: {DISTRICT_N.toLocaleString()} Grade 2 students in {CLASS.district}.</p>}
          </Card>

          {/* 2. Check first */}
          <Card className="flex flex-col p-5">
            <p className="eyebrow">Decision 2 · Score quality</p>
            <h3 className="mt-1 text-2xl font-extrabold text-ink">
              <span className="tnum">{check.length}</span> scores to check first
            </h3>
            <p className="mt-1 text-sm text-muted">These scores may not reflect what the student can do. Reach keeps them out of the talent pool until someone looks.</p>
            <ul className="mt-4 divide-y divide-line">
              {check.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <Link href={`/educator/${s.id}`} className="link font-bold">
                    {s.name}
                  </Link>
                  {Object.entries(s.flags!).map(([b, f]) => (
                    <FlagChip key={b} battery={b as Battery} flag={f} />
                  ))}
                </li>
              ))}
            </ul>
          </Card>

          {/* 3. Teach to strengths */}
          <Card className="flex flex-col p-5">
            <p className="eyebrow">Decision 3 · Instruction</p>
            <h3 className="mt-1 text-2xl font-extrabold text-ink">Groups by strength</h3>
            <p className="mt-1 text-sm text-muted">Students with a clear relative strength. Everyone else has an even (A) profile.</p>
            <ul className="mt-4 space-y-3">
              {groups.map((g) => (
                <li key={g.b}>
                  <p className="text-sm font-bold text-ink">
                    <BatteryLabel b={g.b} /> <span className="font-normal text-dim">· {g.students.length} students</span>
                  </p>
                  <p className="mt-0.5 text-sm text-muted">{g.students.map((s) => s.first).join(", ") || "None this window"}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Roster */}
        <section aria-labelledby="roster-h" className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="roster-h" className="text-2xl font-extrabold text-ink">
                Class roster
              </h2>
              <p className="mt-1 text-sm text-muted">Select a column heading to sort. Select a name for the full report.</p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label htmlFor="roster-search" className="text-xs font-bold tracking-wide text-dim uppercase">
                  Find a student
                </label>
                <input
                  id="roster-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="mt-1 block min-h-11 w-56 rounded-lg border border-line-strong bg-raised px-3"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>

          <div role="group" aria-label="Filter roster" className="mt-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
                className={`min-h-11 rounded-full border px-4 text-sm font-bold ${filter === f.value ? "border-navy bg-navy text-white" : "border-line-strong bg-raised text-muted hover:border-navy hover:text-ink"}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p role="status" className="mt-3 text-sm text-dim">
            Showing {rows.length} of {STUDENTS.length} students
          </p>

          <Card className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <caption className="sr-only">Class roster with Standard Age Scores, sorted by {sort.key} {sort.dir}</caption>
              <thead className="bg-sunken text-dim">
                <tr>
                  <SortTh label="Student" k="name" sort={sort} onSort={sortBy} />
                  <SortTh label="Age" k="age" sort={sort} onSort={sortBy} />
                  {BATTERIES.map((b) => (
                    <SortTh key={b} k={b} sort={sort} onSort={sortBy} align="right" label={BATTERY_NAME[b]} icon={<BatteryShape b={b} />} />
                  ))}
                  <SortTh label="Composite" k="composite" sort={sort} onSort={sortBy} align="right" />
                  <SortTh label="Ability profile" k="profile" sort={sort} onSort={sortBy} />
                  <th scope="col" className="px-3 py-2 font-bold">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="tnum">
                {rows.map((s) => {
                  const scr = byId[s.id];
                  const acc = accommodations[s.id] ?? [];
                  return (
                    <tr key={s.id} className="border-t border-line hover:bg-sunken/60">
                      <th scope="row" className="px-3 py-2.5 text-left">
                        <Link href={`/educator/${s.id}`} className="link font-bold">
                          {s.last}, {s.first}
                        </Link>
                      </th>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted">{formatAge(s.ageMonths)}</td>
                      {BATTERIES.map((b) => (
                        <td key={b} className="px-3 py-2.5 text-right">
                          <ScoreCell sas={s.sas[b]} flagged={!!s.flags?.[b]} strength={s.profile.strengths.includes(b)} weakness={s.profile.weaknesses.includes(b)} />
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-right font-bold text-ink">
                        {s.composite}
                        <span className="ml-1 text-xs font-normal text-dim">({s.pr.C})</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <ProfileBadge profile={s.profile} />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {scr.qualifies && <Chip tone="good">Talent pool</Chip>}
                          {scr.checkFirst && <Chip tone="warn">Would qualify · check</Chip>}
                          {s.supports?.map((x) => (
                            <Chip key={x}>{x}</Chip>
                          ))}
                          {acc.length > 0 && <Chip tone="brand">{acc.map((a) => ACCOMMODATION_BY_ID[a].short).join(", ")}</Chip>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
          <p className="mt-3 text-xs text-dim">
            SAS: Standard Age Score (mean 100, SD 16). Composite shows the age percentile in parentheses. <span className="font-bold">+</span> relative strength, <span className="font-bold">−</span> relative weakness,{" "}
            <span className="font-bold">⚠</span> check before using.
          </p>
        </section>
      </div>
    </>
  );
}

function SortTh({ label, k, sort, onSort, align = "left", icon }: { label: string; k: SortKey; sort: { key: SortKey; dir: string }; onSort: (k: SortKey) => void; align?: "left" | "right"; icon?: React.ReactNode }) {
  const active = sort.key === k;
  return (
    <th scope="col" aria-sort={active ? (sort.dir as "ascending" | "descending") : "none"} className={`px-1 py-1 font-bold ${align === "right" ? "text-right" : ""}`}>
      <button type="button" onClick={() => onSort(k)} className={`inline-flex min-h-10 items-center gap-1.5 rounded-md px-2 hover:bg-raised hover:text-ink ${active ? "text-ink" : ""}`}>
        {icon}
        {label}
        <svg aria-hidden="true" width="10" height="12" viewBox="0 0 10 12" className={active ? "opacity-100" : "opacity-40"}>
          <path d="M5 1 9 5H1Z" fill={active && sort.dir === "ascending" ? "currentColor" : "none"} stroke="currentColor" />
          <path d="M5 11 1 7h8Z" fill={active && sort.dir === "descending" ? "currentColor" : "none"} stroke="currentColor" />
        </svg>
      </button>
    </th>
  );
}

function ScoreCell({ sas, flagged, strength, weakness }: { sas: number; flagged: boolean; strength: boolean; weakness: boolean }) {
  return (
    <span className={`inline-flex items-center justify-end gap-1 ${flagged ? "text-warn" : "text-body"}`}>
      {sas}
      <span className="inline-block w-3 text-center font-bold" aria-hidden="true">
        {flagged ? "⚠" : strength ? "+" : weakness ? "−" : ""}
      </span>
      <span className="sr-only">{flagged ? "(check before using)" : strength ? "(relative strength)" : weakness ? "(relative weakness)" : ""}</span>
    </span>
  );
}
