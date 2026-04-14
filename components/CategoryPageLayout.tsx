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
      className="min-h-screen bg-[#F0EBE1] text-gray-900 antialiased [font-family:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif]"
    >
      <header className="relative isolate overflow-hidden border-b border-[#2B4C7E]/20 bg-[#F5EFE6]">
        <div className="relative mx-auto flex max-w-[1200px] flex-col items-center px-4 py-8 text-center sm:py-10">
          <span className="inline-flex items-center rounded-full border border-[#2B4C7E]/25 bg-white px-3 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1A1A2E] shadow-sm sm:text-[11px]">
            Compare · shortlist · shop smarter
          </span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#1A1A2E] sm:text-4xl sm:leading-tight">
            {title}
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-pretty text-sm leading-relaxed text-[#1A1A2E] sm:text-base">
            {tagline}
          </p>
          {categoryNav}
        </div>
      </header>

      {filterBar}

      <main className="mx-auto max-w-[1200px] px-4 pb-24 pt-10">{children}</main>
    </div>
  );
}
