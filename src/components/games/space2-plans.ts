/* The eight chapters of Space 2, as scripts: when each enemy and obstacle turns up, in frames at 60
   a second. They are chapters 9 to 16 of the same engine and play like Space 1's: the boss follows
   once the list has run out and the screen is nearly clear. Earth Force flies the same machines
   Space 1 knew, so the enemies are the existing kinds; what changes is the mix, the places they
   stand (the sea, the ground, the air) and the hazards.

   Space 2 grows the ship by experience (see XP in space-logic), so the scripts carry plenty of small
   things to shoot as well as the big ones. */
import type { EType, HKind } from "./space-logic";

export type Plan = { t: number; type: EType | HKind; y: number; a?: number; x?: number; g?: number[] };

const H = 216;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export class Script {
  out: Plan[] = [];
  add(t: number, type: EType, y = 0, a = 0) {
    this.out.push({ t, type, y: clamp(y, 18, H - 18), a });
  }
  /* A V of ships, the leader first. */
  vee(t: number, type: EType, cy: number, n = 3, gap = 16) {
    const mid = (n - 1) / 2;
    for (let i = 0; i < n; i++) this.add(t + Math.round(Math.abs(i - mid) * gap), type, cy + (i - mid) * 22);
  }
  line(t: number, type: EType, y: number, n: number, gap: number, dy = 0) {
    for (let i = 0; i < n; i++) this.add(t + i * gap, type, y + i * dy);
  }
  swarm(t: number, y: number, n = 7) {
    for (let i = 0; i < n; i++) this.add(t + i * 9, "swarm", y, i * 0.8);
  }
  each(list: number[][], type: EType) {
    for (const [t, y] of list) this.add(t, type, y);
  }
  ground(t: number, type: EType, n = 1, gap = 70) {
    for (let i = 0; i < n; i++) this.add(t + i * gap, type);
  }
  flare(t: number, x: number) {
    this.out.push({ t, type: "flare", y: 0, x });
  }
  gate(t: number, y: number) {
    this.out.push({ t, type: "gate", y, g: [y] });
  }
  /* A big rock standing out of the sea, `tall` above the water and `w` wide. */
  rock(t: number, tall: number, w: number) {
    this.out.push({ t, type: "perch", y: tall, g: [w] });
  }
  wall(t: number, g1: number, g2: number) {
    this.out.push({ t, type: "wall", y: 0, g: [g1, g2] });
  }
  done() {
    return this.out.sort((a, b) => a.t - b.t);
  }
  /* The script with every `nth` enemy left out (supply pods, rocks and hazards stay), for a chapter
     that would otherwise crowd the screen. */
  thinned(nth: number) {
    let k = 0;
    return this.done().filter((p) => ["pod", "perch", "flare", "gate", "wall"].includes(p.type) || ++k % nth !== 0);
  }
}

/* 1. Re-entry over the Pacific: Earth Force's fleet and its air cover. */
function pacific() {
  const c = new Script();
  for (let k = 0; k < 9; k++) {
    c.add(150 + k * 320, "gunboat");
    if (k % 2) c.add(150 + k * 320 + 90, "gunboat");
  }
  for (const t of [1300, 2300]) c.add(t, "destroyer");
  for (let k = 0; k < 5; k++) c.vee(240 + k * 600, "jet", 36 + ((k * 41) % 90), 3, 18);
  c.each([[1500, 80], [2700, 70]], "gunship");
  c.each([[800, 40], [2100, 50]], "airbomber");
  c.swarm(1100, 120); c.swarm(2400, 70);
  for (const t of [550, 1200, 1800, 2450, 2950]) c.add(t, "sub");
  for (const [t, tall, w] of [[380, 46, 40], [1000, 62, 56], [1650, 38, 34], [2600, 56, 48]]) c.rock(t, tall, w);
  for (const t of [700, 2100]) c.add(t, "aagun");
  c.add(1450, "samsite");
  c.each([[420, 110], [2250, 120]], "pod");
  /* A fifth fewer enemies than the script names, so the opening chapter is not crowded. */
  return c.thinned(5);
}

/* 2. The archipelago in the monsoon: boats up the river mouths and jets out of the rain. */
function archipelago() {
  const c = new Script();
  for (let k = 0; k < 10; k++) {
    c.add(140 + k * 300, "gunboat");
    if (k % 3 === 1) c.add(140 + k * 300 + 80, "gunboat");
  }
  for (const t of [1100, 2000, 2800]) c.add(t, "destroyer");
  for (let k = 0; k < 5; k++) c.vee(200 + k * 620, "jet", 30 + ((k * 53) % 100), 3, 20);
  c.each([[1400, 90], [2600, 80]], "gunship");
  c.each([[1700, 60]], "airbomber");
  c.each([[620, 100], [1100, 60], [1560, 150], [2050, 110], [2480, 90], [2900, 60], [3200, 130]], "mine");
  c.swarm(1000, 100); c.swarm(2300, 140);
  for (const t of [400, 1050, 1650, 2350, 3000]) c.add(t, "sub");
  for (const [t, tall, w] of [[300, 40, 36], [900, 58, 52], [1800, 48, 44], [2750, 64, 58]]) c.rock(t, tall, w);
  for (const t of [600, 1500, 2500]) c.add(t, "aagun");
  c.add(2000, "samsite");
  c.each([[450, 130], [2200, 110]], "pod");
  return c.done();
}

/* 3. The Himalayan blizzard: ice falls from the cliffs, and the guns sit on the ledges. */
function himalaya() {
  const c = new Script();
  for (let k = 0; k < 6; k++) {
    const t = 240 + k * 480;
    for (let i = 0; i < 5; i++) {
      c.out.push({ t: t + i * 14, type: "shard", y: 6 + ((i * 29) % 70), a: 0 });
      c.out.push({ t: t + i * 14 + 7, type: "shard", y: H - 6 - ((i * 31) % 70), a: 1 });
    }
  }
  c.ground(300, "aagun", 2, 140); c.ground(1500, "aagun", 2, 160); c.ground(2600, "aagun", 2, 140);
  c.ground(700, "bunker", 1); c.ground(1900, "bunker", 1); c.ground(2900, "bunker", 1);
  c.ground(1100, "samsite"); c.ground(2300, "samsite");
  for (let k = 0; k < 6; k++) c.vee(180 + k * 500, "fighter", 40 + ((k * 61) % 110), 3);
  c.each([[900, 90], [1800, 60], [2700, 130]], "sniper");
  c.each([[1400, 150], [2600, 90]], "gunship");
  c.wall(1000, 66, 156); c.wall(2000, 54, 150); c.wall(3000, 70, 160);
  c.swarm(1250, 120); c.swarm(2450, 80);
  c.each([[470, 120], [2350, 110]], "pod");
  return c.done();
}

/* 4. The Sahara in a sandstorm: tanks on the dunes, guns dug in, jets that come out of the haze. */
function sahara() {
  const c = new Script();
  for (const [t, n] of [[250, 2], [900, 3], [1600, 3], [2300, 3], [2950, 2]]) c.ground(t, "tank", n, 60);
  for (const t of [500, 1200, 1900, 2600]) c.ground(t, "aagun");
  for (const t of [800, 2100]) c.ground(t, "bunker");
  for (const t of [1000, 2400]) c.ground(t, "samsite");
  for (let k = 0; k < 6; k++) c.vee(200 + k * 500, "jet", 36 + ((k * 47) % 100), 2, 22);
  c.each([[1500, 90], [2700, 80]], "gunship");
  c.each([[2000, 60]], "airbomber");
  c.each([[600, 100], [1300, 70], [1900, 120], [2200, 140], [2800, 90]], "armor");
  c.swarm(1000, 110); c.swarm(1800, 70); c.swarm(2400, 130);
  c.flare(550, 130); c.flare(1250, 200); c.flare(1950, 100); c.flare(2650, 160);
  c.each([[420, 110], [2350, 100]], "pod");
  return c.done();
}

/* 5. The alpine corridor at dusk: the missile grid, marked column by marked column. */
function alps() {
  const c = new Script();
  for (const t of [350, 800, 1250, 1700, 2150, 2600, 3050]) c.flare(t, 100 + ((t * 7) % 110));
  for (const t of [300, 1000, 1700, 2400]) c.ground(t, "samsite");
  for (const t of [600, 1400, 2200, 3000]) c.ground(t, "aagun");
  for (const [t, n] of [[500, 2], [1500, 3], [2500, 3]]) c.ground(t, "tank", n, 60);
  for (const t of [900, 2000]) c.ground(t, "bunker");
  for (let k = 0; k < 6; k++) c.vee(220 + k * 500, "fighter", 40 + ((k * 59) % 110), 3);
  c.each([[760, 100], [1560, 60], [2360, 150], [3160, 90]], "sniper");
  c.each([[1100, 70], [2000, 150], [2900, 100]], "orbiter");
  c.add(1800, "cruiser", 90);
  c.each([[650, 70], [1450, 160], [2250, 70], [3050, 150]], "bomber");
  c.swarm(1200, 120); c.swarm(2800, 90);
  c.each([[450, 120], [2300, 130]], "pod");
  return c.done();
}

/* 6. The Arctic shelf under the aurora: boats between the floes, ice coming down. */
function arctic() {
  const c = new Script();
  for (let k = 0; k < 7; k++) c.add(160 + k * 420, "gunboat");
  for (const t of [1400, 2800]) c.add(t, "destroyer");
  for (let k = 0; k < 5; k++) {
    const t = 300 + k * 560;
    for (let i = 0; i < 4; i++) c.out.push({ t: t + i * 16, type: "shard", y: 8 + ((i * 37) % 60), a: 0 });
  }
  for (let k = 0; k < 5; k++) c.vee(240 + k * 600, "fighter", 36 + ((k * 43) % 110), 3);
  c.each([[1500, 90], [2800, 80]], "gunship");
  c.each([[1800, 140], [2700, 100]], "armor");
  c.each([[700, 60], [1000, 100], [1600, 140], [2000, 70], [2500, 50], [3100, 130]], "splitter");
  c.wall(800, 62, 158); c.wall(1700, 52, 150); c.wall(2600, 72, 162);
  c.swarm(1100, 130); c.swarm(2300, 80);
  for (const t of [500, 1300, 2200, 3050]) c.add(t, "sub");
  for (const [t, tall, w] of [[350, 44, 50], [1050, 60, 44], [1900, 36, 60], [2700, 54, 40]]) c.rock(t, tall, w);
  for (const t of [800, 2200]) c.add(t, "aagun");
  c.add(1550, "samsite");
  c.each([[440, 120], [2250, 110]], "pod");
  return c.done();
}

/* 7. The hurricane's eye: Earth Force's carriers circle it, and lightning walks the columns. */
function hurricane() {
  const c = new Script();
  for (let k = 0; k < 5; k++) c.add(160 + k * 600, "gunboat");
  for (const t of [1400, 2800]) c.add(t, "destroyer");
  for (let k = 0; k < 9; k++) c.vee(200 + k * 340, "jet", 30 + ((k * 51) % 120), 3, 18);
  for (const t of [400, 900, 1400, 1900, 2400, 2900, 3300]) c.flare(t, 90 + ((t * 11) % 130));
  c.each([[1300, 90], [2900, 80]], "gunship");
  c.each([[800, 50], [2500, 50]], "airbomber");
  c.each([[1100, 100], [2000, 140], [3000, 80]], "orbiter");
  c.each([[1700, 70]], "seeker");
  c.add(2100, "cruiser", 100);
  c.swarm(1200, 100); c.swarm(2200, 140);
  for (const t of [450, 1300, 2100, 2950]) c.add(t, "sub");
  for (const [t, tall, w] of [[320, 52, 42], [980, 40, 38], [1850, 64, 54], [2650, 46, 46]]) c.rock(t, tall, w);
  for (const t of [650, 2050]) c.add(t, "aagun");
  c.add(1400, "samsite");
  c.each([[430, 110], [2200, 120]], "pod");
  return c.done();
}

/* 8. Meridian Citadel at dawn: the whole of Earth Force's guard on the walls, and every kind of obstacle. */
function citadel() {
  const c = new Script();
  for (const [t, n] of [[250, 2], [900, 3], [1600, 3], [2300, 3]]) c.ground(t, "tank", n, 55);
  for (const t of [500, 1100, 1800, 2500, 3100]) c.ground(t, "aagun");
  for (const t of [700, 1500, 2200, 2900]) c.ground(t, "bunker");
  for (const t of [400, 1300, 2100, 3000]) c.ground(t, "samsite");
  for (let k = 0; k < 6; k++) c.vee(180 + k * 520, "fighter", 36 + ((k * 49) % 120), 3);
  for (let k = 0; k < 6; k++) c.vee(300 + k * 520, "jet", 50 + ((k * 37) % 100), 3, 18);
  c.gate(600, 100); c.gate(1400, 130); c.gate(2200, 80); c.gate(3000, 120);
  c.wall(1000, 60, 156); c.wall(1800, 52, 150); c.wall(2600, 70, 160);
  c.each([[850, 70], [1700, 150], [2500, 100], [3300, 90]], "orbiter");
  c.each([[1000, 90], [2000, 140], [3100, 100]], "armor");
  c.add(1300, "cruiser", 70); c.add(2400, "cruiser", 140);
  c.each([[900, 90], [1900, 60], [2800, 130]], "gunship");
  c.swarm(1200, 110); c.swarm(2300, 140); c.swarm(3200, 80);
  c.each([[380, 110], [1950, 90]], "pod");
  return c.done();
}

/* Index 0 is Space 2's chapter 1 (the engine's chapter 9). */
/* Each chapter ends with its mini boss, a little after the last of the script. */
const withMini = (plan: Plan[], n: number): Plan[] => [...plan, { t: plan[plan.length - 1].t + 180, type: `mini${n}` as EType, y: 108 }];

export const SECOND_PLANS: Plan[][] = [pacific(), archipelago(), himalaya(), sahara(), alps(), arctic(), hurricane(), citadel()].map((p, i) => withMini(p, i + 9));
