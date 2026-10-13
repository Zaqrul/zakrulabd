"use client";

import { startTransition, useCallback, useEffect, useMemo, useRef, useState, ViewTransition, type CSSProperties } from "react";
import Link from "next/link";
import { Fraunces } from "next/font/google";
import type { IconType } from "react-icons";
import {
  PiArrowLeft,
  PiArrowRight,
  PiBankDuotone,
  PiCoffeeBeanDuotone,
  PiCoffeeDuotone,
  PiCookieDuotone,
  PiCreditCardDuotone,
  PiDressDuotone,
  PiGiftDuotone,
  PiHeart,
  PiHeartFill,
  PiJarDuotone,
  PiLampDuotone,
  PiMagnifyingGlass,
  PiMinus,
  PiPlus,
  PiScissorsFill,
  PiPottedPlantDuotone,
  PiQrCodeDuotone,
  PiShieldCheckDuotone,
  PiShoppingBagDuotone,
  PiStarFill,
  PiTShirtDuotone,
  PiTeaBagDuotone,
  PiToteDuotone,
  PiTrash,
  PiTruckDuotone,
  PiArrowCounterClockwiseDuotone,
  PiX,
} from "react-icons/pi";
import { wa, waMessages } from "@/lib/contact";
import { RollingAmount } from "@/components/showcase/rolling-amount";
import { RevealText } from "@/components/reveal-text";

/* The store has its own identity, not the portfolio's: a client's shop should
   look like the client's brand. A serif for the brand voice, warm cream and a
   deep green, with terracotta for prices and calls to action. */
const serif = Fraunces({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-store-serif" });

type Category = "Apparel" | "Home" | "Pantry" | "Gifts";

type Product = {
  id: string;
  name: string;
  maker: string;
  category: Category;
  price: number;
  was?: number;
  badge?: "New" | "Best seller";
  rating: number;
  reviews: number;
  Icon: IconType;
  tint: string;
  motion: Motion;
};

/* How each drawing moves while its tile is hovered, picked to suit the object:
   a lamp swings from its cord, a plant sways from its pot, a cup steams. */
type Motion = "wiggle" | "float" | "swing" | "sway" | "hop" | "steam";

const iconMotion: Record<Motion, string> = {
  wiggle: "motion-safe:group-hover:animate-[icon-wiggle_0.9s_ease-in-out_infinite]",
  float: "motion-safe:group-hover:animate-[icon-float_1.6s_ease-in-out_infinite]",
  swing: "origin-top motion-safe:group-hover:animate-[icon-swing_1.6s_ease-in-out_infinite]",
  sway: "origin-bottom motion-safe:group-hover:animate-[icon-sway_1.8s_ease-in-out_infinite]",
  hop: "motion-safe:group-hover:animate-[icon-hop_0.9s_ease-in-out_infinite]",
  steam: "",
};

/* Fictional products. Drawings stand in for photography so the page carries
   no stock images and no real brand. */
const products: Product[] = [
  { id: "batik-shirt", name: "Batik Lepas Shirt", maker: "Kelantan", category: "Apparel", price: 89, badge: "Best seller", rating: 4.8, reviews: 214, Icon: PiTShirtDuotone, tint: "bg-[#f6e7d3] text-[#b5652f]", motion: "wiggle" },
  { id: "kurta-dress", name: "Batik Kurta Dress", maker: "Terengganu", category: "Apparel", price: 129, badge: "New", rating: 4.7, reviews: 38, Icon: PiDressDuotone, tint: "bg-[#e3ece4] text-[#2f5d46]", motion: "wiggle" },
  { id: "kopi-ipoh", name: "Kopi Ipoh Beans, 250g", maker: "Ipoh, Perak", category: "Pantry", price: 32, badge: "Best seller", rating: 4.9, reviews: 502, Icon: PiCoffeeBeanDuotone, tint: "bg-[#eadfd6] text-[#6b3f26]", motion: "float" },
  { id: "teh-tarik", name: "Teh Tarik Blend", maker: "Cameron Highlands", category: "Pantry", price: 24, rating: 4.6, reviews: 167, Icon: PiTeaBagDuotone, tint: "bg-[#f1e9d2] text-[#8a6a1f]", motion: "swing" },
  { id: "kaya-jar", name: "Pandan Kaya, 300g", maker: "Melaka", category: "Pantry", price: 18, was: 21, rating: 4.8, reviews: 289, Icon: PiJarDuotone, tint: "bg-[#e1eedb] text-[#4e7a3a]", motion: "hop" },
  { id: "kuih-bangkit", name: "Kuih Bangkit Tin", maker: "Penang", category: "Pantry", price: 22, rating: 4.7, reviews: 96, Icon: PiCookieDuotone, tint: "bg-[#f4e4dc] text-[#a2553a]", motion: "hop" },
  { id: "clay-cups", name: "Clay Kopi Cups, set of 2", maker: "Sayong, Perak", category: "Home", price: 58, rating: 4.9, reviews: 73, Icon: PiCoffeeDuotone, tint: "bg-[#ecdccf] text-[#8c4a2f]", motion: "steam" },
  { id: "rattan-lamp", name: "Rattan Pendant Lamp", maker: "Sarawak", category: "Home", price: 149, badge: "New", rating: 4.8, reviews: 21, Icon: PiLampDuotone, tint: "bg-[#efe6d4] text-[#7a5a24]", motion: "swing" },
  { id: "monstera", name: "Terracotta Planter", maker: "Johor", category: "Home", price: 65, was: 79, rating: 4.6, reviews: 58, Icon: PiPottedPlantDuotone, tint: "bg-[#dfeae3] text-[#2f6b4f]", motion: "sway" },
  { id: "linen-tote", name: "Mengkuang Tote", maker: "Pahang", category: "Gifts", price: 45, rating: 4.7, reviews: 132, Icon: PiToteDuotone, tint: "bg-[#ece7d8] text-[#6f6a3a]", motion: "swing" },
  { id: "raya-box", name: "Raya Gift Box", maker: "Curated set", category: "Gifts", price: 119, badge: "Best seller", rating: 4.9, reviews: 147, Icon: PiGiftDuotone, tint: "bg-[#f5e0d8] text-[#b0493a]", motion: "hop" },
  { id: "bag-set", name: "Songket Pouch", maker: "Terengganu", category: "Gifts", price: 39, rating: 4.5, reviews: 44, Icon: PiShoppingBagDuotone, tint: "bg-[#e6e1ef] text-[#5a4a8a]", motion: "hop" },
];

const categories: ("All" | Category)[] = ["All", "Apparel", "Home", "Pantry", "Gifts"];

const delivery = [
  { id: "standard", label: "Standard delivery", note: "2 to 4 working days, Peninsular Malaysia", price: 8 },
  { id: "sameday", label: "Same-day delivery", note: "Klang Valley, order before 1pm", price: 15 },
] as const;

const payments = [
  { id: "fpx", label: "FPX online banking", Icon: PiBankDuotone },
  { id: "duitnow", label: "DuitNow QR", Icon: PiQrCodeDuotone },
  { id: "card", label: "Debit or credit card", Icon: PiCreditCardDuotone },
] as const;

const FREE_DELIVERY_FROM = 150;

/* Sales tax on goods, charged on the subtotal after any coupon. Delivery is
   not taxed. */
const SST_RATE = 0.1;

/* Demo codes, shown under the field so a visitor can try one. */
const coupons: Record<string, { label: string; min?: number; discount: (subtotal: number) => number }> = {
  RAYA15: { label: "15% off", discount: (s) => s * 0.15 },
  WELCOME10: { label: "RM 10 off orders from RM 80", min: 80, discount: () => 10 },
};

const round2 = (n: number) => Math.round(n * 100) / 100;

const rm = (n: number) => `RM ${n.toFixed(2)}`;

/* Tilts a product tile towards the mouse and moves a soft glare with it.
   Mouse only: touch has no hover, and reduced motion opts out. */
function tilt(e: React.PointerEvent<HTMLDivElement>) {
  if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
  el.style.setProperty("--rx", `${(0.5 - y) * 12}deg`);
  el.style.setProperty("--gx", `${x * 100}%`);
  el.style.setProperty("--gy", `${y * 100}%`);
}

function untilt(e: React.PointerEvent<HTMLDivElement>) {
  e.currentTarget.style.setProperty("--rx", "0deg");
  e.currentTarget.style.setProperty("--ry", "0deg");
}

const confettiColors = ["bg-[#c8643b]", "bg-[#d79a2b]", "bg-[#2f6b4f]", "bg-[#5a4a8a]"];

type Flyer = { key: number; product: Product; x: number; y: number; dx: number; dy: number };

const FLYER_SIZE = 72;

/* A copy of the product's drawing that arcs from its tile into the cart
   button, shrinking as it goes, then tells the parent it has landed. */
function FlyToCart({ flyer, onLanded }: { flyer: Flyer; onLanded: (key: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { dx, dy } = flyer;
    const flight = el.animate(
      [
        { transform: "translate(0, 0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(0.75)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0.5 },
      ],
      { duration: 700, easing: "cubic-bezier(0.45, 0, 0.55, 1)", fill: "forwards" },
    );
    flight.onfinish = () => onLanded(flyer.key);
    return () => flight.cancel();
  }, [flyer, onLanded]);

  const { Icon, tint } = flyer.product;
  return (
    <div
      ref={ref}
      aria-hidden
      style={{ left: flyer.x, top: flyer.y, width: FLYER_SIZE, height: FLYER_SIZE }}
      className={`pointer-events-none fixed z-[60] flex items-center justify-center rounded-2xl shadow-lg ${tint}`}
    >
      <Icon className="h-9 w-9" />
    </div>
  );
}

export function StoreShowcase() {
  const [category, setCategoryNow] = useState<(typeof categories)[number]>("All");
  const [sort, setSortNow] = useState<"featured" | "low" | "high">("featured");

  /* Filtering and sorting run as transitions, so the product cards'
     ViewTransitions animate: leavers shrink out, arrivals rise in, and the
     ones that stay slide to their new place. */
  const setCategory = (c: (typeof categories)[number]) => startTransition(() => setCategoryNow(c));
  const setSort = (v: "featured" | "low" | "high") => startTransition(() => setSortNow(v));
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({ "kopi-ipoh": 1 });
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [step, setStepNow] = useState<"cart" | "checkout" | "done">("cart");
  /* Which way the drawer's content slides when the step changes. */
  const [stepDir, setStepDir] = useState<"none" | "forward" | "back">("none");
  const setStep = (next: "cart" | "checkout" | "done", dir: "none" | "forward" | "back" = "none") => {
    setStepDir(dir);
    setStepNow(next);
  };
  const [shipping, setShipping] = useState<(typeof delivery)[number]["id"]>("standard");
  const [payment, setPayment] = useState<(typeof payments)[number]["id"]>("fpx");
  const [toast, setToast] = useState<string | null>(null);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  /* A deleted row is cut along a dashed line, splits in two, then collapses. */
  const [removing, setRemoving] = useState<Record<string, "cut" | "split" | "gone">>({});
  const [bump, setBump] = useState(0);
  const cartButton = useRef<HTMLButtonElement>(null);
  const shopRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  /* Typing in the header search changes how tall the grid is. If the reader is
     already down in the products, a shorter grid would make the browser clamp
     the scroll and the page would jump up and down with each key. Instead,
     bring the top of the results under the header once, and keep the results
     area tall enough that further typing does not move anything. */
  function search(value: string) {
    setQuery(value);
    const shop = shopRef.current;
    const header = headerRef.current;
    if (!shop || !header) return;
    const headerBottom = header.getBoundingClientRect().bottom;
    const shopTop = shop.getBoundingClientRect().top;
    if (shopTop < headerBottom - 1) {
      window.scrollTo({ top: window.scrollY + shopTop - headerBottom, behavior: "instant" });
    }
  }

  const landed = useCallback((key: number) => {
    setFlyers((f) => f.filter((x) => x.key !== key));
    setBump((b) => b + 1);
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter(
      (p) => (category === "All" || p.category === category) && (!q || `${p.name} ${p.maker}`.toLowerCase().includes(q)),
    );
    if (sort === "low") return [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [category, sort, query]);

  const lines = products.filter((p) => cart[p.id]).map((p) => ({ ...p, qty: cart[p.id] }));
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0);
  const shippingFee = subtotal >= FREE_DELIVERY_FROM && shipping === "standard" ? 0 : delivery.find((d) => d.id === shipping)!.price;
  const coupon = appliedCode ? coupons[appliedCode] : undefined;
  const couponShort = coupon?.min !== undefined && subtotal < coupon.min;
  const discount = coupon && !couponShort ? round2(Math.min(coupon.discount(subtotal), subtotal)) : 0;
  const sst = round2((subtotal - discount) * SST_RATE);
  const total = subtotal - discount + sst + (lines.length ? shippingFee : 0);

  /* Escape closes the drawer, and the page behind it stops scrolling. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  function add(p: Product, tile?: HTMLElement | null) {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] ?? 0) + 1 }));
    setToast(`${p.name} added to cart`);

    /* With reduced motion, or nothing to fly from, the badge still bumps. */
    const to = cartButton.current?.getBoundingClientRect();
    if (!tile || !to || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setBump((b) => b + 1);
      return;
    }
    const from = tile.getBoundingClientRect();
    const x = from.left + from.width / 2 - FLYER_SIZE / 2;
    const y = from.top + from.height / 2 - FLYER_SIZE / 2;
    const dx = to.left + to.width / 2 - (x + FLYER_SIZE / 2);
    const dy = to.top + to.height / 2 - (y + FLYER_SIZE / 2);
    setFlyers((f) => [...f, { key: Date.now() + Math.random(), product: p, x, y, dx, dy }]);
  }

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (!coupons[code]) {
      setCouponError(`"${code}" is not a valid code.`);
      return;
    }
    setAppliedCode(code);
    setCouponInput("");
    setCouponError(null);
  }

  function remove(id: string) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setQty(id, 0);
      return;
    }
    setRemoving((r) => ({ ...r, [id]: "cut" }));
    setTimeout(() => setRemoving((r) => ({ ...r, [id]: "split" })), 460);
    setTimeout(() => setRemoving((r) => ({ ...r, [id]: "gone" })), 860);
    setTimeout(() => {
      setQty(id, 0);
      setRemoving((r) => {
        const next = { ...r };
        delete next[id];
        return next;
      });
    }, 1160);
  }

  function setQty(id: string, qty: number) {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }

  function toggleLike(id: string) {
    setLiked((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openCart() {
    setStep("cart");
    setOpen(true);
  }

  /* One cart line. Rendered once normally, and twice while it is being cut in
     half, so it lives in one place. */
  function cartRow(l: (typeof lines)[number]) {
    return (
      <div className="flex gap-3 py-4">
        <div className={`flex h-20 w-16 flex-shrink-0 items-center justify-center rounded-xl ${l.tint}`}>
          <l.Icon aria-hidden className="h-8 w-8" />
        </div>
        {/* Two rows edge to edge: name and line total on top, quantity and
            delete underneath, so the delete sits under the price. */}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-snug">{l.name}</p>
              <p className="text-[12.5px] text-[#8a7f70]">{rm(l.price)}</p>
            </div>
            <p className="flex-shrink-0 text-[14px] font-semibold">{rm(l.qty * l.price)}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center rounded-full border border-[#e2d7c5] bg-white">
              <button type="button" onClick={() => setQty(l.id, l.qty - 1)} aria-label={`One less ${l.name}`} className="p-2">
                <PiMinus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-[13.5px] font-semibold">{l.qty}</span>
              <button type="button" onClick={() => setQty(l.id, l.qty + 1)} aria-label={`One more ${l.name}`} className="p-2">
                <PiPlus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => remove(l.id)}
              aria-label={`Delete ${l.name}`}
              className="inline-flex items-center gap-1.5 py-2 text-[13px] font-medium text-[#8a7f70] hover:text-[#c8643b]"
            >
              <PiTrash aria-hidden className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${serif.variable} min-h-screen bg-[#faf6ef] text-[#2a2620]`}>
      {/* Showcase frame: says plainly that this is a demo, and leads back. */}
      <div className="bg-navy px-4 py-2.5 text-[12.5px] text-white/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          <Link href="/" className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-amber-400">
            <PiArrowLeft aria-hidden className="h-3.5 w-3.5" /> Back to Zakrul
          </Link>
          <span className="hidden sm:inline">Design showcase. A demo store: nothing here is for sale.</span>
          <a href={wa(waMessages.store)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-amber-400 px-3 py-1 font-bold text-navy hover:bg-amber-300">
            Build a store like this
          </a>
        </div>
      </div>

      <div className="bg-[#1f3a2e] px-4 py-2 text-center text-[12.5px] font-medium text-[#f3eadb]">
        Free standard delivery on orders above RM {FREE_DELIVERY_FROM} in Peninsular Malaysia
      </div>

      <header ref={headerRef} className="store-header sticky top-0 z-30 border-b border-[#e8dfd0] bg-[#faf6ef]/90 backdrop-blur">
        <div className="store-header-bar mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2.5 px-4 py-3.5 sm:flex-nowrap md:gap-x-8">
          <span className="font-[family-name:var(--font-store-serif)] text-[22px] font-semibold tracking-tight text-[#1f3a2e]">Serambi</span>
          <nav className="hidden gap-6 text-[14px] font-medium text-[#5a5248] md:flex">
            {categories.slice(1).map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} className="hover:text-[#1f3a2e]">
                {c}
              </button>
            ))}
          </nav>
          <label className="order-last flex min-w-0 flex-1 basis-full items-center gap-2 rounded-full sm:order-none sm:ml-auto sm:max-w-[260px] sm:basis-auto border border-[#e2d7c5] bg-white px-3.5 py-2 text-[13.5px] focus-within:border-[#1f3a2e]">
            <PiMagnifyingGlass aria-hidden className="h-4 w-4 flex-shrink-0 text-[#8a7f70]" />
            <span className="sr-only">Search products</span>
            <input
              value={query}
              onChange={(e) => search(e.target.value)}
              placeholder="Search kopi, batik..."
              className="w-full min-w-0 bg-transparent outline-none placeholder:text-[#a69b8b]"
            />
          </label>
          <button
            type="button"
            ref={cartButton}
            onClick={openCart}
            className="relative ml-auto inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-[#1f3a2e] px-4 py-2 sm:ml-0 text-[13.5px] font-semibold text-white hover:bg-[#2a4d3d]"
          >
            <PiShoppingBagDuotone aria-hidden className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {/* Keyed on each landing so the bump animation restarts. */}
            <span
              key={bump}
              className={`flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c8643b] px-1 text-[11px] font-bold ${bump ? "animate-[cart-bump_450ms_ease-out]" : ""}`}
            >
              {count}
            </span>
          </button>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#c8643b]">Batik, kopi and homeware</p>
            <h1 className="mt-4 font-[family-name:var(--font-store-serif)] text-[40px] font-semibold leading-[1.05] tracking-tight text-[#1f3a2e] md:text-[58px]">
              <RevealText immediate>Made in small workshops across Malaysia.</RevealText>
            </h1>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-[#5a5248]">
              Batik, clay cups, rattan and pantry items from small producers. We pack orders in Ipoh and ship across Peninsular Malaysia.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              <a href="#shop" className="inline-flex items-center gap-2 rounded-full bg-[#c8643b] px-5 py-3 text-[14px] sm:px-6 sm:text-[14.5px] font-semibold text-white hover:bg-[#b3552f]">
                Shop all products <PiArrowRight aria-hidden className="h-4 w-4" />
              </a>
              <button type="button" onClick={() => setCategory("Gifts")} className="rounded-full border border-[#1f3a2e]/25 px-5 py-3 text-[14px] sm:px-6 sm:text-[14.5px] font-semibold text-[#1f3a2e] hover:border-[#1f3a2e]">
                Raya gifts
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 md:grid-cols-2">
            {[products[0], products[6], products[2], products[7]].map((p, i) => (
              <div
                key={p.id}
                style={{ "--speed": `${[40, 90, 70, 120][i]}px` } as CSSProperties}
                className={`store-parallax flex aspect-square items-center justify-center rounded-2xl md:rounded-3xl ${p.tint} ${i % 2 ? "translate-y-3 md:translate-y-6" : ""}`}
              >
                <p.Icon aria-hidden className="h-2/5 w-2/5" />
              </div>
            ))}
          </div>
        </section>

        {/* Trust strip */}
        <section className="border-y border-[#e8dfd0] bg-white/60">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 text-[13.5px] sm:grid-cols-3">
            {[
              { Icon: PiTruckDuotone, title: "Delivered in 2 to 4 days", body: "Same-day in the Klang Valley", anim: "store-drive" },
              { Icon: PiShieldCheckDuotone, title: "Secure checkout", body: "FPX, DuitNow QR and cards", anim: "store-shield" },
              { Icon: PiArrowCounterClockwiseDuotone, title: "Easy returns", body: "Within 14 days of delivery", anim: "store-return" },
            ].map(({ Icon, title, body, anim }) => (
              <div key={title} className="flex items-center gap-3">
                <Icon aria-hidden className={`h-7 w-7 flex-shrink-0 text-[#1f3a2e] ${anim}`} />
                <div>
                  <p className="font-semibold text-[#2a2620]">{title}</p>
                  <p className="text-[#7a6f60]">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shop */}
        <section id="shop" ref={shopRef} className="mx-auto max-w-6xl scroll-mt-28 px-4 py-14 sm:scroll-mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-[family-name:var(--font-store-serif)] text-[32px] font-semibold tracking-tight text-[#1f3a2e]">
              <RevealText key={category}>{category === "All" ? "All products" : category}</RevealText>
            </h2>
            <label className="flex items-center gap-2 text-[13.5px] text-[#5a5248]">
              Sort by
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-full border border-[#e2d7c5] bg-white px-3 py-1.5 text-[13.5px] text-[#2a2620] outline-none focus:border-[#1f3a2e]"
              >
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          </div>

          <div className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-[13.5px] font-medium transition ${
                  category === c ? "bg-[#1f3a2e] text-white" : "border border-[#e2d7c5] bg-white text-[#5a5248] hover:border-[#1f3a2e]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <p className="mt-12 min-h-[100svh] text-center text-[15px] text-[#7a6f60]">Nothing matches &ldquo;{query}&rdquo;. Try a shorter word.</p>
          ) : (
            <div className={`mt-8 grid grid-cols-2 content-start gap-x-4 gap-y-8 [overflow-anchor:none] md:grid-cols-3 lg:grid-cols-4 ${query ? "min-h-[100svh]" : ""}`}>
              {shown.map((p) => (
                <ViewTransition key={p.id} name={`product-${p.id}`} enter="product-in" exit="product-out">
                  <article className="store-reveal group flex flex-col">
                    <div
                      onPointerMove={tilt}
                      onPointerLeave={untilt}
                      className={`relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl transition-transform duration-200 ease-out [transform:perspective(800px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] ${p.tint}`}
                    >
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_var(--gx,50%)_var(--gy,50%),rgba(255,255,255,0.45),transparent_55%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      />
                      <p.Icon aria-hidden className={`h-2/5 w-2/5 ${iconMotion[p.motion]}`} />
                      {p.motion === "steam" && (
                        <span aria-hidden className="pointer-events-none absolute left-[44%] top-[22%] flex -translate-x-1/2 gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              style={{ animationDelay: `${i * 0.35}s` }}
                              className="h-5 w-1 rounded-full bg-current opacity-0 motion-safe:group-hover:animate-[steam_1.6s_ease-out_infinite]"
                            />
                          ))}
                        </span>
                      )}
                      {p.badge && (
                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#1f3a2e]">{p.badge}</span>
                      )}
                      {p.was && (
                        <span className="absolute left-3 top-3 rounded-full bg-[#c8643b] px-2.5 py-1 text-[11px] font-bold text-white">
                          -{Math.round((1 - p.price / p.was) * 100)}%
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleLike(p.id)}
                        aria-label={liked.has(p.id) ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
                        aria-pressed={liked.has(p.id)}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#2a2620] hover:text-[#c8643b]"
                      >
                        {liked.has(p.id) ? (
                          <>
                            <PiHeartFill className="h-4 w-4 text-[#c8643b] motion-safe:animate-[heart-pop_450ms_cubic-bezier(0.17,0.89,0.32,1.49)]" />
                            {/* A ring of dots bursts out once when the heart is filled. */}
                            <span aria-hidden className="pointer-events-none absolute inset-0">
                              {Array.from({ length: 8 }, (_, i) => (
                                <span
                                  key={i}
                                  style={{ "--a": `${i * 45}deg` } as CSSProperties}
                                  className={`absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full opacity-0 motion-safe:animate-[heart-burst_550ms_ease-out] ${
                                    i % 2 ? "bg-[#d79a2b]" : "bg-[#c8643b]"
                                  }`}
                                />
                              ))}
                            </span>
                          </>
                        ) : (
                          <PiHeart className="h-4 w-4" />
                        )}
                      </button>
                      {/* Phones have no hover, so a small round button stays visible
                          and leaves the drawing uncovered. */}
                      <button
                        type="button"
                        onClick={(e) => add(p, e.currentTarget.parentElement)}
                        aria-label={`Add ${p.name} to cart`}
                        className="absolute bottom-2.5 right-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-[#1f3a2e] text-white shadow-md active:scale-95 md:hidden"
                      >
                        <PiPlus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => add(p, e.currentTarget.parentElement)}
                        className="absolute inset-x-3 bottom-3 hidden translate-y-2 rounded-full bg-[#1f3a2e] py-2.5 text-[13px] font-semibold text-white opacity-0 transition duration-200 hover:bg-[#2a4d3d] focus:translate-y-0 focus:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 md:block"
                      >
                        Add to cart
                      </button>
                    </div>
                    <p className="mt-3 text-[11.5px] font-medium uppercase tracking-wide text-[#8a7f70]">{p.maker}</p>
                    <h3 className="mt-1 text-[15px] font-semibold leading-snug text-[#2a2620]">{p.name}</h3>
                    <div className="mt-1 flex items-center gap-1 text-[12.5px] text-[#7a6f60]">
                      <PiStarFill aria-hidden className="h-3.5 w-3.5 text-[#d79a2b]" />
                      {p.rating} <span>({p.reviews})</span>
                    </div>
                    <p className="mt-1.5 text-[15px] font-bold text-[#c8643b]">
                      {rm(p.price)}
                      {p.was && <span className="ml-2 text-[13px] font-medium text-[#a69b8b] line-through">{rm(p.was)}</span>}
                    </p>
                  </article>
                </ViewTransition>
              ))}
            </div>
          )}
        </section>

        {/* Where the products come from, said once and plainly. */}
        <section className="bg-[#1f3a2e] text-[#f3eadb]">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="font-[family-name:var(--font-store-serif)] text-[30px] font-semibold leading-tight md:text-[38px]">
              <RevealText>Who makes what we sell</RevealText>
            </h2>
            <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-[#f3eadb]/75">
              Most of the range comes from about 40 small producers: potters in Sayong, batik workshops in Kota Bharu, a family roaster in
              Ipoh. Each product shows the town it comes from, so you know who you are buying from.
            </p>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-10 text-[13px] text-[#7a6f60]">
        <span className="font-[family-name:var(--font-store-serif)] text-[18px] font-semibold text-[#1f3a2e]">Serambi</span>
        <span>A demo store designed and built by Zakrul. Serambi is not a real business.</span>
      </footer>

      {flyers.map((f) => (
        <FlyToCart key={f.key} flyer={f} onLanded={landed} />
      ))}

      {/* Toast */}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#2a2620] px-5 py-2.5 text-[13.5px] font-medium text-white shadow-lg transition ${
          toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        {toast}
      </div>

      {/* Cart drawer */}
      <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Shopping cart"
          className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#faf6ef] shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#e8dfd0] px-5 py-4">
            <h2 className="font-[family-name:var(--font-store-serif)] text-[22px] font-semibold text-[#1f3a2e]">
              <RevealText key={step}>{step === "cart" ? `Your cart (${count})` : step === "checkout" ? "Checkout" : "Order placed"}</RevealText>
            </h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close cart" className="rounded-full p-2 hover:bg-black/5">
              <PiX className="h-5 w-5" />
            </button>
          </div>

          {step === "done" ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              {/* The tick draws itself inside a circle that pops in, with a ring
                  spreading out behind it. */}
              <div aria-hidden className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-[#2f6b4f]/30 opacity-0 motion-safe:animate-[done-ring_900ms_ease-out_250ms]" />
                <svg viewBox="0 0 52 52" className="relative h-16 w-16">
                  <circle cx="26" cy="26" r="24" fill="#2f6b4f" className="origin-center [transform-box:fill-box] motion-safe:animate-[done-pop_400ms_cubic-bezier(0.17,0.89,0.32,1.3)_both]" />
                  <path
                    d="M15 27 l7 7 l15 -16"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray="1"
                    className="motion-safe:animate-[done-check_400ms_ease-out_300ms_both]"
                  />
                </svg>
              </div>
              <p className="mt-4 font-[family-name:var(--font-store-serif)] text-[24px] font-semibold text-[#1f3a2e]">Terima kasih!</p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[#5a5248]">
                Order #SRB-1042 is confirmed. In a real store, this is where the customer gets an email and a WhatsApp update.
              </p>
              <p className="mt-4 rounded-xl bg-[#f3eadb] px-4 py-3 text-[13px] text-[#7a5a24]">This is a demo. No order was placed and no payment was taken.</p>
              <a href={wa(waMessages.store)} target="_blank" rel="noopener noreferrer" className="mt-6 rounded-full bg-[#c8643b] px-6 py-3 text-[14px] font-semibold text-white hover:bg-[#b3552f]">
                Build a store like this
              </a>
              <button
                type="button"
                onClick={() => {
                  setCart({});
                  setAppliedCode(null);
                  setStep("cart");
                  setOpen(false);
                }}
                className="mt-3 text-[13.5px] font-semibold text-[#1f3a2e] underline underline-offset-4"
              >
                Back to the shop
              </button>
            </div>
          ) : lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <PiShoppingBagDuotone aria-hidden className="h-12 w-12 text-[#a69b8b]" />
              <p className="mt-3 text-[15px] text-[#5a5248]">Your cart is empty.</p>
              <button type="button" onClick={() => setOpen(false)} className="mt-5 rounded-full bg-[#1f3a2e] px-6 py-2.5 text-[14px] font-semibold text-white">
                Keep shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4">
                <div
                  key={step}
                  className={
                    stepDir === "forward"
                      ? "motion-safe:animate-[step-in-right_320ms_cubic-bezier(0.2,0,0,1)]"
                      : stepDir === "back"
                        ? "motion-safe:animate-[step-in-left_320ms_cubic-bezier(0.2,0,0,1)]"
                        : ""
                  }
                >
                  {step === "cart" ? (
                    <>
                      {subtotal < FREE_DELIVERY_FROM ? (
                        <div className="mb-4 rounded-xl bg-white p-3 text-[13px] text-[#5a5248]">
                          Add {rm(FREE_DELIVERY_FROM - subtotal)} more for free standard delivery.
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ece3d3]">
                            <div className="h-full rounded-full bg-[#2f6b4f] transition-all" style={{ width: `${(subtotal / FREE_DELIVERY_FROM) * 100}%` }} />
                          </div>
                        </div>
                      ) : (
                        <p className="mb-4 rounded-xl bg-[#e1eedb] p-3 text-[13px] font-medium text-[#2f5d46]">You get free standard delivery.</p>
                      )}
                      <ul className="divide-y divide-[#e8dfd0]">
                        {lines.map((l) => (
                          <li
                            key={l.id}
                            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                              removing[l.id] === "gone" ? "grid-rows-[0fr] border-transparent opacity-0" : "grid-rows-[1fr]"
                            }`}
                          >
                            <div className={`min-h-0 ${removing[l.id] === "gone" ? "overflow-hidden" : ""}`}>
                              <div className="relative">
                                {removing[l.id] === "split" || removing[l.id] === "gone" ? (
                                  /* Split along the cut: two copies of the row, each clipped to
                                     one half, drift apart and fade. */
                                  <>
                                    <div inert className="animate-[cut-top_420ms_cubic-bezier(0.4,0,0.2,1)_forwards] [clip-path:inset(0_0_50%_0)]">
                                      {cartRow(l)}
                                    </div>
                                    <div inert className="absolute inset-0 animate-[cut-bottom_420ms_cubic-bezier(0.4,0,0.2,1)_forwards] [clip-path:inset(50%_0_0_0)]">
                                      {cartRow(l)}
                                    </div>
                                  </>
                                ) : (
                                  <div inert={!!removing[l.id]} className={`transition-opacity duration-300 ${removing[l.id] ? "opacity-70" : ""}`}>
                                    {cartRow(l)}
                                  </div>
                                )}
                                {removing[l.id] === "cut" && (
                                  /* A dashed cutting line drawn by scissors that snip across the row. */
                                  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 z-10">
                                    <span className="absolute left-0 top-0 h-[2px] w-full origin-left -translate-y-1/2 animate-[cut-line_450ms_ease-in-out_forwards] bg-[repeating-linear-gradient(90deg,#c8643b_0_6px,transparent_6px_10px)]" />
                                    <span className="absolute top-0 -translate-x-1/2 -translate-y-1/2 animate-[scissor-run_450ms_ease-in-out_forwards] rounded-full bg-[#faf6ef] p-0.5">
                                      <PiScissorsFill className="h-5 w-5 rotate-180 animate-[snip_150ms_ease-in-out_3] text-[#c8643b]" />
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <fieldset>
                        <legend className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[#8a7f70]">Delivery</legend>
                        <div className="space-y-2">
                          {delivery.map((d) => (
                            <label
                              key={d.id}
                              className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-3.5 ${shipping === d.id ? "border-[#1f3a2e]" : "border-[#e2d7c5]"}`}
                            >
                              <input type="radio" name="shipping" checked={shipping === d.id} onChange={() => setShipping(d.id)} className="accent-[#1f3a2e]" />
                              <span className="flex-1">
                                <span className="block text-[14px] font-semibold">{d.label}</span>
                                <span className="block text-[12.5px] text-[#8a7f70]">{d.note}</span>
                              </span>
                              <span className="text-[13.5px] font-semibold">
                                {d.id === "standard" && subtotal >= FREE_DELIVERY_FROM ? "Free" : rm(d.price)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <fieldset>
                        <legend className="mb-2 text-[13px] font-bold uppercase tracking-wide text-[#8a7f70]">Payment</legend>
                        <div className="space-y-2">
                          {payments.map(({ id, label, Icon }) => (
                            <label
                              key={id}
                              className={`flex cursor-pointer items-center gap-3 rounded-xl border bg-white p-3.5 ${payment === id ? "border-[#1f3a2e]" : "border-[#e2d7c5]"}`}
                            >
                              <input type="radio" name="payment" checked={payment === id} onChange={() => setPayment(id)} className="accent-[#1f3a2e]" />
                              <Icon aria-hidden className="h-5 w-5 text-[#1f3a2e]" />
                              <span className="text-[14px] font-semibold">{label}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <p className="rounded-xl bg-[#f3eadb] px-4 py-3 text-[12.5px] leading-relaxed text-[#7a5a24]">
                        Demo checkout: there are no address or card fields, and nothing is charged.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-[#e8dfd0] bg-white px-5 py-4">
                {step === "cart" && (
                  <div className="mb-4">
                    {appliedCode ? (
                      <div
                        key={appliedCode}
                        className="relative flex items-center justify-between gap-3 overflow-visible rounded-xl bg-[#e1eedb] px-3.5 py-2.5 text-[13px] text-[#2f5d46] motion-safe:animate-[coupon-in_380ms_cubic-bezier(0.17,0.89,0.32,1.3)]"
                      >
                        {/* A shine passes over the chip once, and confetti bursts from it. */}
                        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                          <span className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-0 motion-safe:animate-[coupon-shine_900ms_ease-out_200ms]" />
                        </span>
                        <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
                          {Array.from({ length: 14 }, (_, i) => (
                            <span
                              key={i}
                              style={{ "--a": `${i * (360 / 14)}deg`, "--d": `${34 + (i % 3) * 12}px` } as CSSProperties}
                              className={`absolute left-0 top-0 h-2 w-1 rounded-[1px] opacity-0 motion-safe:animate-[confetti-burst_750ms_cubic-bezier(0.2,0.7,0.4,1)] ${confettiColors[i % confettiColors.length]}`}
                            />
                          ))}
                        </span>
                        <span className="relative">
                          <span className="font-bold">{appliedCode}</span> applied: {coupon!.label}
                          {couponShort && <span className="block text-[#a2553a]">Add {rm(coupon!.min! - subtotal)} more to use this code.</span>}
                        </span>
                        <button type="button" onClick={() => setAppliedCode(null)} className="relative font-semibold underline underline-offset-2">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          applyCoupon();
                        }}
                      >
                        <div className="flex gap-2">
                          <label className="sr-only" htmlFor="coupon">
                            Promo code
                          </label>
                          <input
                            id="coupon"
                            value={couponInput}
                            onChange={(e) => {
                              setCouponInput(e.target.value);
                              setCouponError(null);
                            }}
                            placeholder="Promo code"
                            autoComplete="off"
                            className="min-w-0 flex-1 rounded-full border border-[#e2d7c5] bg-[#faf6ef] px-4 py-2.5 text-[13.5px] uppercase outline-none placeholder:normal-case focus:border-[#1f3a2e]"
                          />
                          <button type="submit" className="rounded-full border border-[#1f3a2e] px-5 text-[13.5px] font-semibold text-[#1f3a2e] hover:bg-[#1f3a2e] hover:text-white">
                            Apply
                          </button>
                        </div>
                        <p className={`mt-1.5 text-[12px] ${couponError ? "text-[#b0493a]" : "text-[#8a7f70]"}`}>
                          {couponError ?? "Demo codes: RAYA15 or WELCOME10"}
                        </p>
                      </form>
                    )}
                  </div>
                )}
                <dl className="space-y-1.5 text-[14px]">
                  <div className="flex justify-between text-[#5a5248]">
                    <dt>Subtotal</dt>
                    <dd><RollingAmount value={subtotal} format={rm} /></dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#2f6b4f]">
                      <dt>Promo ({appliedCode})</dt>
                      <dd>-<RollingAmount value={discount} format={rm} /></dd>
                    </div>
                  )}
                  <div className="flex justify-between text-[#5a5248]">
                    <dt>SST (10%)</dt>
                    <dd><RollingAmount value={sst} format={rm} /></dd>
                  </div>
                  <div className="flex justify-between text-[#5a5248]">
                    <dt>Delivery</dt>
                    <dd>{shippingFee === 0 ? "Free" : rm(shippingFee)}</dd>
                  </div>
                  <div className="flex justify-between pt-1.5 text-[16px] font-bold text-[#2a2620]">
                    <dt>Total</dt>
                    <dd><RollingAmount value={total} format={rm} /></dd>
                  </div>
                </dl>
                {step === "cart" ? (
                  <button type="button" onClick={() => setStep("checkout", "forward")} className="mt-4 w-full rounded-full bg-[#c8643b] py-3.5 text-[15px] font-semibold text-white hover:bg-[#b3552f]">
                    Checkout
                  </button>
                ) : (
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => setStep("cart", "back")} className="rounded-full border border-[#e2d7c5] px-5 py-3.5 text-[14px] font-semibold">
                      Back
                    </button>
                    <button type="button" onClick={() => setStep("done")} className="flex-1 rounded-full bg-[#c8643b] py-3.5 text-[15px] font-semibold text-white hover:bg-[#b3552f]">
                      Pay {rm(total)}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
