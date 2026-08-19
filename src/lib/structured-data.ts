import { content } from "@/lib/content";

const SITE = "https://zakrulabd.com";

/* Stable @id anchors. Using one graph with cross-references, rather than several
   loose nodes, lets a crawler resolve "the person", "the business" and "the page"
   as the same three entities everywhere they are mentioned. */
export const ID = {
  website: `${SITE}/#website`,
  business: `${SITE}/#business`,
  person: `${SITE}/#zakrul`,
  logo: `${SITE}/#logo`,
  homepage: `${SITE}/#webpage`,
};

/* Deliberately absent: aggregateRating / Review. The testimonials on this site are
   collected and published by the business about itself, and Google treats those as
   self-serving — LocalBusiness and Organization pages using them are ineligible for
   review rich results and risk a manual action. Real reviews would have to come
   from an independent platform.
   https://developers.google.com/search/docs/appearance/structured-data/review-snippet */
export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": ID.website,
      url: SITE,
      name: "zakrulabd",
      description: content.footer.blurb,
      publisher: { "@id": ID.business },
      inLanguage: "en-MY",
    },
    {
      "@type": "ImageObject",
      "@id": ID.logo,
      url: `${SITE}/logo-ghost-outline.webp`,
      contentUrl: `${SITE}/logo-ghost-outline.webp`,
      caption: "zakrulabd",
    },
    {
      "@type": "Person",
      "@id": ID.person,
      name: "Zakrul Abdul",
      alternateName: "zakrulabd",
      url: SITE,
      email: "zakrulabd@gmail.com",
      telephone: "+60102551527",
      jobTitle: "Freelance Web Developer & Digital Marketer",
      knowsLanguage: ["en", "ms"],
      address: {
        "@type": "PostalAddress",
        addressRegion: "Selangor",
        addressCountry: "MY",
      },
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
      worksFor: { "@id": ID.business },
    },
    {
      "@type": "ProfessionalService",
      "@id": ID.business,
      name: "zakrulabd — Web Development & Digital Marketing",
      url: SITE,
      description: content.footer.blurb,
      email: "zakrulabd@gmail.com",
      telephone: "+60102551527",
      image: { "@id": ID.logo },
      logo: { "@id": ID.logo },
      founder: { "@id": ID.person },
      employee: { "@id": ID.person },
      /* One person, so the headcount is a fact worth stating rather than leaving
         a crawler to assume an agency. */
      numberOfEmployees: { "@type": "QuantitativeValue", value: 1 },
      address: {
        "@type": "PostalAddress",
        addressRegion: "Selangor",
        addressCountry: "MY",
      },
      areaServed: { "@type": "Country", name: "Malaysia" },
      availableLanguage: ["en", "ms"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Web development packages",
        /* No price fields: the site quotes each project individually, and inventing
           a figure here would misstate the offer. */
        itemListElement: content.pricing.tiers.map((tier) => ({
          "@type": "Offer",
          name: tier.name,
          description: tier.description,
          itemOffered: {
            "@type": "Service",
            name: tier.name,
            description: tier.description,
            provider: { "@id": ID.business },
            areaServed: { "@type": "Country", name: "Malaysia" },
          },
        })),
      },
      makesOffer: content.services.items.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title,
          description: service.description,
          provider: { "@id": ID.business },
        },
      })),
    },
    {
      "@type": "WebPage",
      "@id": ID.homepage,
      url: SITE,
      name: "zakrulabd — Web Development & Digital Marketing in Malaysia",
      isPartOf: { "@id": ID.website },
      about: { "@id": ID.business },
      primaryImageOfPage: { "@id": ID.logo },
      inLanguage: "en-MY",
    },
  ],
};

/* Legal pages: a two-level trail so they are understood as children of the site
   root rather than as orphan documents. */
export function breadcrumb(name: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name, item: `${SITE}${path}` },
    ],
  };
}
