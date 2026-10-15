"use client";

import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  TbArrowRight,
  TbBriefcase,
  TbChartBar,
  TbCheck,
  TbCode,
  TbCreditCard,
  TbFileText,
  TbHelpCircle,
  TbLock,
  TbScale,
  TbShieldCheck,
  TbTable,
  TbTool,
  TbUsers,
  TbArrowsSplit,
  TbCopyright,
  TbInfoCircle,
  TbPlugConnected,
  TbEye,
  TbHome,
  TbLayoutGrid,
  TbListCheck,
  TbMapPin,
  TbMedal,
  TbNotes,
  TbRoute,
  TbSend,
  TbStack2,
  TbStar,
  TbTag,
  TbX,
} from "react-icons/tb";
import { wa, waMessages } from "@/lib/contact";
import { sectionSummaries, type SuggestionAction } from "@/lib/section-summaries";
import { getSummariesOff, setSummariesOff, subscribeSummariesOff } from "@/lib/summary-pref";

const copy = {
  en: { heading: "Summary", close: "Close summary", off: "Turn off summaries", next: "Next" },
  ms: { heading: "Ringkasan", close: "Tutup ringkasan", off: "Matikan ringkasan", next: "Seterusnya" },
};

/* One icon per section, shown in the amber badge beside the label. */
const icons: Record<string, IconType> = {
  main: TbHome,
  services: TbCode,
  projects: TbLayoutGrid,
  process: TbRoute,
  pricing: TbTag,
  results: TbChartBar,
  stack: TbStack2,
  reviews: TbStar,
  notes: TbNotes,
  start: TbListCheck,
  contact: TbSend,
  "about-work": TbBriefcase,
  "about-skills": TbMedal,
  "about-proof": TbEye,
  "about-reach": TbMapPin,
  "compare-table": TbTable,
  "compare-divides": TbArrowsSplit,
  "compare-faq": TbHelpCircle,
  "compare-close": TbSend,
  "contact-form": TbSend,
  "notes-list": TbNotes,
  "privacy-1": TbInfoCircle,
  "privacy-2": TbFileText,
  "privacy-3": TbPlugConnected,
  "privacy-4": TbLock,
  "privacy-5": TbShieldCheck,
  "terms-1": TbFileText,
  "terms-2": TbCreditCard,
  "terms-3": TbUsers,
  "terms-4": TbCopyright,
  "terms-5": TbTool,
  "terms-6": TbScale,
};

/* A section has to hold the top of the screen this long before it is
   summarised, so scrolling quickly past five of them says nothing. */
const SETTLE_MS = 900;
const THINK_MS = 600;
const TYPE_MS = 18;
/* Longer than a bare sentence needs: the points and follow-ups come after it. */
const LINGER_MS = 14000;

/* The section whose top has scrolled past the line near the top of the screen.
   Matches how the navbar picks the section it marks as current. */
function currentSectionId() {
  let current: string | null = null;
  for (const { id } of sectionSummaries) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 140) current = id;
  }
  return current;
}

function hrefFor(action: SuggestionAction, lang: "en" | "ms") {
  switch (action.kind) {
    case "scroll":
      return `#${action.id}`;
    case "wa":
      return wa(waMessages[action.message]);
    case "page": {
      const prefix = lang === "ms" && action.path !== "" && action.localized !== false ? "/ms" : "";
      return `${prefix}${action.path}`;
    }
  }
}

/* A chat-style message that writes itself out, like an assistant replying, when
   the visitor scrolls into a section of the page. Once it is written, the
   section's key points fade in under it and a few follow-ups are offered, the
   way a chat assistant suggests what to ask next. Each section is summarised at
   most once per visit. It stays out of the way while the contact dock is open,
   waits while the pointer or focus is on it. The cross closes only that one
   summary; the next section still gets its own. Turning them all off is a
   separate, deliberate choice, and the dock has the switch to undo it. */
export function SectionSummary({
  lang,
  suspended,
  onShow,
}: {
  lang: "en" | "ms";
  suspended: boolean;
  onShow: () => void;
}) {
  const t = copy[lang];
  const [id, setId] = useState<string | null>(null);
  const [typed, setTyped] = useState(0);
  const [thinking, setThinking] = useState(false);
  const [held, setHeld] = useState(false);
  const done = useRef(new Set<string>());
  const off = useRef(false);

  /* Watch the scroll position; once a not-yet-summarised section has been the
     current one for a moment, show it. */
  useEffect(() => {
    off.current = getSummariesOff();
    /* The dock has a switch for this too; keep both in step, and drop a summary
       that is on screen the moment they are switched off. */
    const unsubscribe = subscribeSummariesOff((value) => {
      off.current = value;
      if (value) setId(null);
    });

    let timer: ReturnType<typeof setTimeout> | undefined;
    let candidate: string | null = null;

    function check() {
      /* Not before the visitor has moved: the first section is simply where the
         page starts, and nobody has scrolled into it. */
      if (off.current || window.scrollY < 40) return;
      const next = currentSectionId();
      if (next === candidate) return;
      candidate = next;
      clearTimeout(timer);
      if (!next || done.current.has(next)) return;

      timer = setTimeout(() => {
        if (currentSectionId() !== next || off.current) return;
        done.current.add(next);
        onShow();
        setTyped(0);
        setThinking(true);
        setHeld(false);
        setId(next);
      }, SETTLE_MS);
    }

    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => {
      window.removeEventListener("scroll", check);
      clearTimeout(timer);
      unsubscribe();
    };
  }, [onShow]);

  const entry = id ? sectionSummaries.find((s) => s.id === id) : undefined;
  const text = entry?.text[lang] ?? "";

  /* "Thinking" dots first, then the text one or two characters at a time. With
     reduced motion the whole message just appears. */
  useEffect(() => {
    if (!entry) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const now = setTimeout(() => {
        setThinking(false);
        setTyped(text.length);
      }, 0);
      return () => clearTimeout(now);
    }

    let typing: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      setThinking(false);
      typing = setInterval(() => setTyped((n) => Math.min(n + 2, text.length)), TYPE_MS);
    }, THINK_MS);
    return () => {
      clearTimeout(start);
      clearInterval(typing);
    };
  }, [entry, text]);

  /* Goes away on its own once the message has been readable for a while, but
     not while someone is reading it or reaching for a follow-up. */
  useEffect(() => {
    if (!entry || typed < text.length || held) return;
    const timer = setTimeout(() => setId(null), LINGER_MS);
    return () => clearTimeout(timer);
  }, [entry, typed, text.length, held]);

  if (!entry || suspended) return null;

  function turnOff() {
    setSummariesOff(true);
    setId(null);
  }

  const Icon = icons[entry.id];
  const finished = typed >= text.length;
  const points = entry.points?.[lang] ?? [];

  const chip =
    "inline-flex items-center gap-1.5 rounded-full border border-navy/15 bg-white px-3 py-1.5 text-[12px] font-semibold text-navy transition-colors hover:border-navy hover:bg-navy hover:text-amber-400 focus-visible:border-navy focus-visible:bg-navy focus-visible:text-amber-400 focus-visible:outline-none";

  return (
    <div
      className="rise-in pointer-events-auto relative w-fit max-w-sm rounded-2xl rounded-br-md border border-neutral-200 bg-white p-3 pr-2 shadow-lg sm:rounded-br-2xl"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400 text-navy">
          {Icon && <Icon className="h-3.5 w-3.5" />}
        </span>
        <span className="flex-1 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
          {t.heading} · {entry.label[lang]}
        </span>
        <button
          type="button"
          aria-label={t.close}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-navy hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          onClick={() => setId(null)}
        >
          <TbX aria-hidden="true" className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Screen readers get the finished sentence at once; reading it out a
          letter at a time would be unusable. */}
      <p role="status" className="sr-only">{text}</p>

      <p aria-hidden="true" className="mt-1.5 pr-2 text-[13px] leading-relaxed text-navy">
        {thinking ? (
          <span className="inline-flex items-center gap-1 py-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
          </span>
        ) : (
          <>
            {text.slice(0, typed)}
            {!finished && <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-navy" />}
          </>
        )}
      </p>

      {finished && points.length > 0 && (
        <ul className="mt-2.5 flex flex-wrap gap-1.5 pr-2">
          {points.map((point, i) => (
            <li
              key={point}
              style={{ animationDelay: `${i * 90}ms` }}
              className="rise-in inline-flex items-center gap-1 rounded-full bg-amber-400/25 px-2.5 py-1 text-[11.5px] font-semibold text-navy"
            >
              <TbCheck aria-hidden="true" className="h-3 w-3 shrink-0" />
              {point}
            </li>
          ))}
        </ul>
      )}

      {finished && entry.suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 pr-2" aria-label={t.next}>
          {entry.suggestions.map(({ label, action }, i) => {
            const external = action.kind === "wa";
            return (
              <a
                key={label.en}
                href={hrefFor(action, lang)}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                style={{ animationDelay: `${(points.length + i) * 90 + 120}ms` }}
                className={`${chip} rise-in`}
                onClick={() => setId(null)}
              >
                {label[lang]}
                <TbArrowRight aria-hidden="true" className="h-3 w-3 shrink-0" />
              </a>
            );
          })}
        </div>
      )}

      {finished && (
        <button
          type="button"
          className="mt-2.5 text-[11px] font-semibold text-neutral-500 underline-offset-2 hover:text-navy hover:underline focus-visible:outline-none focus-visible:underline"
          onClick={turnOff}
        >
          {t.off}
        </button>
      )}
    </div>
  );
}
