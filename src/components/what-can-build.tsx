"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, ChevronDownIcon } from "@/components/icons";
import { TechMarks } from "@/components/tech-marks";
import { tech, type TechKey } from "@/lib/tech";
import { content } from "@/lib/content";
import { contentMs } from "@/lib/content-ms";
import {
  BookingDemo,
  InventoryDemo,
  PaymentDemo,
  ShopifySyncDemo,
  StoreDemo,
  TawkChatDemo,
} from "@/components/capability-demos";
import { Mark, RevealText } from "@/components/reveal-text";

const demos = [StoreDemo, InventoryDemo, BookingDemo, TawkChatDemo, ShopifySyncDemo, PaymentDemo];

/* The stack each build actually runs on, in the same order as content.build.items.
   Each row is a combination that ships as a unit: a backend, its database, and the
   service the feature depends on. Laravel already implies PHP, so PHP is only
   listed where the build is not a Laravel one. */
const stacks: TechKey[][] = [
  // Storefront: Laravel handles catalogue and orders, Stripe handles checkout.
  ["laravel", "mysql", "tailwind", "stripe"],
  // Stock dashboard: React front end against a Laravel API.
  ["react", "laravel", "mysql", "tailwind"],
  // Booking: Supabase realtime drives live slot availability.
  ["next", "supabase", "tailwind"],
  // Live chat: Tawk.to for the widget, n8n for routing the leads it captures.
  ["tawkto", "wordpress", "n8n"],
  // Shopify sync: a Laravel service against the Shopify Admin API.
  ["shopify", "laravel", "mysql"],
  // Payments: Laravel server-side, Stripe for card, FPX, and e-wallet.
  ["laravel", "stripe", "mysql"],
];

export function WhatCanBuild({ copy = content }: { copy?: typeof content | typeof contentMs }) {
  const t = copy;
  const [active, setActive] = useState(0);
  const capabilities = t.build.items;
  const current = capabilities[active] ?? capabilities[0];
  const CurrentDemo = demos[active] ?? demos[0];
  const currentStack = stacks[active] ?? stacks[0];
  const showcase = t.build.showcases.find((s) => s.pill === current.pill);

  return (
    <section id="projects" className="border-y border-border bg-white px-6 py-24">
      <div className="mx-auto max-w-shell">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-12">
          <h2 className="font-display text-[30px] font-bold leading-tight text-navy md:text-5xl"><RevealText key={active}>
            {current.headingBefore}
            <Mark>{current.headingHighlight}</Mark>
            {current.headingAfter}
          </RevealText></h2>
          <div className="flex flex-col gap-4 lg:pt-2">
            <p className="text-base leading-relaxed text-body md:text-lg"><RevealText key={active} text>{current.description}</RevealText></p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted"><RevealText text>{t.build.builtWith}</RevealText></span>
              {currentStack.map((key) => {
                const { name, Icon, color } = tech[key];
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white py-1 pl-1.5 pr-3 text-[12.5px] font-semibold text-ink shadow-xs"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bg">
                      <Icon className="h-3.5 w-3.5" style={{ color }} aria-hidden="true" />
                    </span>
                    {name}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: dropdown instead of the pill bar. The label is visible here
            because the bare select on its own reads as a heading, not a control. */}
        <div className="mt-8 sm:hidden">
          <label
            htmlFor="capability-select"
            className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-muted"
          >
            {t.build.selectLabel}
          </label>
          <div className="relative">
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
        </div>

        {/* Tablet and up: pill bar */}
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted"><RevealText text>{t.build.client}</RevealText></span>
            <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-[12.5px] leading-snug text-ink"><RevealText key={active} text>{current.brief}</RevealText></p>

            <span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted">Zakrul</span>
            <div className="rounded-xl bg-bg p-3">
              <div className="flex flex-col gap-2.5">
                {current.features.map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <CheckIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-teal-600" />
                    <span className="flex flex-wrap items-center gap-1.5 text-[12.5px] leading-snug text-ink">
                      <TechMarks text={f} size={13} />
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Capabilities with a working demo page link to it. */}
            {/* The address carries the marker rather than the sentence: .hl is
                the site's emphasis, and the destination is the part worth
                emphasising. It replaces the brackets it would otherwise sit
                inside — a marker and a pair of parentheses do the same job, and
                two of them is one too many. */}
            {showcase && (
              <Link
                href={showcase.href}
                className="group mt-1 inline-flex w-fit flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] font-semibold leading-relaxed text-ink"
              >
                {showcase.label}
                <Mark className="group-hover:[--hl-color:var(--color-amber-500)]">
                  {showcase.note}
                </Mark>
                <ArrowRightIcon className="h-3.5 w-3.5 flex-shrink-0 text-muted transition-colors group-hover:text-navy" />
              </Link>
            )}
          </div>

          <div className="h-80 overflow-hidden rounded-2xl border border-border bg-white shadow-xl md:h-96">
            <CurrentDemo />
          </div>
        </div>
      </div>
    </section>
  );
}
