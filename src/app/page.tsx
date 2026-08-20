"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  ChartIcon,
  ChatIcon,
  CheckIcon,
  ExternalLinkIcon,
  SearchIcon,
  StarIcon,
} from "@/components/icons";
import { HeroDemo, LiveChartDemo, LiveChatDemo, LiveCodeDemo, LiveStatusDemo } from "@/components/live-demos";
import { WhatCanBuild } from "@/components/what-can-build";
import { ClientLogos } from "@/components/client-logos";
import { SiteFooter } from "@/components/site-footer";
import { content as t } from "@/lib/content";
import { posts } from "@/lib/posts";
import { WHATSAPP_NUMBER, wa, waMessages } from "@/lib/contact";
import { tech, techMarquee } from "@/lib/tech";
import {
  SvgGrowthAnalytics,
  SvgLaunching,
  SvgMedicalCare,
  SvgMessaging,
  SvgPrototypingProcess,
  SvgResearching,
  SvgSearchEngines,
  SvgWebDevelopment,
} from "iblis-react-undraw";

/* Presentation-only data: visuals, layout, links, and contact details. */
const serviceDemos = [LiveCodeDemo, LiveChartDemo, LiveChatDemo, LiveStatusDemo];
const processArt = [SvgResearching, SvgPrototypingProcess, SvgWebDevelopment, SvgLaunching];

const tierMeta = [
  { ctaStyle: "outline" as const, highlighted: false },
  { ctaStyle: "primary" as const, highlighted: true },
  { ctaStyle: "outline" as const, highlighted: false },
];

/* Placement for the floating prompt pills around the final CTA, in content order. */
const promptPillPositions = [
  { place: "left-[20%] top-6 -rotate-6", delay: "0s" },
  { place: "left-[7%] top-24 -rotate-3", delay: "0.8s" },
  { place: "left-[1.5%] top-48 -rotate-1", delay: "1.6s" },
  { place: "left-[1.5%] bottom-48 rotate-1", delay: "2.4s" },
  { place: "left-[7%] bottom-24 rotate-3", delay: "3.2s" },
  { place: "left-[20%] bottom-6 rotate-6", delay: "1.2s" },
  { place: "right-[20%] top-6 rotate-6", delay: "0.4s" },
  { place: "right-[7%] top-24 rotate-3", delay: "1.2s" },
  { place: "right-[1.5%] top-48 rotate-1", delay: "2s" },
  { place: "right-[1.5%] bottom-48 -rotate-1", delay: "2.8s" },
  { place: "right-[7%] bottom-24 -rotate-3", delay: "3.6s" },
  { place: "right-[20%] bottom-6 -rotate-6", delay: "1.8s" },
];

/* Four of the prompts on phones, two above the CTA and two below. `prompt`
   indexes into content.finalCta.prompts: the short ones are picked on purpose,
   so nothing overflows a 320px screen. Positions stay inside the section's
   vertical padding (py-32 = 128px) so none of them land on the heading or CTA. */
const mobilePromptPills = [
  { prompt: 1, place: "left-2 top-6 -rotate-6", delay: "0s" },
  { prompt: 6, place: "right-2 top-20 rotate-6", delay: "1.1s" },
  { prompt: 3, place: "left-3 bottom-20 -rotate-5", delay: "2.2s" },
  { prompt: 10, place: "right-2 bottom-6 rotate-6", delay: "3.1s" },
];

const statMeta = [
  { Illustration: SvgGrowthAnalytics, icon: ChartIcon, iconColor: "text-teal-600", value: "+18%" },
  { Illustration: SvgMessaging, icon: ChatIcon, iconColor: "text-amber-500", value: "+15%" },
  { Illustration: SvgSearchEngines, icon: SearchIcon, iconColor: "text-white", value: "50+" },
];

const testimonials = [
  {
    before: "Terima kasih develop website ini. ",
    highlight: "Mudah customer chat",
    after: " nak order kuih apa dan bila nak.",
    name: "Siti Sapura",
    role: "Sri Tanduk Enterprise",
    url: "https://sritanduk.com/",
  },
  {
    before: "Thank you for helping me integrate our Shopify to our custom website, easy for customer to ",
    highlight: "pay via Billplz",
    after: ".",
    name: "Zhen Cui",
    role: "Salaam Cola MY",
    url: "https://www.salaamcolamy.com/en",
  },
  {
    before: "Terima kasih ",
    highlight: "sambungkan semula database",
    after: " project management system saya. Kalau tak, jenuh nak cari balik data.",
    name: "Mohd Zuhairi Zahrom",
    role: "KNZ Engineering Sdn Bhd",
    url: "https://knzengineering.com.my/",
  },
];

/* The sections the sticky nav links to, in the order they appear on the page. */
const navItems = [
  { id: "services", label: t.nav.services },
  { id: "projects", label: t.nav.projects },
  { id: "pricing", label: t.nav.pricing },
  { id: "contact", label: t.nav.contact },
];

const tierWaMessages = [waMessages.starter, waMessages.business, waMessages.custom];

function PrimaryButton({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  className?: string;
}) {
  const base =
    "btn-primary inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition-colors";
  const styles =
    variant === "primary"
      ? "bg-amber-500 text-navy hover:bg-amber-600"
      : "border-[1.5px] border-primary-900 text-primary-900 hover:bg-primary-900 hover:text-white";
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className={`${base} ${styles} ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

function MilestoneSteps({ steps }: { steps: readonly { title: string; body: string }[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start filling when container enters the viewport
      const startTrigger = windowHeight * 0.8;
      // Complete filling when container passes through middle of the viewport
      const endTrigger = windowHeight * 0.3;

      const totalDistance = rect.height + (startTrigger - endTrigger);
      const currentDistance = startTrigger - rect.top;

      const rawProgress = currentDistance / totalDistance;
      const clampedProgress = Math.min(Math.max(rawProgress, 0), 1);
      setProgress(clampedProgress);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative mt-10 flex flex-col gap-9">
      {/* Background track line */}
      <div className="absolute bottom-4 left-4 top-4 w-1 -translate-x-1/2 rounded-full bg-slate-200" />

      {/* Dynamic animated amber fill line */}
      <div
        className="absolute left-4 top-4 w-1 -translate-x-1/2 rounded-full bg-amber-500 transition-all duration-150 ease-out"
        style={{
          height: `calc(${progress * 100}% - 2rem)`,
          maxHeight: "calc(100% - 2rem)",
          minHeight: "0px",
        }}
      />

      {steps.map((s, i) => {
        const stepThreshold = i === 0 ? 0.05 : i === 1 ? 0.45 : 0.85;
        const isActive = progress >= stepThreshold;

        return (
          <div key={s.title} className="relative flex items-start gap-4">
            <div
              className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 ${
                isActive
                  ? "bg-amber-500 text-navy shadow-md ring-4 ring-amber-100 scale-105"
                  : "border border-border bg-bg text-muted"
              }`}
            >
              {i + 1}
            </div>
            <div className="flex flex-col gap-1 pt-0.5">
              <h3
                className={`font-display text-lg font-bold transition-colors duration-300 ${
                  isActive ? "text-navy" : "text-ink/80"
                }`}
              >
                {s.title}
              </h3>
              <p className="text-sm leading-relaxed text-body">{s.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScrollSlideItem({
  children,
  index,
  className = "",
}: {
  children: React.ReactNode;
  index: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fromLeft = index % 2 === 0;
  const initialTranslate = fromLeft ? "-translate-x-20" : "translate-x-20";

  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ease-out md:transition-none ${
        isVisible
          ? "translate-x-0 opacity-100"
          : `${initialTranslate} opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto`
      } ${className}`}
    >
      {children}
    </div>
  );
}

function PricingCardItem({
  tier,
  index,
  badge,
}: {
  tier: {
    name: string;
    tagline: string;
    description: string;
    cta: string;
    features: readonly string[];
  };
  index: number;
  badge: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const meta = tierMeta[index];
  // Mobile only: i = 0 -> left (-x), i = 1 -> right (+x), i = 2 -> left (-x)
  const fromLeft = index % 2 === 0;
  const initialTranslate = fromLeft ? "-translate-x-20" : "translate-x-20";

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-600 ease-out md:transition-none ${
        isVisible
          ? "translate-x-0 opacity-100"
          : `${initialTranslate} opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto`
      } ${
        meta.highlighted
          ? "ring-motion relative flex h-full flex-col gap-5 rounded-[18px] border-2 border-amber-500/40 bg-navy p-8 shadow-2xl md:-translate-y-2"
          : "flex h-full flex-col gap-5 rounded-[18px] border border-border bg-bg p-8"
      }`}
    >
      {meta.highlighted && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-500 px-4 py-1.5 text-xs font-extrabold tracking-wide text-navy">
          {badge}
        </span>
      )}
      <div>
        <h3
          className={`font-display text-[19px] font-bold ${meta.highlighted ? "text-white" : "text-navy"}`}
        >
          {tier.name}
        </h3>
        <p
          className={`mt-0.5 text-[12.5px] font-semibold ${
            meta.highlighted ? "text-amber-300" : "text-primary-600"
          }`}
        >
          {tier.tagline}
        </p>
        <p
          className={`mt-1.5 line-clamp-3 min-h-[60px] text-[13.5px] leading-normal ${
            meta.highlighted ? "text-slate-400" : "text-muted"
          }`}
        >
          {tier.description}
        </p>
      </div>
      <PrimaryButton
        href={wa(tierWaMessages[index])}
        variant={meta.ctaStyle}
        className={meta.highlighted ? "" : "!text-navy !border-navy hover:!bg-navy hover:!text-white"}
      >
        {tier.cta}
      </PrimaryButton>
      <div className="mt-1 flex flex-col gap-3">
        {tier.features.map((f) =>
          /* An "Everything in X, plus:" line heads the list rather than being a
             feature of its own, so it carries no tick. */
          f.endsWith("plus:") ? (
            <p
              key={f}
              className={`text-[13px] font-semibold ${meta.highlighted ? "text-amber-300" : "text-primary-600"}`}
            >
              {f}
            </p>
          ) : (
          <div key={f} className="flex items-start gap-2.5">
            <CheckIcon
              className={`mt-0.5 h-[18px] w-[18px] flex-shrink-0 ${
                meta.highlighted ? "text-amber-500" : "text-teal-600"
              }`}
            />
            <span
              className={`text-[13.5px] ${meta.highlighted ? "text-slate-200" : "text-ink"}`}
            >
              {f}
            </span>
          </div>
          )
        )}
      </div>
    </div>
  );
}

function PricingCards({
  tiers,
  badge,
}: {
  tiers: readonly {
    name: string;
    tagline: string;
    description: string;
    cta: string;
    features: readonly string[];
  }[];
  badge: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {tiers.map((tier, i) => (
        <PricingCardItem key={tier.name} tier={tier} index={i} badge={badge} />
      ))}
    </div>
  );
}

/* Reports which nav section the reader is currently in. A section takes over once
   its top scrolls under the sticky nav, so the marker changes at the moment the
   heading reaches the bar rather than when the section merely comes into view. */
function useActiveSection(navRef: React.RefObject<HTMLElement | null>) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    function update() {
      const offset = (navRef.current?.offsetHeight ?? 0) + 8;

      let current: string | null = null;
      for (const { id } of navItems) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) current = id;
      }

      // The last section sits above the footer, so on short viewports the page can
      // bottom out before its top ever clears the nav. Award it the marker there.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) current = navItems[navItems.length - 1].id;

      setActiveId(current);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [navRef]);

  return activeId;
}

export default function Home() {
  const [activeReview, setActiveReview] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const activeSection = useActiveSection(navRef);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full">
      {/* NAV */}
      <nav ref={navRef} className="sticky top-0 z-50 border-b border-border bg-bg/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-shell items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4">
          <a href="#" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
              <Image
                src="/logo-ghost-outline.webp"
                alt="zakrulabd logo"
                width={512}
                height={512}
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="font-display text-lg font-bold text-navy">zakrulabd</span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="group relative py-1 text-sm font-semibold text-ink transition-colors hover:text-navy"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 h-[2.5px] w-0 rounded-full bg-amber-400 transition-all duration-200 ease-out group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <a
              href={wa(waMessages.quote)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary whitespace-nowrap rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-navy hover:bg-amber-600 sm:px-5 sm:py-2.5 sm:text-sm sm:font-semibold"
            >
              {t.nav.cta}
            </a>
          </div>
        </div>

        {/* Mobile subnav strip: marks the section the reader has scrolled into. */}
        <div className="flex items-center justify-around border-t border-border/70 bg-white/85 px-2 py-2 text-xs font-semibold text-ink backdrop-blur-sm lg:hidden">
          {navItems.map((item) => {
            const isActive = item.id === activeSection;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`group relative px-2.5 py-1 text-center transition ${
                  isActive ? "text-navy" : "text-ink hover:text-navy"
                }`}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 h-[2px] rounded-full bg-amber-400 transition-all duration-300 ease-out ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </a>
            );
          })}
        </div>
      </nav>

      {/* HERO */}
      <section id="main" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
          <div className="absolute -right-10 top-10 h-64 w-64 rounded-full bg-bg blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-shell items-center gap-16 px-6 pb-16 pt-5 md:pb-24 md:pt-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <h1 className="font-display text-[38px] font-bold leading-[1.2] tracking-tight text-navy md:text-[62px]">
              {t.hero.titleA}{" "}
              <span className="hl">{t.hero.titleHl1}</span>
              {t.hero.titleB}
              <span className="hl">{t.hero.titleHl2}</span>
            </h1>
            <div className="w-full max-w-lg pb-12 pt-2 lg:hidden">
              <HeroDemo />
            </div>
            <p className="max-w-xl text-base leading-relaxed text-body md:text-lg">{t.hero.body}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-4 lg:justify-start">
              <PrimaryButton href={wa(waMessages.hero)} variant="primary">
                {t.hero.ctaPrimary}
                <ArrowRightIcon className="h-[18px] w-[18px]" />
              </PrimaryButton>
              <PrimaryButton href="#pricing" variant="outline">
                {t.hero.ctaSecondary}
              </PrimaryButton>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3.5 lg:justify-start">
              {t.hero.chips.map((chip) => (
                <div
                  key={chip}
                  className="rounded-[10px] border border-border bg-white px-4 py-2.5 text-[13.5px] font-semibold text-ink"
                >
                  {chip}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden mx-auto w-full max-w-xl pb-6 lg:block lg:mx-0 lg:-mt-10 lg:pb-0">
            <HeroDemo />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="border-y border-border bg-white px-6 py-24 overflow-hidden">
        <div className="mx-auto max-w-shell">
          <div className="mx-auto mb-12 flex max-w-xl flex-col items-center gap-3 text-center">
            <h2 className="font-display text-[30px] font-bold text-navy md:text-5xl">{t.services.heading}</h2>
            <p className="text-base text-body">{t.services.sub}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.services.items.map((service, i) => {
              const Demo = serviceDemos[i];
              return (
                <ScrollSlideItem
                  key={service.title}
                  index={i}
                  className="flex flex-col gap-3.5 rounded-2xl border border-border bg-bg p-5 transition-transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="h-28 overflow-hidden rounded-xl border border-border">
                    <Demo />
                  </div>
                  <h3 className="font-display text-[17px] font-bold text-navy">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-body">{service.description}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                    {service.bullets.map((b) => (
                      <span
                        key={b}
                        className="rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-xs"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </ScrollSlideItem>
              );
            })}
          </div>
        </div>
      </section>

      <WhatCanBuild />

      <ClientLogos />

      {/* PROCESS */}
      <section id="process" className="px-6 py-24 overflow-hidden">
        <div className="mx-auto max-w-shell">
          <div className="mx-auto mb-12 flex max-w-xl flex-col items-center gap-3 text-center">
            <h2 className="font-display text-[30px] font-bold text-navy md:text-5xl">{t.process.heading}</h2>
            <p className="text-base text-body">{t.process.sub}</p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {t.process.items.map((p, i) => {
              const Illustration = processArt[i];
              return (
                <ScrollSlideItem key={p.title} index={i} className="flex flex-col gap-4">
                  <div className="relative rounded-2xl border border-border bg-white p-4">
                    <Illustration primarycolor="#f7c325" height={140} className="mx-auto" />
                    <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                      {`0${i + 1}`}
                    </div>
                  </div>
                  <h3 className="font-display text-base font-bold text-navy">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-body">{p.description}</p>
                </ScrollSlideItem>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-y border-border bg-white px-6 py-24 overflow-hidden">
        <div className="mx-auto max-w-shell">
          <div className="mx-auto mb-12 flex max-w-xl flex-col items-center gap-3 text-center">
            <h2 className="font-display text-[30px] font-bold text-navy md:text-5xl">
              {t.pricing.headingA}
              <span className="hl">{t.pricing.headingHl}</span>
              {t.pricing.headingB}
            </h2>
            <p className="text-base text-body">{t.pricing.sub}</p>
          </div>
          <PricingCards tiers={t.pricing.tiers} badge={t.pricing.badge} />
          <p className="mt-8 flex flex-col items-center gap-3 text-center text-[13.5px] text-muted lg:block">
            {t.pricing.compare.footnote}{" "}
            <Link
              href="/compare"
              className="inline-block w-fit max-w-full self-center rounded-full bg-amber-400 px-4 py-2 font-semibold text-navy underline decoration-navy decoration-2 underline-offset-4 lg:w-auto lg:rounded-none lg:bg-transparent lg:p-0 lg:decoration-amber-500 lg:hover:decoration-navy"
            >
              {t.pricing.compare.link}
            </Link>
          </p>
        </div>
      </section>

      {/* RESULTS */}
      <section id="results" className="bg-navy px-6 py-24 overflow-hidden">
        <div className="mx-auto max-w-shell">
          <div className="mx-auto mb-11 flex max-w-2xl flex-col items-center gap-3 text-center">
            <h2 className="font-display text-[30px] font-bold text-white md:text-5xl">
              {t.results.headingA}
              <span className="hl">{t.results.headingHl}</span>
              {t.results.headingB}
            </h2>
            <p className="text-base text-slate-400">{t.results.sub}</p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {statMeta.map((s, i) => (
              <ScrollSlideItem
                key={i}
                index={i}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-7"
              >
                <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-white p-3">
                  <s.Illustration primarycolor="#f7c325" height={100} className="mx-auto max-h-full max-w-full" />
                </div>
                <div className="flex items-center gap-2">
                  <s.icon className={`h-5 w-5 flex-shrink-0 ${s.iconColor}`} />
                  <span className="text-[30px] font-extrabold leading-none text-white">{s.value}</span>
                </div>
                <span className="text-[13.5px] text-slate-400">{t.results.stats[i]}</span>
              </ScrollSlideItem>
            ))}
          </div>

          <ScrollSlideItem
            index={3}
            className="mx-auto grid max-w-4xl grid-cols-1 items-center gap-8 rounded-[18px] border border-white/10 bg-white/5 p-8 md:grid-cols-[1fr_1.3fr]"
          >
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-white p-4 md:aspect-auto md:h-52">
              <SvgMedicalCare primarycolor="#f7c325" height={170} className="mx-auto max-h-full max-w-full" />
            </div>

            <div className="flex flex-col gap-3.5">
              <span className="inline-flex w-fit rounded-full bg-teal-600 px-3.5 py-1.5 text-xs font-bold tracking-wide text-white">
                {t.results.caseBadge}
              </span>
              <h3 className="font-display text-[19px] font-bold text-white">{t.results.caseTitle}</h3>
              <p className="text-sm leading-relaxed text-slate-300">{t.results.caseBody}</p>
            </div>
          </ScrollSlideItem>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="border-b border-border bg-bg py-11">
        <div className="mx-auto flex max-w-shell flex-col items-center px-6">
          <span className="text-base font-bold tracking-[0.08em] text-muted">{t.tech.heading}</span>
        </div>
        <div className="marquee-fade mt-6 overflow-hidden">
          <div className="marquee-track flex w-max items-center gap-6">
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden={copy === 1} className="flex items-center gap-6">
                {techMarquee.map((key) => {
                  const { name, Icon, color } = tech[key];
                  return (
                    <div
                      key={key}
                      title={name}
                      className="group flex w-40 flex-shrink-0 flex-col items-center gap-4 rounded-2xl border border-border bg-white px-5 py-8 transition duration-200 hover:-translate-y-1 hover:shadow-md"
                    >
                      <Icon
                        className="h-16 w-16 transition duration-300 lg:grayscale lg:group-hover:grayscale-0"
                        style={{ color }}
                        aria-hidden="true"
                      />
                      <span className="text-center font-mono text-sm leading-tight text-muted">{name}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-shell">
          <div className="mx-auto mb-11 flex max-w-xl flex-col items-center gap-3 text-center">
            <h2 className="font-display text-[30px] font-bold text-navy md:text-5xl">{t.testimonials.heading}</h2>
            <p className="text-base text-body">{t.testimonials.sub}</p>
          </div>
          {/* Mobile Auto-Slide (< md) */}
          <div className="md:hidden">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeReview * 100}%)` }}
              >
                {testimonials.map((item, i) => (
                  <div key={i} className="w-full flex-shrink-0 px-1">
                    <div className="flex h-full min-h-[260px] flex-col gap-5 rounded-2xl border border-border bg-white p-7 shadow-sm">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <StarIcon key={s} className="h-5 w-5 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-base font-bold leading-relaxed text-navy">
                        &ldquo;{item.before}
                        <span className="hl">{item.highlight}</span>
                        {item.after}&rdquo;
                      </p>
                      <div className="mt-auto border-t border-border pt-5">
                        <div className="text-sm font-semibold text-navy">{item.name}</div>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group mt-0.5 inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-amber-600"
                        >
                          {item.role}
                          <ExternalLinkIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination indicator dots */}
            <div className="mt-5 flex items-center justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveReview(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeReview ? "w-6 bg-navy" : "w-2 bg-border hover:bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Desktop 3-Column Grid (md+) */}
          <div className="hidden md:grid md:grid-cols-3 md:gap-6">
            {testimonials.map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-5 rounded-2xl border border-border bg-white p-8 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-lg"
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <StarIcon key={s} className="h-5 w-5 text-amber-400" />
                  ))}
                </div>
                <p className="text-base font-bold leading-relaxed text-navy">
                  &ldquo;{item.before}
                  <span className="hl">{item.highlight}</span>
                  {item.after}&rdquo;
                </p>
                <div className="mt-auto border-t border-border pt-5">
                  <div className="text-sm font-semibold text-navy">{item.name}</div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-0.5 inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-amber-600"
                  >
                    {item.role}
                    <ExternalLinkIcon className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NOTES: the case studies sit here on purpose, straight after the
          testimonials and before the pitch to start, so a visitor who is
          weighing me up reads one project in full at the moment they are
          deciding. */}
      <section id="notes" className="border-t border-border px-6 py-24">
        <div className="mx-auto max-w-shell">
          <div className="mx-auto mb-11 flex max-w-xl flex-col items-center gap-3 text-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">{t.notes.badge}</span>
            <h2 className="font-display text-[30px] font-bold text-navy md:text-5xl">
              {t.notes.headingA}
              <span className="hl">{t.notes.headingHl}</span>
            </h2>
            <p className="text-base text-body">{t.notes.sub}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {posts.slice(0, 2).map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-3 rounded-[18px] border border-border bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-amber-400/70 hover:shadow-lg hover:shadow-black/5 md:p-7"
              >
                <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-wide text-muted">
                  <span className="text-navy">{post.tag}</span>
                  <span>{post.readingTime}</span>
                </div>
                <h3 className="font-display text-xl font-bold leading-snug text-navy md:text-2xl">
                  <span className="relative inline">
                    {post.title}
                    <span
                      aria-hidden
                      className="absolute -bottom-1 left-0 h-[2.5px] w-0 rounded-full bg-amber-400 transition-all duration-200 ease-out group-hover:w-full"
                    />
                  </span>
                </h3>
                <p className="text-[14.5px] leading-relaxed text-body">{post.excerpt}</p>
                <span className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-bold text-navy">
                  {t.notes.read}
                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/blog"
              className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg border-[1.5px] border-primary-900 px-6 py-3 text-sm font-bold text-primary-900 transition-colors hover:bg-primary-900 hover:text-white"
            >
              {t.notes.all}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* GET STARTED */}
      <section className="border-y border-border bg-white px-6 py-24">
        <div className="mx-auto max-w-shell">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-[30px] font-bold leading-tight text-navy md:text-5xl">
                {t.started.headingA}
                <span className="hl">{t.started.headingHl}</span>
              </h2>

              <MilestoneSteps steps={t.started.steps} />
            </div>

            <div className="flex flex-col gap-6">
              <p className="text-base leading-relaxed text-body md:text-lg">{t.started.intro}</p>

              <div className="flex flex-wrap gap-3">
                <PrimaryButton href={wa(waMessages.intro)} variant="primary">
                  {t.started.ctaPrimary}
                  <ArrowRightIcon className="h-[18px] w-[18px]" />
                </PrimaryButton>
                <PrimaryButton href="#pricing" variant="outline">
                  {t.started.ctaSecondary}
                </PrimaryButton>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg p-6">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
                  {t.started.expectTitle}
                </span>
                {t.started.expect.map((e) => (
                  <div key={e} className="flex items-start gap-2.5">
                    <CheckIcon className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-teal-600" />
                    <span className="text-sm text-ink">{e}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-bg p-6">
                <span className="text-[11px] font-bold uppercase tracking-wide text-muted">{t.started.readyTitle}</span>
                <p className="text-sm leading-relaxed text-body">{t.started.readyBody}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section id="contact" className="relative overflow-hidden bg-navy px-6 py-32 lg:py-36">
        {/* Floating prompt pills (desktop only: radial arc, 6 left / 6 right) */}
        <div className="absolute inset-0 mx-auto hidden max-w-shell select-none lg:block">
          {t.finalCta.prompts.map((prompt, i) => (
            <div
              key={prompt}
              className={`absolute rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12.5px] font-medium text-slate-200 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-white/15 hover:text-white animate-[gentle-float_4s_ease-in-out_infinite] ${promptPillPositions[i].place}`}
              style={{ animationDelay: promptPillPositions[i].delay }}
            >
              {prompt}
            </div>
          ))}
        </div>

        {/* Same idea for phones, but only four, smaller and dimmer: here they are
            background texture around the CTA, not something to read. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none lg:hidden">
          {mobilePromptPills.map(({ prompt, place, delay }) => (
            <div
              key={prompt}
              className={`absolute whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10.5px] font-medium text-slate-400 backdrop-blur-sm animate-[gentle-float_4s_ease-in-out_infinite] ${place}`}
              style={{ animationDelay: delay }}
            >
              {t.finalCta.prompts[prompt]}
            </div>
          ))}
        </div>

        <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
          <h2 className="font-display text-[30px] font-bold text-white md:text-5xl">
            {t.finalCta.headingA}
            <span className="hl">{t.finalCta.headingHl}</span>
            {t.finalCta.headingB}
          </h2>
          <p className="text-base leading-relaxed text-slate-300">{t.finalCta.sub}</p>
          <a
            href={wa(waMessages.start)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-7 py-3.5 text-[15px] font-bold text-navy hover:bg-amber-600"
          >
            {t.finalCta.cta}
            <ArrowRightIcon className="h-[18px] w-[18px]" />
          </a>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[13.5px] text-slate-400">
            <span>{t.finalCta.whatsapp}</span>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-white px-2.5 py-0.5 font-semibold text-navy underline underline-offset-2 transition-colors hover:bg-slate-200"
            >
              010-255 1527
            </a>
            <span>{t.finalCta.or.trim()}</span>
            <a
              href="mailto:zakrulabd@gmail.com"
              className="inline-block rounded-full bg-white px-2.5 py-0.5 font-semibold text-navy underline underline-offset-2 transition-colors hover:bg-slate-200"
            >
              zakrulabd@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <SiteFooter />
    </div>
  );
}
