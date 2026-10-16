"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AMBER, NAVY, fitCanvas, isTyping, loadBest, saveBest } from "./shared";

const W = 480;
const H = 160;
const GROUND = 128;
const PLAYER_X = 44;
const PLAYER_SIZE = 22;
const GRAVITY = 0.62;
const JUMP = 11.6;

type Phase = "ready" | "playing" | "over";
type Obstacle = { x: number; w: number; h: number };

export type RunnerLabels = { tap: string; over: string; again: string; score: string; best: string };

/* The offline-dinosaur kind of game: one button, jump the cacti, it gets faster.
   Space, the up arrow, a click or a tap all jump. */
export default function Runner({ labels }: { labels: RunnerLabels }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const sim = useRef({
    phase: "ready" as Phase,
    y: 0,
    vy: 0,
    speed: 5,
    distance: 0,
    untilNext: 120,
    obstacles: [] as Obstacle[],
    score: 0,
    scroll: 0,
  });

  const lastOver = useRef(0);

  useEffect(() => {
    const first = setTimeout(() => setBest(loadBest("runner")), 0);
    return () => clearTimeout(first);
  }, []);

  const start = useCallback(() => {
    const s = sim.current;
    s.phase = "playing";
    s.y = 0;
    s.vy = 0;
    s.speed = 5;
    s.distance = 0;
    s.untilNext = 120;
    s.obstacles = [];
    s.score = 0;
    setScore(0);
    setPhase("playing");
  }, []);

  const jump = useCallback(() => {
    const s = sim.current;
    if (s.phase !== "playing") {
      /* A short pause after losing, so the tap that killed the run does not
         instantly start the next one. */
      if (s.phase === "over" && Date.now() - lastOver.current < 450) return;
      start();
      return;
    }
    if (s.y === 0) s.vy = JUMP;
  }, [start]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let viewWidth = W;
    function fitView(target: HTMLCanvasElement) {
      // Keep the original vertical scale; extra width reveals more of the track.
      const scale = Math.max(1, target.getBoundingClientRect().height) / H;
      viewWidth = target.clientWidth / scale;
      return fitCanvas(target, viewWidth, H);
    }
    let ctx = fitView(el);
    const s = sim.current;

    function end() {
      s.phase = "over";
      lastOver.current = Date.now();
      setPhase("over");
      setBest((b) => {
        const next = Math.max(b, s.score);
        if (next > b) saveBest("runner", next);
        return next;
      });
    }

    function step(dt: number) {
      s.speed = Math.min(5 + s.score / 120, 11);
      s.distance += s.speed * dt;
      s.scroll += s.speed * dt;

      s.vy -= GRAVITY * dt;
      s.y = Math.max(0, s.y + s.vy * dt);
      if (s.y === 0 && s.vy < 0) s.vy = 0;

      s.untilNext -= s.speed * dt;
      if (s.untilNext <= 0) {
        const h = 22 + Math.random() * 20;
        s.obstacles.push({ x: viewWidth + 10, w: 12 + Math.random() * 10, h });
        s.untilNext = (240 + Math.random() * 200) * (s.speed / 5);
      }
      for (const o of s.obstacles) o.x -= s.speed * dt;
      s.obstacles = s.obstacles.filter((o) => o.x + o.w > -10);

      const top = GROUND - s.y - PLAYER_SIZE;
      for (const o of s.obstacles) {
        const hit =
          PLAYER_X + PLAYER_SIZE - 4 > o.x + 3 &&
          PLAYER_X + 4 < o.x + o.w - 3 &&
          top + PLAYER_SIZE - 3 > GROUND - o.h + 3;
        if (hit) {
          end();
          return;
        }
      }

      const next = Math.floor(s.distance / 10);
      if (next !== s.score) {
        s.score = next;
        setScore(next);
      }
    }

    function draw() {
      ctx.clearRect(0, 0, viewWidth, H);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, viewWidth, H);

      /* Slow clouds, then the ground and its moving dashes. */
      ctx.fillStyle = "#eceae4";
      for (let i = 0; i < Math.ceil(viewWidth / 190); i++) {
        const x = ((((i * 190 - s.scroll * 0.2) % (viewWidth + 80)) + (viewWidth + 80)) % (viewWidth + 80)) - 40;
        ctx.fillRect(x, 24 + i * 16, 44, 8);
        ctx.fillRect(x + 8, 18 + i * 16, 26, 8);
      }
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND + 1);
      ctx.lineTo(viewWidth, GROUND + 1);
      ctx.stroke();
      ctx.fillStyle = "#c9c6bd";
      for (let i = 0; i < Math.ceil(viewWidth / 61); i++) {
        const x = (((i * 61 - s.scroll) % viewWidth) + viewWidth) % viewWidth;
        ctx.fillRect(x, GROUND + 8 + (i % 3) * 5, 12, 2);
      }

      ctx.fillStyle = NAVY;
      for (const o of s.obstacles) {
        ctx.fillRect(o.x, GROUND - o.h, o.w, o.h);
        ctx.fillRect(o.x - 5, GROUND - o.h * 0.65, 5, 4);
        ctx.fillRect(o.x - 5, GROUND - o.h * 0.65 - 8, 4, 8);
        ctx.fillRect(o.x + o.w, GROUND - o.h * 0.5, 5, 4);
        ctx.fillRect(o.x + o.w + 1, GROUND - o.h * 0.5 - 8, 4, 8);
      }

      const top = GROUND - s.y - PLAYER_SIZE;
      ctx.fillStyle = AMBER;
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(PLAYER_X, top, PLAYER_SIZE, PLAYER_SIZE, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = NAVY;
      ctx.fillRect(PLAYER_X + 14, top + 6, 3, 3);
      const legs = s.y > 0 ? 0 : Math.floor(s.scroll / 8) % 2;
      ctx.fillRect(PLAYER_X + 4, top + PLAYER_SIZE, 4, 3 + legs * 2);
      ctx.fillRect(PLAYER_X + 14, top + PLAYER_SIZE, 4, 5 - legs * 2);
    }

    const ro = new ResizeObserver(() => {
      ctx = fitView(el);
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
        jump();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[12px] font-bold text-navy">
        <span>{labels.score}: {score}</span>
        <span>{labels.best}: {best}</span>
      </div>
      <button
        type="button"
        autoFocus
        onPointerDown={(e) => {
          e.preventDefault();
          jump();
        }}
        className="relative block w-full touch-none select-none overflow-hidden rounded-xl border border-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        aria-label={phase === "playing" ? "Jump" : phase === "over" ? labels.again : labels.tap}
      >
        {/* Match the former 384px panel's canvas height at each screen width. */}
        <canvas ref={canvas} className="block w-full" style={{ height: "calc(min(100vw - 74px, 342px) / 3)" }} />
        {phase !== "playing" && (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-white/70 text-navy">
            {phase === "over" && <span className="text-sm font-extrabold">{labels.over}</span>}
            <span className="rounded-full bg-amber-400 px-4 py-1.5 text-[12px] font-bold">
              {phase === "over" ? labels.again : labels.tap}
            </span>
          </span>
        )}
      </button>
    </div>
  );
}
