import Image from "next/image";
import { content as t } from "@/lib/content";

/* Each logo is the client's own mark, taken from their live site and set on a
   transparent background so every tile reads the same. Width and height are the
   file's real pixels so Next can build the srcset. */
const clients = [
  {
    name: "Salaam Cola MY",
    url: "https://www.salaamcolamy.com/en",
    logo: "/clients/salaam-cola.png",
    width: 800,
    height: 520,
  },
  {
    name: "KNZ Engineering",
    url: "https://knzengineering.com.my/",
    logo: "/clients/knz-engineering.png",
    width: 643,
    height: 283,
  },
];

export function ClientLogos() {
  return (
    <section className="border-b border-border bg-bg px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex justify-center">
          <span className="text-base font-bold tracking-[0.08em] text-muted">{t.clients.heading}</span>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
          {clients.map((client) => (
            <a
              key={client.name}
              href={client.url}
              target="_blank"
              rel="noopener noreferrer"
              title={client.name}
              className="group flex h-28 items-center justify-center rounded-2xl border border-border bg-white px-6 py-5 transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <Image
                src={client.logo}
                alt={client.name}
                width={client.width}
                height={client.height}
                className="max-h-full w-auto object-contain grayscale transition duration-200 group-hover:grayscale-0"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
