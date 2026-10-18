"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SiWhatsapp } from "react-icons/si";
import { TbDeviceGamepad2, TbMail, TbMessageCircle, TbPlus, TbUser, TbUsers, TbX } from "react-icons/tb";
import { AccountPanel } from "@/components/account-panel";
import dynamic from "next/dynamic";
import { loadBest } from "@/components/games/shared";
import { DECK_GAMES, GAME_ORDER, MiniGames, bestText, gameIcons, type GameId } from "@/components/mini-games";
import { SectionSummary } from "@/components/section-summary";
import { openTawkChat, subscribeTawkUnread, tawkEnabled } from "@/components/tawk-widget";
import { SCORES_EVENT, accountsEnabled, hasAccountHint, watchAccount } from "@/lib/account";
import { wa, waMessages } from "@/lib/contact";
import { announcement, dismissNotice, subscribeNotices, type Notice } from "@/lib/notices";
import { loadTotalVisitors, presenceEnabled, watchOnlineCount } from "@/lib/presence";
import { getSummariesOff, setSummariesOff, subscribeSummariesOff } from "@/lib/summary-pref";

/* Only loaded once the games are opened: the arcade and its list of achievements are large. */
const Arcade = dynamic(() => import("@/components/arcade").then((m) => m.Arcade), { ssr: false });
const AchievementToasts = dynamic(() => import("@/components/achievement-toasts"), { ssr: false });

const copy = {
  en: {
    title: "Contact me via",
    open: "Open contact options",
    close: "Close contact options",
    chat: "Live chat",
    wa: "WhatsApp",
    email: "Email",
    online: (n: number) => `${n} online now`,
    total: (n: number) => `${n.toLocaleString("en")} ${n === 1 ? "visitor" : "visitors"} in total`,
    offline: "You are offline. Some things may not work until you reconnect.",
    unread: (n: number) => `${n} new ${n === 1 ? "reply" : "replies"} in live chat`,
    dismiss: "Dismiss",
    nudge: "Questions? Tap here to reach me",
    summaries: "Section summaries",
    games: "Games",
    playOffline: "Play while you wait",
    account: "Sign in to save scores",
    accountAs: (name: string) => `@${name}`,
  },
  ms: {
    title: "Hubungi saya melalui",
    open: "Buka pilihan hubungan",
    close: "Tutup pilihan hubungan",
    chat: "Live chat",
    wa: "WhatsApp",
    email: "E-mel",
    online: (n: number) => `${n} online sekarang`,
    total: (n: number) => `${n.toLocaleString("ms")} pelawat keseluruhan`,
    offline: "Anda di luar talian. Sesetengah fungsi mungkin tidak berfungsi sehingga disambung semula.",
    unread: (n: number) => `${n} balasan baru dalam live chat`,
    dismiss: "Tutup",
    nudge: "Ada soalan? Tekan di sini untuk hubungi saya",
    summaries: "Ringkasan seksyen",
    games: "Permainan",
    playOffline: "Main sementara menunggu",
    account: "Log masuk untuk simpan skor",
    accountAs: (name: string) => `@${name}`,
  },
};

const DISMISSED_KEY = "announcement-dismissed";
/* How long the pill takes to shrink away: a touch more than its 500ms transition,
   which is the same half second every panel takes to appear. */
/* The half second everything takes to open, close or appear. */
const DOCK_MS = 500;
const COLLAPSE_MS = DOCK_MS + 20;
/* A beat between the pill being empty and growing again. */
const SWAP_PAUSE_MS = 90;
const NUDGE_KEY = "contact-nudge-seen";

/* A dock fixed to the bottom centre. It rests as a single plus button; opening
   it slides out WhatsApp, email and live chat as icons, and a panel above them
   gathers everything else the site has to say: how many people are on it, a note
   from me, unread chat replies, connection trouble, and messages other parts of
   the site have posted. WhatsApp and email are plain anchors, so
   ConversionTracking reports them without any code here; live chat is a button
   because it opens the Tawk.to widget in place. */
export function ContactLauncher({ lang }: { lang: "en" | "ms" }) {
  const t = copy[lang];
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [unread, setUnread] = useState(0);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [offline, setOffline] = useState(false);
  const [noteDismissed, setNoteDismissed] = useState(true);
  const [nudge, setNudge] = useState(false);
  const [summariesOff, setOff] = useState(false);
  /* The dock shows either the contact icons or, after the games icon is pressed,
     an icon for each game. The game panel above it plays whichever is lit. */
  const [mode, setMode] = useState<"contact" | "games">("contact");
  const [game, setGame] = useState<GameId | null>(null);
  /* The account panel takes the game panel's place above the dock. */
  const [accountOpen, setAccountOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  /* Where the ball sat when the arcade grew out of it; null while the arcade is shut. */
  const [arcade, setArcade] = useState<{ x: number; y: number } | null>(null);
  const plusRef = useRef<HTMLButtonElement>(null);
  const prevUser = useRef<string | null>(null);
  const [bests, setBests] = useState<Record<GameId, number>>(() => Object.fromEntries(GAME_ORDER.map((id) => [id, 0])) as Record<GameId, number>);
  const deckInner = useRef<HTMLDivElement>(null);
  const [deckWidth, setDeckWidth] = useState(0);
  const swapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const loadBests = () => Object.fromEntries(GAME_ORDER.map((id) => [id, loadBest(id)])) as Record<GameId, number>;
  const closeGame = useCallback(() => setGame(null), []);
  const closeAccount = useCallback(() => setAccountOpen(false), []);
  /* All games hand guests over to the existing account panel. */
  const openAccount = useCallback(() => {
    setGame(null);
    setAccountOpen(true);
  }, []);
  const root = useRef<HTMLDivElement>(null);
  const hideNudge = useCallback(() => setNudge(false), []);

  useEffect(() => subscribeTawkUnread(setUnread), []);
  useEffect(() => subscribeNotices(setNotices), []);

  /* Someone who signed in before is recognised on arrival; everyone else only
     starts listening once they open the games, so the auth client stays out of
     the way of visitors who never play. */
  const [watching, setWatching] = useState(false);
  useEffect(() => {
    if (!accountsEnabled) return;
    if (hasAccountHint()) {
      const timer = setTimeout(() => setWatching(true), 2500);
      return () => clearTimeout(timer);
    }
  }, []);
  useEffect(() => (watching ? watchAccount(setUsername) : undefined), [watching]);

  /* A sign-in merges saved scores into this browser's; the icons' tooltips follow. */
  useEffect(() => {
    const refresh = () =>
      setBests(loadBests());
    window.addEventListener(SCORES_EVENT, refresh);
    return () => window.removeEventListener(SCORES_EVENT, refresh);
  }, []);

  /* Read after mount so server and client markup match; then follow changes made
     from a summary's own "Turn off" link. */
  useEffect(() => {
    const first = setTimeout(() => setOff(getSummariesOff()), 0);
    const stop = subscribeSummariesOff(setOff);
    return () => {
      clearTimeout(first);
      stop();
    };
  }, []);

  /* A bubble that points at the plus button, to tell a visitor the dock is there
     and tappable. Once per tab session: it appears after a few quiet seconds,
     goes away by itself, and never comes back after they have seen it. */
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(NUDGE_KEY) === "1";
    } catch {
      /* Storage blocked: it may show again on the next page, which is harmless. */
    }
    if (seen) return;

    let hide: ReturnType<typeof setTimeout>;
    const show = setTimeout(() => {
      setNudge(true);
      try {
        sessionStorage.setItem(NUDGE_KEY, "1");
      } catch {
        /* Same as above. */
      }
      hide = setTimeout(() => setNudge(false), 12000);
    }, 6000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  /* Joins the presence channel once the page has settled, so it never competes
     with first paint. The count only means anything if every visitor joins, not
     just the ones who open the deck. */
  useEffect(() => {
    if (!presenceEnabled) return;
    let stop = () => {};
    let gone = false;
    const timer = setTimeout(() => {
      stop = watchOnlineCount(setOnline);
      loadTotalVisitors().then((n) => {
        if (!gone) setTotal(n);
      });
    }, 2500);
    return () => {
      gone = true;
      clearTimeout(timer);
      stop();
    };
  }, []);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    if (!announcement) return;
    const { id } = announcement;
    /* Read after mount, not during render, so server and client markup match. */
    const timer = setTimeout(() => {
      try {
        setNoteDismissed(localStorage.getItem(DISMISSED_KEY) === id);
      } catch {
        setNoteDismissed(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  /* The pill shrinks to a circle, and only then are its contents swapped and it
     grows again, so the change of icons happens while nothing is on show. */
  const closeAll = useCallback(() => {
    clearTimeout(swapTimer.current);
    setOpen(false);
    setGame(null);
    setAccountOpen(false);
    swapTimer.current = setTimeout(() => setMode("contact"), COLLAPSE_MS);
  }, []);

  const openGames = useCallback((first: GameId | null) => {
    clearTimeout(swapTimer.current);
    setGame(null);
    setAccountOpen(false);
    setOpen(false);
    setWatching(true);
    swapTimer.current = setTimeout(() => {
      setBests(loadBests());
      setMode("games");
      swapTimer.current = setTimeout(() => {
        setGame(first);
        setOpen(true);
      }, SWAP_PAUSE_MS);
    }, COLLAPSE_MS);
  }, []);

  /* Signed-in players get a screen of their own for games. The pill shrinks to
     a ball, and the arcade grows out of the ball's exact spot. Already shut, there
     is nothing to shrink, so it starts at once. */
  const enterArcade = useCallback(() => {
    clearTimeout(swapTimer.current);
    setNudge(false);
    setGame(null);
    setAccountOpen(false);
    const wait = open ? COLLAPSE_MS : 0;
    setOpen(false);
    swapTimer.current = setTimeout(() => {
      const box = plusRef.current?.getBoundingClientRect();
      setArcade({ x: box ? box.left + box.width / 2 : window.innerWidth / 2, y: box ? box.top + box.height / 2 : window.innerHeight - 40 });
      setMode("contact");
    }, wait);
  }, [open]);

  const leaveArcade = useCallback(() => {
    setArcade(null);
    plusRef.current?.focus();
  }, []);

  /* Signing in from the account panel is what opens it; a session that merely
     turns up on arrival (a returning player) does not. */
  useEffect(() => {
    if (username && prevUser.current === null && accountOpen) enterArcade();
    prevUser.current = username;
  }, [username, accountOpen, enterArcade]);

  useEffect(() => () => clearTimeout(swapTimer.current), []);

  useEffect(() => {
    const el = deckInner.current;
    if (!el) return;
    const measure = () => setDeckWidth(el.offsetWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeAll();
    }
    function onPointer(e: PointerEvent) {
      if (game !== null || accountOpen) return;
      if (root.current && !root.current.contains(e.target as Node)) closeAll();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, closeAll, game, accountOpen]);

  function dismissAnnouncement() {
    setNoteDismissed(true);
    try {
      if (announcement) localStorage.setItem(DISMISSED_KEY, announcement.id);
    } catch {
      /* Storage blocked: the note simply comes back next visit. */
    }
  }

  const showNote = Boolean(announcement) && !noteDismissed;
  /* What earns a dot on the closed dock: things that want attention, not the
     visitor count, which is always there. */
  const attention = unread + notices.length + (showNote ? 1 : 0) + (offline ? 1 : 0);

  const item =
    "group relative flex h-11 w-11 items-center justify-center rounded-full bg-white/45 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy";
  /* Green brand icons turn black on an amber tile; the black icon flips to a
     black tile with a yellow icon. */
  const onGreen = "hover:bg-amber-400 focus-visible:bg-amber-400";
  const onBlack = "hover:bg-navy focus-visible:bg-navy";
  const iconGreen = "h-6 w-6 transition-colors duration-150 group-hover:text-navy group-focus-visible:text-navy";
  const iconBlack = "h-6 w-6 text-navy transition-colors duration-150 group-hover:text-amber-400 group-focus-visible:text-amber-400";
  const tip =
    "pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy px-2 py-1 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100";
  const dot = "absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-navy";
  const row = "flex items-start gap-2.5 rounded-xl bg-white/50 p-2.5 text-[13px] leading-snug text-navy";
  const rowClose =
    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-navy hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy";

  return (
    <div ref={root} inert={arcade !== null} className={`pointer-events-none fixed inset-x-0 bottom-4 flex flex-col items-end gap-2 px-4 sm:items-center ${game ? "z-[60]" : "z-40"}`}>
      <SectionSummary lang={lang} suspended={open || game !== null || accountOpen} onShow={hideNudge} />

      {(game || arcade) && <AchievementToasts lang={lang} />}
      {game && <MiniGames lang={lang} game={game} username={username} onClose={closeGame} onAccount={openAccount} />}
      {accountOpen && <AccountPanel lang={lang} username={username} onClose={closeAccount} />}
      {arcade &&
        createPortal(<Arcade lang={lang} username={username} online={online} origin={arcade} onExit={leaveArcade} />, document.body)}

      {nudge && !open && (
        <div className="rise-in pointer-events-auto relative flex items-center gap-1 rounded-2xl bg-navy py-1 pl-3.5 pr-1 shadow-lg">
          <button
            type="button"
            className="py-1.5 text-left text-[13px] font-bold text-white focus-visible:outline-none focus-visible:underline"
            onClick={() => {
              setNudge(false);
              setOpen(true);
            }}
          >
            {t.nudge}
          </button>
          <button
            type="button"
            aria-label={t.dismiss}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            onClick={() => setNudge(false)}
          >
            <TbX aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
          {/* The tail sits over the plus button: 28px in from the right on a
              phone, where the dock is at the right, and centred from sm up. */}
          <span
            aria-hidden="true"
            className="absolute -bottom-1 right-[22px] h-3 w-3 rotate-45 bg-navy sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
          />
        </div>
      )}

      {open && mode === "contact" && (
        <div
          role="region"
          aria-label={lang === "ms" ? "Notifikasi" : "Notifications"}
          style={{ animationDelay: "150ms" }}
          className="rise-in pointer-events-auto flex w-fit max-w-sm flex-col gap-2 liquid-glass rounded-3xl p-2"
        >
          {online !== null && (
            <p className="flex items-center gap-2 px-2.5 py-1 text-[13px] font-bold text-navy">
              <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#25D366]" />
              </span>
              <span role="status">{t.online(online)}</span>
            </p>
          )}

          {total !== null && (
            <p className="flex items-center gap-2 px-2.5 py-1 text-[13px] font-bold text-navy">
              <TbUsers aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span>{t.total(total)}</span>
            </p>
          )}

          {offline && (
            <div role="alert" className={row}>
              <span className="flex-1">{t.offline}</span>
              <button
                type="button"
                className="shrink-0 rounded-full bg-amber-400 px-2.5 py-1 text-[11.5px] font-bold hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                onClick={() => openGames("space")}
              >
                {t.playOffline}
              </button>
            </div>
          )}

          {showNote && announcement && (
            <div className={row}>
              <p className="flex-1">{announcement[lang]}</p>
              <button type="button" aria-label={t.dismiss} className={rowClose} onClick={dismissAnnouncement}>
                <TbX aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {unread > 0 && (
            <button
              type="button"
              className={`${row} w-full text-left font-bold transition-colors hover:bg-amber-400`}
              onClick={() => {
                setOpen(false);
                openTawkChat();
              }}
            >
              <TbMessageCircle aria-hidden="true" className="mt-px h-4 w-4 shrink-0" />
              <span className="flex-1">{t.unread(unread)}</span>
            </button>
          )}

          {notices.map((n) => (
            <div key={n.id} role={n.tone === "error" ? "alert" : "status"} className={row}>
              <p className="flex-1">{n.text}</p>
              <button type="button" aria-label={t.dismiss} className={rowClose} onClick={() => dismissNotice(n.id)}>
                <TbX aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            role="switch"
            aria-checked={!summariesOff}
            className="flex items-center justify-between gap-6 rounded-xl px-2.5 py-1.5 text-left text-[13px] font-bold text-navy transition-colors hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            onClick={() => setSummariesOff(!summariesOff)}
          >
            <span>{t.summaries}</span>
            <span
              aria-hidden="true"
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${summariesOff ? "bg-navy/25" : "bg-amber-400"}`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left] ${summariesOff ? "left-0.5" : "left-[18px]"}`}
              />
            </span>
          </button>
        </div>
      )}

      <div
        role="group"
        aria-label={t.title}
        className="pointer-events-auto flex items-center liquid-glass rounded-full p-1.5"
      >
        {/* Width, not display, so the circle grows into a pill. Nothing is
            clipped (the tooltips sit above the dock); closed icons are faded and
            inert instead, which also keeps them out of the tab order. */}
        <div
          id="contact-deck"
          inert={!open}
          /* The icons are wider than the pill while it is still growing or
             shrinking, and with nothing clipping them they were drawn outside
             it. They are clipped to the pill's own width the whole time it
             moves; only the room above and below is left open, for the
             tooltips. Once it has finished opening the sides are freed too,
             so a tooltip wider than its icon is not cut off. */
          style={{
            maxWidth: open ? deckWidth : 0,
            clipPath: open ? "inset(-64px -90px -12px -90px)" : "inset(-64px 0px -12px 0px)",
            transition: `max-width ${DOCK_MS}ms ease-in-out, opacity ${DOCK_MS}ms ease-in-out, margin ${DOCK_MS}ms ease-in-out, clip-path 0s linear ${open ? DOCK_MS : 0}ms`,
          }}
          className={open ? "mx-1 mr-2 opacity-100" : "mx-0 opacity-0"}
        >
          <div ref={deckInner} className="flex w-max items-center gap-2">
          {mode === "contact" ? (
            <>
          <a
            href={wa(waMessages.hero)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.wa}
            className={`${item} ${onGreen}`}
            onClick={() => setOpen(false)}
          >
            <SiWhatsapp aria-hidden="true" className={`${iconGreen} text-[#25D366]`} />
            <span aria-hidden="true" className={tip}>{t.wa}</span>
          </a>
          <a href="mailto:zakrulabd@gmail.com" aria-label={t.email} className={`${item} ${onBlack}`} onClick={() => setOpen(false)}>
            <TbMail aria-hidden="true" className={iconBlack} />
            <span aria-hidden="true" className={tip}>{t.email}</span>
          </a>
          {tawkEnabled && (
            <button
              type="button"
              aria-label={unread > 0 ? `${t.chat} (${t.unread(unread)})` : t.chat}
              className={`${item} ${onGreen}`}
              onClick={() => {
                setOpen(false);
                openTawkChat();
              }}
            >
              <TbMessageCircle aria-hidden="true" className={`${iconGreen} text-[#03A84E]`} />
              {unread > 0 && <span aria-hidden="true" className={dot} />}
              <span aria-hidden="true" className={tip}>{t.chat}</span>
            </button>
          )}
          <button
            type="button"
            aria-label={t.games}
            className={`${item} ${onGreen}`}
            onClick={() => (username ? enterArcade() : openGames("space"))}
          >
            <TbDeviceGamepad2 aria-hidden="true" className={`${iconGreen} text-[#8b5cf6]`} />
            <span aria-hidden="true" className={tip}>{t.games}</span>
          </button>
            </>
          ) : (
            <div className="flex shrink-0 items-center gap-2 py-1">
            {DECK_GAMES.map((id) => {
              const Icon = gameIcons[id];
              const label = bestText(lang, id, bests[id]);
              const active = game === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-label={label}
                  aria-pressed={active}
                  className={`${item} h-10! w-10! shrink-0 ${active ? "bg-amber-400" : onGreen}`}
                  onClick={() => {
                    setAccountOpen(false);
                    setGame(id);
                  }}
                >
                  <Icon
                    aria-hidden="true"
                    className={`h-6 w-6 transition-colors duration-150 group-hover:text-navy group-focus-visible:text-navy ${active ? "text-navy" : "text-[#8b5cf6]"}`}
                  />
                  <span aria-hidden="true" className={tip}>{label}</span>
                </button>
              );
            })}
            </div>
          )}
          {mode === "games" && accountsEnabled && (
            <>
              <span aria-hidden="true" className="h-7 w-px bg-navy/15" />
              <button
                type="button"
                aria-label={username ? t.accountAs(username) : t.account}
                aria-pressed={accountOpen}
                className={`${item} h-10! w-10! ${accountOpen ? "bg-amber-400" : onBlack}`}
                onClick={() => {
                  setGame(null);
                  setAccountOpen((v) => !v);
                }}
              >
                <TbUser
                  aria-hidden="true"
                  className={`h-6 w-6 transition-colors duration-150 ${accountOpen ? "text-navy" : "text-navy group-hover:text-amber-400 group-focus-visible:text-amber-400"}`}
                />
                {username && <span aria-hidden="true" className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-[#25D366]" />}
                <span aria-hidden="true" className={tip}>{username ? t.accountAs(username) : t.account}</span>
              </button>
            </>
          )}
          <span aria-hidden="true" className="h-7 w-px bg-navy/15" />
          </div>
        </div>
        <button
          ref={plusRef}
          type="button"
          aria-label={open ? t.close : attention > 0 ? `${t.open} (${attention})` : t.open}
          aria-expanded={open}
          aria-controls="contact-deck"
          onClick={() => {
            setNudge(false);
            if (open) {
              closeAll();
            } else {
              clearTimeout(swapTimer.current);
              setMode("contact");
              setOpen(true);
            }
          }}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400 text-navy transition-colors hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
        >
          <TbPlus aria-hidden="true" className={`h-6 w-6 transition-transform duration-500 ease-in-out ${open ? "rotate-45" : ""}`} />
          {!open && attention > 0 && <span aria-hidden="true" className={dot} />}
        </button>
      </div>
    </div>
  );
}
