"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import type { IconType } from "react-icons";
import type { Cause } from "@/components/games/trap-logic";
import { accountsEnabled } from "@/lib/account";
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
    tapTrap: "Start adventure",
    trapIntro: "Looks easy. Trust nothing.",
    trapProgress: "Course progress",
    trapCheckpoint: "Checkpoint reached. A little less walking back.",
    trapAreas: ["Quiet meadows", "Look up", "Almost safe"],
    trapHint: "Arrows / A D to move. Space to jump. Hold for a higher jump.",
    trapTouchHint: "Joystick to run, the button to jump. Hold for a higher jump.",
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
      ceiling: "Jumping is not always the answer.",
      dart: "That spike learned to fly sideways.",
    } as Record<Cause, string>,
    tapSpace: "Launch",
    bomb: "Bomb",
    nuke: "Nuke",
    spaceHint: "Drag to move. Auto-fire.",
    spaceTouchHint: "Use the joystick to fly. Auto-fire.",
    joystick: "Joystick",
    spaceHelp: "How to play",
    spaceGuide: "Tap Launch or press Space to start. Use the arrow keys to fly, or drag; on a phone use the on-screen joystick. Shoot green supply capsules for weapons and collect gold + hearts to level up. Tap Bomb or press B to throw ten timed bombs: each goes off three seconds later and hurts what is near it. The weapon is a pod on an arm under the nose. The blaster fires a single shot, and while a weapon is equipped it is switched off: the weapon fires only when something is in its line, until it runs out of ammo and you are back to the blaster. Boss weapons light up before firing: move after their aim locks. Laser gates, walls and marked flares block the way, so fly through the gaps. Enemies lock on to where you are, shown by a red mark, and fire a torpedo at that spot: move off it before it lands and it misses. Press P or the pause button to pause. Guests can fly Chapter 1 only: create an account and sign in to play every chapter. A signed-in player's progress is saved after every chapter, and if the ship is lost at a boss you can retry from the boss. Your ship has its own health bar and a small shield. Collect gold hearts to level up, as far as level 10, but the hearts are rare (four in the whole game) and each level needs one more than the one before, so the ship upgrades itself: level 1 torpedoes, 2 hypersonic drive, 3 mechanical shield, 4 a second launcher, 5 self-repair (after 6 seconds without a hit the ship mends itself), 9 HQ support (the hangar of a carrier fills the left edge and fires homing torpedoes from its four launchers). Being hit costs health only: hits go to the shield and then to the health bar, and the ship never loses a level or an upgrade. Before level 5 nothing heals the ship, so life crates are precious. Weapon crates are rarer, and can hold an ice bomb, a flamethrower or a katana. Press N to fire a nuclear warhead (3 a chapter): the missile homes in on the boss, or else the nearest enemy, and its blast wipes out small enemies and takes a bite out of a boss. The last boss also has a shield of its own that takes damage before its health and mends if you leave it alone.",
    spaceGuns: { machine: "VULCAN", spread: "WIDE", laser: "LASER", torpedo: "TORPEDO", icebomb: "ICE BOMB", flame: "FLAME", katana: "KATANA" },
    spaceCallouts: { shield: "Shield down!", armor: "Armour down!", overload: "OVERLOAD!", levelup: "Ship upgraded!", phase: "Phase shift!", warning: "WARNING", c4: "C4 BARRAGE!", hypersonic: "HYPERSONIC DRIVE!", mechshield: "MECHANICAL SHIELD!", launcher: "TWIN LAUNCHERS!", repair: "SELF-REPAIR!", hq: "HQ SUPPORT!" },
    talkNext: "Tap or press Space",
    launch: { engine: "ENGINE START", ready: "CATAPULT READY", go: "LAUNCH!" },
    chapterName: (n: number) =>
      [
        "Chapter 1: Iron Plains",
        "Chapter 2: Crimson Bay",
        "Chapter 3: Asteroid Belt",
        "Chapter 4: Violet Nebula",
        "Chapter 5: Frozen Rings",
        "Chapter 6: Solar Corona",
        "Chapter 7: Derelict Station",
        "Chapter 8: The Fortress",
      ][n - 1],
    chapterClear: (n: number) => `Chapter ${n} clear`,
    nextChapter: "Next chapter",
    shipLost: "Ship lost",
    retryChapter: "Retry chapter",
    retryBoss: "Retry from the boss",
    spaceWon: "You saved the galaxy",
    continueRun: "Continue",
    newGame: "New game",
    spaceGuestNote: "Guests can fly Chapter 1 only. Create an account and sign in to play every chapter and save your progress.",
    spaceGuestClear: "Chapter 1 cleared! Create an account and sign in to play the next chapters and save your progress.",
    spaceAccount: "Create account / Sign in",
    spaceReplay: "Replay Chapter 1",
    pause: "Pause",
    paused: "Paused",
    resume: "Resume",
    attackNames: {
      stomp: "Seismic stomp", flak: "Flak mortar", surge: "Ramming surge", salvo: "Lane salvo", pincer: "Pincer clamp", boulders: "Boulder toss",
      undertow: "Tractor undertow", spores: "Spore clouds", breach: "Ice breach", frost: "Frost breath", dive: "Solar plunge", wisps: "Plasma wisps",
      blink: "Phase blink", crescent: "Boomerang blades", c4: "C4 barrage",
    } as Record<string, string>,
    spaceResults: {
      enemies: "Enemies destroyed",
      hits: "Hits taken",
      bossTime: "Boss time",
      killBonus: "Destroyed bonus",
      noHitBonus: "No-hit bonus",
      speedBonus: "Speed bonus",
    },
    bossNames: ["Siege Tank", "Iron Flagship", "Artillery Hermit", "Hive Carrier", "Iron Leviathan", "Solar Bomber", "Crimson Fang", "Dreadnought"],
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
    tapTrap: "Mula pengembaraan",
    trapIntro: "Nampak mudah. Jangan percaya apa-apa.",
    trapProgress: "Kemajuan laluan",
    trapCheckpoint: "Checkpoint dicapai. Kurang sedikit perjalanan balik.",
    trapAreas: ["Padang tenang", "Pandang atas", "Hampir selamat"],
    trapHint: "Anak panah / A D untuk bergerak. Space untuk lompat. Tahan untuk lompat lebih tinggi.",
    trapTouchHint: "Kayu bedal untuk berlari, butang untuk lompat. Tahan untuk lompat lebih tinggi.",
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
      ceiling: "Melompat bukan sentiasa jawapannya.",
      dart: "Duri itu pandai terbang ke tepi pula.",
    } as Record<Cause, string>,
    tapSpace: "Mula",
    bomb: "Bom",
    nuke: "Nuklear",
    spaceHint: "Seret untuk bergerak. Tembakan automatik.",
    spaceTouchHint: "Guna kayu bedal untuk terbang. Tembakan automatik.",
    joystick: "Kayu bedal",
    spaceHelp: "Cara bermain",
    spaceGuide: "Ketik Mula atau tekan Space untuk bermula. Guna kekunci anak panah atau seret untuk terbang; di telefon guna kayu bedal pada skrin. Tembak kapsul bekalan hijau untuk senjata dan kutip hati emas bertanda + untuk naik tahap. Ketik Bom atau tekan B untuk membaling sepuluh bom berjangka: setiap satu meletup tiga saat kemudian dan mencederakan apa yang berdekatan. Senjata ialah pod pada lengan di bawah hidung kapal. Blaster menembak satu das sahaja, dan semasa senjata dipasang blaster dimatikan: senjata hanya menembak bila ada sasaran di barisannya, sehingga peluru habis dan anda kembali kepada blaster. Senjata boss menyala sebelum menembak: bergerak selepas sasarannya dikunci. Pintu laser, dinding dan api suria bertanda menghalang laluan, jadi terbang melalui ruang kosong. Musuh mengunci tempat anda berada, ditunjukkan dengan tanda merah, dan melepaskan torpedo ke situ: beralih sebelum ia tiba dan ia akan tersasar. Tekan P atau butang jeda untuk berhenti seketika. Tetamu hanya boleh terbang di Bab 1: cipta akaun dan log masuk untuk bermain semua bab. Kemajuan pemain yang log masuk disimpan selepas setiap bab, dan jika kapal musnah semasa melawan boss, anda boleh cuba semula dari boss. Kapal anda ada bar kesihatan sendiri dan perisai kecil. Kutip hati emas untuk naik tahap, sehingga tahap 10, tetapi hati itu jarang (empat sahaja dalam seluruh permainan) dan setiap tahap perlukan satu lagi berbanding yang sebelumnya, jadi kapal menaik taraf sendiri: tahap 1 torpedo, 2 pacuan hipersonik, 3 perisai mekanikal, 4 pelancar kedua, 5 pembaikan sendiri (selepas 6 saat tanpa terkena, kapal memulihkan diri), 9 sokongan HQ (hangar kapal induk memenuhi tepi kiri dan melepaskan torpedo pengesan dari empat pelancarnya). Bila diserang, hanya kesihatan yang berkurang: pukulan kena perisai dahulu kemudian bar kesihatan, dan kapal tidak pernah kehilangan tahap atau naik taraf. Sebelum tahap 5 tiada apa yang memulihkan kapal, jadi kotak nyawa amat berharga. Kapsul senjata kini lebih jarang, dan boleh mengandungi bom ais, penyembur api atau katana. Tekan N untuk melepaskan hulu peledak nuklear (3 setiap bab): peluru berpandu itu mengejar boss, atau musuh terdekat, dan letupannya menghapuskan musuh kecil serta mengurangkan sebahagian kesihatan boss. Boss terakhir juga ada perisai sendiri yang menerima kerosakan sebelum kesihatannya dan pulih jika dibiarkan.",
    spaceGuns: { machine: "VULCAN", spread: "WIDE", laser: "LASER", torpedo: "TORPEDO", icebomb: "BOM AIS", flame: "API", katana: "KATANA" },
    spaceCallouts: { shield: "Perisai musnah!", armor: "Perisai besi musnah!", overload: "LEBIH BEBAN!", levelup: "Kapal dinaik taraf!", phase: "Fasa bertukar!", warning: "AMARAN", c4: "HUJAN C4!", hypersonic: "PACUAN HIPERSONIK!", mechshield: "PERISAI MEKANIKAL!", launcher: "PELANCAR BERKEMBAR!", repair: "PEMBAIKAN SENDIRI!", hq: "SOKONGAN HQ!" },
    talkNext: "Ketik atau tekan Space",
    launch: { engine: "ENJIN DIHIDUPKAN", ready: "KATAPULT SEDIA", go: "BERLEPAS!" },
    chapterName: (n: number) =>
      [
        "Bab 1: Dataran Besi",
        "Bab 2: Teluk Merah",
        "Bab 3: Lingkaran Asteroid",
        "Bab 4: Nebula Ungu",
        "Bab 5: Cincin Beku",
        "Bab 6: Korona Suria",
        "Bab 7: Stesen Terbiar",
        "Bab 8: Kubu Musuh",
      ][n - 1],
    chapterClear: (n: number) => `Bab ${n} selesai`,
    nextChapter: "Bab seterusnya",
    shipLost: "Kapal musnah",
    retryChapter: "Cuba bab ini semula",
    retryBoss: "Cuba semula dari boss",
    spaceWon: "Anda menyelamatkan galaksi",
    continueRun: "Sambung",
    newGame: "Permainan baru",
    spaceGuestNote: "Tetamu hanya boleh terbang di Bab 1. Cipta akaun dan log masuk untuk bermain semua bab dan simpan kemajuan anda.",
    spaceGuestClear: "Bab 1 selesai! Cipta akaun dan log masuk untuk bermain bab seterusnya dan simpan kemajuan anda.",
    spaceAccount: "Cipta akaun / Log masuk",
    spaceReplay: "Main semula Bab 1",
    pause: "Jeda",
    paused: "Dijeda",
    resume: "Teruskan",
    attackNames: {
      stomp: "Hentakan gegar", flak: "Mortar flak", surge: "Lonjakan langgar", salvo: "Hujan jalur", pincer: "Cepitan sepit", boulders: "Lontar batu",
      undertow: "Tarikan traktor", spores: "Awan spora", breach: "Letupan ais", frost: "Nafas beku", dive: "Junam suria", wisps: "Wisp plasma",
      blink: "Kelip fasa", crescent: "Bilah boomerang", c4: "Hujan C4",
    } as Record<string, string>,
    spaceResults: {
      enemies: "Musuh dimusnahkan",
      hits: "Kali terkena",
      bossTime: "Masa boss",
      killBonus: "Bonus musnah",
      noHitBonus: "Bonus tanpa terkena",
      speedBonus: "Bonus pantas",
    },
    bossNames: ["Kereta Kebal Pengepungan", "Kapal Perang Besi", "Ketam Artileri", "Kapal Induk Sarang", "Leviatan Besi", "Pengebom Suria", "Taring Merah", "Dreadnought"],
  },
};

/* Whichever game is picked, with its words in the visitor's language. Shared by
   the dock's glass panel and the full-screen game space, so a game is wired up
   once. */
export function GamePlayer({
  lang,
  game,
  username = null,
  gated = false,
  onAccount,
}: {
  lang: "en" | "ms";
  game: GameId;
  /* Who is signed in. With `gated`, Space lets a guest fly Chapter 1 only and saves
     nothing, and `onAccount` opens the account panel. */
  username?: string | null;
  gated?: boolean;
  onAccount?: () => void;
}) {
  const t = copy[lang];
  const best = gameCopy[lang].best;

  return (
    <>
      {game === "runner" && (
        <Runner key="runner" labels={{ tap: t.tapRun, over: t.over, again: t.again, score: t.score, best }} />
      )}
      {game === "flap" && (
        <Flap key="flap" labels={{ tap: t.tapFlap, over: t.over, again: t.again, score: t.score, best }} />
      )}
      {game === "space" && (
        <Space
          key="space"
          lang={lang}
          username={username}
          gated={gated}
          onAccount={onAccount}
          labels={{
            tap: t.tapSpace,
            score: t.score,
            best,
            bomb: t.bomb,
            nuke: t.nuke,
            hint: t.spaceHint,
            touchHint: t.spaceTouchHint,
            joystick: t.joystick,
            help: t.spaceHelp,
            guide: t.spaceGuide,
            chapterName: t.chapterName,
            clear: t.chapterClear,
            next: t.nextChapter,
            lost: t.shipLost,
            retry: t.retryChapter,
            retryBoss: t.retryBoss,
            won: t.spaceWon,
            again: t.again,
            continueRun: t.continueRun,
            newGame: t.newGame,
            guestNote: t.spaceGuestNote,
            guestClear: t.spaceGuestClear,
            account: t.spaceAccount,
            replay: t.spaceReplay,
            pause: t.pause,
            paused: t.paused,
            resume: t.resume,
            guns: t.spaceGuns,
            callouts: t.spaceCallouts,
            talkNext: t.talkNext,
            launch: t.launch,
            results: t.spaceResults,
            bossNames: t.bossNames,
            attackNames: t.attackNames,
          }}
        />
      )}
      {game === "trap" && (
        <Trap
          key="trap"
          labels={{
            tap: t.tapTrap,
            intro: t.trapIntro,
            progress: t.trapProgress,
            checkpoint: t.trapCheckpoint,
            areas: t.trapAreas,
            hint: t.trapHint,
            touchHint: t.trapTouchHint,
            joystick: t.joystick,
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
    </>
  );
}

/* The game itself, in a glass panel above the dock. Which game is chosen, and
   the choosing, belong to the dock: its pill grows icons for each game, and
   this panel plays whichever one is lit. Escape or the cross closes the panel
   and leaves the dock where it is, ready for another pick. */
export function MiniGames({
  lang,
  game,
  username,
  onClose,
  onAccount,
}: {
  lang: "en" | "ms";
  game: GameId;
  username: string | null;
  onClose: () => void;
  /* Opens the account panel, for a guest who has reached what an account is needed for. */
  onAccount: () => void;
}) {
  const t = copy[lang];
  const names = gameCopy[lang].names;
  const Icon = gameIcons[game];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-label={`${t.title}: ${names[game]}`} className={`rise-in liquid-glass pointer-events-auto flex max-h-[calc(100dvh-6rem)] w-full shrink-0 flex-col gap-2 rounded-3xl p-2.5 ${game === "space" || game === "runner" ? "max-w-2xl" : "max-w-sm"}`}>
      <div className="flex shrink-0 items-center gap-2">
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

      <div className={`min-h-0 overflow-y-auto overscroll-contain rounded-2xl bg-white ${game === "space" ? "p-1.5" : "p-2.5"}`}>
        <GamePlayer lang={lang} game={game} username={username} gated={accountsEnabled} onAccount={accountsEnabled ? onAccount : undefined} />
      </div>
    </div>
  );
}
