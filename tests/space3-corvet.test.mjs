import assert from "node:assert/strict";
import test from "node:test";
import { H, createState, shipSize, step } from "../src/components/games/space-logic.ts";
import { CORVET, corvetCloaked } from "../src/components/games/space3-boss.ts";
import { GHOST, PHASE, RESONANCE } from "../src/components/games/space3-resonance.ts";

const IDLE = { mx: 0, my: 0, bomb: false };

/* A chapter 17 run already in the air, so the launch does not get in the way. */
function airborne() {
  const s = createState(17);
  s.phase = "play";
  s.p.x = 60;
  s.p.y = H / 2;
  return s;
}
const run = (s, n, input = IDLE) => { for (let i = 0; i < n && s.phase === "play"; i++) step(s, input); };

test("Space 1 and 2 carry no Resonance, and chapter 17 does", () => {
  for (const c of [1, 8, 9, 16]) assert.equal(createState(c).res, null, `chapter ${c}`);
  assert.ok(createState(17).res);
});

test("flying chapter 17 records the ship's path and fires nothing at the ghost until the delay has passed", () => {
  const s = airborne();
  run(s, 60);
  assert.equal(s.res.trail.length, 60);
  run(s, GHOST.delay);
  assert.equal(s.res.trail.length, GHOST.delay + 1);
});

test("a hit in chapter 17 costs Resonance", () => {
  const s = airborne();
  s.enemies.length = 0;
  s.res.meter = 50;
  s.bullets.push({ x: s.p.x + 4, y: s.p.y + 4, vx: 0, vy: 0, r: 3, own: "e", dmg: 1, kind: "pulse" });
  run(s, 2);
  assert.ok(s.res.meter < 50);
  assert.ok(s.res.meter > 0);
});

test("Ghost Corvet cloaks for the last part of every five seconds", () => {
  assert.equal(corvetCloaked(0), false);
  assert.equal(corvetCloaked(CORVET.cloakEvery - CORVET.cloakFor), true);
  assert.equal(corvetCloaked(CORVET.cloakEvery), false);
});

test("Space 3's story for the first chapter is complete, in English, and fits the line limit", async () => {
  const { SPACE3_STORY } = await import("../src/components/games/space3-story.ts");
  const { SPACE3_CHAPTERS, space3ChapterName } = await import("../src/components/games/space3-copy.ts");
  assert.deepEqual(Object.keys(SPACE3_STORY.en).sort(), Object.keys(SPACE3_STORY.ms).sort(), "same scenes in both languages");
  for (const scene of Object.keys(SPACE3_STORY.en)) {
    assert.deepEqual(SPACE3_STORY.en[scene].map((l) => l.who), SPACE3_STORY.ms[scene].map((l) => l.who), `${scene} speaker order`);
    for (const lang of ["en", "ms"]) {
      for (const l of SPACE3_STORY[lang][scene]) {
        assert.ok(l.text.length <= 180, `${scene} (${lang}): ${l.text.length} characters`);
      }
    }
  }
  for (const scene of ["c17-intro", "c17-boss", "c17-outro"]) {
    const lines = SPACE3_STORY.en[scene];
    assert.ok(lines.length >= 3, scene);
    assert.ok(lines.some((l) => l.who === "halo") || scene !== "c17-intro", "Halo flies with Nova");
    for (const l of lines) assert.ok(l.text.length <= 180, `${scene}: ${l.text.length} characters`);
  }
  assert.equal(space3ChapterName(17), "Chapter 1: Phobos Run");
  assert.equal(space3ChapterName(18), "Chapter 2: Ceres Industrial Belts");
  assert.equal(space3ChapterName(19), "Chapter 3: Jovian Cryo-Crags");
  assert.equal(space3ChapterName(20), "Chapter 4: The Kharn Anomaly");
  assert.equal(space3ChapterName(21), "Chapter 5: Uranian Magnetic Shear");
  assert.equal(space3ChapterName(28), "Chapter 12: The Hypergate Horizon");
  assert.equal(space3ChapterName(29), null);
  for (const scene of ["c18-intro", "c18-boss", "c18-outro"]) {
    assert.ok(SPACE3_STORY.en[scene].length >= 3 && SPACE3_STORY.en[scene].some((l) => l.who === "halo"), scene);
    for (const l of SPACE3_STORY.en[scene]) assert.ok(l.text.length <= 180, `${scene}: ${l.text.length}`);
  }
  assert.equal(SPACE3_CHAPTERS[0].boss, "Ghost Corvet");
});

test("chapter 3's scenes bring Vex back, with Halo in each, and fit the line limit", async () => {
  const { SPACE3_STORY } = await import("../src/components/games/space3-story.ts");
  for (const scene of ["c19-intro", "c19-boss", "c19-outro"]) {
    const lines = SPACE3_STORY.en[scene];
    assert.ok(lines.length >= 4 && lines.some((l) => l.who === "halo"), scene);
    for (const l of lines) assert.ok(l.text.length <= 180, `${scene}: ${l.text.length}`);
  }
  const boss = SPACE3_STORY.en["c19-boss"];
  assert.ok(boss.some((l) => l.who === "vex" && /party/.test(l.text)), "Vex arrives in the boss scene");
});

test("chapter 4's scenes bring the field to life: Vex remembers being shot down, Halo and Lumen are in the first, and the outro points to Uranus", async () => {
  const { SPACE3_STORY } = await import("../src/components/games/space3-story.ts");
  for (const scene of ["c20-intro", "c20-boss", "c20-outro"]) {
    const lines = SPACE3_STORY.en[scene];
    assert.ok(lines.length >= 4 && lines.some((l) => l.who === "halo"), scene);
    for (const l of lines) assert.ok(l.text.length <= 180, `${scene}: ${l.text.length}`);
  }
  assert.ok(SPACE3_STORY.en["c20-intro"].some((l) => l.who === "vex" && /shot me down/.test(l.text)));
  assert.ok(SPACE3_STORY.en["c20-intro"].some((l) => l.who === "lumen"));
  assert.ok(SPACE3_STORY.en["c20-outro"].some((l) => /Uranus/.test(l.text)));
});

test("flying close to enemy fire gives nothing: the plasma cell charges by itself and from kills", () => {
  const s = airborne();
  s.enemies.length = 0;
  const size = shipSize(s.p.level);
  s.bullets.push({ x: s.p.x + size.w / 2 + 3 + 2 + 4, y: s.p.y + size.h / 2, vx: 0, vy: 0, r: 2, own: "e", dmg: 1, kind: "pulse" });
  run(s, 3);
  assert.ok(s.res.meter < 1, `meter ${s.res.meter}`);
});
