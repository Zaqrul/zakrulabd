/* Field-unit materials only. Bosses retain the default machine palette. */
import { machineKit, MACHINE, type MachinePalette } from "./space2-machine-art";
import { tone } from "./space-material";
import type { Enemy } from "./space-logic";

const palettes: readonly MachinePalette[] = [
  { ...MACHINE, hull: "#66747b", face: "#99aaa9", bevel: "#e0ded0", steel: "#475e69", metal: "#b8c6c8", dark: "#293b46", cream: "#ebe2bb", rust: "#bc754c" },
  { ...MACHINE, hull: "#3b553d", face: "#7e9560", bevel: "#bacb80", steel: "#566c4c", metal: "#a9b58c", dark: "#23392d", cream: "#d2d19b", rust: "#99714b" },
  { ...MACHINE, hull: "#a6cedd", face: "#e1f1ef", bevel: "#f8ffff", steel: "#668da9", metal: "#c3e4ee", dark: "#304c68", cream: "#e2fcff", rust: "#739bae" },
  { ...MACHINE, hull: "#ad8050", face: "#d7b87b", bevel: "#f0d8a0", steel: "#806746", metal: "#cdbd94", dark: "#4d4033", cream: "#f3dba3", rust: "#8e533a" },
  { ...MACHINE, hull: "#56616a", face: "#8c979a", bevel: "#d0cbb2", steel: "#3c454e", metal: "#b1b9bc", dark: "#292d37", cream: "#f1c765", rust: "#bb7549" },
  { ...MACHINE, hull: "#416778", face: "#8fafb6", bevel: "#e5f4ef", steel: "#344b68", metal: "#b0ccd1", dark: "#24354c", cream: "#a4f4d8", rust: "#638b99" },
  { ...MACHINE, hull: "#586779", face: "#8d9baf", bevel: "#c2d5dd", steel: "#3a4d65", metal: "#9cb6c5", dark: "#243345", cream: "#e2ebd8", rust: "#a87a64" },
  { ...MACHINE, hull: "#cbd5db", face: "#f1f0df", bevel: "#fff9e7", steel: "#7b919e", metal: "#b0c7d1", dark: "#334b64", cream: "#ead291", rust: "#b79760" },
];

export function secondPalette(chapter: number): MachinePalette {
  return palettes[chapter - 9] ?? MACHINE;
}

/** Rear fittings stay inside the simulated box, away from forward optics.
 * Small craft get one fitting; larger hulls gain a second material treatment. */
export function drawSecondBiome(ctx: CanvasRenderingContext2D, e: Enemy, chapter: number, time: number) {
  const { x, y, w, h } = e, c = secondPalette(chapter);
  const m = machineKit(ctx, x, y, c);
  const px = w * .68, py = h * .3, large = w >= 24;
  const line = (ax: number, ay: number, bx: number, by: number, fill: string, width = .6) => m.rod(ax * w, ay * h, bx * w, by * h, width, fill);
  switch (chapter) {
    case 9: // Salt-washed naval steel, with an aft snorkel and oxidised belt.
      m.rod(px, py + h * .1, px, h * .12, .8, c.metal);
      m.rod(px, h * .12, px + w * .1, h * .12, 1, c.dark);
      line(.59, .65, .82, .65, c.rust, 1.2);
      if (large) for (const k of [.61, .73, .81]) line(k, .57, k - .02, .72, c.bevel, .45);
      break;
    case 10: // Broken camouflage and a climbing vine with paired leaves.
      m.poly([[w * .6, h * .22], [w * .8, h * .3], [w * .75, h * .4], [w * .57, h * .32]], c.dark);
      line(.78, .38, .69, .73, "#76954a", .7);
      for (const [a, b] of [[.75, .47], [.71, .62]]) {
        m.poly([[w * a, h * b], [w * (a - .13), h * (b - .08)], [w * (a - .1), h * (b + .06)]], "#a4b866");
      }
      break;
    case 11: // Interlocking ice facets and a frosted upper plate.
      m.poly([[w * .57, h * .2], [w * .78, h * .15], [w * .86, h * .31], [w * .67, h * .35]], c.bevel);
      line(.68, .2, .71, .32, c.steel, .5);
      m.poly([[w * .65, h * .64], [w * .83, h * .61], [w * .77, h * .83]], c.metal);
      break;
    case 12: // Worn ochre paint over segmented sand skirts.
      for (let i = 0; i < (large ? 3 : 2); i++) {
        m.plate(w * (.57 + i * .1), h * .62, w * .1, h * .19, i % 2 ? c.steel : c.face, .4);
      }
      line(.62, .26, .8, .31, c.bevel, .8);
      if (large) { line(.63, .32, .71, .34, c.rust); line(.74, .38, .83, .4, c.metal); }
      // Dust beads, bounded by the hull box rather than a false weapon trail.
      for (let i = 0; i < 3; i++) m.disc(w * (.85 + i * .045), h * (.71 - (time % 16) / 160), .45, c.cream);
      break;
    case 13: // Rail-yard warning plate, insulated pantograph and wheel.
      m.plate(w * .57, h * .57, w * .28, h * .15, c.cream, .4);
      for (let i = 0; i < 3; i++) line(.59 + i * .08, .68, .63 + i * .08, .59, c.ink, .8);
      line(.65, .31, .74, .14, c.metal, .8); line(.74, .14, .83, .31, c.metal, .8);
      line(.68, .12, .8, .12, c.dark, .8);
      if (large) { m.disc(w * .77, h * .81, 1.7, c.dark); m.disc(w * .77, h * .81, .7, c.rust); }
      break;
    case 14: // Snow-capped icebreaker plate with a restrained aurora seam.
      m.poly([[w * .56, h * .24], [w * .62, h * .16], [w * .81, h * .2], [w * .85, h * .29], [w * .7, h * .26]], c.bevel);
      line(.6, .65, .8, .6, "#8de6cb", 1);
      if (large) line(.64, .7, .83, .65, "#a9b9ed", .6);
      break;
    case 15: { // Guarded storm rotor, wet plate edge and rain scars.
      const r = Math.min(w, h) * .15;
      m.disc(px, py, r, c.dark);
      for (let i = 0; i < 3; i++) {
        const a = time / 11 + i * Math.PI * 2 / 3;
        m.rod(px, py, px + Math.cos(a) * r * .75, py + Math.sin(a) * r * .75, .65, c.metal);
      }
      m.disc(px, py, .55, c.cream);
      line(.61, .59, .82, .55, c.bevel, .7);
      for (const a of [.65, .78]) line(a, .64, a - .04, .76, c.steel, .5);
      break;
    }
    case 16: // Civic fleet: enamel tower housing and a blue/gold pennant.
      m.plate(w * .64, h * .19, w * .19, h * .23, c.face, .5);
      m.plate(w * .65, h * .14, w * .17, h * .09, c.steel, .3);
      line(.66, .6, .66, .85, c.metal, .6);
      m.poly([[w * .66, h * .59], [w * .83, h * .61], [w * .81, h * .8], [w * .74, h * .74], [w * .66, h * .8]], "#466f9b");
      ctx.fillStyle = tone(c.cream); ctx.fillRect(x + w * .69, y + h * .62, Math.max(.5, w * .025), h * .12);
      break;
  }
}
