/* An ancient survey craft: split armour around a suspended recording core.
   Plates stay inside the collision body. A throat links core and muzzle. */
import { H, W, shipSize, type Enemy, type State } from "./space-logic";
import { corvetCloaked, corvetTell } from "./space3-boss";

type Ctx = CanvasRenderingContext2D;
const TAU = Math.PI * 2;

export function drawCorvet(ctx: Ctx, e: Enemy, reduceMotion = false): boolean {
  if (e.type !== "boss17") return false;
  const cloaked = corvetCloaked(e.t);
  const phase = Math.min(2, e.a);
  const tell = corvetTell(e);
  const fanCharge = tell.aimed ? tell.charge : 0;
  const ringCharge = tell.ring ? tell.charge : 0;
  const replayCharge = ["echo", "playback", "recall"].includes(tell.verb ?? "") ? tell.charge : 0;
  const hit = e.flash > 0;
  const ink = "#171717", hull = hit ? "#ffffff" : "#665387";
  const steel = hit ? "#fff1cc" : "#a8b3cc";
  const gold = "#fbcf33";
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.scale(e.w / 64, e.h / 30);
  ctx.lineJoin = "round";
  const plate = (points: number[][], fill: string, rim = ink) => {
    ctx.beginPath();
    points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
    ctx.strokeStyle = rim; ctx.lineWidth = 0.8; ctx.stroke();
  };
  const line = (points: number[][], colour: string, width = 0.7) => {
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.stroke();
  };
  // Cloaking keeps an unbroken silver contour and the recording eye.
  ctx.globalAlpha = cloaked ? 0.62 : 1;
  plate([[1,15],[14,9],[25,8],[42,10],[60,8],[63,15],[60,22],[42,20],[25,22],[14,21]], "#29243e", steel);
  for (const side of [-1, 1]) {
    ctx.save(); ctx.translate(0, 15); ctx.scale(1, side);
    const open = phase * 1.2;
    line([[20,-2],[30,-8-open],[48,-7-open]], steel, 1.6);
    plate([[9,-5],[23,-11-open],[37,-12-open],[31,-6-open],[19,-3]], hull);
    plate([[32,-6-open],[40,-13-open/2],[61,-14],[54,-8],[62,-4],[45,-3]], hull);
    plate([[38,-8-open/2],[43,-11-open/2],[56,-12],[51,-9]], steel);
    line([[12,-5],[24,-9-open],[31,-9-open]], "#c7b5e7");
    line([[43,-5],[54,-6]], phase >= 1 ? gold : "#9183aa", 1.1);
    plate([[56,-3],[61,-5],[63,-2],[59,-1]], "#c4b5fd");
    ctx.restore();
  }
  // The hollow iris powers the nose emitter; it opens as armour breaks away.
  ctx.beginPath(); ctx.arc(32, 15, 6 + phase, 0, TAU);
  ctx.fillStyle = ink; ctx.fill(); ctx.strokeStyle = steel; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.arc(32, 15, 4.4 + phase * 0.5, 0, TAU);
  ctx.strokeStyle = phase === 2 ? gold : "#bba3ed"; ctx.lineWidth = 1.3; ctx.stroke();
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + (reduceMotion ? 0.4 : e.t / 90);
    const x = 32 + Math.cos(a) * 3.2, y = 15 + Math.sin(a) * 3.2;
    ctx.fillStyle = phase === 2 ? "#fff1cc" : gold; ctx.fillRect(x - 0.7, y - 0.7, 1.4, 1.4);
  }
  // A predatory recording aperture, carried by the same suspended iris.
  for (let i = 0; i < 6; i++) {
    const a = i * TAU / 6 + replayCharge * 0.35;
    const r = 4.4 + phase * 0.5;
    plate([[32+Math.cos(a)*r,15+Math.sin(a)*r],
      [32+Math.cos(a+0.6)*r,15+Math.sin(a+0.6)*r],
      [32+Math.cos(a+0.8)*(1.9+replayCharge),15+Math.sin(a+0.8)*(1.9+replayCharge)]], "#3e3157");
  }
  line([[31.4,12.4-phase*0.2],[32.6,15],[31.4,17.6+phase*0.2]], replayCharge>0.7?"#fff1cc":"#fb7185", 1.1);
  ctx.globalAlpha = 1;
  // A throat connects the watching eye to the fan muzzle.
  plate([[0,15],[8,12],[17,12],[20,15],[17,18],[8,18]], hit ? "#ffffff" : "#342c49", steel);
  line([[1,15],[11,15]], fanCharge > 0 ? "#fff1cc" : gold, 1.6);
  ctx.beginPath(); ctx.ellipse(14, 15, 2.7, 3.6, 0, 0, TAU);
  ctx.fillStyle = gold; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.fillStyle = ink; ctx.fillRect(13.3, 12.7, 1.4, 4.6);
  if (fanCharge > 0) {
    ctx.beginPath(); ctx.arc(0, 15, 2 + (1 - fanCharge) * 4, -Math.PI / 2, Math.PI / 2);
    ctx.strokeStyle = "#fb7185"; ctx.lineWidth = 0.8 + fanCharge; ctx.stroke();
  }
  if (ringCharge > 0) {
    ctx.beginPath(); ctx.arc(32, 15, 10 - ringCharge * 2, 0, TAU * ringCharge);
    ctx.strokeStyle = "#fb7185"; ctx.lineWidth = 1; ctx.stroke();
  }
  if (phase === 2) {
    line([[21,5],[24,7],[22,10]], ink, 1.2);
    line([[49,20],[46,23],[50,25]], ink, 1.2);
  }
  if (cloaked) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, 64, 30); ctx.clip();
    const offset = reduceMotion ? 0 : e.t % 9;
    for (let y = -9 + offset; y < 30; y += 9) line([[4,y+5],[24,y],[44,y+5],[61,y]], "rgb(221 208 255 / 0.55)");
    ctx.restore();
  }
  ctx.restore();
  return true;
}

/* Read the director's exposed tell, never a guessed clock. These cues describe
   origins and direction only; the director does not expose safe-gap width. */
export function drawCorvetCue(ctx: Ctx, e: Enemy, s: State) {
  if(e.type!=="boss17")return;
  const tell=corvetTell(e);
  if(!tell.verb || tell.charge<=0)return;
  const mx=e.x,my=e.y+e.h/2;
  ctx.save();ctx.strokeStyle="rgb(251 113 133 / 0.65)";ctx.lineWidth=0.7;
  if(tell.verb==="lance"){
    const size=shipSize(s.p.level),tx=s.p.x+size.w/2;
    ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(tx,tell.lane);ctx.stroke();ctx.setLineDash([]);
  }else if(tell.verb==="pinch"){
    /* The wreckage is thrown from the two flanks of the hull. */
    for(const y of [my-16,my+16]){
      const x=mx+6;
      ctx.beginPath();ctx.arc(x,y,2+4*(1-tell.charge),0,Math.PI*2);ctx.stroke();
      ctx.fillStyle="#fb7185";ctx.fillRect(x-1,y-1,2,2);
    }
  }else if(tell.verb==="sweep" || tell.verb==="lattice"){
    ctx.beginPath();ctx.moveTo(W-2,14);ctx.lineTo(W-2,H-14);ctx.stroke();
    for(let y=24;y<H-14;y+=24){ctx.beginPath();ctx.moveTo(W-4,y-2);ctx.lineTo(W-7,y);ctx.lineTo(W-4,y+2);ctx.stroke();}
  }else if(tell.verb==="ring"){
    ctx.beginPath();ctx.arc(mx,my,5+5*(1-tell.charge),0,Math.PI*2);ctx.stroke();
  }else if(tell.verb==="scan"){
    const x=e.x+e.w/2,y=my;
    for(let i=0;i<3;i++){
      const a=tell.charge*TAU+i*TAU/3;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*21,y+Math.sin(a)*21);ctx.stroke();
    }
  }else if(tell.verb==="playback"||tell.verb==="recall"){
    const trail=s.res?.trail??[];
    ctx.strokeStyle="rgb(196 181 253 / 0.65)";
    ctx.beginPath();
    if(tell.verb==="playback"){
      for(let i=Math.max(0,trail.length-90);i<trail.length;i+=6){
        const y=trail[i].y;ctx.moveTo(W-8,y);ctx.lineTo(W-3,y);
      }
    }else{
      for(let i=0;i<trail.length;i+=4){
        const p=trail[i];if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);
      }
      ctx.stroke();ctx.beginPath();ctx.arc(mx+e.w/2,my,12+tell.charge*5,0,TAU);
    }
    ctx.stroke();
  }else if(tell.verb==="pincer"){
    for(const side of [-1,1]){
      const y=tell.lane+side*(16+12*(1-tell.charge));
      ctx.beginPath();ctx.moveTo(W-3,y-side*5);ctx.lineTo(W-7,y);ctx.lineTo(W-3,y+side*5);ctx.stroke();
    }
  }
  ctx.restore();
}
