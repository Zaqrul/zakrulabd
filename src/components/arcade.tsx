"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TbArrowLeft, TbDeviceGamepad2, TbLayoutGrid, TbLogout, TbMusic, TbPower, TbTrophy, TbUser } from "react-icons/tb";
import { loadBest } from "@/components/games/shared";
import { AchievementsView } from "@/components/arcade-achievements";
import { SoundtrackView } from "@/components/soundtrack";
import { GAME_ORDER, GamePlayer, bestText, gameCopy, gameIcons, type GameId } from "@/components/mini-games";
import { SpaceFrame } from "@/components/games/space-frame";
import { ACH_CHANGED, currentStore, overall, progressOf, scanBests, type Store } from "@/lib/achievements";
import { SCORES_EVENT, signOut } from "@/lib/account";

/* The library: the Space series on its one shelf. */
type Shelf = "space";
const shelves: { id: Shelf; games: GameId[] }[] = [{ id: "space", games: GAME_ORDER }];

const copy = {
  en: {
    brand: "zakrulOS",
    tagline: "library for player one",
    library: "Library",
    achievements: "Achievements",
    soundtrack: "Soundtrack",
    earned: (a: number, b: number) => `${a}/${b} achievements`,
    profile: "Profile",
    exit: "Exit arcade",
    back: "Back to library",
    online: (n: number) => `${n} online`,
    games: "Games",
    pick: "Pick a game",
    signedIn: "Signed in",
    best: "Best scores",
    saved: "Your best scores are saved to this account and follow you to any device.",
    signOut: "Sign out",
    notPlayed: "Not played yet",
    shelves: { space: "Space series" } as Record<Shelf, string>,
  },
  ms: {
    brand: "zakrulOS",
    tagline: "pustaka untuk pemain satu",
    library: "Perpustakaan",
    achievements: "Pencapaian",
    soundtrack: "Runut bunyi",
    earned: (a: number, b: number) => `${a}/${b} pencapaian`,
    profile: "Profil",
    exit: "Keluar arked",
    back: "Kembali ke perpustakaan",
    online: (n: number) => `${n} online`,
    games: "Permainan",
    pick: "Pilih permainan",
    signedIn: "Sudah log masuk",
    best: "Skor terbaik",
    saved: "Skor terbaik anda disimpan dalam akaun ini dan mengikut anda ke mana-mana peranti.",
    signOut: "Log keluar",
    notPlayed: "Belum dimain",
    shelves: { space: "Siri Space" } as Record<Shelf, string>,
  },
};

/* How long the ball takes to grow into the screen, and to shrink back. The same
   half second the dock uses everywhere, and a touch more for the bigger move. */
const GROW_MS = 650;
const BALL_RADIUS = 22;

type View = "library" | "profile" | "achievements" | "soundtrack" | { play: GameId };

function readBests() {
  return Object.fromEntries(GAME_ORDER.map((id) => [id, loadBest(id)])) as Record<GameId, number>;
}

/* A screen of its own for games, for someone signed in. It opens from the dock's
   ball: the pill has already shrunk to a circle, and this grows out of that exact
   circle until it covers the page, so it feels like the ball became the room. A
   library of games, the player's profile, and the game itself, with nothing of
   the portfolio in the way. Leaving shrinks it back into the ball. */
export function Arcade({
  lang,
  username,
  online,
  origin,
  onExit,
}: {
  lang: "en" | "ms";
  username: string | null;
  online: number | null;
  /* Where the ball sits on the screen, in viewport pixels. */
  origin: { x: number; y: number };
  onExit: () => void;
}) {
  const t = copy[lang];
  const names = gameCopy[lang].names;
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"start" | "open" | "closing">("start");
  const [reach, setReach] = useState(0);
  const [view, setView] = useState<View>("library");
  const [bests, setBests] = useState<Record<GameId, number>>(readBests);
  const [clock, setClock] = useState("");
  const [ach, setAch] = useState<Store>(() => currentStore());
  const [reduce] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const exiting = useRef(false);

  /* The radius that just covers the farthest corner from the ball. */
  useEffect(() => {
    const measure = () =>
      setReach(Math.hypot(Math.max(origin.x, window.innerWidth - origin.x), Math.max(origin.y, window.innerHeight - origin.y)) + 8);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [origin.x, origin.y]);

  /* Two frames, so the browser paints the ball first and the growing is seen. */
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setPhase("open"));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = before;
    };
  }, []);

  useEffect(() => {
    if (phase === "open") root.current?.focus({ preventScroll: true });
  }, [phase]);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString(lang === "ms" ? "ms-MY" : "en-MY", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const timer = setInterval(tick, 20000);
    return () => clearInterval(timer);
  }, [lang]);

  /* Scores kept from before achievements existed count the first time zakrulOS opens, and a
     new achievement changes the counts on the cards. */
  useEffect(() => {
    scanBests();
    const refresh = () => setAch({ ...currentStore() });
    refresh();
    window.addEventListener(ACH_CHANGED, refresh);
    return () => window.removeEventListener(ACH_CHANGED, refresh);
  }, []);

  /* A sign-in merging saved scores in, or a game ending, changes the bests. */
  useEffect(() => {
    const refresh = () => setBests(readBests());
    window.addEventListener(SCORES_EVENT, refresh);
    return () => window.removeEventListener(SCORES_EVENT, refresh);
  }, []);

  const leave = useCallback(() => {
    if (exiting.current) return;
    exiting.current = true;
    setPhase("closing");
    setTimeout(onExit, reduce ? 0 : GROW_MS);
  }, [onExit, reduce]);

  /* Signed out somewhere else (another tab): there is no account left to show. */
  useEffect(() => {
    if (username === null && phase === "open") leave();
  }, [username, phase, leave]);

  const open = useCallback((next: View) => {
    setBests(readBests());
    setView(next);
  }, []);

  /* Escape steps back one level: out of a game into the library, out of the
     library altogether. Tab stays inside, since the page behind is covered. */
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (typeof view === "object") open("library");
      else leave();
      return;
    }
    if (e.key !== "Tab" || !root.current) return;
    const items = Array.from(
      root.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'),
    ).filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === root.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const radius = phase === "open" ? reach : BALL_RADIUS;
  const playing = typeof view === "object" ? view.play : null;
  const ready = phase !== "start";

  const navItem = (active: boolean) =>
    `flex flex-1 items-center justify-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 sm:flex-none sm:justify-start ${
      active ? "bg-amber-400 text-navy" : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;
  const chip =
    "flex h-9 items-center gap-2 rounded-full bg-white/10 px-3.5 text-[13px] font-bold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400";

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={`${t.brand}${username ? `: @${username}` : ""}`}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      style={{
        clipPath: `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
        transition: reduce ? "none" : `clip-path ${GROW_MS}ms cubic-bezier(0.65, 0, 0.2, 1), background-color 500ms ease-out`,
      }}
      className={`fixed inset-0 z-[80] flex flex-col text-white focus-visible:outline-none ${phase === "open" ? "bg-navy" : "bg-amber-400"}`}
    >
      <div
        style={{ transition: "opacity 250ms ease-out", transitionDelay: phase === "open" ? "350ms" : "0ms" }}
        className={`flex min-h-0 flex-1 flex-col ${phase === "open" ? "opacity-100" : "opacity-0"}`}
      >
        {ready && (
          <>
            <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 px-3 sm:gap-3 sm:px-5">
              <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-navy">
                <TbDeviceGamepad2 className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <h2 className="truncate font-display text-[16px] font-extrabold tracking-tight">{t.brand}</h2>
                <p className="hidden truncate text-[11.5px] font-semibold text-amber-400 sm:block">{t.tagline}</p>
              </div>

              {online !== null && (
                <span className="hidden items-center gap-2 text-[12.5px] font-bold text-slate-300 sm:flex">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#25D366]" />
                  {t.online(online)}
                </span>
              )}
              <span className="hidden font-mono text-[13px] tabular-nums text-slate-300 sm:block">{clock}</span>

              {username && (
                <button type="button" className={chip} onClick={() => open("profile")}>
                  <TbUser aria-hidden="true" className="h-4 w-4" />
                  <span className="max-w-24 truncate">@{username}</span>
                </button>
              )}
              <button
                type="button"
                aria-label={t.exit}
                title={t.exit}
                onClick={leave}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-amber-400 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <TbPower aria-hidden="true" className="h-4.5 w-4.5" />
              </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
              <nav
                aria-label={t.brand}
                className="order-last flex shrink-0 gap-1 border-t border-white/10 p-2 sm:order-first sm:w-52 sm:flex-col sm:border-r sm:border-t-0 sm:p-3"
              >
                <button type="button" aria-current={view === "library" ? "page" : undefined} className={navItem(view === "library")} onClick={() => open("library")}>
                  <TbLayoutGrid aria-hidden="true" className="h-4.5 w-4.5" />
                  {t.library}
                </button>
                <button type="button" aria-current={view === "achievements" ? "page" : undefined} className={navItem(view === "achievements")} onClick={() => open("achievements")}>
                  <TbTrophy aria-hidden="true" className="h-4.5 w-4.5" />
                  {t.achievements}
                </button>
                <button type="button" aria-current={view === "soundtrack" ? "page" : undefined} className={navItem(view === "soundtrack")} onClick={() => open("soundtrack")}>
                  <TbMusic aria-hidden="true" className="h-4.5 w-4.5" />
                  {t.soundtrack}
                </button>
                <button type="button" aria-current={view === "profile" ? "page" : undefined} className={navItem(view === "profile")} onClick={() => open("profile")}>
                  <TbUser aria-hidden="true" className="h-4.5 w-4.5" />
                  {t.profile}
                </button>
              </nav>

              <main className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${playing ? "p-2 sm:p-4" : "p-4 sm:p-8"}`}>
                {view === "library" && (
                  <section aria-label={t.library}>
                    <h3 className="rise-in mb-3 font-display text-[20px] font-extrabold tracking-tight">{t.games}</h3>
                    <div className="flex flex-col gap-5">
                      {shelves.map((shelf, k) => (
                        <div key={shelf.id} role="group" aria-labelledby={`shelf-${shelf.id}`}>
                          <h4 id={`shelf-${shelf.id}`} className="rise-in mb-2 flex items-baseline gap-2 text-[12px] font-bold uppercase tracking-wider text-slate-300" style={{ animationDelay: `${k * 60}ms` }}>
                            {t.shelves[shelf.id]}
                            <span className="font-mono text-[11px] text-slate-500">{shelf.games.length}</span>
                          </h4>
                          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
                            {shelf.games.map((id, n) => {
                              const Icon = gameIcons[id];
                              const played = bests[id] > 0;
                              return (
                                <li key={id} className="rise-in" style={{ animationDelay: `${k * 60 + 40 + n * 25}ms` }}>
                                  <button
                                    type="button"
                                    onClick={() => open({ play: id })}
                                    className="group relative flex w-full flex-col overflow-hidden rounded-xl bg-white/5 px-2.5 pb-2 text-left ring-1 ring-white/10 transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:ring-2 hover:ring-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                                  >
                                    <span aria-hidden="true" className="-mx-2.5 mb-1.5 flex h-14 items-center justify-center bg-linear-to-b from-[#8b5cf6]/30 to-transparent">
                                      <Icon className="h-8 w-8 text-[#c4b5fd] transition-transform duration-200 group-hover:scale-110 group-hover:text-amber-400" />
                                    </span>
                                    <span className="truncate font-display text-[13.5px] font-bold leading-tight">{names[id]}</span>
                                    <span className="truncate text-[11px] text-slate-300">
                                      {played ? bestText(lang, id, bests[id]).split(" · ")[1] : t.notPlayed}
                                    </span>
                                    <span className="mt-0.5 flex items-center gap-1 text-[10.5px] font-bold text-amber-400">
                                      <TbTrophy aria-hidden="true" className="h-3 w-3" />
                                      {progressOf(ach, id).done}/{progressOf(ach, id).total}
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {view === "achievements" && <AchievementsView lang={lang} />}

                {view === "soundtrack" && <SoundtrackView lang={lang} />}

                {playing && (
                  <section aria-label={names[playing]} className="mx-auto flex w-full flex-col gap-3">
                    <div className="flex w-full items-center gap-3">
                      <button
                        type="button"
                        onClick={() => open("library")}
                        className="flex h-9 items-center gap-1.5 rounded-full bg-white/10 pl-2.5 pr-3.5 text-[13px] font-bold transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      >
                        <TbArrowLeft aria-hidden="true" className="h-4 w-4" />
                        {t.back}
                      </button>
                    </div>
                    <SpaceFrame title={names[playing]} icon={gameIcons[playing]} closeLabel={t.back} onClose={() => open("library")} arcade>
                      <GamePlayer key={playing} lang={lang} game={playing} username={username} onExit={() => open("library")} />
                    </SpaceFrame>
                  </section>
                )}

                {view === "profile" && username && (
                  <section aria-label={t.profile} className="rise-in mx-auto flex w-full max-w-md flex-col gap-5">
                    <div className="flex items-center gap-4">
                      <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-amber-400 font-display text-[28px] font-extrabold uppercase text-navy">
                        {username[0]}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-display text-[22px] font-extrabold">@{username}</p>
                        <p className="text-[13px] text-slate-300">{t.signedIn}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                      <h3 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-slate-300">{t.best}</h3>
                      <ul className="flex flex-col gap-2.5">
                        {GAME_ORDER.map((id) => {
                          const Icon = gameIcons[id];
                          return (
                            <li key={id} className="flex items-center gap-3 text-[14px]">
                              <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-[#c4b5fd]" />
                              <span className="flex-1 font-bold">{names[id]}</span>
                              <span className="text-slate-300">{bests[id] > 0 ? bestText(lang, id, bests[id]).split(" · ")[1] : t.notPlayed}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <button type="button" onClick={() => open("achievements")} className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 text-left ring-1 ring-white/10 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
                      <TbTrophy aria-hidden="true" className="h-6 w-6 shrink-0 text-amber-400" />
                      <span className="flex-1 font-bold">{t.achievements}</span>
                      <span className="text-[13px] font-bold text-slate-300">{t.earned(overall(ach).done, overall(ach).total)}</span>
                    </button>

                    <p className="text-[12.5px] leading-snug text-slate-300">{t.saved}</p>

                    <button
                      type="button"
                      onClick={async () => {
                        await signOut();
                        leave();
                      }}
                      className="flex items-center gap-2 self-start rounded-full bg-white/10 px-4 py-2.5 text-[13.5px] font-bold transition-colors hover:bg-amber-400 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    >
                      <TbLogout aria-hidden="true" className="h-4.5 w-4.5" />
                      {t.signOut}
                    </button>
                  </section>
                )}
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
