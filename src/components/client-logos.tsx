import Image from "next/image";
import { content as t } from "@/lib/content";

/* Keyed by client name rather than by position: display order is set once in
   content.clients.items, and reordering it can never pair a logo with another
   client's link. Each mark is the client's own, taken from their live site.
   Width and height are the file's real pixels so Next can build the srcset. */
const clientAssets: Record<string, { url: string; logo: string; width: number; height: number }> = {
  "Sri Tanduk Enterprise": {
    url: "https://sritanduk.com/",
    logo: "/clients/sri-tanduk.png",
    width: 512,
    height: 438,
  },
  "Salaam Cola MY": {
    url: "https://www.salaamcolamy.com/en",
    logo: "/clients/salaam-cola.png",
    width: 800,
    height: 520,
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
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto mb-12 flex max-w-xl flex-col items-center gap-3 text-center">
          <h2 className="font-display text-[30px] font-bold text-white md:text-5xl">
            {t.clients.headingA}
            <span className="hl">{t.clients.headingHl}</span>
            {t.clients.headingB}
          </h2>
          <p className="text-base text-slate-400">{t.clients.sub}</p>
        </div>

        {/* Four across on large screens. aspect-square keeps the tile square when
            max-w-full has to shrink it below 150px on a narrow phone. */}
        <div className="grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                <Image
                  src={asset.logo}
                  alt={client.name}
                  width={asset.width}
                  height={asset.height}
                  className="max-h-full w-auto object-contain grayscale transition duration-200 group-hover:grayscale-0"
                />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
