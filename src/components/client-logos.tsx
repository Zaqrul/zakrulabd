import { ImageWithSkeleton } from "@/components/skeleton";
import { content as t } from "@/lib/content";
import { ExternalLinkIcon, PlusIcon } from "@/components/icons";

/* Keyed by client name rather than by position: display order is set once in
   content.clients.items, and reordering it can never pair a logo with another
   client's link. Each mark is the client's own, taken from their live site.
   Width and height are the file's real pixels so Next can build the srcset. */
const clientAssets: Record<string, { url: string; logo: string; width: number; height: number }> = {
  "Sri Tanduk Enterprise": {
    url: "https://sritanduk.com/",
    logo: "/clients/sri-tanduk.png",
    width: 900,
    height: 848,
  },
  "Haikai Tech": {
    url: "https://haikaitech.my/",
    logo: "/clients/haikai-tech.png",
    width: 1001,
    height: 726,
  },
  "KNZ Engineering": {
    url: "https://knzengineering.com.my/",
    logo: "/clients/knz-engineering.png",
    width: 643,
    height: 283,
  },
};

export function ClientLogos() {
  return (
    <section id="clients" className="bg-navy px-6 py-24">
      <div className="mx-auto max-w-shell">
        <div className="mx-auto mb-12 flex max-w-xl flex-col items-center gap-3 text-center">
          <h2 className="font-display text-[30px] font-bold text-white md:text-5xl">
            {t.clients.headingA}
            <span className="hl">{t.clients.headingHl}</span>
            {t.clients.headingB}
          </h2>
          <p className="text-base text-slate-400">{t.clients.sub}</p>
        </div>

        {/* One line, the way a credit line reads: a mark, who it was for, and
            where it lives. A person's portfolio has no wordmark to put in the
            grid below, so it is named here instead. */}
        <a
          href={t.clients.recent.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group mx-auto mb-12 flex w-fit max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-full border border-white/10 bg-white/5 py-2 pl-2 pr-5 transition duration-200 hover:border-amber-400/60 hover:bg-white/[0.07]"
        >
          <span
            aria-hidden
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 font-display text-[12px] font-extrabold text-navy"
          >
            {t.clients.recent.initials}
          </span>

          <span className="text-[13.5px] text-slate-300">
            {t.clients.recent.lead}{" "}
            {/* The name is underlined and turns amber with the row, so it reads
                as the link it is. It is a span rather than a nested anchor —
                the whole row is already the link, and an anchor inside an
                anchor is invalid markup that browsers unnest for you. */}
            <span className="font-semibold text-white underline decoration-white/30 decoration-2 underline-offset-4 transition-colors group-hover:text-amber-400 group-hover:decoration-amber-400">
              {t.clients.recent.name}
            </span>
          </span>

          <ExternalLinkIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 transition-colors group-hover:text-amber-400" />
        </a>

        {/* The grid is capped rather than spread across the full 1200px shell:
            four 150px tiles stretched over that width read as four stray marks
            with holes between them. Capping it keeps them a group. */}
        <div className="mx-auto grid max-w-[340px] grid-cols-2 justify-items-center gap-3 sm:max-w-[420px] sm:gap-4 lg:max-w-3xl lg:grid-cols-4">
          {t.clients.items.map((client) => {
            const asset = clientAssets[client.name];
            if (!asset) return null;
            return (
              <a
                key={client.name}
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                title={client.name}
                className="group flex aspect-square w-[150px] max-w-full items-center justify-center rounded-2xl border border-white/10 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-lg hover:shadow-black/30"
              >
                <ImageWithSkeleton
                  src={asset.logo}
                  alt={client.name}
                  width={asset.width}
                  height={asset.height}
                  wrapperClassName="flex h-full w-full items-center justify-center"
                  className="max-h-full w-auto object-contain transition duration-300 lg:grayscale lg:group-hover:grayscale-0"
                />
              </a>
            );
          })}

          {/* Fills the fourth slot in the row: an open invitation rather than a
              client, so it is dashed, carries no logo, and scrolls to contact. */}
          <a
            href="#contact"
            className="group relative flex aspect-square w-[150px] max-w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed border-white/20 p-5 text-center transition duration-300 hover:-translate-y-1 hover:border-amber-400/70"
          >
            {/* Amber bloom from the centre, so the tile lights up rather than
                just changing its border colour. */}
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--color-amber-400)_22%,transparent),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <span className="relative flex h-9 w-9 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400/25 opacity-0 group-hover:animate-ping group-hover:opacity-100" />
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-slate-300 transition duration-300 group-hover:rotate-90 group-hover:border-amber-400 group-hover:bg-amber-400 group-hover:text-navy">
                <PlusIcon className="h-4 w-4" />
              </span>
            </span>

            <span className="relative font-display text-[13px] font-bold leading-snug text-slate-300 transition-colors duration-300 group-hover:text-white">
              {t.clients.next}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
