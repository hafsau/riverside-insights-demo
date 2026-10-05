"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { BatteryLabel } from "@/components/ui";
import { ACCOMMODATION_BY_ID, type AccommodationId } from "@/lib/accommodations";
import { ITEMS } from "@/lib/items";
import { CLASS, getStudent } from "@/lib/data/roster";
import { useStore } from "@/lib/store";

/*
 * Student test player for Level 8 (Grade 2). Design rules:
 *  - Pre-readers: every prompt is spoken and captioned. Text is never the only path.
 *  - Targets ≥ 64px, generous spacing, one decision per screen.
 *  - Native radios inside a fieldset: arrow keys, switch access and screen
 *    readers all work without custom ARIA.
 *  - No visible timer or score. Progress is shown as stepping stones.
 *  - Assigned accommodations switch on automatically; universal tools are
 *    available to every student, so nobody has to be singled out to use them.
 */

type Phase = "welcome" | "item" | "break" | "done";

const ZOOMS = [1, 1.5, 2] as const;

export function Player({ studentId }: { studentId: string }) {
  const student = getStudent(studentId)!;
  const { accommodations } = useStore();
  const assigned = useMemo(() => accommodations[studentId] ?? [], [accommodations, studentId]);
  const has = useCallback((id: AccommodationId) => assigned.includes(id), [assigned]);

  const [phase, setPhase] = useState<Phase>("welcome");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [crossed, setCrossed] = useState<Record<string, string[]>>({});
  const [zoom, setZoom] = useState<(typeof ZOOMS)[number]>(1);
  const [contrast, setContrast] = useState(false);
  const [eliminator, setEliminator] = useState(false);
  const [easyFont, setEasyFont] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [practiceFeedback, setPracticeFeedback] = useState<"right" | "wrong" | null>(null);
  const spanish = has("spanish-directions");
  const stageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const legendId = useId();

  // Assigned accommodations set the starting state; the student can still change universal tools.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- reset the session when the student changes */
    setZoom(has("magnify") ? 1.5 : 1);
    setContrast(has("high-contrast"));
    setEliminator(has("answer-eliminator"));
    setPhase("welcome");
    setIndex(0);
    setAnswers({});
    setCrossed({});
    setPracticeFeedback(null);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [studentId, has]);

  const item = ITEMS[index];
  const scored = ITEMS.filter((i) => !i.practice);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = spanish ? "es-US" : "en-US";
      u.rate = 0.9;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [spanish],
  );

  const readItem = useCallback(() => {
    if (!item) return;
    const choices = item.choices.map((c, i) => `${"ABCD"[i]}: ${c.alt}.`).join(" ");
    speak(`${spanish ? item.promptEs : item.prompt} ${choices}`);
  }, [item, speak, spanish]);

  // Read-aloud students hear each item automatically. Focus moves to the item heading.
  useEffect(() => {
    if (phase !== "item") return;
    headingRef.current?.focus();
    if (has("read-aloud") || spanish) readItem();
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per item
  }, [phase, index]);

  // Switch scanning: focus steps through every control in the stage; Space or Enter acts.
  useEffect(() => {
    if (!scanning || phase !== "item") return;
    let i = -1;
    const t = setInterval(() => {
      const targets = [...(stageRef.current?.querySelectorAll<HTMLElement>("[data-scan]") ?? [])];
      if (!targets.length) return;
      i = (i + 1) % targets.length;
      targets[i].focus();
    }, 1600);
    return () => clearInterval(t);
  }, [scanning, phase, index]);

  const choose = (choiceId: string) => {
    setAnswers((a) => ({ ...a, [item.id]: choiceId }));
    if (item.practice) setPracticeFeedback(choiceId === item.answer ? "right" : "wrong");
  };

  const toggleCross = (choiceId: string) =>
    setCrossed((c) => {
      const cur = c[item.id] ?? [];
      return { ...c, [item.id]: cur.includes(choiceId) ? cur.filter((x) => x !== choiceId) : [...cur, choiceId] };
    });

  const next = () => {
    setPracticeFeedback(null);
    if (index + 1 >= ITEMS.length) setPhase("done");
    else setIndex(index + 1);
  };

  const reduced = has("reduced-motion");
  const t = spanish ? ES : EN;

  return (
    <div className="player" data-contrast={contrast ? "high" : "normal"} data-motion={reduced ? "reduced" : "full"}>
      {/* Proctor strip: the adult's view of the session */}
      <div className="no-print flex flex-wrap items-center gap-x-4 gap-y-1 rounded-t-2xl bg-navy px-4 py-2 text-sm text-white">
        <span className="font-bold">Proctor view</span>
        <span>
          {student.name} · {CLASS.grade} · Level {CLASS.level}
        </span>
        <span className="text-white/80">
          {assigned.length ? `Assigned: ${assigned.map((a) => ACCOMMODATION_BY_ID[a].short).join(", ")}` : "No accommodations assigned"}
          {has("extended-time") && " · Time limits ×1.5"}
        </span>
      </div>

      <div className="rounded-b-2xl border-x-2 border-b-2 border-navy bg-raised">
        {/* Student toolbar: universal tools, available to everyone */}
        <div role="toolbar" aria-label={t.tools} className="flex flex-wrap items-center gap-2 border-b border-line bg-sunken px-3 py-2">
          <ToolButton pressed={null} onClick={phase === "item" ? readItem : () => speak(t.welcomeSpeech(student.first))} icon="speaker" data-scan>
            {speaking ? t.listening : t.listen}
          </ToolButton>
          <ToolButton pressed={zoom > 1} onClick={() => setZoom(ZOOMS[(ZOOMS.indexOf(zoom) + 1) % ZOOMS.length])} icon="zoom">
            {t.bigger} {Math.round(zoom * 100)}%
          </ToolButton>
          <ToolButton pressed={contrast} onClick={() => setContrast((c) => !c)} icon="contrast">
            {t.contrast}
          </ToolButton>
          <ToolButton pressed={eliminator} onClick={() => setEliminator((e) => !e)} icon="cross">
            {t.crossOut}
          </ToolButton>
          <ToolButton pressed={easyFont} onClick={() => setEasyFont((f) => !f)} icon="font">
            {t.easyFont}
          </ToolButton>
          {has("switch-access") && (
            <ToolButton pressed={scanning} onClick={() => setScanning((s) => !s)} icon="scan">
              {scanning ? t.stopScan : t.scan}
            </ToolButton>
          )}
          {has("breaks") && phase === "item" && (
            <ToolButton pressed={null} onClick={() => setPhase("break")} icon="pause">
              {t.rest}
            </ToolButton>
          )}
        </div>

        <div ref={stageRef} className="min-h-[520px] overflow-x-auto px-4 py-6 sm:px-8" style={{ zoom, fontFamily: easyFont ? "var(--font-easy)" : undefined }}>
          {phase === "welcome" && (
            <div className="mx-auto max-w-xl py-8 text-center">
              <p aria-hidden="true" className="text-6xl">
                👋
              </p>
              <h2 className="mt-4 text-3xl font-extrabold text-ink">{t.hi(student.first)}</h2>
              <p className="mt-3 text-xl leading-relaxed text-body">{t.welcome}</p>
              <button type="button" data-scan onClick={() => setPhase("item")} className="mt-8 min-h-16 rounded-full bg-green px-12 text-2xl font-extrabold text-white hover:bg-[#3d6b12]">
                {t.start}
              </button>
            </div>
          )}

          {phase === "break" && (
            <div className="mx-auto max-w-xl py-12 text-center">
              <p aria-hidden="true" className="text-6xl">
                🌿
              </p>
              <h2 className="mt-4 text-3xl font-extrabold text-ink">{t.breakTitle}</h2>
              <p className="mt-3 text-xl text-body">{t.breakBody}</p>
              <button type="button" data-scan onClick={() => setPhase("item")} className="mt-8 min-h-16 rounded-full bg-green px-12 text-2xl font-extrabold text-white hover:bg-[#3d6b12]" autoFocus>
                {t.backToWork}
              </button>
            </div>
          )}

          {phase === "done" && (
            <div className="mx-auto max-w-xl py-12 text-center" role="status">
              <p aria-hidden="true" className={`text-6xl ${reduced ? "" : "rise"}`}>
                🎉
              </p>
              <h2 className="mt-4 text-3xl font-extrabold text-ink">{t.doneTitle(student.first)}</h2>
              <p className="mt-3 text-xl text-body">{t.doneBody}</p>
              <p className="mt-6 text-sm text-dim">
                Demo: {scored.filter((i) => answers[i.id] === i.answer).length} of {scored.length} correct. Students never see this. Responses go to {CLASS.teacher} after the window closes.
              </p>
              <button type="button" onClick={() => setPhase("welcome")} className="mt-6 min-h-11 rounded-full border border-line-strong px-5 font-bold text-navy hover:bg-brand-soft">
                Restart demo session
              </button>
            </div>
          )}

          {phase === "item" && item && (
            <div className="mx-auto max-w-3xl" key={item.id}>
              <Progress index={index} total={ITEMS.length} practiceLabel={t.practice} label={t.progress} />

              <h2 ref={headingRef} tabIndex={-1} className="sr-only">
                {item.practice ? t.practice : t.question(index, ITEMS.length - 1)}: {item.format}
              </h2>

              {/* Caption of the spoken prompt: deaf and hard-of-hearing students get the same direction. */}
              <p className={`mt-6 rounded-xl border-2 px-4 py-3 text-xl leading-relaxed text-ink ${speaking ? "border-brand bg-brand-soft" : "border-line bg-sunken"}`} lang={spanish ? "es" : "en"}>
                <span aria-hidden="true" className="mr-2">
                  {speaking ? "🔊" : "💬"}
                </span>
                {spanish ? item.promptEs : item.prompt}
              </p>

              <div className={`mt-6 flex justify-center ${reduced ? "" : "rise"}`}>{item.stimulus}</div>

              <fieldset className="mt-8">
                <legend id={legendId} className="sr-only">
                  {t.choose}
                </legend>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {item.choices.map((c, i) => {
                    const checked = answers[item.id] === c.id;
                    const isCrossed = (crossed[item.id] ?? []).includes(c.id);
                    return (
                      <div key={c.id} className="relative">
                        <label
                          className={`choice flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 p-3 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand ${
                            checked ? "border-navy bg-brand-soft shadow-[inset_0_0_0_3px_var(--navy)]" : "border-line-strong bg-raised hover:border-navy"
                          }`}
                        >
                          <input type="radio" name={item.id} value={c.id} checked={checked} onChange={() => choose(c.id)} className="sr-only" aria-label={`${"ABCD"[i]}: ${c.alt}${isCrossed ? ", crossed out" : ""}`} data-scan />
                          <span className={`pointer-events-none ${isCrossed ? "opacity-30 grayscale" : ""}`}>{c.render}</span>
                          <span aria-hidden="true" className={`grid size-8 place-items-center rounded-full text-sm font-extrabold ${checked ? "bg-navy text-white" : "bg-sunken text-muted"}`}>
                            {checked ? "✓" : "ABCD"[i]}
                          </span>
                          {isCrossed && (
                            <svg aria-hidden="true" className="pointer-events-none absolute inset-3" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <path d="M8 8 92 92M92 8 8 92" stroke="var(--bad)" strokeWidth="4" vectorEffect="non-scaling-stroke" />
                            </svg>
                          )}
                        </label>
                        {eliminator && (
                          <button
                            type="button"
                            aria-pressed={isCrossed}
                            aria-label={`${isCrossed ? t.uncross : t.cross} ${"ABCD"[i]}`}
                            onClick={() => toggleCross(c.id)}
                            className="absolute -top-2 -right-2 grid size-11 place-items-center rounded-full border-2 border-line-strong bg-raised text-lg font-bold text-bad shadow-card hover:border-bad"
                          >
                            <span aria-hidden="true">{isCrossed ? "↺" : "✕"}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </fieldset>

              <div aria-live="polite" className="mt-4 min-h-8 text-center text-lg font-bold">
                {practiceFeedback === "right" && <span className="text-good">{t.right}</span>}
                {practiceFeedback === "wrong" && <span className="text-warn">{t.tryAgain}</span>}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  data-scan
                  onClick={next}
                  disabled={!answers[item.id] || (item.practice && practiceFeedback !== "right")}
                  className="min-h-16 rounded-full bg-green px-12 text-2xl font-extrabold text-white hover:bg-[#3d6b12] disabled:cursor-not-allowed disabled:bg-line-strong disabled:text-ink"
                >
                  {index + 1 >= ITEMS.length ? t.finish : t.next} <span aria-hidden="true">→</span>
                </button>
              </div>
              <p className="mt-6 text-center text-xs text-dim">
                <BatteryLabel b={item.battery} /> · {item.format} · original item, not from CogAT
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Progress({ index, total, practiceLabel, label }: { index: number; total: number; practiceLabel: string; label: string }) {
  return (
    <nav aria-label={label}>
      <ol className="flex items-center justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => {
          const state = i < index ? "done" : i === index ? "current" : "todo";
          return (
            <li key={i} aria-current={state === "current" ? "step" : undefined} className="flex items-center gap-2">
              <span
                className={`grid size-9 place-items-center rounded-full border-2 text-sm font-extrabold ${
                  state === "done" ? "border-navy bg-navy text-white" : state === "current" ? "border-navy bg-raised text-navy ring-4 ring-brand/30" : "border-line-strong bg-raised text-dim"
                }`}
              >
                <span className="sr-only">{state === "done" ? "Done: " : state === "current" ? "Now: " : "Coming up: "}</span>
                {i === 0 ? "P" : i}
                <span className="sr-only">{i === 0 ? ` ${practiceLabel}` : ""}</span>
              </span>
              {i < total - 1 && <span aria-hidden="true" className={`h-1 w-4 rounded sm:w-8 ${i < index ? "bg-navy" : "bg-line"}`} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

const ICONS: Record<string, string> = {
  speaker: "M4 9v6h4l5 4V5L8 9H4Zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Z",
  zoom: "M10.5 4a6.5 6.5 0 1 0 4 11.6l4.4 4.4 1.4-1.4-4.4-4.4A6.5 6.5 0 0 0 10.5 4Zm-1 3.5h2v2h2v2h-2v2h-2v-2h-2v-2h2Z",
  contrast: "M12 3a9 9 0 1 0 0 18V3Zm0 0a9 9 0 0 1 0 18",
  cross: "M6 6l12 12M18 6 6 18",
  scan: "M4 6h16M4 12h10M4 18h6",
  pause: "M8 5h3v14H8zM13 5h3v14h-3z",
  font: "M4 19 9.5 5h1L16 19M6.5 14h7M17 19v-6.5a2.5 2.5 0 0 1 5 0V19",
};

function ToolButton({ pressed, onClick, icon, children, ...rest }: { pressed: boolean | null; onClick: () => void; icon: string; children: React.ReactNode; "data-scan"?: boolean }) {
  const stroke = icon === "cross" || icon === "scan" || icon === "contrast" || icon === "font";
  return (
    <button
      type="button"
      aria-pressed={pressed ?? undefined}
      onClick={onClick}
      className={`inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-4 text-base font-bold ${pressed ? "border-navy bg-navy text-white" : "border-line-strong bg-raised text-navy hover:border-navy"}`}
      {...rest}
    >
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill={stroke ? "none" : "currentColor"} stroke={stroke ? "currentColor" : "none"} strokeWidth="2.4" strokeLinecap="round">
        <path d={ICONS[icon]} />
      </svg>
      {children}
    </button>
  );
}

const EN = {
  tools: "Tools",
  listen: "Listen",
  listening: "Listening…",
  bigger: "Bigger",
  contrast: "Contrast",
  crossOut: "Cross out",
  easyFont: "Easy-read",
  scan: "Start scanning",
  stopScan: "Stop scanning",
  rest: "Take a break",
  hi: (n: string) => `Hi, ${n}!`,
  welcome: "Today you'll solve some picture puzzles. There are no tricks. Take your time and do your best thinking.",
  welcomeSpeech: (n: string) => `Hi, ${n}! Today you'll solve some picture puzzles. Press Start when you're ready.`,
  start: "Start",
  breakTitle: "Rest time",
  breakBody: "The puzzle is hidden while you rest. Stretch, breathe, and come back when you're ready.",
  backToWork: "I'm ready",
  doneTitle: (n: string) => `You did it, ${n}!`,
  doneBody: "Thank you for your great thinking. You can tell your teacher you're finished.",
  practice: "Practice",
  progress: "Puzzle progress",
  question: (i: number, n: number) => `Puzzle ${i} of ${n}`,
  choose: "Choose an answer",
  cross: "Cross out",
  uncross: "Bring back",
  right: "Yes! You've got it. Press Next.",
  tryAgain: "Not quite. Listen again and try another one.",
  next: "Next",
  finish: "Finish",
};

const ES: typeof EN = {
  ...EN,
  tools: "Herramientas",
  listen: "Escuchar",
  listening: "Escuchando…",
  bigger: "Más grande",
  contrast: "Contraste",
  crossOut: "Tachar",
  easyFont: "Letra fácil",
  rest: "Descansar",
  hi: (n) => `¡Hola, ${n}!`,
  welcome: "Hoy vas a resolver rompecabezas con imágenes. No hay trucos. Tómate tu tiempo y piensa lo mejor que puedas.",
  welcomeSpeech: (n) => `¡Hola, ${n}! Hoy vas a resolver rompecabezas con imágenes. Presiona Empezar cuando quieras.`,
  start: "Empezar",
  breakTitle: "Hora de descansar",
  breakBody: "El rompecabezas está escondido mientras descansas.",
  backToWork: "¡Ya estoy!",
  doneTitle: (n) => `¡Lo lograste, ${n}!`,
  doneBody: "Gracias por pensar tanto. Dile a tu maestra que terminaste.",
  practice: "Práctica",
  question: (i, n) => `Rompecabezas ${i} de ${n}`,
  choose: "Elige una respuesta",
  cross: "Tachar",
  uncross: "Recuperar",
  right: "¡Sí! Lo lograste. Presiona Siguiente.",
  tryAgain: "Casi. Escucha otra vez y prueba otra.",
  next: "Siguiente",
  finish: "Terminar",
};
