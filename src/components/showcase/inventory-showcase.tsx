"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import {
  PiArrowLeft,
  PiArrowsDownUp,
  PiCaretDown,
  PiCaretUp,
  PiMagnifyingGlass,
  PiPause,
  PiPlay,
  PiX,
} from "react-icons/pi";
import { wa, waMessages } from "@/lib/contact";
import { RollingAmount } from "@/components/showcase/rolling-amount";
import {
  ago,
  batches,
  categories,
  itemBy,
  items,
  locShort,
  locations,
  menu,
  minOf,
  moveTypes,
  num,
  qty,
  rm,
  round,
  seedCounts,
  seedLastCount,
  seedPOs,
  seedTransfers,
  seedWaste,
  statusOf,
  storages,
  suppliers,
  wasteReasons,
  type Category,
  type Count,
  type Item,
  type Loc,
  type Movement,
  type MoveType,
  type PO,
  type Status,
  type Storage,
  type Supplier,
  type Transfer,
  type Waste,
} from "@/components/showcase/inventory-data";
import { RevealText } from "@/components/reveal-text";

/* A working tool, not a landing page: the look follows the back-office
   software kitchens actually run on. Dense tables with right-aligned
   tabular figures, hairline borders, small radii, a light sidebar, one dark
   button style for the main action. Colour is kept for stock status only. */
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-inv-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-inv-mono" });

type Stock = Record<string, Record<Loc, number>>;

const initialStock: Stock = Object.fromEntries(items.map((i) => [i.code, { ...i.start }]));

/* A short history, so the ledger is not empty on arrival. Balances match the
   opening stock. */
const seedMoves: Movement[] = [
  { id: 13, t: -120, type: "pos", code: "SF-202", loc: "bgs", qty: -0.36, balance: 2.6, ref: "POS · 2 × Sotong Goreng Tepung" },
  { id: 12, t: -180, type: "pos", code: "MP-101", loc: "ss15", qty: -0.84, balance: 31.2, ref: "POS · 3 × Nasi Lemak Ayam Goreng" },
  { id: 11, t: -900, type: "pos", code: "MP-101", loc: "bgs", qty: -1.12, balance: 12.4, ref: "POS · 4 × Nasi Lemak Ayam Goreng" },
  { id: 10, t: -2 * 3600, type: "received", code: "DG-401", loc: "bgs", qty: 30, balance: 81, ref: "PO-10476 · Gudang Rempah Trading" },
  { id: 9, t: -26 * 3600, type: "waste", code: "PR-310", loc: "bgs", qty: -2.5, balance: 9, ref: "Waste · Past use-by date" },
  { id: 8, t: -2 * 86400, type: "adjust", code: "MP-120", loc: "ss15", qty: -6, balance: 214, ref: "Adjustment · Staff meal" },
  { id: 6, t: -1500, type: "production", code: "DG-410", loc: "ck", qty: -0.6, balance: 6.8, ref: "Production · Sambal tumis, 5 kg batch" },
  { id: 5, t: -3 * 3600, type: "waste", code: "PR-304", loc: "ss15", qty: -0.6, balance: 1.2, ref: "Waste · Spoiled" },
  { id: 4, t: -5 * 3600, type: "received", code: "SF-202", loc: "ck", qty: 10, balance: 18.5, ref: "PO-10471 · Lautan Biru Seafood" },
  { id: 3, t: -6 * 3600, type: "transfer", code: "MP-110", loc: "bgs", qty: 5, balance: 3.2, ref: "TR-3318 · from Central Kitchen" },
  { id: 2, t: -6 * 3600, type: "transfer", code: "MP-110", loc: "ck", qty: -5, balance: 64, ref: "TR-3318 · to Bangsar" },
  { id: 1, t: -2 * 86400, type: "count", code: "SF-201", loc: "ck", qty: -1.1, balance: 22, ref: "SC-0912 · Freezer" },
];

type View = "stock" | "count" | "ordering" | "transfers" | "waste" | "ledger";

const views: { id: View; label: string }[] = [
  { id: "stock", label: "Stock on hand" },
  { id: "count", label: "Stock counts" },
  { id: "ordering", label: "Ordering" },
  { id: "transfers", label: "Transfers" },
  { id: "waste", label: "Waste log" },
  { id: "ledger", label: "Stock ledger" },
];

/* Status is a word first; colour only backs it up. "Below par" is routine
   and stays grey; amber and red are for the two states that need action. */
const statusStyle: Record<Status, { label: string; cls: string }> = {
  ok: { label: "At par", cls: "text-zinc-400" },
  under: { label: "Below par", cls: "text-zinc-500" },
  low: { label: "Below min", cls: "px-1.5 bg-[#fdf1d6] text-[#8a4b00] ring-1 ring-inset ring-[#f1d699]" },
  out: { label: "Out", cls: "px-1.5 bg-[#fde7e4] text-[#a3150a] ring-1 ring-inset ring-[#f5bcb4]" },
};

const statusRank: Record<Status, number> = { ok: 0, under: 1, low: 2, out: 3 };

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

type Drawer = { type: "item"; code: string } | { type: "po"; id: string } | null;

type ActiveCount = { id: string; loc: Loc; storage: Storage; t: number; expected: Record<string, number>; counted: Record<string, string> };

type SortKey = "name" | "onhand" | "status" | "value";

/* Shared class strings. */
const btn = "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-[13px] font-medium whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40";
const btnPrimary = `${btn} bg-zinc-900 text-white hover:bg-zinc-700`;
const btnSecondary = `${btn} border border-zinc-300 bg-white text-zinc-800 shadow-[0_1px_0_rgb(0_0_0/0.03)] hover:bg-zinc-50`;
const input = "h-8 rounded-md border border-zinc-300 bg-white px-2.5 text-[13px] text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15";
const th = "h-9 whitespace-nowrap border-b border-zinc-200 bg-zinc-50 px-3 text-left text-[12px] font-medium text-zinc-500";
const td = "h-10 whitespace-nowrap border-b border-zinc-100 px-3 text-[13px]";
const num_ = "text-right tabular-nums";

export function InventoryShowcase() {
  const [view, setView] = useState<View>("stock");
  const [loc, setLocNow] = useState<Loc>("ck");
  const [stock, setStock] = useState<Stock>(initialStock);
  const [moves, setMoves] = useState<Movement[]>(seedMoves);
  const [pos, setPos] = useState<PO[]>(seedPOs);
  const [transfers, setTransfers] = useState<Transfer[]>(seedTransfers);
  const [waste, setWaste] = useState<Waste[]>(seedWaste);
  const [counts, setCounts] = useState<Count[]>(seedCounts);
  const [lastCount, setLastCount] = useState(seedLastCount);
  const [count, setCount] = useState<ActiveCount | null>(null);
  const [live, setLive] = useState(true);
  const [lastSync, setLastSync] = useState<{ text: string; loc: Loc; t: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [flash, setFlash] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ text: string; n: number } | null>(null);
  const [drawer, setDrawer] = useState<Drawer>(null);

  /* Every stock change goes through apply(), which keeps these in step, so
     the POS timer and the alerts always see the latest figures. */
  const stockRef = useRef(stock);
  const locRef = useRef(loc);
  const started = useRef<number | null>(null);
  const seq = useRef(100);
  const poSeq = useRef(10483);
  const trSeq = useRef(3319);
  const scSeq = useRef(913);

  const setLoc = (l: Loc) => {
    locRef.current = l;
    setLocNow(l);
    setDrawer(null);
  };

  const clock = useCallback(() => (started.current === null ? 0 : (performance.now() - started.current) / 1000), []);
  const say = useCallback((text: string) => setToast((t) => ({ text, n: (t?.n ?? 0) + 1 })), []);

  useEffect(() => {
    started.current = performance.now();
    const id = setInterval(() => setElapsed(clock()), 15000);
    return () => clearInterval(id);
  }, [clock]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const apply = useCallback(
    (changes: { code: string; loc: Loc; delta: number }[], type: MoveType, ref: string) => {
      const before = stockRef.current;
      const next: Stock = { ...before };
      const t = clock();
      const made: Movement[] = [];
      for (const c of changes) {
        const it = itemBy(c.code);
        const was = next[c.code][c.loc];
        const now = Math.max(0, round(was + c.delta, it.unit));
        if (now === was) continue;
        next[c.code] = { ...next[c.code], [c.loc]: now };
        made.push({ id: ++seq.current, t, type, code: c.code, loc: c.loc, qty: round(now - was, it.unit), balance: now, ref });
      }
      if (!made.length) return;
      stockRef.current = next;
      setStock(next);
      setElapsed(t);
      setMoves((ms) => [...made.reverse(), ...ms].slice(0, 300));
      setFlash((f) => {
        const n = { ...f };
        for (const m of made) n[`${m.code}:${m.loc}`] = (n[`${m.code}:${m.loc}`] ?? 0) + 1;
        return n;
      });

      /* Alert the moment an item at the location being viewed drops below
         its minimum or runs out. */
      for (const m of made) {
        if (m.loc !== locRef.current) continue;
        const it = itemBy(m.code);
        const a = statusOf(it, m.loc, before[m.code][m.loc]);
        const b = statusOf(it, m.loc, m.balance);
        if (statusRank[b] > statusRank[a] && statusRank[b] >= 2) {
          say(b === "out" ? `${it.name} is out of stock` : `${it.name} is below minimum: ${qty(m.balance, it.unit)} left`);
        }
      }
    },
    [clock, say],
  );

  /* POS sync. Every few seconds an outlet sells a dish, which depletes its
     ingredients by recipe, or the central kitchen runs a production batch.
     Paused while the tab is hidden or when the visitor stops it. */
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      const at = locations[Math.floor(Math.random() * locations.length)].id;
      if (at === "ck") {
        const b = batches[Math.floor(Math.random() * batches.length)];
        apply(b.uses.map(([code, q]) => ({ code, loc: at, delta: -q })), "production", `Production · ${b.name}`);
        setLastSync({ text: b.name, loc: at, t: clock() });
      } else {
        const dish = menu[Math.floor(Math.random() * menu.length)];
        const n = 1 + Math.floor(Math.random() * 4);
        apply(dish.uses.map(([code, q]) => ({ code, loc: at, delta: -q * n })), "pos", `POS · ${n} × ${dish.name}`);
        setLastSync({ text: `${n} × ${dish.name}`, loc: at, t: clock() });
      }
    }, 4500);
    return () => clearInterval(id);
  }, [live, apply, clock]);

  const onHand = (code: string, l: Loc = loc) => stock[code][l];
  const openPOs = pos.filter((p) => p.loc === loc && p.status !== "received");
  const poTotal = (p: PO) => p.lines.reduce((n, l) => n + (l.received ?? l.qty) * itemBy(l.code).cost, 0);
  const onOpenPO = (code: string) => openPOs.find((p) => p.lines.some((l) => l.code === code));
  const belowMin = items.filter((it) => statusRank[statusOf(it, loc, onHand(it.code))] >= 2);
  const value = items.reduce((n, it) => n + onHand(it.code) * it.cost, 0);
  const waste7 = waste.filter((w) => w.loc === loc && elapsed - w.t < 7 * 86400).reduce((n, w) => n + w.qty * itemBy(w.code).cost, 0);

  /* One quantity that briefly highlights when it changes. */
  function onHandCell(code: string, l: Loc = loc) {
    const it = itemBy(code);
    const n = flash[`${code}:${l}`] ?? 0;
    return (
      <span key={n} className={`-mx-1 rounded px-1 ${n ? "motion-safe:animate-[inv-flash_1.4s_ease-out]" : ""}`}>
        {num(stock[code][l], it.unit)} <span className="text-zinc-400">{it.unit}</span>
      </span>
    );
  }

  function statusBadge(s: Status) {
    const st = statusStyle[s];
    return <span className={`inline-flex h-5 items-center rounded text-[12px] font-medium ${st.cls}`}>{st.label}</span>;
  }

  function createPO(supplier: Supplier, lines: { code: string; qty: number }[]) {
    if (!lines.length) return;
    const id = `PO-${poSeq.current++}`;
    setPos((ps) => [{ id, supplier, loc, lines, status: "draft", t: clock() }, ...ps]);
    say(`${id} created as a draft for ${suppliers[supplier].name}`);
    return id;
  }

  function sendPO(id: string) {
    const p = pos.find((x) => x.id === id)!;
    setPos((ps) => ps.map((x) => (x.id === id ? { ...x, status: "sent" } : x)));
    say(`${id} sent to ${suppliers[p.supplier].name}`);
  }

  function receivePO(id: string, received: Record<string, number>) {
    const p = pos.find((x) => x.id === id)!;
    apply(
      p.lines.map((l) => ({ code: l.code, loc: p.loc, delta: received[l.code] ?? l.qty })),
      "received",
      `${id} · ${suppliers[p.supplier].name}`,
    );
    setPos((ps) => ps.map((x) => (x.id === id ? { ...x, status: "received", lines: x.lines.map((l) => ({ ...l, received: received[l.code] ?? l.qty })) } : x)));
    const short = p.lines.filter((l) => (received[l.code] ?? l.qty) < l.qty).length;
    say(short ? `${id} received with ${short} short ${short === 1 ? "line" : "lines"}` : `${id} received in full`);
  }

  function deletePO(id: string) {
    setPos((ps) => ps.filter((x) => x.id !== id));
    setDrawer(null);
    say(`${id} deleted`);
  }

  function startCount(storage: Storage) {
    const list = items.filter((it) => it.storage === storage);
    setCount({
      id: `SC-0${scSeq.current++}`,
      loc,
      storage,
      t: clock(),
      expected: Object.fromEntries(list.map((it) => [it.code, stockRef.current[it.code][loc]])),
      counted: {},
    });
    setView("count");
  }

  function submitCount(c: ActiveCount) {
    const entered = Object.entries(c.counted).filter(([, v]) => v.trim() !== "" && !Number.isNaN(Number(v)));
    /* Counted figures replace on-hand; the variance is measured against what
       the system expected when the count started. */
    apply(
      entered.map(([code, v]) => ({ code, loc: c.loc, delta: Number(v) - stockRef.current[code][c.loc] })),
      "count",
      `${c.id} · ${c.storage}`,
    );
    const variance = entered.reduce((n, [code, v]) => n + (Number(v) - c.expected[code]) * itemBy(code).cost, 0);
    setCounts((cs) => [{ id: c.id, loc: c.loc, storage: c.storage, t: clock(), items: entered.length, variance }, ...cs]);
    setLastCount((lc) => ({ ...lc, [c.loc]: { ...lc[c.loc], [c.storage]: clock() } }));
    setCount(null);
    say(`${c.id} submitted. Net variance ${rm(variance)}`);
  }

  const title = views.find((v) => v.id === view)!.label;
  const drawerItem = drawer?.type === "item" ? itemBy(drawer.code) : null;
  const drawerPO = drawer?.type === "po" ? pos.find((p) => p.id === drawer.id) : undefined;

  /* Escape closes the side panel. */
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer]);

  return (
    /* On large screens the app fills the viewport exactly: the sidebar is
       always whole, and only the content column scrolls. */
    <div
      className={`${sans.variable} ${mono.variable} min-h-screen bg-white font-[family-name:var(--font-inv-sans)] text-zinc-900 antialiased lg:flex lg:h-screen lg:flex-col lg:overflow-hidden`}
    >
      {/* Showcase frame: says plainly that this is a demo, and leads back. */}
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1.5 bg-navy px-4 py-2 text-[12.5px] text-white/80">
        <Link href="/" className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-amber-400">
          <PiArrowLeft aria-hidden className="h-3.5 w-3.5" /> Back to Zakrul
        </Link>
        <span className="hidden md:inline">Design showcase. A demo inventory system: the restaurant, stock and suppliers are invented.</span>
        <a href={wa(waMessages.inventory)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-amber-400 px-3 py-0.5 font-bold text-navy hover:bg-amber-300">
          Build a system like this
        </a>
      </div>

      <div className="flex w-full lg:min-h-0 lg:flex-1">
        {/* Sidebar */}
        <aside className="hidden w-[248px] flex-shrink-0 border-r border-zinc-200 bg-zinc-50/70 lg:block">
          <div className="flex h-full flex-col overflow-y-auto">
            <div className="flex items-center gap-2.5 border-b border-zinc-200 px-4 py-3.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#7c2d12] text-[12px] font-semibold text-[#fde7d4]">KM</span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[13.5px] font-semibold">Kayu Manis</p>
                <p className="truncate text-[12px] text-zinc-500">Restaurant group</p>
              </div>
            </div>
            <div className="px-3 pt-3">
              <LocationSelect loc={loc} onChange={setLoc} className="w-full" />
            </div>
            <nav aria-label="Inventory" className="mt-4 flex flex-col px-2">
              <p className="px-2 pb-1.5 text-[11.5px] font-medium text-zinc-400">Inventory</p>
              {views.map((v) => {
                const badge = v.id === "stock" ? belowMin.length : v.id === "ordering" ? openPOs.length : 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setView(v.id)}
                    aria-current={view === v.id ? "page" : undefined}
                    className={`flex h-8 items-center justify-between rounded-md px-2 text-left text-[13.5px] ${
                      view === v.id ? "bg-white font-medium text-zinc-900 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(0_0_0/0.05)]" : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
                    }`}
                  >
                    {v.label}
                    {v.id === "count" && count ? (
                      <span className="text-[11.5px] font-medium text-[#2563eb]">In progress</span>
                    ) : badge ? (
                      <span className="min-w-5 rounded px-1 text-center text-[11.5px] tabular-nums text-zinc-500">{badge}</span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
            <div className="mt-auto border-t border-zinc-200 p-3">
              <SyncPanel live={live} onToggle={() => setLive((v) => !v)} last={lastSync} elapsed={elapsed} />
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 lg:overflow-y-auto">
          {/* Phones and tablets: brand, location and the sections in one bar */}
          <div className="sticky top-0 z-30 border-b border-zinc-200 bg-white lg:hidden">
            <div className="flex items-center gap-2.5 px-4 py-2.5">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#7c2d12] text-[12px] font-semibold text-[#fde7d4]">KM</span>
              <LocationSelect loc={loc} onChange={setLoc} className="min-w-0 flex-1 sm:max-w-xs" />
              <button type="button" onClick={() => setLive((v) => !v)} aria-pressed={live} className={`${btnSecondary} px-2.5`} aria-label={live ? "Pause POS sync" : "Resume POS sync"}>
                <span className={`h-2 w-2 rounded-full ${live ? "bg-[#16a34a]" : "bg-zinc-400"}`} />
                {live ? <PiPause aria-hidden className="h-3.5 w-3.5" /> : <PiPlay aria-hidden className="h-3.5 w-3.5" />}
              </button>
            </div>
            <nav aria-label="Inventory" className="flex gap-1 overflow-x-auto px-3 [scrollbar-width:none]">
              {views.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  aria-current={view === v.id ? "page" : undefined}
                  className={`flex-shrink-0 whitespace-nowrap border-b-2 px-2.5 pb-2 pt-1 text-[13px] ${
                    view === v.id ? "border-zinc-900 font-medium text-zinc-900" : "border-transparent text-zinc-500"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Page header */}
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-200 px-4 pb-4 pt-5 md:px-6">
            <div>
              <p className="text-[12.5px] text-zinc-500">
                Inventory <span className="px-1 text-zinc-300">/</span> {locations.find((l) => l.id === loc)!.name}
              </p>
              <h1 className="mt-0.5 text-[20px] font-semibold tracking-[-0.01em]"><RevealText key={title} immediate>{title}</RevealText></h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {view === "stock" && (
                <>
                  <button type="button" onClick={() => setView("waste")} className={btnSecondary}>
                    Log waste
                  </button>
                  <button type="button" onClick={() => setView("count")} className={btnPrimary}>
                    {count ? "Continue count" : "Start stock count"}
                  </button>
                </>
              )}
              {view === "ordering" && (
                <span className="text-[12.5px] text-zinc-500">Suggested quantities fill each item back to par, in whole packs.</span>
              )}
            </div>
          </header>

          <main id="main" className="pb-16">
            {view === "stock" && (
              <StockView
                loc={loc}
                stock={stock}
                lastCount={lastCount}
                elapsed={elapsed}
                summary={[
                  { label: "Inventory value", value: <RollingAmount value={value} format={rm} />, note: "At last purchase cost" },
                  { label: "Below minimum", value: belowMin.length, note: `${belowMin.filter((it) => onHand(it.code) <= 0).length} out of stock`, alert: belowMin.length > 0 },
                  { label: "Open purchase orders", value: openPOs.length, note: rm(openPOs.reduce((n, p) => n + poTotal(p), 0)) },
                  { label: "Waste, last 7 days", value: rm(waste7), note: plural(waste.filter((w) => w.loc === loc && elapsed - w.t < 7 * 86400).length, "entry", "entries") },
                ]}
                onHandCell={onHandCell}
                statusBadge={statusBadge}
                onOpen={(code) => setDrawer({ type: "item", code })}
              />
            )}

            {view === "count" &&
              (count && count.loc === loc ? (
                <CountSheet
                  count={count}
                  stock={stock}
                  onChange={(code, v) => setCount((c) => (c ? { ...c, counted: { ...c.counted, [code]: v } } : c))}
                  onFill={() =>
                    setCount((c) =>
                      c ? { ...c, counted: Object.fromEntries(Object.keys(c.expected).map((code) => [code, c.counted[code]?.trim() ? c.counted[code] : String(c.expected[code])])) } : c,
                    )
                  }
                  onCancel={() => setCount(null)}
                  onSubmit={() => submitCount(count)}
                />
              ) : (
                <CountsHome
                  loc={loc}
                  counts={counts}
                  lastCount={lastCount}
                  elapsed={elapsed}
                  other={count && count.loc !== loc ? count : null}
                  onStart={startCount}
                  onResume={() => count && setLoc(count.loc)}
                />
              ))}

            {view === "ordering" && (
              <OrderingView
                loc={loc}
                stock={stock}
                pos={pos.filter((p) => p.loc === loc)}
                elapsed={elapsed}
                poTotal={poTotal}
                onOpenPO={onOpenPO}
                onCreate={(s, lines) => {
                  const id = createPO(s, lines);
                  if (id) setDrawer({ type: "po", id });
                }}
                onOpen={(id) => setDrawer({ type: "po", id })}
              />
            )}

            {view === "transfers" && (
              <TransfersView
                loc={loc}
                stock={stock}
                transfers={transfers.filter((t) => t.from === loc || t.to === loc)}
                elapsed={elapsed}
                onTransfer={(to, code, q) => {
                  const id = `TR-${trSeq.current++}`;
                  apply(
                    [
                      { code, loc, delta: -q },
                      { code, loc: to, delta: q },
                    ],
                    "transfer",
                    `${id} · ${locShort(loc)} to ${locShort(to)}`,
                  );
                  setTransfers((ts) => [{ id, from: loc, to, code, qty: q, t: clock() }, ...ts]);
                  say(`${id}: ${qty(q, itemBy(code).unit)} of ${itemBy(code).name.toLowerCase()} sent to ${locShort(to)}`);
                }}
              />
            )}

            {view === "waste" && (
              <WasteView
                loc={loc}
                stock={stock}
                waste={waste.filter((w) => w.loc === loc)}
                elapsed={elapsed}
                onLog={(code, q, reason) => {
                  apply([{ code, loc, delta: -q }], "waste", `Waste · ${reason}`);
                  setWaste((ws) => [{ id: ++seq.current, t: clock(), code, loc, qty: q, reason }, ...ws]);
                  say(`Logged ${qty(q, itemBy(code).unit)} of ${itemBy(code).name.toLowerCase()} as waste`);
                }}
              />
            )}

            {view === "ledger" && <LedgerView moves={moves.filter((m) => m.loc === loc)} elapsed={elapsed} />}
          </main>

          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 px-4 py-5 text-[12.5px] text-zinc-500 md:px-6">
            <span>Kayu Manis is not a real business. A demo designed and built by Zakrul.</span>
            <span className="lg:hidden">{live ? "POS sync is live" : "POS sync is paused"}</span>
          </footer>
        </div>
      </div>

      {/* Side panel */}
      <div className={`fixed inset-0 z-50 ${drawer ? "" : "pointer-events-none"}`} aria-hidden={!drawer}>
        <div onClick={() => setDrawer(null)} className={`absolute inset-0 bg-zinc-950/20 transition-opacity duration-200 ${drawer ? "opacity-100" : "opacity-0"}`} />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={drawerItem ? drawerItem.name : drawerPO ? drawerPO.id : "Details"}
          className={`absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col border-l border-zinc-200 bg-white shadow-[-12px_0_32px_-12px_rgb(0_0_0/0.18)] transition-[transform,visibility] duration-200 ease-out ${
            drawer ? "visible translate-x-0" : "invisible translate-x-full"
          }`}
        >
          {drawerItem && (
            <ItemPanel
              key={drawerItem.code}
              item={drawerItem}
              loc={loc}
              stock={stock}
              moves={moves.filter((m) => m.code === drawerItem.code && m.loc === loc).slice(0, 8)}
              elapsed={elapsed}
              onHandCell={onHandCell}
              statusBadge={statusBadge}
              onClose={() => setDrawer(null)}
              onAdjust={(to, reason) => {
                apply([{ code: drawerItem.code, loc, delta: to - stockRef.current[drawerItem.code][loc] }], "adjust", `Adjustment · ${reason}`);
                say(`${drawerItem.name} set to ${qty(to, drawerItem.unit)}`);
              }}
            />
          )}
          {drawerPO && (
            <POPanel
              key={drawerPO.id + drawerPO.status}
              po={drawerPO}
              elapsed={elapsed}
              total={poTotal(drawerPO)}
              onClose={() => setDrawer(null)}
              onSend={() => sendPO(drawerPO.id)}
              onDelete={() => deletePO(drawerPO.id)}
              onReceive={(r) => receivePO(drawerPO.id, r)}
            />
          )}
        </aside>
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-5 left-1/2 z-[60] max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-md bg-zinc-900 px-4 py-2.5 text-[13px] text-white shadow-lg transition duration-200 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {toast?.text}
      </div>
    </div>
  );
}

function LocationSelect({ loc, onChange, className = "" }: { loc: Loc; onChange: (l: Loc) => void; className?: string }) {
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">Location</span>
      <select
        value={loc}
        onChange={(e) => onChange(e.target.value as Loc)}
        className="h-8 w-full appearance-none rounded-md border border-zinc-300 bg-white pl-2.5 pr-8 text-[13px] font-medium outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15"
      >
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.short} · {l.kind}
          </option>
        ))}
      </select>
      <PiCaretDown aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
    </label>
  );
}

function SyncPanel({ live, onToggle, last, elapsed }: { live: boolean; onToggle: () => void; last: { text: string; loc: Loc; t: number } | null; elapsed: number }) {
  return (
    <div className="text-[12.5px]">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-medium text-zinc-700">
          <span className="relative flex h-2 w-2">
            {live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16a34a] opacity-50" />}
            <span className={`relative h-2 w-2 rounded-full ${live ? "bg-[#16a34a]" : "bg-zinc-400"}`} />
          </span>
          POS sync {live ? "on" : "paused"}
        </p>
        <button type="button" onClick={onToggle} className="rounded px-1.5 py-0.5 text-[12px] font-medium text-zinc-600 hover:bg-zinc-200/60">
          {live ? "Pause" : "Resume"}
        </button>
      </div>
      <p className="mt-1.5 leading-snug text-zinc-500">
        {last ? (
          <>
            {locShort(last.loc)}: {last.text}
            <span className="block text-zinc-400">{ago(Math.max(0, elapsed - last.t))}</span>
          </>
        ) : (
          "Sales and production deplete stock by recipe every few seconds."
        )}
      </p>
    </div>
  );
}

function SortHeader({ label, k, sort, onSort, right, className = "" }: { label: string; k: SortKey; sort: { key: SortKey; dir: 1 | -1 }; onSort: (k: SortKey) => void; right?: boolean; className?: string }) {
  const on = sort.key === k;
  const Icon = on ? (sort.dir === 1 ? PiCaretUp : PiCaretDown) : PiArrowsDownUp;
  return (
    <th scope="col" aria-sort={on ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={`${th} ${right ? "text-right" : ""} ${className}`}>
      <button type="button" onClick={() => onSort(k)} className={`inline-flex items-center gap-1 hover:text-zinc-900 ${on ? "text-zinc-900" : ""}`}>
        {label}
        <Icon aria-hidden className={`h-3 w-3 ${on ? "" : "text-zinc-300"}`} />
      </button>
    </th>
  );
}

function StockView({
  loc,
  stock,
  lastCount,
  elapsed,
  summary,
  onHandCell,
  statusBadge,
  onOpen,
}: {
  loc: Loc;
  stock: Stock;
  lastCount: Record<Loc, Record<Storage, number>>;
  elapsed: number;
  summary: { label: string; value: ReactNode; note: string; alert?: boolean }[];
  onHandCell: (code: string) => ReactNode;
  statusBadge: (s: Status) => ReactNode;
  onOpen: (code: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [storage, setStorage] = useState<"All" | Storage>("All");
  const [category, setCategory] = useState<"All" | Category>("All");
  const [belowOnly, setBelowOnly] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "status", dir: -1 });

  const rows = items
    .map((it) => {
      const q = stock[it.code][loc];
      return { it, q, status: statusOf(it, loc, q), value: q * it.cost };
    })
    .filter(({ it, status }) => {
      const s = query.trim().toLowerCase();
      if (s && !`${it.name} ${it.code}`.toLowerCase().includes(s)) return false;
      if (storage !== "All" && it.storage !== storage) return false;
      if (category !== "All" && it.category !== category) return false;
      if (belowOnly && statusRank[status] < 2) return false;
      return true;
    })
    .sort((a, b) => {
      const d =
        sort.key === "name"
          ? a.it.name.localeCompare(b.it.name)
          : sort.key === "onhand"
            ? a.q / a.it.par[loc] - b.q / b.it.par[loc]
            : sort.key === "value"
              ? a.value - b.value
              : statusRank[a.status] - statusRank[b.status] || b.q / b.it.par[loc] - a.q / a.it.par[loc];
      return d * sort.dir || a.it.name.localeCompare(b.it.name);
    });

  const onSort = (k: SortKey) => setSort((s) => (s.key === k ? { key: k, dir: (s.dir * -1) as 1 | -1 } : { key: k, dir: k === "name" ? 1 : -1 }));

  return (
    <>
      <dl className="grid grid-cols-2 border-b border-zinc-200 lg:grid-cols-4">
        {summary.map((s, i) => (
          <div key={s.label} className={`px-4 py-4 md:px-6 ${i % 2 ? "border-l border-zinc-200" : ""} ${i >= 2 ? "border-t border-zinc-200 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
            <dt className="text-[12.5px] text-zinc-500">{s.label}</dt>
            <dd className={`mt-1 text-[20px] font-semibold tabular-nums tracking-[-0.01em] ${s.alert ? "text-[#8a4b00]" : ""}`}>{s.value}</dd>
            <dd className="mt-0.5 text-[12px] text-zinc-500">{s.note}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-2 px-4 py-3 md:px-6">
        <label className="relative w-full sm:w-64">
          <span className="sr-only">Search items</span>
          <PiMagnifyingGlass aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search item or code" className={`${input} w-full pl-8`} />
        </label>
        <div role="group" aria-label="Storage area" className="inline-flex h-8 overflow-hidden rounded-md border border-zinc-300 text-[13px]">
          {(["All", ...storages] as const).map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStorage(s)}
              aria-pressed={storage === s}
              className={`px-3 ${i ? "border-l border-zinc-300" : ""} ${storage === s ? "bg-zinc-100 font-medium text-zinc-900" : "bg-white text-zinc-600 hover:bg-zinc-50"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <label className="relative">
          <span className="sr-only">Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className={`${input} appearance-none pr-8`}>
            <option value="All">All categories</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <PiCaretDown aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
        </label>
        <label className="inline-flex h-8 cursor-pointer items-center gap-2 px-1 text-[13px] text-zinc-700">
          <input type="checkbox" checked={belowOnly} onChange={(e) => setBelowOnly(e.target.checked)} className="h-3.5 w-3.5 accent-zinc-900" />
          Below minimum only
        </label>
        <span className="ml-auto text-[12.5px] tabular-nums text-zinc-500">
          {rows.length} of {items.length} items
        </span>
      </div>

      {/* Phones: one line per item with what a cook checks first. The full
          table, with every column, is on wider screens. */}
      <ul className="divide-y divide-zinc-100 border-t border-zinc-200 md:hidden">
        {rows.map(({ it, status }) => (
          <li key={it.code}>
            <button type="button" onClick={() => onOpen(it.code)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-zinc-50">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium">{it.name}</span>
                <span className="block text-[12px] text-zinc-500">
                  {it.storage} · par {qty(it.par[loc], it.unit)}
                </span>
              </span>
              <span className="flex flex-shrink-0 flex-col items-end gap-1 text-[13.5px] tabular-nums">
                <span className="font-medium">{onHandCell(it.code)}</span>
                {statusRank[status] >= 2 && statusBadge(status)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto border-t border-zinc-200 md:block">
        <table className="w-full min-w-[980px] border-separate border-spacing-0">
          <thead>
            <tr>
              <SortHeader label="Item" k="name" sort={sort} onSort={onSort} className="md:pl-6" />
              <th scope="col" className={th}>Category</th>
              <th scope="col" className={th}>Storage</th>
              <SortHeader label="On hand" k="onhand" sort={sort} onSort={onSort} right />
              <th scope="col" className={`${th} text-right`}>Par</th>
              <th scope="col" className={`${th} text-right`}>Min</th>
              <SortHeader label="Status" k="status" sort={sort} onSort={onSort} />
              <th scope="col" className={`${th} text-right`}>Unit cost</th>
              <SortHeader label="Value" k="value" sort={sort} onSort={onSort} right />
              <th scope="col" className={`${th} md:pr-6`}>Last counted</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ it, status, value }) => (
              <tr key={it.code} onClick={() => onOpen(it.code)} className="cursor-pointer hover:bg-zinc-50">
                <td className={`${td} md:pl-6`}>
                  <button type="button" onClick={() => onOpen(it.code)} className="text-left font-medium hover:underline">
                    {it.name}
                  </button>
                  <span className="ml-2 font-[family-name:var(--font-inv-mono)] text-[11.5px] text-zinc-400">{it.code}</span>
                </td>
                <td className={`${td} text-zinc-600`}>{it.category}</td>
                <td className={`${td} text-zinc-600`}>{it.storage}</td>
                <td className={`${td} ${num_} font-medium`}>{onHandCell(it.code)}</td>
                <td className={`${td} ${num_} text-zinc-600`}>{num(it.par[loc], it.unit)}</td>
                <td className={`${td} ${num_} text-zinc-600`}>{num(minOf(it, loc), it.unit)}</td>
                <td className={td}>{statusBadge(status)}</td>
                <td className={`${td} ${num_} text-zinc-600`}>
                  {rm(it.cost)}
                  <span className="text-zinc-400">/{it.unit}</span>
                </td>
                <td className={`${td} ${num_}`}>{rm(value)}</td>
                <td className={`${td} text-zinc-500 md:pr-6`}>{ago(elapsed - lastCount[loc][it.storage])}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-6 py-14 text-center text-[13px] text-zinc-500">No items match these filters.</p>}
      </div>
    </>
  );
}

function CountsHome({
  loc,
  counts,
  lastCount,
  elapsed,
  other,
  onStart,
  onResume,
}: {
  loc: Loc;
  counts: Count[];
  lastCount: Record<Loc, Record<Storage, number>>;
  elapsed: number;
  other: { loc: Loc; storage: Storage } | null;
  onStart: (s: Storage) => void;
  onResume: () => void;
}) {
  const here = counts.filter((c) => c.loc === loc);
  return (
    <div className="px-4 py-5 md:px-6">
      {other && (
        <p className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#bfd3fb] bg-[#f1f6ff] px-3.5 py-2.5 text-[13px] text-[#1e3a8a]">
          A count of the {other.storage.toLowerCase()} at {locShort(other.loc)} is still open.
          <button type="button" onClick={onResume} className="font-medium underline underline-offset-2">
            Go to {locShort(other.loc)}
          </button>
        </p>
      )}
      <h2 className="text-[14px] font-semibold">Count by storage area</h2>
      <p className="mt-0.5 text-[13px] text-zinc-500">Walk each area shelf by shelf. The sheet lists items in the order they are stored.</p>
      <div className="mt-3 overflow-x-auto rounded-md border border-zinc-200">
        <table className="w-full min-w-[560px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th scope="col" className={th}>Storage area</th>
              <th scope="col" className={`${th} text-right`}>Items</th>
              <th scope="col" className={`${th} md:pr-6`}>Last counted</th>
              <th scope="col" className={th}><span className="sr-only">Action</span></th>
            </tr>
          </thead>
          <tbody>
            {storages.map((s) => {
              const daysAgo = (elapsed - lastCount[loc][s]) / 86400;
              return (
                <tr key={s}>
                  <td className={`${td} font-medium`}>{s}</td>
                  <td className={`${td} ${num_}`}>{items.filter((it) => it.storage === s).length}</td>
                  <td className={`${td} ${daysAgo > 7 ? "text-[#8a4b00]" : "text-zinc-600"}`}>
                    {ago(elapsed - lastCount[loc][s])}
                    {daysAgo > 7 && <span className="ml-1.5 text-[12px]">· overdue, counted weekly</span>}
                  </td>
                  <td className={`${td} text-right`}>
                    <button type="button" disabled={!!other} onClick={() => onStart(s)} className={btnSecondary}>
                      Start count
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-[14px] font-semibold">Submitted counts</h2>
      <div className="mt-3 overflow-x-auto rounded-md border border-zinc-200">
        <table className="w-full min-w-[560px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th scope="col" className={th}>Count</th>
              <th scope="col" className={th}>Storage area</th>
              <th scope="col" className={`${th} text-right`}>Items counted</th>
              <th scope="col" className={`${th} text-right`}>Net variance</th>
              <th scope="col" className={th}>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {here.map((c) => (
              <tr key={c.id}>
                <td className={`${td} font-[family-name:var(--font-inv-mono)] text-[12.5px]`}>{c.id}</td>
                <td className={td}>{c.storage}</td>
                <td className={`${td} ${num_}`}>{c.items}</td>
                <td className={`${td} ${num_} ${c.variance < -0.005 ? "text-[#a3150a]" : ""}`}>{rm(c.variance)}</td>
                <td className={`${td} text-zinc-500`}>{ago(elapsed - c.t)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {here.length === 0 && <p className="px-6 py-10 text-center text-[13px] text-zinc-500">No counts submitted at this location yet.</p>}
      </div>
    </div>
  );
}

function CountSheet({
  count,
  stock,
  onChange,
  onFill,
  onCancel,
  onSubmit,
}: {
  count: ActiveCount;
  stock: Stock;
  onChange: (code: string, v: string) => void;
  onFill: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  const list = items.filter((it) => it.storage === count.storage);
  const parsed = (code: string) => {
    const v = count.counted[code];
    return v === undefined || v.trim() === "" || Number.isNaN(Number(v)) ? null : Number(v);
  };
  const done = list.filter((it) => parsed(it.code) !== null).length;
  const net = list.reduce((n, it) => {
    const c = parsed(it.code);
    return c === null ? n : n + (c - count.expected[it.code]) * it.cost;
  }, 0);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/70 px-4 py-3 md:px-6">
        <p className="text-[13px] text-zinc-600">
          <span className="font-medium text-zinc-900">
            {count.id} · {count.storage}
          </span>{" "}
          · Expected is the system figure when the count started. Usage logged since then is shown in the last column.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={onFill} className={btnSecondary}>
            Fill blanks with expected
          </button>
          <button type="button" onClick={onCancel} className={btnSecondary}>
            Discard
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th scope="col" className={`${th} md:pl-6`}>Item</th>
              <th scope="col" className={th}>Pack</th>
              <th scope="col" className={`${th} text-right`}>Expected</th>
              <th scope="col" className={`${th} w-44 text-right`}>Counted</th>
              <th scope="col" className={`${th} text-right`}>Variance</th>
              <th scope="col" className={`${th} text-right`}>Variance value</th>
              <th scope="col" className={`${th} text-right md:pr-6`}>Used since start</th>
            </tr>
          </thead>
          <tbody>
            {list.map((it) => {
              const c = parsed(it.code);
              const v = c === null ? null : round(c - count.expected[it.code], it.unit);
              const used = round(count.expected[it.code] - stock[it.code][count.loc], it.unit);
              return (
                <tr key={it.code}>
                  <td className={`${td} md:pl-6`}>
                    <span className="font-medium">{it.name}</span>
                    <span className="ml-2 font-[family-name:var(--font-inv-mono)] text-[11.5px] text-zinc-400">{it.code}</span>
                  </td>
                  <td className={`${td} text-zinc-500`}>{it.pack.label}</td>
                  <td className={`${td} ${num_} text-zinc-600`}>{qty(count.expected[it.code], it.unit)}</td>
                  <td className={`${td} text-right`}>
                    <label className="inline-flex items-center gap-1.5">
                      <span className="sr-only">Counted {it.name}</span>
                      <input
                        inputMode="decimal"
                        value={count.counted[it.code] ?? ""}
                        onChange={(e) => onChange(it.code, e.target.value.replace(/[^\d.]/g, ""))}
                        placeholder="—"
                        className={`${input} h-7 w-24 text-right tabular-nums`}
                      />
                      <span className="w-6 text-left text-[12px] text-zinc-400">{it.unit}</span>
                    </label>
                  </td>
                  <td className={`${td} ${num_} ${v !== null && v < 0 ? "text-[#a3150a]" : v ? "text-[#166534]" : "text-zinc-400"}`}>
                    {v === null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${num(Math.abs(v), it.unit)}`}
                  </td>
                  <td className={`${td} ${num_} ${v !== null && v < 0 ? "text-[#a3150a]" : "text-zinc-600"}`}>{v === null ? "—" : rm(v * it.cost)}</td>
                  <td className={`${td} ${num_} text-zinc-500 md:pr-6`}>{used > 0 ? qty(used, it.unit) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-white px-4 py-3 md:px-6">
        <p className="text-[13px] tabular-nums text-zinc-600">
          {done} of {list.length} counted · Net variance <span className={`font-semibold ${net < -0.005 ? "text-[#a3150a]" : "text-zinc-900"}`}>{rm(net)}</span>
        </p>
        <button type="button" disabled={!done} onClick={onSubmit} className={btnPrimary}>
          Submit count
        </button>
      </div>
    </>
  );
}

function OrderingView({
  loc,
  stock,
  pos,
  elapsed,
  poTotal,
  onOpenPO,
  onCreate,
  onOpen,
}: {
  loc: Loc;
  stock: Stock;
  pos: PO[];
  elapsed: number;
  poTotal: (p: PO) => number;
  onOpenPO: (code: string) => PO | undefined;
  onCreate: (s: Supplier, lines: { code: string; qty: number }[]) => void;
  onOpen: (id: string) => void;
}) {
  const [tab, setTab] = useState<"guide" | "orders">("guide");
  /* Packs to order, where the buyer has changed the suggestion. */
  const [packs, setPacks] = useState<Record<string, number>>({});

  const suggested = (it: Item) => Math.max(0, Math.ceil(round(it.par[loc] - stock[it.code][loc], it.unit) / it.pack.size));
  const bySupplier = (Object.keys(suppliers) as Supplier[])
    .map((s) => ({ s, rows: items.filter((it) => it.supplier === s && stock[it.code][loc] < it.par[loc]) }))
    .filter((g) => g.rows.length);

  return (
    <>
      <div className="flex gap-5 border-b border-zinc-200 px-4 md:px-6">
        {(
          [
            ["guide", "Order guide"],
            ["orders", `Purchase orders (${pos.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={`-mb-px border-b-2 py-2.5 text-[13.5px] ${tab === id ? "border-zinc-900 font-medium text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "guide" ? (
        bySupplier.length === 0 ? (
          <p className="px-6 py-14 text-center text-[13px] text-zinc-500">Everything at this location is at or above par.</p>
        ) : (
          <div className="space-y-6 px-4 py-5 md:px-6">
            {bySupplier.map(({ s, rows }) => {
              const lines = rows
                .filter((it) => !onOpenPO(it.code))
                .map((it) => ({ it, n: packs[`${loc}:${it.code}`] ?? suggested(it) }))
                .filter((l) => l.n > 0);
              const total = lines.reduce((n, l) => n + l.n * l.it.pack.size * l.it.cost, 0);
              return (
                <section key={s} className="overflow-hidden rounded-md border border-zinc-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50/70 px-3 py-2.5">
                    <div>
                      <h2 className="text-[13.5px] font-semibold">{suppliers[s].name}</h2>
                      <p className="text-[12px] text-zinc-500">Delivers {suppliers[s].delivery}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] tabular-nums text-zinc-600">{rm(total)}</span>
                      <button
                        type="button"
                        disabled={!lines.length}
                        onClick={() => onCreate(s, lines.map((l) => ({ code: l.it.code, qty: l.n * l.it.pack.size })))}
                        className={btnPrimary}
                      >
                        Create purchase order
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-separate border-spacing-0">
                      <thead>
                        <tr>
                          <th scope="col" className={`${th} bg-white`}>Item</th>
                          <th scope="col" className={`${th} bg-white text-right`}>On hand</th>
                          <th scope="col" className={`${th} bg-white text-right`}>Par</th>
                          <th scope="col" className={`${th} bg-white`}>Pack</th>
                          <th scope="col" className={`${th} w-40 bg-white text-right`}>Order</th>
                          <th scope="col" className={`${th} bg-white text-right`}>Line total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((it) => {
                          const open = onOpenPO(it.code);
                          const n = packs[`${loc}:${it.code}`] ?? suggested(it);
                          return (
                            <tr key={it.code} className={open ? "text-zinc-400" : ""}>
                              <td className={`${td} font-medium`}>{it.name}</td>
                              <td className={`${td} ${num_}`}>{qty(stock[it.code][loc], it.unit)}</td>
                              <td className={`${td} ${num_}`}>{qty(it.par[loc], it.unit)}</td>
                              <td className={`${td} text-zinc-500`}>{it.pack.label}</td>
                              <td className={`${td} text-right`}>
                                {open ? (
                                  <button type="button" onClick={() => onOpen(open.id)} className="text-[12.5px] text-zinc-500 underline underline-offset-2">
                                    On {open.id}
                                  </button>
                                ) : (
                                  <label className="inline-flex items-center gap-1.5">
                                    <span className="sr-only">Packs of {it.name}</span>
                                    <input
                                      type="number"
                                      min={0}
                                      inputMode="numeric"
                                      value={n}
                                      onChange={(e) => setPacks((p) => ({ ...p, [`${loc}:${it.code}`]: Math.max(0, Math.trunc(Number(e.target.value) || 0)) }))}
                                      className={`${input} h-7 w-16 text-right tabular-nums`}
                                    />
                                    <span className="w-14 text-left text-[12px] text-zinc-500">× {it.pack.size} {it.unit}</span>
                                  </label>
                                )}
                              </td>
                              <td className={`${td} ${num_}`}>{open ? "—" : rm(n * it.pack.size * it.cost)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        )
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0">
            <thead>
              <tr>
                <th scope="col" className={`${th} md:pl-6`}>Order</th>
                <th scope="col" className={th}>Supplier</th>
                <th scope="col" className={`${th} text-right`}>Lines</th>
                <th scope="col" className={th}>Status</th>
                <th scope="col" className={th}>Created</th>
                <th scope="col" className={`${th} text-right md:pr-6`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {pos.map((p) => (
                <tr key={p.id} onClick={() => onOpen(p.id)} className="cursor-pointer hover:bg-zinc-50">
                  <td className={`${td} md:pl-6`}>
                    <button type="button" onClick={() => onOpen(p.id)} className="font-[family-name:var(--font-inv-mono)] text-[12.5px] hover:underline">
                      {p.id}
                    </button>
                  </td>
                  <td className={td}>{suppliers[p.supplier].name}</td>
                  <td className={`${td} ${num_}`}>{p.lines.length}</td>
                  <td className={td}>
                    <POStatus status={p.status} />
                  </td>
                  <td className={`${td} text-zinc-500`}>{ago(elapsed - p.t)}</td>
                  <td className={`${td} ${num_} md:pr-6`}>{rm(poTotal(p))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {pos.length === 0 && <p className="px-6 py-14 text-center text-[13px] text-zinc-500">No purchase orders for this location.</p>}
        </div>
      )}
    </>
  );
}

function POStatus({ status }: { status: PO["status"] }) {
  const map = {
    draft: ["Draft", "bg-zinc-100 text-zinc-600"],
    sent: ["Sent", "bg-[#e8f0fe] text-[#1d4ed8]"],
    received: ["Received", "bg-[#e7f6ec] text-[#166534]"],
  } as const;
  const [label, cls] = map[status];
  return <span className={`inline-flex h-5 items-center rounded px-1.5 text-[12px] font-medium ${cls}`}>{label}</span>;
}

function TransfersView({
  loc,
  stock,
  transfers,
  elapsed,
  onTransfer,
}: {
  loc: Loc;
  stock: Stock;
  transfers: Transfer[];
  elapsed: number;
  onTransfer: (to: Loc, code: string, qty: number) => void;
}) {
  const others = locations.filter((l) => l.id !== loc);
  const [to, setTo] = useState<Loc>(others[0].id);
  const [code, setCode] = useState(items[0].code);
  const [amount, setAmount] = useState("");
  const it = itemBy(code);
  const n = Number(amount);
  const target = others.some((l) => l.id === to) ? to : others[0].id;
  const ok = amount.trim() !== "" && n > 0 && n <= stock[code][loc];

  return (
    <div className="px-4 py-5 md:px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!ok) return;
          onTransfer(target, code, round(n, it.unit));
          setAmount("");
        }}
        className="flex flex-wrap items-end gap-3 rounded-md border border-zinc-200 p-3.5"
      >
        <Field label="From">
          <p className="flex h-8 items-center text-[13px] font-medium">{locShort(loc)}</p>
        </Field>
        <Field label="To" htmlFor="tr-to">
          <select id="tr-to" value={target} onChange={(e) => setTo(e.target.value as Loc)} className={`${input} w-44`}>
            {others.map((l) => (
              <option key={l.id} value={l.id}>
                {l.short}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Item" htmlFor="tr-item">
          <ItemSelect id="tr-item" value={code} onChange={setCode} />
        </Field>
        <Field label={`Quantity (${it.unit})`} htmlFor="tr-qty">
          <input id="tr-qty" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} className={`${input} w-28 text-right tabular-nums`} />
        </Field>
        <button type="submit" disabled={!ok} className={btnPrimary}>
          Transfer
        </button>
        <p className={`basis-full text-[12.5px] ${amount && !ok ? "text-[#a3150a]" : "text-zinc-500"}`}>
          {locShort(loc)} has {qty(stock[code][loc], it.unit)} of {it.name.toLowerCase()}
          {amount && n > stock[code][loc] ? ". That is more than is on hand." : "."}
        </p>
      </form>

      <div className="mt-5 overflow-x-auto rounded-md border border-zinc-200">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th scope="col" className={th}>Transfer</th>
              <th scope="col" className={th}>Item</th>
              <th scope="col" className={th}>Direction</th>
              <th scope="col" className={`${th} text-right`}>Quantity</th>
              <th scope="col" className={th}>When</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={t.id}>
                <td className={`${td} font-[family-name:var(--font-inv-mono)] text-[12.5px]`}>{t.id}</td>
                <td className={td}>{itemBy(t.code).name}</td>
                <td className={`${td} text-zinc-600`}>{t.from === loc ? `Out to ${locShort(t.to)}` : `In from ${locShort(t.from)}`}</td>
                <td className={`${td} ${num_}`}>{qty(t.qty, itemBy(t.code).unit)}</td>
                <td className={`${td} text-zinc-500`}>{ago(elapsed - t.t)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {transfers.length === 0 && <p className="px-6 py-10 text-center text-[13px] text-zinc-500">No transfers in or out of this location yet.</p>}
      </div>
    </div>
  );
}

function WasteView({
  loc,
  stock,
  waste,
  elapsed,
  onLog,
}: {
  loc: Loc;
  stock: Stock;
  waste: Waste[];
  elapsed: number;
  onLog: (code: string, qty: number, reason: string) => void;
}) {
  const [code, setCode] = useState(items[0].code);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState(wasteReasons[0]);
  const it = itemBy(code);
  const n = Number(amount);
  const ok = amount.trim() !== "" && n > 0 && n <= stock[code][loc];

  return (
    <div className="px-4 py-5 md:px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!ok) return;
          onLog(code, round(n, it.unit), reason);
          setAmount("");
        }}
        className="flex flex-wrap items-end gap-3 rounded-md border border-zinc-200 p-3.5"
      >
        <Field label="Item" htmlFor="ws-item">
          <ItemSelect id="ws-item" value={code} onChange={setCode} />
        </Field>
        <Field label={`Quantity (${it.unit})`} htmlFor="ws-qty">
          <input id="ws-qty" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} className={`${input} w-28 text-right tabular-nums`} />
        </Field>
        <Field label="Reason" htmlFor="ws-reason">
          <select id="ws-reason" value={reason} onChange={(e) => setReason(e.target.value)} className={`${input} w-52`}>
            {wasteReasons.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <button type="submit" disabled={!ok} className={btnPrimary}>
          Log waste
        </button>
        <p className="basis-full text-[12.5px] text-zinc-500">
          {ok ? `Writes off ${rm(n * it.cost)} at ${rm(it.cost)} per ${it.unit}.` : `${qty(stock[code][loc], it.unit)} on hand.`}
        </p>
      </form>

      <div className="mt-5 overflow-x-auto rounded-md border border-zinc-200">
        <table className="w-full min-w-[640px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th scope="col" className={th}>When</th>
              <th scope="col" className={th}>Item</th>
              <th scope="col" className={`${th} text-right`}>Quantity</th>
              <th scope="col" className={th}>Reason</th>
              <th scope="col" className={`${th} text-right`}>Value</th>
            </tr>
          </thead>
          <tbody>
            {waste.map((w) => {
              const wi = itemBy(w.code);
              return (
                <tr key={w.id}>
                  <td className={`${td} text-zinc-500`}>{ago(elapsed - w.t)}</td>
                  <td className={td}>{wi.name}</td>
                  <td className={`${td} ${num_}`}>{qty(w.qty, wi.unit)}</td>
                  <td className={`${td} text-zinc-600`}>{w.reason}</td>
                  <td className={`${td} ${num_}`}>{rm(w.qty * wi.cost)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {waste.length === 0 && <p className="px-6 py-10 text-center text-[13px] text-zinc-500">No waste logged at this location.</p>}
      </div>
    </div>
  );
}

function LedgerView({ moves, elapsed }: { moves: Movement[]; elapsed: number }) {
  const [type, setType] = useState<"all" | MoveType>("all");
  const [query, setQuery] = useState("");
  const shown = moves.filter((m) => (type === "all" || m.type === type) && (!query.trim() || itemBy(m.code).name.toLowerCase().includes(query.trim().toLowerCase())));

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 md:px-6">
        <label className="relative w-full sm:w-64">
          <span className="sr-only">Search items</span>
          <PiMagnifyingGlass aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter by item" className={`${input} w-full pl-8`} />
        </label>
        <label className="relative">
          <span className="sr-only">Movement type</span>
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={`${input} appearance-none pr-8`}>
            <option value="all">All movements</option>
            {(Object.keys(moveTypes) as MoveType[]).map((k) => (
              <option key={k} value={k}>
                {moveTypes[k]}
              </option>
            ))}
          </select>
          <PiCaretDown aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
        </label>
        <span className="ml-auto text-[12.5px] tabular-nums text-zinc-500">{plural(shown.length, "movement", "movements")}</span>
      </div>
      <div className="overflow-x-auto border-t border-zinc-200">
        <table className="w-full min-w-[860px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th scope="col" className={`${th} md:pl-6`}>When</th>
              <th scope="col" className={th}>Type</th>
              <th scope="col" className={th}>Item</th>
              <th scope="col" className={`${th} text-right`}>Change</th>
              <th scope="col" className={`${th} text-right`}>Balance</th>
              <th scope="col" className={`${th} md:pr-6`}>Reference</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((m) => {
              const it = itemBy(m.code);
              return (
                <tr key={m.id}>
                  <td className={`${td} text-zinc-500 md:pl-6`}>{ago(Math.max(0, elapsed - m.t))}</td>
                  <td className={`${td} text-zinc-600`}>{moveTypes[m.type]}</td>
                  <td className={`${td} font-medium`}>{it.name}</td>
                  <td className={`${td} ${num_} ${m.qty < 0 ? "text-zinc-900" : "text-[#166534]"}`}>
                    {m.qty > 0 ? "+" : "−"}
                    {num(Math.abs(m.qty), it.unit)} <span className="text-zinc-400">{it.unit}</span>
                  </td>
                  <td className={`${td} ${num_} text-zinc-600`}>{qty(m.balance, it.unit)}</td>
                  <td className={`${td} max-w-[360px] truncate text-zinc-500 md:pr-6`}>{m.ref}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {shown.length === 0 && <p className="px-6 py-14 text-center text-[13px] text-zinc-500">No movements match.</p>}
      </div>
    </>
  );
}

function ItemPanel({
  item,
  loc,
  stock,
  moves,
  elapsed,
  onHandCell,
  statusBadge,
  onClose,
  onAdjust,
}: {
  item: Item;
  loc: Loc;
  stock: Stock;
  moves: Movement[];
  elapsed: number;
  onHandCell: (code: string, l?: Loc) => ReactNode;
  statusBadge: (s: Status) => ReactNode;
  onClose: () => void;
  onAdjust: (to: number, reason: string) => void;
}) {
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("Correction");
  const n = Number(to);
  const ok = to.trim() !== "" && n >= 0 && !Number.isNaN(n);

  return (
    <>
      <PanelHeader title={item.name} sub={`${item.code} · ${item.category} · ${item.storage}`} onClose={onClose} />
      <div className="flex-1 overflow-y-auto">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-zinc-200 px-5 py-4 text-[13px]">
          <div>
            <dt className="text-zinc-500">Supplier</dt>
            <dd className="mt-0.5">{suppliers[item.supplier].name}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Purchased as</dt>
            <dd className="mt-0.5">{item.pack.label}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Unit cost</dt>
            <dd className="mt-0.5 tabular-nums">
              {rm(item.cost)} per {item.unit}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Delivery</dt>
            <dd className="mt-0.5">{suppliers[item.supplier].delivery}</dd>
          </div>
        </dl>

        <h3 className="px-5 pb-2 pt-4 text-[12.5px] font-medium text-zinc-500">Stock by location</h3>
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th scope="col" className={`${th} pl-5`}>Location</th>
              <th scope="col" className={`${th} text-right`}>On hand</th>
              <th scope="col" className={`${th} text-right`}>Par</th>
              <th scope="col" className={`${th} pr-5`}>Status</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((l) => (
              <tr key={l.id} className={l.id === loc ? "bg-zinc-50" : ""}>
                <td className={`${td} pl-5 ${l.id === loc ? "font-medium" : ""}`}>{l.short}</td>
                <td className={`${td} ${num_}`}>{onHandCell(item.code, l.id)}</td>
                <td className={`${td} ${num_} text-zinc-600`}>{num(item.par[l.id], item.unit)}</td>
                <td className={`${td} pr-5`}>{statusBadge(statusOf(item, l.id, stock[item.code][l.id]))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!ok) return;
            onAdjust(round(n, item.unit), reason);
            setTo("");
          }}
          className="border-b border-zinc-200 px-5 py-4"
        >
          <h3 className="text-[12.5px] font-medium text-zinc-500">Adjust on hand at {locShort(loc)}</h3>
          <div className="mt-2 flex flex-wrap items-end gap-2">
            <Field label={`New quantity (${item.unit})`} htmlFor="adj-to">
              <input id="adj-to" inputMode="decimal" value={to} onChange={(e) => setTo(e.target.value.replace(/[^\d.]/g, ""))} placeholder={num(stock[item.code][loc], item.unit)} className={`${input} w-28 text-right tabular-nums`} />
            </Field>
            <Field label="Reason" htmlFor="adj-reason">
              <select id="adj-reason" value={reason} onChange={(e) => setReason(e.target.value)} className={`${input} w-40`}>
                {["Correction", "Found stock", "Staff meal", "Sample or tasting"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <button type="submit" disabled={!ok} className={btnSecondary}>
              Save
            </button>
          </div>
        </form>

        <h3 className="px-5 pb-1 pt-4 text-[12.5px] font-medium text-zinc-500">Recent movements at {locShort(loc)}</h3>
        {moves.length === 0 ? (
          <p className="px-5 py-4 text-[13px] text-zinc-500">Nothing recorded since the page opened.</p>
        ) : (
          <ul className="px-5 pb-5">
            {moves.map((m) => (
              <li key={m.id} className="flex items-baseline justify-between gap-3 border-b border-zinc-100 py-2.5 text-[13px] last:border-0">
                <span className="min-w-0">
                  <span className="block truncate">{m.ref}</span>
                  <span className="text-[12px] text-zinc-500">{ago(Math.max(0, elapsed - m.t))}</span>
                </span>
                <span className={`flex-shrink-0 tabular-nums ${m.qty > 0 ? "text-[#166534]" : ""}`}>
                  {m.qty > 0 ? "+" : "−"}
                  {qty(Math.abs(m.qty), item.unit)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

function POPanel({
  po,
  elapsed,
  total,
  onClose,
  onSend,
  onDelete,
  onReceive,
}: {
  po: PO;
  elapsed: number;
  total: number;
  onClose: () => void;
  onSend: () => void;
  onDelete: () => void;
  onReceive: (received: Record<string, number>) => void;
}) {
  const [receiving, setReceiving] = useState(false);
  const [got, setGot] = useState<Record<string, string>>(() => Object.fromEntries(po.lines.map((l) => [l.code, String(l.qty)])));

  return (
    <>
      <PanelHeader title={po.id} sub={`${suppliers[po.supplier].name} · ${locShort(po.loc)} · created ${ago(elapsed - po.t).toLowerCase()}`} onClose={onClose} />
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
          <POStatus status={po.status} />
          <span className="text-[12.5px] text-zinc-500">Delivers {suppliers[po.supplier].delivery}</span>
        </div>
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th scope="col" className={`${th} pl-5`}>Item</th>
              <th scope="col" className={`${th} text-right`}>Ordered</th>
              {(receiving || po.status === "received") && <th scope="col" className={`${th} text-right`}>Received</th>}
              <th scope="col" className={`${th} pr-5 text-right`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {po.lines.map((l) => {
              const it = itemBy(l.code);
              const short = l.received !== undefined && l.received < l.qty;
              return (
                <tr key={l.code}>
                  <td className={`${td} pl-5`}>
                    {it.name}
                    <span className="block text-[12px] text-zinc-500">{it.pack.label}</span>
                  </td>
                  <td className={`${td} ${num_}`}>{qty(l.qty, it.unit)}</td>
                  {receiving && (
                    <td className={`${td} text-right`}>
                      <label>
                        <span className="sr-only">Received {it.name}</span>
                        <input
                          inputMode="decimal"
                          value={got[l.code] ?? ""}
                          onChange={(e) => setGot((g) => ({ ...g, [l.code]: e.target.value.replace(/[^\d.]/g, "") }))}
                          className={`${input} h-7 w-20 text-right tabular-nums`}
                        />
                      </label>
                    </td>
                  )}
                  {po.status === "received" && (
                    <td className={`${td} ${num_} ${short ? "text-[#a3150a]" : ""}`}>
                      {qty(l.received ?? l.qty, it.unit)}
                      {short && <span className="block text-[12px]">Short</span>}
                    </td>
                  )}
                  <td className={`${td} ${num_} pr-5`}>{rm((l.received ?? l.qty) * it.cost)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={receiving || po.status === "received" ? 3 : 2} className="px-5 py-3 text-right text-[13px] text-zinc-500">
                Total
              </td>
              <td className="py-3 pr-5 text-right text-[14px] font-semibold tabular-nums">{rm(total)}</td>
            </tr>
          </tfoot>
        </table>
        {receiving && <p className="px-5 text-[12.5px] text-zinc-500">Enter what actually arrived. Short lines are recorded against the supplier.</p>}
      </div>
      {po.status !== "received" && (
        <div className="flex justify-end gap-2 border-t border-zinc-200 px-5 py-3">
          {po.status === "draft" ? (
            <>
              <button type="button" onClick={onDelete} className={`${btnSecondary} hover:text-[#a3150a]`}>
                Delete draft
              </button>
              <button type="button" onClick={onSend} className={btnPrimary}>
                Send to supplier
              </button>
            </>
          ) : receiving ? (
            <>
              <button type="button" onClick={() => setReceiving(false)} className={btnSecondary}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onReceive(Object.fromEntries(po.lines.map((l) => [l.code, Math.max(0, Number(got[l.code]) || 0)])))}
                className={btnPrimary}
              >
                Confirm receipt
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setReceiving(true)} className={btnPrimary}>
              Receive delivery
            </button>
          )}
        </div>
      )}
    </>
  );
}

function PanelHeader({ title, sub, onClose }: { title: string; sub: string; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4">
      <div className="min-w-0">
        <h2 className="truncate text-[16px] font-semibold">{title}</h2>
        <p className="mt-0.5 text-[12.5px] text-zinc-500">{sub}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Close" className="-mr-1.5 rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900">
        <PiX className="h-4 w-4" />
      </button>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div>
      {htmlFor ? (
        <label htmlFor={htmlFor} className="mb-1 block text-[12px] font-medium text-zinc-600">
          {label}
        </label>
      ) : (
        <p className="mb-1 text-[12px] font-medium text-zinc-600">{label}</p>
      )}
      {children}
    </div>
  );
}

function ItemSelect({ id, value, onChange }: { id: string; value: string; onChange: (code: string) => void }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${input} w-56`}>
      {categories.map((c) => (
        <optgroup key={c} label={c}>
          {items
            .filter((it) => it.category === c)
            .map((it) => (
              <option key={it.code} value={it.code}>
                {it.name}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}
