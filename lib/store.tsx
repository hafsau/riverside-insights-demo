"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AccommodationId } from "@/lib/accommodations";
import { DEFAULT_RULE, type Rule } from "@/lib/cogat/talent-pool";
import { STUDENTS } from "@/lib/data/roster";

/*
 * One shared state across the three roles, so the demo shows the seams: an
 * accommodation the admin assigns is what the student's player turns on and
 * what the teacher's report discloses. Kept in localStorage for this viewer
 * only; the page renders correctly without it.
 */

export type Vision = "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia" | "low-acuity";

export type LensState = {
  landmarks: boolean;
  headings: boolean;
  focusOrder: boolean;
  announcer: boolean;
  spacing: boolean;
  vision: Vision;
};

export const LENS_OFF: LensState = { landmarks: false, headings: false, focusOrder: false, announcer: false, spacing: false, vision: "none" };

type State = {
  accommodations: Record<string, AccommodationId[]>;
  rule: Rule;
  lens: LensState;
  setupDone: Record<string, boolean>;
};

const initialAccommodations = () => Object.fromEntries(STUDENTS.map((s) => [s.id, s.accommodations ?? []]));

const INITIAL: State = {
  accommodations: initialAccommodations(),
  rule: DEFAULT_RULE,
  lens: LENS_OFF,
  setupDone: {},
};

type Ctx = State & {
  toggleAccommodation: (studentId: string, id: AccommodationId) => void;
  setAccommodations: (studentId: string, ids: AccommodationId[]) => void;
  setRule: (rule: Rule) => void;
  setLens: (patch: Partial<LensState>) => void;
  markSetup: (step: string, done: boolean) => void;
  reset: () => void;
};

const StoreContext = createContext<Ctx | null>(null);
const KEY = "reach-demo-v1";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<State>;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
        setState((s) => ({ ...s, ...saved, accommodations: { ...s.accommodations, ...saved.accommodations }, lens: { ...LENS_OFF, ...saved.lens } }));
      }
    } catch {
      /* storage unavailable: defaults are fine */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const toggleAccommodation = useCallback((studentId: string, id: AccommodationId) => {
    setState((s) => {
      const cur = s.accommodations[studentId] ?? [];
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      return { ...s, accommodations: { ...s.accommodations, [studentId]: next } };
    });
  }, []);

  const setAccommodations = useCallback((studentId: string, ids: AccommodationId[]) => {
    setState((s) => ({ ...s, accommodations: { ...s.accommodations, [studentId]: ids } }));
  }, []);

  const setRule = useCallback((rule: Rule) => setState((s) => ({ ...s, rule })), []);
  const setLens = useCallback((patch: Partial<LensState>) => setState((s) => ({ ...s, lens: { ...s.lens, ...patch } })), []);
  const markSetup = useCallback((step: string, done: boolean) => setState((s) => ({ ...s, setupDone: { ...s.setupDone, [step]: done } })), []);
  const reset = useCallback(() => setState({ ...INITIAL, lens: LENS_OFF, accommodations: initialAccommodations() }), []);

  const value = useMemo(
    () => ({ ...state, toggleAccommodation, setAccommodations, setRule, setLens, markSetup, reset }),
    [state, toggleAccommodation, setAccommodations, setRule, setLens, markSetup, reset],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
