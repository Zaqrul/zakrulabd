import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ContactLauncher } from "@/components/contact-launcher";
import { ConversionTracking } from "@/components/conversion-tracking";
import { GoogleAnalytics } from "@/components/google-analytics";
import { TawkWidget } from "@/components/tawk-widget";
import { structuredData } from "@/lib/structured-data";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500"],
});

export function SiteDocument({ children, lang }: { children: React.ReactNode; lang: "en" | "ms" }) {
  return (
    <html lang={lang} className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {/* Headings and markers wait for a script to say they are on screen;
            without one, show them as they are. */}
        <noscript>
          <style>{".rt{opacity:1!important;animation:none!important}.hl-grow{background-size:100% 100%!important}"}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-amber-400 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-navy focus:outline-none focus:ring-2 focus:ring-navy"
        >
          {lang === "ms" ? "Langkau ke kandungan" : "Skip to content"}
        </a>
        {children}
        <TawkWidget />
        <ContactLauncher lang={lang} />
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
        <ConversionTracking />
      </body>
    </html>
  );
}
