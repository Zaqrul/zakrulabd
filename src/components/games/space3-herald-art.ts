/* The Herald's visual rig observes the director; no render-owned attack clock. */
import { beamMuzzle, modBox, type Enemy, type State } from "./space-logic.ts";
import { corvetTell } from "./space3-boss.ts";
import type { OuterModel } from "./space3-outer-machine-art.ts";

type Ctx = CanvasRenderingContext2D;
type Point = [number, number];
const INK = "#171717", GOLD = "#bb853e", CYAN = "#60c9ff";

export function paintHeraldBody(k: OuterModel, e: Enemy, phase: number, reduceMotion: boolean) {
  const form = Math.min(2, e.stage ?? 0), tell = corvetTell(e), verb = tell.verb;
  const q = tell.charge, firing = verb !== null && q === 0;
  const t = reduceMotion ? 0 : e.t;
  const blade = verb === "blades", gravity = verb === "gravity" || verb === "ring";
  const dash = verb === "dash" || verb === "dash3", hyper = verb === "hyper";
  const blink = verb === "blink";
  const precision = verb === "lance" || verb === "plasma3" || verb === "snap";
  const fan = verb === "ionfan", bombs = verb === "bombs", terrain = verb === "terrain";
  const disaster = verb === "disaster", ambush = verb === "ambush";
  const load = firing ? 1 : q;
  // Held poses communicate charge/live state even with reduced motion enabled.
  const twist = blade ? (firing ? -.19 : .24 * q) : gravity ? -.17 * load : blink ? .12 * load
    : precision ? (verb === "snap" ? -.12 : verb === "plasma3" ? .13 : .06) * load
    : fan ? -.1 * load : disaster ? .2 * load : ambush ? -.23 * load : terrain ? .08 * load : 0;
  const sx = dash ? 1 - .15 * load : hyper ? 1 - .06 * load : precision ? 1 - .11 * load
    : bombs ? 1 - .08 * load : ambush ? 1 - .045 * load : 1;
  const sy = dash ? 1 - .27 * load : precision ? 1 - .13 * load : bombs ? 1 - .035 * load
    : fan ? 1 - .09 * load : hyper ? 1 + .025 * load : 1;
  const cx = dash ? 56 + (firing ? -1.5 : 1.5) : 56, cy = 50;
  const breathing = verb ? 0 : Math.sin(t / 80) * .45;
  const petals = form === 2 ? 10 : 8;
  // One projected axis for shell, petals, bearings and iris: a drum turned left.
  const C = (r: number, a: number): Point => [cx + Math.cos(a) * r * sx * .78, cy + Math.sin(a) * r * sy];

  // A darker inner drum gives the white armour a substantial, layered body.
  k.disc(cx+3,cy,form===2?28:34,form===2?36:43,"#253c50",GOLD,.9);
  k.disc(cx+1,cy,form===2?25:31,form===2?34:41,"#10223e","#819db4",.7);
  k.disc(cx, cy, (form === 1 ? 32 : 25)*.78, form === 1 ? 34 : 25, "#233e61", GOLD, 1);
  k.disc(cx, cy, (form === 1 ? 28 : 22)*.78, form === 1 ? 30 : 22, "#10223e", "#819db4", .7);
  for (let i = 0; i < petals; i++) {
    if (form === 2 && i % 4 === 1) continue;
    const a = i * Math.PI * 2 / petals + (form === 1 ? Math.PI / 8 : 0) + twist;
    const radius = Math.min(46, (form === 0 ? 42 : form === 1 ? 45 : 46) + breathing
      + (blade ? (firing ? 2 : -5 * q) : gravity ? 1.5 * load : blink ? -3 * load
        : terrain ? -5 * load * (i % 2) : disaster ? (firing ? 1 : -3*q) : bombs ? -3*load : 0));
    const spread = form === 1 ? .25 : blade ? (firing ? .12 : .21 + q * .04) : .18;
    k.line([C(16, a), C(radius - 2, a)], INK, 2.4);
    k.line([C(16, a), C(radius - 2, a)], GOLD, 1.1);
    k.plate([C(21, a - .21), C(radius - 4, a - spread), C(radius + 1, a), C(radius - 4, a + spread), C(21, a + .21)], form === 1 ? "#a1bfd3" : "#d4e5ed");
    k.plate([C(25, a - .09), C(radius - 3, a), C(25, a + .09)], "#233e61");
    k.line([C(25, a - .14), C(radius - 6, a - spread * .55), C(radius - 2, a)], "#effaff", .65);
    k.line([C(28, a + .11), C(radius - 3, a)], CYAN, .75);
    k.disc(...C(23, a), 1.6, 1.6, GOLD);
    k.disc(...C(radius - 7, a), 1, 1.3, "#fbcf33");
    if (form > 0) k.line([C(radius - 3, a), C(47, a + .08), C(47, a + .15)], "#6eadd4", .6);
  }

  const ringRadius = form === 1 ? 42 : 34;
  const rotation = t / (gravity ? 240 : 600) + (gravity ? .24 * load : 0);
  for (let i = 0; i < 16; i++) {
    const a = i * Math.PI / 8 + rotation, pt = C(ringRadius, a);
    k.disc(...pt, 1.1, 1.1, GOLD, INK, .5);
    k.line([pt, C(ringRadius, a + Math.PI / 8 * .8)], GOLD, .7);
    if (i % 2 === 0) k.line([C(ringRadius - 3, a), pt], "#e8e2c0", .5);
  }

  // The eyelids close under blade/dash load; gravity exposes an enlarged iris.
  const eyeX = cx - 5 + (hyper ? -2 * load : 0);
  const rx = (form === 2 ? 13 : form === 1 ? 12 : 9) + (gravity ? 2 * load : 0);
  const ry = (form === 1 ? 20 : 12) * (dash || blade ? 1 - .25 * load : 1);
  k.disc(cx, cy, (form === 1 ? 25 : 20)*.78, form === 1 ? 29 : 20, "#10223e", GOLD, 1);
  k.disc(cx-2, cy, (form === 1 ? 19 : 15)*.78, form === 1 ? 24 : 15, "#174471", CYAN, .9);
  k.disc(eyeX,cy,rx*.78+2,ry+2,INK,"#819db4",.75);
  k.disc(eyeX-1,cy,rx*.78,ry,"#9ce6ff",INK,.65);
  k.disc(eyeX-4,cy,rx*.3,ry*.58,form===2||gravity&&firing?"#fff1c9":"#12233d",CYAN,.5);
  k.disc(eyeX-5,cy-ry*.35,Math.max(.6,rx*.15),Math.max(.7,ry*.18),"#fff",INK,.25);
  k.line([[cx - 9, cy - 2], [cx - 4, cy - 8], [cx + 4, cy - 7], [cx + 9, cy - 2]], "#fff", .65);
  if (hyper) {
    // Three physical conduits lead from the core toward the fixed emitter rig.
    for (const yy of [30, 50, 70]) {
      k.line([[40, 50], [29, yy], [12, yy]], INK, 2.4);
      k.line([[40, 50], [29, yy], [12, yy]], firing ? "#fff1c9" : CYAN, .8 + q * .4);
    }
  }
  if (blink) {
    for (const side of [-1, 1]) {
      const xx = 50 + side * (25 + load * 4);
      k.line([[xx, 26], [xx - side * 4, 35], [xx - side * 4, 65], [xx, 74]], "#b8e9ff", .9);
    }
  }
  if (precision || fan) {
    // Fixed front feed follows the director's real projectile origin, at x/cy.
    const gap = (precision ? 2.5 : 5) + (firing ? 1 : -q);
    for (const side of [-1,1]) {
      k.plate([[2,50+side*gap],[20,50+side*(gap+2)],[35,50+side*8],
        [30,50+side*11],[17,50+side*(gap+5)],[2,50+side*(gap+3)]],"#819db4");
      k.line([[4,50+side*(gap+1)],[21,50+side*(gap+3)],[30,50+side*9]],CYAN,.7);
    }
    if(verb==="plasma3")for(const yy of [44,50,56])k.line([[23,yy],[30,yy]],"#fff1c9",.8);
    if(verb==="snap")k.line([[29,39],[24,50],[29,61]],GOLD,1.2);
  }
  if (bombs || terrain) {
    // Paired containment jaws open; terrain braces use a heavier diagonal rack.
    for(const side of [-1,1]) {
      const yy=50+side*(18+load*4);
      k.plate([[24,yy],[37,yy-side*5],[46,yy],[40,yy+side*5],[26,yy+side*4]],terrain?"#758594":"#a1bfd3");
      k.line([[28,yy],[39,yy]],firing?"#fff1c9":CYAN,1);
      if(terrain)k.line([[32,yy],[19,50+side*30],[12,50+side*29]],GOLD,1.4);
    }
  }
  if (disaster || ambush) {
    // Command vanes signal remote attacks; these are not fake projectile barrels.
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2+(ambush?Math.PI/4:0);
      k.plate([C(29,a-.1),C(42,a-.07),C(45,a),C(42,a+.07),C(29,a+.1)],"#758594");
      k.line([C(31,a),C(42,a)],firing?"#fff1c9":CYAN,.9);
    }
  }
  if (phase > 0 || form > 0) k.line([[39, 30], [43, 38], [39, 45], [43, 51]], "#fbcf33", .85);
  if (form === 2) k.line([[61, 27], [57, 39], [62, 47], [58, 58], [63, 72]], "#fff1c9", 1);
}

function rigLine(ctx: Ctx, points: Point[], colour: string, width: number) {
  ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.lineJoin = "round"; ctx.stroke();
}

/** One crescent carrier joins the drum, orthogonal shield and fixed emitters. */
export function drawHeraldLinks(ctx: Ctx, e: Enemy) {
  const X=(v:number)=>e.x+v*e.w/100,Y=(v:number)=>e.y+v*e.h/100;
  const plate=(pts:Point[],fill:string)=>{
    ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y)));
    ctx.closePath();ctx.fillStyle=e.flash>0?"#fff":fill;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke();
  };
  const bearing=(x:number,y:number,hit=false)=>{
    ctx.beginPath();ctx.ellipse(X(x),Y(y),2.1,2.8,0,0,Math.PI*2);
    ctx.fillStyle=e.flash>0||hit?"#fff":GOLD;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.65;ctx.stroke();
    ctx.beginPath();ctx.ellipse(X(x),Y(y),.7,1.3,0,0,Math.PI*2);ctx.fillStyle=CYAN;ctx.fill();
  };
  ctx.save();
  // The rear cradle disappears behind the drum. Its bevel exposes depth on the right.
  plate([[23,10],[49,5],[76,14],[88,31],[91,64],[75,86],[48,95],[23,90],
    [27,85],[48,89],[72,81],[84,62],[82,34],[72,20],[49,11],[27,15]],"#566b7c");
  // Front crescent has sockets at exactly the three beamMuzzle heights.
  ctx.beginPath();ctx.moveTo(X(27),Y(10));
  ctx.bezierCurveTo(X(2),Y(7),X(-10),Y(18),X(-10),Y(30));
  ctx.lineTo(X(-10),Y(70));ctx.bezierCurveTo(X(-10),Y(82),X(2),Y(93),X(27),Y(90));
  ctx.lineTo(X(27),Y(85));ctx.bezierCurveTo(X(6),Y(86),X(-3),Y(78),X(-3),Y(68));
  ctx.lineTo(X(-3),Y(32));ctx.bezierCurveTo(X(-3),Y(22),X(6),Y(14),X(27),Y(15));
  ctx.closePath();ctx.fillStyle=e.flash>0?"#fff":"#819db4";ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.9;ctx.stroke();
  for(const side of [-1,1]){
    const yy=(v:number)=>50+v*side;
    rigLine(ctx,[[X(-6),Y(yy(18))],[X(-3),Y(yy(29))],[X(8),Y(yy(36))],[X(24),Y(yy(37))]],GOLD,.9);
    bearing(24,yy(36));
  }
  for(const m of e.mods??[]){
    if(m.hp<=0)continue;
    const b=modBox(e,m);
    if(m.kind==="ring"){
      // Trunnions explain the shield's perpendicular plane without moving its box.
      for(const side of [-1,1]){
        const py=side<0?b.y+2:b.y+b.h-2;
        rigLine(ctx,[[b.x+b.w/2,py],[X(5),Y(50+side*43)],[X(24),Y(50+side*36)]],INK,3.5);
        rigLine(ctx,[[b.x+b.w/2,py],[X(5),Y(50+side*43)],[X(24),Y(50+side*36)]],e.flash>0||m.flash>0?"#fff":"#819db4",1.6);
      }
    }else{
      const py=b.y+b.h/2,px=b.x+b.w-1;
      rigLine(ctx,[[px,py],[X(-3),py]],INK,3.5);
      rigLine(ctx,[[px,py],[X(-3),py]],e.flash>0||m.flash>0?"#fff":GOLD,1.5);
      bearing((px-e.x)*100/e.w,(py-e.y)*100/e.h,m.flash>0);
    }
  }
  ctx.restore();
}

/** Painted outside the body clip because beamMuzzle lies ten pixels ahead of it. */
export function drawHeraldEmitters(ctx: Ctx, e: Enemy, s: State) {
  const tell = corvetTell(e), hyper = tell.verb === "hyper";
  const beams = s.beams.filter(b => b.ownerId === e.id);
  ctx.save();
  for (const slot of [-1, 0, 1]) {
    const p = beamMuzzle(e, slot);
    // Recessed sockets in the crescent replace the disconnected gun pipes.
    ctx.beginPath();ctx.ellipse(p.x+1.4,p.y,3.4,3.6,0,0,Math.PI*2);
    ctx.fillStyle=e.flash>0?"#fff":"#253c50";ctx.fill();ctx.strokeStyle=GOLD;ctx.lineWidth=.65;ctx.stroke();
    const active = hyper && (!beams.length || beams.some(b => (b.slot ?? 0) === slot));
    const lit = active && tell.charge > 0;
    ctx.beginPath(); ctx.arc(p.x, p.y, lit ? 1 + tell.charge * 1.4 : 1.15, 0, Math.PI * 2);
    ctx.fillStyle = lit || active ? "#fff1c9" : e.flash > 0 ? "#fff" : "#1c3a55";
    ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = .65; ctx.stroke();
  }
  if(["lance","plasma3","snap","ionfan"].includes(tell.verb??"")) {
    const px=e.x,py=e.y+e.h/2;
    rigLine(ctx,[[px+9,py],[px,py]],INK,2.6);
    rigLine(ctx,[[px+9,py],[px,py]],e.flash>0?"#fff":CYAN,1);
    ctx.beginPath();ctx.arc(px,py,1.25,0,Math.PI*2);
    ctx.fillStyle=tell.charge>0?"#fff1c9":e.flash>0?"#fff":CYAN;ctx.fill();
  }
  ctx.restore();
}
