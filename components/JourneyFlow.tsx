"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JourneyStored, JourneyTypeId, SituationId } from "@/lib/journeyStorage";

export type JourneyFlowProps = {
  onComplete: (data: JourneyStored) => void;
};

type Screen = 0 | 1 | 2;

const JOURNEY_OPTIONS: {
  id: JourneyTypeId;
  title: string;
  description: string;
  iconBg: string;
  wisdom: { quote: string; source: string };
}[] = [
  {
    id: "first-baby",
    title: "First baby arriving",
    description: "Starting completely fresh",
    iconBg: "bg-[#C8E6C9]",
    wisdom: {
      quote: "The journey of a thousand miles begins beneath one's feet.",
      source: "— Tao Te Ching",
    },
  },
  {
    id: "upgrading",
    title: "Upgrading gear",
    description: "Need something better",
    iconBg: "bg-[#E3F2FD]",
    wisdom: {
      quote: "Clarity of purpose makes all choices beautifully simple.",
      source: "— Bhagavad Gita",
    },
  },
  {
    id: "second-child",
    title: "Second child",
    description: "Growing the family",
    iconBg: "bg-[#F3E5F5]",
    wisdom: {
      quote:
        "What we do for ourselves dies with us. What we do for others is immortal.",
      source: "— Albert Pine",
    },
  },
  {
    id: "gift",
    title: "Buying a gift",
    description: "Shopping for someone else",
    iconBg: "bg-[#FFFDE7]",
    wisdom: {
      quote: "Giving is not just about making a donation. It is about making a difference.",
      source: "— Kathy Calvin",
    },
  },
];

const SITUATION_OPTIONS: {
  id: SituationId;
  title: string;
  description: string;
  iconBg: string;
}[] = [
  {
    id: "city-apartment",
    title: "City / Apartment",
    description: "Elevators, tight spaces",
    iconBg: "bg-[#E3F2FD]",
  },
  {
    id: "house-suburbs",
    title: "House / Suburbs",
    description: "More space, garage",
    iconBg: "bg-[#C8E6C9]",
  },
  {
    id: "travel-often",
    title: "Travel often",
    description: "Portability matters",
    iconBg: "bg-[#FFF3E0]",
  },
  {
    id: "compact-car",
    title: "Compact car",
    description: "Small trunk, tight seat",
    iconBg: "bg-[#F5F5F5]",
  },
  {
    id: "tall-parent",
    title: "Tall parent 6ft+",
    description: "Handlebar height matters",
    iconBg: "bg-[#F3E5F5]",
  },
  {
    id: "value-matters",
    title: "Value matters",
    description: "Quality but price too",
    iconBg: "bg-[#DCEDC8]",
  },
];

const LOADING_SETS = [
  {
    main: "Before every great beginning, there is a moment of sacred stillness.",
    source: "— Adapted from the Upanishads",
    sub: "The right tool in the right hands becomes an extension of love.",
  },
  {
    main: "That which serves the child, serves the family. That which serves the family, serves the world.",
    source: "— Manusmriti, adapted",
    sub: "May this serve your family with grace and joy.",
  },
  {
    main: "From the unreal lead me to the real. From darkness lead me to light.",
    source: "— Brihadaranyaka Upanishad",
    sub: "Every choice made with love leads to the right destination.",
  },
] as const;

const STATUS_LINES = [
  "Finding your perfect matches...",
  "Analyzing your situation...",
  "Ranking by fit for your life...",
  "Almost ready...",
] as const;

const LOADING_SYMBOLS = ["🌱", "☀️", "🌙"] as const;

function IconSeedling({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 42V28M24 28c-4-8-12-10-16-4-3 5 0 14 8 18M24 28c4-8 12-10 16-4 3 5 0 14-8 18"
        stroke="#388E3C"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 18c-2-6-8-9-12-5-3 3-2 10 4 14"
        stroke="#66BB6A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 18c2-6 8-9 12-5 3 3 2 10-4 14"
        stroke="#2D6A4F"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconUpgrade({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M14 34h20M24 38V14M18 20l6-6 6 6"
        stroke="#5B9BD5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 10h4M32 10h4M14 8l-2 4M34 8l2 4"
        stroke="#5B9BD5"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M16 12l2 2M30 12l-2 2" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconPeople({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="16" cy="18" r="5" stroke="#9B6BA8" strokeWidth="2" />
      <circle cx="32" cy="18" r="5" stroke="#9B6BA8" strokeWidth="2" />
      <path
        d="M10 36c1-6 4-9 6-9h6c2 0 5 3 6 9M26 36c1-6 4-9 6-9h6c2 0 5 3 6 9"
        stroke="#9B6BA8"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconGift({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="10" y="20" width="28" height="22" rx="2" stroke="#D4A017" strokeWidth="2" />
      <path d="M24 14v28" stroke="#D4A017" strokeWidth="2" />
      <path
        d="M16 20h16c0-4-3-7-8-7s-8 3-8 7z"
        stroke="#D4A017"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M18 12c2-2 5-2 6 0" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconBuilding({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path d="M14 40V18l10-6 10 6v22" stroke="#5B9BD5" strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 40V28h4v12M26 40V24h4v16" stroke="#5B9BD5" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 40h28" stroke="#5B9BD5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconHouse({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M8 22L24 10l16 12v20H8V22z"
        stroke="#388E3C"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M18 40V26h12v14" stroke="#388E3C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconPlane({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M8 28l32-8-6 6 6 14-10-8-8 8-2-10-10-2 8-8z"
        stroke="#F5A623"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M8 32h32l-2-10-6-6H16l-6 6-2 10z"
        stroke="#6B7280"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="14" cy="34" r="3" stroke="#6B7280" strokeWidth="2" />
      <circle cx="34" cy="34" r="3" stroke="#6B7280" strokeWidth="2" />
    </svg>
  );
}

function IconTall({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="12" r="4" stroke="#9B6BA8" strokeWidth="2" />
      <path d="M24 16v14M18 22h12M20 40l4-10 4 10" stroke="#9B6BA8" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 8l4 2M32 14" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M24 8l3 8 8 1-6 6 2 9-7-4-7 4 2-9-6-6 8-1 3-8z"
        stroke="#388E3C"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WisdomLeafSymbol({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21c-4-4-8-10-8-14a8 8 0 0116 0c0 4-4 10-8 14z"
        fill="#388E3C"
        fillOpacity="0.35"
      />
      <path d="M12 21V9" stroke="#388E3C" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ProgressSteps({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-2" role="status" aria-label={`Step ${step} of 3`}>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`h-2 w-10 rounded-full transition-colors ${
            n <= step ? "bg-[#388E3C]" : "bg-[#C8E6C9]/60"
          }`}
        />
      ))}
    </div>
  );
}

export function JourneyFlow({ onComplete }: JourneyFlowProps) {
  const [screen, setScreen] = useState<Screen>(0);
  const [journeyType, setJourneyType] = useState<JourneyTypeId | null>(null);
  const [situations, setSituations] = useState<SituationId[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSetIndex, setLoadingSetIndex] = useState(0);
  const [loadingSymbol, setLoadingSymbol] = useState<(typeof LOADING_SYMBOLS)[number]>("🌱");
  const [statusIndex, setStatusIndex] = useState(0);
  const [showSubQuote, setShowSubQuote] = useState(false);

  const [leftFailed, setLeftFailed] = useState(false);
  const [rightFailed, setRightFailed] = useState(false);

  const toggleSituation = useCallback((id: SituationId) => {
    setSituations((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const completionPayloadRef = useRef<JourneyStored | null>(null);

  const startLoading = useCallback(() => {
    if (!journeyType) return;
    completionPayloadRef.current = { journeyType, situations };
    setLoadingSetIndex(Math.floor(Math.random() * LOADING_SETS.length));
    setLoadingSymbol(LOADING_SYMBOLS[Math.floor(Math.random() * LOADING_SYMBOLS.length)]!);
    setStatusIndex(0);
    setShowSubQuote(false);
    setLoading(true);
  }, [journeyType, situations]);

  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => setShowSubQuote(true), 900);
    return () => window.clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    if (!loading) return;
    const id = window.setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 700);
    return () => window.clearInterval(id);
  }, [loading]);

  useEffect(() => {
    if (!loading) return;
    const done = window.setTimeout(() => {
      setLoading(false);
      const payload = completionPayloadRef.current;
      completionPayloadRef.current = null;
      if (payload) onComplete(payload);
    }, 3000);
    return () => window.clearTimeout(done);
  }, [loading, onComplete]);

  const selectedJourneyWisdom = useMemo(() => {
    if (!journeyType) return null;
    const opt = JOURNEY_OPTIONS.find((o) => o.id === journeyType);
    return opt?.wisdom ?? null;
  }, [journeyType]);

  const journeyIcon = (id: JourneyTypeId) => {
    const c = "h-9 w-9";
    switch (id) {
      case "first-baby":
        return <IconSeedling className={c} />;
      case "upgrading":
        return <IconUpgrade className={c} />;
      case "second-child":
        return <IconPeople className={c} />;
      case "gift":
        return <IconGift className={c} />;
      default:
        return null;
    }
  };

  const situationIcon = (id: SituationId) => {
    const c = "h-8 w-8";
    switch (id) {
      case "city-apartment":
        return <IconBuilding className={c} />;
      case "house-suburbs":
        return <IconHouse className={c} />;
      case "travel-often":
        return <IconPlane className={c} />;
      case "compact-car":
        return <IconCar className={c} />;
      case "tall-parent":
        return <IconTall className={c} />;
      case "value-matters":
        return <IconStar className={c} />;
      default:
        return null;
    }
  };

  if (loading) {
    const set = LOADING_SETS[loadingSetIndex] ?? LOADING_SETS[0]!;
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 text-center"
        style={{
          background: "linear-gradient(160deg, #1A1A2E, #2D3748)",
        }}
      >
        <div className="mb-8 text-5xl animate-bp-breathe" aria-hidden>
          {loadingSymbol}
        </div>
        <p className="font-dm-serif-display max-w-md text-[22px] italic leading-snug text-[#F5F0E8]">
          {set.main}
        </p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[#6B7280]">{set.source}</p>
        <div className="mt-8 flex items-center gap-1.5" aria-hidden>
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[#388E3C] [animation-delay:0ms]" />
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[#388E3C] [animation-delay:150ms]" />
          <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-[#388E3C] [animation-delay:300ms]" />
        </div>
        <p className="mt-6 text-sm text-[#9CA3AF]">{STATUS_LINES[statusIndex]}</p>
        <div className="mx-auto mt-10 h-px w-48 max-w-full bg-white/10" />
        <p
          className={`mt-8 max-w-sm text-[15px] leading-relaxed text-[#D1D5DB] transition-opacity duration-500 ${
            showSubQuote ? "opacity-100" : "opacity-0"
          }`}
        >
          {set.sub}
        </p>
      </div>
    );
  }

  if (screen === 0) {
    return (
      <div
        className="relative min-h-[100svh] flex flex-col overflow-hidden px-8 py-10 text-[15px] sm:px-12 sm:py-14 sm:text-[16px] md:px-16 lg:px-20"
        style={{ background: "var(--bp-hero-gradient)" }}
      >
        <div className="bp-side-art bp-side-art-left" aria-hidden />
        <div className="bp-side-art bp-side-art-right" aria-hidden />

        <div className="relative z-10 flex min-h-[100svh] flex-col">
          <div className="flex w-full max-w-3xl flex-col items-stretch text-left">
            <div className="mb-10 sm:mb-14">
              <h1 className="font-dm-serif-display max-w-none text-5xl leading-tight text-[#1A1A2E] sm:text-6xl md:text-7xl">
              BabyPickr
              </h1>
              <p className="mt-2.5 text-[12px] font-semibold uppercase tracking-[0.28em] text-[#2D6A4F]">
                The baby gear guide parents trust
              </p>
            </div>
            <h2 className="font-dm-serif-display mt-6 max-w-xl text-3xl leading-[1.05] text-[#1A1A2E] sm:text-4xl md:text-5xl">
              Find the perfect baby gear
              <br />
              for your exact situation
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#1A1A2E]/85">
              Not a generic list. A guided experience that understands your life — then reveals exactly what
              fits you and your family.
            </p>
            <div className="mt-8">
              <button
                type="button"
                className="inline-flex max-w-none rounded-full bg-[#388E3C] px-8 py-3.5 text-[15px] font-semibold text-white shadow-md shadow-[#388E3C]/30 transition hover:bg-[#2D6A4F]"
                onClick={() => setScreen(1)}
              >
                Begin your journey →
              </button>
              <p className="mt-3 max-w-none text-[13px] text-[#6B7280]">
                Takes less than 60 seconds · No sign up needed
              </p>
            </div>
          </div>

          <div className="mt-10 max-w-xl pb-6">
            <div className="max-w-xl rounded-2xl border-l-4 border-[#388E3C] bg-white/75 p-6 shadow-sm backdrop-blur-sm">
              <p className="font-dm-serif-display text-[18px] sm:text-[20px] italic leading-relaxed text-[#1B4332]">
                &ldquo;Before the birth of love, there is preparation. Before preparation, there is
                wisdom.&rdquo;
              </p>
              <p className="mt-3 text-[13px] text-[#6B7280]">— Adapted from Rigveda 10.129</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 1) {
    return (
      <div
        className="relative min-h-[100svh] flex flex-col px-6 py-10 text-[15px] sm:px-10 sm:text-[16px]"
        style={{ background: "var(--bp-hero-gradient)" }}
      >
        <div className="bp-side-art bp-side-art-left" aria-hidden />
        <div className="bp-side-art bp-side-art-right" aria-hidden />

        <div className="relative z-10 max-w-xl pl-0">
          <ProgressSteps step={1} />
          <h2 className="font-dm-serif-display mt-6 text-[26px] text-[#1A1A2E]">
            What are you preparing for?
          </h2>
          <p className="mt-2 text-[15px] text-[#6B7280]">
            Every journey begins differently. Tell us yours.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 w-full">
            {JOURNEY_OPTIONS.map((opt) => {
              const selected = journeyType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setJourneyType(opt.id)}
                  className={`flex min-h-[120px] flex-col items-start rounded-2xl border-2 p-4 text-left transition-all ${
                    selected
                      ? "border-[#388E3C] bg-[#C8E6C9]/50 shadow-sm"
                      : "border-transparent bg-white/80 hover:border-[#388E3C]/30"
                  }`}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${opt.iconBg}`}>
                    {journeyIcon(opt.id)}
                  </div>
                  <span className="mt-3 text-lg font-semibold text-[#1A1A2E]">{opt.title}</span>
                  <span className="mt-1 text-[14px] text-[#6B7280]">{opt.description}</span>
                </button>
              );
            })}
          </div>

          <div
            className={`mt-6 transition-all duration-500 ${
              selectedJourneyWisdom
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            }`}
          >
            {selectedJourneyWisdom && (
              <div
                className="flex flex-row gap-3 rounded-2xl border-[0.5px] border-[rgba(56,142,60,0.25)] px-5 py-[18px]"
                style={{ background: "var(--bp-wisdom-gradient)" }}
              >
                <WisdomLeafSymbol className="h-6 w-6 shrink-0" />
                <div className="min-w-0">
                  <p className="font-dm-serif-display text-base italic leading-snug text-[#1B4332]">
                    &ldquo;{selectedJourneyWisdom.quote}&rdquo;
                  </p>
                  <p className="mt-1 text-[11px] text-[#9B9B9B]">{selectedJourneyWisdom.source}</p>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!journeyType}
            className="mt-6 w-full rounded-2xl bg-[#388E3C] px-6 py-3.5 text-[15px] font-semibold text-white shadow-md transition enabled:hover:bg-[#2D6A4F] disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setScreen(2)}
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100svh] flex flex-col px-6 py-10 text-[15px] sm:px-10 sm:text-[16px]" style={{ background: "var(--bp-hero-gradient)" }}>
      <div className="bp-side-art bp-side-art-left" aria-hidden />
      <div className="bp-side-art bp-side-art-right" aria-hidden />

      <div className="relative z-10 max-w-xl pl-0">
        <ProgressSteps step={2} />
        <h2 className="font-dm-serif-display mt-6 text-[26px] text-[#1A1A2E]">
          Tell us about your life
        </h2>
        <p className="mt-2 text-[15px] text-[#6B7280]">
          The right gear depends on how you actually live.
        </p>
        <p className="mt-1 text-[12px] font-medium text-[#388E3C]">✓ Select all that apply</p>

        <div className="mt-6 grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
          {SITUATION_OPTIONS.map((opt) => {
            const selected = situations.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleSituation(opt.id)}
                className={`flex min-h-[100px] flex-col items-start rounded-2xl border-2 p-4 text-left transition-all ${
                  selected
                    ? "border-[#388E3C] bg-[#C8E6C9]/50 shadow-sm"
                    : "border-transparent bg-white/80 hover:border-[#388E3C]/30"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${opt.iconBg}`}
                >
                  {situationIcon(opt.id)}
                </div>
                <span className="mt-3 text-[15px] font-semibold text-[#1A1A2E]">{opt.title}</span>
                <span className="mt-1 text-[12px] text-[#6B7280]">{opt.description}</span>
              </button>
            );
          })}
        </div>

        <div
          className="mt-6 flex flex-row gap-3 rounded-2xl border-[0.5px] border-[rgba(56,142,60,0.25)] px-5 py-[18px]"
          style={{ background: "var(--bp-wisdom-gradient)" }}
        >
          <span className="text-2xl" aria-hidden>
            🌿
          </span>
          <div className="min-w-0">
            <p className="font-dm-serif-display text-base italic leading-snug text-[#1B4332]">
              &ldquo;Know thyself, and the right path reveals itself naturally.&rdquo;
            </p>
            <p className="mt-1 text-[11px] text-[#9B9B9B]">— Chandogya Upanishad, adapted</p>
          </div>
        </div>

        <button
          type="button"
          className="mt-6 w-full rounded-2xl bg-[#388E3C] px-6 py-3.5 text-[15px] font-semibold text-white shadow-md transition hover:bg-[#2D6A4F]"
          onClick={startLoading}
        >
          Show my matches →
        </button>
      </div>
    </div>
  );
}
