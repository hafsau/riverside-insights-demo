import Link from "next/link";
import type { ReactNode } from "react";
import { LensCta } from "@/components/lens-cta";
import { BatteryShape, Card } from "@/components/ui";
import { getStudent } from "@/lib/data/roster";

export default function Home() {
  const mateo = getStudent("mateo-hernandez")!;
  return (
    <>
      <section aria-labelledby="hero-h" className="relative overflow-hidden bg-band text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-40 size-[560px] rounded-full border-[40px] border-white/5" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -bottom-60 size-[420px] rounded-full border-[28px] border-leaf/15" />
        <div className="relative mx-auto grid grid-cols-1 max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:py-24">
          <div>
            <p className="text-sm font-bold tracking-wide text-leaf uppercase">An unofficial concept for Riverside Insights</p>
            <h1 id="hero-h" className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl">
              Reach, accessible from the first pixel.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">
              Reach pilots in Fall 2027 with no product to inherit. This is how I&apos;d start it: three roles that share one thread, a design system that carries WCAG 2.2 AA in its tokens, and score reports a teacher can act on in seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/student" className="inline-flex min-h-13 items-center rounded-[25px] border border-green bg-green px-8 text-lg font-extrabold text-white hover:border-white hover:bg-white hover:text-leaf-ink">
                Take the test as a student
              </Link>
              <LensCta />
            </div>
            <p className="mt-6 text-sm text-white/70">By Hafsa Usmani, for the UX/UI Designer, Reach role. Synthetic students and original items.</p>
          </div>

          {/* A real report fragment as the hero image */}
          <div className="self-center">
            <div className="rounded-[25px] bg-white p-6 text-body shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold tracking-wide text-link uppercase">Grade 2 · Level 8</p>
                  <p className="text-xl font-extrabold text-ink">{mateo.name}</p>
                </div>
                <span className="rounded-md border border-warn bg-warn-soft px-2.5 py-1 font-mono text-lg font-bold text-ink">{mateo.profile.code}</span>
              </div>
              <p className="mt-3 leading-snug text-body">Much stronger in Nonverbal than Verbal. Mateo is an English learner, and the lower Verbal score is expected.</p>
              <ul className="mt-4 space-y-2.5">
                {(["V", "Q", "N"] as const).map((b) => (
                  <li key={b} className="grid grid-cols-[110px_minmax(0,1fr)_36px] items-center gap-3 text-sm">
                    <span className="flex items-center gap-1.5 font-bold text-ink">
                      <BatteryShape b={b} />
                      {{ V: "Verbal", Q: "Quantitative", N: "Nonverbal" }[b]}
                    </span>
                    <span className="relative h-3 rounded-full bg-sunken" aria-hidden="true">
                      <span className="absolute inset-y-0 left-[40.9%] w-[18.2%] border-x border-dashed border-line-strong" />
                      <span className="absolute top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center" style={{ left: `${((mateo.sas[b] - 50) / 110) * 100}%` }}>
                        <BatteryShape b={b} size={14} />
                      </span>
                    </span>
                    <span className="text-right font-bold tnum">{mateo.sas[b]}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-lg bg-good-soft px-3 py-2 text-sm text-good">
                <strong>Talent pool review</strong> via Quantitative and Nonverbal. A composite-only rule would have missed Mateo.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="roles-h" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="eyebrow">One platform, three roles</p>
        <h2 id="roles-h" className="display mt-2 text-3xl sm:text-4xl">
          One thread runs through all of it
        </h2>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-muted">
          An accommodation the district assigns switches on in the student&apos;s player and is disclosed on the teacher&apos;s report. A screening rule an admin picks is the same rule the teacher sees, consequences included. Change something in one role and watch it land in the others.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <RoleCard href="/student" step="1" title="Student" lede="A test a seven-year-old can take alone" points={["Every prompt spoken and captioned", "64px+ targets and native radios", "Cross-out, magnify, contrast, breaks", "Switch scanning and Spanish directions"]} />
          <RoleCard href="/educator" step="2" title="Educator" lede="Three decisions, answered in seconds" points={["Who to review for the talent pool", "Which scores to check before using", "How to group for instruction", "Family report in English and Spanish"]} />
          <RoleCard href="/admin" step="3" title="Admin" lede="Setup that shows its consequences" points={["Guided five-step onboarding", "Screening rule with a live preview", "Each accommodation's effect on scores", "An equity check on composite-only rules"]} />
        </div>
      </section>

      <section aria-labelledby="found-h" className="border-y border-line bg-raised">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="eyebrow">Foundations</p>
          <h2 id="found-h" className="display mt-2 text-3xl sm:text-4xl">
            Built in, not bolted on
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <Foundation href="/system" title="Reach Foundations" body="Tokens from Riverside's palette, with every text pairing checked. Brand blue fails AA as body text (4.30:1), so the system says where it may and may not go." />
            <Foundation href="/accessibility" title="Accessibility conformance" body="A draft ACR against WCAG 2.2 AA, how each criterion is met, the automated gates in CI, and the manual protocol with screen readers and switch users." />
            <Foundation href="/about" title="Case study" body="Personas, the screening-season journey, IA for three roles, the directions that lost, UX metrics, and the first 90 days of research I'd run." />
          </div>
          <Card className="mt-8 border-l-4 border-l-brand p-5">
            <p className="font-bold text-ink">Why accessibility can&apos;t wait for v2</p>
            <p className="mt-1 leading-relaxed text-muted">
              Under the DOJ&apos;s 2024 ADA Title II rule, public school districts&apos; web content must meet WCAG 2.1 AA, with compliance dates in 2026 and 2027. Reach&apos;s buyers will be checking right as it pilots. And in assessment, accessibility is also a measurement question: a support that changes what an item measures has to be disclosed. Reach models that from the start.
            </p>
          </Card>
        </div>
      </section>
    </>
  );
}

function RoleCard({ href, step, title, lede, points }: { href: string; step: string; title: string; lede: string; points: string[] }) {
  return (
    <Link href={href} className="group flex flex-col rounded-[25px] border border-line bg-raised p-6 shadow-card transition-shadow hover:shadow-float">
      <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-navy font-extrabold text-white">
        {step}
      </span>
      <span className="mt-4 text-2xl font-extrabold text-ink">{title}</span>
      <span className="mt-1 text-muted">{lede}</span>
      <ul className="mt-4 space-y-1.5 text-sm text-body">
        {points.map((p) => (
          <li key={p} className="flex gap-2">
            <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-leaf-ink" />
            {p}
          </li>
        ))}
      </ul>
      <span className="mt-5 font-bold text-link group-hover:underline">
        Open the {title.toLowerCase()} view <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

function Foundation({ href, title, body }: { href: string; title: string; body: ReactNode }) {
  return (
    <Link href={href} className="group rounded-[20px] border border-line p-5 hover:border-navy">
      <span className="block text-lg font-extrabold text-ink group-hover:underline">{title}</span>
      <span className="mt-2 block leading-relaxed text-muted">{body}</span>
    </Link>
  );
}
