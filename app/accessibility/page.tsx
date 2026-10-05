import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Callout, Card, PageHeader } from "@/components/ui";
import { ACR, type Status } from "@/lib/acr";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "A draft Accessibility Conformance Report for the Reach concept against WCAG 2.2 AA, the automated gates in CI, the manual test protocol, and the accessibility questions specific to assessment.",
};

const STATUS_STYLE: Record<Status, string> = {
  Supports: "bg-good-soft text-good",
  "Partially supports": "bg-warn-soft text-warn",
  "Not applicable": "bg-sunken text-muted",
  "Not yet verified": "bg-bad-soft text-bad",
};

export default function AccessibilityPage() {
  const counts = ACR.reduce<Record<string, number>>((m, c) => ((m[c.status] = (m[c.status] ?? 0) + 1), m), {});
  return (
    <>
      <PageHeader eyebrow="Accessibility" title="WCAG 2.2 AA as a product requirement">
        District buyers will ask for an Accessibility Conformance Report (ACR) before the pilot. This is the draft I&apos;d start keeping on day one, against this concept build, with the gaps left in.
      </PageHeader>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-10 sm:px-6">
        <section aria-labelledby="assess-h">
          <h2 id="assess-h" className="display text-3xl">
            Where assessment makes accessibility harder
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted">
            For most software, accessibility means everyone can reach the content. For a test, it also means the support mustn&apos;t change what&apos;s being measured. These are the questions I&apos;d bring to Psychometrics in the first month, and where the design already takes a position.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Issue title="Read-aloud is neutral at one level and not at another">
              At Levels 5/6–8 every prompt is oral, so read-aloud is just the test. From Level 9, students read Verbal items, so read-aloud changes the construct. Reach stores each accommodation&apos;s effect by battery and level, so the player, the admin and the report all agree.
            </Issue>
            <Issue title="Nonverbal items are visual by design">
              Figure matrices and paper folding have no screen-reader equivalent that measures the same thing. Text alternatives here describe without solving, but a blind student needs a different path, such as tactile forms or a validated alternate. That&apos;s a product decision to make with Psychometrics, not a UI patch.
            </Issue>
            <Issue title="Universal design vs. assigned accommodations">
              Magnify, contrast, cross-out and reduced motion are open to everyone, so no child is singled out for using them. Only supports that touch timing or the construct are assigned, and only those are footnoted.
            </Issue>
            <Issue title="Disclosure without stigma">
              Reports show “† accommodation footnote” and the testing conditions on the student page. They never show “IEP” on the family report.
            </Issue>
          </div>
        </section>

        <section aria-labelledby="test-h">
          <h2 id="test-h" className="display text-3xl">
            How it&apos;s checked
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="p-5">
              <h3 className="text-xl font-extrabold text-ink">Automated, on every commit</h3>
              <ul className="mt-3 space-y-2 text-body">
                <Li>axe-core (WCAG 2.0–2.2 A/AA rules) in Playwright on every route and key state: practice item, crossed-out choice, break screen, high contrast, family report in Spanish.</Li>
                <Li>A keyboard-only end-to-end test of a full student session.</Li>
                <Li>Lighthouse CI: the build fails below 100 accessibility.</Li>
                <Li>Contrast unit tests on the tokens, so a palette change can&apos;t quietly regress.</Li>
              </ul>
            </Card>
            <Card className="p-5">
              <h3 className="text-xl font-extrabold text-ink">Manual, every release</h3>
              <ul className="mt-3 space-y-2 text-body">
                <Li>VoiceOver on iPad Safari (most K–2 testing is on tablets and Chromebooks); NVDA with Chrome; ChromeVox on Chromebook; JAWS for district staff.</Li>
                <Li>200% and 400% zoom, Windows forced colors, and reduced motion.</Li>
                <Li>Switch access with one and two switches.</Li>
                <Li>Moderated sessions with students who use AT, with consent, a familiar adult present, and short sessions.</Li>
              </ul>
            </Card>
          </div>
          <div className="mt-4">
            <Callout title="Automated checks are the floor">Axe catches what can be computed: names, contrast, structure. It can&apos;t tell whether a text alternative gives away the answer or whether a seven-year-old understands a prompt. The manual protocol and testing with students are where the real findings come from. That&apos;s why both are part of the definition of done, not a pre-launch audit.</Callout>
          </div>
        </section>

        <section aria-labelledby="acr-h">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="acr-h" className="display text-3xl">
                Draft ACR · WCAG 2.2 Level A and AA
              </h2>
              <p className="mt-2 text-muted">Against this concept build. Format follows the ITI VPAT® 2.5 WCAG table.</p>
            </div>
            <ul className="flex flex-wrap gap-2 text-sm" aria-label="Summary">
              {(Object.keys(STATUS_STYLE) as Status[]).map((s) => (
                <li key={s} className={`rounded-full px-3 py-1 font-bold ${STATUS_STYLE[s]}`}>
                  {counts[s] ?? 0} {s.toLowerCase()}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-raised">
            <table className="w-full min-w-[760px] text-left text-sm">
              <caption className="sr-only">WCAG 2.2 success criteria, conformance level, status and remarks</caption>
              <thead className="bg-sunken text-dim">
                <tr>
                  <th scope="col" className="px-3 py-2 font-bold">
                    Criterion
                  </th>
                  <th scope="col" className="px-3 py-2 font-bold">
                    Level
                  </th>
                  <th scope="col" className="px-3 py-2 font-bold">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-2 font-bold">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {ACR.map((c) => (
                  <tr key={c.id} className="border-t border-line align-top">
                    <th scope="row" className="px-3 py-2.5 font-normal">
                      <span className="font-mono font-bold text-ink">{c.id}</span> <span className="text-ink">{c.name}</span>
                    </th>
                    <td className="px-3 py-2.5 font-bold">{c.level}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                    </td>
                    <td className="px-3 py-2.5 leading-relaxed text-muted">{c.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

function Issue({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-5">
      <h3 className="text-lg font-extrabold text-ink">{title}</h3>
      <p className="mt-2 leading-relaxed text-muted">{children}</p>
    </Card>
  );
}

function Li({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2 leading-relaxed">
      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
      <span>{children}</span>
    </li>
  );
}
