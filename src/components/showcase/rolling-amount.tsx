"use client";

import { useEffect, useRef, useState } from "react";

/* Counts from the old figure to the new one, so totals roll rather than jump
   when the figure behind them changes. Shared by the showcases. */
export function RollingAmount({ value, format }: { value: number; format: (n: number) => string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    /* Reduced motion still goes through one frame, just with no duration. */
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = duration ? Math.min(1, (now - t0) / duration) : 1;
      const eased = 1 - Math.pow(1 - k, 3);
      const n = start + (value - start) * eased;
      from.current = n;
      setShown(n);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className="tabular-nums">{format(shown)}</span>;
}
