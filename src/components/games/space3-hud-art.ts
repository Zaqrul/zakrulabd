/* Renderer-owned effects and instruments. Observation caches never write to
   State, Resonance, bullets or the replay buffer. All effects use game time. */
import { H, shipSize, type State } from "./space-logic";
import { BARRIER, RESONANCE, ghostPose } from "./space3-resonance";
import { PUSH } from "./space3-arsenal";
import { LUMEN } from "./space3-recruit";
import { corvetTell, THIRD_BOSSES } from "./space3-boss";

type Ctx = CanvasRenderingContext2D;
type Shot = State["bullets"][number];
type Spark = { x: number; y: number; frame: number; reflect: boolean };
type Effects = { frame: number; shots: WeakMap<Shot, "p" | "e">; paid: WeakSet<Shot>; sparks: Spark[] };
const effects = new WeakMap<State, Effects>();

function observe(s: State): Spark[] {
  let fx = effects.get(s);
  if (!fx || s.frame < fx.frame) {
    fx = { frame: -1, shots: new WeakMap(), paid: new WeakSet(), sparks: [] };
    effects.set(s, fx);
  }
  if (fx.frame === s.frame) return fx.sparks;
  fx.frame = s.frame;
  fx.sparks = fx.sparks.filter(p => s.frame - p.frame < 14);
  for (const b of s.bullets) {
    const reflected = fx.shots.get(b) === "e" && b.own === "p";
    const grazed = !!s.res?.paid.has(b) && !fx.paid.has(b);
    if (grazed || reflected) {
      fx.sparks.push({ x: b.x, y: b.y, frame: s.frame, reflect: reflected });
      if (grazed) fx.paid.add(b);
    }
    fx.shots.set(b, b.own);
  }
  if (fx.sparks.length > 48) fx.sparks.splice(0, fx.sparks.length - 48);
  return fx.sparks;
}

const METER = { x: 10, y: H - 10, w: 68, h: 4 };

/* The Endymion's beak, dorsal plates, low wing and hanging pod. Mirrored for
   a hostile replay: its bright muzzle faces left, where the real shot goes. */
function echoShip(ctx: Ctx, x: number, y: number, scale: number, fire: boolean, alpha: number, hostile = true) {
  ctx.save(); ctx.translate(x, y); ctx.scale(hostile ? -scale : scale, scale);
  ctx.globalAlpha = alpha; ctx.lineJoin = "round";
  ctx.beginPath();
  const points = [[-9,-2],[-3,-5],[-7,-12],[-2,-12],[2,-5],[5,-4],[1,-10],[5,-10],[9,-3],[14,2],[13,5],[5,5],[-3,7],[-8,6],[-3,2],[-9,2]];
  points.forEach(([px,py],i) => i ? ctx.lineTo(px,py) : ctx.moveTo(px,py));
  ctx.closePath(); ctx.fillStyle = hostile ? "#7860aa" : "#67e8f9"; ctx.fill();
  ctx.strokeStyle = hostile ? "#ddd0ff" : "#cffafe"; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.beginPath();ctx.moveTo(1,5);ctx.lineTo(0,10);ctx.lineTo(8,10);
  ctx.strokeStyle = "#ddd0ff";ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle=hostile ? "#bca1ef" : "#67e8f9";ctx.fillRect(4,8,10,3);
  ctx.fillStyle=fire ? "#fff1cc" : "#e7ddff";ctx.fillRect(9,0,2,1.4);
  if(fire){ctx.beginPath();ctx.moveTo(14,8);ctx.lineTo(20,9.5);ctx.lineTo(14,11);ctx.fillStyle="#fb7185";ctx.fill();}
  ctx.restore();
}

export function drawResonanceEffects(ctx: Ctx, s: State, reduceMotion = false) {
  const r = s.res;
  if (!r || s.phase === "dead" || s.phase === "launch") return;
  const size = shipSize(s.p.level);
  const cx = s.p.x + size.w / 2, cy = s.p.y + size.h / 2;

  /* Every director boss that unlocks Echo shares this hostile replay cue. */
  const g = ghostPose(r);
  const recorder = s.enemies.find(e => e.type in THIRD_BOSSES && corvetTell(e).verb === "echo");
  if (g && recorder) {
    const firing=corvetTell(recorder).charge===0 && g.fire;
    const impending = r.trail.slice(0, 9).some(pose => pose.fire);
    echoShip(ctx, g.x, g.y, size.w / 18, firing, firing ? 0.9 : impending ? 0.7 : 0.45);
    ctx.save();
    ctx.strokeStyle = firing ? "#fb7185" : "#c4b5fd";
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(g.x - 17, g.y + 7); ctx.lineTo(g.x - 22, g.y + 7);
    ctx.lineTo(g.x - 19, g.y + 5); ctx.moveTo(g.x - 22,g.y + 7);ctx.lineTo(g.x - 19,g.y + 9);ctx.stroke();
    ctx.restore();
  }

  if (r.phase > 0) {
    ctx.save();
    if(!reduceMotion)for(const [offset,alpha] of [[10,0.12],[6,0.22],[3,0.35]]){
      const pose=r.trail[Math.max(0,r.trail.length-1-offset)];
      if(pose)echoShip(ctx,pose.x,pose.y,size.w/18,false,alpha,false);
    }
    ctx.strokeStyle="#cffafe";ctx.lineWidth=0.8;
    ctx.beginPath();ctx.ellipse(cx,cy,size.w*0.8,size.h*1.25,0,0,Math.PI*2);ctx.stroke();
    ctx.restore();
  }
  if (r.barrier > 0) {
    ctx.save();
    ctx.fillStyle="rgb(94 234 212 / 0.045)";
    ctx.beginPath();ctx.arc(cx,cy,BARRIER.radius,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="rgb(94 234 212 / 0.75)";ctx.lineWidth=0.8;ctx.stroke();
    for(let i=0;i<6;i++){
      const angle=i*Math.PI/3+(reduceMotion?0:s.frame/180);
      ctx.beginPath();ctx.arc(cx,cy,BARRIER.radius,angle,angle+0.48);ctx.strokeStyle="#ccfbf1";ctx.lineWidth=1.6;ctx.stroke();
    }
    // A draining inner arc reports the remaining duration without flicker.
    ctx.beginPath();ctx.arc(cx,cy,BARRIER.radius-2,-Math.PI/2,-Math.PI/2+Math.PI*2*r.barrier/BARRIER.frames);
    ctx.strokeStyle="#5eead4";ctx.lineWidth=0.5;ctx.stroke();
    ctx.restore();
  }
  if(r.overdrive>0){
    ctx.save();ctx.strokeStyle="#fbcf33";ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(cx,cy,size.w*0.9,size.h*1.45,0,-1.2,1.2);ctx.stroke();
    if(!reduceMotion){ctx.strokeStyle="rgb(251 207 51 / 0.4)";for(const dy of [-5,5]){ctx.beginPath();ctx.moveTo(cx-size.w-8,cy+dy);ctx.lineTo(cx-size.w/2,cy+dy);ctx.stroke();}}
    ctx.restore();
  }
  for(const spark of observe(s)){
    const age=s.frame-spark.frame;
    const radius=reduceMotion?2:1.5+age*0.22;
    ctx.save();ctx.translate(spark.x,spark.y);ctx.globalAlpha=(1-age/14)*0.9;
    ctx.strokeStyle=spark.reflect?"#ccfbf1":"#fbcf33";ctx.lineWidth=spark.reflect?1.2:0.7;
    if(spark.reflect){ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();}
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2+Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*radius,Math.sin(a)*radius);ctx.lineTo(Math.cos(a)*(radius+2),Math.sin(a)*(radius+2));ctx.stroke();
    }
    ctx.restore();
  }
}

export function drawResonance(ctx: Ctx, s: State, font: string, reduceMotion = false) {
  // Preserve the existing engine entry point while integration is in flight.
  drawResonanceEffects(ctx, s, reduceMotion);
  drawResonanceHUD(ctx, s, font, reduceMotion);
}

export function drawResonanceHUD(ctx: Ctx, s: State, font: string, reduceMotion = false) {
  const r = s.res;
  if (!r || s.phase === "dead") return;

  const share = r.meter / RESONANCE.max;
  const ready = r.meter >= PUSH.cost;
  const accent = ready ? "#fbcf33" : "#c4b5fd";
  ctx.save();

  // Glassmorphic instrument base
  ctx.fillStyle = "rgb(10 14 26 / 0.94)";
  ctx.beginPath();ctx.roundRect(6, H - 28, 146, 24, 4);ctx.fill();
  ctx.strokeStyle = ready ? "rgba(251, 207, 51, 0.55)" : "rgba(196, 181, 253, 0.35)";
  ctx.lineWidth = 0.7; ctx.stroke();

  // Left Section: Kinetic Push Cell
  ctx.font = `800 5.5px ${font}`; ctx.textAlign = "left";
  ctx.fillStyle = accent;
  ctx.fillText(ready ? "KINETIC PUSH · READY [B]" : "KINETIC CELL", METER.x, H - 18);

  ctx.fillStyle = "#272a38";
  ctx.fillRect(METER.x, METER.y, METER.w, METER.h);
  ctx.fillStyle = accent;
  ctx.fillRect(METER.x, METER.y, METER.w * Math.min(1, share), METER.h);
  ctx.fillStyle = "#0a0e1a";
  for (let i = 1; i < 8; i++) ctx.fillRect(METER.x + i * METER.w / 8, METER.y, 0.7, METER.h);

  // Ready pulse boundary
  if (ready && !reduceMotion) {
    const pulse = 0.5 + Math.sin(s.frame / 10) * 0.3;
    ctx.strokeStyle = `rgba(251, 207, 51, ${pulse})`;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(METER.x - 0.8, METER.y - 0.8, METER.w + 1.6, METER.h + 1.6);
  }

  ctx.font = `700 5px ${font}`; ctx.textAlign = "right"; ctx.fillStyle = "#e2e8f0";
  ctx.fillText(`${Math.floor(share * 100)}%`, METER.x + METER.w + 13, H - 6.5);

  // Vertical Separator
  ctx.strokeStyle = "rgba(196, 181, 253, 0.22)"; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(96, H - 24); ctx.lineTo(96, H - 8); ctx.stroke();

  // Right Section: Lumen Wingman Status
  if (s.lumen) {
    const lx = 100, lw = 46;
    const l = s.lumen;
    const overheated = l.hot > 0;
    const firing = l.firing && !overheated;

    ctx.font = `800 5px ${font}`; ctx.textAlign = "left";
    ctx.fillStyle = overheated ? "#f87171" : firing ? "#f472b6" : "#67e8f9";
    ctx.fillText("LUMEN", lx, H - 18);

    ctx.font = `700 4.5px ${font}`; ctx.textAlign = "right";
    ctx.fillStyle = overheated ? (reduceMotion || (s.frame % 20 < 10) ? "#f87171" : "#fda4af") : firing ? "#f472b6" : "#a5f3fc";
    ctx.fillText(overheated ? "OVERHEAT" : firing ? "BURNING" : "READY", lx + lw, H - 18);

    // Lumen Heat Bar
    const heatShare = overheated ? Math.max(0, l.hot / LUMEN.cool) : Math.min(1, l.heat / LUMEN.max);
    ctx.fillStyle = "#272a38";
    ctx.fillRect(lx, H - 10, lw, 4);
    ctx.fillStyle = overheated ? "#f87171" : firing ? "#f472b6" : "#38bdf8";
    ctx.fillRect(lx, H - 10, lw * heatShare, 4);
    ctx.fillStyle = "#0a0e1a";
    for (let i = 1; i < 4; i++) ctx.fillRect(lx + i * lw / 4, H - 10, 0.6, 4);
  }

  ctx.restore();
}
