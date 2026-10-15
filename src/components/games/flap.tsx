"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AMBER, NAVY, fitCanvas, isTyping, loadBest, saveBest } from "./shared";

const W = 288;
const H = 384;
const GROUND = 360;
const BIRD_X = 78;
const RADIUS = 11;
const GRAVITY = 0.34;
const FLAP = -5.7;
const PIPE_W = 46;
const GAP = 112;
const PIPE_SPEED = 2.2;
const PIPE_EVERY = 150;

type Phase = "ready" | "playing" | "over";
type Pipe = { x: number; gapY: number; passed: boolean };

export type FlapLabels = { tap: string; over: string; again: string; score: string; best: string };

/* The flapping-bird kind of game: each tap lifts the bird, gravity does the
   rest, and the gaps between the pipes are all there is to aim at. */
export default function Flap({ labels }: { labels: FlapLabels }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const lastOver = useRef(0);
  const sim = useRef({
    phase: "ready" as Phase,
    y: H / 2 - 20,
    vy: 0,
    pipes: [] as Pipe[],
    sinceLast: PIPE_EVERY - 70,
    score: 0,
    tick: 0,
  });

  useEffect(() => {
    const first = setTimeout(() => setBest(loadBest("flap")), 0);
    return () => clearTimeout(first);
  }, []);

  const flap = useCallback(() => {
    const s = sim.current;
    if (s.phase === "playing") {
      s.vy = FLAP;
      return;
    }
    if (s.phase === "over" && Date.now() - lastOver.current < 450) return;
    s.phase = "playing";
    s.y = H / 2 - 20;
    s.vy = FLAP;
    s.pipes = [];
    s.sinceLast = PIPE_EVERY - 70;
    s.score = 0;
    setScore(0);
    setPhase("playing");
  }, []);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let ctx = fitCanvas(el, W, H);
    const s = sim.current;

    function end() {
      s.phase = "over";
      lastOver.current = Date.now();
      setPhase("over");
      setBest((b) => {
        const next = Math.max(b, s.score);
        if (next > b) saveBest("flap", next);
        return next;
      });
    }

    function step(dt: number) {
      s.vy += GRAVITY * dt;
      s.y += s.vy * dt;

      s.sinceLast += PIPE_SPEED * dt;
      if (s.sinceLast >= PIPE_EVERY) {
        s.sinceLast = 0;
        s.pipes.push({ x: W + 10, gapY: 70 + Math.random() * 108, passed: false });
      }
      for (const p of s.pipes) {
        p.x -= PIPE_SPEED * dt;
        if (!p.passed && p.x + PIPE_W < BIRD_X - RADIUS) {
          p.passed = true;
          s.score += 1;
          setScore(s.score);
        }
      }
      s.pipes = s.pipes.filter((p) => p.x + PIPE_W > -10);

      if (s.y + RADIUS >= GROUND || s.y - RADIUS <= 0) {
        s.y = Math.min(Math.max(s.y, RADIUS), GROUND - RADIUS);
        end();
        return;
      }
      for (const p of s.pipes) {
        const overlapsX = BIRD_X + RADIUS - 2 > p.x && BIRD_X - RADIUS + 2 < p.x + PIPE_W;
        if (overlapsX && (s.y - RADIUS + 2 < p.gapY || s.y + RADIUS - 2 > p.gapY + GAP)) {
          end();
          return;
        }
      }
    }

    function draw() {
      ctx.fillStyle = "#fff8dc";
      ctx.fillRect(0, 0, W, H);

      for (const p of s.pipes) {
        ctx.fillStyle = NAVY;
        ctx.fillRect(p.x, 0, PIPE_W, p.gapY);
        ctx.fillRect(p.x, p.gapY + GAP, PIPE_W, GROUND - p.gapY - GAP);
        ctx.fillStyle = AMBER;
        ctx.fillRect(p.x - 3, p.gapY - 14, PIPE_W + 6, 14);
        ctx.fillRect(p.x - 3, p.gapY + GAP, PIPE_W + 6, 14);
        ctx.strokeStyle = NAVY;
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x - 3, p.gapY - 14, PIPE_W + 6, 14);
        ctx.strokeRect(p.x - 3, p.gapY + GAP, PIPE_W + 6, 14);
      }

      ctx.fillStyle = "#e9dca8";
      ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.fillStyle = NAVY;
      ctx.fillRect(0, GROUND, W, 3);

      /* Idle bob while waiting for the first tap. */
      s.tick += 1;
      const bob = s.phase === "ready" ? Math.sin(s.tick / 12) * 6 : 0;
      const tilt = Math.max(-0.5, Math.min(1.1, s.vy * 0.07));
      ctx.save();
      ctx.translate(BIRD_X, s.y + bob);
      ctx.rotate(s.phase === "playing" || s.phase === "over" ? tilt : 0);
      ctx.fillStyle = AMBER;
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(4, -3, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = NAVY;
      ctx.beginPath();
      ctx.arc(5, -3, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e0752a";
      ctx.beginPath();
      ctx.moveTo(9, 1);
      ctx.lineTo(17, 3);
      ctx.lineTo(9, 6);
      ctx.closePath();
      ctx.fill();
      /* The wing beats while the bird is rising. */
      ctx.fillStyle = "#e6b422";
      ctx.beginPath();
      ctx.ellipse(-4, 3 + (s.vy < 0 ? -2 : 1), 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (s.phase === "playing") {
        ctx.fillStyle = NAVY;
        ctx.font = "bold 34px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(String(s.score), W / 2, 56);
      }
    }

    const ro = new ResizeObserver(() => {
      ctx = fitCanvas(el, W, H);
      draw();
    });
    ro.observe(el);

    let raf = 0;
    let last = performance.now();
    function frame(now: number) {
      const dt = Math.min((now - last) / 16.667, 3);
      last = now;
      if (s.phase === "playing") step(dt);
      draw();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isTyping(e)) return;
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flap]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[12px] font-bold text-navy">
        <span>{labels.score}: {score}</span>
        <span>{labels.best}: {best}</span>
      </div>
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          flap();
        }}
        className="relative mx-auto block w-full max-w-[288px] touch-none select-none overflow-hidden rounded-xl border border-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        aria-label={phase === "playing" ? "Flap" : phase === "over" ? labels.again : labels.tap}
      >
        <canvas ref={canvas} className="block h-auto w-full" style={{ aspectRatio: `${W} / ${H}` }} />
        {phase !== "playing" && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/55 text-navy">
            {phase === "over" && <span className="text-base font-extrabold">{labels.over}</span>}
            <span className="rounded-full bg-amber-400 px-4 py-1.5 text-[12px] font-bold">
              {phase === "over" ? labels.again : labels.tap}
            </span>
          </span>
        )}
      </button>
    </div>
  );
}
