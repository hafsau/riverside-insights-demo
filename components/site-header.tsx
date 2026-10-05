"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { RiversideMark } from "@/components/brand";
import { LensToggle } from "@/components/lens";

const NAV = [
  { href: "/student", label: "Student" },
  { href: "/educator", label: "Educator" },
  { href: "/admin", label: "Admin" },
  { href: "/system", label: "Design system" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/about", label: "Case study" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- close the mobile menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="no-print sticky top-0 z-50 rounded-b-[25px] bg-raised/95 shadow-card backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2 sm:px-6">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 rounded-md pr-2" aria-label="Reach by Riverside Insights, concept, home">
          <RiversideMark className="size-9" />
          <span className="flex flex-col leading-none">
            <span className="text-xl font-extrabold text-ink">Reach</span>
            <span className="mt-0.5 hidden text-[11px] font-bold tracking-wide text-muted uppercase sm:block">Riverside Insights · concept</span>
          </span>
        </Link>
        <nav aria-label="Primary" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => {
              const current = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={current ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center rounded-full px-3.5 text-[15px] font-bold transition-colors ${current ? "bg-brand-soft text-navy" : "text-muted hover:bg-sunken hover:text-ink"}`}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="ml-auto lg:ml-2">
          <LensToggle />
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-navy hover:bg-sunken lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">Menu</span>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Primary" className="border-t border-line lg:hidden">
          <ul className="mx-auto grid grid-cols-1 max-w-7xl gap-1 px-4 py-3 sm:px-6">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={pathname.startsWith(n.href) ? "page" : undefined} className="flex min-h-11 items-center rounded-md px-3 font-bold text-body hover:bg-sunken aria-[current=page]:bg-brand-soft aria-[current=page]:text-navy">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
