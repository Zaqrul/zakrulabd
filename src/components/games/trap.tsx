"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TbArrowBigLeft, TbArrowBigRight, TbArrowBigUp } from "react-icons/tb";
import { AMBER, NAVY, fitCanvas, isTyping, loadBest, saveBest } from "./shared";
import {
  GROUND,
  PH,
  PW,
  VIEW_H,
  VIEW_W,
  WORLD,
  createState,
  respawn,
  respawnReady,
  step,
  type Cause,
  type Input,
  type State,
  type Thing,
} from "./trap-logic";

export type TrapLabels = {
  tap: string;
  deaths: string;
  best: string;
  won: string;
  again: string;
  left: string;
  right: string;
  jump: string;
  messages: Record<Cause, string>;
};

type Mode = "ready" | "play" | "won";

/* A short platformer in the spirit of the famously unfair kind: run right, reach
   the flag, and do not trust the floor, the blocks, the ceiling or the flag.
   Every trap can be got past by someone who knows it is there, and the level is
   put back as it was after each death. Arrow keys or A and D to run, Space to
   jump; on a phone, the buttons underneath. */
export default function Trap({ labels }: { labels: TrapLabels }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("ready");
  const [deaths, setDeaths] = useState(0);
  const [message, setMessage] = useState("");
  const [best, setBest] = useState(0);
  const world = useRef<State>(createState());
  const modeRef = useRef<Mode>("ready");
  const keys = useRef({ left: false, right: false, jump: false });
  const touch = useRef({ left: false, right: false, jump: false });
  const labelsRef = useRef(labels);

  useEffect(() => {
    labelsRef.current = labels;
  }, [labels]);

  /* Stored as deaths plus one, so that nothing stored means no finish yet. */
  useEffect(() => {
    const first = setTimeout(() => setBest(loadBest("trap")), 0);
    return () => clearTimeout(first);
  }, []);

  const start = useCallback(() => {
    world.current = createState();
    /* The press that starts a run is not also its first jump: the button has to
       be let go and pressed again. */
    world.current.p.jumpHeld = true;
    modeRef.current = "play";
    setMode("play");
    setDeaths(0);
    setMessage("");
  }, []);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let ctx = fitCanvas(el, VIEW_W, VIEW_H);
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let shownPhase: State["phase"] = "playing";

    const input = (): Input => ({
      left: keys.current.left || touch.current.left,
      right: keys.current.right || touch.current.right,
      jump: keys.current.jump || touch.current.jump,
    });

    function frame(now: number) {
      acc = Math.min(acc + (now - last) / 16.667, 4);
      last = now;
      const s = world.current;

      if (modeRef.current === "play") {
        while (acc >= 1) {
          acc -= 1;
          step(s, input());
          if (respawnReady(s)) respawn(s);
        }
        if (s.phase !== shownPhase) {
          shownPhase = s.phase;
          if (s.phase === "dying" && s.cause) {
            setDeaths(s.deaths);
            setMessage(labelsRef.current.messages[s.cause]);
          } else if (s.phase === "playing") {
            setMessage("");
          } else if (s.phase === "won") {
            modeRef.current = "won";
            setMode("won");
            setMessage("");
            const record = s.deaths + 1;
            setBest((b) => {
              const next = b === 0 || record < b ? record : b;
              if (next !== b) saveBest("trap", next);
              return next;
            });
          }
        }
      } else {
        acc = 0;
      }

      draw(ctx, s);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => {
      ctx = fitCanvas(el, VIEW_W, VIEW_H);
      draw(ctx, world.current);
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    function set(e: KeyboardEvent, down: boolean) {
      if (isTyping(e)) return;
      const k = e.code;
      if (k === "ArrowLeft" || k === "KeyA") keys.current.left = down;
      else if (k === "ArrowRight" || k === "KeyD") keys.current.right = down;
      else if (k === "Space" || k === "ArrowUp" || k === "KeyW") {
        keys.current.jump = down;
        if (down && modeRef.current !== "play") start();
      } else return;
      e.preventDefault();
    }
    const down = (e: KeyboardEvent) => set(e, true);
    const up = (e: KeyboardEvent) => set(e, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      keys.current = { left: false, right: false, jump: false };
    };
  }, [start]);

  const press = useCallback(
    (name: "left" | "right" | "jump", down: boolean) => {
      touch.current[name] = down;
      if (down && name === "jump" && modeRef.current !== "play") start();
    },
    [start],
  );

  const pad =
    "flex h-12 flex-1 touch-none select-none items-center justify-center rounded-2xl bg-navy/90 text-amber-400 transition-colors active:bg-amber-400 active:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[12px] font-bold text-navy">
        <span>{labels.deaths}: {deaths}</span>
        <span>{best > 0 ? `${labels.best}: ${best - 1}` : ""}</span>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-neutral-200" onPointerDown={() => mode === "ready" && start()}>
        <canvas ref={canvas} className="block h-auto w-full" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }} />

        {mode === "ready" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="rounded-full bg-amber-400 px-4 py-1.5 text-[12px] font-bold text-navy">{labels.tap}</span>
          </div>
        )}
        {mode === "play" && message && (
          <div role="status" className="absolute inset-x-0 top-3 flex justify-center px-3">
            <span className="rounded-full bg-navy px-3 py-1.5 text-center text-[12px] font-bold text-amber-400">{message}</span>
          </div>
        )}
        {mode === "won" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/75 text-navy">
            <span className="px-4 text-center text-base font-extrabold">{labels.won}</span>
            <span className="text-sm font-bold">{labels.deaths}: {deaths}</span>
            <button
              type="button"
              onClick={start}
              className="rounded-full bg-amber-400 px-4 py-1.5 text-[12px] font-bold hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            >
              {labels.again}
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Pad name="left" label={labels.left} className={pad} onPress={press}>
          <TbArrowBigLeft aria-hidden="true" className="h-6 w-6" />
        </Pad>
        <Pad name="right" label={labels.right} className={pad} onPress={press}>
          <TbArrowBigRight aria-hidden="true" className="h-6 w-6" />
        </Pad>
        <Pad name="jump" label={labels.jump} className={`${pad} flex-[1.4]`} onPress={press}>
          <TbArrowBigUp aria-hidden="true" className="h-6 w-6" />
        </Pad>
      </div>
    </div>
  );
}

/* A button that is held down: it reports pressing and letting go, however the
   finger leaves it. */
function Pad({
  name,
  label,
  className,
  onPress,
  children,
}: {
  name: "left" | "right" | "jump";
  label: string;
  className: string;
  onPress: (name: "left" | "right" | "jump", down: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={className}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        onPress(name, true);
      }}
      onPointerUp={() => onPress(name, false)}
      onPointerCancel={() => onPress(name, false)}
      onLostPointerCapture={() => onPress(name, false)}
    >
      {children}
    </button>
  );
}

/* Drawing. */

function draw(ctx: CanvasRenderingContext2D, s: State) {
  const cam = Math.min(Math.max(s.p.x - 150, 0), WORLD - VIEW_W);

  const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  sky.addColorStop(0, "#9fd8ff");
  sky.addColorStop(1, "#e6f5ff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  /* Hills and clouds drift slower than the ground. */
  ctx.fillStyle = "#b7e08f";
  for (let i = -1; i < 8; i++) {
    const x = i * 140 - ((cam * 0.35) % 140);
    ctx.beginPath();
    ctx.ellipse(x + 70, GROUND, 74, 46, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.fillStyle = "#fff";
  for (let i = -1; i < 6; i++) {
    const x = i * 180 - ((cam * 0.2) % 180);
    ctx.beginPath();
    ctx.ellipse(x + 40, 34 + (i % 2) * 18, 22, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 56, 30 + (i % 2) * 18, 16, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(-Math.round(cam), 0);

  for (const t of s.things) {
    if (!t.visible || t.x + t.w < cam - 10 || t.x > cam + VIEW_W + 10) continue;
    drawThing(ctx, t);
  }

  for (const w of s.walkers) {
    if (!w.alive) continue;
    ctx.fillStyle = "#7a4a21";
    ctx.beginPath();
    ctx.ellipse(w.x + 7, w.y + 6, 7, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = NAVY;
    ctx.fillRect(w.x + 1, w.y + 9, 4, 3);
    ctx.fillRect(w.x + 9, w.y + 9, 4, 3);
    ctx.fillStyle = "#fff";
    ctx.fillRect(w.x + 3, w.y + 3, 3, 3);
    ctx.fillRect(w.x + 8, w.y + 3, 3, 3);
    ctx.fillStyle = NAVY;
    ctx.fillRect(w.x + 4, w.y + 4, 1, 2);
    ctx.fillRect(w.x + 9, w.y + 4, 1, 2);
  }

  drawPlayer(ctx, s);
  ctx.restore();
}

function drawThing(ctx: CanvasRenderingContext2D, t: Thing) {
  switch (t.kind) {
    case "ground":
    case "fake": {
      ctx.fillStyle = "#b9772e";
      ctx.fillRect(t.x, t.y, t.w, t.h);
      ctx.fillStyle = "#9a5f22";
      for (let x = t.x; x < t.x + t.w; x += 16) ctx.fillRect(x, t.y + 14, 1, t.h - 14);
      ctx.fillRect(t.x, t.y + 22, t.w, 1);
      ctx.fillStyle = "#6cc04a";
      ctx.fillRect(t.x, t.y, t.w, 6);
      ctx.fillStyle = "#4f9d34";
      ctx.fillRect(t.x, t.y + 6, t.w, 2);
      break;
    }
    case "brick":
    case "qblock": {
      const q = t.kind === "qblock";
      ctx.fillStyle = q ? AMBER : "#c9692f";
      ctx.fillRect(t.x, t.y, t.w, t.h);
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(t.x + 0.75, t.y + 0.75, t.w - 1.5, t.h - 1.5);
      if (q) {
        ctx.fillStyle = NAVY;
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("?", t.x + t.w / 2, t.y + 12);
      } else {
        ctx.fillRect(t.x, t.y + 8, t.w, 1);
        ctx.fillRect(t.x + 8, t.y, 1, 8);
      }
      break;
    }
    case "spike": {
      ctx.fillStyle = "#d9dde2";
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 1.5;
      const n = Math.max(1, Math.round(t.w / 8));
      for (let i = 0; i < n; i++) {
        const x = t.x + (i * t.w) / n;
        const w = t.w / n;
        ctx.beginPath();
        ctx.moveTo(x, t.y + t.h);
        ctx.lineTo(x + w / 2, t.y);
        ctx.lineTo(x + w, t.y + t.h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case "stone": {
      ctx.fillStyle = "#8d949c";
      ctx.fillRect(t.x, t.y, t.w, t.h);
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 2;
      ctx.strokeRect(t.x + 1, t.y + 1, t.w - 2, t.h - 2);
      ctx.fillStyle = "#fff";
      ctx.fillRect(t.x + 7, t.y + 10, 6, 6);
      ctx.fillRect(t.x + 19, t.y + 10, 6, 6);
      ctx.fillStyle = NAVY;
      ctx.fillRect(t.x + 9, t.y + 12, 3, 4);
      ctx.fillRect(t.x + 20, t.y + 12, 3, 4);
      ctx.fillRect(t.x + 7, t.y + 7, 7, 2);
      ctx.fillRect(t.x + 18, t.y + 7, 7, 2);
      ctx.fillRect(t.x + 10, t.y + 22, 12, 3);
      break;
    }
    case "flag":
    case "fakeflag":
    case "checkpoint": {
      const cp = t.kind === "checkpoint";
      ctx.fillStyle = NAVY;
      ctx.fillRect(t.x, t.y, t.w, t.h);
      ctx.fillStyle = cp ? "#38bdf8" : AMBER;
      ctx.strokeStyle = NAVY;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(t.x + t.w, t.y + 2);
      ctx.lineTo(t.x + t.w + (cp ? 16 : 22), t.y + (cp ? 8 : 10));
      ctx.lineTo(t.x + t.w, t.y + (cp ? 16 : 20));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (!cp) {
        ctx.fillStyle = AMBER;
        ctx.beginPath();
        ctx.arc(t.x + t.w / 2, t.y - 2, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, s: State) {
  const p = s.p;
  const dead = s.phase === "dying";
  ctx.save();
  ctx.translate(p.x + PW / 2, p.y + PH / 2);
  if (dead) ctx.rotate(Math.min(s.dyingFor / 8, Math.PI));
  ctx.fillStyle = AMBER;
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-PW / 2, -PH / 2, PW, PH, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = NAVY;
  const eyeX = p.facing === 1 ? 1.5 : -4.5;
  if (dead) {
    ctx.fillRect(-3.5, -3, 2, 2);
    ctx.fillRect(1.5, -3, 2, 2);
  } else {
    ctx.fillRect(eyeX, -3, 3, 3);
  }
  const step = p.ground && Math.abs(p.vx) > 0.2 ? Math.floor(s.frame / 5) % 2 : 0;
  ctx.fillRect(-4, PH / 2, 3, 2 + step);
  ctx.fillRect(1, PH / 2, 3, 3 - step);
  ctx.restore();
}
