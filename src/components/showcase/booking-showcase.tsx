"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Hanken_Grotesk, Instrument_Serif } from "next/font/google";
import { PiArrowLeft, PiCaretLeft, PiCaretRight, PiCheck, PiHeart, PiHeartFill, PiMinus, PiPlus, PiX } from "react-icons/pi";
import { wa, waMessages } from "@/lib/contact";
import {
  CAPACITY,
  addDays,
  addOns,
  banks,
  clock12,
  dateOf,
  daysBetween,
  demoGallery,
  eventsBooked,
  keyOf,
  longDate,
  monthName,
  pad,
  photo,
  photos,
  rand,
  rm,
  sessionBy,
  sessions,
  shortDate,
  slotsFor,
  zones,
  type Photo,
  type Session,
  type ZoneId,
} from "@/components/showcase/booking-data";
import { RevealText } from "@/components/reveal-text";

/* The client's own brand, not the portfolio's: photographers sell with their
   pictures, so the site is quiet around them. An editorial serif for the
   voice, a plain grotesk for the form, warm paper and ink, square corners,
   and no colour that competes with the photos. */
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-bk-serif" });
const sans = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-bk-sans" });

/* Today, from the browser. The server renders without it, and nothing that
   depends on it is on screen before the visitor has interacted. */
const noop = () => () => {};
const useToday = () =>
  useSyncExternalStore(
    noop,
    () => keyOf(new Date()),
    () => null,
  );

type Mode = "client" | "studio";
type Step = 1 | 2 | 3 | 4 | 5;
type Pay = "fpx" | "duitnow" | "transfer";

type Draft = {
  session: string | null;
  date: string | null;
  time: string | null;
  where: "studio" | "outdoor";
  zone: ZoneId;
  extras: Record<string, number>;
  name: string;
  phone: string;
  email: string;
  venue: string;
  /* A Google Maps or Waze link, as well as or instead of the address. */
  venueLink: string;
  notes: string;
  pay: Pay;
  bank: string;
  receipt: string | null;
  agree: boolean;
};

const blank: Draft = {
  session: null,
  date: null,
  time: null,
  where: "studio",
  zone: "kv",
  extras: {},
  name: "",
  phone: "",
  email: "",
  venue: "",
  venueLink: "",
  notes: "",
  pay: "fpx",
  bank: banks[0],
  receipt: null,
  agree: false,
};

/* The life of a booking, in order. Each stage is where the booking is now:
   waiting for the deposit, waiting for the day, being edited, out for the
   client to review, delivered and waiting for the final payment, paid, and
   closed. The final payment comes after the gallery, which is how most
   photographers here settle the balance. */
type Stage = "deposit" | "attend" | "editing" | "review" | "delivered" | "paid" | "closed";

const stages: Stage[] = ["deposit", "attend", "editing", "review", "delivered", "paid", "closed"];

const stageLabel: Record<Stage, string> = {
  deposit: "Collect deposit",
  attend: "Attend event",
  editing: "Editing",
  review: "Review",
  delivered: "Gallery delivered",
  paid: "Final payment",
  closed: "Closed",
};

const stageStyle: Record<Stage, string> = {
  deposit: "bg-[#fbecd8] text-[#8a4b12]",
  attend: "bg-[#efe9df] text-[#5b5348]",
  editing: "bg-[#efe9df] text-[#5b5348]",
  review: "bg-[#e7edf4] text-[#2d4a6b]",
  delivered: "bg-[#fbecd8] text-[#8a4b12]",
  paid: "bg-[#e6efe6] text-[#2f5a35]",
  closed: "bg-[#efeeeb] text-[#7a746b]",
};

type Booking = {
  ref: string;
  session: string;
  date: string;
  time: string;
  client: string;
  place: string;
  status: Stage;
  total: number;
  paid: number;
  /* How the deposit came in, for bookings made in this visit. */
  method?: Pay;
  /* When a stage was reached by hand in this visit, overriding the
     generated timeline. */
  log?: Partial<Record<Stage, string>>;
  /* Final-payment reminders sent by hand in this visit. */
  nudged?: string[];
};

const methodLabel: Record<Pay, string> = { fpx: "FPX", duitnow: "DuitNow QR", transfer: "Bank transfer" };

/* Books close three days ahead and open twelve months out. */
const LEAD_DAYS = 3;
const HORIZON_MONTHS = 12;

const needsTravel = (s: Session, d: Draft) => s.where === "venue" || s.where === "outdoor" || (s.where === "studio-or-outdoor" && d.where === "outdoor");

function quote(d: Draft) {
  if (!d.session) return null;
  const s = sessionBy(d.session);
  const lines: { label: string; amount: number }[] = [{ label: s.name, amount: s.price }];
  for (const id of s.addOns) {
    const q = d.extras[id] ?? 0;
    if (q > 0) {
      const a = addOns[id];
      lines.push({ label: a.per ? `${a.label} × ${q}` : a.label, amount: a.price * q });
    }
  }
  const zone = zones.find((z) => z.id === d.zone)!;
  if (needsTravel(s, d) && zone.price) lines.push({ label: `Travel, ${zone.label}`, amount: zone.price });
  const total = lines.reduce((n, l) => n + l.amount, 0);
  const deposit = Math.min(s.deposit, total);
  return { s, lines, total, deposit, balance: total - deposit };
}

/* The photographer's bookings are generated from the same availability the
   client's calendar reads, so a date that shows as booked to a client has a
   wedding on it here. Names and places are picked the same way every visit. */
const brides = ["Nadia", "Syafiqah", "Farah", "Izzati", "Hana", "Aisyah", "Nurin", "Balqis", "Sofea", "Alya", "Damia", "Qistina", "Liyana", "Amira", "Husna", "Batrisyia", "Insyirah", "Aina", "Wardah", "Syuhada"];
const grooms = ["Faris", "Amir", "Hakim", "Danial", "Luqman", "Irfan", "Haikal", "Zarif", "Adam", "Hafiz", "Rayyan", "Aiman", "Syahmi", "Khairul", "Fikri", "Iqbal", "Naim", "Arif", "Hazim", "Zikri"];
const firsts = ["Nurul Aisyah", "Muhammad Danish", "Siti Khadijah", "Ahmad Zaki", "Priya Nair", "Hidayah Kamal", "Aqil Hakimi", "Nur Farhana", "Mei Ling Tan", "Arjun Pillai", "Harith Iskandar", "Zulaikha Omar"];
const families = ["Rahman", "Ismail", "Lim", "Osman", "Yusof", "Chandran", "Hamid", "Tan", "Abdullah", "Razak"];
const businesses = ["Kek Mak Teh", "Kopi Kampung Co.", "Nasi Kerabu Kak Yah", "Sambal Opah", "Dapur Bonda Catering"];
const venues = ["Dewan Seri Alam, Shah Alam", "Masjid Al-Hidayah, Subang", "Laman Kayangan, Kuala Selangor", "Dewan Orang Ramai, Ipoh", "Dewan Serbaguna, Bangi", "Rumah pengantin, Klang", "Masjid Negeri, Shah Alam", "Dewan Komuniti, Seremban"];
const outdoor = ["Taman Tasik Titiwangsa", "Putrajaya Botanical Garden", "Tasik Shah Alam", "Bukit Tabur trailhead"];
const campuses = ["Universiti Malaya", "UiTM Shah Alam", "UKM Bangi", "UPM Serdang"];

const pick = <T,>(xs: T[], seed: string) => xs[Math.floor(rand(seed) * xs.length)];

/* When each stage was, or will be, reached. The same every visit for a
   given booking. A few clients pay the final balance late, and a few very
   late, which is what the reminders are for. */
function timeline(b: Pick<Booking, "ref" | "session" | "date">): Record<Stage, string> {
  const ev = sessionBy(b.session).kind === "event";
  const r = (s: string) => rand(`${s}:${b.ref}`);
  const deposit = addDays(b.date, -(14 + Math.floor(r("pd") * 120)));
  const review = addDays(b.date, ev ? 10 + Math.floor(r("pe") * 8) : 2 + Math.floor(r("pe") * 3));
  const delivered = addDays(review, ev ? 3 + Math.floor(r("pr") * 4) : 1 + Math.floor(r("pr") * 2));
  const late = r("pp");
  const paid = addDays(delivered, late < 0.78 ? Math.floor(late * 8) : late < 0.93 ? 9 + Math.floor(late * 8) : 25 + Math.floor(late * 30));
  return { deposit: addDays(deposit, -2), attend: deposit, editing: b.date, review, delivered, paid, closed: addDays(paid, 1 + Math.floor(r("pc") * 3)) };
}

function stageFor(base: Pick<Booking, "ref" | "session" | "date" | "total">, today: string): Pick<Booking, "status" | "paid"> {
  const s = sessionBy(base.session);
  const deposit = Math.min(s.deposit, base.total);
  if (base.date > today) {
    /* Bank transfers waiting to be matched, on bookings made recently. */
    return rand(`bp:${base.ref}`) < 0.12 && daysBetween(today, base.date) < 21 ? { status: "deposit", paid: 0 } : { status: "attend", paid: deposit };
  }
  /* Today's and yesterday's shoots wait for the photographer to mark them. */
  if (base.date >= addDays(today, -1)) return { status: "attend", paid: deposit };
  const tl = timeline(base);
  const reached = (["closed", "paid", "delivered", "review", "editing"] as Stage[]).find((st) => tl[st] <= today) ?? "editing";
  return { status: reached, paid: reached === "paid" || reached === "closed" ? base.total : deposit };
}

/* A booking as it stands, with this visit's changes laid over it. */
const withPatch = (b: Booking, p?: Partial<Booking>): Booking => (p ? { ...b, ...p, log: { ...b.log, ...p.log }, nudged: p.nudged ?? b.nudged } : b);

/* The date a stage was reached, from this visit's changes or the timeline. */
const reachedOn = (b: Booking, st: Stage) => b.log?.[st] ?? timeline(b)[st];

function bookingsOn(k: string, today: string): Booking[] {
  const out: Booking[] = [];
  for (let i = 0; i < eventsBooked(k); i++) {
    const seed = `${k}:e${i}`;
    const r = rand(`bs:${seed}`);
    const s = sessionBy(r < 0.4 ? "sanding" : r < 0.65 ? "nikah" : r < 0.8 ? "both" : r < 0.95 ? "tunang" : "prewed");
    const total = s.price + (rand(`bx:${seed}`) < 0.45 ? 450 : 0) + (rand(`by:${seed}`) < 0.3 ? 250 : 0);
    const base = { ref: `TDH-${k.slice(2).replace(/-/g, "")}${i + 1}`, session: s.id, date: k, total };
    out.push({
      ...base,
      time: pick(s.starts!, `bt:${seed}`).time,
      client: `${pick(brides, `bb:${seed}`)} & ${pick(grooms, `bg:${seed}`)}`,
      place: s.where === "outdoor" ? pick(outdoor, `bv:${seed}`) : pick(venues, `bv:${seed}`),
      ...stageFor(base, today),
    });
  }
  /* Up to two studio or campus sessions on days the studio is open. */
  if (dateOf(k).getDay() !== 2) {
    const n = Math.floor(rand(`sn:${k}`) * 3);
    const used = new Set<string>();
    for (let j = 0; j < n; j++) {
      const seed = `${k}:s${j}`;
      const s = sessionBy(pick(["konvo", "konvo", "family", "portrait", "product"], `ss:${seed}`));
      const free = slotsFor(s, k).filter((x) => x.taken && !used.has(x.time));
      if (!free.length) continue;
      const time = pick(free, `st:${seed}`).time;
      used.add(time);
      const away = s.where === "studio-or-outdoor" && rand(`sw:${seed}`) < 0.4;
      const base = { ref: `TDH-${k.slice(2).replace(/-/g, "")}${j + 5}`, session: s.id, date: k, total: s.price + (rand(`bx:${seed}`) < 0.4 ? 60 : 0) };
      out.push({
        ...base,
        time,
        client: s.id === "product" ? pick(businesses, `bc:${seed}`) : s.id === "family" ? `Keluarga ${pick(families, `bc:${seed}`)}` : pick(firsts, `bc:${seed}`),
        place: away ? (s.id === "konvo" ? pick(campuses, `bv:${seed}`) : pick(outdoor, `bv:${seed}`)) : "Studio, Seksyen 13",
        ...stageFor(base, today),
      });
    }
  }
  return out;
}

function bookingsBetween(from: string, to: string, today: string) {
  const out: Booking[] = [];
  for (let k = from; k <= to; k = addDays(k, 1)) out.push(...bookingsOn(k, today));
  return out;
}

const byTime = (a: Booking, b: Booking) => (a.date + a.time).localeCompare(b.date + b.time);

const card = "border border-[#e3ddd3] bg-white";
const label = "mb-1.5 block text-[13px] font-medium text-[#4a443c]";
const field = "w-full border border-[#d8d1c5] bg-white px-3 py-2.5 text-[15px] text-[#1d1b18] outline-none placeholder:text-[#a59d91] focus:border-[#1d1b18]";
const btnInk = "inline-flex items-center justify-center gap-2 bg-[#1d1b18] px-6 py-3 text-[14.5px] font-medium text-[#f7f4ef] hover:bg-[#3a352e] disabled:cursor-not-allowed disabled:opacity-35";
const btnLine = "inline-flex items-center justify-center gap-2 border border-[#1d1b18]/25 px-5 py-3 text-[14.5px] font-medium hover:border-[#1d1b18]";

const h2 = "font-[family-name:var(--font-bk-serif)] text-[28px] leading-tight";

type Page = "book" | "gallery" | "about" | "gear" | "faq";

const pages: { id: Page; label: string }[] = [
  { id: "book", label: "Book a session" },
  { id: "gallery", label: "Gallery" },
  { id: "about", label: "About me" },
  { id: "gear", label: "Equipment" },
  { id: "faq", label: "FAQ" },
];

export function BookingShowcase() {
  const today = useToday();
  const [mode, setMode] = useState<Mode>("client");
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<Draft>(blank);
  /* Bookings made in the client view, and changes the photographer makes;
     everything else on the calendar is generated. */
  const [extra, setExtra] = useState<Booking[]>([]);
  const [patches, setPatches] = useState<Record<string, Partial<Booking>>>({});
  const [made, setMade] = useState<Booking | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  /* The session under the pointer in the list, shown in the side photo. */
  const [preview, setPreview] = useState<string | null>(null);
  const [page, setPage] = useState<Page>("book");
  const seq = useRef(432);
  const cardRef = useRef<HTMLDivElement>(null);


  const q = quote(draft);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  /* On a phone the next step can start below the fold; bring the card's top
     back into view when it does. */
  function go(s: Step) {
    setStep(s);
    requestAnimationFrame(() => {
      const top = cardRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) cardRef.current?.scrollIntoView({ block: "start" });
    });
  }

  function pick(id: string) {
    setDraft((d) => (d.session === id ? d : { ...d, session: id, date: null, time: null, extras: {}, where: sessionBy(id).where === "outdoor" ? "outdoor" : "studio" }));
    setPreview(null);
    go(2);
  }

  function pay() {
    if (!q || !draft.date || !draft.time || !today) return;
    const d = dateOf(today);
    const ref = `TDH-${String(d.getFullYear()).slice(2)}${pad(d.getMonth() + 1)}-${seq.current++}`;
    const b: Booking = {
      ref,
      session: q.s.id,
      date: draft.date,
      time: draft.time,
      client: draft.name.trim(),
      place: placeOf(q.s, draft),
      status: draft.pay === "transfer" ? "deposit" : "attend",
      log: draft.pay === "transfer" ? { deposit: today } : { deposit: today, attend: today },
      total: q.total,
      paid: draft.pay === "transfer" ? 0 : q.deposit,
      method: draft.pay,
    };
    setExtra((e) => [...e, b]);
    setMade(b);
    go(5);
  }

  function restart() {
    setDraft(blank);
    setMade(null);
    go(1);
  }

  return (
    <div className={`${serif.variable} ${sans.variable} min-h-screen bg-[#f7f4ef] font-[family-name:var(--font-bk-sans)] text-[#1d1b18] antialiased`}>
      {/* Showcase frame: says plainly that this is a demo, leads back, and
          switches between the client's view and the photographer's. */}
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 bg-navy px-4 py-2 text-[12.5px] text-white/80">
        <Link href="/" className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-amber-400">
          <PiArrowLeft aria-hidden className="h-3.5 w-3.5" /> Back to Zakrul
        </Link>
        <div role="group" aria-label="View as" className="flex items-center gap-2">
          <span className="hidden sm:inline">View as</span>
          <div className="flex overflow-hidden rounded-full bg-white/10 p-0.5">
            {(
              [
                ["client", "Client"],
                ["studio", "Photographer"],
              ] as const
            ).map(([id, text]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMode(id);
                  window.scrollTo({ top: 0 });
                }}
                aria-pressed={mode === id}
                className={`rounded-full px-3 py-1 font-semibold ${mode === id ? "bg-white text-navy" : "text-white/80 hover:text-white"}`}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
        <a href={wa(waMessages.booking)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-amber-400 px-3 py-0.5 font-bold text-navy hover:bg-amber-300">
          Build a booking system like this
        </a>
      </div>

      {mode === "client" ? (
        <main className="mx-auto max-w-[1048px] px-4 py-8 md:py-14">
          <header className="mb-5 flex flex-wrap items-baseline justify-between gap-2 md:pl-12">
            <span className="font-[family-name:var(--font-bk-serif)] text-[30px] leading-none">Teduh</span>
            <span className="text-[13px] text-[#6f675d]">Wedding and portrait photography, Shah Alam</span>
          </header>

          {/* The site reads like a book: bookmarks stick out of the card's left
              edge, one per section. On a phone they sit along the top instead. */}
          <div className="md:relative md:pl-12">
            <nav aria-label="Teduh" className="relative z-10 -mx-4 -mb-px flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] md:absolute md:left-0 md:top-10 md:mx-0 md:mb-0 md:flex-col md:gap-2 md:overflow-visible md:px-0">
              {pages.map((p) => {
                const on = page === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPage(p.id)}
                    aria-current={on ? "page" : undefined}
                    className={`flex-shrink-0 whitespace-nowrap border border-[#e3ddd3] px-4 py-2.5 text-[13.5px] font-medium md:rounded-l-md md:border-r-0 md:px-0 md:py-5 ${
                      on ? "rounded-t-md border-b-white bg-white text-[#1d1b18] md:w-[49px] md:border-b-[#e3ddd3]" : "rounded-t-md bg-[#ebe4d8] text-[#6f675d] hover:bg-[#f2ede5] hover:text-[#1d1b18] md:w-12"
                    } md:rounded-tr-none`}
                  >
                    <span className="inline-block md:rotate-180 md:[writing-mode:vertical-rl]">{p.label}</span>
                  </button>
                );
              })}
            </nav>

            <div ref={cardRef} className="scroll-mt-14 border border-[#e3ddd3] bg-white md:min-h-[640px]">
              {page === "book" && (
                /* What is being booked on the left, one step on the right. */
                <div className="grid md:min-h-[640px] md:grid-cols-[300px_minmax(0,1fr)]">
                  <Side draft={draft} step={step} made={made} preview={preview} onBack={() => go((step - 1) as Step)} />
                  <div className="min-w-0 p-5 sm:p-8">
                    {step === 1 && <SessionList selected={draft.session} onPick={pick} onPreview={setPreview} />}
                    {step === 2 && q && today && <DateStep today={today} draft={draft} s={q.s} extra={extra} set={set} setDraft={setDraft} onNext={() => go(3)} />}
                    {step === 3 && q && <DetailsStep draft={draft} s={q.s} set={set} setDraft={setDraft} onNext={() => go(4)} />}
                    {step === 4 && q && <DepositStep draft={draft} set={set} deposit={q.deposit} balance={q.balance} onPay={pay} />}
                    {step === 5 && made && today && (
                      <Confirmed
                        b={made}
                        today={today}
                        draft={draft}
                        balance={q?.balance ?? 0}
                        onAgain={restart}
                        onStudio={() => {
                          setMode("studio");
                          window.scrollTo({ top: 0 });
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
              {page === "gallery" && <GalleryPage made={made} say={setToast} />}
              {page === "about" && <AboutPage onBook={() => setPage("book")} />}
              {page === "gear" && <GearPage />}
              {page === "faq" && <FaqPage onBook={() => setPage("book")} />}
            </div>
          </div>

          <Credits />
        </main>
      ) : (
        today && (
          <StudioView
            today={today}
            extra={extra}
            patches={patches}
            highlight={made?.ref ?? null}
            onChange={(ref, patch, msg) => {
              setPatches((p) => ({ ...p, [ref]: { ...p[ref], ...patch } }));
              setToast(msg);
            }}
            onClient={() => {
              setMode("client");
              window.scrollTo({ top: 0 });
            }}
          />
        )
      )}

      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-5 left-1/2 z-50 max-w-[calc(100vw-32px)] -translate-x-1/2 bg-[#1d1b18] px-4 py-2.5 text-[13.5px] text-[#f7f4ef] shadow-lg transition duration-200 ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        {toast}
      </div>
    </div>
  );
}

const lengthOf = (s: Session) => (s.kind === "event" ? `${s.length} hours coverage` : `${s.length} minutes`);

function placeOf(s: Session, d: Draft) {
  if (s.where === "studio" || (s.where === "studio-or-outdoor" && d.where === "studio")) return "Studio, Seksyen 13";
  return d.venue.trim().replace(/\s*\n\s*/g, ", ") || (d.venueLink.trim() ? "Location link given" : zones.find((z) => z.id === d.zone)!.label);
}

/* The left column: the photographer, then what has been chosen so far, and
   the money at the bottom. */
function Side({ draft, step, made, preview, onBack }: { draft: Draft; step: Step; made: Booking | null; preview: string | null; onBack: () => void }) {
  const q = quote(draft);
  const s = q?.s;
  /* The session being pointed at in the list, else the one chosen. Every
     photo is stacked here, so switching is a crossfade, not a fresh load. */
  const shown = (step === 1 && preview) || s?.id || "sanding";
  /* While pointing at a session in the list, the whole column describes it. */
  const hover = step === 1 && preview ? sessionBy(preview) : null;
  return (
    <aside className="border-b border-[#e3ddd3] md:border-b-0 md:border-r">
      {/* The column runs the card's full height; its contents stay in view
          while the session grid scrolls past. */}
      <div className="md:sticky md:top-[41px]">
      <div className="relative hidden aspect-[3/2] overflow-hidden bg-[#e9e3d9] md:block">
        {sessions.map((x) => (
          <Image
            key={x.id}
            src={photo(x.photo, 800)}
            alt={x.id === shown ? x.photo.alt : ""}
            aria-hidden={x.id !== shown}
            fill
            sizes="300px"
            priority={x.id === shown}
            className={`object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none ${x.id === shown ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
      <div className="p-5 sm:p-6">
        {step > 1 && step < 5 && (
          <button type="button" onClick={onBack} className="mb-4 inline-flex w-fit items-center gap-1.5 text-[13.5px] text-[#6f675d] hover:text-[#1d1b18]">
            <PiArrowLeft aria-hidden className="h-3.5 w-3.5" /> Back
          </button>
        )}
        <p className="text-[13px] text-[#6f675d]">Aina Rahim · Teduh Studio</p>
        <p className="mt-1 font-[family-name:var(--font-bk-serif)] text-[26px] leading-tight">{hover ? hover.name : s ? s.name : "Book a session"}</p>
        {hover ? (
          <ul className="mt-4 space-y-1.5 text-[14px] text-[#4a443c]">
            <li>{lengthOf(hover)}</li>
            {hover.delivers.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        ) : s ? (
          <ul className="mt-4 space-y-1.5 text-[14px] text-[#4a443c]">
            <li>{lengthOf(s)}</li>
            {draft.date && (
              <li className="font-medium text-[#1d1b18]">
                {longDate(draft.date)}
                {draft.time && `, ${clock12(draft.time)}`}
              </li>
            )}
            {step >= 3 && <li className="line-clamp-2">{placeOf(s, draft)}</li>}
          </ul>
        ) : (
          <p className="mt-3 text-[14px] leading-relaxed text-[#4a443c]">Weddings across the Peninsular, and portrait sessions at the studio in Seksyen 13.</p>
        )}
        {(hover || q) && (
          <dl className="mt-6 space-y-1.5 border-t border-[#e3ddd3] pt-4 text-[14px]">
            {/* Once extras or travel are added, each gets its own line above
                the total, so the client sees what they are paying for. */}
            {!hover && q!.lines.length > 1 && (
              <div className="space-y-1 border-b border-[#e3ddd3] pb-2.5 text-[13px] text-[#6f675d]">
                {/* Long labels wrap; the amount always stays on one line. */}
                {q!.lines.map((l) => (
                  <div key={l.label} className="flex justify-between gap-4">
                    <dt className="min-w-0">{l.label}</dt>
                    <dd className="flex-shrink-0 whitespace-nowrap tabular-nums">{rm(l.amount)}</dd>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-[#4a443c]">{hover ? "Price" : "Total"}</dt>
              <dd className="flex-shrink-0 whitespace-nowrap tabular-nums">{rm(hover ? hover.price : q!.total)}</dd>
            </div>
            <div className="flex justify-between gap-4 font-medium">
              <dt>{!hover && made ? (made.status === "deposit" ? "Deposit, receipt sent" : "Deposit paid") : "Deposit to book"}</dt>
              <dd className="flex-shrink-0 whitespace-nowrap tabular-nums">{rm(hover ? hover.deposit : q!.deposit)}</dd>
            </div>
          </dl>
        )}
      </div>
      </div>
    </aside>
  );
}

function SessionList({ selected, onPick, onPreview }: { selected: string | null; onPick: (id: string) => void; onPreview: (id: string | null) => void }) {
  return (
    <>
      <h2 className={h2}><RevealText>Choose a session</RevealText></h2>
      {(["Weddings", "Sessions"] as const).map((g) => (
        <section key={g} className="mt-6">
          <h3 className="text-[12.5px] font-medium uppercase tracking-[0.08em] text-[#6f675d]">{g === "Sessions" ? "Portraits and sessions" : g}</h3>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
            {sessions
              .filter((s) => s.group === g)
              .map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onPick(s.id)}
                    onMouseEnter={() => onPreview(s.id)}
                    onMouseLeave={() => onPreview(null)}
                    onFocus={() => onPreview(s.id)}
                    onBlur={() => onPreview(null)}
                    className="group block w-full text-left"
                  >
                    <span
                      className={`relative block aspect-[4/3] overflow-hidden bg-[#e9e3d9] outline-offset-2 ${selected === s.id ? "outline outline-2 outline-[#1d1b18]" : ""}`}
                    >
                      <Image
                        src={photo(s.photo, 600)}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 200px, 45vw"
                        className="object-cover transition duration-300 ease-out motion-safe:group-hover:scale-[1.04]"
                      />
                    </span>
                    <span className="mt-2 block text-[14.5px] font-medium leading-snug group-hover:underline group-hover:underline-offset-2">{s.name}</span>
                    <span className="block text-[13px] tabular-nums text-[#6f675d]">
                      {lengthOf(s).replace(" coverage", "")} · {rm(s.price)}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function DateStep({
  today,
  draft,
  s,
  extra,
  set,
  setDraft,
  onNext,
}: {
  today: string;
  draft: Draft;
  s: Session;
  /* Bookings made in this visit, which take their date or slot. */
  extra: Booking[];
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  setDraft: (fn: (d: Draft) => Draft) => void;
  onNext: () => void;
}) {
  const t = dateOf(today);
  const first = { y: t.getFullYear(), m: t.getMonth() };
  const [view, setView] = useState(() => (draft.date ? { y: dateOf(draft.date).getFullYear(), m: dateOf(draft.date).getMonth() } : first));
  const offset = (view.y - first.y) * 12 + view.m - first.m;
  const opens = addDays(today, LEAD_DAYS);

  /* Monday-first grid for the month in view. */
  const lead = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((lead + days) / 7) * 7 }, (_, i) => {
    const n = i - lead + 1;
    return n < 1 || n > days ? null : keyOf(new Date(view.y, view.m, n));
  });

  const slots = (k: string) => slotsFor(s, k).map((x) => ({ ...x, taken: x.taken || extra.some((b) => b.session === s.id && b.date === k && b.time === x.time) }));

  /* Open, and whether it is nearly gone. */
  function dayInfo(k: string) {
    if (k < opens) return { open: false, few: false };
    if (s.kind === "event") {
      const left = CAPACITY - eventsBooked(k) - extra.filter((b) => b.date === k && sessionBy(b.session).kind === "event").length;
      return { open: left > 0, few: left === 1 };
    }
    const free = slots(k).filter((x) => !x.taken).length;
    return { open: free > 0, few: free > 0 && free <= 2 };
  }

  const times = !draft.date
    ? []
    : s.kind === "event"
      ? s.starts!.map((o) => ({ time: o.time, note: o.note }))
      : slots(draft.date)
          .filter((x) => !x.taken)
          .map((x) => ({ time: x.time, note: "" }));

  return (
    <>
      <h2 className={h2}><RevealText>Pick a date</RevealText></h2>
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_210px]">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[15px] font-medium">
              {monthName(view.m)} {view.y}
            </p>
            <div className="flex gap-1">
              <button type="button" disabled={offset <= 0} onClick={() => setView((v) => (v.m ? { y: v.y, m: v.m - 1 } : { y: v.y - 1, m: 11 }))} aria-label="Previous month" className="rounded-full p-2 hover:bg-[#f1ece4] disabled:opacity-25">
                <PiCaretLeft className="h-4 w-4" />
              </button>
              <button type="button" disabled={offset >= HORIZON_MONTHS - 1} onClick={() => setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }))} aria-label="Next month" className="rounded-full p-2 hover:bg-[#f1ece4] disabled:opacity-25">
                <PiCaretRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-[14px]">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i} aria-hidden className="pb-2 text-[12px] text-[#a59d91]">
                {d}
              </span>
            ))}
            {cells.map((k, i) => {
              if (!k) return <span key={i} />;
              const { open, few } = dayInfo(k);
              const on = draft.date === k;
              return (
                <button
                  key={k}
                  type="button"
                  disabled={!open}
                  aria-pressed={on}
                  aria-label={`${longDate(k)}${open ? (few ? ", almost full" : "") : ", not available"}`}
                  onClick={() => setDraft((d) => ({ ...d, date: k, time: s.starts?.length === 1 ? s.starts[0].time : null }))}
                  className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full tabular-nums ${
                    on ? "bg-[#1d1b18] text-white" : open ? "bg-[#f1ece4] font-medium hover:bg-[#e4dccf]" : "cursor-default text-[#c5bdb0]"
                  } ${k === today ? "underline underline-offset-4" : ""}`}
                >
                  {dateOf(k).getDate()}
                  {few && !on && <span aria-hidden className="absolute bottom-1 h-1 w-1 rounded-full bg-[#b5622a]" />}
                </button>
              );
            })}
          </div>
          <p className="mt-4 flex items-center gap-2 text-[12.5px] text-[#6f675d]">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#b5622a]" />
            {s.kind === "event" ? "One photographer left that day" : "Two slots or fewer left"}
          </p>
        </div>

        <div>
          {!draft.date ? (
            <p className="text-[14px] text-[#6f675d] lg:pt-10">Select a date to see the times.</p>
          ) : (
            <>
              <p className="text-[15px] font-medium">{shortDate(draft.date)}</p>
              {s.where === "studio-or-outdoor" && (
                <div className="mt-3 grid grid-cols-2 border border-[#d8d1c5] text-[13px]">
                  {(
                    [
                      ["studio", "Studio"],
                      ["outdoor", s.id === "konvo" ? "Campus" : "Outdoor"],
                    ] as const
                  ).map(([id, text], i) => (
                    <button key={id} type="button" onClick={() => set("where", id)} aria-pressed={draft.where === id} className={`py-2 ${i ? "border-l border-[#d8d1c5]" : ""} ${draft.where === id ? "bg-[#1d1b18] text-white" : ""}`}>
                      {text}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-3 max-h-[340px] space-y-2 overflow-y-auto">
                {times.map((o) => (
                  <button
                    key={o.time}
                    type="button"
                    onClick={() => set("time", o.time)}
                    aria-pressed={draft.time === o.time}
                    className={`w-full border py-2.5 text-center text-[14.5px] tabular-nums ${draft.time === o.time ? "border-[#1d1b18] bg-[#1d1b18] text-white" : "border-[#d8d1c5] hover:border-[#1d1b18]"}`}
                  >
                    {clock12(o.time)}
                    {o.note && <span className={`block text-[12px] ${draft.time === o.time ? "text-white/70" : "text-[#6f675d]"}`}>{o.note}</span>}
                  </button>
                ))}
              </div>
              {needsTravel(s, draft) && (
                <label className="mt-4 block text-[13px] text-[#4a443c]">
                  Area
                  <select value={draft.zone} onChange={(e) => set("zone", e.target.value as ZoneId)} className={`${field} mt-1 py-2 text-[14px]`}>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.label}
                        {z.price ? ` (+${rm(z.price)})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button type="button" disabled={!draft.time} onClick={onNext} className={`${btnInk} mt-4 w-full`}>
                Next
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function DetailsStep({
  draft,
  s,
  set,
  setDraft,
  onNext,
}: {
  draft: Draft;
  s: Session;
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  setDraft: (fn: (d: Draft) => Draft) => void;
  onNext: () => void;
}) {
  const [tried, setTried] = useState(false);
  const phone = draft.phone.replace(/[\s-]/g, "");
  /* Off-studio work needs to know where: the full address, or a map link,
     or both. */
  const venue = s.where === "venue" ? "Venue" : draft.where === "outdoor" || s.where === "outdoor" ? (s.id === "konvo" ? "Campus" : "Location") : null;
  const link = draft.venueLink.trim();
  const errors = {
    name: !draft.name.trim() ? "Tell us who the booking is for." : "",
    phone: !/^(\+?60|0)1\d{8,9}$/.test(phone) ? "A Malaysian mobile number, like 012-345 6789." : "",
    email: !/^\S+@\S+\.\S+$/.test(draft.email.trim()) ? "Needed for the receipt and the gallery link." : "",
    venue: venue && !draft.venue.trim() && !link ? "Add the address, or paste a location link below." : "",
    link: link && !/^https?:\/\/\S+\.\S+/.test(link) ? "That does not look like a link. Copy it from Google Maps or Waze." : "",
  };
  const ok = Object.values(errors).every((e) => !e);
  const err = (m: string) => tried && m && <p className="mt-1 text-[12.5px] text-[#a1371b]">{m}</p>;
  /* Required fields carry a red asterisk; screen readers get "required"
     from the input itself. */
  const req = (
    <span aria-hidden className="ml-0.5 text-[#c0261a]">
      *
    </span>
  );

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (ok) onNext();
      }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className={h2}><RevealText>Your details</RevealText></h2>
        <p className="text-[12.5px] text-[#6f675d]">
          <span className="text-[#c0261a]">*</span> Required
        </p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="bk-name" className={label}>
            {s.group === "Weddings" ? "Bride and groom" : "Name"}
            {req}
          </label>
          <input id="bk-name" required value={draft.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" aria-invalid={tried && !!errors.name} className={field} />
          {err(errors.name)}
        </div>
        <div>
          <label htmlFor="bk-phone" className={label}>
            WhatsApp
            {req}
          </label>
          <input id="bk-phone" required type="tel" inputMode="tel" value={draft.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" placeholder="012-345 6789" aria-invalid={tried && !!errors.phone} className={field} />
          {err(errors.phone)}
        </div>
        <div>
          <label htmlFor="bk-email" className={label}>
            Email
            {req}
          </label>
          <input id="bk-email" required type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" aria-invalid={tried && !!errors.email} className={field} />
          {err(errors.email)}
        </div>
        {venue && (
          <>
            <div className="sm:col-span-2">
              <label htmlFor="bk-venue" className={label}>
                {venue} address
                {req}
              </label>
              <textarea
                id="bk-venue"
                rows={3}
                value={draft.venue}
                onChange={(e) => set("venue", e.target.value)}
                autoComplete="street-address"
                aria-invalid={tried && !!errors.venue}
                aria-describedby="bk-venue-help"
                placeholder={s.where === "venue" ? "Dewan Seri Alam, Persiaran Perbandaran, Seksyen 14, 40000 Shah Alam" : s.id === "konvo" ? "Universiti Malaya, Jalan Universiti, 50603 Kuala Lumpur" : "Taman Tasik Shah Alam, Seksyen 7, 40000 Shah Alam"}
                className={`${field} resize-y`}
              />
              {tried && errors.venue ? (
                err(errors.venue)
              ) : (
                <p id="bk-venue-help" className="mt-1 text-[12.5px] text-[#6f675d]">
                  The full address, or leave it and paste a location link below.
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="bk-link" className={label}>
                Location link <span className="font-normal text-[#6f675d]">(optional)</span>
              </label>
              <input
                id="bk-link"
                type="url"
                inputMode="url"
                value={draft.venueLink}
                onChange={(e) => set("venueLink", e.target.value)}
                placeholder="https://maps.app.goo.gl/… or https://waze.com/ul/…"
                aria-invalid={tried && !!errors.link}
                className={field}
              />
              {err(errors.link)}
            </div>
          </>
        )}
      </div>

      {/* Extras sit here, out of the way of the date: most people skip them. */}
      <fieldset className="mt-8">
        <legend className="text-[13px] font-medium text-[#4a443c]">Extras, if you want them</legend>
        <ul className="mt-2 divide-y divide-[#ece6dc] border-y border-[#ece6dc]">
          {s.addOns.map((id) => {
            const a = addOns[id];
            const n = draft.extras[id] ?? 0;
            const setN = (v: number) => setDraft((d) => ({ ...d, extras: { ...d.extras, [id]: Math.max(0, Math.min(a.max ?? 1, v)) } }));
            return (
              <li key={id} className="flex items-center gap-3 py-2.5 text-[14px]">
                {a.per ? (
                  <>
                    <span className="flex-1">
                      {a.label} <span className="text-[#6f675d]">· {rm(a.price)} per {a.per}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <button type="button" onClick={() => setN(n - 1)} disabled={!n} aria-label={`Fewer: ${a.label}`} className="rounded-full p-1.5 hover:bg-[#f1ece4] disabled:opacity-25">
                        <PiMinus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center tabular-nums">{n}</span>
                      <button type="button" onClick={() => setN(n + 1)} disabled={n >= (a.max ?? 1)} aria-label={`More: ${a.label}`} className="rounded-full p-1.5 hover:bg-[#f1ece4] disabled:opacity-25">
                        <PiPlus className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </>
                ) : (
                  <label className="flex flex-1 cursor-pointer items-center gap-3">
                    <input type="checkbox" checked={!!n} onChange={(e) => setN(e.target.checked ? 1 : 0)} className="h-4 w-4 accent-[#1d1b18]" />
                    <span className="flex-1">{a.label}</span>
                    <span className="tabular-nums text-[#6f675d]">{rm(a.price)}</span>
                  </label>
                )}
              </li>
            );
          })}
        </ul>
      </fieldset>

      <button type="submit" className={`${btnInk} mt-8 w-full sm:w-auto`}>
        Continue
      </button>
    </form>
  );
}

function DepositStep({
  draft,
  set,
  deposit,
  balance,
  onPay,
}: {
  draft: Draft;
  set: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  deposit: number;
  balance: number;
  onPay: () => void;
}) {
  const ready = draft.agree && (draft.pay !== "transfer" || !!draft.receipt);
  const methods: { id: Pay; title: string }[] = [
    { id: "fpx", title: "FPX online banking" },
    { id: "duitnow", title: "DuitNow QR" },
    { id: "transfer", title: "Bank transfer" },
  ];

  return (
    <>
      <h2 className={h2}><RevealText>Pay the deposit</RevealText></h2>
      <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[#4a443c]">
        {rm(deposit)} holds the date for you. It is not refunded, but you can move the date once with 14 days&apos; notice. The balance of {rm(balance)} is paid once your
        gallery is delivered, within 7 days.
      </p>

      <div className="mt-6 max-w-md space-y-2">
        {methods.map((m) => (
          <div key={m.id} className={`border ${draft.pay === m.id ? "border-[#1d1b18]" : "border-[#e3ddd3]"}`}>
            <label className="flex cursor-pointer items-center gap-3 px-4 py-3 text-[14.5px]">
              <input type="radio" name="pay" checked={draft.pay === m.id} onChange={() => set("pay", m.id)} className="accent-[#1d1b18]" />
              {m.title}
            </label>
            {draft.pay === m.id && m.id === "fpx" && (
              <div className="px-4 pb-4">
                <select aria-label="Bank" value={draft.bank} onChange={(e) => set("bank", e.target.value)} className={`${field} py-2 text-[14px]`}>
                  {banks.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}
            {draft.pay === m.id && m.id === "duitnow" && (
              <div className="flex items-center gap-4 px-4 pb-4 text-[13px] text-[#6f675d]">
                <DemoQR />
                Scan with any banking app. This one is a drawing.
              </div>
            )}
            {draft.pay === m.id && m.id === "transfer" && (
              <div className="px-4 pb-4 text-[13px]">
                <p className="text-[#6f675d]">Maybank · Teduh Studio · 0000 0000 0000</p>
                <label className="mt-2 flex cursor-pointer items-center justify-between gap-3 border border-dashed border-[#d8d1c5] px-3 py-2.5 hover:border-[#1d1b18]">
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => set("receipt", e.target.files?.[0]?.name ?? null)} className="sr-only" />
                  <span className="truncate">{draft.receipt ?? "Upload the receipt"}</span>
                  <span className="font-medium">{draft.receipt ? "Change" : "Choose file"}</span>
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      <label className="mt-6 flex max-w-md cursor-pointer items-start gap-3 text-[14px]">
        <input type="checkbox" checked={draft.agree} onChange={(e) => set("agree", e.target.checked)} className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#1d1b18]" />I agree to the deposit terms above.
      </label>
      <button type="button" disabled={!ready} onClick={onPay} className={`${btnInk} mt-6 w-full max-w-md`}>
        {draft.pay === "transfer" ? "Send receipt" : `Pay ${rm(deposit)}`}
      </button>
      <p className="mt-3 text-[12.5px] text-[#6f675d]">Demo only. Nothing is charged, and a receipt you pick stays in your browser.</p>
    </>
  );
}

/* A QR-looking drawing, deterministic and clearly not a payment code. */
function DemoQR() {
  const n = 21;
  const on = (x: number, y: number) => {
    for (const [cx, cy] of [
      [0, 0],
      [n - 7, 0],
      [0, n - 7],
    ]) {
      if (x >= cx && x < cx + 7 && y >= cy && y < cy + 7) {
        const dx = x - cx;
        const dy = y - cy;
        return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
      }
    }
    return (x * 7 + y * 13 + x * y) % 5 < 2;
  };
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="h-20 w-20 flex-shrink-0 bg-white" aria-hidden shapeRendering="crispEdges">
      {Array.from({ length: n * n }, (_, i) => (on(i % n, Math.floor(i / n)) ? <rect key={i} x={i % n} y={Math.floor(i / n)} width="1" height="1" fill="#1d1b18" /> : null))}
    </svg>
  );
}

function Confirmed({
  b,
  today,
  draft,
  balance,
  onAgain,
  onStudio,
}: {
  b: Booking;
  today: string;
  draft: Draft;
  balance: number;
  onAgain: () => void;
  onStudio: () => void;
}) {
  const transfer = draft.pay === "transfer";
  /* The same path the photographer works through: shoot, edit, review,
     deliver, then the balance. */
  const tl = timeline(b);
  const next = [
    `Tomorrow: a short questionnaire on WhatsApp about the photos you want.`,
    ...(daysBetween(today, b.date) > 3 ? [`${shortDate(addDays(b.date, -3))}: the itinerary, and who to call on the day.`] : []),
    `${shortDate(tl.review)}: your edited photos to review, with any changes you want.`,
    `${shortDate(tl.delivered)}: the full gallery, with a payment link for the balance of ${rm(balance)}.`,
  ];

  return (
    <div className="max-w-lg">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1d1b18] text-white">
        <PiCheck aria-hidden className="h-5 w-5" />
      </span>
      <h2 className={`${h2} mt-5`}><RevealText>{transfer ? "Your date is on hold" : "You're booked"}</RevealText></h2>
      <p className="mt-2 text-[14.5px] text-[#4a443c]">
        {transfer ? "Aina confirms the receipt within 2 hours. " : ""}A confirmation is on its way to your WhatsApp and {draft.email.trim()}.
      </p>
      <p className="mt-1 text-[13px] text-[#6f675d]">Booking {b.ref}</p>
      <ul className="mt-6 space-y-2 border-t border-[#e3ddd3] pt-5 text-[14px] text-[#4a443c]">
        {next.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={onStudio} className={btnInk}>
          See it as the photographer
        </button>
        <button type="button" onClick={onAgain} className={btnLine}>
          Book another
        </button>
      </div>
    </div>
  );
}

/* Client gallery: sign in with the booking reference and the PIN from the
   delivery message, then view the album and pick photos for the photobook,
   which is how albums are chosen here. */
function GalleryPage({ made, say }: { made: Booking | null; say: (msg: string) => void }) {
  const [ref, setRef] = useState("");
  const [pin, setPin] = useState("");
  const [state, setState] = useState<"signin" | "album" | "pending">("signin");
  const [error, setError] = useState("");
  const [picks, setPicks] = useState<Set<string>>(new Set());
  const [sent, setSent] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const g = demoGallery;

  function signIn() {
    const r = ref.trim().toUpperCase();
    if (r === g.ref && pin.trim() === g.pin) {
      setState("album");
      setError("");
    } else if (made && r === made.ref) {
      setState("pending");
      setError("");
    } else setError("That reference and PIN do not match a gallery.");
  }

  function toggle(id: string) {
    setSent(false);
    setPicks((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  if (state === "signin" || state === "pending")
    return (
      <div className="grid md:min-h-[640px] md:grid-cols-[300px_minmax(0,1fr)]">
        <div className="relative hidden bg-[#e9e3d9] md:block">
          <Image src={photo(photos.bride, 800)} alt={photos.bride.alt} fill sizes="300px" className="object-cover" />
        </div>
        <div className="p-5 sm:p-8">
          {state === "pending" && made ? (
            <div className="max-w-md">
              <h2 className={h2}><RevealText>Not ready yet</RevealText></h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[#4a443c]">
                Your gallery opens after your {sessionBy(made.session).name.toLowerCase()} on {longDate(made.date)}. The link and PIN come to your WhatsApp when the
                first photos are edited.
              </p>
              <button type="button" onClick={() => setState("signin")} className={`${btnLine} mt-6`}>
                Back
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                signIn();
              }}
              className="max-w-sm"
            >
              <h2 className={h2}><RevealText>Your gallery</RevealText></h2>
              <p className="mt-3 text-[14.5px] leading-relaxed text-[#4a443c]">Sign in with your booking reference and the PIN in your gallery message.</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="gl-ref" className={label}>
                    Booking reference
                  </label>
                  <input id="gl-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="TDH-0000" autoComplete="off" className={`${field} uppercase placeholder:normal-case`} />
                </div>
                <div>
                  <label htmlFor="gl-pin" className={label}>
                    PIN
                  </label>
                  <input id="gl-pin" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} autoComplete="off" className={field} />
                </div>
              </div>
              {error && <p className="mt-3 text-[13px] text-[#a1371b]">{error}</p>}
              <button type="submit" className={`${btnInk} mt-6 w-full`}>
                Open gallery
              </button>
              <p className="mt-6 border-t border-[#e3ddd3] pt-4 text-[13px] text-[#6f675d]">
                Demo gallery: {g.ref}, PIN {g.pin}.{" "}
                <button
                  type="button"
                  onClick={() => {
                    setRef(g.ref);
                    setPin(g.pin);
                  }}
                  className="font-medium text-[#1d1b18] underline underline-offset-2"
                >
                  Fill it in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    );

  return (
    <div className="p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={h2}><RevealText>{g.couple}</RevealText></h2>
          <p className="mt-1 text-[13.5px] text-[#6f675d]">
            {g.event} · {g.total} photos, {g.photos.length} shown in this demo
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setState("signin");
            setPin("");
          }}
          className="text-[13.5px] text-[#6f675d] underline underline-offset-2 hover:text-[#1d1b18]"
        >
          Sign out
        </button>
      </div>

      {/* Photobook picks: the client chooses, Aina lays it out. */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-[#e3ddd3] py-3 text-[14px]">
        <p>
          Photobook: <span className="font-medium tabular-nums">{picks.size}</span> of 40 picked.{" "}
          <span className="text-[#6f675d]">Tap the heart on the ones you want printed.</span>
        </p>
        <button
          type="button"
          disabled={!picks.size || sent}
          onClick={() => {
            setSent(true);
            say(`${picks.size} ${picks.size === 1 ? "pick" : "picks"} sent to Aina for the photobook`);
          }}
          className={`${btnInk} px-4 py-2 text-[13.5px]`}
        >
          {sent ? "Sent" : "Send picks to Aina"}
        </button>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {g.photos.map((p, i) => {
          const on = picks.has(p.id);
          return (
            <li key={p.id} className="group relative aspect-[4/5] overflow-hidden bg-[#e9e3d9]">
              <button type="button" onClick={() => setOpen(i)} aria-label={`Open photo ${i + 1}: ${p.alt}`} className="absolute inset-0">
                <Image src={photo(p, 700)} alt={p.alt} fill sizes="(min-width: 1024px) 160px, (min-width: 640px) 30vw, 45vw" className="object-cover transition duration-300 group-hover:brightness-95" />
              </button>
              <HeartButton on={on} onClick={() => toggle(p.id)} className="absolute right-2 top-2" />
            </li>
          );
        })}
      </ul>

      {open !== null && (
        <Lightbox
          photos={g.photos}
          index={open}
          picks={picks}
          onIndex={setOpen}
          onToggle={toggle}
          onClose={() => setOpen(null)}
          onDownload={() => say("Downloads are switched off in the demo")}
        />
      )}
    </div>
  );
}

function HeartButton({ on, onClick, className = "" }: { on: boolean; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={on ? "Remove from photobook" : "Add to photobook"}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#1d1b18] hover:bg-white ${className}`}
    >
      {on ? <PiHeartFill className="h-4 w-4 text-[#a1371b]" /> : <PiHeart className="h-4 w-4" />}
    </button>
  );
}

function Lightbox({
  photos: list,
  index,
  picks,
  onIndex,
  onToggle,
  onClose,
  onDownload,
}: {
  photos: Photo[];
  index: number;
  picks: Set<string>;
  onIndex: (i: number) => void;
  onToggle: (id: string) => void;
  onClose: () => void;
  onDownload: () => void;
}) {
  const p = list[index];
  const prev = () => onIndex((index - 1 + list.length) % list.length);
  const next = () => onIndex((index + 1) % list.length);

  /* Arrow keys move through the album, Escape closes. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndex((index - 1 + list.length) % list.length);
      if (e.key === "ArrowRight") onIndex((index + 1) % list.length);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [index, list.length, onClose, onIndex]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Photo ${index + 1} of ${list.length}`} className="fixed inset-0 z-50 flex flex-col bg-[#14120f]/95 text-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3 text-[13.5px]">
        <span className="tabular-nums text-white/70">
          {index + 1} / {list.length}
        </span>
        <div className="flex items-center gap-2">
          <HeartButton on={picks.has(p.id)} onClick={() => onToggle(p.id)} />
          <button type="button" onClick={onDownload} className="rounded-full px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white">
            Download
          </button>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-white/10">
            <PiX className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <Image key={p.id} src={photo(p, 1800)} alt={p.alt} fill sizes="100vw" className="object-contain" />
        <button type="button" onClick={prev} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 hover:bg-black/60">
          <PiCaretLeft className="h-5 w-5" />
        </button>
        <button type="button" onClick={next} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-3 hover:bg-black/60">
          <PiCaretRight className="h-5 w-5" />
        </button>
      </div>
      <p className="px-4 py-3 text-center text-[12.5px] text-white/60">Photo by {p.by} on Unsplash</p>
    </div>
  );
}

function AboutPage({ onBook }: { onBook: () => void }) {
  return (
    <div className="grid md:min-h-[640px] md:grid-cols-[300px_minmax(0,1fr)]">
      <div className="relative aspect-[4/3] bg-[#e9e3d9] md:aspect-auto">
        <Image src={photo(photos.aina, 900)} alt={photos.aina.alt} fill sizes="(min-width: 768px) 300px, 100vw" className="object-cover" />
      </div>
      <div className="max-w-xl p-5 sm:p-8">
        <h2 className={h2}><RevealText>Hi, I&apos;m Aina.</RevealText></h2>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#4a443c]">
          <p>
            I started photographing weddings in 2016, when a cousin&apos;s photographer cancelled two days before her nikah. I still work the way I did that day:
            quietly, close to the family, and without staging the moments that matter.
          </p>
          <p>
            Most weekends I am at a nikah or sanding somewhere in the Peninsular. On weekdays the studio in Seksyen 13 is open for konvo, family and portrait
            sessions.
          </p>
          <p>Haziq joined in 2021 as second shooter. On a two-photographer day he covers the groom&apos;s side and the guests while I stay with the bride.</p>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-[#e3ddd3] pt-5 text-[14px]">
          {[
            ["Studio", "Seksyen 13, Shah Alam"],
            ["Open", "10am to 6pm, closed Tuesdays"],
            ["Weddings a year", "About 60"],
            ["Languages", "Malay and English"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[#6f675d]">{k}</dt>
              <dd className="mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
        <button type="button" onClick={onBook} className={`${btnInk} mt-8`}>
          Book a session
        </button>
      </div>
    </div>
  );
}

/* What comes to every wedding, and why. Couples ask, mostly to know nothing
   will be lost if a card or a flash fails mid-akad. */
const gear: { group: string; items: { name: string; note: string }[] }[] = [
  {
    group: "Cameras",
    items: [
      { name: "2 × Sony A7 IV", note: "Every photo is written to two cards at once, so one failing card loses nothing." },
      { name: "Sony A7C II", note: "A spare body in the bag, used for the second shooter's wide angle." },
    ],
  },
  {
    group: "Lenses",
    items: [
      { name: "24–70mm f/2.8", note: "The working lens for the dewan and the pelamin." },
      { name: "85mm f/1.4", note: "Portraits and the quiet moments during the akad, from a distance." },
      { name: "70–200mm f/2.8", note: "Mosques where we stay at the back, and speeches from across the hall." },
      { name: "35mm f/1.4", note: "Getting ready at home, where rooms are small." },
    ],
  },
  {
    group: "Lighting",
    items: [
      { name: "2 × Godox AD200", note: "Off-camera light for the pelamin and family photos after sunset." },
      { name: "Godox V1 on-camera flash", note: "Bounced off the ceiling, never straight at faces." },
    ],
  },
  {
    group: "Backup",
    items: [
      { name: "Same-night copy", note: "Cards are copied to two drives the night of the event, then to cloud storage." },
      { name: "Kept for a year", note: "Your full set stays in our archive for 12 months after delivery." },
    ],
  },
];

function GearPage() {
  return (
    <div className="p-5 sm:p-8">
      <h2 className={h2}><RevealText>Equipment</RevealText></h2>
      <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-[#4a443c]">
        What comes to every wedding. No flash during the akad unless the mosque allows it, and no drone, since most dewan and masjid do not.
      </p>
      <div className="mt-8 grid gap-x-10 gap-y-8 lg:grid-cols-2">
        {gear.map((g) => (
          <section key={g.group}>
            <h3 className="text-[12.5px] font-medium uppercase tracking-[0.08em] text-[#6f675d]">{g.group}</h3>
            <ul className="mt-2 divide-y divide-[#ece6dc] border-y border-[#ece6dc]">
              {g.items.map((it) => (
                <li key={it.name} className="py-3">
                  <p className="text-[15px] font-medium">{it.name}</p>
                  <p className="mt-0.5 text-[13.5px] leading-relaxed text-[#6f675d]">{it.note}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

const faqs: [string, string][] = [
  ["When is my date actually held?", "Once the deposit is paid. Until then someone else can book the same day, which in the school holidays happens within hours."],
  ["Can I change the date?", "Once, with at least 14 days' notice, if the new date is free. The deposit moves with you. Cancelling forfeits it, because the date was turned down for someone else."],
  ["Nikah and sanding on different days?", "Book them as two events. Each is a full working day for us, so there is no discount for doing both, but the second deposit is waived."],
  ["Do you travel?", "Across Peninsular Malaysia, by zone: free in the Klang Valley, from RM 100 elsewhere. Sabah and Sarawak are quoted with flights and a night's stay."],
  ["How do we get the photos?", "A private online gallery you sign in to with your booking reference and a PIN. Sneak peek within 48 hours if you add it, the full set within 30 days for weddings and 7 for sessions."],
  ["How do we choose photos for the photobook?", "Tap the heart on up to 40 photos in your gallery and send the picks. Aina lays out the book and sends a proof before printing."],
  ["How can we pay?", "FPX online banking, DuitNow QR, or a bank transfer with the receipt uploaded. The balance is paid after your gallery is delivered, by a payment link on WhatsApp, within 7 days."],
];

function FaqPage({ onBook }: { onBook: () => void }) {
  return (
    <div className="p-5 sm:p-8">
      <h2 className={h2}><RevealText>Questions people ask</RevealText></h2>
      <div className="mt-6 max-w-2xl divide-y divide-[#e3ddd3] border-y border-[#e3ddd3]">
        {faqs.map(([q, a]) => (
          <details key={q} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15.5px] font-medium [&::-webkit-details-marker]:hidden">
              {q}
              <PiPlus aria-hidden className="h-4 w-4 flex-shrink-0 transition-transform group-open:rotate-45 motion-reduce:transition-none" />
            </summary>
            <p className="mt-2 text-[14.5px] leading-relaxed text-[#4a443c]">{a}</p>
          </details>
        ))}
      </div>
      <p className="mt-6 text-[14px] text-[#4a443c]">
        Something else?{" "}
        <button type="button" onClick={onBook} className="font-medium text-[#1d1b18] underline underline-offset-2">
          Pick a date
        </button>{" "}
        and write it in the notes, or ask on WhatsApp after you book.
      </p>
    </div>
  );
}

function Credits() {
  const by = [...new Set(Object.values(photos).map((p) => p.by))];
  return (
    <footer className="mt-6 space-y-1 text-[12px] leading-relaxed text-[#8a8276] md:pl-12">
      <p>Teduh Studio is not a real business. A demo booking system designed and built by Zakrul.</p>
      <p>
        Photos from{" "}
        <a href="https://unsplash.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          Unsplash
        </a>{" "}
        by {by.slice(0, -1).join(", ")} and {by[by.length - 1]}.
      </p>
    </footer>
  );
}

type Tab = "bookings" | "payments" | "reminders";

/* The next step for a booking at each stage, and what it moves to. */
const nextStep: Partial<Record<Stage, { label: string; to: Stage; say: (b: Booking) => string }>> = {
  deposit: { label: "Confirm deposit", to: "attend", say: (b) => `Deposit from ${b.client} confirmed. Receipt sent on WhatsApp.` },
  attend: { label: "Mark attended", to: "editing", say: (b) => `${b.client} marked as shot. Editing starts.` },
  editing: { label: "Send for review", to: "review", say: (b) => `Review link sent to ${b.client} on WhatsApp.` },
  review: { label: "Deliver gallery", to: "delivered", say: (b) => `Gallery delivered to ${b.client}, with the payment link for the balance.` },
  delivered: { label: "Record final payment", to: "paid", say: (b) => `Final payment from ${b.client} recorded.` },
  paid: { label: "Close booking", to: "closed", say: (b) => `${b.ref} closed. Thank-you message and review request sent.` },
};

/* Moving a booking on: the new stage, today's date against it, and the money
   that changes hands at the two payment steps. */
function advance(b: Booking, today: string): Partial<Booking> {
  const step = nextStep[b.status]!;
  const s = sessionBy(b.session);
  const paid = step.to === "attend" ? Math.min(s.deposit, b.total) : step.to === "paid" ? b.total : b.paid;
  return { status: step.to, paid, log: { [step.to]: today } };
}

/* The final payment's due date and how late it is, given the limit the
   photographer has set. */
function finalDue(b: Booking, limit: number, today: string) {
  const due = addDays(reachedOn(b, "delivered"), limit);
  return { due, late: Math.max(0, daysBetween(due, today)) };
}

function StudioView({
  today,
  extra,
  patches,
  highlight,
  onChange,
  onClient,
}: {
  today: string;
  extra: Booking[];
  patches: Record<string, Partial<Booking>>;
  highlight: string | null;
  onChange: (ref: string, patch: Partial<Booking>, msg: string) => void;
  onClient: () => void;
}) {
  const t = dateOf(today);
  const [tab, setTab] = useState<Tab>("bookings");
  const [view, setView] = useState({ y: t.getFullYear(), m: t.getMonth() });
  const [day, setDay] = useState(today);
  const [open, setOpen] = useState<Booking | null>(null);
  const [layout, setLayout] = useState<"calendar" | "list" | "pipeline">("calendar");
  const mondayOf = (k: string) => addDays(k, -((dateOf(k).getDay() + 6) % 7));
  /* The list is a week at a time; this is its Monday. */
  const [week, setWeek] = useState(() => mondayOf(today));
  const [filter, setFilter] = useState<Stage | "all">("all");
  /* Days the client has to pay the balance once the gallery is delivered. */
  const [limit, setLimit] = useState(7);

  const patched = (b: Booking) => withPatch(b, patches[b.ref]);
  const between = (from: string, to: string) =>
    [...bookingsBetween(from, to, today), ...extra.filter((b) => b.date >= from && b.date <= to)].map(patched).sort(byTime);

  const kind = (b: Booking) => sessionBy(b.session).kind;
  const isNew = (b: Booking) => b.ref === highlight;
  const overdue = (b: Booking) => b.status === "delivered" && finalDue(b, limit, today).late > 0;
  /* Needs a hand: a receipt to match, a shoot to mark, a late balance, or a
     paid booking left open. */
  const action = (b: Booking) => b.status === "deposit" || (b.status === "attend" && b.date <= today) || overdue(b) || b.status === "paid";
  const only = (list: Booking[]) => (filter === "all" ? list : list.filter((b) => b.status === filter));

  /* The month in view, Monday first, padded with the days either side. */
  const lead = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const weeks = Math.ceil((lead + new Date(view.y, view.m + 1, 0).getDate()) / 7);
  const first = keyOf(new Date(view.y, view.m, 1 - lead));
  const cells = Array.from({ length: weeks * 7 }, (_, i) => addDays(first, i));
  const shownAll = between(first, cells[cells.length - 1]);
  const byDay: Record<string, Booking[]> = {};
  for (const b of only(shownAll)) (byDay[b.date] ??= []).push(b);

  const prefix = `${view.y}-${pad(view.m + 1)}`;
  const month = shownAll.filter((b) => b.date.startsWith(prefix));
  const soon = only(between(today, addDays(today, 30)));
  const dayList = byDay[day] ?? only(between(day, day));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const weekAll = between(week, weekDays[6]);
  const weekByDay: Record<string, Booking[]> = {};
  for (const b of only(weekAll)) (weekByDay[b.date] ??= []).push(b);

  /* The pipeline holds everything still open, plus what closed this month. */
  const pipeAll = between(addDays(today, -75), addDays(today, 60)).filter((b) => b.status !== "closed" || reachedOn(b, "closed") >= addDays(today, -30));
  const stats = layout === "list" ? weekAll : layout === "pipeline" ? pipeAll : month;

  const span = (() => {
    const a = dateOf(week);
    const b = dateOf(weekDays[6]);
    return a.getMonth() === b.getMonth()
      ? `${a.getDate()}–${b.getDate()} ${monthName(b.getMonth()).slice(0, 3)}`
      : `${a.getDate()} ${monthName(a.getMonth()).slice(0, 3)}–${b.getDate()} ${monthName(b.getMonth()).slice(0, 3)}`;
  })();

  /* What goes out on WhatsApp by itself, worked out from each booking's
     stage and timeline. */
  const auto = between(addDays(today, -60), addDays(today, 30))
    .flatMap((b) => {
      const tl = timeline(b);
      const out: { date: string; text: string }[] = [];
      if (b.status === "attend") out.push({ date: addDays(b.date, -3), text: `Itinerary and reminder to ${b.client}` });
      if (b.status === "editing") out.push({ date: tl.review, text: `Review link to ${b.client}` });
      if (b.status === "review") out.push({ date: tl.delivered, text: `Gallery and payment link to ${b.client}` });
      if (b.status === "delivered") {
        const { due } = finalDue(b, limit, today);
        out.push({ date: due >= today ? due : today, text: `Final payment reminder to ${b.client}` });
      }
      return out;
    })
    .filter((m) => m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const move = (n: number) =>
    layout === "list"
      ? setWeek((w) => addDays(w, 7 * n))
      : setView((v) => {
          const d = new Date(v.y, v.m + n, 1);
          return { y: d.getFullYear(), m: d.getMonth() };
        });

  /* Switching keeps your place: the list opens on the selected day's week,
     the calendar on the month of the week you were reading. */
  function switchTo(next: typeof layout) {
    if (next === "list") setWeek(mondayOf(day));
    if (next === "calendar" && layout === "list") {
      const d = dateOf(week);
      setView({ y: d.getFullYear(), m: d.getMonth() });
    }
    setLayout(next);
  }

  const bar = (b: Booking) => (kind(b) === "event" ? "bg-[#9a4f1c]" : "bg-[#4f7a58]");
  const chip = (b: Booking) =>
    kind(b) === "event" ? "border-l-2 border-[#9a4f1c] bg-[#f6ece2] text-[#4d2810]" : "border-l-2 border-[#4f7a58] bg-[#e9f0ea] text-[#203a27]";
  const badge = (b: Booking) => (
    <span className={`inline-block whitespace-nowrap px-1.5 py-px text-[11.5px] font-medium ${overdue(b) ? "bg-[#fbe3dc] text-[#a1371b]" : stageStyle[b.status]}`}>
      {overdue(b) ? "Payment overdue" : stageLabel[b.status]}
    </span>
  );

  const row = (b: Booking, withDate = false) => (
    <li key={b.ref}>
      <button type="button" onClick={() => setOpen(b)} className={`flex w-full gap-3 py-3 text-left hover:bg-[#faf8f5] ${isNew(b) ? "bg-[#fbf3e4]" : ""}`}>
        <span className={`mt-1 h-8 w-0.5 flex-shrink-0 ${bar(b)}`} />
        <span className="w-[62px] flex-shrink-0 text-[13px] leading-tight tabular-nums">
          {withDate && <span className="block font-medium">{shortDate(b.date).slice(4)}</span>}
          <span className={withDate ? "text-[#6f675d]" : "font-medium"}>{clock12(b.time)}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium">
            {b.client}
            {isNew(b) && <span className="ml-1.5 text-[11.5px] font-normal text-[#8a4b12]">New</span>}
          </span>
          <span className="block truncate text-[12.5px] text-[#6f675d]">
            {sessionBy(b.session).name} · {b.place}
          </span>
          <span className="mt-1 block">{badge(b)}</span>
        </span>
      </button>
    </li>
  );

  const remindersDue = between(addDays(today, -90), today).filter(overdue).length;

  return (
    <div className="min-h-[calc(100vh-40px)] bg-[#fbfaf8]">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-[#e3ddd3] bg-white px-5 md:px-8">
        <div className="flex items-center gap-6">
          <span className="font-[family-name:var(--font-bk-serif)] text-[26px] leading-none">Teduh</span>
          <nav aria-label="Studio" className="-mx-1 flex gap-5 overflow-x-auto px-1 text-[14px] [scrollbar-width:none]">
            {(
              [
                ["bookings", "Bookings", 0],
                ["payments", "Payments", 0],
                ["reminders", "Reminders", remindersDue],
              ] as const
            ).map(([id, text, n]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={tab === id ? "page" : undefined}
                className={`-mb-px flex-shrink-0 border-b-2 py-4 ${tab === id ? "border-[#1d1b18] font-medium" : "border-transparent text-[#6f675d] hover:text-[#1d1b18]"}`}
              >
                {text}
                {!!n && <span className="ml-1.5 rounded-full bg-[#a1371b] px-1.5 py-px text-[11px] font-medium tabular-nums text-white">{n}</span>}
              </button>
            ))}
          </nav>
        </div>
        <p className="pb-3 text-[13px] text-[#6f675d] sm:pb-0">Signed in as Aina · {longDate(today)}</p>
      </header>

      {tab === "payments" && <PaymentsView today={today} list={between(addDays(today, -120), addDays(today, 150))} limit={limit} onOpen={setOpen} onChange={onChange} />}
      {tab === "reminders" && (
        <RemindersView today={today} list={between(addDays(today, -120), today)} limit={limit} setLimit={setLimit} onOpen={setOpen} onChange={onChange} />
      )}

      {tab === "bookings" && (
        <div className="px-4 py-5 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="min-w-[210px] font-[family-name:var(--font-bk-serif)] text-[30px] leading-none">
                {layout === "pipeline" ? (
                  "Pipeline"
                ) : (
                  <>
                    {layout === "list" ? span : monthName(view.m)} <span className="text-[#6f675d]">{layout === "list" ? dateOf(weekDays[6]).getFullYear() : view.y}</span>
                  </>
                )}
              </h2>
              {layout !== "pipeline" && (
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => move(-1)} aria-label={layout === "list" ? "Previous week" : "Previous month"} className="border border-[#d8d1c5] bg-white p-2 hover:border-[#1d1b18]">
                    <PiCaretLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => move(1)} aria-label={layout === "list" ? "Next week" : "Next month"} className="border border-[#d8d1c5] bg-white p-2 hover:border-[#1d1b18]">
                    <PiCaretRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setView({ y: t.getFullYear(), m: t.getMonth() });
                      setWeek(mondayOf(today));
                      setDay(today);
                    }}
                    className="ml-1 border border-[#d8d1c5] bg-white px-3 py-[7px] text-[13px] font-medium hover:border-[#1d1b18]"
                  >
                    Today
                  </button>
                </div>
              )}
              <div role="group" aria-label="Layout" className="flex border border-[#d8d1c5] bg-white text-[13px]">
                {(
                  [
                    ["calendar", "Calendar"],
                    ["list", "List"],
                    ["pipeline", "Pipeline"],
                  ] as const
                ).map(([id, text], i) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => switchTo(id)}
                    aria-pressed={layout === id}
                    className={`px-3 py-[7px] font-medium ${i ? "border-l border-[#d8d1c5]" : ""} ${layout === id ? "bg-[#1d1b18] text-white" : "hover:bg-[#f7f4ef]"}`}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[13px] tabular-nums text-[#4a443c]">
              {stats.length} bookings · {stats.filter((b) => kind(b) === "event").length} weddings · {rm(stats.reduce((n, b) => n + b.total, 0))}
              {layout === "list" ? " this week" : layout === "pipeline" ? " in play" : " booked"}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            {/* Stage filter, counted over the period in view. */}
            <div role="group" aria-label="Filter by stage" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
              {(["all", ...stages] as const).map((k) => {
                const n = k === "all" ? stats.length : stats.filter((b) => b.status === k).length;
                const on = filter === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setFilter(k)}
                    aria-pressed={on}
                    disabled={!n && k !== "all"}
                    className={`flex-shrink-0 whitespace-nowrap border px-2.5 py-1 text-[12.5px] disabled:opacity-40 ${
                      on ? "border-[#1d1b18] bg-[#1d1b18] text-white" : "border-[#d8d1c5] bg-white hover:border-[#1d1b18]"
                    }`}
                  >
                    {k === "all" ? "All" : stageLabel[k]} <span className={`tabular-nums ${on ? "text-white/70" : "text-[#8a8276]"}`}>{n}</span>
                  </button>
                );
              })}
            </div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-[#6f675d]">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-1 bg-[#9a4f1c]" /> Wedding
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-1 bg-[#4f7a58]" /> Session
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c2410c]" /> Needs action
              </span>
            </p>
          </div>

          {layout === "pipeline" ? (
            /* Every open booking in its stage, left to right in the order the
               work happens. */
            <div className="-mx-4 mt-4 overflow-x-auto px-4 md:mx-0 md:px-0">
              <div className="grid min-w-[1180px] grid-cols-7 gap-3">
                {stages.map((st) => {
                  const col = pipeAll.filter((b) => b.status === st && (filter === "all" || filter === st)).sort((a, b) => (st === "attend" || st === "deposit" ? byTime(a, b) : byTime(b, a)));
                  return (
                    <section key={st} className="flex min-h-[420px] flex-col border border-[#e3ddd3] bg-[#f7f4ef]">
                      <h3 className="flex items-center justify-between border-b border-[#e3ddd3] bg-white px-3 py-2.5 text-[13px] font-semibold">
                        <span className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1d1b18] text-[11px] font-medium text-white">{stages.indexOf(st) + 1}</span>
                          {stageLabel[st]}
                        </span>
                        <span className="font-normal tabular-nums text-[#6f675d]">{col.length}</span>
                      </h3>
                      <ul className="flex-1 space-y-2 overflow-y-auto p-2 [max-height:640px]">
                        {col.map((b) => (
                          <li key={b.ref}>
                            <button
                              type="button"
                              onClick={() => setOpen(b)}
                              className={`block w-full border border-[#e3ddd3] bg-white p-2.5 text-left hover:border-[#1d1b18] ${isNew(b) ? "outline outline-1 outline-[#1d1b18]" : ""}`}
                            >
                              <span className="flex items-start justify-between gap-2">
                                <span className="min-w-0 truncate text-[13px] font-medium">{b.client}</span>
                                {action(b) && <span aria-label="Needs action" className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#c2410c]" />}
                              </span>
                              <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[#6f675d]">
                                <span className={`h-2.5 w-0.5 ${bar(b)}`} />
                                <span className="truncate">{sessionBy(b.session).name}</span>
                              </span>
                              <span className="mt-1.5 flex justify-between text-[12px] tabular-nums">
                                <span>{shortDate(b.date).slice(4)}</span>
                                <span className={overdue(b) ? "font-medium text-[#a1371b]" : "text-[#6f675d]"}>
                                  {st === "delivered"
                                    ? overdue(b)
                                      ? `${finalDue(b, limit, today).late}d late`
                                      : `due ${shortDate(finalDue(b, limit, today).due).slice(4)}`
                                    : b.total - b.paid
                                      ? rm(b.total - b.paid)
                                      : "Settled"}
                                </span>
                              </span>
                            </button>
                          </li>
                        ))}
                        {!col.length && <li className="px-1 py-2 text-[12px] text-[#a59d91]">Nothing here</li>}
                      </ul>
                    </section>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
              {layout === "list" ? (
                /* One week, day by day, with the detail the calendar has no
                   room for. Empty days stay so the week reads whole. */
                <div className="self-start divide-y divide-[#e3ddd3] border border-[#e3ddd3] bg-white">
                  {weekDays.map((k) => {
                    const list = weekByDay[k] ?? [];
                    return (
                      <div key={k} className={`grid md:grid-cols-[120px_minmax(0,1fr)] ${k < today ? "bg-[#fcfbf9]" : ""}`}>
                        <button
                          type="button"
                          onClick={() => setDay(k)}
                          className={`flex items-baseline gap-2 px-4 pb-1 pt-3 text-left md:block md:border-r md:border-[#ece6dc] md:py-3 ${k === day ? "bg-[#f7f4ef]" : ""}`}
                        >
                          <span className={`text-[13.5px] font-medium ${k < today ? "text-[#a59d91]" : ""}`}>{shortDate(k).slice(0, 3)}</span>
                          <span className={`text-[13px] md:block ${k < today ? "text-[#a59d91]" : "text-[#6f675d]"}`}>{shortDate(k).slice(4)}</span>
                          {k === today && <span className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-[#8a4b12] md:mt-1 md:block">Today</span>}
                        </button>
                        {list.length ? (
                          <ul className="divide-y divide-[#ece6dc]">
                            {list.map((b) => (
                              <li key={b.ref}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDay(b.date);
                                    setOpen(b);
                                  }}
                                  className={`grid w-full grid-cols-[4px_64px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left hover:bg-[#faf8f5] md:grid-cols-[4px_70px_minmax(0,1.2fr)_minmax(0,1fr)_140px_100px] ${
                                    isNew(b) ? "bg-[#fbf3e4]" : ""
                                  } ${b.date < today ? "text-[#6f675d]" : ""}`}
                                >
                                  <span className={`h-9 w-1 ${bar(b)}`} />
                                  <span className="text-[13px] font-medium tabular-nums">{clock12(b.time)}</span>
                                  <span className="min-w-0">
                                    <span className="block truncate text-[14px] font-medium">
                                      {b.client}
                                      {isNew(b) && <span className="ml-1.5 text-[11.5px] font-normal text-[#8a4b12]">New</span>}
                                    </span>
                                    <span className="block truncate text-[12.5px] text-[#6f675d]">{sessionBy(b.session).name}</span>
                                  </span>
                                  <span className="hidden truncate text-[13px] md:block">{b.place}</span>
                                  <span className="justify-self-start">{badge(b)}</span>
                                  <span className="hidden text-right text-[13px] tabular-nums md:block">{b.total - b.paid ? `${rm(b.total - b.paid)} due` : "Settled"}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="px-4 pb-3 text-[13px] text-[#a59d91] md:py-3">{dateOf(k).getDay() === 2 ? "Studio closed" : "Nothing booked"}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Month. Rows size to their content, not to the side column. */
                <div className="grid grid-cols-7 content-start self-start border-l border-t border-[#e3ddd3] bg-white">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div key={d} className="border-b border-r border-[#e3ddd3] bg-[#f7f4ef] px-2 py-1.5 text-[12px] text-[#6f675d]">
                      {d}
                    </div>
                  ))}
                  {cells.map((k) => {
                    const list = byDay[k] ?? [];
                    const inMonth = k.startsWith(prefix);
                    const past = k < today;
                    return (
                      <div
                        key={k}
                        className={`min-h-[64px] border-b border-r border-[#e3ddd3] p-1 md:min-h-[118px] md:p-1.5 ${inMonth ? "" : "bg-[#faf8f5]"} ${
                          k === day ? "outline outline-2 -outline-offset-2 outline-[#1d1b18]" : ""
                        }`}
                      >
                        <button type="button" onClick={() => setDay(k)} aria-label={`${longDate(k)}, ${list.length} ${list.length === 1 ? "booking" : "bookings"}`} className="flex w-full items-center justify-between">
                          <span
                            className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[12.5px] tabular-nums ${
                              k === today ? "bg-[#1d1b18] font-medium text-white" : inMonth ? (past ? "text-[#a59d91]" : "") : "text-[#c5bdb0]"
                            }`}
                          >
                            {dateOf(k).getDate()}
                          </span>
                          {list.some(action) && <span aria-hidden className="mr-1 h-1.5 w-1.5 rounded-full bg-[#c2410c]" />}
                        </button>
                        {/* Phones: a mark per booking; tap the day for the list. */}
                        <div className="mt-1 flex flex-wrap gap-0.5 px-1 md:hidden">
                          {list.map((b) => (
                            <span key={b.ref} className={`h-1.5 w-1.5 rounded-full ${bar(b)}`} />
                          ))}
                        </div>
                        <ul className="mt-1 hidden space-y-1 md:block">
                          {list.slice(0, 3).map((b) => (
                            <li key={b.ref}>
                              <button
                                type="button"
                                onClick={() => {
                                  setDay(k);
                                  setOpen(b);
                                }}
                                title={`${clock12(b.time)} ${b.client}, ${sessionBy(b.session).name}, ${stageLabel[b.status]}`}
                                className={`flex w-full items-center gap-1 overflow-hidden px-1.5 py-0.5 text-left text-[11.5px] leading-snug hover:brightness-95 ${chip(b)} ${past ? "opacity-60" : ""} ${
                                  isNew(b) ? "outline outline-1 outline-[#1d1b18]" : ""
                                }`}
                              >
                                <span className="flex-shrink-0 tabular-nums">{b.time}</span>
                                <span className="truncate">{b.client}</span>
                              </button>
                            </li>
                          ))}
                          {list.length > 3 && (
                            <li>
                              <button type="button" onClick={() => setDay(k)} className="px-1.5 text-[11.5px] text-[#6f675d] hover:text-[#1d1b18]">
                                +{list.length - 3} more
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Selected day, then what is coming up */}
              <aside className="space-y-6">
                <section className={`${card} p-5`}>
                  <h3 className="text-[14px] font-semibold">
                    {day === today ? "Today" : shortDate(day)}
                    <span className="ml-2 font-normal text-[#6f675d]">{day === today ? shortDate(day) : `${dayList.length} ${dayList.length === 1 ? "booking" : "bookings"}`}</span>
                  </h3>
                  {dayList.length ? (
                    <ul className="mt-2 divide-y divide-[#ece6dc]">{dayList.map((b) => row(b))}</ul>
                  ) : (
                    <p className="mt-2 text-[13.5px] text-[#6f675d]">{dateOf(day).getDay() === 2 ? "Studio closed. Nothing booked." : "Nothing booked."}</p>
                  )}
                </section>

                <section className={`${card} p-5`}>
                  <h3 className="text-[14px] font-semibold">Upcoming</h3>
                  <ul className="mt-2 divide-y divide-[#ece6dc]">{soon.slice(0, 6).map((b) => row(b, true))}</ul>
                </section>

                <section className={`${card} p-5`}>
                  <h3 className="text-[14px] font-semibold">Scheduled messages</h3>
                  <p className="mt-0.5 text-[12.5px] text-[#6f675d]">Sent on WhatsApp automatically.</p>
                  <ul className="mt-3 space-y-2.5 text-[13.5px]">
                    {auto.map((m, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-[78px] flex-shrink-0 text-[#6f675d]">{m.date === today ? "Today" : shortDate(m.date)}</span>
                        <span>{m.text}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {!highlight && (
                  <p className="text-[13px] text-[#6f675d]">
                    Book as a client and it lands on this calendar.{" "}
                    <button type="button" onClick={onClient} className="font-medium text-[#1d1b18] underline underline-offset-2">
                      Switch to the client view
                    </button>
                  </p>
                )}
              </aside>
            </div>
          )}
        </div>
      )}

      {open && (
        <BookingPanel
          b={patched(open)}
          today={today}
          limit={limit}
          onClose={() => setOpen(null)}
          onChange={(patch, msg) => onChange(open.ref, patch, msg)}
        />
      )}
    </div>
  );
}

type Payment = { id: string; date: string; b: Booking; kind: "Deposit" | "Final payment"; method: Pay; amount: number; state: "check" | "due" | "expected" | "received"; late?: number };

const methodOf = (b: Booking): Pay => {
  if (b.method) return b.method;
  const r = rand(`pm:${b.ref}`);
  return r < 0.55 ? "fpx" : r < 0.85 ? "duitnow" : "transfer";
};

/* Money only. Deposits to confirm, final payments that are due now the
   gallery is out, what is expected from bookings still being shot or
   edited, and what has come in over the last 30 days. */
function PaymentsView({
  today,
  list,
  limit,
  onOpen,
  onChange,
}: {
  today: string;
  list: Booking[];
  limit: number;
  onOpen: (b: Booking) => void;
  onChange: (ref: string, patch: Partial<Booking>, msg: string) => void;
}) {
  const [show, setShow] = useState<"all" | Payment["state"]>("all");
  const since = addDays(today, -30);

  const rows: Payment[] = [];
  for (const b of list) {
    const deposit = Math.min(sessionBy(b.session).deposit, b.total);
    const final = b.total - deposit;
    if (b.status === "deposit") {
      rows.push({ id: `${b.ref}-d`, date: b.log?.deposit ?? addDays(today, -Math.floor(rand(`rc:${b.ref}`) * 3)), b, kind: "Deposit", method: "transfer", amount: deposit, state: "check" });
      continue;
    }
    const depOn = reachedOn(b, "attend");
    if (depOn >= since && depOn <= today) rows.push({ id: `${b.ref}-d`, date: depOn, b, kind: "Deposit", method: methodOf(b), amount: deposit, state: "received" });
    if (final <= 0) continue;
    if (b.status === "paid" || b.status === "closed") {
      const on = reachedOn(b, "paid");
      if (on >= since && on <= today) rows.push({ id: `${b.ref}-f`, date: on, b, kind: "Final payment", method: methodOf(b), amount: final, state: "received" });
    } else if (b.status === "delivered") {
      const { due, late } = finalDue(b, limit, today);
      rows.push({ id: `${b.ref}-f`, date: due, b, kind: "Final payment", method: methodOf(b), amount: b.total - b.paid, state: "due", late });
    } else {
      const on = addDays(timeline(b).delivered, limit);
      if (on <= addDays(today, 60)) rows.push({ id: `${b.ref}-f`, date: on, b, kind: "Final payment", method: methodOf(b), amount: b.total - b.paid, state: "expected" });
    }
  }

  const of = (st: Payment["state"]) => rows.filter((r) => r.state === st);
  const check = of("check");
  const due = of("due").sort((a, b) => (b.late ?? 0) - (a.late ?? 0) || a.date.localeCompare(b.date));
  const expected = of("expected").sort((a, b) => a.date.localeCompare(b.date));
  const received = of("received").sort((a, b) => b.date.localeCompare(a.date));
  const sum = (xs: Payment[]) => xs.reduce((n, r) => n + r.amount, 0);
  const late = due.filter((r) => r.late);

  const sections: { id: Payment["state"]; title: string; note: string; rows: Payment[] }[] = [
    { id: "check", title: "Deposits to confirm", note: "Bank transfers waiting to be matched against the statement.", rows: check },
    { id: "due", title: "Final payments due", note: `The gallery is out; the client has ${limit} days to pay the balance.`, rows: due },
    { id: "expected", title: "Expected after delivery", note: "Balances on bookings still being shot, edited or reviewed.", rows: expected },
    { id: "received", title: "Received, last 30 days", note: "Deposits and final payments that have come in.", rows: received },
  ];

  const line = (r: Payment) => (
    <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 md:grid-cols-[96px_minmax(0,1.3fr)_120px_110px_110px_minmax(170px,auto)]">
      <span className={`text-[13px] tabular-nums ${r.late ? "font-medium text-[#a1371b]" : ""}`}>
        {r.date === today ? "Today" : shortDate(r.date)}
        {!!r.late && <span className="block text-[11.5px] font-normal">{r.late} days late</span>}
      </span>
      <button type="button" onClick={() => onOpen(r.b)} className="col-start-1 row-start-2 min-w-0 text-left md:col-start-auto md:row-start-auto">
        <span className="block truncate text-[14px] font-medium hover:underline">{r.b.client}</span>
        <span className="block truncate text-[12.5px] text-[#6f675d]">
          {sessionBy(r.b.session).name} · {shortDate(r.b.date)}
        </span>
      </button>
      <span className="hidden text-[13px] text-[#4a443c] md:block">{r.kind}</span>
      <span className="hidden text-[13px] text-[#4a443c] md:block">{r.state === "received" || r.state === "check" ? methodLabel[r.method] : r.state === "due" ? "Payment link" : "—"}</span>
      <span className="row-span-2 text-right text-[14px] font-medium tabular-nums md:row-span-1">{rm(r.amount)}</span>
      <span className="col-span-2 flex justify-end gap-2 md:col-span-1">
        {r.state === "check" && (
          <button type="button" onClick={() => onChange(r.b.ref, advance(r.b, today), nextStep.deposit!.say(r.b))} className="bg-[#1d1b18] px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-[#3a352e]">
            Confirm
          </button>
        )}
        {r.state === "due" && (
          <button type="button" onClick={() => onChange(r.b.ref, advance(r.b, today), nextStep.delivered!.say(r.b))} className="bg-[#1d1b18] px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-[#3a352e]">
            Record payment
          </button>
        )}
        {r.state === "expected" && <span className="px-1.5 py-0.5 text-[11.5px] text-[#6f675d]">{stageLabel[r.b.status]}</span>}
        {r.state === "received" && <span className="bg-[#e6efe6] px-1.5 py-0.5 text-[11.5px] font-medium text-[#2f5a35]">Received</span>}
      </span>
    </li>
  );

  return (
    <div className="px-4 py-5 md:px-8">
      <dl className="grid grid-cols-2 border border-[#e3ddd3] bg-white lg:grid-cols-4">
        {[
          ["Received, last 30 days", rm(sum(received)), `${received.length} payments`],
          ["Final payments due", rm(sum(due)), `${due.length} galleries delivered`],
          ["Overdue", rm(sum(late)), late.length ? `${late.length} past the ${limit}-day limit` : "Nothing late"],
          ["Deposits to confirm", String(check.length), check.length ? rm(sum(check)) : "All matched"],
        ].map(([k, v, note], i) => (
          <div key={k} className={`px-5 py-4 ${i % 2 ? "border-l border-[#e3ddd3]" : ""} ${i >= 2 ? "border-t border-[#e3ddd3] lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
            <dt className="text-[12.5px] text-[#6f675d]">{k}</dt>
            <dd className={`mt-1 text-[22px] font-semibold tabular-nums ${i === 2 && late.length ? "text-[#a1371b]" : ""}`}>{v}</dd>
            <dd className="text-[12.5px] text-[#6f675d]">{note}</dd>
          </div>
        ))}
      </dl>

      <div role="group" aria-label="Show" className="mt-5 flex flex-wrap gap-1.5">
        {(
          [
            ["all", "All", rows.length],
            ["check", "To confirm", check.length],
            ["due", "Due", due.length],
            ["expected", "Expected", expected.length],
            ["received", "Received", received.length],
          ] as const
        ).map(([id, text, n]) => (
          <button
            key={id}
            type="button"
            onClick={() => setShow(id)}
            aria-pressed={show === id}
            className={`border px-2.5 py-1 text-[12.5px] ${show === id ? "border-[#1d1b18] bg-[#1d1b18] text-white" : "border-[#d8d1c5] bg-white hover:border-[#1d1b18]"}`}
          >
            {text} <span className={`tabular-nums ${show === id ? "text-white/70" : "text-[#8a8276]"}`}>{n}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-8">
        {sections
          .filter((sec) => show === "all" || show === sec.id)
          .map((sec) => (
            <section key={sec.id}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[15px] font-semibold">
                  {sec.title} <span className="font-normal tabular-nums text-[#6f675d]">· {rm(sum(sec.rows))}</span>
                </h3>
                <p className="text-[12.5px] text-[#6f675d]">{sec.note}</p>
              </div>
              {sec.rows.length ? (
                <ul className="divide-y divide-[#ece6dc] border border-[#e3ddd3] bg-white">{sec.rows.map(line)}</ul>
              ) : (
                <p className="border border-dashed border-[#e3ddd3] px-4 py-3 text-[13px] text-[#6f675d]">Nothing here.</p>
              )}
            </section>
          ))}
      </div>
    </div>
  );
}

/* Final payments that have gone past the photographer's limit. The limit and
   how often reminders repeat are set here; each overdue client shows how many
   reminders have gone out and when the next one is due. */
function RemindersView({
  today,
  list,
  limit,
  setLimit,
  onOpen,
  onChange,
}: {
  today: string;
  list: Booking[];
  limit: number;
  setLimit: (n: number) => void;
  onOpen: (b: Booking) => void;
  onChange: (ref: string, patch: Partial<Booking>, msg: string) => void;
}) {
  const [every, setEvery] = useState(3);
  const delivered = list.filter((b) => b.status === "delivered").map((b) => ({ b, ...finalDue(b, limit, today), amount: b.total - b.paid }));
  const late = delivered.filter((r) => r.late > 0).sort((a, b) => b.late - a.late);
  const soon = delivered.filter((r) => r.late === 0).sort((a, b) => a.due.localeCompare(b.due));
  const total = late.reduce((n, r) => n + r.amount, 0);

  /* Automatic reminders go out on the due date and then every few days;
     those plus any sent by hand. */
  const sentFor = (r: (typeof late)[number]) => {
    const auto = Math.floor(r.late / every) + 1;
    const manual = r.b.nudged ?? [];
    const lastAuto = addDays(r.due, (auto - 1) * every);
    const last = [lastAuto, ...manual].sort().pop()!;
    return { count: auto + manual.length, last, next: addDays(last, every) };
  };

  const nudge = (r: (typeof late)[number]) =>
    onChange(r.b.ref, { nudged: [...(r.b.nudged ?? []), today] }, `Reminder sent to ${r.b.client} on WhatsApp, with the payment link for ${rm(r.amount)}`);

  const sample = late[0] ?? soon[0];

  return (
    <div className="px-4 py-5 md:px-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-bk-serif)] text-[30px] leading-none"><RevealText>Final payments overdue</RevealText></h2>
              <p className="mt-2 text-[13.5px] text-[#4a443c]">
                {late.length ? `${late.length} ${late.length === 1 ? "client has" : "clients have"} not paid within ${limit} days of delivery. ${rm(total)} outstanding.` : `Every client has paid within ${limit} days of delivery.`}
              </p>
            </div>
            {late.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  for (const r of late) onChange(r.b.ref, { nudged: [...(r.b.nudged ?? []), today] }, `${late.length} reminders sent on WhatsApp`);
                }}
                className={`${btnInk} px-4 py-2 text-[13.5px]`}
              >
                Remind all {late.length}
              </button>
            )}
          </div>

          {late.length ? (
            <ul className="mt-5 divide-y divide-[#ece6dc] border border-[#e3ddd3] bg-white">
              {late.map((r) => {
                const sent = sentFor(r);
                const severe = r.late > limit;
                return (
                  <li key={r.b.ref} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3.5 md:grid-cols-[88px_minmax(0,1.2fr)_minmax(0,1fr)_110px_auto]">
                    <span className={`w-fit px-2 py-1 text-[12.5px] font-semibold tabular-nums ${severe ? "bg-[#a1371b] text-white" : "bg-[#fbe3dc] text-[#a1371b]"}`}>{r.late}d late</span>
                    <button type="button" onClick={() => onOpen(r.b)} className="col-start-1 row-start-2 min-w-0 text-left md:col-start-auto md:row-start-auto">
                      <span className="block truncate text-[14px] font-medium hover:underline">{r.b.client}</span>
                      <span className="block truncate text-[12.5px] text-[#6f675d]">
                        {sessionBy(r.b.session).name} · delivered {shortDate(reachedOn(r.b, "delivered"))}, due {shortDate(r.due)}
                      </span>
                    </button>
                    <span className="hidden text-[12.5px] leading-snug text-[#4a443c] md:block">
                      {sent.count} {sent.count === 1 ? "reminder" : "reminders"} sent, last {sent.last === today ? "today" : shortDate(sent.last)}
                      <span className="block text-[#6f675d]">Next automatic: {shortDate(sent.next)}</span>
                    </span>
                    <span className="row-span-2 text-right text-[14.5px] font-semibold tabular-nums md:row-span-1">{rm(r.amount)}</span>
                    <span className="col-span-2 flex justify-end gap-2 md:col-span-1">
                      <button
                        type="button"
                        disabled={sent.last === today}
                        onClick={() => nudge(r)}
                        className="border border-[#d8d1c5] px-3 py-1.5 text-[12.5px] font-medium hover:border-[#1d1b18] disabled:opacity-40"
                      >
                        {sent.last === today ? "Sent today" : "Remind now"}
                      </button>
                      <button type="button" onClick={() => onChange(r.b.ref, advance(r.b, today), nextStep.delivered!.say(r.b))} className="bg-[#1d1b18] px-3 py-1.5 text-[12.5px] font-medium text-white hover:bg-[#3a352e]">
                        Record payment
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-5 border border-dashed border-[#e3ddd3] px-4 py-6 text-[14px] text-[#6f675d]">Nothing overdue. Nice.</p>
          )}

          <h3 className="mt-10 text-[15px] font-semibold">Due soon</h3>
          <p className="text-[12.5px] text-[#6f675d]">Delivered and still inside the {limit}-day limit.</p>
          {soon.length ? (
            <ul className="mt-3 divide-y divide-[#ece6dc] border border-[#e3ddd3] bg-white">
              {soon.map((r) => (
                <li key={r.b.ref}>
                  <button type="button" onClick={() => onOpen(r.b)} className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-[#faf8f5]">
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-medium">{r.b.client}</span>
                      <span className="block truncate text-[12.5px] text-[#6f675d]">
                        {sessionBy(r.b.session).name} · due {r.due === today ? "today" : shortDate(r.due)}
                      </span>
                    </span>
                    <span className="text-[14px] tabular-nums">{rm(r.amount)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 border border-dashed border-[#e3ddd3] px-4 py-3 text-[13px] text-[#6f675d]">No galleries waiting on payment.</p>
          )}
        </div>

        <aside className="space-y-6">
          <section className={`${card} p-5`}>
            <h3 className="text-[14px] font-semibold">Payment terms</h3>
            <label className="mt-4 block text-[13px] text-[#4a443c]">
              Final payment due within
              <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className={`${field} mt-1 py-2 text-[14px]`}>
                {[3, 7, 14, 30].map((n) => (
                  <option key={n} value={n}>
                    {n} days of delivery
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block text-[13px] text-[#4a443c]">
              After that, remind every
              <select value={every} onChange={(e) => setEvery(Number(e.target.value))} className={`${field} mt-1 py-2 text-[14px]`}>
                {[2, 3, 5, 7].map((n) => (
                  <option key={n} value={n}>
                    {n} days
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-3 text-[12.5px] leading-relaxed text-[#6f675d]">The limit also sets what counts as overdue in Payments and on the calendar.</p>
          </section>

          {sample && (
            <section className={`${card} p-5`}>
              <h3 className="text-[14px] font-semibold">The message</h3>
              <p className="mt-0.5 text-[12.5px] text-[#6f675d]">Sent on WhatsApp, in Malay.</p>
              <div className="mt-3 rounded-[10px] rounded-tl-none bg-[#e7f6dc] px-3.5 py-3 text-[13.5px] leading-relaxed text-[#1d2a17]">
                Assalamualaikum {sample.b.client}, galeri penuh anda telah dihantar pada {shortDate(reachedOn(sample.b, "delivered"))}. Baki {rm(sample.amount)} perlu dijelaskan sebelum{" "}
                {shortDate(sample.due)}. Bayar melalui pautan ini: teduh.my/bayar/{sample.b.ref.toLowerCase()}
                <br />
                Terima kasih. Aina, Teduh Studio
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function BookingPanel({
  b,
  today,
  limit,
  onClose,
  onChange,
}: {
  b: Booking;
  today: string;
  limit: number;
  onClose: () => void;
  onChange: (patch: Partial<Booking>, msg: string) => void;
}) {
  const s = sessionBy(b.session);
  const due = b.total - b.paid;
  const step = nextStep[b.status];
  /* A shoot can only be marked once its day has come. */
  const blocked = b.status === "attend" && b.date > today;
  const tl = timeline(b);
  const fd = b.status === "delivered" ? finalDue(b, limit, today) : null;

  /* The seven milestones, each with the date it happened, or is expected.
     Finishing the review and delivering the gallery happen together. */
  const delivered = reachedOn(b, "delivered");
  const milestones = [
    { label: "Collect deposit", on: reachedOn(b, "attend"), expect: "" },
    { label: "Attend event", on: b.date, expect: b.date },
    { label: "Editing", on: reachedOn(b, "review"), expect: tl.review },
    { label: "Review", on: delivered, expect: tl.delivered },
    { label: "Gallery delivered", on: delivered, expect: tl.delivered },
    { label: "Final payment", on: reachedOn(b, "paid"), expect: addDays(b.status === "delivered" ? delivered : tl.delivered, limit) },
    { label: "Closed", on: reachedOn(b, "closed"), expect: "" },
  ];
  /* Which milestone is next, for each stage. */
  const current = { deposit: 0, attend: 1, editing: 2, review: 3, delivered: 5, paid: 6, closed: 7 }[b.status];
  const note = {
    deposit: `Bank transfer receipt uploaded, ${rm(Math.min(s.deposit, b.total))}. Match it against the statement.`,
    attend: blocked ? `Deposit in. The shoot is on ${shortDate(b.date)}.` : "The shoot day has come. Mark it once you are done.",
    editing: "Culling and editing. The client gets a review link when this is done.",
    review: "The client is going through the edit and their photobook picks.",
    delivered: fd ? `Waiting for ${rm(due)}. ${fd.late ? `${fd.late} days past the ${limit}-day limit.` : `Due ${shortDate(fd.due)}.`}` : "",
    paid: "Paid in full. Close it to send the thank-you and a review request.",
    closed: "",
  }[b.status];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div onClick={onClose} className="absolute inset-0 bg-[#1d1b18]/30" />
      <aside role="dialog" aria-modal="true" aria-label={`${b.client}, ${s.name}`} className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-[#e3ddd3] px-6 py-5">
          <div className="min-w-0">
            <p className="text-[12.5px] tabular-nums text-[#6f675d]">{b.ref}</p>
            <h2 className="mt-1 font-[family-name:var(--font-bk-serif)] text-[28px] leading-tight">{b.client}</h2>
            <p className="text-[13.5px] text-[#4a443c]">
              {s.name} · {longDate(b.date)}, {clock12(b.time)}
            </p>
            <p className="text-[13.5px] text-[#6f675d]">{b.place}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 p-2 hover:bg-[#f7f4ef]">
            <PiX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h3 className="text-[12.5px] font-medium uppercase tracking-[0.08em] text-[#6f675d]">Progress</h3>
          {/* The seven steps. Done ones carry the date they happened; the
              current one carries the next action; later ones their expected
              date. */}
          <ol className="mt-3">
            {milestones.map((m, i) => {
              const done = i < current;
              const now = i === current;
              return (
                <li key={m.label} className="relative flex gap-3 pb-4 last:pb-0">
                  {i < milestones.length - 1 && <span className={`absolute left-[9px] top-5 h-[calc(100%-12px)] w-px ${done ? "bg-[#1d1b18]" : "bg-[#e3ddd3]"}`} />}
                  <span
                    className={`relative z-10 mt-0.5 flex h-[19px] w-[19px] flex-shrink-0 items-center justify-center rounded-full ${
                      done ? "bg-[#1d1b18] text-white" : now ? "border-2 border-[#1d1b18] bg-white" : "border border-[#d8d1c5] bg-white"
                    }`}
                  >
                    {done && <PiCheck className="h-3 w-3" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`flex justify-between gap-3 text-[14px] ${done ? "" : now ? "font-semibold" : "text-[#a59d91]"}`}>
                      {m.label}
                      <span className={`text-[12.5px] font-normal tabular-nums ${done ? "text-[#6f675d]" : now && fd?.late ? "font-medium text-[#a1371b]" : "text-[#a59d91]"}`}>
                        {done ? shortDate(m.on).slice(4) : m.expect ? `${now ? (i === 5 ? "due " : "") : "~"}${shortDate(m.expect).slice(4)}` : ""}
                      </span>
                    </p>
                    {now && <p className={`mt-0.5 text-[12.5px] ${fd?.late ? "font-medium text-[#a1371b]" : "text-[#6f675d]"}`}>{note}</p>}
                  </div>
                </li>
              );
            })}
          </ol>

          <dl className="mt-6 grid grid-cols-[110px_1fr] gap-y-2 border-t border-[#e3ddd3] pt-5 text-[14px]">
            <dt className="text-[#6f675d]">Total</dt>
            <dd className="tabular-nums">{rm(b.total)}</dd>
            <dt className="text-[#6f675d]">Paid</dt>
            <dd className="tabular-nums">{rm(b.paid)}</dd>
            <dt className="text-[#6f675d]">Balance</dt>
            <dd className={`tabular-nums ${fd?.late ? "font-medium text-[#a1371b]" : ""}`}>{due ? rm(due) : "Settled"}</dd>
          </dl>
        </div>

        {step && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#e3ddd3] p-4">
            {b.status === "delivered" && (
              <button
                type="button"
                disabled={(b.nudged ?? []).includes(today)}
                onClick={() => onChange({ nudged: [...(b.nudged ?? []), today] }, `Payment reminder sent to ${b.client} on WhatsApp`)}
                className={btnLine}
              >
                {(b.nudged ?? []).includes(today) ? "Reminder sent" : "Send reminder"}
              </button>
            )}
            <button type="button" disabled={blocked} onClick={() => onChange(advance(b, today), step.say(b))} className={btnInk}>
              {step.label}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
