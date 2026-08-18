"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRightIcon,
  ChartIcon,
  ChatIcon,
  CheckIcon,
  ExternalLinkIcon,
  MailIcon,
  PhoneIcon,
  SearchIcon,
  StarIcon,
} from "@/components/icons";
import { HeroDemo, LiveChartDemo, LiveChatDemo, LiveCodeDemo, LiveStatusDemo } from "@/components/live-demos";
import { WhatCanBuild } from "@/components/what-can-build";
import { useI18n } from "@/components/language-provider";
import {
  SiAstro,
  SiGithub,
  SiLaravel,
  SiMysql,
  SiNextdotjs,
  SiRailway,
  SiReact,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiWordpress,
} from "react-icons/si";
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

/* Language-independent data: visuals, prices, links, names. */
const serviceDemos = [LiveCodeDemo, LiveChartDemo, LiveChatDemo, LiveStatusDemo];
const processArt = [SvgResearching, SvgPrototypingProcess, SvgWebDevelopment, SvgLaunching];

const tierMeta = [
  { price: "RM 750", startingAt: true, hasNote: true, ctaStyle: "outline" as const, highlighted: false },
  { price: "RM 3,500", startingAt: true, hasNote: true, ctaStyle: "primary" as const, highlighted: true },
  { price: null, startingAt: false, hasNote: false, ctaStyle: "outline" as const, highlighted: false },
];

const statMeta = [
  { Illustration: SvgGrowthAnalytics, icon: ChartIcon, iconColor: "text-teal-600", value: "+18%" },
  { Illustration: SvgMessaging, icon: ChatIcon, iconColor: "text-amber-500", value: "+15%" },
  { Illustration: SvgSearchEngines, icon: SearchIcon, iconColor: "text-white", value: "50+" },
];

const techStack = [
  { name: "React", Icon: SiReact, color: "#61DAFB" },
  { name: "Next.js", Icon: SiNextdotjs, color: "#000000" },
  { name: "Astro", Icon: SiAstro, color: "#FF5D01" },
  { name: "TypeScript", Icon: SiTypescript, color: "#3178C6" },
  { name: "Laravel", Icon: SiLaravel, color: "#FF2D20" },
  { name: "Tailwind CSS", Icon: SiTailwindcss, color: "#06B6D4" },
  { name: "MySQL", Icon: SiMysql, color: "#4479A1" },
  { name: "Supabase", Icon: SiSupabase, color: "#3FCF8E" },
  { name: "Vercel", Icon: SiVercel, color: "#000000" },
  { name: "Railway", Icon: SiRailway, color: "#0B0D0E" },
  { name: "WordPress", Icon: SiWordpress, color: "#21759B" },
  { name: "GitHub", Icon: SiGithub, color: "#181717" },
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

const WHATSAPP_NUMBER = "60102551527";

/* WhatsApp pre-filled messages stay in Malay — most enquiries come in Malay. */
const waMessages = {
  quote: "Hi Zakru! Saya nak dapatkan free quote untuk website. Boleh kita bincang?",
  hero: "Hi Zakru! Saya jumpa website anda dan berminat nak buat website untuk business saya.",
  starter: "Hi Zakru! Saya berminat dengan pakej Starter Website (RM750). Boleh terangkan lanjut?",
  business: "Hi Zakru! Saya berminat dengan pakej Professional Website (RM3,500). Boleh kita bincang?",
  custom: "Hi Zakru! Saya perlukan sistem/website custom untuk business saya. Boleh kita bincang scope dan quote?",
  intro: "Hi Zakru! Nama saya ___, business saya ___. Saya nak buat: ___",
  start: "Hi Zakru! Saya nak start project. Ini yang saya perlukan:",
};

const tierWaMessages = [waMessages.starter, waMessages.business, waMessages.custom];

function wa(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

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
  startingAt,
  perProject,
  customQuote,
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
  startingAt: string;
  perProject: string;
  customQuote: string;
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
      <div>
        {meta.startingAt && (
          <span
            className={`block text-[11px] font-semibold uppercase tracking-wide ${
              meta.highlighted ? "text-slate-400" : "text-muted"
            }`}
          >
            {startingAt}
          </span>
        )}
        <div className="flex items-baseline gap-1.5">
          <span className={`text-3xl font-extrabold ${meta.highlighted ? "text-white" : "text-navy"}`}>
            {meta.price ?? customQuote}
          </span>
          {meta.hasNote && (
            <span className={`text-sm ${meta.highlighted ? "text-slate-400" : "text-muted"}`}>
              {perProject}
            </span>
          )}
        </div>
      </div>
      <PrimaryButton
        href={wa(tierWaMessages[index])}
        variant={meta.ctaStyle}
        className={meta.highlighted ? "" : "!text-navy !border-navy hover:!bg-navy hover:!text-white"}
      >
        {tier.cta}
      </PrimaryButton>
      <div className="mt-1 flex flex-col gap-3">
        {tier.features.map((f) => (
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
        ))}
      </div>
    </div>
  );
}

function PricingCards({
  tiers,
  badge,
  startingAt,
  perProject,
  customQuote,
}: {
  tiers: readonly {
    name: string;
    tagline: string;
    description: string;
    cta: string;
    features: readonly string[];
  }[];
  badge: string;
  startingAt: string;
  perProject: string;
  customQuote: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {tiers.map((tier, i) => (
        <PricingCardItem
          key={tier.name}
          tier={tier}
          index={i}
          badge={badge}
          startingAt={startingAt}
          perProject={perProject}
          customQuote={customQuote}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const { t } = useI18n();
  const [activeReview, setActiveReview] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReview((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
              <Image
                src="/logo-ghost-outline.webp"
                alt=""
                width={512}
                height={512}
                className="h-8 w-8 object-contain"
              />
            </div>
            <span className="font-display text-lg font-bold text-navy">zakrulabd</span>
          </div>
          <div className="hidden items-center gap-8 lg:flex">
            <a href="#services" className="text-sm font-medium text-ink hover:text-primary-600">
              {t.nav.services}
            </a>
            <a href="#process" className="text-sm font-medium text-ink hover:text-primary-600">
              {t.nav.process}
            </a>
            <a href="#pricing" className="text-sm font-medium text-ink hover:text-primary-600">
              {t.nav.pricing}
            </a>
            <a href="#results" className="text-sm font-medium text-ink hover:text-primary-600">
              {t.nav.results}
            </a>
            <a href="#contact" className="text-sm font-medium text-ink hover:text-primary-600">
              {t.nav.contact}
            </a>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href={wa(waMessages.quote)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary whitespace-nowrap rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-amber-600"
            >
              {t.nav.cta}
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl" />
          <div className="absolute -right-10 top-10 h-64 w-64 rounded-full bg-bg blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 px-6 pb-16 pt-8 md:pb-24 md:pt-12 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <span className="-mb-3 text-[13px] font-semibold tracking-wide text-muted">{t.hero.eyebrow}</span>
            <h1 className="font-display text-5xl font-bold leading-[1.15] tracking-tight text-navy md:text-7xl">
              {t.hero.titleA}{" "}
              <span className="hl">{t.hero.titleHl1}</span>
              {t.hero.titleB}
              <span className="hl">{t.hero.titleHl2}</span>
            </h1>
            <div className="w-full max-w-lg pb-4 pt-2 lg:hidden">
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
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 flex max-w-xl flex-col items-center gap-3 text-center">
            <h2 className="font-display text-4xl font-bold text-navy md:text-5xl">{t.services.heading}</h2>
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

      {/* PROCESS */}
      <section id="process" className="px-6 py-24 overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 flex max-w-xl flex-col items-center gap-3 text-center">
            <h2 className="font-display text-4xl font-bold text-navy md:text-5xl">{t.process.heading}</h2>
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
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 flex max-w-xl flex-col items-center gap-3 text-center">
            <h2 className="font-display text-4xl font-bold text-navy md:text-5xl">
              {t.pricing.headingA}
              <span className="hl">{t.pricing.headingHl}</span>
              {t.pricing.headingB}
            </h2>
            <p className="text-base text-body">{t.pricing.sub}</p>
          </div>
          <PricingCards
            tiers={t.pricing.tiers}
            badge={t.pricing.badge}
            startingAt={t.pricing.startingAt}
            perProject={t.pricing.perProject}
            customQuote={t.pricing.customQuote}
          />
        </div>
      </section>

      {/* RESULTS */}
      <section id="results" className="bg-navy px-6 py-24 overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-11 flex max-w-2xl flex-col items-center gap-3 text-center">
            <h2 className="font-display text-4xl font-bold text-white md:text-5xl">
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
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6">
          <span className="text-base font-bold tracking-[0.08em] text-muted">{t.tech.heading}</span>
        </div>
        <div className="marquee-fade mt-6 overflow-hidden">
          <div className="marquee-track flex w-max items-center gap-6">
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden={copy === 1} className="flex items-center gap-6">
                {techStack.map((tech) => (
                  <div
                    key={tech.name}
                    title={tech.name}
                    className="group flex w-40 flex-shrink-0 flex-col items-center gap-4 rounded-2xl border border-border bg-white px-5 py-8 transition duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    <tech.Icon
                      className="h-16 w-16 grayscale transition duration-200 group-hover:grayscale-0"
                      style={{ color: tech.color }}
                      aria-hidden="true"
                    />
                    <span className="text-center font-mono text-sm leading-tight text-muted">{tech.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-11 flex max-w-xl flex-col items-center gap-3 text-center">
            <h2 className="font-display text-4xl font-bold text-navy md:text-5xl">{t.testimonials.heading}</h2>
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

      {/* GET STARTED */}
      <section className="border-y border-border bg-white px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-4xl font-bold leading-tight text-navy md:text-5xl">
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
        {/* Floating Prompting Pills (Desktop only: Circular Radial Arc - 6 Left, 6 Right) */}
        <div className="absolute inset-0 mx-auto hidden max-w-6xl select-none lg:block">
          {/* 6 Kiri (Left Circular Arc) */}
          <div
            className="absolute left-[20%] top-6 -rotate-6 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12.5px] font-medium text-slate-200 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-white/15 hover:text-white animate-[gentle-float_4s_ease-in-out_infinite]"
            style={{ animationDelay: "0s" }}
          >
            Bina sistem tempahan & slot
          </div>
          <div
            className="absolute left-[7%] top-24 -rotate-3 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12.5px] font-medium text-slate-200 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-white/15 hover:text-white animate-[gentle-float_4s_ease-in-out_infinite]"
            style={{ animationDelay: "0.8s" }}
          >
            Optimumkan SEO Google
          </div>
          <div
            className="absolute left-[1.5%] top-48 -rotate-1 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12.5px] font-medium text-slate-200 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-white/15 hover:text-white animate-[gentle-float_4s_ease-in-out_infinite]"
            style={{ animationDelay: "1.6s" }}
          >
            Web tersuai React & Laravel
          </div>
          <div
            className="absolute left-[1.5%] bottom-48 rotate-1 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12.5px] font-medium text-slate-200 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-white/15 hover:text-white animate-[gentle-float_4s_ease-in-out_infinite]"
            style={{ animationDelay: "2.4s" }}
          >
            Setup Google Analytics 4
          </div>
          <div
            className="absolute left-[7%] bottom-24 rotate-3 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12.5px] font-medium text-slate-200 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-white/15 hover:text-white animate-[gentle-float_4s_ease-in-out_infinite]"
            style={{ animationDelay: "3.2s" }}
          >
            Sambung database MySQL
          </div>
          <div
            className="absolute left-[20%] bottom-6 rotate-6 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12.5px] font-medium text-slate-200 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-white/15 hover:text-white animate-[gentle-float_4s_ease-in-out_infinite]"
            style={{ animationDelay: "1.2s" }}
          >
            Bina borang sebut harga
          </div>

          {/* 6 Kanan (Right Circular Arc) */}
          <div
            className="absolute right-[20%] top-6 rotate-6 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12.5px] font-medium text-slate-200 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-white/15 hover:text-white animate-[gentle-float_4s_ease-in-out_infinite]"
            style={{ animationDelay: "0.4s" }}
          >
            Integrasi Shopify & FPX
          </div>
          <div
            className="absolute right-[7%] top-24 rotate-3 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12.5px] font-medium text-slate-200 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-white/15 hover:text-white animate-[gentle-float_4s_ease-in-out_infinite]"
            style={{ animationDelay: "1.2s" }}
          >
            Pasang livechat pelanggan
          </div>
          <div
            className="absolute right-[1.5%] top-48 rotate-1 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12.5px] font-medium text-slate-200 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-white/15 hover:text-white animate-[gentle-float_4s_ease-in-out_infinite]"
            style={{ animationDelay: "2.0s" }}
          >
            Laman pantas Breakdance
          </div>
          <div
            className="absolute right-[1.5%] bottom-48 -rotate-1 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12.5px] font-medium text-slate-200 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-white/15 hover:text-white animate-[gentle-float_4s_ease-in-out_infinite]"
            style={{ animationDelay: "2.8s" }}
          >
            Automasi WhatsApp lead
          </div>
          <div
            className="absolute right-[7%] bottom-24 -rotate-3 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12.5px] font-medium text-slate-200 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-white/15 hover:text-white animate-[gentle-float_4s_ease-in-out_infinite]"
            style={{ animationDelay: "3.6s" }}
          >
            Pindahkan hosting ke Vercel
          </div>
          <div
            className="absolute right-[20%] bottom-6 -rotate-6 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[12.5px] font-medium text-slate-200 shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:bg-white/15 hover:text-white animate-[gentle-float_4s_ease-in-out_infinite]"
            style={{ animationDelay: "1.8s" }}
          >
            Redesign laman web syarikat
          </div>
        </div>

        <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-5 text-center">
          <h2 className="font-display text-4xl font-bold text-white md:text-5xl">
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
      <footer className="bg-navy px-6 py-14 text-slate-400">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-[2fr_1fr_1fr_1fr]">
            <div className="col-span-2 flex max-w-xs flex-col gap-3.5 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center">
                  <Image
                    src="/logo-ghost-outline.webp"
                    alt=""
                    width={512}
                    height={512}
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <span className="font-display text-base font-bold text-white">zakrulabd</span>
              </div>
              <p className="text-[13.5px] leading-relaxed">{t.footer.blurb}</p>
              <a href="mailto:zakrulabd@gmail.com" className="flex items-center gap-2 text-[13px] hover:text-white">
                <MailIcon className="h-[15px] w-[15px]" />
                <span>zakrulabd@gmail.com</span>
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[13px] hover:text-white"
              >
                <PhoneIcon className="h-[15px] w-[15px]" />
                <span>010-255 1527</span>
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[12.5px] font-bold tracking-wide text-slate-200">{t.footer.services}</span>
              {t.footer.servicesLinks.map((l) => (
                <a key={l} href="#services" className="text-[13.5px] hover:text-white">
                  {l}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[12.5px] font-bold tracking-wide text-slate-200">{t.footer.company}</span>
              {t.footer.companyLinks.map((l, i) => (
                <a key={l} href={["#process", "#pricing", "#results"][i]} className="text-[13.5px] hover:text-white">
                  {l}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[12.5px] font-bold tracking-wide text-slate-200">{t.footer.getStarted}</span>
              <a
                href={wa(waMessages.quote)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13.5px] hover:text-white"
              >
                {t.footer.getStartedLinks[0]}
              </a>
              <a href="#pricing" className="text-[13.5px] hover:text-white">
                {t.footer.getStartedLinks[1]}
              </a>
            </div>
          </div>
          <div className="border-t border-white/10 pt-5 text-center">
            <span className="text-[12.5px] text-slate-500">© 2026 zakrulabd. {t.footer.rights}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
