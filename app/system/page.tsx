import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ScoreChart } from "@/components/score-chart";
import { batteryRows } from "@/lib/score-rows";
import { RiversideMark } from "@/components/brand";
import { BatteryShape, Button, Chip, FlagChip, PageHeader, ProfileBadge } from "@/components/ui";
import { abilityProfile, BATTERY_NAME, PATTERN_MEANING, type Battery } from "@/lib/cogat/scores";
import { contrast, grade } from "@/lib/contrast";

export const metadata: Metadata = {
  title: "Design system",
  description: "Reach Foundations: tokens built from Riverside Insights' palette with every contrast pairing computed, battery encoding by hue and shape, type, targets, and components with accessibility contracts.",
};

const TOKENS: { name: string; hex: string; role: string; on?: string; textUse: "yes" | "large" | "no" }[] = [
  { name: "--ink", hex: "#000000", role: "Headings and body. Riverside sets both in black.", textUse: "yes" },
  { name: "--muted", hex: "#575756", role: "Riverside gray. Secondary copy, footer links.", textUse: "yes" },
  { name: "--dim", hex: "#666666", role: "Captions and metadata. Checked on the page tint too.", textUse: "yes" },
  { name: "--navy", hex: "#003360", role: "Riverside deep navy. Secondary filled buttons, selected states, Nonverbal.", textUse: "yes" },
  { name: "--band", hex: "#102D7B", role: "Riverside navy band. Hero and footer surfaces.", textUse: "yes" },
  { name: "--brand", hex: "#0380C4", role: "Riverside blue. Links on the site; here, fills, the focus ring, Verbal, and 24px+ text.", textUse: "large" },
  { name: "--link", hex: "#036CA6", role: "Text-safe step of Riverside blue for links and small labels.", textUse: "yes" },
  { name: "--green", hex: "#4B8316", role: "Riverside CTA green. Primary buttons (white text, 4.61:1), Quantitative.", textUse: "large" },
  { name: "--leaf-ink", hex: "#3F7A12", role: "Text-safe green for small text on tints.", textUse: "yes" },
  { name: "--leaf", hex: "#80C342", role: "Logo green. Accents, and fills on navy (5.82:1). Never meaning alone.", on: "#102D7B", textUse: "no" },
  { name: "--line-strong", hex: "#7D8792", role: "Control borders: inputs, toggles, cards you can select. 3:1 for WCAG 1.4.11.", textUse: "no" },
  { name: "--warn", hex: "#8A4B00", role: "Check before using. Always with an icon and text.", textUse: "yes" },
  { name: "--bad", hex: "#B42318", role: "Errors and the cross-out mark.", textUse: "yes" },
];

const BG = "#F5FAFE";

export default function SystemPage() {
  return (
    <>
      <PageHeader eyebrow="Reach Foundations · v0.1" title="A design system with accessibility in its tokens">
        Built on day one so design and engineering share one source of truth. Every value below is the one the app uses; every contrast ratio is computed, not eyeballed.
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <nav aria-label="On this page" className="mb-10">
          <ul className="flex flex-wrap gap-2 text-sm">
            {["Brand", "Color", "Battery encoding", "Type", "Targets and focus", "Components", "Content rules"].map((s) => (
              <li key={s}>
                <a href={`#${slug(s)}`} className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-raised px-4 font-bold text-muted hover:border-navy hover:text-ink">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Section title="Brand">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <div className="flex items-center justify-center gap-8 rounded-[25px] border border-line bg-raised p-8">
              <RiversideMark className="size-24" title="Riverside Insights logo" />
              <div className="rounded-[20px] bg-band p-5">
                <RiversideMark className="size-14" />
              </div>
            </div>
            <div className="space-y-3 leading-relaxed text-muted">
              <p>
                Reach sits inside the Riverside Insights brand rather than inventing its own. The mark (four figures joined in a ring, <code className="font-mono">#0282C6</code> and <code className="font-mono">#80C342</code>) is used as-is. The product name is set beside it in Aptos ExtraBold.
              </p>
              <p>
                Everything else here comes from riversideinsights.com: Aptos at 800 for headings and 400 for body, black text with gray <code className="font-mono">#575756</code>, 25px pill buttons, white surfaces on a navy band, and <code className="font-mono">#E4F5FF</code> tints.
              </p>
              <p className="text-sm text-dim">The logo belongs to Riverside Insights. It is used here only to frame a concept for the company itself.</p>
            </div>
          </div>
        </Section>

        <Section title="Color">
          <p className="max-w-3xl leading-relaxed text-muted">
            These are Riverside&apos;s colours, taken from the site&apos;s stylesheet. Blue <code className="font-mono">#0380C4</code> (used there for links), logo green and the green button fall short of WCAG AA for small text. So each keeps its brand role as a fill, and a text-safe sibling
            from the same family carries small text.
          </p>
          <div className="mt-5 overflow-x-auto rounded-[20px] border border-line bg-raised">
            <table className="w-full min-w-[760px] text-left text-sm">
              <caption className="sr-only">Color tokens with contrast ratios</caption>
              <thead className="bg-sunken text-dim">
                <tr>
                  <th scope="col" className="px-3 py-2 font-bold">
                    Token
                  </th>
                  <th scope="col" className="px-3 py-2 font-bold">
                    Role
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-bold">
                    On white
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-bold">
                    On page bg
                  </th>
                  <th scope="col" className="px-3 py-2 font-bold">
                    Text use
                  </th>
                </tr>
              </thead>
              <tbody className="tnum">
                {TOKENS.map((t) => {
                  const w = contrast(t.hex, "#FFFFFF");
                  const b = contrast(t.hex, BG);
                  return (
                    <tr key={t.name} className="border-t border-line">
                      <th scope="row" className="px-3 py-2.5">
                        <span className="flex items-center gap-3">
                          <span aria-hidden="true" className="size-8 shrink-0 rounded-md border border-black/10" style={{ background: t.hex }} />
                          <span>
                            <span className="block font-mono font-bold text-ink">{t.name}</span>
                            <span className="block font-mono text-xs text-dim">{t.hex}</span>
                          </span>
                        </span>
                      </th>
                      <td className="px-3 py-2.5 text-muted">
                        {t.role}
                        {t.on && <span className="block text-xs text-dim">On navy: {contrast(t.hex, t.on).toFixed(2)}:1</span>}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Ratio r={w} />
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <Ratio r={b} />
                      </td>
                      <td className="px-3 py-2.5">
                        {t.textUse === "yes" && <Chip tone="good">Any text</Chip>}
                        {t.textUse === "large" && <Chip tone="warn">24px+ only</Chip>}
                        {t.textUse === "no" && <Chip>Fills only</Chip>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Battery encoding">
          <p className="max-w-3xl leading-relaxed text-muted">
            Verbal, Quantitative and Nonverbal appear on every report. Each uses one of the brand&apos;s three hues <em>and</em> a shape, so charts survive grayscale printing, photocopies and every type of color blindness. Try them with the Lens&apos;s vision simulator.
          </p>
          <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(["V", "Q", "N"] as Battery[]).map((b) => (
              <li key={b} className="flex items-center gap-4 rounded-[20px] border border-line bg-raised p-4">
                <BatteryShape b={b} size={36} />
                <span>
                  <span className="block text-lg font-extrabold text-ink">{BATTERY_NAME[b]}</span>
                  <span className="block text-sm text-dim">
                    {{ V: "Riverside blue · circle", Q: "Riverside green · square", N: "Riverside navy · triangle" }[b]} · <span className="font-mono">--{b.toLowerCase()}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Type">
          <p className="max-w-3xl leading-relaxed text-muted">
            Aptos, Riverside&apos;s brand face, loaded from riversideinsights.com (or the device&apos;s own copy, if it has one). Headings are ExtraBold at 1.2 line height, as on the site. Body is 17px, between the site&apos;s 16 and 18. Scores use tabular figures so columns line up. In the student player, an <strong>Easy-read</strong> tool switches to Atkinson Hyperlegible for children who read better with it.
          </p>
          <div className="mt-5 space-y-4 rounded-[20px] border border-line bg-raised p-5">
            <Spec label="H1 · Aptos 800 · 48/1.2">
              <span className="display text-5xl">Fall screening</span>
            </Spec>
            <Spec label="H2 · Aptos 800 · 36/1.2">
              <span className="display text-4xl">Groups by strength</span>
            </Spec>
            <Spec label="Student prompt · Aptos 400 · 20/1.6 (never below 20px)">
              <span className="text-xl text-ink">Which picture below goes with them?</span>
            </Spec>
            <Spec label="Body · Aptos 400 · 17/1.4">
              <span className="text-[17px] text-muted">Overall, the median score is in stanine 7 (above average).</span>
            </Spec>
            <Spec label="Data · Aptos 700 · tabular figures">
              <span className="text-2xl font-bold text-ink tnum">SAS 128 · PR 96 · 9B (V+) · 111 / 101</span>
            </Spec>
            <Spec label="Easy-read (player tool) · Atkinson Hyperlegible">
              <span className="text-xl text-ink" style={{ fontFamily: "var(--font-easy)" }}>
                Il1 O0 · Which picture goes with them?
              </span>
            </Spec>
          </div>
        </Section>

        <Section title="Targets and focus">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Rule title="44px adult targets">WCAG 2.2 (2.5.8) asks for 24px. Reach uses 44px for adults, because teachers use it on tablets during class.</Rule>
            <Rule title="64px student targets">Young children&apos;s motor control is still developing. Choice cards are at least 120px tall, with 16px gaps.</Rule>
            <Rule title="One focus ring">3px Riverside blue with a 2px white halo. It reads on white, tints and navy, and it&apos;s never removed.</Rule>
          </ul>
          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-[20px] border border-line bg-raised p-5">
            <Button>Let&apos;s connect</Button>
            <Button variant="navy">Navy</Button>
            <Button variant="secondary">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
            <span className="text-sm text-dim">Press Tab to see the focus ring.</span>
          </div>
        </Section>

        <Section title="Components">
          <Component name="Ability profile badge" contract={["Screen readers hear “Ability profile 7E (V- N+)”", "Pattern carried by a border and tint, plus the letter itself", "The plain-language meaning sits next to it in reports, not only in a tooltip"]}>
            <div className="flex flex-wrap gap-3">
              {[
                { V: 101, Q: 98, N: 104 },
                { V: 128, Q: 146, N: 134 },
                { V: 112, Q: 101, N: 90 },
                { V: 88, Q: 117, N: 127 },
              ].map((s, i) => {
                const p = abilityProfile(s);
                return (
                  <div key={i} className="rounded-lg border border-line p-3">
                    <ProfileBadge profile={p} />
                    <p className="mt-2 max-w-[200px] text-xs text-dim">{PATTERN_MEANING[p.pattern]}</p>
                  </div>
                );
              })}
            </div>
          </Component>

          <Component name="Score flag" contract={["Icon + text + color: never color alone", "Wording says what to do (“check”), not that a child failed", "Flags keep a score out of automated screening"]}>
            <div className="flex flex-wrap gap-2">
              <FlagChip flag="omitted" battery="N" />
              <FlagChip flag="inconsistent" battery="V" />
              <FlagChip flag="targeted" battery="Q" />
            </div>
          </Component>

          <Component name="Score band chart" contract={["Equivalent table view, one click away, with the same data", "SVG has a text summary of every value", "Hollow, dashed marks for flagged scores; † for footnotes", "Stanine bands labelled; average zone outlined, not tinted only"]}>
            <ScoreChart caption="Example: 7E (V- N+)" rows={batteryRows({ V: 88, Q: 117, N: 127 }, 112, undefined, [])} />
          </Component>
        </Section>

        <Section title="Content rules">
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Rule title="Names, not pronouns">Reports say “Mateo”, not he or she. It&apos;s clearer for families, and it never misgenders a child.</Rule>
            <Rule title="No verdicts">Never “gifted” or “not gifted”. Screening “opens a review”. Placement is a human decision with more evidence.</Rule>
            <Rule title="Say what a score can't tell you">An E profile says to read the composite with care. A flagged score says why it might be wrong.</Rule>
            <Rule title="Two registers">Teachers get actions (“Build from strength…”). Families get plain language, at a 6th-grade reading level, in their own language.</Rule>
          </ul>
        </Section>
      </div>
    </>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z]+/g, "-");
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section id={slug(title)} aria-labelledby={`${slug(title)}-h`} className="scroll-mt-24 border-t border-line py-10">
      <h2 id={`${slug(title)}-h`} className="display mb-4 text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Ratio({ r }: { r: number }) {
  const g = grade(r);
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-bold text-ink">{r.toFixed(2)}:1</span>
      <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${g === "Fail" ? "bg-bad-soft text-bad" : g === "AA large" ? "bg-warn-soft text-warn" : "bg-good-soft text-good"}`}>{g}</span>
    </span>
  );
}

function Spec({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-line pb-4 last:border-0 last:pb-0 md:grid-cols-[260px_minmax(0,1fr)] md:items-baseline">
      <p className="font-mono text-xs text-dim">{label}</p>
      <div>{children}</div>
    </div>
  );
}

function Rule({ title, children }: { title: string; children: ReactNode }) {
  return (
    <li className="rounded-[20px] border border-line bg-raised p-5">
      <p className="font-extrabold text-ink">{title}</p>
      <p className="mt-1 leading-relaxed text-muted">{children}</p>
    </li>
  );
}

function Component({ name, contract, children }: { name: string; contract: string[]; children: ReactNode }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-5 rounded-[20px] border border-line bg-raised p-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <h3 className="text-xl font-extrabold text-ink">{name}</h3>
        <div className="mt-4">{children}</div>
      </div>
      <div className="rounded-lg bg-sunken p-4">
        <p className="text-xs font-bold tracking-wide text-dim uppercase">Accessibility contract</p>
        <ul className="mt-2 space-y-2 text-sm text-body">
          {contract.map((c) => (
            <li key={c} className="flex gap-2">
              <span aria-hidden="true" className="text-good">
                ✓
              </span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
