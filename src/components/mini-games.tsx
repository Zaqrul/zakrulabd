"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import type { IconType } from "react-icons";
import { SPACE2_CHAPTERS, SPACE2_COPY, space2ChapterName } from "@/components/games/space2-copy";
import { TbPlanet, TbRocket, TbX } from "react-icons/tb";

const Loading = () => <div className="h-48 animate-pulse rounded-xl bg-neutral-100" aria-hidden="true" />;

/* The game is its own chunk, fetched only when someone opens it, so the dock
   costs nothing for the visitor who never plays. */
const Space = dynamic(() => import("@/components/games/space"), { ssr: false, loading: Loading });

/* The Space series is all there is: Space and Space 2, which plays on Space's screen. */
export type GameId = "space" | "space2";

export const GAME_ORDER: GameId[] = ["space", "space2"];
/* Anyone can play: a guest flies each campaign's first chapter, and an account opens the rest. */
export const GUEST_GAMES: GameId[] = ["space", "space2"];
/* What the dock offers. */
export const DECK_GAMES: GameId[] = GAME_ORDER;
export const isLocked = (id: GameId, username: string | null) => !username && !GUEST_GAMES.includes(id);
export const gameIcons: Record<GameId, IconType> = { space: TbRocket, space2: TbPlanet };
export const gameCopy = {
  en: {
    names: { space: "Space", space2: "Space 2" } as Record<GameId, string>,
    best: "Best",
  },
  ms: {
    names: { space: "Angkasa", space2: "Angkasa 2" } as Record<GameId, string>,
    best: "Terbaik",
  },
};

/* The best score as the dock's tooltip tells it. */
export function bestText(lang: "en" | "ms", id: GameId, raw: number) {
  const c = gameCopy[lang];
  return `${c.names[id]} · ${c.best} ${raw}`;
}

const copy = {
  en: {
    title: "Mini games",
    close: "Close game",
    score: "Score",
    over: "Game over",
    again: "Play again",
    tapSpace: "Launch",
    bomb: "Bomb",
    nuke: "Nuke",
    spaceHint: "Drag, use arrow keys, or slide two fingers on your trackpad over the game. Auto-fire.",
    spaceTouchHint: "Use the joystick or drag on the game to fly. Trackpad gestures work too. Auto-fire.",
    joystick: "Joystick",
    spaceHelp: "How to play",
    spaceGuide: "Tap Launch or press Space to start. Use the arrow keys to fly, or drag; on a phone use the on-screen joystick. Shoot green supply capsules for weapons and destroy enemies to fill the XP gauge and level up. Tap Bomb or press B to throw ten timed bombs: each goes off three seconds later and hurts what is near it. The weapon is a pod on an arm under the nose. The blaster fires a single shot, and while a weapon is equipped it is switched off: the weapon fires only when something is in its line, until it runs out of ammo and you are back to the blaster. Boss weapons light up before firing: move after their aim locks. Laser gates, walls and marked flares block the way, so fly through the gaps. Enemies lock on to where you are, shown by a red mark, and fire a torpedo at that spot: move off it before it lands and it misses. You have two chances: each time your ship is lost, one is used to try again. Lose it with none left and the run starts again from Chapter 1. Press P or the pause button to pause. Sign in to play every chapter. A signed-in player's progress is saved after every chapter, and if the ship is lost at a boss you can retry from the boss. Your ship has 100 health and a 50 shield, and neither ever grows: levels make the ship tougher in other ways. Every enemy you destroy fills the XP gauge under your level: 100 XP is one level, as far as level 10, and gold hearts add a bonus. Each level upgrades the ship by itself: level 1 torpedoes, 2 hypersonic drive, 3 mechanical shield (30% less damage from every hit), 4 a second launcher, 5 self-repair (the ship mends itself faster), 9 HQ support (the hangar of a carrier fills the left edge and fires homing torpedoes from its four launchers). Being hit costs health only: hits go to the shield and then to the health bar, and the ship never loses a level or an upgrade. From the start the ship slowly mends its own health after 6 seconds without a hit; self-repair at level 5 makes it mend faster. Life crates still matter. Weapon crates are rarer, and can hold an ice bomb, a flamethrower or a katana. Press N to fire a nuclear warhead (3 a chapter): the missile homes in on the boss, or else the nearest enemy, and its blast wipes out small enemies and takes a bite out of a boss. The last boss also has a shield of its own that takes damage before its health and mends if you leave it alone.",
    spaceGuns: { machine: "VULCAN", spread: "WIDE", laser: "LASER", torpedo: "TORPEDO", icebomb: "ICE BOMB", flame: "FLAME", katana: "KATANA", minirocket: "MINI ROCKET", hyperbeam: "HYPERBEAM" },
    spaceCallouts: { shield: "Shield down!", armor: "Armour down!", overload: "OVERLOAD!", levelup: "Ship upgraded!", phase: "Phase shift!", warning: "WARNING", c4: "C4 BARRAGE!", hypersonic: "HYPERSONIC DRIVE!", mechshield: "MECHANICAL SHIELD!", launcher: "TWIN LAUNCHERS!", repair: "SELF-REPAIR!", hq: "HQ SUPPORT!", cover: "ORB COVER!", ultimate: "ULTIMATE!", decks: "DECKS AWASH!", magazines: "MAGAZINES EXPOSED!", shed: "FROST SHED!", molt: "ARMOUR MOLTED!", decouple: "CARS DECOUPLED!", breach: "HULL BREACH!", pressure: "PRESSURE DROP!", plating: "PLATING CRACKED!", buckle: "LEGS BUCKLING!", judgement: "JUDGEMENT AWAKE!", core: "CORE EXPOSED!", laststand: "LAST STAND!", miniboss: "MINI BOSS!", seaspray: "SEA SPRAY: slower low over the water", downpour: "DOWNPOUR: the rain pushes you down", blizzard: "BLIZZARD: the wind pushes you back", sandstorm: "SANDSTORM: sand slows your guns", fogbank: "FOG: inside a band, enemy aim scatters", polar: "POLAR COLD: engines run slower", turbulence: "TURBULENCE: the storm shoves you about", clearsky: "CLEAR DAWN: your shield recharges" },
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
    chancesLeft: (n: number) => (n === 1 ? "1 chance left" : `${n} chances left`),
    outOfChances: "Out of chances",
    restartRun: "Start again from Chapter 1",
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
      railshot: "Railshot", geysers: "Sea geysers", broadside: "Broadside", venom: "Venom globs", snapjaw: "Snapjaw",
      avalanche: "Avalanche", icewall: "Ice wall", lances: "Glacier lances", sandspout: "Sandspouts", burrow: "Burrow strike", pinwheel: "Sand pinwheel",
      ram: "Runaway car", searchlight: "Searchlight", sweep: "Meridian sweep", icebreak: "Icebreak", harpoon: "Chain harpoon", vortex: "Polar vortex",
      lightning: "Walking lightning", twister: "Twister", maelstrom: "Maelstrom", quake: "Quake", rocketfist: "Rocket fist", orbital: "Orbital strike",
      cluster: "Cluster shells", scissor: "Scissor beams", march: "March of Judgement",
      volley: "Volley", helix: "Helix storm", rain: "Iron rain", tidewall: "Tide wall", shatter: "Shatter shells", barrage: "Shotgun barrage", grid: "Judgement grid",
      rotorwash: "Rotor wash", sweepgun: "Sweep gun", skip: "Skip hop", netgun: "Net gun", cableslide: "Cable slide", chaff: "Chaff ring",
      duneram: "Dune ram", mortar: "Cross mortar", ladder: "Laser ladder", lattice: "Lattice", torpfan: "Torpedo fan", periscope: "Periscope strike",
      featherfan: "Feather fan", divebomb: "Dive bomb", gatelaser: "Gate lasers", shielddrones: "Shield drones",
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
    over: "Tamat",
    again: "Main lagi",
    tapSpace: "Mula",
    bomb: "Bom",
    nuke: "Nuklear",
    spaceHint: "Seret, guna anak panah, atau gerakkan dua jari pada trackpad di atas game. Tembakan automatik.",
    spaceTouchHint: "Guna kayu bedal atau seret pada game untuk terbang. Trackpad juga boleh digunakan. Tembakan automatik.",
    joystick: "Kayu bedal",
    spaceHelp: "Cara bermain",
    spaceGuide: "Ketik Mula atau tekan Space untuk bermula. Guna kekunci anak panah atau seret untuk terbang; di telefon guna kayu bedal pada skrin. Tembak kapsul bekalan hijau untuk senjata dan musnahkan musuh untuk memenuhi tolok XP dan naik tahap. Ketik Bom atau tekan B untuk membaling sepuluh bom berjangka: setiap satu meletup tiga saat kemudian dan mencederakan apa yang berdekatan. Senjata ialah pod pada lengan di bawah hidung kapal. Blaster menembak satu das sahaja, dan semasa senjata dipasang blaster dimatikan: senjata hanya menembak bila ada sasaran di barisannya, sehingga peluru habis dan anda kembali kepada blaster. Senjata boss menyala sebelum menembak: bergerak selepas sasarannya dikunci. Pintu laser, dinding dan api suria bertanda menghalang laluan, jadi terbang melalui ruang kosong. Musuh mengunci tempat anda berada, ditunjukkan dengan tanda merah, dan melepaskan torpedo ke situ: beralih sebelum ia tiba dan ia akan tersasar. Anda ada dua peluang: setiap kali kapal musnah, satu digunakan untuk cuba semula. Jika kapal musnah tanpa peluang lagi, permainan bermula semula dari Bab 1. Tekan P atau butang jeda untuk berhenti seketika. Log masuk untuk bermain semua bab. Kemajuan pemain yang log masuk disimpan selepas setiap bab, dan jika kapal musnah semasa melawan boss, anda boleh cuba semula dari boss. Kapal anda ada 100 kesihatan dan 50 perisai, dan kedua-duanya tidak pernah bertambah: tahap menjadikan kapal lebih tahan dengan cara lain. Setiap musuh yang dimusnahkan memenuhi tolok XP di bawah tahap anda: 100 XP satu tahap, sehingga tahap 10, dan hati emas memberi bonus. Setiap tahap menaik taraf kapal dengan sendirinya: tahap 1 torpedo, 2 pacuan hipersonik, 3 perisai mekanikal (setiap serangan 30% kurang kesan), 4 pelancar kedua, 5 pembaikan sendiri (kapal pulih lebih pantas), 9 sokongan HQ (hangar kapal induk memenuhi tepi kiri dan melepaskan torpedo pengesan dari empat pelancarnya). Bila diserang, hanya kesihatan yang berkurang: pukulan kena perisai dahulu kemudian bar kesihatan, dan kapal tidak pernah kehilangan tahap atau naik taraf. Sejak awal, kapal memulihkan kesihatannya sendiri secara perlahan selepas 6 saat tanpa terkena; pembaikan sendiri pada tahap 5 menjadikannya lebih pantas. Kotak nyawa masih penting. Kapsul senjata kini lebih jarang, dan boleh mengandungi bom ais, penyembur api atau katana. Tekan N untuk melepaskan hulu peledak nuklear (3 setiap bab): peluru berpandu itu mengejar boss, atau musuh terdekat, dan letupannya menghapuskan musuh kecil serta mengurangkan sebahagian kesihatan boss. Boss terakhir juga ada perisai sendiri yang menerima kerosakan sebelum kesihatannya dan pulih jika dibiarkan.",
    spaceGuns: { machine: "VULCAN", spread: "WIDE", laser: "LASER", torpedo: "TORPEDO", icebomb: "BOM AIS", flame: "API", katana: "KATANA", minirocket: "ROKET MINI", hyperbeam: "HIPERBEAM" },
    spaceCallouts: { shield: "Perisai musnah!", armor: "Perisai besi musnah!", overload: "LEBIH BEBAN!", levelup: "Kapal dinaik taraf!", phase: "Fasa bertukar!", warning: "AMARAN", c4: "HUJAN C4!", hypersonic: "PACUAN HIPERSONIK!", mechshield: "PERISAI MEKANIKAL!", launcher: "PELANCAR BERKEMBAR!", repair: "PEMBAIKAN SENDIRI!", hq: "SOKONGAN HQ!", cover: "LINDUNGAN ORB!", ultimate: "SERANGAN MUKTAMAD!", decks: "DEK DIBANJIRI!", magazines: "RUANG SENJATA TERDEDAH!", shed: "FROST GUGUR!", molt: "PERISAI TERLERAI!", decouple: "GERABAK TERPISAH!", breach: "BADAN KAPAL BOCOR!", pressure: "TEKANAN JATUH!", plating: "PLAT RETAK!", buckle: "KAKI GOYAH!", judgement: "JUDGEMENT AKTIF!", core: "TERAS TERDEDAH!", laststand: "PERTAHANAN TERAKHIR!", miniboss: "BOS KECIL!", seaspray: "PERCIKAN LAUT: lebih perlahan dekat air", downpour: "HUJAN LEBAT: hujan menolak anda ke bawah", blizzard: "RIBUT SALJI: angin menolak anda ke belakang", sandstorm: "RIBUT PASIR: pasir melambatkan senjata", fogbank: "KABUS: dalam jalur kabus, tembakan musuh tersasar", polar: "SEJUK KUTUB: enjin lebih perlahan", turbulence: "GELORA: ribut menolak anda ke sana sini", clearsky: "FAJAR CERAH: perisai anda pulih sendiri" },
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
    chancesLeft: (n: number) => `Tinggal ${n} peluang`,
    outOfChances: "Peluang sudah habis",
    restartRun: "Mula semula dari Bab 1",
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
      railshot: "Tembakan rel", geysers: "Pancutan laut", broadside: "Tembakan rusuk", venom: "Gumpal bisa", snapjaw: "Rahang sambar",
      avalanche: "Runtuhan salji", icewall: "Dinding ais", lances: "Lembing glasier", sandspout: "Pancutan pasir", burrow: "Serangan bawah tanah", pinwheel: "Kincir pasir",
      ram: "Gerabak terlepas", searchlight: "Lampu pencari", sweep: "Sapuan Meridian", icebreak: "Pecah ais", harpoon: "Tempuling rantai", vortex: "Pusaran kutub",
      lightning: "Kilat berjalan", twister: "Puting beliung", maelstrom: "Olak maut", quake: "Gempa", rocketfist: "Penumbuk roket", orbital: "Serangan orbit",
      cluster: "Peluru gugusan", scissor: "Pancaran gunting", march: "Perarakan Judgement",
      volley: "Das serentak", helix: "Ribut heliks", rain: "Hujan besi", tidewall: "Tembok ombak", shatter: "Peluru pecah", barrage: "Hujan serpihan", grid: "Grid Penghakiman",
      rotorwash: "Hembusan rotor", sweepgun: "Senapang sapu", skip: "Lompatan air", netgun: "Senapang jaring", cableslide: "Gelongsor kabel", chaff: "Cincin chaff",
      duneram: "Rempuhan bukit pasir", mortar: "Mortar silang", ladder: "Tangga laser", lattice: "Kekisi", torpfan: "Kipas torpedo", periscope: "Serangan periskop",
      featherfan: "Kipas bulu", divebomb: "Bom junam", gatelaser: "Laser pintu", shielddrones: "Dron perisai",
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

/* Counts a game being opened and the time spent in it, for the achievements. Loaded on demand,
   and only for a game the visitor is actually let into. */
function useSession(game: GameId, active: boolean) {
  useEffect(() => {
    if (!active) return;
    let stopped = false;
    let seconds = 0;
    let api: typeof import("@/lib/achievements") | null = null;
    void import("@/lib/achievements").then((m) => {
      if (stopped) return;
      api = m;
      m.opened(game);
    });
    const timer = setInterval(() => {
      if (document.visibilityState !== "visible" || !api) return;
      seconds += 5;
      api.played(game, 5, seconds);
    }, 5000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [game, active]);
}

/* Whichever game is picked, with its words in the visitor's language. Shared by
   the dock's glass panel and the full-screen game space, so a game is wired up
   once. */
export function GamePlayer({
  lang,
  game,
  username = null,
  onAccount,
}: {
  lang: "en" | "ms";
  game: GameId;
  /* Guests can try Chapter 1; onAccount opens registration/login to save or continue. */
  username?: string | null;
  onAccount?: () => void;
}) {
  const t = copy[lang];
  const best = gameCopy[lang].best;
  /* Space 2 plays on Space's screen; these are the words that differ. */
  const s2 = SPACE2_COPY[lang];
  const space2Labels = {
    tap: s2.start,
    help: s2.help,
    guide: s2.guide,
    won: s2.won,
    next: s2.next,
    retry: s2.retry,
    retryBoss: s2.retryBoss,
    newGame: s2.newGame,
    continueRun: s2.continue,
    chapterName: (n: number) => space2ChapterName(lang, n) ?? t.chapterName(n),
    clear: (n: number) => `${s2.clear}: ${space2ChapterName(lang, n) ?? ""}`,
    bossNames: [...t.bossNames, ...SPACE2_CHAPTERS.map((c) => c.boss)],
  };
  useSession(game, !isLocked(game, username));
  return (
    <>
      {(game === "space" || game === "space2") && (
        <Space
          key={game}
          campaign={game === "space2" ? 2 : 1}
          lang={lang}
          username={username}
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
            chancesLeft: t.chancesLeft,
            outOfChances: t.outOfChances,
            restart: t.restartRun,
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
            ...(game === "space2" ? space2Labels : {}),
          }}
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
    <div role="dialog" aria-label={`${t.title}: ${names[game]}`} className={`rise-in liquid-glass pointer-events-auto flex max-h-[calc(100dvh-6rem)] w-full shrink-0 flex-col gap-2 rounded-3xl p-2.5 max-w-2xl`}>
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
        <GamePlayer lang={lang} game={game} username={username} onAccount={onAccount} />
      </div>
    </div>
  );
}
