/* Hi-Do / Metal Slug reference, recreated with flat native Canvas geometry.
   Weapon mouths share coordinates with the simulation. */
import { beamMuzzle, enemyMuzzle, missileMuzzle, type Enemy, type State } from "./space-logic";
import { tone } from "./space-material";
import { finalAttackPose } from "./space-final-pose";
type Ctx = CanvasRenderingContext2D;
const INK = "#252c28", OLIVE = "#727b4b", LIGHT = "#a4a977", DARK = "#49543b";

export function drawDreadnought(ctx: Ctx, e: Enemy, s: State, reduceMotion: boolean) {
  const { x, y } = e;
  const t = reduceMotion ? 0 : e.t;
  const pose = finalAttackPose(e, reduceMotion);
  const tilt = pose.kind === "charge" ? .045 * pose.charge - .025 * pose.kick
    : pose.kind === "c4" ? -.018 * pose.load : pose.kind === "beam" ? -.012 * pose.load
    : -.025 * pose.kick;
  const a = e.attack;
  const warning = !!a && a.t < a.warn;
  const firing = !!a && a.t >= a.warn && a.t < a.warn + a.live;
  const rackOpen = a?.kind === "missiles" && (warning || firing);
  const heat = warning ? "#ffb35b" : firing ? "#fff1ce" : "#df7352";
  const poly = (points: number[][], colour: string) => {
    ctx.beginPath();
    points.forEach(([px, py], i) => i ? ctx.lineTo(x + px, y + py) : ctx.moveTo(x + px, y + py));
    ctx.closePath(); ctx.fillStyle = tone(colour); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.stroke();
  };
  const box = (px: number, py: number, w: number, h: number, colour: string) =>
    poly([[px, py], [px + w, py], [px + w, py + h], [px, py + h]], colour);
  const disc = (px: number, py: number, r: number, colour: string) => {
    ctx.beginPath(); ctx.arc(x + px, y + py, r, 0, Math.PI * 2);
    ctx.fillStyle = tone(colour); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.stroke();
  };
  ctx.save();
  ctx.save(); ctx.translate(x + 48, y + 42); ctx.rotate(tilt); ctx.translate(-x - 48, -y - 42);
  // A long exposed keel separates the engine cabin from its steering tail.
  poly([[57,28],[86,25],[91,30],[91,39],[62,43]],DARK);
  poly([[62,29],[86,27],[87,30],[65,34]],LIGHT);
  for(const px of [71,79,85])box(px,29,1.2,8,"#87916a");
  poly(e.a >= 5 ? [[84,28],[90,16],[94,23],[91,29],[95,33],[95,48],[87,43],[83,37]]
    : [[84,28],[90,11],[95,11],[95,48],[87,43],[83,37]], DARK);
  disc(90, 33, 7, INK);
  const rotor = reduceMotion ? 0.6 : t * 0.42;
  for (let i = 0; i < 3; i++) {
    ctx.save(); ctx.translate(x + 90, y + 33); ctx.rotate(rotor + i * Math.PI * 2 / 3);
    ctx.fillStyle = tone(LIGHT); ctx.fillRect(1, -1, 5.5, 2); ctx.restore();
  }
  disc(90, 33, 1.7, "#b9bba1");
  // Broadside armour planes keep the nose low and the tail boom readable.
  for (const px of [28, 63]) box(px, 65, 3, 12, DARK);
  poly([[17, 74], [23, 78], [75, 78], [79, 74], [76, 81], [21, 81], [16, 77]], "#8a8f77");
  poly([[5,40],[13,29],[27,21],[57,20],[67,26],[72,38],[71,54],[61,66],[24,67],[11,58]],OLIVE);
  poly([[13,29],[28,23],[56,22],[64,27],[28,28],[8,40]],LIGHT);
  poly([[11,53],[27,59],[63,59],[71,52],[61,67],[25,69],[11,59]],DARK);
  // The front battery has a continuous bulkhead rather than three floating guns.
  poly([[20,16],[27,18],[29,60],[24,69],[19,63]],DARK);
  box(23,20,2,43,LIGHT);
  // Engine pod supports bridge the narrowed cabin to the fixed aft housings.
  poly([[66,43],[81,45],[86,50],[83,63],[69,61]],DARK);
  poly([[70,44],[80,46],[82,49],[71,49]],LIGHT);
  // Overlapping belly plates, cheek armour and inset service panels.
  poly([[9,46],[19,48],[24,59],[18,62],[11,57]],"#8e9870");
  poly([[23,59],[36,61],[36,68],[28,68]],"#8b9368");
  poly([[39,62],[55,62],[54,69],[39,69]],"#596549");
  poly([[59,61],[73,58],[67,66],[58,69]],"#8b9368");
  box(15,50,13,5,DARK);box(17,51,9,1.2,LIGHT);
  box(33,25,5,31,"#4c5941");
  for(let i=0;i<4;i++)box(34,28+i*6,3,2,"#a0aa80");
  poly([[66,33],[75,36],[76,48],[68,51]],"#566449");
  for(let i=0;i<4;i++)box(69,36+i*3,5,1.2,INK);
  // Stepped cockpit, cream frames and a tiny pilot.
  poly([[12, 30], [25, 26], [36, 27], [36, 42], [8, 45]], "#d1c9a4");
  poly([[14, 32], [23, 29], [23, 41], [10, 42]], "#526c70");
  poly([[26, 29], [33, 30], [33, 40], [26, 41]], "#89a2a0");
  poly([[14,32],[21,30],[20,32],[12,39]],"#afc7ba");
  box(11,43,20,1.4,"#b3b68c");
  disc(29, 35, 2.1, "#d8b28a");
  box(26.5, 33, 5, 1.6, DARK);
  poly([[25, 40], [27, 37], [31, 37], [33, 40]], DARK);
  // Engine doghouse and broad animated rotor.
  poly([[36,18],[37,12],[42,9],[57,9],[62,14],[61,19]],DARK);
  poly([[38,12],[43,10],[56,10],[59,12]],"#b6b98b");
  for (let i = 0; i < 5; i++) box(40 + i * 3.5, 13, 1.4, 4, INK);
  box(46, 5, 4, 7, "#a5aa94");
  box(43,7,10,2,DARK);disc(48,8,2.5,"#bfc4a3");
  const span = reduceMotion ? 36 : 22 + Math.abs(Math.cos(t * 0.48)) * 17;
  poly([[48 - span, 5], [47, 3], [48 + span, 4], [48 + span, 6], [48, 7], [48 - span, 7]], "#b2b69c");
  disc(48, 5, 2, INK);
  // Side door gives way to exposed machinery in the later phases.
  box(41, 30, 25, 28, DARK);
  if (e.a < 2) {
    box(43, 31, 21, 25, e.a === 1 ? "#858663" : OLIVE);
    poly([[43,31],[64,31],[62,33],[45,33],[45,54],[43,56]],LIGHT);
    box(46,54,15,1,DARK);
    box(46, 34, 12, 3, "#343e35"); box(59, 41, 2, 5, LIGHT);
    ctx.fillStyle = tone("#e5dcba"); ctx.font = "bold 10px monospace";
    ctx.fillText("08", x + 45, y + 51);
  } else {
    for (let i = 0; i < 4; i++) box(44, 33 + i * 5, 18, 2.2, "#9b9b7d");
    disc(53, 44, 6, INK); disc(53, 44, 3.6, e.a >= 4 ? "#fff0b0" : "#e98743");
    poly([[42, 30], [48, 31], [44, 36]], OLIVE);
    poly([[61, 50], [66, 47], [65, 58], [58, 57]], OLIVE);
    if (e.a >= 5) {
      // Last stand: a torn-open engine cradle replaces the small service hatch.
      box(40, 29, 27, 30, INK);
      for(const yy of [32,37,52,57]){box(43,yy,20,1.6,"#6d7855");box(45,yy,2,1.6,LIGHT);}
      disc(53,44,10,LIGHT);disc(53,44,8.8,INK);
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        poly([[53 + Math.cos(angle) * 5,44 + Math.sin(angle) * 5],
          [53 + Math.cos(angle) * 11,44 + Math.sin(angle) * 11],
          [53 + Math.cos(angle + .18) * 11,44 + Math.sin(angle + .18) * 11]], LIGHT);
      }
      disc(53,44,7,DARK); disc(53,44,4.8,"#f5a54f"); disc(53,44,2.6,"#fff0b0");
      poly([[39,29],[45,26],[43,38],[39,42]],LIGHT);
      poly([[65,43],[70,39],[69,58],[63,61]],DARK);
      box(68,31,8,18,INK);
      for(let i=0;i<4;i++)box(69,32+i*4,5,1.5,"#b2b69c");
    }
  }
  for (const [px, py] of [[28, 22], [60, 23], [30, 58], [69, 54]]) disc(px, py, 0.9, LIGHT);
  for(const [px,py] of [[24,23],[39,20],[54,20],[64,27],[24,65],[60,66]])disc(px,py,0.7,"#c9c7a1");
  // Tail boom ribs and landing-gear hydraulic sleeves.
  poly([[78,30],[86,28],[86,32],[80,36]],LIGHT);
  box(86,21,3,7,"#a3ac81");
  for(const px of [28,63]) {
    box(px-1,67,5,5,"#a6ae8b");box(px+1,71,1,5,"#d2d5b8");
    disc(px+1.5,67,1.5,INK);
  }
  ctx.restore(); // Weapons stay on their authoritative, unpitched mounts.
  // Sliding missile hatches; the firing ports stay fixed.
  for (let slot = 0; slot < 2; slot++) {
    const m = missileMuzzle(e, slot), my = m.y - y;
    box(70, my - 5, 18, 10, DARK);
    for (let i = 0; i < 3; i++) disc(74 + i * 4, my, 1.6, rackOpen ? "#db7653" : INK);
    box(70, my - 5 - (rackOpen ? 5 : 0), 18, rackOpen ? 3 : 9, OLIVE);
    poly([[70,my-5-(rackOpen?5:0)],[86,my-5-(rackOpen?5:0)],[88,my-3-(rackOpen?5:0)],[72,my-3-(rackOpen?5:0)]],LIGHT);
    box(83,my-1,3,2,DARK);
    if (rackOpen) disc(m.x - x, my, 1.2, heat);
  }
  // Cannon mouths match all three existing laser emitters.
  for (const slot of [-1, 0, 1]) {
    const m = beamMuzzle(e, slot), py = m.y - y;
    disc(21,py,5,DARK);disc(21,py,3,"#a7ad86");
    poly([[10,py-4],[18,py-5],[23,py-3],[23,py+3],[18,py+5],[10,py+4]],OLIVE);
    box(5, py - 2.8, 13, 5.6, "#8b907c");box(8,py-2.4,8,1,LIGHT);
    box(9,py-3.3,2.5,6.6,DARK);
    box(4, py - 3.5, 4, 7, INK);
    const livePort = a?.kind === "beam" && (slot === 0 ? e.a < 2 || e.a >= 3 : e.a >= 2);
    disc(m.x - x, py, 1.8, livePort && (warning || firing) ? heat : "#b66b43");
  }
  if (a && firing && ["burst", "fan", "curtain", "spiral", "nova"].includes(a.kind) && (a.t - a.warn) % 6 < 3) {
    const m = enemyMuzzle(e, s);
    poly([[m.x - x, m.y - y - 3], [m.x - x - 9, m.y - y], [m.x - x, m.y - y + 3]], "#ffe5a2");
  }
  // The C4 bay in the belly slides open for the barrage.
  if (a?.kind === "c4" && (warning || firing)) {
    const slide = warning ? pose.charge * 4 : firing ? 4 : 0;
    poly([[35,62],[40,59-slide],[60,59-slide],[65,62],[62,64],[38,64]],LIGHT);
    box(37, 62, 22, 8, INK);
    for (let i = 0; i < 3; i++) box(39.5 + i * 6.5, 64, 4.5, 3.4, "#c9b27c");
    disc(48, 69, 1.3, t % 8 < 4 ? "#ef4444" : "#7f1d1d");
    if(e.a>=5){box(33,63,3,9,DARK);box(60,63,3,9,DARK);box(38,71,21,1.4,LIGHT);}
  }
  // Thrusters adapt the helicopter reference to the space setting.
  for (const dy of [49, 58]) {
    box(82, dy - 3, 9, 6, INK);
    poly([[80,dy-4],[86,dy-4],[90,dy-2],[90,dy+2],[86,dy+4],[80,dy+4]],DARK);
    box(85,dy-3.5,2,7,"#b1b695");box(89,dy-2,2,4,INK);
    const length = (a?.kind === "charge" && firing ? 14 : 6) + (t % 4);
    poly([[91, dy - 2], [91 + length, dy], [91, dy + 2]], "#f5a54f");
  }
  if (e.a >= 2) for (let i = 0; i < e.a; i++) {
    const rise = (t * 0.35 + i * 7) % 16;
    ctx.globalAlpha = 0.5 - rise / 45;
    disc(60 + i * 3, 22 - rise, 2 + rise * 0.13, "#55554b");
  }
  ctx.globalAlpha = 1;
  if (e.a >= 3) poly([[58, 28], [61, 18 - t % 3], [63, 24], [66, 19], [65, 30]], "#e99144");
  ctx.restore();
}
