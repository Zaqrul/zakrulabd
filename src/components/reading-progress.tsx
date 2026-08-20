"use client";

import { useEffect, useRef, useState } from "react";

/* How far through the piece the reader is, drawn across the very top of the
   window. Measured against the article itself rather than the document, so the
   footer and the closing CTA do not count as reading and the bar reaches full
   exactly when the last paragraph does. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.getElementById(targetId);
    if (!article) return;

    let frame = 0;

    function measure() {
      frame = 0;
      const el = document.getElementById(targetId);
      if (!el) return;

      const start = el.offsetTop;
      const distance = el.offsetHeight - window.innerHeight;
      /* A piece shorter than the window is read the moment it is on screen. */
      if (distance <= 0) {
        setProgress(100);
        return;
      }

      const scrolled = window.scrollY - start;
      setProgress(Math.min(100, Math.max(0, (scrolled / distance) * 100)));
    }

    /* Scroll fires far more often than the screen refreshes, so the work is
       deferred to the next frame rather than done on every event. */
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent"
    >
      <div
        className="h-full bg-amber-400 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

/* Shown at the end of the piece, once it has actually been scrolled to. Kept
   out of the page until then: a congratulation that is visible from the top
   would be congratulating nobody. */
export function ReadComplete({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [reached, setReached] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || reached) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setReached(true);
      },
      /* Most of it has to be on screen, so scrolling past in one flick does not
         count as having read to the end. */
      { threshold: 0.6 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reached]);

  return (
    <div ref={ref} className={reached ? "rise-in" : "opacity-0"} aria-hidden={!reached}>
      {children}
    </div>
  );
}
