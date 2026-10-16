"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import {
  TbChevronsRight,
  TbHeadset,
  TbHelmet,
  TbPlayerPauseFilled,
  TbPlayerPlayFilled,
  TbRobot,
  TbShieldHalf,
  TbSkull,
  TbSwords,
} from "react-icons/tb";
import { AMBER, fitCanvas, isTyping, loadBest, saveBest } from "./shared";
import { furthest, loadSaved, parseProgress, saveSaved, stashGuest, type Progress } from "./space-progress";
import { pullProgress, pushProgress } from "@/lib/account";
import { Joystick, useTouchPad } from "./touch-controls";
import {
  drawBackdrop,
  drawHangar,
  drawHazard,
  drawLaunchOverlay,
  drawPlayer,
  drawSmoke,
  type LaunchLabels,
} from "./space-art";
import {
  BOSS_PHASES,
  CHAPTERS,
  CLEAR,
  FINAL_PHASE_AT,
  H,
  LEVEL_AT,
  MAX_LEVEL,
  NUKE,
  W,
  bossCheckpoint,
  chapterProgress,
  createState,
  isBoss,
  maxLife,
  maxShield,
  nextChapter,
  retryChapter,
  step,
  warpPower,
  type Callout,
  type ChapterResult,
  type Gun,
  type State,
} from "./space-logic";
import { SPEAKERS, STORY, type SceneKey, type Speaker } from "./space-story";
import { drawSpaceEnemy } from "./space-actor-art";
import { drawBeam, drawBullet, drawBursts, drawPickup } from "./space-fx-art";
import { drawBossBullet, drawBossHazard, drawChill, drawZone } from "./space-boss-fx-art";
import { drawHQ, drawMorph, drawNuke, drawRepair, drawShieldFlash } from "./space-ship-forms-art";
import { drawBossShield, drawSlash, drawTimedBombs, drawWarheads, drawWarp, drawWeaponBullet } from "./space-weapons-art";
import { clearEnvironmentCache } from "./space-environment";

export type SpaceLabels = {
  tap: string;
  score: string;
  best: string;
  bomb: string;
  nuke: string;
  hint: string;
  /* What the hint says on a phone or a tablet, and what the joystick is called. */
  touchHint: string;
  joystick: string;
  help: string;
  guide: string;
  chapterName: (n: number) => string;
  clear: (n: number) => string;
  next: string;
  lost: string;
  retry: string;
  retryBoss: string;
  won: string;
  again: string;
  continueRun: string;
  newGame: string;
  /* Without an account only Chapter 1 can be flown: what the start screen and the end of
     the chapter say about it, the button that opens the account, and replaying the chapter. */
  guestNote: string;
  guestClear: string;
  account: string;
  replay: string;
  pause: string;
  paused: string;
  resume: string;
  talkNext: string;
  launch: LaunchLabels;
  guns: Record<Exclude<Gun, "blaster">, string>;
  callouts: Record<Callout, string>;
  results: { enemies: string; hits: string; bossTime: string; killBonus: string; noHitBonus: string; speedBonus: string };
  bossNames: string[];
  /* What each chapter boss's own attack is called, shown as it winds up. */
  attackNames: Record<string, string>;
};

type Mode = "ready" | "talk" | "play" | "paused" | "clear" | "dead" | "won";

/* What comes after a scene: the launch that was waiting for its opening, the
   game stopped by a boss, or the end of the chapter. */
type Scene = { key: SceneKey; index: number; after: "launch" | "resume" | "clear" };

/* The colour of each stretch of the upgrade bar: that of the upgrade its level brought. */
const LEVEL_COLOR: Record<number, string> = { 2: "#a3e635", 3: "#cbd5e1", 4: "#f87171", 5: "#7dd3fc" };
const levelColor = (level: number) => LEVEL_COLOR[level] ?? "#fbbf24";

const SPEAKER_ICON: Record<Speaker, IconType> = {
  nova: TbHelmet,
  mika: TbHeadset,
  rin: TbShieldHalf,
  arc: TbRobot,
  vex: TbSwords,
  kroll: TbSkull,
};

/* Milliseconds a character takes to appear. A line has to finish before the
   next one will come, and there is no way past that. */
const TYPE_MS = 22;

/* Seconds as m:ss. */
function clock(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* The kind of space game once played on a phone with a keypad, as a series: the
   ship is launched from a hangar, holds the left of the screen and fires on its
   own, and the job is to fly through eight chapters of enemies and obstacles,
   each ending in a boss, with a story told in between that cannot be skipped.
   Arrow keys or W A S D to fly, B for a bomb, P to pause; or drag a finger or the
   mouse across the screen, with the buttons underneath for a bomb and a pause.
   Progress is kept after every chapter, and a ship lost at a boss can go again
   from the boss. */
export default function Space({
  labels,
  lang,
  username = null,
  gated = false,
  onAccount,
}: {
  labels: SpaceLabels;
  lang: "en" | "ms";
  /* Who is signed in. With `gated` (accounts exist on this site) a guest can fly Chapter 1
     only and nothing is saved; `onAccount` opens the account panel. */
  username?: string | null;
  gated?: boolean;
  onAccount?: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const preview = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>("ready");
  const { touch, portrait } = useTouchPad();
  const [chapter, setChapter] = useState(1);
  const [score, setScore] = useState(0);
  const [bombs, setBombs] = useState(2);
  const [nukes, setNukes] = useState(NUKE.count);
  const [best, setBest] = useState(0);
  const [saved, setSaved] = useState<Progress | null>(null);
  const [result, setResult] = useState<ChapterResult | null>(null);
  const [atBoss, setAtBoss] = useState(false);
  const [scene, setScene] = useState<Scene | null>(null);
  const [typing, setTyping] = useState({ id: "", n: 0 });
  const world = useRef<State>(createState());
  const modeRef = useRef<Mode>("ready");
  const sceneRef = useRef<Scene | null>(null);
  const savedRef = useRef<Progress | null>(null);
  const atBossRef = useRef(false);
  const doneRef = useRef(false);
  const seen = useRef(new Set<string>());
  const outroStarted = useRef(false);
  const keys = useRef({ up: false, down: false, left: false, right: false, bomb: false, nuke: false });
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const pending = useRef({ x: 0, y: 0 });
  /* Where the joystick is pushed, each way from -1 to 1. */
  const joy = useRef({ x: 0, y: 0 });
  const bombQueued = useRef(false);
  const nukeQueued = useRef(false);
  const moveSurface = useRef<HTMLDivElement>(null);
  const queueMove = useCallback((x: number, y: number) => {
    pending.current.x = Math.max(-24, Math.min(24, pending.current.x + x));
    pending.current.y = Math.max(-24, Math.min(24, pending.current.y + y));
  }, []);
  useEffect(() => {
    const surface = moveSurface.current;
    if (!surface) return;
    const wheel = (e: WheelEvent) => {
      if (modeRef.current !== "play" || world.current.phase === "launch" || e.ctrlKey || e.metaKey || e.target !== canvas.current) return;
      e.preventDefault();
      const rect = surface.getBoundingClientRect();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rect.height : 1;
      queueMove(e.deltaX * unit * W / rect.width, e.deltaY * unit * H / rect.height);
    };
    surface.addEventListener("wheel", wheel, { passive: false });
    return () => surface.removeEventListener("wheel", wheel);
  }, [queueMove]);
  const labelsRef = useRef(labels);
  const langRef = useRef(lang);
  /* Where this player's run is kept: under their name, under nothing at all where there are
     no accounts, and nowhere for a guest, who can only fly Chapter 1. */
  const slot = username ?? (gated ? null : "");
  const locked = slot === null;
  const slotRef = useRef(slot);
  const onAccountRef = useRef(onAccount);

  useEffect(() => {
    labelsRef.current = labels;
    langRef.current = lang;
    slotRef.current = slot;
    onAccountRef.current = onAccount;
  }, [labels, lang, slot, onAccount]);

  useEffect(() => {
    let stop = false;
    const first = setTimeout(() => {
      setBest(loadBest("space"));
      const p = slot === null ? null : loadSaved(slot);
      savedRef.current = p;
      setSaved(p);
      /* Signed in: the account may hold a run from another device, and the further one wins. */
      if (!username) return;
      void pullProgress("space").then((raw) => {
        if (stop) return;
        const remote = parseProgress(raw);
        const local = savedRef.current;
        const winner = furthest(local, remote);
        if (winner && winner !== local) {
          saveSaved(username, winner);
          savedRef.current = winner;
          setSaved(winner);
        }
        if (winner && winner !== remote) void pushProgress("space", winner);
      });
    }, 0);
    return () => {
      stop = true;
      clearTimeout(first);
    };
  }, [slot, username]);

  const goTo = useCallback((next: Mode) => {
    modeRef.current = next;
    setMode(next);
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

  const keep = useCallback((p: Progress | null) => {
    savedRef.current = p;
    setSaved(p);
    const who = slotRef.current;
    if (who === null) return;
    saveSaved(who, p);
    if (who) void pushProgress("space", p);
  }, []);

  /* Lets go of every key and drag, so nothing stays held through a pause. */
  const release = useCallback(() => {
    keys.current = { up: false, down: false, left: false, right: false, bomb: false, nuke: false };
    drag.current = null;
    pending.current = { x: 0, y: 0 };
    joy.current = { x: 0, y: 0 };
    bombQueued.current = false;
    nukeQueued.current = false;
  }, []);

  const pause = useCallback(() => {
    if (modeRef.current !== "play") return;
    release();
    goTo("paused");
  }, [goTo, release]);

  const resume = useCallback(() => {
    if (modeRef.current === "paused") goTo("play");
  }, [goTo]);

  const startScene = useCallback(
    (key: SceneKey, after: Scene["after"]) => {
      seen.current.add(key);
      const next = { key, index: 0, after };
      sceneRef.current = next;
      doneRef.current = false;
      goTo("talk");
      setScene(next);
    },
    [goTo],
  );

  /* A scene is over: carry on with whatever it was holding up. */
  const endScene = useCallback(
    (after: Scene["after"]) => {
      sceneRef.current = null;
      setScene(null);
      const s = world.current;
      if (after === "clear") {
        remember(s.score);
        setResult(s.result);
        if (s.chapter < CHAPTERS) {
          const run = { chapter: s.chapter + 1, score: s.score, weapon: s.p.weapon, level: s.p.level, extra: s.p.extra };
          /* A guest saves nothing; the clear is only noted, for the sign-in to pick up. */
          if (slotRef.current === null) stashGuest(run);
          else keep(run);
          goTo("clear");
        } else {
          s.phase = "won";
          keep(null);
          goTo("won");
        }
        return;
      }
      if (after === "resume") s.talk = null;
      goTo("play");
    },
    [goTo, keep, remember],
  );

  /* Moves the story on, but only once the line on screen has been read out in
     full. Nothing else moves it: not a longer press, not Escape. */
  const advance = useCallback(() => {
    const sc = sceneRef.current;
    if (!sc || !doneRef.current) return;
    const lines = STORY[langRef.current][sc.key];
    if (sc.index + 1 < lines.length) {
      const next = { ...sc, index: sc.index + 1 };
      sceneRef.current = next;
      doneRef.current = false;
      setScene(next);
      return;
    }
    endScene(sc.after);
  }, [endScene]);

  const begin = useCallback(
    (s: State) => {
      world.current = s;
      outroStarted.current = false;
      setChapter(s.chapter);
      setScore(s.score);
      setBombs(s.p.bombs);
      setNukes(s.p.nukes);
      setResult(null);
      /* A chapter's opening is told the first time it is reached; after losing
         the ship, the same chapter goes straight back to the hangar, or to the
         boss. */
      const key = `c${s.chapter}-intro` as SceneKey;
      if (!seen.current.has(key)) startScene(key, "launch");
      else goTo("play");
    },
    [goTo, startScene],
  );

  const newGame = useCallback(() => {
    seen.current.clear();
    begin(createState());
  }, [begin]);

  const continueGame = useCallback(() => {
    const p = savedRef.current;
    if (!p) {
      newGame();
      return;
    }
    seen.current.clear();
    begin(createState(p.chapter, p.score, p.weapon, p.level, p.extra));
  }, [begin, newGame]);

  const retry = useCallback(() => begin(retryChapter(world.current)), [begin]);
  const retryBoss = useCallback(() => begin(bossCheckpoint(world.current)), [begin]);
  const next = useCallback(() => begin(nextChapter(world.current)), [begin]);

  /* Space or Enter: whatever the screen's main button does. */
  const act = useCallback(() => {
    const m = modeRef.current;
    if (m === "talk") advance();
    else if (m === "ready") continueGame();
    else if (m === "won") newGame();
    else if (m === "clear") {
      if (slotRef.current === null) onAccountRef.current?.();
      else next();
    }
    else if (m === "dead") {
      if (atBossRef.current) retryBoss();
      else retry();
    } else if (m === "paused") resume();
  }, [advance, continueGame, newGame, next, resume, retry, retryBoss]);

  const line = scene ? STORY[lang][scene.key][scene.index] : null;
  const lineId = scene ? `${scene.key}:${scene.index}:${lang}` : "";
  const shown = line && typing.id === lineId ? typing.n : 0;
  const done = Boolean(line) && shown >= (line?.text.length ?? 0);

  useEffect(() => {
    doneRef.current = done;
  }, [done]);

  /* The line appears a character at a time. */
  useEffect(() => {
    if (!line) return;
    const id = lineId;
    const len = line.text.length;
    let n = 0;
    const timer = setInterval(() => {
      n += 1;
      setTyping({ id, n });
      if (n >= len) clearInterval(timer);
    }, TYPE_MS);
    return () => clearInterval(timer);
  }, [line, lineId]);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let ctx = fitCanvas(el, W, H);
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let shownScore = -1;
    let shownBombs = -1;
    let shownNukes = -1;
    let deadFor = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* The page's own typeface, so the readouts match the rest of the site. */
    const hud: Hud = { font: getComputedStyle(el).fontFamily || "sans-serif", trail: 1, bossId: 0, frame: -1 };
    const previewWorld = createState();
    previewWorld.phase = "play";
    previewWorld.p.x = 0;
    previewWorld.p.y = 0;

    function frame(now: number) {
      acc = Math.min(acc + (now - last) / 16.667, 4);
      last = now;
      const s = world.current;

      if (modeRef.current === "play" && !document.hidden) {
        while (acc >= 1) {
          acc -= 1;
          const k = keys.current;
          const flying = s.phase !== "launch";
          let mx = flying ? ((k.right ? 1 : 0) - (k.left ? 1 : 0)) * 2.7 : 0;
          let my = flying ? ((k.down ? 1 : 0) - (k.up ? 1 : 0)) * 2.7 : 0;
          /* A finger or mouse drag is spent a few pixels a frame, so the ship
             glides to where it was pulled instead of jumping there. */
          const px = Math.max(-6, Math.min(6, pending.current.x));
          const py = Math.max(-6, Math.min(6, pending.current.y));
          pending.current.x -= px;
          pending.current.y -= py;
          if (flying) {
            mx += px + joy.current.x * 2.7;
            my += py + joy.current.y * 2.7;
          }
          const bomb = flying && (k.bomb || bombQueued.current);
          const nuke = flying && (k.nuke || nukeQueued.current);
          bombQueued.current = false;
          nukeQueued.current = false;
          step(s, { mx, my, bomb, nuke });
          if (s.talk) break;
        }
        if (s.score !== shownScore) {
          shownScore = s.score;
          setScore(s.score);
        }
        if (s.p.bombs !== shownBombs) {
          shownBombs = s.p.bombs;
          setBombs(s.p.bombs);
        }
        if (s.p.nukes !== shownNukes) {
          shownNukes = s.p.nukes;
          setNukes(s.p.nukes);
        }
        if (s.talk === "boss") {
          const key = `c${s.chapter}-boss` as SceneKey;
          if (seen.current.has(key)) s.talk = null;
          else startScene(key, "resume");
        } else if (s.phase === "dead") {
          deadFor += 1;
          if (deadFor > 60) {
            deadFor = 0;
            /* Lost at the boss: offer to go again from the boss. */
            const boss = s.bossId !== 0;
            atBossRef.current = boss;
            setAtBoss(boss);
            goTo("dead");
            remember(s.score);
          }
        } else if (s.phase === "clear" && s.clearFor > CLEAR.talk && !outroStarted.current) {
          outroStarted.current = true;
          startScene(`c${s.chapter}-outro` as SceneKey, "clear");
        }
      } else {
        acc = 0;
        /* Held still for the story, but the lamps and the engine keep going. */
        if (modeRef.current === "talk" && !document.hidden) s.frame += 1;
      }

      draw(ctx, s, labelsRef.current, modeRef.current, reduceMotion, hud);
      if (modeRef.current === "ready" && preview.current) {
        const paint = preview.current.getContext("2d");
        if (paint) {
          previewWorld.frame = reduceMotion ? 0 : Math.floor(now / 16.667);
          paint.clearRect(0, 0, 384, 216);
          paint.save();
          paint.translate(115, 92);
          paint.scale(7, 7);
          drawPlayer(paint, previewWorld, reduceMotion);
          paint.restore();
        }
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => {
      ctx = fitCanvas(el, W, H);
      draw(ctx, world.current, labelsRef.current, modeRef.current, reduceMotion, hud);
    });
    ro.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      clearEnvironmentCache();
    };
  }, [goTo, remember, startScene]);

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
        case "KeyN":
          k.nuke = down;
          break;
        case "KeyP":
          if (down && !e.repeat) {
            if (modeRef.current === "play") pause();
            else if (modeRef.current === "paused") resume();
          }
          break;
        case "Space":
        case "Enter":
          /* A button picked on the overlay answers for itself. */
          if (e.target instanceof Element && e.target.closest("[data-space-overlay]")) return;
          if (down && !e.repeat && modeRef.current !== "play") act();
          break;
        default:
          return;
      }
      e.preventDefault();
    }
    const down = (e: KeyboardEvent) => set(e, true);
    const up = (e: KeyboardEvent) => set(e, false);
    /* Looking away pauses the game, so nothing is lost while the tab is hidden. */
    const away = () => {
      release();
      pause();
    };
    const onVisibility = () => {
      if (document.hidden) away();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", away);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", away);
      document.removeEventListener("visibilitychange", onVisibility);
      release();
    };
  }, [act, pause, release, resume]);

  const primary =
    "rounded-full bg-amber-400 px-4 py-1.5 text-[12px] font-bold text-navy hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";
  const secondary =
    "rounded-full border border-white/35 px-4 py-1.5 text-[12px] font-bold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";
  const who = line ? SPEAKERS[line.who] : null;
  const SpeakerIcon = line ? SPEAKER_ICON[line.who] : null;
  const canPause = mode === "play" || mode === "paused";
  const onJoystick = (x: number, y: number) => {
    joy.current = modeRef.current === "play" ? { x, y } : { x: 0, y: 0 };
  };
  const onBomb = () => {
    if (modeRef.current === "play") bombQueued.current = true;
  };
  const onNuke = () => {
    if (modeRef.current === "play") nukeQueued.current = true;
  };
  const onPause = () => (mode === "paused" ? resume() : pause());
  /* Before a run starts, the header shows where Continue would pick up. */
  const offer = mode === "ready" ? saved : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-[12px] font-bold text-navy">
        <span className="shrink-0 tabular-nums">{labels.score}: {offer ? offer.score : score}</span>
        <span className="min-w-0 truncate text-center">{labels.chapterName(offer ? offer.chapter : chapter)}</span>
        <span className="shrink-0 tabular-nums">{labels.best}: {best}</span>
      </div>

      <div
        ref={moveSurface}
        className="relative mx-auto w-full touch-none select-none overflow-hidden rounded-xl border border-neutral-200 bg-[#0b1330]"
        style={{ maxWidth: touch && !portrait ? "max(200px, calc((100dvh - 150px) * 16 / 9))" : "max(200px, calc((100dvh - 240px) * 16 / 9))" }}
        onPointerDown={(e) => {
          if (modeRef.current !== "play" || world.current.phase === "launch" || e.button !== 0 || drag.current || e.target !== canvas.current) return;
          e.preventDefault();
          drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId || modeRef.current !== "play") return;
          const scale = W / e.currentTarget.getBoundingClientRect().width;
          queueMove((e.clientX - d.x) * scale, (e.clientY - d.y) * scale);
          d.x = e.clientX;
          d.y = e.clientY;
        }}
        onPointerUp={(e) => {
          if (drag.current?.id === e.pointerId) drag.current = null;
        }}
        onPointerCancel={(e) => {
          if (drag.current?.id !== e.pointerId) return;
          drag.current = null;
          pending.current = { x: 0, y: 0 };
        }}
        onLostPointerCapture={(e) => {
          if (drag.current?.id !== e.pointerId) return;
          drag.current = null;
          pending.current = { x: 0, y: 0 };
        }}
      >
        <canvas ref={canvas} className="block h-auto w-full" style={{ aspectRatio: `${W} / ${H}` }} />

        {touch && !portrait && mode === "play" && (
          <TouchControls
            variant="over"
            labels={labels}
            bombs={bombs}
            nukes={nukes}
            mode={mode}
            canPause={canPause}
            onJoystick={onJoystick}
            onBomb={onBomb}
            onNuke={onNuke}
            onPause={onPause}
          />
        )}

        {mode === "talk" && line && who && SpeakerIcon && (
          <div className="absolute inset-x-0 bottom-0 cursor-pointer p-1.5 sm:p-2" onPointerDown={advance}>
            <div className="flex items-start gap-2 rounded-xl border border-white/15 bg-[#070c1f]/90 p-2 text-white shadow-lg backdrop-blur-sm sm:gap-2.5 sm:p-2.5">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9"
                style={{ background: `${who.color}2e`, color: who.color }}
              >
                <SpeakerIcon className="h-4.5 w-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] font-extrabold uppercase tracking-wider sm:text-[11px]" style={{ color: who.color }}>
                  {who.name}
                </p>
                {/* The whole line is laid out invisibly, so the box does not grow
                    as the words arrive. */}
                <p className="relative text-[12px] leading-snug sm:text-[13px]">
                  <span className="invisible">{line.text}</span>
                  <span aria-hidden="true" className="absolute inset-0">{line.text.slice(0, shown)}</span>
                </p>
                <span className="sr-only" role="status">{who.name}: {line.text}</span>
              </div>
              <span className="mt-auto flex h-5 w-5 shrink-0 items-center justify-center text-amber-400" aria-hidden={!done}>
                {done && <TbChevronsRight className="h-4 w-4 animate-pulse" />}
              </span>
            </div>
            <p className="mt-1 text-center text-[10.5px] font-semibold text-white/70" aria-hidden="true">{done ? labels.talkNext : " "}</p>
          </div>
        )}

        {mode !== "play" && mode !== "talk" && (
          <div data-space-overlay className="absolute inset-0 flex overflow-y-auto bg-[#0b1330]/80 px-4 py-3 text-center text-white">
            {/* m-auto centres the panel, and still lets it scroll from the top
                when a short screen cannot fit it. */}
            <div className="m-auto flex w-full flex-col items-center gap-2">
              {mode === "ready" && (
                <>
                  <canvas ref={preview} width={384} height={216} aria-hidden="true" className="h-16 w-auto sm:h-24 [@media(max-height:500px)]:h-10" />
                  <span className="text-[12px] font-bold text-slate-100">Endymion FRS Mk III</span>
                  {locked && <span className="max-w-xs text-[11px] font-semibold leading-snug text-white/75">{labels.guestNote}</span>}
                  {saved && (
                    <span className="text-[11px] font-semibold text-white/70">
                      {labels.chapterName(saved.chapter)} · {labels.score} {saved.score}
                    </span>
                  )}
                  <div className="flex flex-wrap justify-center gap-2">
                    <button type="button" autoFocus onClick={continueGame} className={primary}>
                      {saved ? labels.continueRun : labels.tap}
                    </button>
                    {saved && (
                      <button type="button" onClick={newGame} className={secondary}>
                        {labels.newGame}
                      </button>
                    )}
                    {locked && onAccount && (
                      <button type="button" onClick={onAccount} className={secondary}>
                        {labels.account}
                      </button>
                    )}
                  </div>
                </>
              )}

              {mode === "paused" && (
                <>
                  <span className="text-base font-extrabold">{labels.paused}</span>
                  <span className="text-[11px] font-semibold text-white/70">{labels.chapterName(chapter)}</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button type="button" autoFocus onClick={resume} className={primary}>
                      {labels.resume}
                    </button>
                    <button type="button" onClick={retry} className={secondary}>
                      {labels.retry}
                    </button>
                  </div>
                </>
              )}

              {mode === "clear" && (
                <>
                  <span className="text-base font-extrabold">{labels.clear(chapter)}</span>
                  {result && <Results r={result} labels={labels.results} />}
                  <span className="text-[12px] font-bold tabular-nums text-amber-400">{labels.score}: {score}</span>
                  {locked ? (
                    <>
                      <span className="max-w-xs text-[12px] font-semibold leading-snug text-white/85">{labels.guestClear}</span>
                      <div className="flex flex-wrap justify-center gap-2">
                        {onAccount && (
                          <button type="button" autoFocus onClick={onAccount} className={primary}>
                            {labels.account}
                          </button>
                        )}
                        <button type="button" autoFocus={!onAccount} onClick={retry} className={onAccount ? secondary : primary}>
                          {labels.replay}
                        </button>
                      </div>
                    </>
                  ) : (
                    <button type="button" autoFocus onClick={next} className={primary}>
                      {labels.next}
                    </button>
                  )}
                </>
              )}

              {mode === "dead" && (
                <>
                  <span className="text-base font-extrabold">{labels.lost}</span>
                  <span className="text-[12px] font-bold tabular-nums text-amber-400">{labels.score}: {score}</span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {atBoss && (
                      <button type="button" autoFocus onClick={retryBoss} className={primary}>
                        {labels.retryBoss}
                      </button>
                    )}
                    <button type="button" autoFocus={!atBoss} onClick={retry} className={atBoss ? secondary : primary}>
                      {labels.retry}
                    </button>
                  </div>
                </>
              )}

              {mode === "won" && (
                <>
                  <span className="text-base font-extrabold">{labels.won}</span>
                  <span className="text-[12px] font-bold tabular-nums text-amber-400">{labels.score}: {score}</span>
                  <button type="button" autoFocus onClick={newGame} className={primary}>
                    {labels.again}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {touch && portrait && (
        <TouchControls
          variant="below"
          labels={labels}
          bombs={bombs}
          nukes={nukes}
          mode={mode}
          canPause={canPause}
          onJoystick={onJoystick}
          onBomb={onBomb}
          onNuke={onNuke}
          onPause={onPause}
        />
      )}

      <div className={touch ? "flex flex-col gap-1" : "grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1"}>
        {!touch && (
        <div className="row-span-2 flex gap-2 self-start">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              if (modeRef.current === "play") bombQueued.current = true;
            }}
            disabled={mode !== "play" || bombs <= 0}
            className="flex h-11 touch-none select-none items-center justify-center rounded-full bg-navy px-5 text-[12px] font-bold text-amber-400 transition-colors active:bg-amber-400 active:text-navy disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            {labels.bomb} × {bombs}
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              if (modeRef.current === "play") nukeQueued.current = true;
            }}
            disabled={mode !== "play" || nukes <= 0}
            className="flex h-11 touch-none select-none items-center justify-center rounded-full bg-red-600 px-4 text-[12px] font-bold text-white transition-colors active:bg-amber-400 active:text-navy disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            {labels.nuke} × {nukes}
          </button>
          <button
            type="button"
            onClick={() => (mode === "paused" ? resume() : pause())}
            disabled={!canPause}
            aria-label={mode === "paused" ? labels.resume : labels.pause}
            title={mode === "paused" ? labels.resume : labels.pause}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-300 bg-white text-navy transition-colors hover:bg-neutral-100 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            {mode === "paused" ? <TbPlayerPlayFilled className="h-4.5 w-4.5" /> : <TbPlayerPauseFilled className="h-4.5 w-4.5" />}
          </button>
        </div>
        )}
        <p className="text-[12px] font-semibold leading-snug text-neutral-500">{touch ? labels.touchHint : labels.hint}</p>
        <details className="col-start-2 text-[12px] leading-relaxed text-neutral-600">
          <summary className="w-fit cursor-pointer rounded-md py-0.5 font-bold text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">{labels.help}</summary>
          <p className="pt-2">{labels.guide}</p>
        </details>
      </div>
    </div>
  );
}

/* The joystick and the buttons for a phone or a tablet. Held upright they sit in a row under
   the game; on its side the game fills the screen and they sit over its corners. */
function TouchControls({
  variant,
  labels,
  bombs,
  nukes,
  mode,
  canPause,
  onJoystick,
  onBomb,
  onNuke,
  onPause,
}: {
  variant: "below" | "over";
  labels: SpaceLabels;
  bombs: number;
  nukes: number;
  mode: Mode;
  canPause: boolean;
  onJoystick: (x: number, y: number) => void;
  onBomb: () => void;
  onNuke: () => void;
  onPause: () => void;
}) {
  const over = variant === "over";
  const playing = mode === "play";
  const round = `flex touch-none select-none flex-col items-center justify-center rounded-full text-[10px] font-extrabold leading-tight shadow-md transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${over ? "h-12 w-12" : "h-16 w-16"}`;
  const press = (fn: () => void) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };
  const buttons = (
    <>
      <button
        type="button"
        aria-label={labels.bomb}
        disabled={!playing || bombs <= 0}
        onPointerDown={press(onBomb)}
        className={`${round} ${over ? "bg-navy/80" : "bg-navy"} text-amber-400 active:bg-amber-400 active:text-navy`}
      >
        <span>{labels.bomb}</span>
        <span className="tabular-nums">×{bombs}</span>
      </button>
      <button
        type="button"
        aria-label={labels.nuke}
        disabled={!playing || nukes <= 0}
        onPointerDown={press(onNuke)}
        className={`${round} ${over ? "bg-red-600/85" : "bg-red-600"} text-white active:bg-amber-400 active:text-navy`}
      >
        <span>{labels.nuke}</span>
        <span className="tabular-nums">×{nukes}</span>
      </button>
    </>
  );
  const pause = (
    <button
      type="button"
      onClick={onPause}
      disabled={!canPause}
      aria-label={mode === "paused" ? labels.resume : labels.pause}
      className={`flex items-center justify-center rounded-full border text-navy transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
        over ? "h-9 w-9 border-white/50 bg-white/60" : "h-10 w-10 border-neutral-300 bg-white"
      }`}
    >
      {mode === "paused" ? <TbPlayerPlayFilled className="h-4.5 w-4.5" /> : <TbPlayerPauseFilled className="h-4.5 w-4.5" />}
    </button>
  );

  if (over) {
    return (
      <>
        <Joystick key={mode} disabled={!playing} label={labels.joystick} size={96} glass onChange={onJoystick} className="absolute bottom-2 left-3" />
        <div className="absolute bottom-3 right-3 flex gap-2.5">{buttons}</div>
        <div className="absolute right-3 top-8">{pause}</div>
      </>
    );
  }
  return (
    <div className="flex items-center justify-between gap-3 px-1 pb-1">
      <Joystick key={mode} disabled={!playing} label={labels.joystick} size={132} onChange={onJoystick} />
      <div className="flex flex-col items-end gap-3">
        {pause}
        <div className="flex gap-3">{buttons}</div>
      </div>
    </div>
  );
}

/* How the chapter went: what was destroyed, how often the ship was hit, how long
   the boss took, and the bonus each of those earned. */
function Results({ r, labels }: { r: ChapterResult; labels: SpaceLabels["results"] }) {
  const cells: { label: string; value: string; bonus?: boolean }[] = [
    { label: labels.enemies, value: r.killRate === null ? "–" : `${r.kills}/${r.spawned} · ${Math.round(r.killRate * 100)}%` },
    { label: labels.hits, value: String(r.hits) },
    { label: labels.bossTime, value: clock(r.bossSeconds) },
    { label: labels.killBonus, value: `+${r.killBonus}`, bonus: true },
    { label: labels.noHitBonus, value: `+${r.noHitBonus}`, bonus: true },
    { label: labels.speedBonus, value: `+${r.speedBonus}`, bonus: true },
  ];
  return (
    <dl className="grid w-full max-w-sm grid-cols-3 gap-x-3 gap-y-1.5">
      {cells.map((c) => (
        <div key={c.label} className="min-w-0">
          <dt className="text-[10px] font-semibold leading-tight text-white/65">{c.label}</dt>
          <dd
            className={`text-[12.5px] font-extrabold tabular-nums ${c.bonus ? (c.value === "+0" ? "text-white/40" : "text-amber-300") : "text-white"}`}
          >
            {c.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* Drawing. */

/* What the readouts remember between frames: the typeface, and the pale strip
   on the boss's bar that trails behind the damage just done. */
type Hud = { font: string; trail: number; bossId: number; frame: number };

const GUN_COLOR: Record<Exclude<Gun, "blaster">, string> = { machine: "#fb923c", spread: "#a3e635", laser: "#22d3ee", torpedo: "#f87171", icebomb: "#7dd3fc", flame: "#f97316", katana: "#e2e8f0" };
const HUD_H = 24;

function draw(ctx: CanvasRenderingContext2D, s: State, labels: SpaceLabels, mode: Mode, reduceMotion: boolean, hud: Hud) {
  const f = s.frame;
  const font = hud.font;
  const launching = s.phase === "launch";
  ctx.save();
  if (s.shake > 0 && !reduceMotion) ctx.translate((Math.random() - 0.5) * Math.min(7, s.shake / 4), (Math.random() - 0.5) * Math.min(7, s.shake / 4));

  drawBackdrop(ctx, s, reduceMotion);
  if (launching) drawHangar(ctx, s);
  drawHQ(ctx, s, reduceMotion);
  for (const h of s.hazards) if (!drawBossHazard(ctx, h, reduceMotion)) drawHazard(ctx, h, s, reduceMotion);
  for (const bm of s.beams) drawBeam(ctx, bm, f, reduceMotion);
  for (const c of s.charges) drawZone(ctx, c, reduceMotion);
  for (const k of s.pickups) drawPickup(ctx, k.x, k.y, k.kind, k.t);
  drawWarp(ctx, s, warpPower(s), reduceMotion);
  for (const e of s.enemies) {
    drawSpaceEnemy(ctx, e, s, reduceMotion);
    drawBossShield(ctx, e, reduceMotion);
  }
  drawTimedBombs(ctx, s, reduceMotion);
  for (const b of s.bullets) if (!drawBossBullet(ctx, b) && !drawWeaponBullet(ctx, b, reduceMotion)) drawBullet(ctx, b);
  drawSmoke(ctx, s);
  drawPlayer(ctx, s, reduceMotion);
  drawRepair(ctx, s, reduceMotion);
  drawChill(ctx, s, reduceMotion);
  drawShieldFlash(ctx, s, reduceMotion);
  drawMorph(ctx, s, reduceMotion);
  drawSlash(ctx, s, reduceMotion);
  if (launching) drawLaunchOverlay(ctx, s, labels.launch, reduceMotion);

  drawBursts(ctx, s.bursts);
  drawWarheads(ctx, s, reduceMotion);
  drawNuke(ctx, s, reduceMotion);

  if (s.bombFlash > 0 && !reduceMotion) {
    ctx.fillStyle = `rgb(255 255 255 / ${(s.bombFlash / 14) * 0.7})`;
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();

  if (!launching) drawHud(ctx, s, labels, hud);

  ctx.save();
  ctx.textAlign = "center";
  /* Words in the scene stay out from under the overlays' own. */
  if (s.callout && (mode === "play" || mode === "talk")) {
    const c = s.callout;
    const a = Math.min(1, c.t / 25, (150 - c.t) / 10);
    const loud = c.kind === "overload" || c.kind === "warning" || c.kind === "c4";
    ctx.globalAlpha = Math.max(0, a);
    ctx.font = loud ? `800 24px ${font}` : `800 18px ${font}`;
    ctx.fillStyle = "rgb(0 0 0 / 0.55)";
    ctx.fillText(labels.callouts[c.kind], W / 2 + 1.5, 72 + 1.5);
    ctx.fillStyle = loud ? (f % 10 < 5 ? "#ff4d4d" : "#ffd24d") : ["levelup", "hypersonic", "mechshield", "launcher", "repair", "hq"].includes(c.kind) ? "#fde047" : c.kind === "phase" ? "#fdba74" : "#7dd3fc";
    ctx.fillText(labels.callouts[c.kind], W / 2, 72);
    /* The boss's name under its warning. */
    if (c.kind === "warning" && s.bossId !== 0) {
      const name = labels.bossNames[s.chapter - 1] ?? "";
      ctx.font = `800 10px ${font}`;
      ctx.fillStyle = "rgb(0 0 0 / 0.55)";
      ctx.fillText(name.toUpperCase(), W / 2 + 1, 89 + 1);
      ctx.fillStyle = "#fecdd3";
      ctx.fillText(name.toUpperCase(), W / 2, 89);
    }
    ctx.globalAlpha = 1;
  }

  /* A chapter boss's own attack names itself as it winds up. */
  const boss = s.enemies.find((e) => isBoss(e.type));
  const move = boss?.attack;
  if (boss && move && move.t < move.warn && mode === "play") {
    const name = labels.attackNames[move.kind];
    if (name) {
      const text = name.toUpperCase();
      ctx.globalAlpha = Math.max(0, Math.min(1, move.t / 8, (move.warn - move.t) / 10));
      ctx.font = `800 9px ${font}`;
      const w = ctx.measureText(text).width + 16;
      ctx.fillStyle = "rgb(7 12 28 / 0.8)";
      ctx.fillRect(W / 2 - w / 2, 33, w, 15);
      ctx.fillStyle = AMBER;
      ctx.fillRect(W / 2 - w / 2, 33, 2, 15);
      ctx.fillStyle = "#fecdd3";
      ctx.fillText(text, W / 2 + 1, 43.8);
      ctx.globalAlpha = 1;
    }
  }

  /* The chapter's card as the ship arrives: a band across the screen with the
     chapter's number over its name. */
  if (s.banner > 0 && mode === "play") {
    const a = Math.max(0, Math.min(1, s.banner / 30, (150 - s.banner) / 20));
    const name = labels.chapterName(s.chapter);
    const cut = name.indexOf(": ");
    const kicker = cut > 0 ? name.slice(0, cut) : "";
    const title = cut > 0 ? name.slice(cut + 2) : name;
    const top = H / 2 - 52;
    ctx.globalAlpha = a;
    ctx.fillStyle = "rgb(7 12 28 / 0.74)";
    ctx.fillRect(0, top, W, 38);
    ctx.fillStyle = AMBER;
    ctx.fillRect(0, top, W, 1);
    ctx.fillRect(0, top + 37, W, 1);
    ctx.font = `800 8px ${font}`;
    ctx.fillText(kicker.toUpperCase(), W / 2, top + 12);
    ctx.fillStyle = "#fff";
    ctx.font = `800 16px ${font}`;
    ctx.fillText(title, W / 2, top + 30);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/* The ship's health bar, ticked every twenty points, with the small shield bar under it and,
   above it, a row of pips: one for each level above the first, in the colour of the upgrade
   that level brought. Being hit never takes a pip away. Returns how wide the bars are. */
function drawLife(ctx: CanvasRenderingContext2D, s: State, font: string) {
  const p = s.p;
  const max = maxLife(p);
  const length = Math.round(max * 0.7);
  const x0 = 7;
  const stretches = p.level - 1;
  const gap = stretches > 0 ? Math.min(9, 60 / stretches) : 0;
  if (stretches === 0) {
    ctx.fillStyle = "rgb(255 255 255 / 0.07)";
    ctx.fillRect(x0, 3.2, 26, 3.2);
  }
  for (let i = 0; i < stretches; i++) {
    ctx.fillStyle = levelColor(i + 2);
    ctx.fillRect(x0 + i * gap, 3.2, gap - 0.8, 3.2);
  }
  ctx.fillStyle = "rgb(255 255 255 / 0.14)";
  ctx.fillRect(x0, 7.6, length, 6);
  ctx.fillStyle = p.hp / max < 0.3 && Math.floor(s.frame / 8) % 2 === 0 ? "#fb7185" : "#ff4d6d";
  ctx.fillRect(x0, 7.6, length * Math.max(0, p.hp / max), 6);
  ctx.fillStyle = "rgb(7 12 28 / 0.85)";
  for (let v = 20; v < max; v += 20) ctx.fillRect(x0 + (length * v) / max - 0.4, 7.6, 0.8, 6);
  ctx.font = `800 6px ${font}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.strokeStyle = "rgb(7 12 28 / 0.9)";
  ctx.lineWidth = 1.6;
  ctx.strokeText(String(Math.ceil(p.hp)), x0 + 2, 10.9);
  ctx.fillStyle = "#fff";
  ctx.fillText(String(Math.ceil(p.hp)), x0 + 2, 10.9);
  const shield = Math.round(maxShield(p) * 1.6);
  ctx.fillStyle = "rgb(255 255 255 / 0.14)";
  ctx.fillRect(x0, 15.4, shield, 2.4);
  ctx.fillStyle = p.shieldFlash > 0 && Math.floor(p.shieldFlash / 3) % 2 === 0 ? "#e0f2fe" : "#38bdf8";
  ctx.fillRect(x0, 15.4, shield * Math.min(1, p.shield / maxShield(p)), 2.4);
  return Math.max(length, stretches * gap);
}

/* The strip along the top: health, ship level, the special gun
   and its ammunition on the left; how far through the chapter the run is on the
   right, or the boss's health once it has arrived. */
function drawHud(ctx: CanvasRenderingContext2D, s: State, labels: SpaceLabels, hud: Hud) {
  const font = hud.font;
  ctx.save();
  ctx.fillStyle = "rgb(7 12 28 / 0.84)";
  ctx.fillRect(0, 0, W, HUD_H);
  ctx.fillStyle = "rgb(251 207 51 / 0.28)";
  ctx.fillRect(0, HUD_H, W, 1);

  const length = drawLife(ctx, s, font);

  /* The ship's level, and how far the gold hearts have got toward the next. */
  let x = 7 + length + 5;
  ctx.fillStyle = "#fde047";
  ctx.fillRect(x, 4, 26, 11);
  ctx.fillStyle = "#171717";
  ctx.font = `800 7.5px ${font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`LV ${s.p.level}`, x + 13, 9.8);
  const from = LEVEL_AT[s.p.level - 1];
  const to = s.p.level < MAX_LEVEL ? LEVEL_AT[s.p.level] : from + 1;
  ctx.fillStyle = "rgb(255 255 255 / 0.14)";
  ctx.fillRect(x, 18, 26, 2.5);
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(x, 18, s.p.level >= MAX_LEVEL ? 26 : Math.min(26, (26 * (s.p.extra - from)) / (to - from)), 2.5);

  /* The special gun, while it has ammunition. */
  x += 33;
  if (s.p.gun !== "blaster") {
    const color = GUN_COLOR[s.p.gun];
    ctx.textAlign = "left";
    ctx.fillStyle = color;
    ctx.fillText(labels.guns[s.p.gun], x, 9.8);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.fillText(String(s.p.ammo), x + 60, 9.8);
  }

  const boss = s.enemies.find((e) => isBoss(e.type));
  if (boss) {
    const w = 150;
    const bx = W - w - 8;
    const share = Math.max(0, boss.hp) / boss.maxHp;
    if (hud.bossId !== boss.id) {
      hud.bossId = boss.id;
      hud.trail = share;
    }
    if (hud.frame !== s.frame) {
      hud.frame = s.frame;
      hud.trail = Math.max(share, hud.trail - 0.004);
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "#fecdd3";
    ctx.fillText((labels.bossNames[s.chapter - 1] ?? "").toUpperCase(), bx, 8.5);
    ctx.fillStyle = "rgb(255 255 255 / 0.14)";
    ctx.fillRect(bx, 14, w, 5);
    ctx.fillStyle = "rgb(255 255 255 / 0.55)";
    ctx.fillRect(bx, 14, w * hud.trail, 5);
    ctx.fillStyle = "#ff4d6d";
    ctx.fillRect(bx, 14, w * share, 5);
    /* The last boss's shield, a thin pale strip under its health. */
    if (boss.maxShield !== undefined && boss.shield !== undefined) {
      ctx.fillStyle = "rgb(255 255 255 / 0.14)";
      ctx.fillRect(bx, 20.5, w, 2.2);
      ctx.fillStyle = "#7dd3fc";
      ctx.fillRect(bx, 20.5, (w * Math.max(0, boss.shield)) / boss.maxShield, 2.2);
    }
    /* A notch where each phase ends. */
    const marks = boss.type === "boss8" ? FINAL_PHASE_AT : (BOSS_PHASES[boss.type] ?? 1) > 1 ? [0.66, 0.33] : [];
    ctx.fillStyle = "rgb(7 12 28 / 0.9)";
    for (const m of marks) ctx.fillRect(bx + w * m - 0.5, 13, 1, 7);
  } else if (s.phase === "play") {
    /* The chapter so far, with the boss waiting at the end. */
    const w = 120;
    const px = W - w - 16;
    const y = 11;
    const u = chapterProgress(s);
    ctx.fillStyle = "rgb(255 255 255 / 0.14)";
    ctx.fillRect(px, y, w, 3);
    ctx.fillStyle = AMBER;
    ctx.fillRect(px, y, w * u, 3);
    ctx.fillStyle = "#ff4d6d";
    ctx.beginPath();
    ctx.moveTo(px + w + 6, y - 2.5);
    ctx.lineTo(px + w + 9.5, y + 1.5);
    ctx.lineTo(px + w + 6, y + 5.5);
    ctx.lineTo(px + w + 2.5, y + 1.5);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(px + w * u + 3, y + 1.5);
    ctx.lineTo(px + w * u - 2.5, y - 2);
    ctx.lineTo(px + w * u - 2.5, y + 5);
    ctx.fill();
  }
  ctx.restore();
}
