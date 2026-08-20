import type { Metadata } from "next";
import { SvgConversation } from "iblis-react-undraw";
import { ContactForm } from "@/components/contact-form";
import { CheckIcon } from "@/components/icons";
import { PostShell } from "@/components/post-shell";
import { content as t } from "@/lib/content";
import { breadcrumb } from "@/lib/structured-data";
import { url } from "@/lib/site";

export const metadata: Metadata = {
  title: "Start a Project",
  description:
    "Tell me what you want built and I will come back with a plan and a fixed quote. Freelance web development, custom systems, and technical SEO in Malaysia.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Start a Project | zakrulabd",
    description: "Tell me what you want built and I will come back with a plan and a fixed quote.",
    url: url("/contact"),
  },
};

export default function ContactPage() {
  const c = t.contactPage;

  return (
    <PostShell back={{ href: "/", label: "Back to Home" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb("Start a Project", "/contact")) }}
      />

      <section className="bg-navy px-5 py-14 md:px-6 md:py-16">
        <div className="mx-auto flex w-full max-w-shell flex-col gap-4">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-400">{c.badge}</span>
          <h1 className="font-display text-[30px] font-extrabold tracking-tight text-white md:text-5xl">
            {c.titleA}
            <span className="hl">{c.titleHl}</span>
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">{c.sub}</p>
        </div>
      </section>

      <main id="main" className="mx-auto w-full max-w-shell flex-1 px-5 py-14 md:px-6 md:py-16">
        {/* Two columns from lg up. The form keeps a reading measure rather than
            the full shell, because a 1200px text field looks like a search bar
            rather than somewhere to write a few paragraphs, and the drawing
            fills the space that leaves instead of a stretch of empty grey. */}
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-16">
          <div className="max-w-2xl">
            <ContactForm />
          </div>

          <aside className="hidden flex-col items-center gap-6 lg:flex">
            {/* Still, not floating: the form is where the attention belongs,
                and a drawing that moves beside a text field competes with it. */}
            <div className="w-full max-w-[420px]">
              <SvgConversation primarycolor="#f7c325" height={360} className="mx-auto h-auto w-full" />
            </div>

            <ul className="flex w-full flex-col gap-3 border-t border-border pt-6">
              {c.assurances.map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-body">
                  <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-600" />
                  {line}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </PostShell>
  );
}
