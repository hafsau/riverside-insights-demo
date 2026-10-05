"use client";

import { useId, useState } from "react";
import { BatteryShape } from "@/components/ui";
import { ordinal, SAS_BAND, sasToPercentile, sasToStanine, type Battery } from "@/lib/cogat/scores";
import { FLAG_LABEL } from "@/lib/data/roster";

/*
 * Score band chart. SAS on a 50–160 axis over the nine stanine bands, with a
 * ±1 SEM confidence band for each score. Each battery keeps its shape, so the
 * chart survives grayscale printing and every colour-vision type. A table
 * view carries the same data for screen readers and for anyone who prefers it.
 */

import type { Row } from "@/lib/score-rows";

export type { Row };

const MIN = 50;
const MAX = 160;
// Stanine boundaries in SAS: z at cumulative 4, 11, 23, 40, 60, 77, 89, 96 percent.
const STANINE_EDGES = [-1.751, -1.227, -0.739, -0.253, 0.253, 0.739, 1.227, 1.751].map((z) => 100 + z * 16);

export function ScoreChart({ rows, caption, cutoff }: { rows: Row[]; caption: string; cutoff?: { sas: number; label: string } }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  const id = useId();
  const W = 640;
  const left = 132;
  const right = 24;
  const rowH = 46;
  const top = 34;
  const H = top + rows.length * rowH + 30;
  const x = (sas: number) => left + ((sas - MIN) / (MAX - MIN)) * (W - left - right);
  const edges = [MIN, ...STANINE_EDGES, MAX];

  const summary = rows.map((r) => `${r.label} ${r.sas}, ${ordinal(sasToPercentile(r.sas))} percentile, stanine ${sasToStanine(r.sas)}${r.flag ? `, flagged: ${FLAG_LABEL[r.flag]}` : ""}`).join("; ");

  return (
    <figure aria-labelledby={`${id}-cap`} className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <figcaption id={`${id}-cap`} className="font-bold text-ink">
          {caption}
        </figcaption>
        <div role="group" aria-label="Display as" className="no-print inline-flex rounded-full border border-line-strong p-0.5">
          {(["chart", "table"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`min-h-9 rounded-full px-4 text-sm font-bold capitalize ${view === v ? "bg-navy text-white" : "text-muted hover:bg-sunken"}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === "chart" ? (
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label={`Standard Age Scores. ${summary}.`}>
          {/* stanine bands */}
          {edges.slice(0, -1).map((e, i) => (
            <g key={i}>
              <rect x={x(e)} y={top - 6} width={x(edges[i + 1]) - x(e)} height={rows.length * rowH + 6} fill={i % 2 ? "#eef6fc" : "#ffffff"} />
              <text x={(x(e) + x(edges[i + 1])) / 2} y={top - 12} textAnchor="middle" fontSize="11" fill="#575756" fontWeight={700}>
                {i + 1}
              </text>
            </g>
          ))}
          <text x={left - 10} y={top - 12} textAnchor="end" fontSize="11" fill="#575756" fontWeight={700}>
            Stanine
          </text>
          {/* average zone */}
          <rect x={x(edges[3])} y={top - 6} width={x(edges[6]) - x(edges[3])} height={rows.length * rowH + 6} fill="none" stroke="#7d8792" strokeDasharray="3 3" />

          {cutoff && (
            <g>
              <line x1={x(cutoff.sas)} x2={x(cutoff.sas)} y1={top - 6} y2={top + rows.length * rowH} stroke="#3f7a12" strokeWidth="2" />
              <text x={x(cutoff.sas) + 4} y={top + rows.length * rowH + 14} fontSize="11" fill="#3f7a12" fontWeight={700}>
                {cutoff.label}
              </text>
            </g>
          )}

          {rows.map((r, i) => {
            const cy = top + i * rowH + rowH / 2;
            const b = r.key === "C" ? null : r.key;
            const color = b ? `var(--${b.toLowerCase()})` : "#000000";
            return (
              <g key={r.key}>
                <text x={left - 12} y={cy + 4} textAnchor="end" fontSize="14" fontWeight={700} fill="#000000">
                  {r.label}
                </text>
                <rect x={x(r.sas - SAS_BAND)} y={cy - 7} width={x(r.sas + SAS_BAND) - x(r.sas - SAS_BAND)} height={14} rx={7} fill={color} opacity={r.flag ? 0.12 : 0.22} />
                {r.flag && <rect x={x(r.sas - SAS_BAND)} y={cy - 7} width={x(r.sas + SAS_BAND) - x(r.sas - SAS_BAND)} height={14} rx={7} fill="none" stroke={color} strokeDasharray="3 2" />}
                <Marker kind={r.key} cx={x(r.sas)} cy={cy} color={color} hollow={!!r.flag} />
                <text x={x(r.sas + SAS_BAND) + 6} y={cy + 4} fontSize="13" fontWeight={700} fill="#000000" className="tnum">
                  {r.sas}
                  {r.flag ? " ⚠" : ""}
                  {r.footnote ? " †" : ""}
                </text>
              </g>
            );
          })}

          {/* axis */}
          {[70, 85, 100, 115, 130, 145].map((t) => (
            <g key={t}>
              <line x1={x(t)} x2={x(t)} y1={top + rows.length * rowH} y2={top + rows.length * rowH + 5} stroke="#575756" />
              <text x={x(t)} y={top + rows.length * rowH + 18} textAnchor="middle" fontSize="11" fill="#575756">
                {t}
              </text>
            </g>
          ))}
        </svg>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="border-b border-line-strong text-dim">
                <th scope="col" className="py-2 pr-3 font-bold">
                  Score
                </th>
                <th scope="col" className="py-2 pr-3 font-bold">
                  SAS
                </th>
                <th scope="col" className="py-2 pr-3 font-bold">
                  Range (±1 SEM)
                </th>
                <th scope="col" className="py-2 pr-3 font-bold">
                  Age percentile
                </th>
                <th scope="col" className="py-2 pr-3 font-bold">
                  Age stanine
                </th>
                <th scope="col" className="py-2 font-bold">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="tnum">
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-line">
                  <th scope="row" className="py-2 pr-3 font-bold text-ink">
                    <span className="inline-flex items-center gap-1.5">
                      {r.key !== "C" && <BatteryShape b={r.key} />}
                      {r.label}
                    </span>
                  </th>
                  <td className="py-2 pr-3">{r.sas}</td>
                  <td className="py-2 pr-3">
                    {r.sas - SAS_BAND}–{r.sas + SAS_BAND}
                  </td>
                  <td className="py-2 pr-3">{ordinal(sasToPercentile(r.sas))}</td>
                  <td className="py-2 pr-3">{sasToStanine(r.sas)}</td>
                  <td className="py-2">{[r.flag ? FLAG_LABEL[r.flag] : "", r.footnote ? "Accommodation footnote" : ""].filter(Boolean).join("; ") || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-dim">
        <span className="inline-flex items-center gap-1.5">
          <svg aria-hidden="true" width="18" height="10">
            <rect width="18" height="10" rx="5" fill="#000000" opacity="0.22" />
          </svg>
          Likely range
        </span>
        <span className="inline-flex items-center gap-1.5">
          <svg aria-hidden="true" width="18" height="10">
            <rect x="0.5" y="0.5" width="17" height="9" fill="none" stroke="#7d8792" strokeDasharray="3 3" />
          </svg>
          Average (stanines 4–6)
        </span>
        <span>⚠ Check before using</span>
        <span>† Accommodation footnote</span>
      </p>
    </figure>
  );
}

function Marker({ kind, cx, cy, color, hollow }: { kind: Battery | "C"; cx: number; cy: number; color: string; hollow: boolean }) {
  const p = { fill: hollow ? "#fff" : color, stroke: hollow ? color : "#fff", strokeWidth: 2 };
  if (kind === "V") return <circle cx={cx} cy={cy} r={8} {...p} />;
  if (kind === "Q") return <rect x={cx - 7.5} y={cy - 7.5} width={15} height={15} rx={1.5} {...p} />;
  if (kind === "N") return <path d={`M${cx} ${cy - 9} L${cx + 9} ${cy + 7} L${cx - 9} ${cy + 7} Z`} {...p} />;
  return <path d={`M${cx} ${cy - 9} L${cx + 9} ${cy} L${cx} ${cy + 9} L${cx - 9} ${cy} Z`} {...p} />;
}
