"use client";

import { useEffect, useRef, useState } from "react";
import { TbTrophy } from "react-icons/tb";
import { gameCopy } from "@/components/mini-games";
import { ACHIEVEMENTS, type Ach } from "@/lib/achievements-data";
import { ACH_EVENT, fill } from "@/lib/achievements";

const copy = {
  en: { title: "Achievement unlocked", many: (n: number) => `${n} more achievements unlocked`, hint: "See them in zakrulOS" },
  ms: { title: "Pencapaian dibuka", many: (n: number) => `${n} lagi pencapaian dibuka`, hint: "Lihat dalam zakrulOS" },
};
const BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
const SHOW_MS = 4200;
const MAX_QUEUE = 3;

type Toast = { key: number; ach: Ach } | { key: number; more: number };

/* A small card that slides in when an achievement is earned, one at a time. A burst of them (the
   scores that were already on this browser, counted for the first time) is gathered into one. */
export default function AchievementToasts({ lang }: { lang: "en" | "ms" }) {
  const t = copy[lang];
  const names = gameCopy[lang].names;
  const [now, setNow] = useState<Toast | null>(null);
  const queue = useRef<Ach[]>([]);
  const busy = useRef(false);
  const key = useRef(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    function next() {
      const a = queue.current.shift();
      if (!a) {
        busy.current = false;
        setNow(null);
        return;
      }
      busy.current = true;
      /* More waiting than is worth showing one by one: say so once and clear the line. */
      if (queue.current.length >= MAX_QUEUE) {
        const more = queue.current.length + 1;
        queue.current = [];
        setNow({ key: ++key.current, more });
      } else setNow({ key: ++key.current, ach: a });
      timer = setTimeout(next, SHOW_MS);
    }
    function onEarned(e: Event) {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      const a = id ? BY_ID.get(id) : undefined;
      if (!a) return;
      queue.current.push(a);
      if (!busy.current) {
        /* A beat, so a burst arrives together and can be gathered. */
        busy.current = true;
        timer = setTimeout(next, 350);
      }
    }
    window.addEventListener(ACH_EVENT, onEarned);
    return () => {
      window.removeEventListener(ACH_EVENT, onEarned);
      clearTimeout(timer);
    };
  }, []);

  if (!now) return null;
  const name = "ach" in now ? fill(now.ach.name[lang === "ms" ? 1 : 0], names[now.ach.game as keyof typeof names] ?? "") : t.many(now.more);
  const desc = "ach" in now ? fill(now.ach.desc[lang === "ms" ? 1 : 0], names[now.ach.game as keyof typeof names] ?? "") : t.hint;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[120] flex justify-center px-3" role="status" aria-live="polite">
      <div key={now.key} className="rise-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-navy p-3 text-white shadow-2xl ring-1 ring-amber-400/60">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-navy">
          <TbTrophy className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-[10.5px] font-bold uppercase tracking-wider text-amber-400">{t.title}</span>
          <span className="block truncate font-display text-[14.5px] font-extrabold">{name}</span>
          <span className="block truncate text-[12px] text-slate-300">{desc}</span>
        </span>
      </div>
    </div>
  );
}
