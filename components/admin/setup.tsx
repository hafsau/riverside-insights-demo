"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { RuleControl } from "@/components/educator/rule-control";
import { BatteryShape, Button, Callout, Card, Chip, PageHeader } from "@/components/ui";
import { ACCOMMODATIONS, ACCOMMODATION_BY_ID, constructEffect, EFFECT_LABEL, type AccommodationId, type ConstructEffect } from "@/lib/accommodations";
import { BATTERIES } from "@/lib/cogat/scores";
import { describeRule, missedByComposite, screenAll } from "@/lib/cogat/talent-pool";
import { CLASS, STUDENTS } from "@/lib/data/roster";
import { useStore } from "@/lib/store";

const STEPS = [
  { id: "window", label: "Set the testing window" },
  { id: "rule", label: "Choose a screening rule" },
  { id: "accommodations", label: "Assign accommodations" },
  { id: "readiness", label: "Run a device check" },
  { id: "publish", label: "Publish to teachers" },
] as const;

const LEVELS = [
  { grade: "K", level: "5/6", students: 412 },
  { grade: "1", level: "7", students: 398 },
  { grade: "2", level: "8", students: 1840 },
  { grade: "5", level: "11", students: 455 },
];

export function AdminSetup() {
  const { setupDone, markSetup, rule, setRule } = useStore();
  const done = STEPS.filter((s) => setupDone[s.id]).length;

  return (
    <>
      <PageHeader eyebrow={`District admin · ${CLASS.district}`} title="Set up fall screening">
        Five steps, about 20 minutes. Everything here is reversible until you publish.
      </PageHeader>
      <div className="mx-auto grid grid-cols-1 max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside aria-label="Setup checklist" className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-4">
            <p className="font-extrabold text-ink">Getting ready</p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-sunken" role="progressbar" aria-label="Setup progress" aria-valuemin={0} aria-valuemax={STEPS.length} aria-valuenow={done} aria-valuetext={`${done} of ${STEPS.length} steps done`}>
              <div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${(done / STEPS.length) * 100}%` }} />
            </div>
            <p className="mt-1 text-sm text-dim">
              {done} of {STEPS.length} done
            </p>
            <ol className="mt-3 space-y-1">
              {STEPS.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="flex min-h-11 items-center gap-3 rounded-md px-2 text-sm font-bold text-body hover:bg-sunken">
                    <span aria-hidden="true" className={`grid size-6 shrink-0 place-items-center rounded-full text-xs ${setupDone[s.id] ? "bg-good text-white" : "border-2 border-line-strong text-dim"}`}>
                      {setupDone[s.id] ? "✓" : i + 1}
                    </span>
                    {s.label}
                    <span className="sr-only">{setupDone[s.id] ? " (done)" : " (to do)"}</span>
                  </a>
                </li>
              ))}
            </ol>
          </Card>
        </aside>

        <div className="space-y-8">
          <Step n={1} id="window" title="Testing window" done={!!setupDone.window} onDone={(d) => markSetup("window", d)}>
            <WindowStep />
          </Step>

          <Step n={2} id="rule" title="Talent-pool screening rule" done={!!setupDone.rule} onDone={(d) => markSetup("rule", d)}>
            <p className="text-muted">Screening decides who gets a closer look, not who is placed. Reach shows what each rule means for your students before you commit.</p>
            <div className="mt-4">
              <RuleControl rule={rule} onChange={setRule} />
            </div>
            <CutoffSlider />
            <RulePreview />
          </Step>

          <Step n={3} id="accommodations" title="Accommodations" done={!!setupDone.accommodations} onDone={(d) => markSetup("accommodations", d)}>
            <AccommodationsStep />
          </Step>

          <Step n={4} id="readiness" title="Device check" done={!!setupDone.readiness} onDone={(d) => markSetup("readiness", d)}>
            <p className="text-muted">Teachers run a 2-minute check per classroom: audio for read-aloud, screen size for Level 5/6–8 picture items, and switch inputs where assigned.</p>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                ["Audio", "41 of 42 rooms ready"],
                ["Screen size", "42 of 42 rooms ready"],
                ["Switch inputs", "3 of 3 devices paired"],
              ].map(([k, v]) => (
                <li key={k} className="rounded-lg bg-sunken px-3 py-2">
                  <p className="text-sm font-bold text-ink">{k}</p>
                  <p className="text-sm text-muted">{v}</p>
                </li>
              ))}
            </ul>
          </Step>

          <Step n={5} id="publish" title="Publish to teachers" done={!!setupDone.publish} onDone={(d) => markSetup("publish", d)} doneLabel="Publish window">
            <Summary />
          </Step>
        </div>
      </div>
    </>
  );
}

function Step({ n, id, title, done, onDone, children, doneLabel = "Mark step done" }: { n: number; id: string; title: string; done: boolean; onDone: (d: boolean) => void; children: React.ReactNode; doneLabel?: string }) {
  const h = useId();
  return (
    <section id={id} aria-labelledby={h} className="scroll-mt-24">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 id={h} className="text-2xl font-extrabold text-ink">
            <span className="text-dim">{n}.</span> {title}
          </h2>
          {done && <Chip tone="good">Done</Chip>}
        </div>
        <div className="mt-3">{children}</div>
        <div className="mt-5 flex justify-end border-t border-line pt-4">
          <Button variant={done ? "secondary" : "primary"} onClick={() => onDone(!done)}>
            {done ? "Reopen step" : doneLabel}
          </Button>
        </div>
      </Card>
    </section>
  );
}

function WindowStep() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="w-start" className="block text-sm font-bold text-ink">
            Opens
          </label>
          <input id="w-start" type="date" defaultValue="2027-10-04" className="mt-1 min-h-11 w-full rounded-lg border border-line-strong bg-raised px-3" />
        </div>
        <div>
          <label htmlFor="w-end" className="block text-sm font-bold text-ink">
            Closes
          </label>
          <input id="w-end" type="date" defaultValue="2027-10-15" aria-describedby="w-end-hint" className="mt-1 min-h-11 w-full rounded-lg border border-line-strong bg-raised px-3" />
          <p id="w-end-hint" className="mt-1 text-sm text-dim">
            Results reach teachers the morning after it closes.
          </p>
        </div>
      </div>
      <table className="w-full text-left text-sm">
        <caption className="mb-2 text-left font-bold text-ink">Grades and levels in this window</caption>
        <thead>
          <tr className="border-b border-line-strong text-dim">
            <th scope="col" className="py-2 font-bold">
              Grade
            </th>
            <th scope="col" className="py-2 font-bold">
              Level
            </th>
            <th scope="col" className="py-2 font-bold">
              How items are presented
            </th>
            <th scope="col" className="py-2 text-right font-bold">
              Students
            </th>
          </tr>
        </thead>
        <tbody className="tnum">
          {LEVELS.map((l) => (
            <tr key={l.grade} className="border-b border-line">
              <th scope="row" className="py-2 font-bold text-ink">
                {l.grade}
              </th>
              <td className="py-2">{l.level}</td>
              <td className="py-2 text-muted">{["5/6", "7", "8"].includes(l.level) ? "Pictures, every prompt spoken" : "Students read items themselves"}</td>
              <td className="py-2 text-right">{l.students.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CutoffSlider() {
  const { rule, setRule } = useStore();
  const id = useId();
  return (
    <div className="mt-5 max-w-md">
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        Cutoff: {rule.cutoff}th percentile
      </label>
      <input
        id={id}
        type="range"
        min={80}
        max={98}
        step={1}
        value={rule.cutoff}
        aria-valuetext={`${rule.cutoff}th percentile`}
        onChange={(e) => setRule({ ...rule, cutoff: Number(e.target.value) })}
        className="mt-2 w-full accent-navy"
      />
      <div className="flex justify-between text-xs text-dim" aria-hidden="true">
        <span>80th · wider net</span>
        <span>98th · narrower</span>
      </div>
    </div>
  );
}

function RulePreview() {
  const { rule } = useStore();
  const pool = screenAll(STUDENTS, rule).filter((s) => s.qualifies);
  const missed = missedByComposite(STUDENTS, rule);
  const pct = Math.round((pool.length / STUDENTS.length) * 100);
  return (
    <div className="mt-5 rounded-xl border border-line bg-sunken p-4" aria-live="polite">
      <p className="text-sm font-bold text-dim">Preview: {CLASS.teacher}&apos;s class</p>
      <p className="mt-1 text-lg text-ink">
        <strong className="tnum">{pool.length}</strong> of {STUDENTS.length} students ({pct}%) would be reviewed: {describeRule(rule)}.
      </p>
      {missed.length > 0 && <p className="mt-1 text-sm text-muted">Includes {missed.map((s) => s.first).join(" and ")}, whom a composite-only rule would miss.</p>}
      <Link href="/educator" className="link mt-2 inline-block text-sm font-bold">
        See it in the teacher&apos;s view
      </Link>
    </div>
  );
}

const EFFECT_STYLE: Record<ConstructEffect, string> = {
  neutral: "text-good",
  directions: "text-link",
  flag: "text-warn",
};
const EFFECT_ICON: Record<ConstructEffect, string> = { neutral: "●", directions: "◐", flag: "†" };

function AccommodationsStep() {
  const { accommodations, toggleAccommodation } = useStore();
  const [scope, setScope] = useState<"supported" | "all">("supported");
  const [level, setLevel] = useState("8");
  const [lastNote, setLastNote] = useState("");

  const rows = useMemo(() => (scope === "all" ? STUDENTS : STUDENTS.filter((s) => s.supports?.length || (accommodations[s.id] ?? []).length)), [scope, accommodations]);
  const assignable = ACCOMMODATIONS.filter((a) => !a.universal);

  const toggle = (sid: string, aid: AccommodationId, name: string) => {
    const on = !(accommodations[sid] ?? []).includes(aid);
    toggleAccommodation(sid, aid);
    const flags = BATTERIES.filter((b) => constructEffect(aid, b, CLASS.level) === "flag");
    setLastNote(`${ACCOMMODATION_BY_ID[aid].short} ${on ? "assigned to" : "removed from"} ${name}.${on && flags.length ? ` Scores on ${flags.join(", ")} will carry a footnote.` : ""}`);
  };

  return (
    <div>
      <p className="text-muted">
        Accommodations follow the student into the test player and onto every score report. Universal tools (magnify, contrast, cross-out, reduced motion) are open to every student, so none of them needs an assignment.
      </p>

      <h3 className="mt-5 font-extrabold text-ink">What each accommodation does to scores</h3>
      <div className="mt-2 flex flex-wrap items-center gap-2" role="group" aria-label="Show effects at level">
        {[
          ["8", "Level 8 (Grade 2)"],
          ["11", "Level 11 (Grade 5)"],
        ].map(([v, l]) => (
          <button key={v} type="button" aria-pressed={level === v} onClick={() => setLevel(v)} className={`min-h-11 rounded-full border px-4 text-sm font-bold ${level === v ? "border-navy bg-navy text-white" : "border-line-strong text-muted hover:border-navy"}`}>
            {l}
          </button>
        ))}
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <caption className="sr-only">Effect of each accommodation on each battery at level {level}</caption>
          <thead>
            <tr className="border-b border-line-strong text-dim">
              <th scope="col" className="py-2 pr-3 font-bold">
                Accommodation
              </th>
              {BATTERIES.map((b) => (
                <th key={b} scope="col" className="py-2 pr-3 font-bold">
                  <span className="inline-flex items-center gap-1.5">
                    <BatteryShape b={b} />
                    {b}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ACCOMMODATIONS.map((a) => (
              <tr key={a.id} className="border-b border-line align-top">
                <th scope="row" className="py-2 pr-3 font-normal">
                  <span className="font-bold text-ink">{a.label}</span>
                  {a.universal && (
                    <span className="ml-2">
                      <Chip>Universal</Chip>
                    </span>
                  )}
                  <span className="mt-0.5 block text-xs text-dim">{a.description}</span>
                </th>
                {BATTERIES.map((b) => {
                  const e = constructEffect(a.id, b, level);
                  return (
                    <td key={b} className={`py-2 pr-3 font-bold whitespace-nowrap ${EFFECT_STYLE[e]}`}>
                      <span aria-hidden="true">{EFFECT_ICON[e]} </span>
                      {EFFECT_LABEL[e]}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {level === "11" && (
        <div className="mt-3">
          <Callout tone="warn" title="Why read-aloud changes at Level 11">
            From Level 9 up, students read Verbal items themselves, so reading is part of what the Verbal battery measures. Read-aloud is still allowed there, but the Verbal score is footnoted. This rule needs Psychometrics sign-off; it&apos;s shown here as the kind of decision the
            design surfaces.
          </Callout>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <h3 className="font-extrabold text-ink">
          Assign for {CLASS.teacher}&apos;s class (Level {CLASS.level})
        </h3>
        <div role="group" aria-label="Show students" className="flex gap-2">
          {[
            ["supported", "IEP, 504 or ELL"],
            ["all", "All students"],
          ].map(([v, l]) => (
            <button key={v} type="button" aria-pressed={scope === v} onClick={() => setScope(v as "supported" | "all")} className={`min-h-11 rounded-full border px-4 text-sm font-bold ${scope === v ? "border-navy bg-navy text-white" : "border-line-strong text-muted hover:border-navy"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <p role="status" className="mt-2 min-h-6 text-sm font-bold text-ink">
        {lastNote}
      </p>
      <Card className="mt-2 overflow-x-auto shadow-none">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">Accommodations by student. Each checkbox assigns one accommodation to one student.</caption>
          <thead className="bg-sunken text-dim">
            <tr>
              <th scope="col" className="px-3 py-2 font-bold">
                Student
              </th>
              {assignable.map((a) => (
                <th key={a.id} scope="col" className="px-2 py-2 text-center font-bold">
                  {a.short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <th scope="row" className="px-3 py-2 font-bold text-ink">
                  {s.name}
                  <span className="ml-2 inline-flex gap-1">
                    {s.supports?.map((x) => (
                      <Chip key={x}>{x}</Chip>
                    ))}
                  </span>
                </th>
                {assignable.map((a) => {
                  const on = (accommodations[s.id] ?? []).includes(a.id);
                  return (
                    <td key={a.id} className="px-2 py-1 text-center">
                      <label className="inline-grid size-11 cursor-pointer place-items-center rounded-md hover:bg-sunken">
                        <input type="checkbox" checked={on} onChange={() => toggle(s.id, a.id, s.first)} className="size-5 accent-navy" aria-label={`${a.short} for ${s.name}`} />
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="mt-2 text-sm text-dim">
        Changes here show up in the{" "}
        <Link href="/student" className="link">
          student player
        </Link>{" "}
        and on the{" "}
        <Link href="/educator" className="link">
          score report
        </Link>{" "}
        right away.
      </p>
    </div>
  );
}

function Summary() {
  const { rule, accommodations } = useStore();
  const withAcc = Object.values(accommodations).filter((a) => a.length).length;
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {[
        ["Window", CLASS.window],
        ["Screening rule", describeRule(rule)],
        ["Accommodations", `${withAcc} students in ${CLASS.teacher}'s class`],
      ].map(([k, v]) => (
        <div key={k} className="rounded-lg bg-sunken px-3 py-2">
          <dt className="text-sm font-bold text-dim">{k}</dt>
          <dd className="mt-0.5 text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
