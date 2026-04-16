"use client";

import { useMemo, useState, type ReactNode } from "react";

export type CategoryPageLayoutProps = {
  title: string;
  tagline: string;
  categoryNav: ReactNode;
  filterBar: ReactNode | null;
  children: ReactNode;
};

export function CategoryPageLayout({
  title,
  tagline,
  categoryNav,
  filterBar,
  children,
}: CategoryPageLayoutProps) {
  const [leftFailed, setLeftFailed] = useState(false);
  const [rightFailed, setRightFailed] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#F2F7F2] text-[#1A1A2E] antialiased [font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif] text-[15px] sm:text-[16px]">
      <div className="bp-side-art bp-side-art-left" aria-hidden />
      <div className="bp-side-art bp-side-art-right" aria-hidden />

      <div className="relative z-10">
        <header
          className="relative isolate overflow-hidden border-b border-[#388E3C]/20"
          style={{ background: "var(--bp-hero-gradient)" }}
        >
          <div className="relative mx-auto max-w-[1400px] px-4 py-7 sm:py-9">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10">
              <div className="w-full lg:w-3/5">
                <span className="inline-flex items-center rounded-full border border-[#388E3C]/25 bg-white px-3 py-1 text-[11px] font-semibold tracking-wide text-[#388E3C] shadow-sm">
                  {title}
                </span>
                <h1 className="font-dm-serif-display mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#1A1A2E] sm:text-5xl">
                  {tagline}
                </h1>
                <p className="mt-3 max-w-2xl leading-relaxed text-[#6B7280]">
                  Compare products, filter by your situation, and shop smarter with personalized
                  recommendations.
                </p>
                {categoryNav}
              </div>

              <div className="hidden lg:block lg:w-2/5">
                <div
                  className="h-full min-h-[220px] w-full rounded-[2.75rem] border border-[#388E3C]/15 bg-gradient-to-br from-[#C8E6C9] via-white to-[#E3F2FD] shadow-inner"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </header>

        {filterBar}

        <main className="mx-auto max-w-[1400px] px-4 pb-20 pt-7">{children}</main>
      </div>
    </div>
  );
}
