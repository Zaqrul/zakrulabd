"use client";

import { useState } from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/icons";
import { useI18n } from "@/components/language-provider";
import {
  BookingDemo,
  InventoryDemo,
  PaymentDemo,
  ShopifySyncDemo,
  StoreDemo,
  TawkChatDemo,
} from "@/components/capability-demos";

const demos = [StoreDemo, InventoryDemo, BookingDemo, TawkChatDemo, ShopifySyncDemo, PaymentDemo];

export function WhatCanBuild() {
  const { t } = useI18n();
  const [active, setActive] = useState(0);
  const capabilities = t.build.items;
  const current = capabilities[active] ?? capabilities[0];
  const CurrentDemo = demos[active] ?? demos[0];

  return (
    <section className="border-y border-border bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-12">
          <h2 className="font-display text-4xl font-bold leading-tight text-navy md:text-5xl">
            {current.headingBefore}
            <span className="hl">{current.headingHighlight}</span>
            {current.headingAfter}
          </h2>
          <p className="text-base leading-relaxed text-body md:text-lg lg:pt-2">{current.description}</p>
        </div>

        {/* Mobile Dropdown (mobile only) */}
        <div className="relative mt-8 sm:hidden">
          <label htmlFor="capability-select" className="sr-only">
            Select feature
          </label>
          <select
            id="capability-select"
            value={active}
            onChange={(e) => setActive(Number(e.target.value))}
            className="w-full appearance-none rounded-xl border border-border bg-bg py-3 pl-4 pr-10 text-sm font-semibold text-navy shadow-xs focus:border-navy focus:bg-white focus:outline-none"
          >
            {capabilities.map((c, i) => (
              <option key={c.pill} value={i}>
                {c.pill}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-navy">
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        </div>

        {/* Desktop / Tablet Pill Bar (sm and up) */}
        <div className="mt-10 hidden sm:flex flex-wrap gap-2 rounded-full bg-bg p-2">
          {capabilities.map((c, i) => (
            <button
              key={c.pill}
              type="button"
              onClick={() => setActive(i)}
              className={
                i === active
                  ? "rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition"
                  : "rounded-full px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-white"
              }
            >
              {c.pill}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 items-stretch gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,7fr)]">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{t.build.client}</span>
            <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-[12.5px] leading-snug text-ink">{current.brief}</p>

            <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted">zakrulabd</span>
            <div className="rounded-xl bg-bg p-3">
              <div className="flex flex-col gap-2.5">
                {current.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-teal-600" />
                    <span className="text-[12.5px] leading-snug text-ink">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-80 overflow-hidden rounded-2xl border border-border bg-white shadow-xl md:h-96">
            <CurrentDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
