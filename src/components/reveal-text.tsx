"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* How long a block of text takes to decode, and how often its random
   characters change while it does. */
const DECODE = { heading: 900, text: 650 };
const SHUFFLE_MS = 70;

/* Stand-ins drawn from the same kind of character, so a capital stays about
   as wide as a capital and lines do not rewrap while they decode. */
const UPPER = "ABCDEFGHJKLMNPQRSTUVXYZ";
const LOWER = "abcdeghknopqrsuvxyz";
const DIGIT = "0123456789";
const any = (set: string) => set[Math.floor(Math.random() * set.length)];

/* Random stand-ins for letters and digits; spaces and punctuation stay. */
const scramble = (s: string) =>
  s.replace(/[\p{L}\p{N}]/gu, (c) => (/\p{N}/u.test(c) ? any(DIGIT) : c === c.toUpperCase() && c !== c.toLowerCase() ? any(UPPER) : any(LOWER)));

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Text that decodes out of random characters, left to right, as it comes on
   screen. It works on the element's own text nodes, with no extra markup:
   just before the text scrolls into view it is swapped for random
   characters, so nobody sees the real words flip to noise, and once it is
   on screen it settles back into the real text. React keeps pointing at the
   same text nodes, and the real text is always put back, finished or not.

   Text at the very top of a page (`immediate`) is on screen before the
   script runs, so it is hidden until the decode starts, and shows by itself
   after 1.5 seconds if the script never comes. `text` decodes body copy a
   little faster than headings. */
export function RevealText({ children, immediate = false, text = false }: { children: ReactNode; immediate?: boolean; text?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const live = () => root.setAttribute("data-live", "");
    if (reducedMotion()) return live();

    /* `shown` is what was last written, so a change React makes mid-decode
       (a count ticking up) is picked up as the new real text. */
    const nodes: { node: Text; real: string; shown: string }[] = [];
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      const t = n as Text;
      if (t.nodeValue?.trim()) nodes.push({ node: t, real: t.nodeValue, shown: t.nodeValue });
    }
    if (!nodes.length) return live();

    const dur = text ? DECODE.text : DECODE.heading;
    let raf = 0;
    let state: "real" | "noise" | "decoding" | "done" = "real";

    const write = (n: (typeof nodes)[number], value: string) => {
      if (n.node.nodeValue !== n.shown) n.real = n.node.nodeValue ?? "";
      n.node.nodeValue = n.shown = value;
    };
    const restore = () => {
      for (const n of nodes) write(n, n.node.nodeValue !== n.shown ? (n.node.nodeValue ?? "") : n.real);
    };
    const toNoise = () => {
      if (state !== "real") return;
      for (const n of nodes) write(n, scramble(n.real));
      state = "noise";
    };
    const decode = () => {
      if (state === "decoding" || state === "done") return;
      toNoise();
      state = "decoding";
      live();
      const t0 = performance.now();
      let last = 0;
      const tick = (now: number) => {
        const p = (now - t0) / dur;
        if (p >= 1) {
          restore();
          state = "done";
          return;
        }
        if (now - last >= SHUFFLE_MS) {
          last = now;
          for (const n of nodes) {
            if (n.node.nodeValue !== n.shown) n.real = n.node.nodeValue ?? "";
            const fixed = Math.floor(p * n.real.length);
            write(n, n.real.slice(0, fixed) + scramble(n.real.slice(fixed)));
          }
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    /* Scramble while still a little below the fold; decode once on screen. */
    const near = new IntersectionObserver(([e]) => e.isIntersecting && toNoise(), { rootMargin: "0px 0px 25% 0px" });
    const seen = new IntersectionObserver(([e]) => e.isIntersecting && (decode(), seen.disconnect(), near.disconnect()), {
      rootMargin: "0px",
    });
    near.observe(root);
    seen.observe(root);

    return () => {
      near.disconnect();
      seen.disconnect();
      cancelAnimationFrame(raf);
      restore();
    };
  }, [immediate, text]);

  return (
    <span ref={ref} className="rt" data-top={immediate ? "" : undefined}>
      {children}
    </span>
  );
}

/* A highlight marker: it grows from the left, slowly, like a pen stroke,
   once it is on screen. */
export function Mark({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);
  return (
    <span ref={ref} className={`hl hl-grow ${className}`.trim()} data-in={inView ? "" : undefined}>
      {children}
    </span>
  );
}
