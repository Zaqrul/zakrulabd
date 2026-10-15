/* The rules and the level of the trap platformer, kept apart from the screen so
   the level can be run by a script and shown to be beatable. A short run from
   left to right across floors that are not what they seem: one pace of 2.3
   pixels a frame, a jump about 80 pixels high and 85 long, and every trap can be
   got past by someone who knows it is there. */
export const VIEW_W = 384;
export const VIEW_H = 192;
export const GROUND = 160;
export const WORLD = 2400;
export const PW = 12;
export const PH = 14;

const GRAVITY = 0.46;
const JUMP = 8.6;
const MAX_RUN = 2.3;
const FALL_CAP = 9;
const DYING_FRAMES = 55;

export type Cause = "pit" | "fakefloor" | "pop" | "block" | "stone" | "rain" | "flag" | "enemy";

export type Thing = {
  id: string;
  kind: "ground" | "fake" | "brick" | "qblock" | "spike" | "stone" | "flag" | "fakeflag" | "checkpoint";
  x: number;
  y: number;
  w: number;
  h: number;
  solid: boolean;
  deadly: boolean;
  visible: boolean;
  vy: number;
  cause?: Cause;
};

export type Walker = { x: number; y: number; min: number; max: number; dir: 1 | -1; alive: boolean };

export type Input = { left: boolean; right: boolean; jump: boolean };

export type State = {
  things: Thing[];
  walkers: Walker[];
  p: { x: number; y: number; vx: number; vy: number; ground: boolean; coyote: number; jumpHeld: boolean; facing: 1 | -1 };
  phase: "playing" | "dying" | "won";
  cause: Cause | null;
  dyingFor: number;
  deaths: number;
  checkpointX: number;
  frame: number;
  /* Which traps have gone off this life. */
  f: { pop: boolean; dropped: boolean; stone: number; rain: number };
};

const ground = (x1: number, x2: number): Thing => ({
  id: `g${x1}`,
  kind: "ground",
  x: x1,
  y: GROUND,
  w: x2 - x1,
  h: VIEW_H - GROUND,
  solid: true,
  deadly: false,
  visible: true,
  vy: 0,
});

function buildThings(): Thing[] {
  const spike = (id: string, x: number, y: number, w: number, h: number, cause: Cause, over: Partial<Thing> = {}): Thing => ({
    id, kind: "spike", x, y, w, h, solid: false, deadly: false, visible: false, vy: 0, cause, ...over,
  });
  return [
    /* The floor, with a gap of at most 60 between pieces. */
    ground(0, 520),
    ground(576, 900),
    ground(960, 1100),
    ground(1148, 1300),
    ground(1356, 1700),
    ground(1756, 2200),
    ground(2256, 2400),

    /* Looks like floor, is not. Sits in the gap between 1100 and 1148. */
    { id: "fake", kind: "fake", x: 1100, y: GROUND, w: 48, h: VIEW_H - GROUND, solid: false, deadly: false, visible: true, vy: 0 },

    /* Spikes that wait under the floor until you are close. */
    spike("pop", 700, GROUND - 14, 16, 14, "pop"),

    /* Three blocks; the middle "?" gives you something, just not a present. */
    { id: "b1", kind: "brick", x: 784, y: 112, w: 16, h: 16, solid: true, deadly: false, visible: true, vy: 0 },
    { id: "q", kind: "qblock", x: 800, y: 112, w: 16, h: 16, solid: true, deadly: false, visible: true, vy: 0 },
    { id: "b2", kind: "brick", x: 816, y: 112, w: 16, h: 16, solid: true, deadly: false, visible: true, vy: 0 },

    /* A ceiling that comes down once you are under it. */
    { id: "stone", kind: "stone", x: 1216, y: 0, w: 32, h: 32, solid: false, deadly: false, visible: true, vy: 0, cause: "stone" },

    /* The halfway flag. */
    { id: "cp", kind: "checkpoint", x: 1380, y: GROUND - 40, w: 6, h: 40, solid: false, deadly: false, visible: true, vy: 0 },

    /* Spikes from the sky, one after another. */
    spike("rain0", 1600, -16, 16, 16, "rain"),
    spike("rain1", 1630, -16, 16, 16, "rain"),
    spike("rain2", 1660, -16, 16, 16, "rain"),

    /* A goal that is not the goal, and the one that is. */
    { id: "fakeflag", kind: "fakeflag", x: 2120, y: GROUND - 64, w: 4, h: 64, solid: false, deadly: true, visible: true, vy: 0, cause: "flag" },
    { id: "flag", kind: "flag", x: 2330, y: GROUND - 64, w: 4, h: 64, solid: false, deadly: false, visible: true, vy: 0 },
  ];
}

function buildWalkers(): Walker[] {
  const w = (min: number, max: number): Walker => ({ x: min + 10, y: GROUND - 12, min, max, dir: 1, alive: true });
  return [w(330, 470), w(1450, 1610), w(1800, 1900), w(1950, 2060)];
}

export function createState(): State {
  return {
    things: buildThings(),
    walkers: buildWalkers(),
    p: { x: 24, y: GROUND - PH, vx: 0, vy: 0, ground: true, coyote: 0, jumpHeld: false, facing: 1 },
    phase: "playing",
    cause: null,
    dyingFor: 0,
    deaths: 0,
    checkpointX: 24,
    frame: 0,
    f: { pop: false, dropped: false, stone: 0, rain: 0 },
  };
}

/* After a death: the level is put back as it was, and the player starts again
   from the last flag reached. */
export function respawn(s: State) {
  s.things = buildThings();
  s.walkers = buildWalkers();
  s.p = { x: s.checkpointX, y: GROUND - PH, vx: 0, vy: 0, ground: true, coyote: 0, jumpHeld: false, facing: 1 };
  s.phase = "playing";
  s.cause = null;
  s.dyingFor = 0;
  s.f = { pop: false, dropped: false, stone: 0, rain: 0 };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Box = { x: number; y: number; w: number; h: number };
const overlap = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
/* Deadly things are judged a little smaller than they are drawn. */
const touches = (p: Box, t: Box, inset = 2) =>
  overlap(p, { x: t.x + inset, y: t.y + inset, w: t.w - inset * 2, h: t.h - inset * 2 });

function die(s: State, cause: Cause) {
  if (s.phase !== "playing") return;
  s.phase = "dying";
  s.cause = cause;
  s.dyingFor = 0;
  s.deaths += 1;
  s.p.vy = -6;
  s.p.vx = 0;
}

const thing = (s: State, id: string) => s.things.find((t) => t.id === id)!;

export function step(s: State, input: Input) {
  s.frame += 1;
  const p = s.p;

  if (s.phase === "dying") {
    p.vy += GRAVITY;
    p.y += p.vy;
    s.dyingFor += 1;
    return;
  }
  if (s.phase !== "playing") return;

  /* Running. */
  if (input.left) {
    p.vx -= 0.42;
    p.facing = -1;
  }
  if (input.right) {
    p.vx += 0.42;
    p.facing = 1;
  }
  if (!input.left && !input.right) p.vx *= 0.78;
  if (Math.abs(p.vx) < 0.05) p.vx = 0;
  p.vx = clamp(p.vx, -MAX_RUN, MAX_RUN);

  /* Jumping: a few frames of grace after leaving an edge, and letting go of the
     button early gives a shorter hop. */
  if (p.ground) p.coyote = 5;
  else if (p.coyote > 0) p.coyote -= 1;
  if (input.jump && !p.jumpHeld && p.coyote > 0) {
    p.vy = -JUMP;
    p.coyote = 0;
    p.ground = false;
  }
  p.jumpHeld = input.jump;
  if (!input.jump && p.vy < -3) p.vy = -3;
  p.vy = Math.min(p.vy + GRAVITY, FALL_CAP);

  const body = (): Box => ({ x: p.x, y: p.y, w: PW, h: PH });

  p.x += p.vx;
  p.x = clamp(p.x, 0, WORLD - PW);
  for (const t of s.things) {
    if (t.solid && overlap(body(), t)) {
      if (p.vx > 0) p.x = t.x - PW;
      else if (p.vx < 0) p.x = t.x + t.w;
      p.vx = 0;
    }
  }

  p.y += p.vy;
  p.ground = false;
  for (const t of s.things) {
    if (t.solid && overlap(body(), t)) {
      if (p.vy > 0) {
        p.y = t.y - PH;
        p.ground = true;
      } else if (p.vy < 0) {
        p.y = t.y + t.h;
        /* The "?" block, hit from below. */
        if (t.id === "q" && !s.f.dropped) {
          s.f.dropped = true;
          t.kind = "brick";
          s.things.push({
            id: "dropspike", kind: "spike", x: t.x, y: t.y + t.h, w: 16, h: 16,
            solid: false, deadly: true, visible: true, vy: 0, cause: "block",
          });
        }
      }
      p.vy = 0;
    }
  }

  /* Traps. */
  const pop = thing(s, "pop");
  if (!s.f.pop && p.x + PW > pop.x - 34 && p.x < pop.x + pop.w + 10) {
    s.f.pop = true;
    pop.visible = true;
    pop.deadly = true;
  }

  const stone = thing(s, "stone");
  if (s.f.stone === 0 && p.x >= stone.x + 10 && p.x < stone.x + stone.w) {
    s.f.stone = 1;
    stone.deadly = true;
  }
  if (s.f.stone === 1) {
    stone.vy = Math.min(stone.vy + 0.9, 11);
    stone.y += stone.vy;
    if (stone.y >= GROUND - stone.h) {
      stone.y = GROUND - stone.h;
      stone.vy = 0;
      stone.deadly = false;
      stone.solid = true;
      s.f.stone = 2;
    }
  }

  if (s.f.rain === 0 && p.x > 1560) s.f.rain = s.frame;
  if (s.f.rain > 0) {
    for (let i = 0; i < 3; i++) {
      const t = thing(s, `rain${i}`);
      /* vy is 0 before it starts, positive while it falls, -1 once it has landed. */
      if (t.vy === 0 && s.frame - s.f.rain >= i * 18) {
        t.vy = 5.5;
        t.visible = true;
        t.deadly = true;
      }
      if (t.vy > 0) {
        t.y += t.vy;
        if (t.y >= GROUND - t.h) {
          t.vy = -1;
          t.visible = false;
          t.deadly = false;
        }
      }
    }
  }

  const dropped = s.things.find((t) => t.id === "dropspike");
  if (dropped && dropped.visible) {
    dropped.vy = Math.min(dropped.vy + 0.5, 7);
    dropped.y += dropped.vy;
    if (dropped.y >= GROUND - dropped.h) {
      dropped.visible = false;
      dropped.deadly = false;
    }
  }

  const cp = thing(s, "cp");
  if (p.x + PW > cp.x) s.checkpointX = Math.max(s.checkpointX, cp.x + 10);

  for (const w of s.walkers) {
    if (!w.alive) continue;
    w.x += w.dir * 0.55;
    if (w.x < w.min) w.dir = 1;
    if (w.x + 14 > w.max) w.dir = -1;
    const box: Box = { x: w.x, y: w.y, w: 14, h: 12 };
    if (overlap(body(), box)) {
      if (p.vy > 0 && p.y + PH - w.y < 9) {
        w.alive = false;
        p.vy = -5.5;
      } else {
        die(s, "enemy");
        return;
      }
    }
  }

  for (const t of s.things) {
    if (t.deadly && touches(body(), t, t.kind === "spike" ? 3 : 0)) {
      die(s, t.cause ?? "pit");
      return;
    }
  }

  if (overlap(body(), thing(s, "flag"))) {
    s.phase = "won";
    return;
  }

  if (p.y > VIEW_H + 24) {
    const mid = p.x + PW / 2;
    die(s, mid > 1100 && mid < 1148 ? "fakefloor" : "pit");
  }
}

export function respawnReady(s: State) {
  return s.phase === "dying" && s.dyingFor >= DYING_FRAMES;
}
