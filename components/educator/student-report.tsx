"use client";

import Link from "next/link";
import { ScoreChart } from "@/components/score-chart";
import { batteryRows } from "@/lib/score-rows";
import { BatteryLabel, Callout, Card, Chip, FlagChip, LinkButton, ProfileBadge } from "@/components/ui";
import { ACCOMMODATION_BY_ID, constructEffect, EFFECT_LABEL, flaggedBatteries } from "@/lib/accommodations";
import { headline, teacherNotes } from "@/lib/cogat/explain";
import { BATTERIES, ordinal, PATTERN_MEANING, type Battery } from "@/lib/cogat/scores";
import { describeRule, percentileFor, screen } from "@/lib/cogat/talent-pool";
import { CLASS, formatAge, getStudent } from "@/lib/data/roster";
import { useStore } from "@/lib/store";

export function StudentReport({ id }: { id: string }) {
  const s = getStudent(id)!;
  const { accommodations, rule } = useStore();
  const acc = accommodations[s.id] ?? [];
  const footnoted = flaggedBatteries(acc, CLASS.level);
  const scr = screen(s, rule);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="no-print text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-dim">
          <li>
            <Link href="/educator" className="link">
              {CLASS.teacher}&apos;s class
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-bold text-ink">
            {s.name}
          </li>
        </ol>
      </nav>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-3xl">
          <p className="eyebrow">
            {CLASS.grade} · Age {formatAge(s.ageMonths)} · Level {CLASS.level}
          </p>
          <h1 className="display mt-2 text-4xl">{s.name}</h1>
          <p className="mt-3 text-xl leading-snug text-body">{headline(s)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {s.supports?.map((x) => (
              <Chip key={x}>{x}</Chip>
            ))}
            {scr.qualifies && <Chip tone="good">Talent pool review</Chip>}
            {scr.checkFirst && <Chip tone="warn">Would qualify, check score first</Chip>}
          </div>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <LinkButton href={`/educator/${s.id}/family`}>Family report (print / PDF)</LinkButton>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-4">
              <ProfileBadge profile={s.profile} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">Ability profile</p>
                <p className="text-sm text-muted">
                  Stanine {s.profile.stanine} median · Pattern {s.profile.pattern}: {PATTERN_MEANING[s.profile.pattern]}
                </p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {BATTERIES.map((b) => (
                <Stat key={b} label={<BatteryLabel b={b} />} sas={s.sas[b]} pr={s.pr[b]} flagged={!!s.flags?.[b]} />
              ))}
              <Stat label="Composite (VQN)" sas={s.composite} pr={s.pr.C} />
            </dl>
          </Card>

          <Card className="p-5 sm:p-6">
            <ScoreChart caption="Standard Age Scores with likely range" rows={batteryRows(s.sas, s.composite, s.flags, footnoted)} cutoff={rule.norms === "national" ? { sas: 130, label: "Talent pool (national 97th)" } : undefined} />
          </Card>

          <Card className="p-5 sm:p-6">
            <h2 className="text-xl font-extrabold text-ink">What to do with this</h2>
            <ul className="mt-3 space-y-3">
              {teacherNotes(s).map((n) => (
                <li key={n} className="flex gap-3 leading-relaxed text-body">
                  <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-brand" />
                  {n}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside aria-label="Testing conditions and screening" className="space-y-6">
          {s.flags && (
            <Callout tone="warn" title="Check before using">
              <div className="mt-1 flex flex-wrap gap-1">
                {Object.entries(s.flags).map(([b, f]) => (
                  <FlagChip key={b} battery={b as Battery} flag={f} />
                ))}
              </div>
            </Callout>
          )}

          <Card className="p-5">
            <h2 className="font-extrabold text-ink">Testing conditions</h2>
            {acc.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Standard administration. No accommodations assigned.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {acc.map((a) => {
                  const effects = BATTERIES.map((b) => constructEffect(a, b, CLASS.level));
                  const worst = effects.includes("flag") ? "flag" : effects.includes("directions") ? "directions" : "neutral";
                  return (
                    <li key={a} className="text-sm">
                      <p className="font-bold text-ink">{ACCOMMODATION_BY_ID[a].label}</p>
                      <p className={worst === "flag" ? "text-warn" : "text-dim"}>
                        {worst === "flag" ? "† " : ""}
                        {EFFECT_LABEL[worst]}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            {footnoted.length > 0 && <p className="mt-3 border-t border-line pt-3 text-xs text-dim">† Norms assume standard timing. Scores are valid for instruction; note the condition when comparing to the norm group.</p>}
            <Link href="/admin#accommodations" className="link mt-3 inline-block text-sm font-bold">
              Change in testing setup
            </Link>
          </Card>

          <Card className="p-5">
            <h2 className="font-extrabold text-ink">Talent pool screen</h2>
            <p className="mt-1 text-sm text-muted">{describeRule(rule)}.</p>
            <table className="mt-3 w-full text-sm tnum">
              <caption className="sr-only">Percentile used for screening</caption>
              <thead>
                <tr className="text-dim">
                  <th scope="col" className="py-1 text-left font-bold">
                    Score
                  </th>
                  <th scope="col" className="py-1 text-right font-bold">
                    {rule.norms === "local" ? "District %ile" : "National %ile"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(["C", ...BATTERIES] as const).map((k) => {
                  const p = percentileFor(s, k, rule.norms);
                  const met = p >= rule.cutoff;
                  return (
                    <tr key={k} className="border-t border-line">
                      <th scope="row" className="py-1.5 text-left font-normal">
                        {k === "C" ? "Composite" : <BatteryLabel b={k} />}
                      </th>
                      <td className={`py-1.5 text-right ${met ? "font-bold text-good" : ""}`}>
                        {ordinal(p)}
                        {met && <span className="sr-only"> (meets cutoff)</span>}
                        {met && <span aria-hidden="true"> ✓</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className={`mt-3 text-sm font-bold ${scr.qualifies ? "text-good" : scr.checkFirst ? "text-warn" : "text-muted"}`}>
              {scr.qualifies ? "Meets the screening rule. Add to the review list." : scr.checkFirst ? "Would meet the rule on a flagged score. Check before deciding." : "Does not meet this screening rule."}
            </p>
            <p className="mt-2 text-xs text-dim">Screening opens a review. It never decides placement on one score.</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, sas, pr, flagged }: { label: React.ReactNode; sas: number; pr: number; flagged?: boolean }) {
  return (
    <div className="rounded-lg bg-sunken px-3 py-2.5">
      <dt className="text-sm font-bold text-muted">{label}</dt>
      <dd className="mt-1">
        <span className={`text-2xl font-extrabold tnum ${flagged ? "text-warn" : "text-ink"}`}>
          {sas}
          {flagged && (
            <span aria-hidden="true" className="ml-1 text-base">
              ⚠
            </span>
          )}
        </span>
        <span className="ml-1 text-sm text-dim tnum">SAS · {ordinal(pr)} %ile</span>
        {flagged && <span className="sr-only">, check before using</span>}
      </dd>
    </div>
  );
}
