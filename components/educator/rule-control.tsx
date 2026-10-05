"use client";

import { useId } from "react";
import { NATIONAL_DEFAULT_CUTOFF, type Norms, type Rule, type Scope } from "@/lib/cogat/talent-pool";

function Segmented<T extends string>({ legend, value, options, onChange }: { legend: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const name = useId();
  return (
    <fieldset>
      <legend className="text-xs font-bold tracking-wide text-dim uppercase">{legend}</legend>
      <div className="mt-1 inline-flex flex-wrap rounded-full border border-line-strong bg-raised p-0.5">
        {options.map((o) => (
          <label key={o.value} className="relative cursor-pointer">
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="peer sr-only" />
            <span className="flex min-h-9 items-center rounded-full px-4 text-sm font-bold text-muted peer-checked:bg-navy peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand hover:text-ink peer-checked:hover:text-white">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function RuleControl({ rule, onChange }: { rule: Rule; onChange: (r: Rule) => void }) {
  return (
    <div className="flex flex-wrap gap-4">
      <Segmented<Norms>
        legend="Compare against"
        value={rule.norms}
        options={[
          { value: "local", label: "District" },
          { value: "national", label: "National" },
        ]}
        onChange={(norms) => onChange({ ...rule, norms, cutoff: norms === "national" ? NATIONAL_DEFAULT_CUTOFF : 90 })}
      />
      <Segmented<Scope>
        legend="Qualify on"
        value={rule.scope}
        options={[
          { value: "any", label: "Any score" },
          { value: "composite", label: "Composite only" },
        ]}
        onChange={(scope) => onChange({ ...rule, scope })}
      />
    </div>
  );
}
