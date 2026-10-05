import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import { LensController } from "@/components/lens";
import { SiteHeader } from "@/components/site-header";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

// Type is Aptos, Riverside's brand face (loaded in globals.css). Atkinson
// Hyperlegible is loaded on demand only for the student player's "Easy-read"
// font tool, so it never competes with the brand.
const atkinson = Atkinson_Hyperlegible_Next({ variable: "--font-atkinson", subsets: ["latin"], weight: ["400", "700"], preload: false, fallback: ["system-ui", "sans-serif"], adjustFontFallback: false });

export const metadata: Metadata = {
  title: { default: "Reach: an accessible-first assessment platform concept", template: "%s · Reach concept" },
  description:
    "An unofficial product design concept for Riverside Insights' Reach platform by Hafsa Usmani: a student test player, an educator score report and an admin setup, built on a design system with WCAG 2.2 AA from the first pixel.",
  metadataBase: new URL("https://riverside-insights-demo.vercel.app"),
};

export const viewport: Viewport = { themeColor: "#ffffff", colorScheme: "light" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${atkinson.variable} antialiased`}>
      <body className="font-sans text-body">
        <StoreProvider>
          <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[80] focus:rounded-full focus:bg-navy focus:px-4 focus:py-3 focus:font-bold focus:text-white">
            Skip to content
          </a>
          <div id="app" className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
              {children}
            </main>
            <footer className="no-print bg-band text-white">
              <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-sm text-white/85 sm:px-6">
                <span>
                  An unofficial concept by{" "}
                  <a className="font-bold text-white underline underline-offset-4" href="https://hafsausmani.com">
                    Hafsa Usmani
                  </a>{" "}
                  for the UX/UI Designer, Reach role. Not affiliated with Riverside Insights. Students, scores and items are synthetic. CogAT® is a registered trademark of Riverside Assessments, LLC.
                </span>
              </div>
            </footer>
          </div>
          <LensController />
        </StoreProvider>
        <Analytics />
      </body>
    </html>
  );
}
