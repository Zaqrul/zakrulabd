/* The live apex is the canonical host; www redirects here. Keep every
   canonical, sitemap URL and structured-data @id on the redirect target. */
export const SITE_URL = "https://zakrul.com";

/** Absolute URL for a site-relative path, e.g. url("/compare"). */
export function url(path = "/") {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}
