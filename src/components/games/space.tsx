"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { IconType } from "react-icons";
import {
  TbArrowsMaximize,
  TbArrowsMinimize,
  TbChevronsRight,
  TbDeviceTv,
  TbBolt,
  TbDrone,
  TbHeadset,
  TbHelmet,
  TbMilitaryRank,
  TbPlayerPauseFilled,
  TbPlayerPlayFilled,
  TbRobot,
  TbShieldHalf,
  TbSkull,
  TbSwords,
  TbVolume,
  TbVolumeOff,
} from "react-icons/tb";
import { spaceAudio } from "./space-audio";
import { AMBER, fitCanvas, isTyping, loadBest, makeReporter, saveBest, stat } from "./shared";
import { CHANCES, LIMITS2, LIMITS3, furthest, loadSaved, parseProgress, saveSaved, stashGuest, type Progress } from "./space-progress";
import { pullProgress, pushProgress } from "@/lib/account";
import { canFullscreen, enterFullscreen, leaveFullscreen, useFullscreen, useTouchPad } from "./touch-controls";
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
  LAUNCH_GO,
  H,
  BLOOM,
  xpGauge,
  NUKE,
  W,
  bossCheckpoint,
  chapterProgress,
  createState,
  hazardWarning,
  hidesTells,
  isBoss,
  isMini,
  launchPose,
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
import { SPEAKERS, STORY, type Line } from "./space-story";
import { SPACE2_EVENTS, SPACE2_SPEAKERS, SPACE2_STORY } from "./space2-story";
import { SPACE3_SPEAKERS, SPACE3_STORY } from "./space3-story";
import { drawResonanceEffects, drawResonanceHUD } from "./space3-hud-art";
import { drawThirdBullet } from "./space3-projectile-art";
import { KineticPushButton, type FlightControlsStatus } from "./space3-touch-controls";
import { drawKineticWave, drawModeTag, drawSeedBullet } from "./space3-weapons-art";
import { drawHints } from "./space3-hints-art";
import { drawAct2Beam, drawAct2Hazard, drawLands, drawOuterField } from "./space3-act2-art";
import { drawLumenWing } from "./space3-lumen-art";
import { drawSpaceEnemy } from "./space-actor-art";
import { drawBeam, drawBullet, drawBursts, drawPickup } from "./space-fx-art";
import { drawBossBullet, drawBossHazard, drawChill, drawZone } from "./space-boss-fx-art";
import { drawHQ, drawMorph, drawNuke, drawRepair, drawShieldFlash } from "./space-ship-forms-art";
import { drawBloom, drawBossShield, drawHyper, drawKite, drawSlash, drawTimedBombs, drawWarheads, drawWarp, drawWeaponBullet } from "./space-weapons-art";
import { clearEnvironmentCache } from "./space-environment";
import { drawGust, drawSecondHazard } from "./space2-boss-fx-art";
import { drawSecondBullet } from "./space2-actor-art";

export type SpaceLabels = {
  tap: string;
  score: string;
  best: string;
  bomb: string;
  nuke: string;
  hint: string;
  /* What the hint says on a phone or a tablet. */
  touchHint: string;
  /* Leaves the game for the screen it was opened from, in the full-screen view. */
  exit: string;
  help: string;
  guide: string;
  chapterName: (n: number) => string;
  clear: (n: number) => string;
  next: string;
  lost: string;
  /* The chances a run has left, and what the screen says when they have run out. */
  chancesLeft: (n: number) => string;
  outOfChances: string;
  restart: string;
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

type Mode = "ready" | "talk" | "play" | "paused" | "clear" | "dead" | "out" | "won";

/* What comes after a scene: the launch that was waiting for its opening, the
   game stopped by a boss, or the end of the chapter. */
type Scene = { key: string; index: number; after: "launch" | "resume" | "clear" };

/* A scene's lines, from Space 1's story, Space 2's, or Space 2's one-off events. */
function linesFor(lang: "en" | "ms", key: string): { who: string; text: string }[] {
  const one = STORY[lang] as Record<string, Line[]>;
  const two = SPACE2_STORY[lang] as Record<string, { who: string; text: string }[]>;
  const events = SPACE2_EVENTS[lang] as Record<string, { who: string; text: string }[]>;
  const three = SPACE3_STORY[lang] as Record<string, { who: string; text: string }[]>;
  return one[key] ?? two[key] ?? events[key] ?? three[key] ?? [];
}
const ALL_SPEAKERS: Record<string, { name: string; color: string }> = { ...SPEAKERS, ...SPACE2_SPEAKERS, ...SPACE3_SPEAKERS };

/* The colour of each stretch of the upgrade bar: that of the upgrade its level brought. */
const LEVEL_COLOR: Record<number, string> = { 2: "#a3e635", 3: "#cbd5e1", 4: "#f87171", 5: "#7dd3fc" };
const levelColor = (level: number) => LEVEL_COLOR[level] ?? "#fbbf24";

const SPEAKER_ICON: Record<string, IconType> = {
  nova: TbHelmet,
  mika: TbHeadset,
  rin: TbShieldHalf,
  arc: TbRobot,
  vex: TbSwords,
  kroll: TbSkull,
  halo: TbDrone,
  lumen: TbBolt,
  marsh: TbMilitaryRank,
};

/* Milliseconds a character takes to appear. A line has to finish before the
   next one will come, and there is no way past that. */
const TYPE_MS = 22;

/* Seconds as m:ss. */
function clock(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* Puts the game's host element where it belongs: inside the page (it adds no box of its own), or on
   the body as a layer over the whole screen, sized to the dynamic viewport so a browser's toolbars
   do not cut it. */
function carryHost(host: HTMLElement, parent: Element | null, immersive: boolean, label: string) {
  if (parent && host.parentNode !== parent) parent.appendChild(host);
  host.style.cssText = immersive
    ? "position:fixed;left:0;top:0;width:100vw;height:100dvh;z-index:110;background:#000;overflow:hidden;overscroll-behavior:none;touch-action:none"
    : "display:contents";
  if (immersive) {
    host.setAttribute("role", "dialog");
    host.setAttribute("aria-modal", "true");
    host.setAttribute("aria-label", label);
  } else {
    host.removeAttribute("role");
    host.removeAttribute("aria-modal");
    host.removeAttribute("aria-label");
  }
}
const dropHost = (host: HTMLElement) => host.remove();

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
  onAccount,
  onExit,
  campaign = 1,
}: {
  labels: SpaceLabels;
  lang: "en" | "ms";
  /* 1 is Space, 2 is Space 2 (the engine's chapters 9 to 16, its own score and its own save), 3 is Space 3 (chapters 17 to 28; only the first is written). */
  campaign?: 1 | 2 | 3;
  /* Guests can fly Chapter 1 only; an account is required to save or continue.
     `onAccount` opens registration/login. */
  username?: string | null;
  onAccount?: () => void;
  /* Closes the game. On a phone turned on its side the game covers the whole screen, so this is
     how a player gets back out. */
  onExit?: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const preview = useRef<HTMLCanvasElement>(null);
  const first = campaign === 3 ? LIMITS3.first : campaign === 2 ? LIMITS2.first : 1;
  const last = campaign === 3 ? LIMITS3.ready : campaign === 2 ? LIMITS2.last : CHAPTERS;
  const gameKey = campaign === 3 ? "space3" : campaign === 2 ? "space2" : "space";
  const [rep] = useState(() => makeReporter("space2"));
  const [mode, setMode] = useState<Mode>("ready");
  const { touch, handheld, portrait } = useTouchPad();
  /* A phone or a tablet on its side: the game takes the whole screen, and a finger dragged
     across it is the stick. Anything else keeps the game inside the page it was opened in. */
  const immersive = handheld && !portrait;
  const fullscreen = useFullscreen();
  const fullscreenOk = canFullscreen();
  const [chapter, setChapter] = useState(campaign === 3 ? first : 1);
  const [score, setScore] = useState(0);
  const [bombs, setBombs] = useState(2);
  const [nukes, setNukes] = useState(NUKE.count);
  const [best, setBest] = useState(0);
  const [saved, setSaved] = useState<Progress | null>(null);
  const [result, setResult] = useState<ChapterResult | null>(null);
  const [atBoss, setAtBoss] = useState(false);
  const [scene, setScene] = useState<Scene | null>(null);
  const [typing, setTyping] = useState({ id: "", n: 0 });
  const world = useRef<State>(createState(first));
  const modeRef = useRef<Mode>("ready");
  const sceneRef = useRef<Scene | null>(null);
  const savedRef = useRef<Progress | null>(null);
  const atBossRef = useRef(false);
  const chancesRef = useRef(CHANCES);
  const [chances, setChances] = useState(CHANCES);
  const doneRef = useRef(false);
  const seen = useRef(new Set<string>());
  const outroStarted = useRef(false);
  const keys = useRef({ up: false, down: false, left: false, right: false, bomb: false, nuke: false, phase: false, barrier: false, overdrive: false, focus: false });
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);
  const pending = useRef({ x: 0, y: 0 });
  const handheldRef = useRef(handheld);
  useEffect(() => {
    handheldRef.current = handheld;
  }, [handheld]);
  const bombQueued = useRef(false);
  const nukeQueued = useRef(false);
  const resonanceQueued = useRef({ phase: false, barrier: false, overdrive: false });
  const readResonance = useCallback((): FlightControlsStatus | null => {
    const s = world.current, r = s.res;
    return r ? { meter: Math.floor(r.meter), phase: r.phase, phaseCd: r.phaseCd, barrier: r.barrier, barrierCd: r.barrierCd, overdrive: r.overdrive, flying: s.phase === "play", lanceActive: s.lance !== null } : null;
  }, []);
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
  /* Only a signed-in player can load or save a run. */
  const slot = username;
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
      setBest(loadBest(gameKey));
      const p = slot === null ? null : loadSaved(slot, campaign);
      savedRef.current = p;
      setSaved(p);
      /* Signed in: the account may hold a run from another device, and the further one wins. */
      if (!username) return;
      void pullProgress(gameKey).then((raw) => {
        if (stop) return;
        const remote = parseProgress(raw, campaign);
        const local = savedRef.current;
        const winner = furthest(local, remote);
        if (winner && winner !== local) {
          saveSaved(username, winner, campaign);
          savedRef.current = winner;
          setSaved(winner);
        }
        if (winner && winner !== remote) void pushProgress(gameKey, winner);
      });
    }, 0);
    return () => {
      stop = true;
      clearTimeout(first);
    };
  }, [slot, username, gameKey, campaign]);

  const [isMuted, setIsMuted] = useState(() => spaceAudio.getMuted());
  const toggleMute = useCallback(() => {
    const muted = spaceAudio.toggleMute();
    setIsMuted(muted);
  }, []);

  /* Scanlines cost a phone battery and frames, so they start off there; the button turns them on. */
  const [crtFilter, setCrtFilter] = useState(() => !handheld);
  const crtRef = useRef(!handheld);
  useEffect(() => {
    crtRef.current = crtFilter;
  }, [crtFilter]);

  const goTo = useCallback((next: Mode) => {
    modeRef.current = next;
    setMode(next);
    if (next !== "play") {
      resonanceQueued.current = { phase: false, barrier: false, overdrive: false };
      spaceAudio.stopMusic();
    }
  }, []);

  const remember = useCallback((value: number) => {
    setBest((b) => {
      if (value > b) {
        saveBest(gameKey, value);
        return value;
      }
      return b;
    });
  }, [gameKey]);

  const keep = useCallback((p: Progress | null) => {
    savedRef.current = p;
    setSaved(p);
    const who = slotRef.current;
    if (who === null) return;
    saveSaved(who, p, campaign);
    if (who) void pushProgress(gameKey, p);
  }, [campaign, gameKey]);

  /* Lets go of every key and drag, so nothing stays held through a pause. */
  const release = useCallback(() => {
    keys.current = { up: false, down: false, left: false, right: false, bomb: false, nuke: false, phase: false, barrier: false, overdrive: false, focus: false };
    drag.current = null;
    pending.current = { x: 0, y: 0 };
    bombQueued.current = false;
    nukeQueued.current = false;
    resonanceQueued.current = { phase: false, barrier: false, overdrive: false };
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
    (key: string, after: Scene["after"]) => {
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
        if (campaign === 3) {
          stat("space3", "chapter", s.chapter - 16);
          if (s.stats.hits === 0) stat("space3", "noHitChapters", 1, "add");
        } else if (campaign === 2) {
          stat("space2", "chapter", s.chapter - 8);
          if (s.stats.hits === 0) stat("space2", "noHitChapters", 1, "add");
        } else stat("space", "chapter", s.chapter);
        remember(s.score);
        setResult(s.result);
        if (s.chapter < last) {
          const run = { chapter: s.chapter + 1, score: s.score, weapon: s.p.weapon, level: s.p.level, extra: s.p.extra, chances: chancesRef.current };
          /* A guest saves nothing; the clear is only noted, for the sign-in to pick up. */
          if (slotRef.current === null) {
            stashGuest(run, campaign);
          }
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
    [goTo, keep, remember, campaign, last],
  );

  /* Moves the story on, but only once the line on screen has been read out in
     full. Nothing else moves it: not a longer press, not Escape. */
  const advance = useCallback(() => {
    const sc = sceneRef.current;
    if (!sc || !doneRef.current) return;
    const lines = linesFor(langRef.current, sc.key);
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
      if (s.res) release();
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
      const key = `c${s.chapter}-intro`;
      if (!seen.current.has(key)) startScene(key, "launch");
      else goTo("play");
    },
    [goTo, startScene, release],
  );

  const newGame = useCallback(() => {
    seen.current.clear();
    chancesRef.current = CHANCES;
    setChances(CHANCES);
    begin(createState(first));
  }, [begin, first]);

  const continueGame = useCallback(() => {
    const p = savedRef.current;
    if (!p) {
      newGame();
      return;
    }
    seen.current.clear();
    chancesRef.current = p.chances ?? CHANCES;
    setChances(chancesRef.current);
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
    else if (m === "won" || m === "out") newGame();
    else if (m === "clear") {
      if (slotRef.current === null) onAccountRef.current?.();
      else next();
    }
    else if (m === "dead") {
      if (atBossRef.current) retryBoss();
      else retry();
    } else if (m === "paused") resume();
  }, [advance, continueGame, newGame, next, resume, retry, retryBoss]);

  const line = scene ? linesFor(lang, scene.key)[scene.index] ?? null : null;
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
    let prevBulletCount = 0;
    let prevHp = world.current.p.hp;
    let prevShield = world.current.p.shield;
    let prevLevel = world.current.p.level;
    let prevKills = world.current.stats.kills;
    let prevBlocks = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let combo = 0;
    let comboTimer = 0;
    let maxCombo = 0;
    let hitStop = 0;
    let lastHits = 0;
    const floatingTexts: FloatingText[] = [];
    const debris: Debris[] = [];
    const prevEnemyHps = new Map<number, number>();
    /* The page's own typeface, so the readouts match the rest of the site. */
    const hud: Hud = { font: getComputedStyle(el).fontFamily || "sans-serif", trail: 1, bossId: 0, frame: -1, combo: 0, comboTimer: 0, maxCombo: 0, floatingTexts, debris, crt: crtRef.current };
    const previewWorld = createState(first);
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
          if (hitStop > 0) {
            hitStop -= 1;
            continue;
          }
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
            mx += px;
            my += py;
          }
          const bomb = flying && (k.bomb || bombQueued.current);
          const nuke = flying && (k.nuke || nukeQueued.current);
          bombQueued.current = false;
          nukeQueued.current = false;
          const ability = resonanceQueued.current;
          resonanceQueued.current = { phase: false, barrier: false, overdrive: false };
          step(s, { mx, my, bomb, nuke, phase: flying && (k.phase || ability.phase), barrier: flying && (k.barrier || ability.barrier), overdrive: flying && (k.overdrive || ability.overdrive), focus: flying && k.focus });
          /* A hit buzzes the phone for a moment. A new run starts the count again from zero. */
          if (s.stats.hits > lastHits && handheldRef.current && !reduceMotion) navigator.vibrate?.(40);
          lastHits = s.stats.hits;

          /* The launch: the hangar tune while the engines spool up, a beep for each count and GO,
             then the roar and the fanfare as the ship leaves the rail. */
          if (!flying) {
            const count = launchPose(s.launchT).count;
            if (count === 0 && s.launchT < LAUNCH_GO) spaceAudio.startMusic("hangar", s.chapter);
            else if (s.launchT < LAUNCH_GO) spaceAudio.stopMusic();
            if (count !== 0 && count !== launchPose(s.launchT - 1).count) spaceAudio.playCountdown(count < 0);
            if (s.launchT === LAUNCH_GO) spaceAudio.playLiftoff(s.chapter);
          }

          if (flying) {
            // Floating damage numbers detection
            for (const e of s.enemies) {
              const prev = prevEnemyHps.get(e.id);
              if (prev !== undefined && e.hp < prev) {
                const rawDmg = prev - e.hp;
                const dmg = Math.round(rawDmg * 10);
                if (dmg > 0) {
                  const isCrit = dmg >= 45 || e.hp <= 0;
                  floatingTexts.push({
                    x: e.x + e.w * 0.4 + (Math.random() - 0.5) * 8,
                    y: e.y + (Math.random() - 0.5) * 6,
                    text: isCrit ? `CRIT ${dmg}` : `${dmg}`,
                    color: isCrit ? "#fde047" : "#f1f5f9",
                    size: isCrit ? 10 : 8,
                    life: 34,
                    maxLife: 34,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: -1.1 - Math.random() * 0.5,
                    crit: isCrit,
                  });

                  // Impact Hit-Stop on massive boss hits / boss kill / heavy crits
                  if (isCrit && (isBoss(e.type) || rawDmg >= 15)) {
                    hitStop = 2;
                  }

                  // Floating metallic debris particles
                  if (e.hp <= 0 || rawDmg >= 10) {
                    const scrapCount = isBoss(e.type) ? 6 : e.hp <= 0 ? 3 : 1;
                    const colors = isBoss(e.type)
                      ? ["#f87171", "#fb923c", "#94a3b8", "#cbd5e1"]
                      : ["#94a3b8", "#64748b", "#cbd5e1", "#38bdf8"];
                    for (let i = 0; i < scrapCount; i++) {
                      debris.push({
                        x: e.x + e.w * (0.2 + Math.random() * 0.6),
                        y: e.y + e.h * (0.2 + Math.random() * 0.6),
                        vx: (Math.random() - 0.5) * 2.8 - (s.scroll > 0 ? 0.7 : 0),
                        vy: (Math.random() - 0.5) * 2.2,
                        rot: Math.random() * Math.PI * 2,
                        vRot: (Math.random() - 0.5) * 0.25,
                        w: 1.6 + Math.random() * 2.2,
                        h: 1.2 + Math.random() * 1.8,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        life: 30 + Math.floor(Math.random() * 15),
                        maxLife: 45,
                      });
                    }
                  }
                }
              }
              prevEnemyHps.set(e.id, e.hp);
            }

            const playerBullets = s.bullets.filter((b) => b.own === "p").length;
            if (playerBullets > prevBulletCount) {
              spaceAudio.playBlaster(s.p.gun);
            }
            prevBulletCount = playerBullets;

            if (s.p.level > prevLevel) {
              spaceAudio.playPowerup();
            }
            prevLevel = s.p.level;

            if (s.p.hp < prevHp) {
              spaceAudio.playHit(false);
            } else if (s.p.shield < prevShield) {
              spaceAudio.playHit(true);
            }
            prevHp = s.p.hp;
            prevShield = s.p.shield;

            if (s.stats.kills > prevKills) {
              const kCount = s.stats.kills - prevKills;
              spaceAudio.playExplosion(s.shake > 15 ? "heavy" : "small");
              combo += kCount;
              comboTimer = 135;
              if (combo > maxCombo) {
                maxCombo = combo;
                s.stats.maxCombo = maxCombo;
              }
              if (combo >= 2) {
                s.score += combo * 25 * kCount;
                floatingTexts.push({
                  x: s.p.x + 24,
                  y: s.p.y - 10,
                  text: `${combo}x COMBO!`,
                  color: combo >= 10 ? "#ec4899" : combo >= 5 ? "#f97316" : "#eab308",
                  size: combo >= 10 ? 11 : 9,
                  life: 42,
                  maxLife: 42,
                  vx: 0.2,
                  vy: -0.8,
                  crit: combo >= 5,
                });
              }
            }
            prevKills = s.stats.kills;

            if (comboTimer > 0) {
              comboTimer -= 1;
              if (comboTimer === 0) combo = 0;
            }

            for (let i = floatingTexts.length - 1; i >= 0; i--) {
              const ft = floatingTexts[i];
              ft.x += ft.vx;
              ft.y += ft.vy;
              ft.vy *= 0.94;
              ft.life -= 1;
              if (ft.life <= 0) floatingTexts.splice(i, 1);
            }

            for (let i = debris.length - 1; i >= 0; i--) {
              const d = debris[i];
              d.x += d.vx;
              d.y += d.vy;
              d.rot += d.vRot;
              d.vx *= 0.95;
              d.vy *= 0.95;
              d.life -= 1;
              if (d.life <= 0) debris.splice(i, 1);
            }

            if (s.counters2 && s.counters2.blocks > prevBlocks) {
              spaceAudio.playBloomAbsorb();
              prevBlocks = s.counters2.blocks;
            }

            const bossUnit = s.enemies.find((e) => isBoss(e.type));
            if (bossUnit?.attack && bossUnit.attack.t === 1) {
              spaceAudio.playBossAlarm();
            }

            /* The boss falling plays the victory fanfare, and losing the ship the game-over line. */
            if (s.phase === "play") {
              if (s.bossId !== 0) {
                spaceAudio.startMusic("boss", s.chapter, bossUnit?.a ?? 0);
              } else {
                spaceAudio.startMusic("stage", s.chapter);
              }
            } else if (s.phase === "clear") {
              spaceAudio.startMusic("victory", s.chapter);
            } else if (s.phase === "dead") {
              spaceAudio.startMusic("gameover", s.chapter);
            } else {
              spaceAudio.stopMusic();
            }
          }
          if (s.talk) break;
        }
        if (s.score !== shownScore) {
          shownScore = s.score;
          setScore(s.score);
        }
        if (s.p.bombs !== shownBombs) {
          if (shownBombs !== -1 && s.p.bombs < shownBombs) spaceAudio.playExplosion("heavy");
          shownBombs = s.p.bombs;
          setBombs(s.p.bombs);
        }
        if (s.p.nukes !== shownNukes) {
          if (shownNukes !== -1 && s.p.nukes < shownNukes) spaceAudio.playNuke();
          shownNukes = s.p.nukes;
          setNukes(s.p.nukes);
        }
        /* Space 2's own achievements count what its weapons and Halo did. */
        if (s.kite) {
          const c = s.counters2;
          rep.sync({ add: { minirocketUses: c.rockets, bloomUses: c.bloomOpens, bloomBlocks: c.blocks, hyperbeamUses: c.beams, orbCovers: c.covers }, max: { hyperbeamMultiKill: c.bestBeam } });
        }
        if (s.talk === "boss") {
          const key = `c${s.chapter}-boss`;
          if (seen.current.has(key)) s.talk = null;
          else startScene(key, "resume");
        } else if (s.talk === "judgement") {
          if (seen.current.has("judgement")) s.talk = null;
          else startScene("judgement", "resume");
        } else if (s.phase === "dead") {
          spaceAudio.startMusic("gameover", s.chapter);
          deadFor += 1;
          if (deadFor > 60) {
            deadFor = 0;
            /* Lost at the boss: offer to go again from the boss. */
            const boss = s.bossId !== 0;
            atBossRef.current = boss;
            setAtBoss(boss);
            remember(s.score);
            if (chancesRef.current > 0) {
              /* Spend a chance, and keep that at once so closing the game does not give it back. */
              chancesRef.current -= 1;
              setChances(chancesRef.current);
              if (s.chapter > first && slotRef.current !== null) {
                keep({ chapter: s.chapter, score: s.chapterStartScore, weapon: s.chapterStartWeapon, level: s.chapterStartLevel, extra: s.chapterStartExtra, chances: chancesRef.current });
              }
              goTo("dead");
            } else {
              /* None left: the run is over, and the next one starts from Chapter 1. */
              keep(null);
              goTo("out");
            }
          }
        } else if (s.phase === "clear" && s.clearFor > CLEAR.talk && !outroStarted.current) {
          spaceAudio.playExplosion("boss");
          outroStarted.current = true;
          startScene(`c${s.chapter}-outro`, "clear");
        }
      } else {
        acc = 0;
        /* Outside play: the title tune on the start screen; in a story scene, the hangar tune before
           launch, the victory fanfare (handing on to the hangar tune) after a boss, and the alert
           before one; the hangar tune over the results; the game-over line; the anthem at the end;
           and a quiet tune of its own while paused. */
        const mode = modeRef.current;
        const tune =
          mode === "ready" ? "title"
          : mode === "talk" ? (s.phase === "launch" ? "hangar" : s.phase === "clear" ? "victory" : "alert")
          : mode === "clear" ? "hangar"
          : mode === "dead" || mode === "out" ? "gameover"
          : mode === "won" ? "ending"
          : mode === "paused" ? "pause"
          : null;
        if (tune) spaceAudio.startMusic(tune, s.chapter);
        else spaceAudio.stopMusic();
        /* Held still for the story, but the lamps and the engine keep going. */
        if (modeRef.current === "talk" && !document.hidden) s.frame += 1;
      }

      hud.combo = combo;
      hud.comboTimer = comboTimer;
      hud.maxCombo = maxCombo;
      hud.floatingTexts = floatingTexts;
      hud.debris = debris;
      hud.crt = crtRef.current;
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
      spaceAudio.stopMusic();
    };
  }, [goTo, remember, startScene, first, rep, keep]);

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
        case "ShiftLeft":
        case "ShiftRight":
          /* Space 3 keeps Shift for its Phase Shift; Space and Space 2 for the bomb. */
          if (campaign === 3) k.phase = down;
          else k.bomb = down;
          break;
        case "KeyC":
          k.barrier = down;
          break;
        case "KeyZ":
          k.focus = down;
          break;
        case "KeyV":
          k.overdrive = down;
          break;
        case "KeyB":
        case "KeyX":
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
          if (e.target instanceof Element && e.target.closest("[data-space-overlay], [data-space-controls]")) return;
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
  }, [act, pause, release, resume, campaign]);

  const primary =
    "rounded-full bg-amber-400 px-4 py-1.5 text-[12px] font-bold text-navy hover:bg-amber-300 shadow-md shadow-amber-400/20 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";
  const secondary =
    "rounded-full border border-white/25 bg-white/5 backdrop-blur-sm px-4 py-1.5 text-[12px] font-bold text-white hover:bg-white/15 hover:border-white/40 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";
  const who = line ? ALL_SPEAKERS[line.who] : null;
  const SpeakerIcon = line ? SPEAKER_ICON[line.who] : null;
  const canPause = mode === "play" || mode === "paused";
  /* The game is drawn into a host element of its own, which sits where the game belongs, or is
     carried to the page's body when a phone is turned on its side. A fixed layer inside the dock's
     glass panel would be cut to the panel (a filter makes it the containing block), and moving the
     host keeps the canvas, and the run in it, alive through a turn of the phone. */
  const anchor = useRef<HTMLDivElement>(null);
  const [host] = useState(() => document.createElement("div"));
  useLayoutEffect(() => {
    carryHost(host, immersive ? document.body : anchor.current, immersive, campaign === 1 ? "Space" : `Space ${campaign}`);
  }, [immersive, host, campaign]);
  useEffect(() => () => {
    dropHost(host);
    void leaveFullscreen();
  }, [host]);
  /* A tap that starts a run also asks for full screen, turned sideways where the browser lets it. */
  const launchedAt = useRef(0);
  const launch = (start: () => void) => {
    if (handheld) {
      launchedAt.current = Date.now();
      void enterFullscreen();
    }
    start();
  };
  const sideways = useRef(immersive);
  useEffect(() => {
    if (sideways.current === immersive) return;
    sideways.current = immersive;
    if (Date.now() - launchedAt.current > 4000) pause();
  }, [immersive, pause]);
  const onBomb = () => {
    if (modeRef.current !== "play") return;
    bombQueued.current = true;
    if (handheld) navigator.vibrate?.(15);
  };
  const onNuke = () => {
    if (modeRef.current !== "play") return;
    nukeQueued.current = true;
    if (handheld) navigator.vibrate?.([30, 40, 30]);
  };
  const onPause = () => (mode === "paused" ? resume() : pause());
  /* Before a run starts, the header shows where Continue would pick up. */
  const offer = mode === "ready" ? saved : null;

  const iconButton = immersive
    ? "pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white transition-colors active:bg-amber-400 active:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    : "flex h-6 w-6 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-navy";
  const iconSize = immersive ? "h-5 w-5" : "h-4 w-4";
  const fullscreenLabel = lang === "ms" ? (fullscreen ? "Keluar skrin penuh" : "Skrin penuh") : fullscreen ? "Exit full screen" : "Full screen";
  const controlButtons = (
    <>
      <button
        type="button"
        aria-label={crtFilter ? "Disable CRT Scanlines" : "Enable CRT Scanlines"}
        title={crtFilter ? "CRT Filter: On" : "CRT Filter: Off"}
        className={`${iconButton} ${immersive ? (crtFilter ? "text-cyan-300" : "text-white/60") : crtFilter ? "text-cyan-600 hover:bg-neutral-200" : "text-neutral-400 hover:bg-neutral-200"}`}
        onClick={() => setCrtFilter((c) => !c)}
      >
        <TbDeviceTv className={iconSize} />
      </button>
      <button
        type="button"
        aria-label="Toggle Sound"
        title="Toggle Sound"
        className={`${iconButton} ${immersive ? "" : "text-navy/70 hover:bg-neutral-200 hover:text-navy"}`}
        onClick={toggleMute}
      >
        {isMuted ? <TbVolumeOff className={`${iconSize} text-red-500`} /> : <TbVolume className={`${iconSize} ${immersive ? "" : "text-navy"}`} />}
      </button>
      {handheld && fullscreenOk && (
        <button
          type="button"
          aria-label={fullscreenLabel}
          title={fullscreenLabel}
          className={`${iconButton} ${immersive ? "" : "text-navy hover:bg-neutral-200"}`}
          onClick={() => void (fullscreen ? leaveFullscreen() : enterFullscreen())}
        >
          {fullscreen ? <TbArrowsMinimize className={iconSize} /> : <TbArrowsMaximize className={iconSize} />}
        </button>
      )}
    </>
  );

  return (
    <div ref={anchor} className="contents">
      {createPortal(
    <div className={immersive ? "relative flex h-full w-full items-center justify-center overflow-hidden bg-black" : "flex flex-col gap-2"}>
      <div className={immersive ? "pointer-events-none absolute inset-0 z-20 text-white" : "flex items-center justify-between gap-2 text-[12px] font-bold text-navy"}>
        {immersive ? (
          <>
            {/* The canvas draws its own gauges across the top of the game, so the page's readouts and
                buttons stay in the rails on either side of it. */}
            <div className="absolute left-[max(8px,env(safe-area-inset-left))] top-[max(6px,env(safe-area-inset-top))] flex w-[60px] flex-col items-center rounded-xl bg-black/45 py-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/70">{labels.score}</span>
              <span className="text-[12px] font-extrabold leading-tight tabular-nums">{offer ? offer.score : score}</span>
              <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/70">{labels.best}</span>
              <span className="text-[11px] font-bold leading-tight tabular-nums text-white/85">{best}</span>
              <span className="sr-only">{labels.chapterName(offer ? offer.chapter : chapter)}</span>
            </div>
            <div className="absolute bottom-[max(8px,env(safe-area-inset-bottom))] left-[max(8px,env(safe-area-inset-left))] flex flex-col gap-2">{controlButtons}</div>
            <button
              type="button"
              onClick={onPause}
              disabled={!canPause}
              aria-label={mode === "paused" ? labels.resume : labels.pause}
              className={`${iconButton} absolute right-[max(8px,env(safe-area-inset-right))] top-[max(6px,env(safe-area-inset-top))] disabled:opacity-40`}
            >
              {mode === "paused" ? <TbPlayerPlayFilled className={iconSize} /> : <TbPlayerPauseFilled className={iconSize} />}
            </button>
          </>
        ) : (
          <>
            <span className="shrink-0 tabular-nums">{labels.score}: {offer ? offer.score : score}</span>
            <span className="min-w-0 truncate text-center">{labels.chapterName(offer ? offer.chapter : chapter)}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="tabular-nums">{labels.best}: {best}</span>
              {controlButtons}
            </div>
          </>
        )}
      </div>

      <div
        ref={moveSurface}
        className={`relative touch-none select-none overflow-hidden bg-[#070c1f] ${
          immersive ? "shrink-0" : "mx-auto w-full rounded-xl border border-slate-700/60 shadow-2xl ring-1 ring-white/10"
        }`}
        style={{
          maxWidth: immersive
            ? undefined
            : touch && !portrait ? "max(200px, calc((100dvh - 150px) * 16 / 9))" : "max(200px, calc((100dvh - 240px) * 16 / 9))",
          /* Sideways, the biggest 16:9 that fits between two rails of 72px (and the notch). */
          width: immersive
            ? "min(calc(100vw - 2 * (72px + max(env(safe-area-inset-left), env(safe-area-inset-right)))), calc(100dvh * 16 / 9))"
            : undefined,
        }}
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

        {touch && !immersive && !portrait && mode === "play" && (
          <TouchControls
            variant="stage"
            campaign={campaign}
            lang={lang}
            labels={labels}
            bombs={bombs}
            nukes={nukes}
            mode={mode}
            canPause={canPause}
            readStatus={readResonance}
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
          <div data-space-overlay className="absolute inset-0 flex overflow-y-auto bg-[#070c1f]/85 backdrop-blur-md px-4 py-3 text-center text-white">
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
                    <button type="button" autoFocus onClick={() => launch(continueGame)} className={primary}>
                      {saved ? labels.continueRun : labels.tap}
                    </button>
                    {saved && (
                      <button type="button" onClick={() => launch(newGame)} className={secondary}>
                        {labels.newGame}
                      </button>
                    )}
                    {locked && onAccount && (
                      <button type="button" onClick={onAccount} className={secondary}>
                        {labels.account}
                      </button>
                    )}
                    {immersive && onExit && (
                      <button type="button" onClick={onExit} className={secondary}>
                        {labels.exit}
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
                    {immersive && onExit && (
                      <button type="button" onClick={onExit} className={secondary}>
                        {labels.exit}
                      </button>
                    )}
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
                  <span className="text-[12px] font-bold">{labels.chancesLeft(chances)}</span>
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

              {mode === "out" && (
                <>
                  <span className="text-base font-extrabold">{labels.outOfChances}</span>
                  <span className="text-[12px] font-bold tabular-nums text-amber-400">{labels.score}: {score}</span>
                  <button type="button" autoFocus onClick={newGame} className={primary}>
                    {labels.restart}
                  </button>
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

      {immersive && mode === "play" && (
        <TouchControls
          variant="screen"
          campaign={campaign}
          lang={lang}
          labels={labels}
          bombs={bombs}
          nukes={nukes}
          mode={mode}
          canPause={canPause}
          readStatus={readResonance}
          onBomb={onBomb}
          onNuke={onNuke}
          onPause={onPause}
        />
      )}

      {touch && portrait && (
        <TouchControls
          variant="below"
          campaign={campaign}
          lang={lang}
          labels={labels}
          bombs={bombs}
          nukes={nukes}
          mode={mode}
          canPause={canPause}
          readStatus={readResonance}
          onBomb={onBomb}
          onNuke={onNuke}
          onPause={onPause}
        />
      )}

      {!immersive && (
      <div className={touch ? "flex flex-col gap-1" : "grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1"}>
        {!touch && (
        <div data-space-controls={campaign === 3 ? "" : undefined} className="row-span-2 flex gap-2 self-start">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              if (modeRef.current === "play") bombQueued.current = true;
            }}
            disabled={mode !== "play" || (campaign !== 3 && bombs <= 0)}
            aria-label={campaign === 3 ? (lang === "ms" ? "Tolakan Kinetik" : "Kinetic Push") : labels.bomb}
            onClick={campaign === 3 ? e => { if (e.detail === 0) onBomb(); } : undefined}
            className="flex h-11 touch-none select-none items-center justify-center rounded-full bg-navy px-5 text-[12px] font-bold text-amber-400 transition-colors active:bg-amber-400 active:text-navy disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            {campaign === 3 ? (lang === "ms" ? "Tolakan Kinetik · B" : "Kinetic Push · B") : `${labels.bomb} × ${bombs}`}
          </button>
          {campaign !== 3 && <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              if (modeRef.current === "play") nukeQueued.current = true;
            }}
            disabled={mode !== "play" || nukes <= 0}
            className="flex h-11 touch-none select-none items-center justify-center rounded-full bg-red-600 px-4 text-[12px] font-bold text-white transition-colors active:bg-amber-400 active:text-navy disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            {labels.nuke} × {nukes}
          </button>}
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
        <p className="text-[12px] font-semibold leading-snug text-neutral-500">
          {campaign === 3
            ? touch
              ? (lang === "ms" ? "Seret di mana-mana pada game untuk terbang, dan pusing telefon ke tepi untuk skrin penuh. Ketik Tolakan Kinetik bila sedia." : "Drag anywhere on the game to fly, and turn your phone sideways for full screen. Tap Kinetic Push when ready.")
              : (lang === "ms" ? "Anak panah / WASD: terbang. Tembakan auto & torpedo plasma. B: Tolakan Kinetik (tolak musuh & peluru)." : "Arrows / WASD: fly. Auto-fire & plasma torpedo. B: Kinetic Push (repel enemies & fire).")
            : touch ? labels.touchHint : labels.hint}
        </p>
        <details className="col-start-2 text-[12px] leading-relaxed text-neutral-600">
          <summary className="w-fit cursor-pointer rounded-md py-0.5 font-bold text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">{labels.help}</summary>
          <p className="pt-2">{labels.guide}</p>
        </details>
      </div>
      )}
    </div>,
        host,
      )}
    </div>
  );
}

/* The buttons for a phone or a tablet; the finger dragged across the game is the stick. Held
   upright they sit in a row under the game. Sideways the game fills the screen ("screen": the
   buttons are a column in the rail at the right of the screen, clear of the game and of the
   notch), or, on a laptop with a touch screen, over the game's corner ("stage"). Space 3 has the one button, Kinetic Push, in place of the bomb and the nuke. */
function TouchControls({
  variant,
  campaign,
  lang,
  labels,
  bombs,
  nukes,
  mode,
  canPause,
  readStatus,
  onBomb,
  onNuke,
  onPause,
}: {
  variant: "below" | "stage" | "screen";
  campaign: 1 | 2 | 3;
  lang: "en" | "ms";
  labels: SpaceLabels;
  bombs: number;
  nukes: number;
  mode: Mode;
  canPause: boolean;
  readStatus: () => FlightControlsStatus | null;
  onBomb: () => void;
  onNuke: () => void;
  onPause: () => void;
}) {
  const over = variant === "stage";
  const screen = variant === "screen";
  const playing = mode === "play";
  const round = `flex touch-none select-none flex-col items-center justify-center rounded-full text-[10px] font-extrabold leading-tight shadow-md transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${over ? "h-12 w-12" : screen ? "h-14 w-14" : "h-16 w-16"}`;
  const press = (fn: () => void) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fn();
  };
  const buttons = campaign === 3 ? (
    <KineticPushButton readStatus={readStatus} playing={playing} onPush={onBomb} lang={lang} className={over ? "h-12 w-12" : screen ? "h-14 w-14" : ""} />
  ) : (
    <>
      <button
        type="button"
        data-space-controls
        aria-label={labels.bomb}
        disabled={!playing || bombs <= 0}
        onPointerDown={press(onBomb)}
        className={`${round} ${over || screen ? "bg-navy/75 ring-1 ring-white/25" : "bg-navy"} text-amber-400 active:bg-amber-400 active:text-navy`}
      >
        <span>{labels.bomb}</span>
        <span className="tabular-nums">×{bombs}</span>
      </button>
      <button
        type="button"
        data-space-controls
        aria-label={labels.nuke}
        disabled={!playing || nukes <= 0}
        onPointerDown={press(onNuke)}
        className={`${round} ${over || screen ? "bg-red-600/80 ring-1 ring-white/25" : "bg-red-600"} text-white active:bg-amber-400 active:text-navy`}
      >
        <span>{labels.nuke}</span>
        <span className="tabular-nums">×{nukes}</span>
      </button>
    </>
  );

  if (screen) {
    return <div className="absolute bottom-[max(8px,env(safe-area-inset-bottom))] right-[max(8px,env(safe-area-inset-right))] z-20 flex flex-col-reverse items-center gap-3">{buttons}</div>;
  }

  const pause = (
    <button
      type="button"
      data-space-controls
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
        <div className="absolute bottom-3 right-3 flex gap-2.5">{buttons}</div>
        <div className="absolute right-3 top-8">{pause}</div>
      </>
    );
  }
  return (
    <div className="flex items-center justify-between gap-3 px-1 pb-1">
      {pause}
      <div className="flex gap-3">{buttons}</div>
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
    <div className="flex w-full max-w-sm flex-col items-center gap-2">
      <dl className="grid w-full grid-cols-3 gap-x-3 gap-y-1.5">
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

      {/* Arcade Medals / Accolades */}
      {r.medals && r.medals.length > 0 && (
        <div className="mt-1 flex flex-wrap justify-center gap-1.5">
          {r.medals.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-1.5 rounded-full border bg-black/50 px-2.5 py-0.5 shadow-sm backdrop-blur-xs"
              style={{ borderColor: `${m.color}90` }}
            >
              <span className="text-[12px]">{m.icon}</span>
              <div className="flex flex-col text-left">
                <span className="text-[9.5px] font-black uppercase tracking-wider" style={{ color: m.color }}>
                  {m.name}
                </span>
                <span className="text-[8px] font-medium text-white/70">{m.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Drawing. */

type FloatingText = {
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  crit?: boolean;
};

type Debris = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  w: number;
  h: number;
  color: string;
  life: number;
  maxLife: number;
};

/* What the readouts remember between frames: the typeface, and the pale strip
   on the boss's bar that trails behind the damage just done. */
type Hud = {
  font: string;
  trail: number;
  bossId: number;
  frame: number;
  combo?: number;
  comboTimer?: number;
  maxCombo?: number;
  floatingTexts?: FloatingText[];
  debris?: Debris[];
  crt?: boolean;
};

const GUN_COLOR: Record<Exclude<Gun, "blaster">, string> = { machine: "#fb923c", spread: "#a3e635", laser: "#22d3ee", torpedo: "#f87171", icebomb: "#7dd3fc", flame: "#f97316", katana: "#e2e8f0", minirocket: "#84cc16", hyperbeam: "#67e8f9" };
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
  /* Space 1/2 encounters show live attacks, without predictive overlays. */
  const blind = hidesTells(s);
  for (const h of s.hazards) {
    if (blind && hazardWarning(h)) continue;
    if (!drawAct2Hazard(ctx, h, s, reduceMotion) && !drawSecondHazard(ctx, h, reduceMotion) && !drawBossHazard(ctx, h, reduceMotion)) drawHazard(ctx, h, s, reduceMotion);
  }
  drawGust(ctx, s, reduceMotion);
  drawLands(ctx, s);
  for (const bm of s.beams) if (!blind || bm.t >= bm.warn) { if (!drawAct2Beam(ctx, bm, s, reduceMotion)) drawBeam(ctx, bm, f, reduceMotion); }
  for (const c of s.charges) drawZone(ctx, c, reduceMotion, blind);
  for (const k of s.pickups) drawPickup(ctx, k.x, k.y, k.kind, k.t);
  drawWarp(ctx, s, warpPower(s), reduceMotion);
  for (const e of s.enemies) {
    drawSpaceEnemy(ctx, e, s, reduceMotion);
    drawBossShield(ctx, e, reduceMotion);
  }
  drawTimedBombs(ctx, s, reduceMotion);
  drawLumenWing(ctx, s, reduceMotion);
  drawOuterField(ctx, s, reduceMotion);
  drawResonanceEffects(ctx, s, reduceMotion);
  for (const b of s.bullets) if (!drawThirdBullet(ctx, b, s, reduceMotion) && !drawSecondBullet(ctx, b) && !drawBossBullet(ctx, b) && !drawSeedBullet(ctx, b, reduceMotion) && !drawWeaponBullet(ctx, b, reduceMotion)) drawBullet(ctx, b);
  drawSmoke(ctx, s);
  if (hud.debris && hud.debris.length > 0) {
    ctx.save();
    for (const d of hud.debris) {
      const a = Math.min(1, (d.life / d.maxLife) * 1.5);
      ctx.globalAlpha = a;
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      ctx.fillStyle = d.color;
      ctx.fillRect(-d.w / 2, -d.h / 2, d.w, d.h);
      ctx.strokeStyle = "rgb(15 23 42 / 0.85)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-d.w / 2, -d.h / 2, d.w, d.h);
      ctx.restore();
    }
    ctx.restore();
  }
  drawKite(ctx, s, reduceMotion);
  drawPlayer(ctx, s, reduceMotion);
  drawRepair(ctx, s, reduceMotion);
  drawChill(ctx, s, reduceMotion);
  drawShieldFlash(ctx, s, reduceMotion);
  drawMorph(ctx, s, reduceMotion);
  drawSlash(ctx, s, reduceMotion);
  drawBloom(ctx, s, reduceMotion);
  drawHyper(ctx, s, reduceMotion);
  if (launching) drawLaunchOverlay(ctx, s, labels.launch, reduceMotion);

  drawBursts(ctx, s.bursts);
  drawWarheads(ctx, s, reduceMotion);
  drawNuke(ctx, s, reduceMotion);

  // Heavy Bomb Blast Shockwave & Refraction Bloom
  if (s.bombFlash > 0 && !reduceMotion) {
    const flashRatio = s.bombFlash / 14;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const shockR = (1 - flashRatio) * (W * 0.7);
    const grad = ctx.createRadialGradient(s.p.x, s.p.y, shockR * 0.4, s.p.x, s.p.y, shockR);
    grad.addColorStop(0, `rgb(255 255 255 / ${flashRatio * 0.7})`);
    grad.addColorStop(0.5, `rgb(251 191 36 / ${flashRatio * 0.4})`);
    grad.addColorStop(1, "rgb(239 68 68 / 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(s.p.x, s.p.y, shockR, 0, Math.PI * 2);
    ctx.fill();

    // Supersonic expansion shockwave ring
    ctx.strokeStyle = `rgb(255 255 255 / ${flashRatio * 0.9})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(s.p.x, s.p.y, shockR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = `rgb(255 255 255 / ${flashRatio * 0.75})`;
    ctx.fillRect(0, 0, W, H);
  }

  // Heavy Screen Shake RGB Chromatic Aberration & Horizontal Glitch Slices
  if (s.shake > 2 && !reduceMotion) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const glitchIntensity = Math.min(1, s.shake / 8);
    for (let i = 0; i < 3; i++) {
      const bandY = (s.frame * 43 + i * 71) % (H - 20);
      const bandH = 6 + i * 4;
      const shift = (((s.frame * 17 + i * 29) % 7) - 3) * glitchIntensity;
      ctx.fillStyle = `rgb(34 211 238 / ${0.14 * glitchIntensity})`;
      ctx.fillRect(shift, bandY, W, bandH);
      ctx.fillStyle = `rgb(244 63 94 / ${0.14 * glitchIntensity})`;
      ctx.fillRect(-shift, bandY, W, bandH);
    }
    ctx.restore();
  }
  ctx.restore();

  // Floating Damage Numbers & Combat Juice
  if (hud.floatingTexts && hud.floatingTexts.length > 0) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const ft of hud.floatingTexts) {
      const u = ft.life / ft.maxLife;
      const a = Math.min(1, u * 2.2);
      ctx.globalAlpha = a;
      ctx.font = ft.crit ? `900 ${ft.size}px ${font}` : `800 ${ft.size}px ${font}`;
      ctx.fillStyle = "rgb(0 0 0 / 0.85)";
      ctx.fillText(ft.text, ft.x + 0.8, ft.y + 0.8);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      if (ft.crit) {
        ctx.strokeStyle = "rgb(255 255 255 / 0.85)";
        ctx.lineWidth = 0.6;
        ctx.strokeText(ft.text, ft.x, ft.y);
      }
    }
    ctx.restore();
  }

  if (!launching) {
    drawHud(ctx, s, labels, hud);

    // Arcade Combo Counter HUD
    if (hud.combo && hud.combo >= 2 && hud.comboTimer && hud.comboTimer > 0 && mode === "play") {
      const combo = hud.combo;
      const gauge = hud.comboTimer / 135;
      const comboColor = combo >= 15 ? "#f43f5e" : combo >= 8 ? "#f97316" : combo >= 4 ? "#eab308" : "#38bdf8";
      const pulse = 1 + (f % 10 < 5 ? 0.08 : 0);

      ctx.save();
      ctx.textAlign = "right";
      ctx.fillStyle = "rgb(11 15 28 / 0.88)";
      ctx.beginPath();
      ctx.roundRect(W - 84, 28, 76, 20, 4);
      ctx.fill();
      ctx.strokeStyle = comboColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = `900 ${10.5 * pulse}px ${font}`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${combo}x`, W - 46, 39);
      ctx.font = `900 7px ${font}`;
      ctx.fillStyle = comboColor;
      ctx.fillText(combo >= 15 ? "ULTRA!" : combo >= 8 ? "SUPER!" : "COMBO", W - 12, 39);

      ctx.fillStyle = "rgb(255 255 255 / 0.15)";
      ctx.fillRect(W - 80, 44, 68, 2);
      ctx.fillStyle = comboColor;
      ctx.fillRect(W - 80, 44, 68 * gauge, 2);
      ctx.restore();
    }
  }

  ctx.save();
  ctx.textAlign = "center";
  /* Words in the scene stay out from under the overlays' own. */
  if (s.callout && (mode === "play" || mode === "talk") && !(blind && ["c4", "ultimate"].includes(s.callout.kind))) {
    const c = s.callout;
    const a = Math.min(1, c.t / 25, (150 - c.t) / 10);
    if (c.kind === "warning") {
      const bossName = (s.bossId !== 0 ? labels.bossNames[s.chapter - 1] : "") ?? "";
      const pulse = reduceMotion ? 1 : 0.5 + 0.5 * Math.sin(f * 0.22);
      ctx.globalAlpha = Math.max(0, a);

      // Red alert wash across scene
      ctx.fillStyle = `rgb(220 38 38 / ${0.14 * pulse})`;
      ctx.fillRect(0, 0, W, H);

      // Danger hazard banner
      const top = 50;
      const bH = 50;
      ctx.fillStyle = "rgb(11 15 28 / 0.92)";
      ctx.fillRect(0, top, W, bH);
      ctx.fillStyle = "rgb(239 68 68 / 0.85)";
      ctx.fillRect(0, top, W, 1);
      ctx.fillRect(0, top + bH - 1, W, 1);

      // Sliding hazard stripes
      const stripeW = 8;
      const shift = reduceMotion ? 0 : (f * 1.5) % (stripeW * 2);
      for (const ry of [top - 4, top + bH]) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, ry, W, 4);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, ry, W, 4);
        ctx.clip();
        ctx.fillStyle = f % 12 < 6 ? "#facc15" : "#f87171";
        for (let sx = -stripeW * 2 + shift; sx < W + stripeW * 2; sx += stripeW * 2) {
          ctx.beginPath();
          ctx.moveTo(sx, ry);
          ctx.lineTo(sx + stripeW, ry);
          ctx.lineTo(sx + stripeW - 3, ry + 4);
          ctx.lineTo(sx - 3, ry + 4);
          ctx.fill();
        }
        ctx.restore();
      }

      // Warning text
      ctx.font = `900 18px ${font}`;
      ctx.fillStyle = f % 8 < 4 ? "#ff3355" : "#fbbf24";
      ctx.fillText("⚠  WARNING  ⚠", W / 2, top + 18);

      ctx.font = `800 8px ${font}`;
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("HOSTILE CLASSIFIED TITAN DETECTED", W / 2, top + 31);

      if (bossName) {
        ctx.font = `900 11px ${font}`;
        ctx.fillStyle = "#fecdd3";
        ctx.fillText(`//  ${bossName.toUpperCase()}  //`, W / 2, top + 44);
      }
      ctx.globalAlpha = 1;
    } else {
      const resonanceAbility = !!s.res && (c.kind === "shield" || c.kind === "overload");
      const text = resonanceAbility ? c.kind === "shield" ? "Kinetic Barrier" : "Overdrive" : labels.callouts[c.kind];
      const callY = resonanceAbility ? 37 : 72;
      const loud = !resonanceAbility && (c.kind === "overload" || c.kind === "c4");
      ctx.globalAlpha = Math.max(0, a);
      ctx.font = resonanceAbility ? `800 9px ${font}` : loud ? `800 24px ${font}` : `800 18px ${font}`;
      ctx.fillStyle = "rgb(0 0 0 / 0.55)";
      ctx.fillText(text, W / 2 + 1.5, callY + 1.5);
      ctx.fillStyle = resonanceAbility ? c.kind === "shield" ? "#5eead4" : "#fbcf33" : loud ? (f % 10 < 5 ? "#ff4d4d" : "#ffd24d") : ["levelup", "hypersonic", "mechshield", "launcher", "repair", "hq", "power"].includes(c.kind) ? "#fde047" : c.kind === "phase" ? "#fdba74" : "#7dd3fc";
      ctx.fillText(text, W / 2, callY);
      ctx.globalAlpha = 1;
    }
  }

  /* Only campaigns that retain prediction labels name an upcoming attack. */
  const boss = s.enemies.find((e) => isBoss(e.type)) ?? s.enemies.find((e) => isMini(e.type) && e.x < W);
  const move = boss?.attack;
  if (boss && move && move.t < move.warn && mode === "play" && !hidesTells(s)) {
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

  drawResonanceHUD(ctx, s, font, reduceMotion);
  drawKineticWave(ctx, s, reduceMotion);
  drawModeTag(ctx, s, font);
  drawHints(ctx, s, font);

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

  /* Critical Low-HP Crimson Danger Pulse */
  const maxHp = maxLife(s.p);
  const hpRatio = s.p.hp / maxHp;
  if (hpRatio < 0.32 && s.phase === "play" && mode === "play") {
    const pulse = reduceMotion ? 0.3 : (Math.sin(f * 0.16) + 1) * 0.5;
    const dangerAlpha = Math.max(0, (0.16 + 0.22 * pulse) * (1 - hpRatio / 0.32));
    const grad = ctx.createRadialGradient(W / 2, H / 2, W * 0.3, W / 2, H / 2, W * 0.72);
    grad.addColorStop(0, "rgb(239 68 68 / 0)");
    grad.addColorStop(0.65, `rgb(239 68 68 / ${dangerAlpha * 0.35})`);
    grad.addColorStop(1, `rgb(220 38 38 / ${dangerAlpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  /* Retro CRT scanlines and subtle dark vignette */
  if (hud.crt) {
    ctx.fillStyle = "rgb(0 0 0 / 0.06)";
    for (let y = 0; y < H; y += 3) {
      ctx.fillRect(0, y, W, 1);
    }
    const crtVig = ctx.createRadialGradient(W / 2, H / 2, W * 0.44, W / 2, H / 2, W * 0.74);
    crtVig.addColorStop(0, "rgb(0 0 0 / 0)");
    crtVig.addColorStop(1, "rgb(2 6 23 / 0.28)");
    ctx.fillStyle = crtVig;
    ctx.fillRect(0, 0, W, H);
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
  /* The same scale as the health bar, so the 50 shield is half its length. */
  const shield = Math.round(maxShield(p) * 0.7);
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
  ctx.fillStyle = "rgb(255 255 255 / 0.14)";
  ctx.fillRect(x, 18, 26, 2.5);
  ctx.fillStyle = "#fbbf24";
  /* The experience gauge: every enemy destroyed fills it, 100 points a level. */
  ctx.fillRect(x, 18, 26 * xpGauge(s.p), 2.5);

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

  /* Bloom's energy, while it has any, under the gun. */
  if (s.p.bloom > 0) {
    ctx.fillStyle = "rgb(255 255 255 / 0.14)";
    ctx.fillRect(x, 16, 60, 2.5);
    ctx.fillStyle = "#5eead4";
    ctx.fillRect(x, 16, 60 * Math.min(1, s.p.bloom / BLOOM.max), 2.5);
  }

  const boss = s.enemies.find((e) => isBoss(e.type));
  if (boss) {
    const w = 150;
    const bx = W - w - 8;
    const share = Math.max(0, boss.hp) / boss.maxHp;
    const isEnraged = share < 0.35;
    if (hud.bossId !== boss.id) {
      hud.bossId = boss.id;
      hud.trail = share;
    }
    if (hud.frame !== s.frame) {
      hud.frame = s.frame;
      hud.trail = Math.max(share, hud.trail - 0.004);
    }
    ctx.textAlign = "left";
    const bossName = (labels.bossNames[s.chapter - 1] ?? "").toUpperCase();
    ctx.fillStyle = isEnraged ? "#fca5a5" : "#fecdd3";
    ctx.fillText(bossName, bx, 8.5);

    if (isEnraged) {
      ctx.fillStyle = s.frame % 20 < 10 ? "#ef4444" : "#fbbf24";
      ctx.fillText(" ⚠ OVERDRIVE", bx + ctx.measureText(bossName).width + 3, 8.5);

      ctx.fillStyle = s.frame % 16 < 8 ? "rgb(239 68 68 / 0.28)" : "rgb(239 68 68 / 0.1)";
      ctx.fillRect(bx - 3, 11, w + 6, 11);
    }

    ctx.fillStyle = "rgb(255 255 255 / 0.14)";
    ctx.fillRect(bx, 14, w, 5);
    ctx.fillStyle = "rgb(255 255 255 / 0.55)";
    ctx.fillRect(bx, 14, w * hud.trail, 5);

    if (isEnraged) {
      const g = ctx.createLinearGradient(bx, 0, bx + w * share, 0);
      g.addColorStop(0, "#ef4444");
      g.addColorStop(1, s.frame % 10 < 5 ? "#fb923c" : "#f87171");
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = "#ff4d6d";
    }
    ctx.fillRect(bx, 14, w * share, 5);

    if (isEnraged && share > 0.02) {
      ctx.fillStyle = "#ffffff";
      const sparkX = bx + w * share;
      const sparkY = 14 + (s.frame % 5);
      ctx.fillRect(sparkX - 1, sparkY - 0.5, 2, 2);
    }
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
