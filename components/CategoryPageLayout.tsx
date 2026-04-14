"use client";

import type { ReactNode } from "react";

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
  return (
    <div
      className="min-h-screen bg-[#FDF6FA] text-gray-900 antialiased [font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif]"
    >
      <header className="relative isolate overflow-hidden border-b border-[#C4567E]/20 bg-[#F9E4F0]">
        <div className="relative mx-auto max-w-[1400px] px-4 py-10 sm:py-12">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-12">
            <div className="w-full lg:w-3/5">
              <span className="inline-flex items-center rounded-full border border-[#C4567E]/25 bg-white px-3 py-1 text-[11px] font-semibold tracking-wide text-[#C4567E] shadow-sm">
                {title}
              </span>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-[#3D1C2E] sm:text-5xl [font-family:var(--font-dm-serif-display),serif]">
                {tagline}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
                Compare products, filter by your situation, and shop smarter with personalized recommendations.
              </p>
              {categoryNav}
            </div>

            <div className="hidden lg:block lg:w-2/5">
              <div
                className="h-full min-h-[240px] w-full rounded-[2.75rem] border border-[#C4567E]/15 bg-gradient-to-br from-[#FDE8F2] via-white to-[#F0E8F8] shadow-inner"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </header>

      {filterBar}

      <main className="mx-auto max-w-[1400px] px-4 pb-24 pt-10">{children}</main>
    </div>
  );
}
