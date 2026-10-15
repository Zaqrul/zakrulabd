"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { TbMail, TbMessageCircle, TbPlus, TbUsers, TbX } from "react-icons/tb";
import { SectionSummary } from "@/components/section-summary";
import { openTawkChat, subscribeTawkUnread, tawkEnabled } from "@/components/tawk-widget";
import { wa, waMessages } from "@/lib/contact";
import { announcement, dismissNotice, subscribeNotices, type Notice } from "@/lib/notices";
import { loadTotalVisitors, presenceEnabled, watchOnlineCount } from "@/lib/presence";
import { getSummariesOff, setSummariesOff, subscribeSummariesOff } from "@/lib/summary-pref";

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
  },
};

const DISMISSED_KEY = "announcement-dismissed";
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
  const root = useRef<HTMLDivElement>(null);
  const hideNudge = useCallback(() => setNudge(false), []);

  useEffect(() => subscribeTawkUnread(setUnread), []);
  useEffect(() => subscribeNotices(setNotices), []);

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

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointer(e: PointerEvent) {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

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
    <div ref={root} className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex flex-col items-end gap-2 px-4 sm:items-center">
      <SectionSummary lang={lang} suspended={open} onShow={hideNudge} />

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

      {open && (
        <div
          role="region"
          aria-label={lang === "ms" ? "Notifikasi" : "Notifications"}
          className="pointer-events-auto flex w-fit max-w-sm flex-col gap-2 liquid-glass rounded-3xl p-2"
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
            <p role="alert" className={row}>
              <span className="flex-1">{t.offline}</span>
            </p>
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
          className={`flex items-center gap-2 transition-[max-width,opacity,margin] duration-300 ease-out ${
            open ? "mx-1 mr-2 max-w-64 opacity-100" : "mx-0 max-w-0 opacity-0"
          }`}
        >
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
          <span aria-hidden="true" className="h-7 w-px bg-navy/15" />
        </div>
        <button
          type="button"
          aria-label={open ? t.close : attention > 0 ? `${t.open} (${attention})` : t.open}
          aria-expanded={open}
          aria-controls="contact-deck"
          onClick={() => {
            setNudge(false);
            setOpen((v) => !v);
          }}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-400 text-navy transition-colors hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
        >
          <TbPlus aria-hidden="true" className={`h-6 w-6 transition-transform duration-200 ${open ? "rotate-45" : ""}`} />
          {!open && attention > 0 && <span aria-hidden="true" className={dot} />}
        </button>
      </div>
    </div>
  );
}
