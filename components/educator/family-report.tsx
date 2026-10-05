"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RiversideMark } from "@/components/brand";
import { BatteryShape, Button } from "@/components/ui";
import { familySummary } from "@/lib/cogat/explain";
import { stanineBand, type Battery } from "@/lib/cogat/scores";
import { CLASS, getStudent, type Student } from "@/lib/data/roster";

/*
 * Family report. Designed print-first at US Letter: one page, grayscale-safe
 * (battery shapes carry identity), 11pt minimum, and no jargon on the face of
 * the page. Spanish is a first-class layout, not a translated afterthought:
 * every string has room for ~30% expansion.
 */

type Lang = "en" | "es";

const T = {
  en: {
    title: "Your child's reasoning skills report",
    sub: (s: Student) => `${s.name} · ${CLASS.grade} · ${CLASS.school} · Fall 2027`,
    what: "What this test measures",
    whatBody:
      "This short test looks at how your child solves new problems: with words, with numbers, and with shapes. It is not a grade and it does not measure effort, creativity or character. It helps your child's teacher plan how to teach.",
    results: "Your child's results",
    compared: "Compared with children the same age across the country",
    bands: ["Below average", "Average", "Above average", "Very high"],
    battery: { V: "Words (Verbal)", Q: "Numbers (Quantitative)", N: "Shapes (Nonverbal)" } as Record<Battery, string>,
    summary: "In short",
    next: "What happens next",
    nextBody:
      "Your child's teacher will use these results alongside classwork to plan small-group lessons. Some students are invited for a closer look for advanced learning; no decision is ever made on one test.",
    questions: "Questions? Contact",
    teacher: `${CLASS.teacher}, ${CLASS.school}`,
    band: (n: number) => ({ "below average": "below average", average: "average", "above average": "above average", "very high": "very high" })[stanineBand(n)],
    print: "Print or save as PDF",
    back: "Back to report",
    lang: "Report language",
    scaleNote: "Each dot shows where your child's score falls on a 1–9 scale. Most children score 4, 5 or 6.",
  },
  es: {
    title: "Informe de habilidades de razonamiento de su hijo/a",
    sub: (s: Student) => `${s.name} · 2.º grado · ${CLASS.school} · Otoño de 2027`,
    what: "Qué mide esta prueba",
    whatBody:
      "Esta prueba corta observa cómo su hijo/a resuelve problemas nuevos: con palabras, con números y con figuras. No es una calificación y no mide el esfuerzo, la creatividad ni el carácter. Ayuda al maestro/a a planear cómo enseñar.",
    results: "Resultados de su hijo/a",
    compared: "En comparación con niños de la misma edad en todo el país",
    bands: ["Por debajo del promedio", "Promedio", "Por encima del promedio", "Muy alto"],
    battery: { V: "Palabras (Verbal)", Q: "Números (Cuantitativo)", N: "Figuras (No verbal)" } as Record<Battery, string>,
    summary: "En resumen",
    next: "Próximos pasos",
    nextBody:
      "El maestro/a usará estos resultados junto con el trabajo en clase para planear lecciones en grupos pequeños. Algunos estudiantes son invitados a una evaluación más detallada para aprendizaje avanzado; nunca se toma una decisión con una sola prueba.",
    questions: "¿Preguntas? Comuníquese con",
    teacher: `${CLASS.teacher}, ${CLASS.school}`,
    band: (n: number) => ({ "below average": "por debajo del promedio", average: "promedio", "above average": "por encima del promedio", "very high": "muy alto" })[stanineBand(n)],
    print: "Imprimir o guardar como PDF",
    back: "Volver al informe",
    lang: "Idioma del informe",
    scaleNote: "Cada punto muestra dónde está el resultado de su hijo/a en una escala del 1 al 9. La mayoría de los niños obtiene 4, 5 o 6.",
  },
};

function familySummaryEs(s: Student): string {
  const p = s.profile;
  const area: Record<Battery, string> = { V: "razonar con palabras", Q: "razonar con números", N: "razonar con figuras" };
  const strong = p.strengths.length ? `${s.first} se destaca especialmente al ${p.strengths.map((b) => area[b]).join(" y al ")}. ` : "";
  return `${strong}En general, ${s.first} obtuvo un resultado ${T.es.band(p.stanine)} en comparación con niños de la misma edad. Cada niño tiene un patrón de fortalezas; este ayuda al maestro/a a elegir cómo enseñar.`;
}

export function FamilyReport({ id }: { id: string }) {
  const s = getStudent(id)!;
  const [lang, setLang] = useState<Lang>("en");
  const t = T[lang];

  // The page language follows the report, so screen readers switch voices.
  useEffect(() => {
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = "en";
    };
  }, [lang]);

  return (
    <div className="mx-auto max-w-[8.5in] px-4 py-6 print:p-0">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/educator/${s.id}`} className="link text-sm font-bold">
          ← {t.back}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <fieldset className="flex items-center gap-2">
            <legend className="sr-only">{t.lang}</legend>
            {(["en", "es"] as const).map((l) => (
              <label key={l} className="cursor-pointer">
                <input type="radio" name="lang" className="peer sr-only" checked={lang === l} onChange={() => setLang(l)} />
                <span lang={l} className="flex min-h-11 items-center rounded-full border border-line-strong px-5 text-sm font-bold text-muted peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-brand">
                  {l === "en" ? "English" : "Español"}
                </span>
              </label>
            ))}
          </fieldset>
          <Button onClick={() => window.print()}>{t.print}</Button>
        </div>
      </div>

      <article className="rounded-xl border border-line bg-white p-8 shadow-card print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-4 border-b-2 border-navy pb-4">
          <div>
            <h1 className="text-[26px] leading-tight font-extrabold text-navy">{t.title}</h1>
            <p className="mt-1 text-[15px] text-muted">{t.sub(s)}</p>
          </div>
          <span className="flex shrink-0 items-center gap-2 text-right">
            <span className="text-xs leading-tight font-bold text-muted">
              Riverside
              <br />
              Insights
            </span>
            <RiversideMark className="size-11" />
          </span>
        </header>

        <section className="mt-5">
          <h2 className="text-lg font-extrabold text-ink">{t.what}</h2>
          <p className="mt-1 text-[15px] leading-relaxed text-body">{t.whatBody}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-extrabold text-ink">{t.results}</h2>
          <p className="text-sm text-muted">{t.compared}</p>
          <div className="mt-3 space-y-3">
            {(["V", "Q", "N"] as Battery[]).map((b) => (
              <StanineStrip key={b} label={t.battery[b]} b={b} stanine={s.stanine[b]} bands={t.bands} bandWord={t.band(s.stanine[b])} />
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">{t.scaleNote}</p>
        </section>

        <section className="mt-6 rounded-lg bg-brand-soft p-4 print:border print:border-navy print:bg-white">
          <h2 className="text-lg font-extrabold text-ink">{t.summary}</h2>
          <p className="mt-1 text-[15px] leading-relaxed text-body">{lang === "en" ? familySummary(s) : familySummaryEs(s)}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-lg font-extrabold text-ink">{t.next}</h2>
          <p className="mt-1 text-[15px] leading-relaxed text-body">{t.nextBody}</p>
        </section>

        <footer className="mt-6 flex flex-wrap justify-between gap-2 border-t border-line pt-3 text-xs text-muted">
          <span>
            {t.questions} {t.teacher}
          </span>
          <span>Reach concept · synthetic data</span>
        </footer>
      </article>
    </div>
  );
}

function StanineStrip({ label, b, stanine, bands, bandWord }: { label: string; b: Battery; stanine: number; bands: string[]; bandWord: string }) {
  // Bands: 1–3, 4–6, 7–8, 9
  const groups = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8],
    [9],
  ];
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[190px_minmax(0,1fr)] print:grid-cols-[190px_minmax(0,1fr)]">
      <p className="flex items-center gap-2 text-[15px] font-bold text-ink">
        <BatteryShape b={b} size={14} />
        {label}
      </p>
      <div role="img" aria-label={`${label}: ${stanine} of 9, ${bandWord}`}>
        <div className="flex gap-1" aria-hidden="true">
          {groups.map((g, gi) => (
            <div key={gi} className="flex flex-col" style={{ flex: g.length }}>
              <div className="flex gap-1">
                {g.map((n) => (
                  <div key={n} className={`grid h-9 flex-1 place-items-center rounded-md border text-sm font-bold ${n === stanine ? "border-navy bg-navy text-white" : "border-line bg-sunken text-dim"}`}>
                    {n === stanine ? "●" : n}
                  </div>
                ))}
              </div>
              <span className="mt-1 text-center text-[11px] leading-tight text-muted">{bands[gi]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
