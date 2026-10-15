/* Whether the visitor has switched the section summaries off. Closing one
   summary with its cross only closes that one; this is the deliberate, lasting
   choice, made from "Turn off summaries" in a summary or the switch in the
   contact dock. Kept in localStorage, and announced to the rest of the page so
   the dock and the summaries stay in step. */
const KEY = "section-summaries-off";
const EVENT = "summaries-off-change";

export function getSummariesOff() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setSummariesOff(off: boolean) {
  try {
    if (off) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    /* Storage blocked: the choice lasts until the page is reloaded. */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: off }));
}

export function subscribeSummariesOff(listener: (off: boolean) => void) {
  const onChange = (e: Event) => listener((e as CustomEvent<boolean>).detail);
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}
