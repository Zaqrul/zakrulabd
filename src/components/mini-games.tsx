"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import type { IconType } from "react-icons";
import type { Cause } from "@/components/games/trap-logic";
import { TbCandy, TbFeather, TbRocket, TbRun, TbSkull, TbX } from "react-icons/tb";

const Loading = () => <div className="h-48 animate-pulse rounded-xl bg-neutral-100" aria-hidden="true" />;

/* Each game is its own chunk, fetched only when someone opens it, so the dock
   costs nothing for the visitor who never plays. */
const Runner = dynamic(() => import("@/components/games/runner"), { ssr: false, loading: Loading });
const Flap = dynamic(() => import("@/components/games/flap"), { ssr: false, loading: Loading });
const Match = dynamic(() => import("@/components/games/match"), { ssr: false, loading: Loading });
const Trap = dynamic(() => import("@/components/games/trap"), { ssr: false, loading: Loading });
const Space = dynamic(() => import("@/components/games/space"), { ssr: false, loading: Loading });

export type GameId = "runner" | "flap" | "match" | "trap" | "space";

/* What the dock needs to show a game as an icon of its own. */
export const GAME_ORDER: GameId[] = ["runner", "flap", "match", "trap", "space"];
export const gameIcons: Record<GameId, IconType> = { runner: TbRun, flap: TbFeather, match: TbCandy, trap: TbSkull, space: TbRocket };
export const gameCopy = {
  en: {
    names: { runner: "Runner", flap: "Flap", match: "Match", trap: "Trap", space: "Space" } as Record<GameId, string>,
    best: "Best",
    deaths: "deaths",
  },
  ms: {
    names: { runner: "Lari", flap: "Terbang", match: "Padan", trap: "Perangkap", space: "Angkasa" } as Record<GameId, string>,
    best: "Terbaik",
    deaths: "kematian",
  },
};

/* The best score as the dock's tooltip tells it. The trap game counts fewest
   deaths, stored as deaths plus one so that zero still means "not finished". */
export function bestText(lang: "en" | "ms", id: GameId, raw: number) {
  const c = gameCopy[lang];
  if (id === "trap") return raw > 0 ? `${c.names[id]} · ${c.best} ${raw - 1} ${c.deaths}` : c.names[id];
  return `${c.names[id]} · ${c.best} ${raw}`;
}

const copy = {
  en: {
    title: "Mini games",
    close: "Close game",
    score: "Score",
    moves: "Moves",
    over: "Game over",
    again: "Play again",
    tapRun: "Tap or press Space to run",
    tapFlap: "Tap or press Space to flap",
    shuffled: "No moves left, board shuffled",
    hint: "Tap two neighbouring candies, or drag one",
    tapTrap: "Tap, or press Space, to start",
    deaths: "Deaths",
    won: "You reached the real flag",
    left: "Run left",
    right: "Run right",
    jump: "Jump",
    trapMessages: {
      pit: "The floor ends. Gravity does not.",
      fakefloor: "That floor was only pretending.",
      pop: "The spikes were hiding. Rude.",
      block: "That ? block was not a gift.",
      stone: "Never trust a ceiling.",
      rain: "Spikes from the sky. Nobody warned you.",
      flag: "A flag! Just not that one.",
      enemy: "A mushroom bumped you. It won.",
    } as Record<Cause, string>,
    tapSpace: "Tap, or press Space, to launch",
    bomb: "Bomb",
    spaceHint: "Drag to fly; the ship fires by itself. Shoot ? pods for guns, and collect gold + hearts to level up. Keys: arrows to fly, B for a bomb.",
    spaceGuns: { machine: "MACHINE GUN", spread: "SPREAD", laser: "LASER", rocket: "ROCKETS" },
    spaceCallouts: { shield: "Shield down!", armor: "Armour down!", overload: "OVERLOAD!", levelup: "Ship upgraded!" },
    chapterName: (n: number) => ["Chapter 1: Asteroid Belt", "Chapter 2: Violet Nebula", "Chapter 3: The Fortress"][n - 1],
    chapterClear: (n: number) => `Chapter ${n} clear`,
    nextChapter: "Next chapter",
    shipLost: "Ship lost",
    retryChapter: "Retry chapter",
    spaceWon: "You saved the galaxy",
  },
  ms: {
    title: "Permainan mini",
    close: "Tutup permainan",
    score: "Skor",
    moves: "Langkah",
    over: "Tamat",
    again: "Main lagi",
    tapRun: "Ketik atau tekan Space untuk lari",
    tapFlap: "Ketik atau tekan Space untuk terbang",
    shuffled: "Tiada langkah lagi, papan dikocok",
    hint: "Ketik dua gula-gula bersebelahan, atau seret satu",
    tapTrap: "Ketik, atau tekan Space, untuk mula",
    deaths: "Mati",
    won: "Anda sampai ke bendera sebenar",
    left: "Lari ke kiri",
    right: "Lari ke kanan",
    jump: "Lompat",
    trapMessages: {
      pit: "Lantai habis. Graviti tidak.",
      fakefloor: "Lantai itu cuma berpura-pura.",
      pop: "Duri bersembunyi. Biadab.",
      block: "Kotak ? itu bukan hadiah.",
      stone: "Jangan percaya siling.",
      rain: "Duri jatuh dari langit. Tiada siapa beritahu.",
      flag: "Bendera! Tapi bukan yang itu.",
      enemy: "Cendawan melanggar anda. Ia menang.",
    } as Record<Cause, string>,
    tapSpace: "Ketik, atau tekan Space, untuk berlepas",
    bomb: "Bom",
    spaceHint: "Seret untuk terbang; kapal menembak sendiri. Tembak pod ? untuk senjata, dan kutip hati emas + untuk naik tahap. Papan kekunci: anak panah untuk terbang, B untuk bom.",
    spaceGuns: { machine: "GATLING", spread: "SERAKAN", laser: "LASER", rocket: "ROKET" },
    spaceCallouts: { shield: "Perisai musnah!", armor: "Perisai besi musnah!", overload: "LEBIH BEBAN!", levelup: "Kapal dinaik taraf!" },
    chapterName: (n: number) => ["Bab 1: Lingkaran Asteroid", "Bab 2: Nebula Ungu", "Bab 3: Kubu Musuh"][n - 1],
    chapterClear: (n: number) => `Bab ${n} selesai`,
    nextChapter: "Bab seterusnya",
    shipLost: "Kapal musnah",
    retryChapter: "Cuba bab ini semula",
    spaceWon: "Anda menyelamatkan galaksi",
  },
};

/* The game itself, in a glass panel above the dock. Which game is chosen, and
   the choosing, belong to the dock: its pill grows icons for each game, and
   this panel plays whichever one is lit. Escape or the cross closes the panel
   and leaves the dock where it is, ready for another pick. */
export function MiniGames({ lang, game, onClose }: { lang: "en" | "ms"; game: GameId; onClose: () => void }) {
  const t = copy[lang];
  const names = gameCopy[lang].names;
  const best = gameCopy[lang].best;
  const Icon = gameIcons[game];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-label={`${t.title}: ${names[game]}`} className="rise-in liquid-glass pointer-events-auto flex w-full max-w-sm flex-col gap-2 rounded-3xl p-2.5">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-navy">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="flex-1 font-display text-[15px] font-bold text-navy">{names[game]}</h2>
        <button
          type="button"
          aria-label={t.close}
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-navy transition-colors hover:bg-navy hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        >
          <TbX aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="rounded-2xl bg-white p-2.5">
        {game === "runner" && (
          <Runner key="runner" labels={{ tap: t.tapRun, over: t.over, again: t.again, score: t.score, best }} />
        )}
        {game === "flap" && (
          <Flap key="flap" labels={{ tap: t.tapFlap, over: t.over, again: t.again, score: t.score, best }} />
        )}
        {game === "space" && (
          <Space
            key="space"
            labels={{
              tap: t.tapSpace,
              score: t.score,
              best,
              bomb: t.bomb,
              hint: t.spaceHint,
              chapterName: t.chapterName,
              clear: t.chapterClear,
              next: t.nextChapter,
              lost: t.shipLost,
              retry: t.retryChapter,
              won: t.spaceWon,
              again: t.again,
              guns: t.spaceGuns,
              callouts: t.spaceCallouts,
            }}
          />
        )}
        {game === "trap" && (
          <Trap
            key="trap"
            labels={{
              tap: t.tapTrap,
              deaths: t.deaths,
              best,
              won: t.won,
              again: t.again,
              left: t.left,
              right: t.right,
              jump: t.jump,
              messages: t.trapMessages,
            }}
          />
        )}
        {game === "match" && (
          <Match
            key="match"
            labels={{ score: t.score, moves: t.moves, best, over: t.over, again: t.again, shuffled: t.shuffled, hint: t.hint }}
          />
        )}
      </div>
    </div>
  );
}
