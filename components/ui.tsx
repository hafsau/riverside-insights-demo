import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { BATTERY_NAME, PATTERN_MEANING, type AbilityProfile, type Battery } from "@/lib/cogat/scores";
import { FLAG_LABEL, type ScoreFlag } from "@/lib/data/roster";

/* ---------- Buttons ---------- */

type Variant = "primary" | "secondary" | "ghost";
type AllVariants = Variant | "navy";
// Riverside's buttons, from riversideinsights.com: 25px pills, Aptos 800,
// 0.9em × 1.6em at 18px for CTAs. The CTA is green #4B8316 with white text
// (4.61:1). Navy and outline are the quieter actions.
const VARIANT: Record<AllVariants, string> = {
  primary: "border border-green bg-green text-white hover:bg-raised hover:text-leaf-ink",
  navy: "border border-navy bg-navy text-white hover:bg-raised hover:text-navy",
  secondary: "border border-link bg-raised text-link hover:bg-link hover:text-white",
  ghost: "text-link hover:bg-sunken",
};
const BASE = "inline-flex min-h-12 items-center justify-center gap-2 rounded-[25px] px-7 text-[17px] font-extrabold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: AllVariants }) {
  return <button type="button" className={`${BASE} ${VARIANT[variant]} ${className}`} {...props} />;
}

export function LinkButton({ variant = "primary", className = "", ...props }: ComponentProps<typeof Link> & { variant?: AllVariants }) {
  return <Link className={`${BASE} ${VARIANT[variant]} ${className}`} {...props} />;
}

/* ---------- Battery marks: hue + shape, never hue alone ---------- */

export const BATTERY_FILL: Record<Battery, string> = { V: "var(--v)", Q: "var(--q)", N: "var(--n)" };

export function BatteryShape({ b, size = 12, className = "" }: { b: Battery; size?: number; className?: string }) {
  const fill = BATTERY_FILL[b];
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 12 12" className={`inline-block shrink-0 ${className}`}>
      {b === "V" && <circle cx="6" cy="6" r="5.5" fill={fill} />}
      {b === "Q" && <rect x="0.5" y="0.5" width="11" height="11" rx="1" fill={fill} />}
      {b === "N" && <path d="M6 0.3 11.7 11.5H0.3Z" fill={fill} />}
    </svg>
  );
}

export function BatteryLabel({ b, short = false }: { b: Battery; short?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <BatteryShape b={b} />
      {short ? b : BATTERY_NAME[b]}
    </span>
  );
}

/* ---------- Ability Profile badge ---------- */

const PATTERN_STYLE: Record<AbilityProfile["pattern"], string> = {
  A: "border-line-strong bg-raised text-ink",
  B: "border-[var(--v)] bg-v-soft text-ink",
  C: "border-[var(--n)] bg-n-soft text-ink",
  E: "border-warn bg-warn-soft text-ink",
};

export function ProfileBadge({ profile, size = "sm" }: { profile: AbilityProfile; size?: "sm" | "lg" }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono font-bold tnum whitespace-nowrap ${PATTERN_STYLE[profile.pattern]} ${size === "lg" ? "px-3 py-1.5 text-2xl" : "px-2 py-0.5 text-sm"}`}
      title={PATTERN_MEANING[profile.pattern]}
    >
      <span className="sr-only">Ability profile </span>
      {profile.code}
    </span>
  );
}

/* ---------- Flags and chips ---------- */

export function FlagChip({ flag, battery }: { flag: ScoreFlag; battery?: Battery }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-warn/40 bg-warn-soft px-2 py-0.5 text-xs font-bold whitespace-nowrap text-warn">
      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
        <path d="M6 .8 11.4 10.6H.6Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M6 4.4v2.8M6 8.6v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      {battery ? `${battery}: ` : ""}
      {FLAG_LABEL[flag]}
    </span>
  );
}

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "good" | "brand" | "warn" }) {
  const t = {
    neutral: "border-line bg-sunken text-muted",
    good: "border-good/30 bg-good-soft text-good",
    brand: "border-link/30 bg-brand-soft text-navy",
    warn: "border-warn/40 bg-warn-soft text-warn",
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold whitespace-nowrap ${t}`}>{children}</span>;
}

/* ---------- Layout ---------- */

export function PageHeader({ eyebrow, title, children, actions }: { eyebrow: string; title: ReactNode; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="border-b border-line bg-raised">
      <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-4 py-8 sm:px-6">
        <div className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display mt-2 text-3xl sm:text-4xl">{title}</h1>
          {children && <div className="mt-3 text-lg leading-relaxed text-muted">{children}</div>}
        </div>
        {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Card({ children, className = "", ...rest }: ComponentProps<"div">) {
  return (
    <div className={`rounded-[20px] border border-line bg-raised shadow-card ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Callout({ children, tone = "brand", title }: { children: ReactNode; tone?: "brand" | "warn" | "good"; title?: string }) {
  const t = { brand: "border-brand bg-brand-soft", warn: "border-warn bg-warn-soft", good: "border-good bg-good-soft" }[tone];
  return (
    <div className={`rounded-lg border-l-4 px-4 py-3 text-body ${t}`}>
      {title && <p className="font-bold text-ink">{title}</p>}
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <aside aria-label="Demo note" className="no-print rounded-lg border border-dashed border-line-strong bg-raised px-4 py-3 text-sm text-dim">
      <span className="font-bold text-muted">Demo note: </span>
      {children}
    </aside>
  );
}
