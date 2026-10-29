"use client";

import { useEffect, useState } from "react";
import { TbLock, TbTrophy, TbUser } from "react-icons/tb";
import { GAME_ORDER, gameCopy, gameIcons } from "@/components/mini-games";
import { BY_GAME, type Ach } from "@/lib/achievements-data";
import { ACH_CHANGED, currentStore, fill, overall, progressOf, scanBests, type Store } from "@/lib/achievements";

const copy = {
  en: {
    title: "Achievements",
    player: "Player",
    earned: (a: number, b: number) => `${a} of ${b} earned`,
    secret: "Secret achievement",
    secretHint: "Keep playing to find out.",
    on: (d: string) => `Earned ${d}`,
    sortHint: "Earned first",
  },
  ms: {
    title: "Pencapaian",
    player: "Pemain",
    earned: (a: number, b: number) => `${a} daripada ${b} diperoleh`,
    secret: "Pencapaian rahsia",
    secretHint: "Teruskan bermain untuk mengetahuinya.",
    on: (d: string) => `Diperoleh ${d}`,
    sortHint: "Yang diperoleh dahulu",
  },
};

/* Every achievement, the player's and each game's. What was earned is lit; secret ones stay
   hidden until they are. */
export function AchievementsView({ lang }: { lang: "en" | "ms" }) {
  const t = copy[lang];
  const names = gameCopy[lang].names;
  const [store, setStore] = useState<Store>(() => currentStore());
  const [tab, setTab] = useState<string>("player");

  useEffect(() => {
    /* Scores from before achievements existed count the first time this is opened. */
    scanBests();
    const refresh = () => setStore({ ...currentStore() });
    refresh();
    window.addEventListener(ACH_CHANGED, refresh);
    return () => window.removeEventListener(ACH_CHANGED, refresh);
  }, []);

  const all = overall(store);
  const list = (BY_GAME[tab] ?? []).slice().sort((a, b) => Number(Boolean(store.unlocked[b.id])) - Number(Boolean(store.unlocked[a.id])));
  const gameName = tab === "player" ? "" : names[tab as keyof typeof names];
  const date = (ms: number) => new Date(ms).toLocaleDateString(lang === "ms" ? "ms-MY" : "en-MY", { day: "numeric", month: "short", year: "numeric" });

  const chip = (active: boolean) =>
    `flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
      active ? "bg-amber-400 text-navy" : "bg-white/10 text-white hover:bg-white/20"
    }`;

  const card = (a: Ach) => {
    const done = store.unlocked[a.id];
    const hidden = a.secret && !done;
    return (
      <li key={a.id} className={`flex flex-col items-start gap-2 rounded-2xl p-3 ring-1 ${done ? "bg-amber-400/10 ring-amber-400/40" : "bg-white/5 ring-white/10"}`}>
        <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${done ? "bg-amber-400 text-navy" : "bg-white/10 text-slate-400"}`}>
          {hidden ? <TbLock className="h-5 w-5" /> : <TbTrophy className="h-5 w-5" />}
        </span>
        <span className="min-w-0 max-w-full flex-1 break-words">
          <span className={`block font-display text-[14.5px] font-extrabold leading-tight ${done ? "text-white" : "text-slate-200"}`}>
            {hidden ? t.secret : fill(a.name[lang === "ms" ? 1 : 0], gameName)}
          </span>
          <span className="mt-0.5 block text-[12.5px] leading-snug text-slate-300">{hidden ? t.secretHint : fill(a.desc[lang === "ms" ? 1 : 0], gameName)}</span>
          {done && <span className="mt-1 block text-[11.5px] font-bold text-amber-400">{t.on(date(done))}</span>}
        </span>
      </li>
    );
  };

  return (
    <section aria-label={t.title} className="rise-in mx-auto flex w-full max-w-5xl flex-col gap-5">
      <div className="flex flex-col gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="font-display text-[22px] font-extrabold tracking-tight">{t.title}</h3>
          <p className="text-[13px] font-bold text-slate-300">{t.earned(all.done, all.total)}</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={all.total} aria-valuenow={all.done}>
          <div className="h-full rounded-full bg-amber-400 transition-[width] duration-500" style={{ width: `${all.total ? (all.done / all.total) * 100 : 0}%` }} />
        </div>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label={t.title}>
        <button type="button" role="tab" aria-selected={tab === "player"} className={chip(tab === "player")} onClick={() => setTab("player")}>
          <TbUser aria-hidden="true" className="h-4 w-4" />
          {t.player}
          <span className="text-[11.5px] opacity-70">{progressOf(store, "player").done}/{progressOf(store, "player").total}</span>
        </button>
        {GAME_ORDER.map((id) => {
          const Icon = gameIcons[id];
          const p = progressOf(store, id);
          return (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className={chip(tab === id)} onClick={() => setTab(id)}>
              <Icon aria-hidden="true" className="h-4 w-4" />
              {names[id]}
              <span className="text-[11.5px] opacity-70">{p.done}/{p.total}</span>
            </button>
          );
        })}
      </div>

      <ul className="grid grid-cols-1 gap-2.5 min-[400px]:grid-cols-2 xl:grid-cols-4">{list.map(card)}</ul>
    </section>
  );
}
