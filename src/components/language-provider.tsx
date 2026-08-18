"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { dictionaries, type Dictionary, type Lang } from "@/lib/dictionaries";
import { ChevronDownIcon } from "@/components/icons";
import MY from "country-flag-icons/react/3x2/MY";
import GB from "country-flag-icons/react/3x2/GB";

const STORAGE_KEY = "zakrulabd-lang";

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Restore the visitor's previous choice. This has to run after mount rather than
  // in a lazy initialiser: the server can't read localStorage, so initialising from
  // it directly would render different markup on server and client (hydration error).
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see note above
    if (saved === "en" || saved === "ms") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "ms" ? "ms" : "en";
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const toggle = useCallback(() => {
    setLangState((prev) => {
      const next: Lang = prev === "en" ? "ms" : "en";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t: dictionaries[lang] as Dictionary }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within a LanguageProvider");
  return ctx;
}

const LANGUAGE_OPTIONS: { code: Lang; label: string; name: string; Flag: typeof MY }[] = [
  { code: "en", label: "EN", name: "English", Flag: GB },
  { code: "ms", label: "BM", name: "Bahasa Melayu", Flag: MY },
];

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = LANGUAGE_OPTIONS.find((o) => o.code === lang) ?? LANGUAGE_OPTIONS[0];
  const CurrentFlag = current.Flag;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-ink transition hover:border-navy"
      >
        <CurrentFlag className="h-3.5 w-5 rounded-[2px] object-cover" />
        {current.label}
        <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-1.5 min-w-[9.5rem] overflow-hidden rounded-xl border border-border bg-white p-1 shadow-lg"
        >
          {LANGUAGE_OPTIONS.map(({ code, name, Flag }) => {
            const isActive = code === lang;
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setLang(code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition ${
                  isActive ? "bg-navy text-white" : "text-ink hover:bg-bg"
                }`}
              >
                <Flag className="h-3.5 w-5 flex-shrink-0 rounded-[2px] object-cover" />
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
