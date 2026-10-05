"use client";

import { useEffect, useId, useRef, useState } from "react";
import { announce, landmarkLabel, tabbables } from "@/lib/a11y-name";
import { LENS_OFF, useStore, type LensState, type Vision } from "@/lib/store";

/*
 * The Accessibility Lens: a reviewer's overlay that makes semantics visible.
 * Landmarks, heading levels, tab order, what a screen reader would announce,
 * colour-vision simulation, and the WCAG 1.4.12 text-spacing stress test.
 * Everything it draws is aria-hidden: it describes the page, it isn't part of it.
 */

const LANDMARKS = 'header, nav, main, aside, footer, [role="region"], section[aria-labelledby], section[aria-label], form[aria-label]';

export function LensController() {
  const { lens } = useStore();
  const active = lens.landmarks || lens.headings || lens.spacing;

  useEffect(() => {
    const html = document.documentElement;
    const tokens = [lens.landmarks && "landmarks", lens.headings && "headings", lens.spacing && "spacing"].filter(Boolean).join(" ");
    if (tokens) html.setAttribute("data-lens", tokens);
    else html.removeAttribute("data-lens");
    html.setAttribute("data-vision", lens.vision);
  }, [lens]);

  useEffect(() => {
    if (!active) return;
    const label = () => {
      document.querySelectorAll(LANDMARKS).forEach((el) => {
        if (el.closest("[data-lens-ui]")) return;
        el.setAttribute("data-lens-name", landmarkLabel(el));
      });
      document.querySelectorAll("h1, h2, h3, h4").forEach((el) => el.setAttribute("data-lens-h", `H${el.tagName[1]}`));
    };
    label();
    const mo = new MutationObserver(() => requestAnimationFrame(label));
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, [active]);

  return (
    <>
      <VisionFilters />
      {lens.focusOrder && <FocusOrderOverlay />}
      {lens.announcer && <Announcer />}
    </>
  );
}

function VisionFilters() {
  // Machado et al. (2009) severity-1.0 matrices; achromatopsia uses luminance.
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: "absolute" }} data-lens-ui>
      <filter id="protanopia">
        <feColorMatrix type="matrix" values="0.152 1.053 -0.205 0 0  0.115 0.786 0.099 0 0  -0.004 -0.048 1.052 0 0  0 0 0 1 0" />
      </filter>
      <filter id="deuteranopia">
        <feColorMatrix type="matrix" values="0.367 0.861 -0.228 0 0  0.280 0.673 0.047 0 0  -0.012 0.043 0.969 0 0  0 0 0 1 0" />
      </filter>
      <filter id="tritanopia">
        <feColorMatrix type="matrix" values="1.256 -0.077 -0.179 0 0  -0.078 0.931 0.148 0 0  0.005 0.691 0.304 0 0  0 0 0 1 0" />
      </filter>
      <filter id="achromatopsia">
        <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
      </filter>
      <filter id="low-acuity">
        <feGaussianBlur stdDeviation="1.6" />
      </filter>
    </svg>
  );
}

type Badge = { n: number; x: number; y: number; current: boolean };

function FocusOrderOverlay() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let frame = 0;
    const compute = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const els = tabbables();
        setTotal(els.length);
        const vh = window.innerHeight;
        setBadges(
          els
            .map((el, i) => {
              const r = el.getBoundingClientRect();
              return { n: i + 1, x: r.left, y: r.top, current: el === document.activeElement, visible: r.bottom > 0 && r.top < vh };
            })
            .filter((b) => b.visible),
        );
      });
    };
    compute();
    window.addEventListener("scroll", compute, true);
    window.addEventListener("resize", compute);
    document.addEventListener("focusin", compute);
    const mo = new MutationObserver(compute);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden", "aria-expanded"] });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", compute, true);
      window.removeEventListener("resize", compute);
      document.removeEventListener("focusin", compute);
      mo.disconnect();
    };
  }, []);

  return (
    <div aria-hidden="true" data-lens-ui className="pointer-events-none fixed inset-0 z-[60]">
      {badges.map((b) => (
        <span
          key={b.n}
          className={`absolute grid h-5 min-w-5 -translate-x-1/3 -translate-y-1/2 place-items-center rounded-full px-1 font-mono text-[11px] leading-none font-bold text-white shadow ${b.current ? "bg-bad ring-2 ring-white" : "bg-navy"}`}
          style={{ left: Math.max(2, b.x), top: Math.max(10, b.y) }}
        >
          {b.n}
        </span>
      ))}
      <span className="absolute bottom-3 left-3 rounded bg-navy px-2 py-1 font-mono text-xs text-white">{total} tab stops on this page</span>
    </div>
  );
}

function Announcer() {
  const [lines, setLines] = useState<string[]>([]);
  useEffect(() => {
    const onFocus = (e: FocusEvent) => {
      const t = e.target as Element | null;
      if (!t || t.closest("[data-lens-ui]")) return;
      setLines((l) => [announce(t), ...l].slice(0, 4));
    };
    const onChange = (e: Event) => {
      const t = e.target as Element | null;
      if (!t || t.closest("[data-lens-ui]")) return;
      requestAnimationFrame(() => setLines((l) => [announce(t), ...l].slice(0, 4)));
    };
    document.addEventListener("focusin", onFocus);
    document.addEventListener("change", onChange);
    document.addEventListener("click", onChange);
    return () => {
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("change", onChange);
      document.removeEventListener("click", onChange);
    };
  }, []);

  return (
    <div aria-hidden="true" data-lens-ui className="fixed right-3 bottom-3 z-[61] w-[min(420px,calc(100vw-24px))] overflow-hidden rounded-lg bg-navy text-white shadow-float">
      <div className="flex items-center justify-between border-b border-white/15 px-3 py-2 text-xs">
        <span className="font-bold tracking-wide">Screen reader would say</span>
        <span className="text-white/70">approximation · press Tab</span>
      </div>
      <ol className="space-y-1 px-3 py-2 font-mono text-[13px] leading-snug">
        {lines.length === 0 && <li className="text-white/70">Move focus to hear it described.</li>}
        {lines.map((l, i) => (
          <li key={`${i}-${l}`} className={i === 0 ? "text-white" : "text-white/55"}>
            {i === 0 ? "▸ " : "  "}
            {l}
          </li>
        ))}
      </ol>
    </div>
  );
}

const VISION_OPTIONS: { value: Vision; label: string }[] = [
  { value: "none", label: "Typical vision" },
  { value: "protanopia", label: "Protanopia (red-blind)" },
  { value: "deuteranopia", label: "Deuteranopia (green-blind)" },
  { value: "tritanopia", label: "Tritanopia (blue-blind)" },
  { value: "achromatopsia", label: "Achromatopsia (no color)" },
  { value: "low-acuity", label: "Low acuity (blur)" },
];

const LAYERS: { key: keyof Omit<LensState, "vision">; label: string; hint: string }[] = [
  { key: "landmarks", label: "Landmarks", hint: "Regions a screen reader can jump between" },
  { key: "headings", label: "Heading levels", hint: "The outline a screen reader navigates by" },
  { key: "focusOrder", label: "Tab order", hint: "Every stop, numbered, in keyboard order" },
  { key: "announcer", label: "Screen reader speech", hint: "What focus would announce" },
  { key: "spacing", label: "Text spacing stress test", hint: "WCAG 1.4.12: nothing may clip or overlap" },
];

export function LensToggle({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { lens, setLens } = useStore();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const activeCount = LAYERS.filter((l) => lens[l.key]).length + (lens.vision !== "none" ? 1 : 0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative" data-lens-ui>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors ${
          tone === "dark" ? "border-white/40 text-white hover:bg-white/10" : "border-navy text-navy hover:bg-brand-soft"
        } ${activeCount ? (tone === "dark" ? "bg-white/15" : "bg-brand-soft") : ""}`}
      >
        <LensIcon />
        Accessibility Lens
        {activeCount > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-leaf px-1 text-xs text-navy-deep">
            {activeCount}
            <span className="sr-only"> layers on</span>
          </span>
        )}
      </button>
      {open && (
        <div id={panelId} role="group" aria-label="Accessibility Lens layers" className="absolute right-0 z-[70] mt-2 w-[min(360px,calc(100vw-32px))] rounded-[20px] border border-line bg-raised p-4 text-body shadow-float">
          <p className="text-sm text-muted">See the semantics behind any screen. This is for reviewers, so it lives outside the product.</p>
          <fieldset className="mt-3">
            <legend className="text-xs font-bold tracking-wide text-dim uppercase">Layers</legend>
            <ul className="mt-2 space-y-1">
              {LAYERS.map((l) => (
                <li key={l.key}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-sunken">
                    <input type="checkbox" className="mt-1 size-4 accent-navy" checked={lens[l.key]} onChange={(e) => setLens({ [l.key]: e.target.checked })} />
                    <span>
                      <span className="block text-sm font-bold text-ink">{l.label}</span>
                      <span className="block text-xs text-dim">{l.hint}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
          <label className="mt-3 block text-xs font-bold tracking-wide text-dim uppercase" htmlFor={`${panelId}-vision`}>
            Simulate vision
          </label>
          <select
            id={`${panelId}-vision`}
            value={lens.vision}
            onChange={(e) => setLens({ vision: e.target.value as Vision })}
            className="mt-1 min-h-11 w-full rounded-md border border-line-strong bg-raised px-3 text-sm"
          >
            {VISION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div className="mt-4 flex justify-between gap-2">
            <button type="button" className="min-h-11 rounded-full px-4 text-sm font-bold text-link hover:bg-sunken" onClick={() => setLens({ landmarks: true, headings: true, focusOrder: true, announcer: true })}>
              Turn on all layers
            </button>
            <button type="button" className="min-h-11 rounded-full px-4 text-sm font-bold text-muted hover:bg-sunken" onClick={() => setLens(LENS_OFF)}>
              Turn off
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LensIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
      <path d="M8 10.5h5M10.5 8v5" />
    </svg>
  );
}
