"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AMBER, NAVY, fitCanvas, isTyping, loadBest, saveBest } from "./shared";
import {
  CHAPTERS,
  H,
  LEVEL_AT,
  MAX_LEVEL,
  PLAYER_H,
  PLAYER_W,
  W,
  createState,
  isBoss,
  maxHpFor,
  nextChapter,
  retryChapter,
  step,
  type Callout,
  type Enemy,
  type Gun,
  type PickupKind,
  type State,
} from "./space-logic";

export type SpaceLabels = {
  tap: string;
  score: string;
  best: string;
  bomb: string;
  hint: string;
  chapterName: (n: number) => string;
  clear: (n: number) => string;
  next: string;
  lost: string;
  retry: string;
  won: string;
  again: string;
  guns: Record<Exclude<Gun, "blaster">, string>;
  callouts: Record<Callout, string>;
};

type Mode = "ready" | "play" | "clear" | "dead" | "won";

/* The kind of space game once played on a phone with a keypad: the ship holds
   the left of the screen and fires on its own, and the job is to fly through
   three chapters of enemies, each ending in a boss. Arrow keys or W A S D to
   fly, B for a bomb; or drag a finger or the mouse across the screen, with the
   button underneath for a bomb. */
export default function Space({ labels }: { labels: SpaceLabels }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("ready");
  const [chapter, setChapter] = useState(1);
  const [score, setScore] = useState(0);
  const [bombs, setBombs] = useState(2);
  const [best, setBest] = useState(0);
  const world = useRef<State>(createState());
  const modeRef = useRef<Mode>("ready");
  const keys = useRef({ up: false, down: false, left: false, right: false, bomb: false });
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const pending = useRef({ x: 0, y: 0 });
  const bombQueued = useRef(false);
  const labelsRef = useRef(labels);

  useEffect(() => {
    labelsRef.current = labels;
  }, [labels]);

  useEffect(() => {
    const first = setTimeout(() => setBest(loadBest("space")), 0);
    return () => clearTimeout(first);
  }, []);

  const remember = useCallback((value: number) => {
    setBest((b) => {
      if (value > b) {
        saveBest("space", value);
        return value;
      }
      return b;
    });
  }, []);

  const begin = useCallback((s: State) => {
    world.current = s;
    modeRef.current = "play";
    setMode("play");
    setChapter(s.chapter);
    setScore(s.score);
    setBombs(s.p.bombs);
  }, []);

  const start = useCallback(() => begin(createState()), [begin]);

  const act = useCallback(() => {
    const s = world.current;
    if (modeRef.current === "ready" || modeRef.current === "won") start();
    else if (modeRef.current === "clear") begin(nextChapter(s));
    else if (modeRef.current === "dead") begin(retryChapter(s));
  }, [begin, start]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let ctx = fitCanvas(el, W, H);
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let shownScore = -1;
    let shownBombs = -1;
    let deadFor = 0;

    function frame(now: number) {
      acc = Math.min(acc + (now - last) / 16.667, 4);
      last = now;
      const s = world.current;

      if (modeRef.current === "play") {
        while (acc >= 1) {
          acc -= 1;
          const k = keys.current;
          let mx = ((k.right ? 1 : 0) - (k.left ? 1 : 0)) * 2.7;
          let my = ((k.down ? 1 : 0) - (k.up ? 1 : 0)) * 2.7;
          /* A finger or mouse drag is spent a few pixels a frame, so the ship
             glides to where it was pulled instead of jumping there. */
          const px = Math.max(-6, Math.min(6, pending.current.x));
          const py = Math.max(-6, Math.min(6, pending.current.y));
          pending.current.x -= px;
          pending.current.y -= py;
          mx += px;
          my += py;
          const bomb = k.bomb || bombQueued.current;
          bombQueued.current = false;
          step(s, { mx, my, bomb });
        }
        if (s.score !== shownScore) {
          shownScore = s.score;
          setScore(s.score);
        }
        if (s.p.bombs !== shownBombs) {
          shownBombs = s.p.bombs;
          setBombs(s.p.bombs);
        }
        if (s.phase === "dead") {
          deadFor += 1;
          if (deadFor > 60) {
            deadFor = 0;
            modeRef.current = "dead";
            setMode("dead");
            remember(s.score);
          }
        } else if (s.phase === "clear" && s.clearFor > 120 && s.chapter < CHAPTERS) {
          modeRef.current = "clear";
          setMode("clear");
          remember(s.score);
        } else if (s.phase === "won") {
          modeRef.current = "won";
          setMode("won");
          remember(s.score);
        }
      } else {
        acc = 0;
      }

      draw(ctx, s, labelsRef.current, modeRef.current);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => {
      ctx = fitCanvas(el, W, H);
      draw(ctx, world.current, labelsRef.current, modeRef.current);
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [remember]);

  useEffect(() => {
    function set(e: KeyboardEvent, down: boolean) {
      if (isTyping(e)) return;
      const k = keys.current;
      switch (e.code) {
        case "ArrowUp":
        case "KeyW":
          k.up = down;
          break;
        case "ArrowDown":
        case "KeyS":
          k.down = down;
          break;
        case "ArrowLeft":
        case "KeyA":
          k.left = down;
          break;
        case "ArrowRight":
        case "KeyD":
          k.right = down;
          break;
        case "KeyB":
        case "KeyX":
        case "ShiftLeft":
        case "ShiftRight":
          k.bomb = down;
          break;
        case "Space":
        case "Enter":
          if (down && modeRef.current !== "play") act();
          break;
        default:
          return;
      }
      e.preventDefault();
    }
    const down = (e: KeyboardEvent) => set(e, true);
    const up = (e: KeyboardEvent) => set(e, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      keys.current = { up: false, down: false, left: false, right: false, bomb: false };
    };
  }, [act]);

  const overlayButton =
    "rounded-full bg-amber-400 px-4 py-1.5 text-[12px] font-bold text-navy hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[12px] font-bold text-navy">
        <span>{labels.score}: {score}</span>
        <span>{labels.chapterName(chapter)}</span>
        <span>{labels.best}: {best}</span>
      </div>

      <div
        className="relative touch-none select-none overflow-hidden rounded-xl border border-neutral-200 bg-[#0b1330]"
        onPointerDown={(e) => {
          if (modeRef.current !== "play") return;
          drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          const scale = W / e.currentTarget.getBoundingClientRect().width;
          pending.current.x += (e.clientX - d.x) * scale;
          pending.current.y += (e.clientY - d.y) * scale;
          d.x = e.clientX;
          d.y = e.clientY;
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <canvas ref={canvas} className="block h-auto w-full" style={{ aspectRatio: `${W} / ${H}` }} />

        {mode !== "play" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0b1330]/75 px-4 text-center text-white">
            {mode === "ready" && <span className="text-sm font-extrabold">{labels.chapterName(1)}</span>}
            {mode === "clear" && <span className="text-base font-extrabold">{labels.clear(chapter)}</span>}
            {mode === "dead" && <span className="text-base font-extrabold">{labels.lost}</span>}
            {mode === "won" && <span className="text-base font-extrabold">{labels.won}</span>}
            {mode !== "ready" && <span className="text-[12px] font-bold text-amber-400">{labels.score}: {score}</span>}
            <button type="button" autoFocus onClick={act} className={overlayButton}>
              {mode === "ready" ? labels.tap : mode === "clear" ? labels.next : mode === "dead" ? labels.retry : labels.again}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (modeRef.current === "play") bombQueued.current = true;
          }}
          disabled={mode !== "play" || bombs <= 0}
          className="flex h-11 shrink-0 touch-none select-none items-center justify-center rounded-full bg-navy px-5 text-[12px] font-bold text-amber-400 transition-colors active:bg-amber-400 active:text-navy disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
        >
          {labels.bomb} × {bombs}
        </button>
        <p className="flex-1 text-[11.5px] font-semibold leading-snug text-neutral-500">{labels.hint}</p>
      </div>
    </div>
  );
}

/* Drawing. */

const GUN_COLOR: Record<Exclude<Gun, "blaster">, string> = { machine: "#fb923c", spread: "#a3e635", laser: "#22d3ee", rocket: "#f87171" };
const GUN_FULL: Record<Exclude<Gun, "blaster">, number> = { machine: 170, spread: 48, laser: 150, rocket: 18 };
const PICKUP_COLOR: Record<PickupKind, string> = {
  P: AMBER, H: "#4ade80", B: "#60a5fa", M: "#fb923c", S: "#a3e635", L: "#22d3ee", R: "#f87171", E: "#fbbf24",
};

const rng = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function draw(ctx: CanvasRenderingContext2D, s: State, labels: SpaceLabels, mode: Mode) {
  const f = s.frame;
  ctx.save();
  if (s.shake > 0) ctx.translate((Math.random() - 0.5) * Math.min(7, s.shake / 4), (Math.random() - 0.5) * Math.min(7, s.shake / 4));

  /* The backdrop changes with the chapter: deep blue, violet nebula, red fortress. */
  const tint =
    s.chapter === 1 ? ["#0b1330", "#1f2f66"] : s.chapter === 2 ? ["#170a2b", "#4a1d6b"] : ["#170808", "#451616"];
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, tint[0]);
  bg.addColorStop(1, tint[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  if (s.chapter === 2) {
    for (let i = 0; i < 4; i++) {
      const g = ctx.createRadialGradient(80 + i * 90, 40 + ((i * 53) % 130), 4, 80 + i * 90, 40 + ((i * 53) % 130), 70);
      g.addColorStop(0, "rgb(190 100 255 / 0.22)");
      g.addColorStop(1, "rgb(190 100 255 / 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
  }
  if (s.chapter === 3) {
    ctx.strokeStyle = "rgb(255 90 70 / 0.08)";
    ctx.lineWidth = 1;
    const off = (f * 1.2) % 24;
    for (let x = -off; x < W; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 12; y < H; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  }

  /* Three layers of stars sliding past at different speeds. */
  for (let layer = 0; layer < 3; layer++) {
    const speed = 0.35 + layer * 0.55;
    ctx.fillStyle = `rgb(255 255 255 / ${0.3 + layer * 0.25})`;
    for (let i = 0; i < 26; i++) {
      const x = (((rng(i * 7 + layer * 131) * W - f * speed) % W) + W) % W;
      const y = rng(i * 13 + layer * 71 + 5) * H;
      ctx.fillRect(x, y, layer === 2 ? 2 : 1, 1);
    }
  }

  for (const bm of s.beams) drawBeam(ctx, bm, f);
  for (const k of s.pickups) drawPickup(ctx, k.x, k.y, k.kind, k.t);
  for (const e of s.enemies) drawEnemy(ctx, e, s);
  for (const b of s.bullets) drawBullet(ctx, b);
  drawPlayer(ctx, s);

  for (const b of s.bursts) {
    const t = b.t / 24;
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = t < 0.4 ? "#fff3b0" : "#ff8a3d";
    ctx.beginPath();
    ctx.arc(b.x, b.y, (b.big ? 8 : 4) + t * (b.big ? 22 : 12), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  if (s.bombFlash > 0) {
    ctx.fillStyle = `rgb(255 255 255 / ${(s.bombFlash / 14) * 0.7})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();

  drawHud(ctx, s, labels);

  if (s.callout) {
    const c = s.callout;
    const a = Math.min(1, c.t / 25, (150 - c.t) / 10);
    ctx.globalAlpha = Math.max(0, a);
    ctx.textAlign = "center";
    ctx.font = c.kind === "overload" ? "bold 26px sans-serif" : "bold 19px sans-serif";
    ctx.fillStyle = "rgb(0 0 0 / 0.55)";
    ctx.fillText(labels.callouts[c.kind], W / 2 + 1.5, 72 + 1.5);
    ctx.fillStyle = c.kind === "overload" ? (f % 10 < 5 ? "#ff4d4d" : "#ffd24d") : c.kind === "levelup" ? "#fde047" : "#7dd3fc";
    ctx.fillText(labels.callouts[c.kind], W / 2, 72);
    ctx.globalAlpha = 1;
  }

  if (s.banner > 0 && mode === "play") {
    const a = Math.min(1, s.banner / 30, (150 - s.banner) / 20);
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 17px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(labels.chapterName(s.chapter), W / 2, H / 2 - 30);
    ctx.globalAlpha = 1;
  }
}

function drawHud(ctx: CanvasRenderingContext2D, s: State, labels: SpaceLabels) {
  const maxHp = maxHpFor(s.p.level);
  for (let i = 0; i < maxHp; i++) {
    ctx.fillStyle = i < s.p.hp ? "#ff4d6d" : "rgb(255 255 255 / 0.18)";
    const x = 8 + i * 12;
    ctx.beginPath();
    ctx.moveTo(x + 4.5, 17);
    ctx.bezierCurveTo(x - 2, 11, x + 1, 5, x + 4.5, 9);
    ctx.bezierCurveTo(x + 8, 5, x + 11, 11, x + 4.5, 17);
    ctx.fill();
  }

  /* The ship's level, and how far the gold hearts have got toward the next. */
  const lx = 8 + maxHp * 12 + 6;
  ctx.fillStyle = "#fde047";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`LV ${s.p.level}`, lx, 15);
  const from = LEVEL_AT[s.p.level - 1];
  const to = s.p.level < MAX_LEVEL ? LEVEL_AT[s.p.level] : from + 1;
  ctx.fillStyle = "rgb(255 255 255 / 0.2)";
  ctx.fillRect(lx, 18, 30, 3);
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(lx, 18, s.p.level >= MAX_LEVEL ? 30 : Math.min(30, (30 * (s.p.extra - from)) / (to - from)), 3);

  ctx.fillStyle = AMBER;
  for (let i = 0; i < s.p.weapon; i++) ctx.fillRect(8 + i * 8, 22, 6, 3);
  if (s.p.gun !== "blaster") {
    ctx.fillStyle = GUN_COLOR[s.p.gun];
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${labels.guns[s.p.gun]} ${s.p.ammo}`, 8, 36);
    ctx.fillStyle = "rgb(255 255 255 / 0.2)";
    ctx.fillRect(8, 39, 56, 2);
    ctx.fillStyle = GUN_COLOR[s.p.gun];
    ctx.fillRect(8, 39, Math.min(56, (56 * s.p.ammo) / GUN_FULL[s.p.gun]), 2);
  }

  const boss = s.enemies.find((e) => isBoss(e.type));
  if (boss) {
    const w = 150;
    const x = (W - w) / 2;
    ctx.fillStyle = "rgb(0 0 0 / 0.5)";
    ctx.fillRect(x - 2, 6, w + 4, 8);
    ctx.fillStyle = "#ff4d6d";
    ctx.fillRect(x, 8, (w * Math.max(0, boss.hp)) / boss.maxHp, 4);
  }
}

function drawBeam(ctx: CanvasRenderingContext2D, bm: State["beams"][number], f: number) {
  if (bm.t < bm.warn) {
    /* A thin flashing line first: this is where it is about to fire. */
    ctx.strokeStyle = f % 8 < 4 ? "rgb(255 80 80 / 0.9)" : "rgb(255 80 80 / 0.35)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(0, bm.y);
    ctx.lineTo(bm.x0, bm.y);
    ctx.stroke();
    ctx.setLineDash([]);
    return;
  }
  const g = ctx.createLinearGradient(0, bm.y - bm.h / 2, 0, bm.y + bm.h / 2);
  g.addColorStop(0, "rgb(255 60 60 / 0.5)");
  g.addColorStop(0.5, "rgb(255 255 255 / 1)");
  g.addColorStop(1, "rgb(255 60 60 / 0.5)");
  ctx.fillStyle = g;
  ctx.fillRect(0, bm.y - bm.h / 2, bm.x0, bm.h);
}

function drawPickup(ctx: CanvasRenderingContext2D, x: number, y: number, kind: PickupKind, t: number) {
  const by = y + Math.sin(t / 10) * 2;
  ctx.fillStyle = PICKUP_COLOR[kind];
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, by, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = NAVY;
  ctx.font = "bold 8px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(kind === "E" ? "+" : kind, x, by + 3);
}

function drawBullet(ctx: CanvasRenderingContext2D, b: State["bullets"][number]) {
  if (b.own === "p") {
    switch (b.kind) {
      case "mg":
        ctx.fillStyle = "#fde047";
        ctx.fillRect(b.x - 3, b.y - 1, 6, 2);
        return;
      case "spread":
        ctx.fillStyle = "#a3e635";
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ecfccb";
        ctx.fillRect(b.x - 0.6, b.y - 0.6, 1.2, 1.2);
        return;
      case "laser":
        ctx.fillStyle = "rgb(34 211 238 / 0.35)";
        ctx.fillRect(b.x - 26, b.y - 2.4, 30, 4.8);
        ctx.fillStyle = "#67e8f9";
        ctx.fillRect(b.x - 24, b.y - 1.2, 28, 2.4);
        ctx.fillStyle = "#fff";
        ctx.fillRect(b.x - 22, b.y - 0.5, 26, 1);
        return;
      case "rocket": {
        const a = Math.atan2(b.vy, b.vx);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(a);
        ctx.fillStyle = "#fb923c";
        ctx.beginPath();
        ctx.moveTo(-5, 0);
        ctx.lineTo(-11 - (b.life ?? 0) % 3, -2);
        ctx.lineTo(-11 - (b.life ?? 0) % 3, 2);
        ctx.fill();
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(-6, -2, 10, 4);
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.moveTo(4, -2);
        ctx.lineTo(8, 0);
        ctx.lineTo(4, 2);
        ctx.fill();
        ctx.restore();
        return;
      }
      default:
        ctx.fillStyle = AMBER;
        ctx.fillRect(b.x - 4, b.y - 1.5, 8, 3);
        ctx.fillStyle = "#fff8c9";
        ctx.fillRect(b.x - 1, b.y - 0.5, 5, 1);
        return;
    }
  }
  if (b.kind === "needle") {
    const a = Math.atan2(b.vy, b.vx);
    ctx.strokeStyle = "#ffb347";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x - Math.cos(a) * 5, b.y - Math.sin(a) * 5);
    ctx.lineTo(b.x + Math.cos(a) * 5, b.y + Math.sin(a) * 5);
    ctx.stroke();
    return;
  }
  ctx.fillStyle = b.kind === "spiral" ? "#c084fc" : "#ff5d8f";
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.r * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer(ctx: CanvasRenderingContext2D, s: State) {
  const p = s.p;
  if (s.phase === "dead") return;
  if (p.inv > 0 && s.frame % 6 < 3) return;
  const k = 1 + 0.2 * (p.level - 1);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(k, k);
  const x = 0;
  const y = 0;
  /* Launchers: one hanging under the hull from level two, another on top at three. */
  if (p.level >= 2) {
    ctx.fillStyle = "#64748b";
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 1.2;
    ctx.fillRect(x + 6, y + PLAYER_H, 8, 3);
    ctx.strokeRect(x + 6, y + PLAYER_H, 8, 3);
    ctx.fillStyle = p.launchCd < 8 ? "#f87171" : "#334155";
    ctx.fillRect(x + 12, y + PLAYER_H + 0.5, 3, 2);
  }
  if (p.level >= 3) {
    ctx.fillStyle = "#64748b";
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 1.2;
    ctx.fillRect(x + 6, y - 3, 8, 3);
    ctx.strokeRect(x + 6, y - 3, 8, 3);
    ctx.fillStyle = p.launchCd < 8 ? "#f87171" : "#334155";
    ctx.fillRect(x + 12, y - 2.5, 3, 2);
  }
  /* Engine flame. */
  ctx.fillStyle = s.frame % 4 < 2 ? "#ff9d3d" : "#ffd24d";
  ctx.beginPath();
  ctx.moveTo(x, y + PLAYER_H / 2 - 2);
  ctx.lineTo(x - 6 - (s.frame % 3) - p.level, y + PLAYER_H / 2);
  ctx.lineTo(x, y + PLAYER_H / 2 + 2);
  ctx.fill();
  ctx.fillStyle = p.level >= 3 ? "#fde047" : AMBER;
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 1.6 / k;
  ctx.beginPath();
  ctx.moveTo(x + PLAYER_W, y + PLAYER_H / 2);
  ctx.lineTo(x + 6, y);
  ctx.lineTo(x + 1, y + 1);
  ctx.lineTo(x + 4, y + PLAYER_H / 2);
  ctx.lineTo(x + 1, y + PLAYER_H - 1);
  ctx.lineTo(x + 6, y + PLAYER_H);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (p.level >= 2) {
    ctx.fillStyle = "#fb923c";
    ctx.fillRect(x + 9, y + 2, 3, 1.4);
    ctx.fillRect(x + 9, y + PLAYER_H - 3.4, 3, 1.4);
  }
  ctx.fillStyle = "#7dd3fc";
  ctx.beginPath();
  ctx.ellipse(x + 10, y + PLAYER_H / 2, 3.2, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function body(ctx: CanvasRenderingContext2D, e: Enemy, fill: string) {
  ctx.fillStyle = e.flash > 0 ? "#ffffff" : fill;
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 1.5;
}

function drawEnemy(ctx: CanvasRenderingContext2D, e: Enemy, s: State) {
  const { x, y, w, h } = e;
  const cx = x + w / 2;
  const cy = y + h / 2;
  switch (e.type) {
    case "scout": {
      body(ctx, e, "#ef4444");
      ctx.beginPath();
      ctx.moveTo(x, cy);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w - 4, cy);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + 5, cy - 1.5, 3, 3);
      break;
    }
    case "wave": {
      body(ctx, e, "#8b5cf6");
      ctx.beginPath();
      ctx.ellipse(cx, cy + 2, w / 2, h / 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = e.flash > 0 ? "#fff" : "#67e8f9";
      ctx.beginPath();
      ctx.ellipse(cx, cy - 2, w / 4, h / 3.4, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = AMBER;
      for (let i = -1; i <= 1; i++) ctx.fillRect(cx + i * 5 - 1, cy + 3, 2, 2);
      break;
    }
    case "rock":
    case "smallrock": {
      body(ctx, e, "#8b8f98");
      const n = 9;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + e.t * 0.012;
        const r = (0.72 + rng(e.id * 17 + i) * 0.3) * (w / 2);
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r * (h / w);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (e.type === "rock") {
        ctx.fillStyle = "rgb(0 0 0 / 0.22)";
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 3, 3, 0, Math.PI * 2);
        ctx.arc(cx + 5, cy + 4, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "diver": {
      body(ctx, e, "#fb923c");
      ctx.beginPath();
      ctx.moveTo(x, cy);
      ctx.lineTo(x + w * 0.6, y + 2);
      ctx.lineTo(x + w, y - 2);
      ctx.lineTo(x + w * 0.74, cy);
      ctx.lineTo(x + w, y + h + 2);
      ctx.lineTo(x + w * 0.6, y + h - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case "gunner": {
      body(ctx, e, "#14b8a6");
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 2, w - 4, h - 4, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = e.flash > 0 ? "#fff" : "#334155";
      ctx.fillRect(x - 3, cy - 2, 9, 4);
      ctx.strokeRect(x - 3, cy - 2, 9, 4);
      ctx.fillStyle = "#fde68a";
      ctx.fillRect(x + 12, cy - 4, 6, 8);
      break;
    }
    case "mine": {
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + e.t * 0.02;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6);
        ctx.lineTo(cx + Math.cos(a) * 10, cy + Math.sin(a) * 10);
        ctx.stroke();
      }
      body(ctx, e, "#1e293b");
      ctx.beginPath();
      ctx.arc(cx, cy, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = e.t % 30 < 15 ? "#ff3b3b" : "#7f1d1d";
      ctx.beginPath();
      ctx.arc(cx, cy, 2.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "drone": {
      body(ctx, e, "#4ade80");
      ctx.beginPath();
      ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;
      const a = e.t * 0.6;
      ctx.beginPath();
      ctx.moveTo(cx - Math.cos(a) * 7, cy - 5 - Math.sin(a));
      ctx.lineTo(cx + Math.cos(a) * 7, cy - 5 + Math.sin(a));
      ctx.stroke();
      break;
    }
    case "turret": {
      const top = e.a === 0;
      ctx.fillStyle = "#475569";
      ctx.fillRect(x - 6, top ? y - 8 : y + h - 2, w + 12, 10);
      body(ctx, e, "#94a3b8");
      ctx.beginPath();
      ctx.arc(cx, top ? y + 4 : y + h - 4, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      const ang = Math.atan2(s.p.y + PLAYER_H / 2 - cy, s.p.x - cx);
      ctx.strokeStyle = e.flash > 0 ? "#fff" : "#1e293b";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, top ? y + 4 : y + h - 4);
      ctx.lineTo(cx + Math.cos(ang) * 12, (top ? y + 4 : y + h - 4) + Math.sin(ang) * 12);
      ctx.stroke();
      break;
    }
    case "zigzag": {
      body(ctx, e, "#a3e635");
      ctx.beginPath();
      ctx.moveTo(x, cy);
      ctx.lineTo(x + 5, y);
      ctx.lineTo(x + 8, cy - 1);
      ctx.lineTo(x + 14, y + 1);
      ctx.lineTo(x + w, cy);
      ctx.lineTo(x + 10, y + h);
      ctx.lineTo(x + 7, cy + 1);
      ctx.lineTo(x + 3, y + h - 1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case "armor": {
      body(ctx, e, "#64748b");
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        const px = cx + Math.cos(a) * (w / 2);
        const py = cy + Math.sin(a) * (h / 2);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 7, cy - 7, 14, 14);
      ctx.fillStyle = NAVY;
      for (const dy of [-8, 0, 8]) ctx.fillRect(x - 3, cy + dy - 1.5, 6, 3);
      break;
    }
    case "seeker": {
      body(ctx, e, "#f87171");
      const a = Math.atan2(e.vy, e.vx);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(a + Math.PI);
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 2, 0);
      ctx.lineTo(-2, -3.5);
      ctx.lineTo(w / 2, -3.5);
      ctx.lineTo(w / 2, 3.5);
      ctx.lineTo(-2, 3.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2 + 5 + (e.t % 3), -2);
      ctx.lineTo(w / 2 + 5 + (e.t % 3), 2);
      ctx.fill();
      ctx.restore();
      break;
    }
    case "pod": {
      body(ctx, e, "#0d9488");
      ctx.beginPath();
      ctx.roundRect(x, y + 2, w, h - 2, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgb(255 255 255 / 0.25)";
      ctx.fillRect(x + 2, y + 4, w - 4, 2);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("?", cx, cy + 4);
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, y + 2);
      ctx.lineTo(cx, y - 3);
      ctx.stroke();
      ctx.fillStyle = e.t % 24 < 12 ? "#fde047" : "#f97316";
      ctx.beginPath();
      ctx.arc(cx, y - 4, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "boss1":
      drawCrab(ctx, e);
      break;
    case "boss2":
      drawJelly(ctx, e);
      break;
    case "boss3":
      drawWarship(ctx, e);
      break;
  }
}

/* The crab: a round red body, eyes on stalks, and two long claws that open and
   close. */
function drawCrab(ctx: CanvasRenderingContext2D, e: Enemy) {
  const cx = e.x + e.w / 2 + 6;
  const cy = e.y + e.h / 2;
  const open = Math.sin(e.t / 9) * 0.35 + 0.35;
  body(ctx, e, "#dc2626");
  for (const side of [-1, 1]) {
    /* Arm, then a claw with its two halves. */
    const ax = e.x + 4;
    const ay = cy + side * 22;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + side * 12);
    ctx.lineTo(ax + 14, ay);
    ctx.lineWidth = 7;
    ctx.strokeStyle = e.flash > 0 ? "#fff" : "#b91c1c";
    ctx.stroke();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = NAVY;
    for (const half of [-1, 1]) {
      ctx.save();
      ctx.translate(ax + 8, ay);
      ctx.rotate(Math.PI + half * open);
      ctx.fillStyle = e.flash > 0 ? "#fff" : "#ef4444";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(14, half * 5, 22, 0);
      ctx.quadraticCurveTo(12, half * 1.5, 0, half * -1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
  body(ctx, e, "#dc2626");
  ctx.beginPath();
  ctx.ellipse(cx, cy, 30, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgb(0 0 0 / 0.18)";
  for (let i = -1; i <= 1; i++) ctx.fillRect(cx - 8, cy + i * 9 - 1, 24, 2);
  for (const side of [-1, 1]) {
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + side * 14);
    ctx.lineTo(cx - 20, cy + side * 24);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx - 20, cy + side * 25, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = NAVY;
    ctx.beginPath();
    ctx.arc(cx - 21.5, cy + side * 25, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  /* The legs along the back. */
  ctx.strokeStyle = "#7f1d1d";
  ctx.lineWidth = 2.5;
  for (let i = -2; i <= 2; i++) {
    const wig = Math.sin(e.t / 8 + i) * 3;
    ctx.beginPath();
    ctx.moveTo(cx + 18, cy + i * 9);
    ctx.lineTo(cx + 30 + wig, cy + i * 11);
    ctx.stroke();
  }
}

/* The jellyfish: a glowing bell with a pulsing core, and tentacles that trail
   behind it and sway. */
function drawJelly(ctx: CanvasRenderingContext2D, e: Enemy) {
  const cx = e.x + 26;
  const cy = e.y + e.h / 2;
  const pulse = 1 + Math.sin(e.t / 14) * 0.05;
  ctx.lineWidth = 3;
  for (let i = -3; i <= 3; i++) {
    ctx.strokeStyle = e.flash > 0 ? "#fff" : `rgb(244 114 182 / ${0.85 - Math.abs(i) * 0.1})`;
    ctx.beginPath();
    ctx.moveTo(cx + 12, cy + i * 9);
    for (let k = 1; k <= 6; k++) ctx.lineTo(cx + 12 + k * 8, cy + i * 9 + Math.sin(e.t / 9 + k * 0.9 + i) * 5);
    ctx.stroke();
  }
  const glow = ctx.createRadialGradient(cx, cy, 6, cx, cy, 44);
  glow.addColorStop(0, "rgb(244 114 182 / 0.5)");
  glow.addColorStop(1, "rgb(244 114 182 / 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(cx - 46, cy - 46, 92, 92);
  body(ctx, e, "#c026d3");
  ctx.beginPath();
  ctx.ellipse(cx, cy, 30 * pulse, 36 * pulse, 0, Math.PI / 2, Math.PI * 1.5, false);
  ctx.ellipse(cx, cy, 8, 36 * pulse, 0, Math.PI * 1.5, Math.PI / 2, false);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgb(255 255 255 / 0.3)";
  for (const [dx, dy, r] of [[-12, -14, 4], [-18, 6, 3], [-6, 16, 3.5]]) {
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = e.t % 40 < 20 ? "#67e8f9" : "#22d3ee";
  ctx.beginPath();
  ctx.arc(cx - 6, cy, 8 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx - 8, cy - 2, 2.6, 0, Math.PI * 2);
  ctx.fill();
}

/* The warship: a long plated hull with a glowing beam emitter at the nose, gun
   turrets above and below, and engines at the back. */
function drawWarship(ctx: CanvasRenderingContext2D, e: Enemy) {
  const { x, y, w, h } = e;
  const cy = y + h / 2;
  const layer = e.a;
  const hurt = layer === 0 ? 1 : layer === 1 ? 0.5 : layer === 2 ? 0.25 : 0.1;
  /* Overloading: a red glow that throbs, and the hull shakes. */
  if (layer === 3) {
    const g = ctx.createRadialGradient(x + w / 2, cy, 10, x + w / 2, cy, 90);
    g.addColorStop(0, `rgb(255 40 40 / ${0.35 + Math.sin(e.t / 5) * 0.15})`);
    g.addColorStop(1, "rgb(255 40 40 / 0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - 90, cy - 100, w + 180, 200);
    ctx.save();
    ctx.translate((Math.random() - 0.5) * 2.4, (Math.random() - 0.5) * 2.4);
  }
  body(ctx, e, layer === 3 ? "#7f1d1d" : "#334155");
  ctx.beginPath();
  ctx.moveTo(x, cy);
  ctx.lineTo(x + 24, y + 8);
  ctx.lineTo(x + w - 8, y);
  ctx.lineTo(x + w, y + 14);
  ctx.lineTo(x + w, y + h - 14);
  ctx.lineTo(x + w - 8, y + h);
  ctx.lineTo(x + 24, y + h - 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = e.flash > 0 ? "#fff" : "#475569";
  ctx.fillRect(x + 30, y + 14, w - 52, h - 28);
  ctx.strokeRect(x + 30, y + 14, w - 52, h - 28);
  ctx.fillStyle = "#fbbf24";
  for (let i = 0; i < 5; i++) ctx.fillRect(x + 38 + i * 9, cy - 2, 5, 4);
  for (const side of [-1, 1]) {
    ctx.fillStyle = e.flash > 0 ? "#fff" : "#1e293b";
    ctx.fillRect(x + 34, cy + side * (h / 2 - 8) - 3, 24, 6);
    ctx.fillRect(x + 20, cy + side * (h / 2 - 8) - 2, 16, 4);
  }
  /* The emitter: it glows brighter the nearer the next beam is, and turns red as the ship takes damage. */
  const charge = (e.b % 280) / 280;
  ctx.fillStyle = hurt < 0.33 ? "#ff3b3b" : hurt < 0.66 ? "#fb923c" : "#38bdf8";
  ctx.beginPath();
  ctx.arc(x + 12, cy, 6 + charge * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x + 12, cy, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = e.t % 6 < 3 ? "#fb923c" : "#fde047";
  for (const side of [-1, 1]) ctx.fillRect(x + w - 2, cy + side * 22 - 4, 8 + (e.t % 3), 8);

  /* The layers. Armour plates sit over the hull until they are shot away. */
  if (layer <= 1) {
    ctx.fillStyle = e.flash > 0 ? "#fff" : "#94a3b8";
    ctx.strokeStyle = NAVY;
    ctx.lineWidth = 1.5;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(x + 18, cy + side * 8);
      ctx.lineTo(x + 40, cy + side * (h / 2 - 2));
      ctx.lineTo(x + w - 14, cy + side * (h / 2 - 2));
      ctx.lineTo(x + w - 20, cy + side * 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = NAVY;
      for (let i = 0; i < 4; i++) ctx.fillRect(x + 44 + i * 10, cy + side * (h / 2 - 8) - 1, 2, 2);
      ctx.fillStyle = e.flash > 0 ? "#fff" : "#94a3b8";
    }
  }
  if (layer === 0) {
    /* The energy shield: a bubble around the whole ship. */
    const flicker = e.flash > 0 ? 0.55 : 0.22 + Math.sin(e.t / 8) * 0.05;
    ctx.fillStyle = `rgb(56 189 248 / ${flicker})`;
    ctx.strokeStyle = "rgb(186 230 253 / 0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x + w / 2 - 4, cy, w / 2 + 12, h / 2 + 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (layer >= 2) {
    /* Armour gone: the core shows through the hull. */
    const glow = layer === 3 ? "#ff3b3b" : "#fb923c";
    const g = ctx.createRadialGradient(x + w / 2, cy, 2, x + w / 2, cy, 22);
    g.addColorStop(0, "#fff");
    g.addColorStop(0.35, glow);
    g.addColorStop(1, "rgb(255 80 40 / 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x + w / 2, cy, 22 + Math.sin(e.t / (layer === 3 ? 3 : 7)) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  if (e.stun > 0 && e.t % 6 < 3) {
    ctx.fillStyle = "rgb(255 255 255 / 0.5)";
    ctx.fillRect(x, y, w, h);
  }
  if (layer === 3) ctx.restore();
}
