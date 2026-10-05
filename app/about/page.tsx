import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Case study",
  description: "How I'd take Reach from zero to one: personas, the screening-season journey, information architecture for three roles, the decisions and the directions that lost, UX metrics, and the first 90 days of research.",
};

function Section({ n, eyebrow, title, children }: { n: string; eyebrow: string; title: string; children: ReactNode }) {
  const id = eyebrow.toLowerCase().replace(/[^a-z]+/g, "-");
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="grid scroll-mt-24 gap-6 border-t border-line py-14 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
      <div className="md:sticky md:top-24 md:self-start">
        <p className="eyebrow">
          {n} · {eyebrow}
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <h2 id={`${id}-h`} className="display max-w-[24ch] text-3xl sm:text-4xl">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
const P = ({ children }: { children: ReactNode }) => <p className="max-w-[68ch] text-lg leading-relaxed text-muted">{children}</p>;

const PERSONAS = [
  {
    name: "Mateo, 7",
    role: "Student · English learner",
    goal: "Understand what to do without asking, in the language Mateo thinks in.",
    moment: "Sitting with a Chromebook and headphones in a room of 24 classmates.",
    risk: "A Verbal score that measures English, not reasoning, and decides Mateo's year.",
    reach: "Spoken, captioned Spanish directions. Nonverbal strength visible on every report. An equity check on composite-only rules.",
  },
  {
    name: "Ms. Alvarez",
    role: "Grade 2 teacher",
    goal: "Know who needs what, before Monday's small groups.",
    moment: "A 15-minute planning block, on a laptop, sometimes on a phone in the hallway.",
    risk: "A wall of stanines to decode, so the report gets filed instead of used.",
    reach: "Three decisions above the fold. Plain-language notes per student. Family reports ready to print.",
  },
  {
    name: "Dana Okoye",
    role: "District G&T and assessment coordinator",
    goal: "Run universal screening for 1,840 second graders, fairly and defensibly.",
    moment: "Setting up the window in August; fielding parent questions in November.",
    risk: "A rule chosen in a settings menu that quietly excludes English learners, discovered by a parent.",
    reach: "A rule with a live preview, an equity check, and accommodations that carry through to every score.",
  },
  {
    name: "The Hernández family",
    role: "Parents · Spanish at home",
    goal: "Understand the letter that came home, and what happens next.",
    moment: "At the kitchen table, often reading on a phone.",
    risk: "Jargon (“SAS”, “stanine”, “E profile”) read as a verdict about their child.",
    reach: "A one-page family report, in Spanish, with no jargon on its face, and no IEP or ELL labels printed on it.",
  },
];

const JOURNEY = [
  { stage: "Plan", who: "Coordinator", hard: "Choosing levels, dates and a screening rule without seeing what the rule does.", answer: "Guided setup; rule preview with counts and who it reaches.", metric: "Setup completed without a support ticket" },
  { stage: "Prepare", who: "Coordinator, teachers", hard: "Accommodations live in IEP documents, re-entered by hand, and get lost on test day.", answer: "Assign once; the player applies them; reports disclose them.", metric: "Accommodations delivered as assigned (target 100%)" },
  { stage: "Test", who: "Students, proctors", hard: "Pre-readers who can't follow written directions; anxiety; devices without audio.", answer: "Spoken + captioned prompts, practice with feedback, no clock, device check.", metric: "K–2 sessions finished without adult help" },
  { stage: "Review", who: "Teachers", hard: "Reports built for psychometric completeness, not a 15-minute planning block.", answer: "Decisions first; flags that keep doubtful scores out of screening.", metric: "Time to name talent-pool candidates (< 60s)" },
  { stage: "Decide", who: "Coordinator, committee", hard: "Defending decisions to families and boards; missed students surfacing late.", answer: "Explicit rule, equity check, screening that opens a review, never a placement.", metric: "Share of review list from under-identified groups" },
  { stage: "Communicate", who: "Teachers, families", hard: "Letters that read as verdicts, often in the wrong language.", answer: "Print-first family report, English and Spanish, plain language.", metric: "Family comprehension in a 5-question check" },
  { stage: "Next year", who: "Existing CogAT customers", hard: "Moving from today's CogAT tools to a new platform mid-cycle.", answer: "Import rosters and prior scores; the same score formats so trend lines survive.", metric: "Migrated districts retained (churn)" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <header className="py-14">
        <p className="eyebrow">Case study</p>
        <h1 className="display mt-3 max-w-[20ch] text-4xl sm:text-6xl">Zero to one, for three roles at once</h1>
        <p className="mt-5 max-w-[60ch] text-xl leading-relaxed text-muted">
          The Reach role starts from a blank slate: no legacy patterns, a pilot in Fall 2027, and partners in Engineering, Psychometrics and Content. This page is the thinking behind the demo, and the work I&apos;d do next with real users.
        </p>
        <nav aria-label="Sections" className="mt-8">
          <ol className="flex flex-wrap gap-2 text-sm">
            {["Brief", "People", "Journey", "Structure", "Decisions", "Measures", "First 90 days", "Build", "Limits"].map((s, i) => (
              <li key={s}>
                <a href={`#${s.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-raised px-4 font-bold text-muted hover:border-navy hover:text-ink">
                  {String(i + 1).padStart(2, "0")} {s}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </header>

      <Section n="01" eyebrow="Brief" title="What Reach has to be on day one">
        <P>
          From Riverside&apos;s postings: Reach is the next generation of CogAT, then the Iowa Assessments, for students, educators and administrators. It pilots in Fall 2027, launches fully in 2028, and has to bring existing CogAT customers along without losing them.
        </P>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ["Multi-role", "Three roles with different devices, vocabularies and stakes, sharing one data model."],
            ["Measurement-safe", "Every UI choice in the player is also a psychometric choice. Design works with Psychometrics, not after."],
            ["Accessible by default", "Districts are bound by ADA Title II and Section 508 procurement. WCAG belongs in the tokens and the definition of done."],
          ].map(([t, b]) => (
            <Card key={t} className="p-5">
              <p className="font-extrabold text-ink">{t}</p>
              <p className="mt-1 leading-relaxed text-muted">{b}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section n="02" eyebrow="People" title="Four people, one screening season">
        <P>Proto-personas, built from Riverside&apos;s public materials, the Reach job postings and how CogAT is used for screening. They hold assumptions to test, not findings. Interviews in the first month replace them.</P>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {PERSONAS.map((p) => (
            <Card key={p.name} className="p-5">
              <p className="text-lg font-extrabold text-ink">{p.name}</p>
              <p className="text-sm font-bold text-link">{p.role}</p>
              <dl className="mt-3 space-y-2 text-sm">
                {(
                  [
                    ["Goal", p.goal],
                    ["Moment", p.moment],
                    ["What goes wrong", p.risk],
                    ["What Reach does", p.reach],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-bold text-ink">{k}</dt>
                    <dd className="leading-relaxed text-muted">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          ))}
        </div>
      </Section>

      <Section n="03" eyebrow="Journey" title="The screening season, end to end">
        <P>The journey crosses all three roles. Each stage has a hypothesis about what&apos;s hard today, Reach&apos;s answer, and the metric that tells us whether it worked.</P>
        <div className="overflow-x-auto rounded-xl border border-line bg-raised">
          <table className="w-full min-w-[860px] text-left text-sm">
            <caption className="sr-only">Screening season journey map</caption>
            <thead className="bg-sunken text-dim">
              <tr>
                {["Stage", "Who", "What's hard (hypothesis)", "Reach's answer", "Measured by"].map((h) => (
                  <th key={h} scope="col" className="px-3 py-2 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {JOURNEY.map((j, i) => (
                <tr key={j.stage} className="border-t border-line align-top">
                  <th scope="row" className="px-3 py-3">
                    <span className="flex items-center gap-2 font-extrabold text-ink">
                      <span aria-hidden="true" className="grid size-6 place-items-center rounded-full bg-navy text-xs text-white">
                        {i + 1}
                      </span>
                      {j.stage}
                    </span>
                  </th>
                  <td className="px-3 py-3 text-muted">{j.who}</td>
                  <td className="px-3 py-3 text-muted">{j.hard}</td>
                  <td className="px-3 py-3 text-body">{j.answer}</td>
                  <td className="px-3 py-3 font-bold text-leaf-ink">{j.metric}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section n="04" eyebrow="Structure" title="Information architecture: roles share objects, not screens">
        <P>
          Each role gets its own navigation, built from tasks rather than features. Underneath, five shared objects keep the roles consistent: a change to one shows up everywhere it&apos;s used. That&apos;s the thread this demo shows.
        </P>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Tree title="Admin" items={["Windows", "  Levels and dates", "  Screening rule", "  Accommodations", "  Device check", "Rosters and imports", "District reports"]} />
          <Tree title="Educator" items={["My classes", "  Class results", "    Decisions", "    Roster", "  Student report", "    Family report", "Help and training"]} />
          <Tree title="Student" items={["Today's session", "  Practice", "  Puzzles", "  Break", "  Done"]} />
        </div>
        <div className="rounded-xl border-2 border-dashed border-line-strong p-5">
          <p className="font-extrabold text-ink">Shared objects</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {["Student", "Window", "Screening rule", "Accommodation (with effect by battery and level)", "Score (with flags and footnotes)"].map((o) => (
              <li key={o} className="rounded-full bg-brand-soft px-3 py-1 text-sm font-bold text-navy">
                {o}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section n="05" eyebrow="Decisions" title="What I chose, and what lost">
        <div className="space-y-4">
          <Decision title="Lead the report with decisions, not scores" lost="A dashboard of distributions and charts. Complete, but it put decoding on the teacher. Scores are one click down, with a chart and a table.">
            The class view opens on three questions a teacher has to answer, with the answer and the names. Every number underneath is still there.
          </Decision>
          <Decision title="Make the screening rule an object with consequences" lost="A report filter (“show PR ≥ 90”). It hid that a choice was being made, and who it excluded.">
            The rule is set once by the district, shown wherever it applies, and previewed with counts. The equity check names the students that a composite-only rule would miss.
          </Decision>
          <Decision title="Accommodations as structured data" lost="A free-text “testing notes” field. It can't drive the player or footnote a score.">
            Each accommodation records its effect by battery and level, so the admin sees it when assigning, the player applies it, and the report discloses it.
          </Decision>
          <Decision title="Universal tools for everyone" lost="Gating magnify and contrast behind an accommodation. It singles children out, and it adds paperwork for supports that don't affect measurement.">
            Only supports that touch timing or the construct are assigned.
          </Decision>
          <Decision title="No clock for K–2" lost="A friendly animated timer. My hypothesis, to test in the pilot: a visible clock invites rushing and omitted items, the exact flag teachers then have to chase.">
            The proctor sees timing. The student sees stepping stones.
          </Decision>
        </div>
      </Section>

      <Section n="06" eyebrow="Measures" title="UX metrics that feed the roadmap">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["< 60 s", "Time for a teacher to name talent-pool candidates and scores to check, first visit"],
            ["≥ 90%", "Task success on the five core tasks per role (moderated, then unmoderated)"],
            ["≥ 80", "SUS for teachers and coordinators, tracked per release"],
            ["100%", "Accommodations delivered as assigned, from session logs"],
            ["↑", "K–2 sessions finished without adult intervention"],
            ["0", "Accessibility defects escaping to production at serious or critical severity"],
          ].map(([v, l]) => (
            <Card key={l} className="p-5">
              <p className="text-3xl font-extrabold text-navy tnum">{v}</p>
              <p className="mt-1 leading-relaxed text-muted">{l}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section n="07" eyebrow="First 90 days" title="How I'd replace these assumptions with evidence">
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            ["Days 1–30 · Listen", ["Stakeholder interviews: Product, Psychometrics, Content, Engineering, Customer Success", "Audit today's CogAT reports and support tickets", "8–10 interviews with teachers and coordinators", "Accessibility baseline of the current CogAT experience"]],
            ["Days 31–60 · Frame", ["Validated personas and the screening-season journey", "Tree test the three-role IA", "Usability test the score report with 6–8 teachers", "Kid-appropriate sessions: observation, short, with a familiar adult", "Design system v0.1 in Figma, tokens shared with code"]],
            ["Days 61–90 · Commit", ["Pilot-ready flows for the core tasks", "Accommodation model signed off by Psychometrics", "ACR baseline and an accessibility definition of done", "UX metrics instrumented before the first pilot district"]],
          ].map(([t, items]) => (
            <li key={t as string}>
              <Card className="h-full p-5">
                <p className="font-extrabold text-ink">{t as string}</p>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {(items as string[]).map((i) => (
                    <li key={i} className="flex gap-2 leading-relaxed">
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-leaf-ink" />
                      {i}
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section n="08" eyebrow="Build" title="Designed in code, tested like a product">
        <P>
          Next.js 16, React 19, TypeScript and Tailwind 4. The CogAT score formats (SAS, age percentile and stanine, Ability Profiles, local norms) are in a tested library, so the UI never invents a number. Playwright runs axe on every page and key state, plus a keyboard-only session; Lighthouse CI gates accessibility at 100. I built it with an AI pair (Claude Code), which is how I&apos;d expect to prototype at Reach: fast enough to put real interactions in front of teachers within a week.
        </P>
      </Section>

      <Section n="09" eyebrow="Limits" title="What's not real">
        <ul className="max-w-[68ch] space-y-3 text-lg leading-relaxed text-muted">
          <li>All students, schools and scores are synthetic. Items are original and in CogAT&apos;s formats; none are real CogAT items.</li>
          <li>Ability Profile rules approximate the published ones with fixed thresholds (10 SAS points for a relative strength or weakness, 24 for E), not confidence-band overlap.</li>
          <li>Composite SAS is approximated from the three battery SAS. The real composite comes from combined raw scores.</li>
          <li>Read-aloud uses the browser&apos;s speech engine. Production would use recorded or vetted voices, reviewed for each item.</li>
          <li>The Spanish strings are mine and not professionally reviewed. The Lens&apos;s speech panel is an approximation. Real verification uses VoiceOver and NVDA.</li>
          <li>Nothing here has been tested with students or teachers yet. That&apos;s the first job.</li>
        </ul>
        <p>
          <Link href="/student" className="link text-lg font-bold">
            Back to the demo
          </Link>
        </p>
      </Section>
    </div>
  );
}

function Tree({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="p-5">
      <p className="font-extrabold text-ink">{title}</p>
      <ul className="mt-3 space-y-1 font-mono text-sm text-body">
        {items.map((i) => {
          const depth = i.length - i.trimStart().length;
          return (
            <li key={i} style={{ paddingLeft: depth * 8 }} className="flex items-center gap-2">
              <span aria-hidden="true" className="text-dim">
                {depth ? "└" : "■"}
              </span>
              {i.trim()}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function Decision({ title, lost, children }: { title: string; lost: string; children: ReactNode }) {
  return (
    <Card className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div>
        <p className="text-lg font-extrabold text-ink">{title}</p>
        <p className="mt-1 leading-relaxed text-muted">{children}</p>
      </div>
      <div className="rounded-lg bg-sunken p-4">
        <p className="text-xs font-bold tracking-wide text-dim uppercase">Explored and set aside</p>
        <p className="mt-1 leading-relaxed text-muted">{lost}</p>
      </div>
    </Card>
  );
}
