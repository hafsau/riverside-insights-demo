"use client";

import Link from "next/link";
import { useState } from "react";
import { Player } from "@/components/student/player";
import { Chip, DemoNote, PageHeader } from "@/components/ui";
import { ACCOMMODATION_BY_ID } from "@/lib/accommodations";
import { STUDENTS } from "@/lib/data/roster";
import { useStore } from "@/lib/store";

const SUGGESTED = ["eli-goldberg", "mateo-hernandez", "aiden-murphy", "darius-coleman", "grace-liu"];

export function StudentSession() {
  const [id, setId] = useState("eli-goldberg");
  const { accommodations } = useStore();

  return (
    <>
      <PageHeader eyebrow="Student experience · Level 8" title="A test a seven-year-old can take on their own">
        Every prompt is spoken and captioned, every choice is a 64px+ target, and accommodations assigned by the school switch on by themselves.
      </PageHeader>
      <div className="mx-auto grid grid-cols-1 max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside aria-label="Choose a demo student" className="space-y-4">
          <div>
            <label htmlFor="student-pick" className="text-xs font-bold tracking-wide text-dim uppercase">
              Testing as
            </label>
            <select id="student-pick" value={id} onChange={(e) => setId(e.target.value)} className="mt-1 block min-h-11 w-full rounded-lg border border-line-strong bg-raised px-3 font-bold">
              {[...SUGGESTED.map((sid) => STUDENTS.find((s) => s.id === sid)!), ...STUDENTS.filter((s) => !SUGGESTED.includes(s.id))].map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {(accommodations[s.id] ?? []).length ? ` (${(accommodations[s.id] ?? []).length} accommodations)` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs font-bold tracking-wide text-dim uppercase">Assigned by the school</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(accommodations[id] ?? []).length === 0 && <span className="text-sm text-muted">None</span>}
              {(accommodations[id] ?? []).map((a) => (
                <Chip key={a} tone="brand">
                  {ACCOMMODATION_BY_ID[a].short}
                </Chip>
              ))}
            </div>
            <Link href="/admin#accommodations" className="link mt-2 inline-block text-sm font-bold">
              Change in admin setup
            </Link>
          </div>
          <DemoNote>
            Try <strong>Mateo</strong> for Spanish directions, <strong>Aiden</strong> for switch scanning, <strong>Eli</strong> for read-aloud and breaks. Keyboard: Tab to the choices, arrow keys to move, Space to choose. Turn on the Accessibility Lens to hear what a screen reader would say.
          </DemoNote>
        </aside>
        <section aria-label="Test player">
          <Player studentId={id} />
        </section>
      </div>
    </>
  );
}
