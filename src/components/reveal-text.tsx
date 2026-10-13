"use client";

import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type CSSProperties, type ReactElement, type ReactNode } from "react";

/* Milliseconds between one word and the next. */
const STEP = 55;

/* Plays once the element is mostly on screen. `immediate` starts it on the
   first paint instead: for a page's own h1, which should never wait on
   JavaScript to become readable. */
function useInView<T extends Element>(immediate: boolean) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(immediate);
  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);
  return [ref, inView] as const;
}

type Props = { className?: string; style?: CSSProperties; children?: ReactNode };

/* Wraps every word of the text in its own span with its place in the line,
   so CSS can stagger them left to right. Elements inside (the .hl marker, a
   line break) are kept, with their own words split the same way; a marker
   also learns when its first word arrives, so it grows after it. */
function split(node: ReactNode, count: { n: number }): ReactNode {
  return Children.map(node, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      return String(child)
        .split(/(\s+)/)
        .map((part, k) =>
          part.trim() ? (
            <span key={k} className="rw" style={{ "--i": count.n++ } as CSSProperties}>
              {part}
            </span>
          ) : (
            part
          ),
        );
    }
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<Props>;
    if (el.props.children === undefined) return el;
    const marker = typeof el.props.className === "string" && /\bhl\b/.test(el.props.className);
    const first = count.n;
    const kids = split(el.props.children, count);
    return cloneElement(
      el,
      marker ? { className: `${el.props.className} hl-grow`, style: { ...el.props.style, "--hl-delay": `${first * STEP + 260}ms` } as CSSProperties } : {},
      kids,
    );
  });
}

/* Heading text that arrives word by word, from the left, out of a blur. Put
   it inside the heading so the heading itself stays a server element. */
export function RevealText({ children, immediate = false }: { children: ReactNode; immediate?: boolean }) {
  const [ref, inView] = useInView<HTMLSpanElement>(immediate);
  return (
    <span ref={ref} className="rt" data-in={inView ? "" : undefined}>
      {split(children, { n: 0 })}
    </span>
  );
}

/* A highlight marker outside a heading: it grows from the left once it is on
   screen. */
export function Mark({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>(false);
  return (
    <span ref={ref} className={`hl hl-grow ${className}`} data-in={inView ? "" : undefined}>
      {children}
    </span>
  );
}
