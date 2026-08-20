/* The one place the live origin is written down. Canonicals, the sitemap, the
   robots sitemap line, and every structured-data @id are built from it, so the
   site can never end up half-pointing at an old domain. www is the canonical
   host: the apex 308-redirects to it. No trailing slash. */
export const SITE_URL = "https://www.zakrul.com";

/** Absolute URL for a site-relative path, e.g. url("/compare"). */
export function url(path = "/") {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}
