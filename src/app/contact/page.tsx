import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
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
        {/* The form itself keeps a reading measure rather than the full shell:
            a 1200px-wide text field looks like a search bar, not an answer box. */}
        <div className="max-w-2xl">
          <ContactForm />
        </div>
      </main>
    </PostShell>
  );
}
