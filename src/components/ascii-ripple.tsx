"use client";

import { useEffect, useRef } from "react";

/* A surface of monospace glyphs that ripples like water under the pointer.

   The water is a height field, one value per character cell, stepped with
   the classic two-buffer ripple: each cell becomes the average of its
   neighbours minus where it was a moment ago, then loses a little energy.
   The height at a cell picks its glyph from `chars` (calm to rough) and
   tints it towards `rippleColor`.

   With `text`, the text is drawn into the grid as ASCII art and the water
   bends it: each cell reads the text from slightly off its own position,
   following the slope of the surface, and rough cells shuffle their glyph.
   Without `text`, it is a quiet field of dots that only shows the water.

   It runs only while on screen, stops drawing once the water is calm, and
   draws one still frame for anyone who asked for reduced motion. The canvas
   ignores the pointer; it listens on its parent, so links and buttons above
   it keep working. */

type Props = {
  /* Drawn into the grid as ASCII art. Use \n for a second line. */
  text?: string;
  className?: string;
  /* Glyph size in CSS pixels. */
  fontSize?: number;
  /* Glyphs at rest, and on the crests. Any CSS colour. */
  color?: string;
  rippleColor?: string;
  /* Calm to rough. */
  chars?: string;
  /* Random drops per second while the pointer is elsewhere. */
  rain?: number;
  /* Opacity of the resting dots when there is no text. */
  base?: number;
};

const DAMPING = 0.965;
const MAX = 90;

export function AsciiRipple({
  text,
  className = "",
  fontSize = 13,
  color = "rgba(23,23,23,0.5)",
  rippleColor = "#e0ad12",
  chars = "·.,:;-~=+*%#@",
  rain = 0,
  base = 0.35,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    /* The nearest section marked data-ripple-host, so content laid over the
       canvas still sends it the pointer; else the parent. */
    const host = canvas?.closest<HTMLElement>("[data-ripple-host]") ?? canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cw = fontSize * 0.62;
    const ch = fontSize * 1.15;
    let cols = 0;
    let rows = 0;
    let a = new Float32Array(0);
    let b = new Float32Array(0);
    let mask = new Float32Array(0);
    let raf = 0;
    let running = false;
    let visible = false;
    let lastPointer = 0;
    let lastDrop: { x: number; y: number } | null = null;

    /* The text, rasterised at one pixel per cell and fitted to the grid. */
    function buildMask() {
      mask = new Float32Array(cols * rows);
      if (!text || !cols || !rows) return;
      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      const lines = text.split("\n");
      /* Cells are taller than they are wide, so squash the text vertically
         to keep its proportions once drawn in glyphs. */
      const squash = cw / ch;
      o.font = `900 100px system-ui, sans-serif`;
      const widest = Math.max(...lines.map((l) => o.measureText(l).width));
      const size = Math.min((cols * 0.92 * 100) / widest, (rows * 0.86) / (lines.length * squash * 1.05));
      o.setTransform(1, 0, 0, squash, 0, 0);
      o.font = `900 ${size}px system-ui, sans-serif`;
      o.fillStyle = "#fff";
      o.textAlign = "center";
      o.textBaseline = "middle";
      const lineH = size * 1.05;
      const top = rows / squash / 2 - ((lines.length - 1) * lineH) / 2;
      lines.forEach((l, k) => o.fillText(l, cols / 2, top + k * lineH));
      const px = o.getImageData(0, 0, cols, rows).data;
      for (let i = 0; i < cols * rows; i++) mask[i] = px[i * 4 + 3] / 255;
    }

    /* Every glyph in both colours, drawn once into a strip. Copying a cell out
       of it is far cheaper than laying out text for thousands of cells a
       frame. Row 0 is the resting colour, row 1 the crest colour. */
    let atlas: HTMLCanvasElement | null = null;
    let gw = 0;
    let gh = 0;
    function buildAtlas(dpr: number) {
      gw = Math.ceil(cw * dpr);
      gh = Math.ceil(ch * dpr);
      atlas = document.createElement("canvas");
      atlas.width = gw * chars.length;
      atlas.height = gh * 2;
      const g = atlas.getContext("2d")!;
      g.font = `${fontSize * dpr}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      g.textBaseline = "top";
      [color, rippleColor].forEach((c, row) => {
        g.fillStyle = c;
        for (let k = 0; k < chars.length; k++) g.fillText(chars[k], k * gw, row * gh);
      });
    }

    function resize() {
      const r = canvas!.getBoundingClientRect();
      /* A background field reads the same at 1x and costs a quarter of the
         pixels; drawn text keeps its sharpness on dense screens. */
      const dpr = text ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      canvas!.width = Math.round(r.width * dpr);
      canvas!.height = Math.round(r.height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(3, Math.floor(r.width / cw));
      rows = Math.max(3, Math.floor(r.height / ch));
      a = new Float32Array(cols * rows);
      b = new Float32Array(cols * rows);
      buildAtlas(dpr);
      buildMask();
      draw();
    }

    function drop(cx: number, cy: number, strength: number, radius: number) {
      const r2 = radius * radius;
      for (let y = Math.max(1, Math.floor(cy - radius)); y <= Math.min(rows - 2, Math.ceil(cy + radius)); y++) {
        for (let x = Math.max(1, Math.floor(cx - radius)); x <= Math.min(cols - 2, Math.ceil(cx + radius)); x++) {
          const d2 = (x - cx) ** 2 + (y - cy) ** 2;
          if (d2 <= r2) a[y * cols + x] += strength * (1 - d2 / r2);
        }
      }
      wake();
    }

    function step() {
      let energy = 0;
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const i = y * cols + x;
          let n = (a[i - 1] + a[i + 1] + a[i - cols] + a[i + cols]) / 2 - b[i];
          n *= DAMPING;
          if (n > MAX) n = MAX;
          else if (n < -MAX) n = -MAX;
          b[i] = n;
          energy += n < 0 ? -n : n;
        }
      }
      const t = a;
      a = b;
      b = t;
      return energy / (cols * rows);
    }

    function draw() {
      const w = cols * cw;
      const h = rows * ch;
      ctx!.clearRect(0, 0, w + cw, h + ch);
      if (!atlas) return;
      const last = chars.length - 1;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const v = a[i];
          const e = Math.min(1, (v < 0 ? -v : v) / 40);
          let level: number;
          let k: number;
          if (text) {
            /* Read the text from where the slope of the water points. */
            const sx = x > 0 && x < cols - 1 ? (a[i + 1] - a[i - 1]) * 0.08 : 0;
            const sy = y > 0 && y < rows - 1 ? (a[i + cols] - a[i - cols]) * 0.08 : 0;
            const mx = Math.min(cols - 1, Math.max(0, Math.round(x + sx)));
            const my = Math.min(rows - 1, Math.max(0, Math.round(y + sy)));
            const m = mask[my * cols + mx];
            level = Math.min(1, m * 0.85 + e * 0.7);
            if (level < 0.06) continue;
            k = e > 0.15 && Math.random() < e * 0.6 ? 1 + Math.floor(Math.random() * last) : Math.round(level * last);
          } else {
            /* A sparse field of dots at rest, so the page behind stays quiet. */
            if (e < 0.04 && (x + y) % 2) continue;
            level = e;
            k = Math.round(e * last);
          }
          ctx!.globalAlpha = text ? level : Math.min(1, base + e * (1 - base));
          ctx!.drawImage(atlas, k * gw, e > 0.12 ? gh : 0, gw, gh, x * cw, y * ch, cw, ch);
        }
      }
      ctx!.globalAlpha = 1;
    }

    /* Drawn at most 30 times a second, with two steps of water per frame so
       the waves keep their speed. Plenty for glyphs, and half the work. */
    let lastFrame = 0;
    function frame(now: number) {
      if (now - lastFrame < 32) {
        raf = requestAnimationFrame(frame);
        return;
      }
      lastFrame = now;
      step();
      const energy = step();
      draw();
      if (energy > 0.02 && visible) raf = requestAnimationFrame(frame);
      else running = false;
    }

    function wake() {
      if (still || running || !visible) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }

    /* Pointer position in cells, relative to the canvas. */
    const cell = (e: PointerEvent) => {
      const r = canvas!.getBoundingClientRect();
      return { x: (e.clientX - r.left) / cw, y: (e.clientY - r.top) / ch };
    };
    const onMove = (e: PointerEvent) => {
      lastPointer = performance.now();
      const p = cell(e);
      /* A trail, not a carpet: one drop per cell or so of travel. */
      if (lastDrop && Math.hypot(p.x - lastDrop.x, p.y - lastDrop.y) < 1.2) return;
      lastDrop = p;
      drop(p.x, p.y, 28, 2.2);
    };
    const onDown = (e: PointerEvent) => {
      lastPointer = performance.now();
      const p = cell(e);
      drop(p.x, p.y, 90, 4);
    };
    const onLeave = () => {
      lastDrop = null;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    if (still) return () => ro.disconnect();

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) wake();
    });
    io.observe(canvas);

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointerleave", onLeave);

    /* Rain only falls while the pointer is elsewhere, so it never fights the
       visitor's own ripples. */
    const timer = rain
      ? window.setInterval(() => {
          if (!visible || document.hidden || performance.now() - lastPointer < 2500) return;
          drop(2 + Math.random() * (cols - 4), 2 + Math.random() * (rows - 4), 45 + Math.random() * 40, 2.5 + Math.random() * 2);
        }, 1000 / rain)
      : 0;

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(timer);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [text, fontSize, color, rippleColor, chars, rain, base]);

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none block h-full w-full ${className}`} />;
}
