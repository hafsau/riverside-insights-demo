# Reach

**▶ Live: _(add after deploy)_** · [![CI](https://github.com/hafsau/riverside-insights-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/hafsau/riverside-insights-demo/actions/workflows/ci.yml) · Case study at `/about` · Design system at `/system` · Draft ACR at `/accessibility`

**Accessible from the first pixel.** An unofficial product design concept for [Riverside Insights](https://riversideinsights.com)' Reach platform by [Hafsa Usmani](https://hafsausmani.com), built as my application for the **UX/UI Designer, Reach** role.

> **Not affiliated with Riverside Insights.** Students, schools and scores are synthetic. Test items are original, in CogAT's formats; none are real CogAT items. CogAT® is a registered trademark of Riverside Assessments, LLC.

---

## The idea

Reach is Riverside's 0-to-1 platform for the next generation of CogAT and the Iowa Assessments. It pilots in Fall 2027, serves students, educators and administrators, and will be bought by districts bound by ADA Title II, which sets WCAG 2.1 AA for their web content.

This concept builds all three roles on one thread. **An accommodation a district assigns switches on in the student's test player and is disclosed on the teacher's score report. A screening rule an admin picks is the same rule the teacher sees, consequences included.**

## What's in it

| | |
|---|---|
| **Student** (`/student`) | A Level 8 test player for pre-readers. Every prompt is spoken (Web Speech) and captioned. Choices are 120px cards over native radios. Answer eliminator, an Easy-read font, 150/200% magnification, high contrast, reduced motion, breaks that hide the item, switch scanning, and Spanish directions. No clock or score is shown to the child. |
| **Educator** (`/educator`) | Built for "decisions in seconds": who to review for the talent pool, which scores to check before using, and groups by relative strength. A sortable, filterable roster. The student report has a score-band chart with a table view and plain-language next steps. |
| **Family report** (`/educator/[id]/family`) | Print-first, one US Letter page, grayscale-safe, in English and Spanish (the page `lang` switches too). No jargon, and no IEP/ELL labels. |
| **Admin** (`/admin`) | Five-step guided setup. A screening rule with norms, scope and cutoff, previewed live, plus an equity check. An accommodations matrix showing each one's effect on scores by battery and level. |
| **Accessibility Lens** (header) | A reviewer's overlay on every page: landmarks, heading levels, numbered tab order, an approximate screen-reader speech panel, five vision simulations, and the WCAG 1.4.12 text-spacing test. |
| **Design system** (`/system`) | Riverside's logo, Aptos type, pill buttons and colours from the site's stylesheet, with computed contrast. Brand blue fails AA as body text (4.30:1), so the system says where it can go. Battery encoding by hue and shape, type, targets, and components with accessibility contracts. |
| **Accessibility** (`/accessibility`) | A draft ACR against all 55 WCAG 2.2 A/AA criteria, with gaps left in. The test protocol, and the assessment-specific questions for Psychometrics. |
| **Case study** (`/about`) | Personas, the screening-season journey, three-role IA, decisions and what lost, UX metrics, the first 90 days, and limits. |

## CogAT score formats

`lib/cogat/scores.ts` implements the published formats: Standard Age Score (mean 100, SD 16, 50–160), age percentile rank, stanines (4-7-12-17-20-17-12-7-4), Verbal/Quantitative/Nonverbal batteries with a composite, and **Ability Profiles** (`9B (Q+)`, `5C (V+ N-)`, `7E (V- N+)`). `lib/cogat/talent-pool.ts` handles national and district (local) norms and composite-only vs any-battery rules. It also flags a score with a warning, so it never qualifies a student automatically.

Approximations, also listed on `/about`:

- Profile patterns use fixed thresholds (10 SAS points for a relative strength or weakness, 24 for E), not confidence-band overlap.
- The composite is derived from the battery SAS, not from raw scores.

## Quality gates

- **Unit (Vitest):** SAS conversions against published anchors, every profile pattern, local norms, talent-pool rules, accommodation effects, and contrast math.
- **E2E (Playwright + axe):** zero violations (WCAG 2.0–2.2 A/AA) on every route and key state: practice, cross-out, high contrast, break, Spanish report, Lens on.
  - A keyboard-only full student session.
  - The admin → player → report thread.
  - The shared screening rule.
  - Roster sort and filter.
  - No horizontal page scroll at desktop, tablet and phone sizes.
- **Lighthouse CI:** accessibility must be 100 on all nine pages (currently 100 everywhere; performance 96–98).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests
npm run e2e        # Playwright + axe against a production build
npx @lhci/cli@0.15.1 autorun   # after npm run build
```

**Stack:** Next.js 16, React 19, TypeScript, Tailwind 4, Vitest, Playwright, axe-core and Lighthouse CI.

**Brand:** Riverside Insights' logo, colours (from the site's stylesheet) and Aptos, which loads from riversideinsights.com or from the device's own copy. Atkinson Hyperlegible is loaded only for the student player's Easy-read font tool.
