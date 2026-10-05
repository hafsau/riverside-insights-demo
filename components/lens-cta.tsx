"use client";

import { useStore } from "@/lib/store";

export function LensCta({ className = "" }: { className?: string }) {
  const { lens, setLens } = useStore();
  const on = lens.landmarks && lens.headings && lens.focusOrder && lens.announcer;
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setLens(on ? { landmarks: false, headings: false, focusOrder: false, announcer: false } : { landmarks: true, headings: true, focusOrder: true, announcer: true })}
      className={`inline-flex min-h-13 items-center justify-center gap-2 rounded-[25px] border-2 border-white px-8 text-lg font-extrabold text-white hover:bg-white/10 ${className}`}
    >
      {on ? "Turn the Lens off" : "Turn on the Accessibility Lens"}
    </button>
  );
}
