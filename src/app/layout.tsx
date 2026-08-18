import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/language-provider";

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
  metadataBase: new URL("https://zakrulabd.com"),
  title: {
    default: "zakrulabd — Solo Freelance Web Developer & Digital Marketer Malaysia",
    template: "%s | zakrulabd",
  },
  description:
    "Solo freelance web developer in Malaysia offering full-cycle web development in React, Laravel, and WordPress, paired with technical SEO, GA4 analytics, and automation.",
  keywords: [
    "Solo Freelancer Malaysia",
    "Freelance Web Developer Malaysia",
    "Web Developer Malaysia",
    "React Developer Malaysia",
    "Laravel Developer Malaysia",
    "WordPress Developer Malaysia",
    "SEO Specialist Malaysia",
    "GA4 Setup Malaysia",
    "Healthcare Digital Marketing",
    "PKS Web Development",
    "Full Stack Developer",
  ],
  authors: [{ name: "Zakrul Abdul", url: "https://zakrulabd.com" }],
  creator: "Zakrul Abdul",
  publisher: "zakrulabd",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://zakrulabd.com",
    languages: {
      "en-MY": "https://zakrulabd.com",
      "ms-MY": "https://zakrulabd.com",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_MY",
    alternateLocale: ["ms_MY"],
    url: "https://zakrulabd.com",
    siteName: "zakrulabd",
    title: "zakrulabd — Web Development & Digital Marketing Malaysia",
    description:
      "Full-cycle web development in React, Laravel, and WordPress, paired with technical SEO, GA4 analytics, and automation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "zakrulabd — Web Development & Digital Marketing Malaysia",
    description:
      "Full-cycle web development in React, Laravel, and WordPress, paired with technical SEO, GA4 analytics, and automation.",
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "zakrulabd — Web Development & Digital Marketing",
  url: "https://zakrulabd.com",
  description:
    "Full-cycle web development in React, Laravel, and WordPress, paired with technical SEO, GA4 analytics, and workflow automation in Malaysia.",
  telephone: "+60102551527",
  email: "zakrulabd@gmail.com",
  areaServed: {
    "@type": "Country",
    name: "Malaysia",
  },
  priceRange: "RM750 - RM3500+",
  knowsAbout: [
    "Web Development",
    "React",
    "Next.js",
    "Laravel",
    "WordPress",
    "Technical SEO",
    "Google Analytics 4",
    "Workflow Automation",
  ],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
