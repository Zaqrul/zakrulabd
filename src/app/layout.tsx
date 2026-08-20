import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/google-analytics";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { TawkWidget } from "@/components/tawk-widget";
import { structuredData } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "zakrulabd — Freelance Web Developer & Digital Marketer in Malaysia",
    template: "%s | zakrulabd",
  },
  description:
    "Freelance web developer in Malaysia building websites and custom web systems with React, Laravel, and WordPress — alongside technical SEO, GA4 analytics, and workflow automation.",
  keywords: [
    /* Both spellings of the brand: the domain is zakrul.com while the email and
       the social handles are zakrulabd, and people search for either. */
    "zakrul",
    "zakrulabd",
    "Muhamad Zaqrul",
    "Freelance Web Developer Malaysia",
    "Web Developer Malaysia",
    "React Developer Malaysia",
    "Laravel Developer Malaysia",
    "WordPress Developer Malaysia",
    "SEO Specialist Malaysia",
    "GA4 Setup Malaysia",
    "Healthcare Digital Marketing",
    "SME Web Development Malaysia",
    "Full Stack Developer",
  ],
  authors: [{ name: "Muhamad Zaqrul", url: SITE_URL }],
  creator: "Muhamad Zaqrul",
  publisher: "zakrulabd",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-MY": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_MY",
    url: SITE_URL,
    siteName: "zakrulabd",
    title: "zakrulabd — Web Development & Digital Marketing in Malaysia",
    description:
      "Websites and custom web systems built with React, Laravel, and WordPress — alongside technical SEO, GA4 analytics, and automation.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "zakrulabd — Web Development & SEO for Businesses in Malaysia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "zakrulabd — Web Development & Digital Marketing in Malaysia",
    description:
      "Websites and custom web systems built with React, Laravel, and WordPress — alongside technical SEO, GA4 analytics, and automation.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  /* Search Console's meta-tag method. Set the env var to the token's content
     value only, not the whole tag. Verifying by DNS TXT in Cloudflare instead
     is fine — then leave this unset and no tag is emitted. */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <TawkWidget />
        {/* Web Analytics and Speed Insights only report once these are on the
            page — turning them on in the Vercel dashboard is not enough. */}
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
