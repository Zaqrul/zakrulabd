/* Space 3 alone: coral pulses, violet replays, burning jets and returning
   blades each keep a distinct silhouette. */
import type { Bullet, State } from "./space-logic";
import { drawOuterBullet } from "./space3-act2-projectile-art.ts";

export function drawThirdBullet(ctx: CanvasRenderingContext2D, b: Bullet, s: State, reduceMotion = false): boolean {
  if (drawOuterBullet(ctx, b, s, reduceMotion)) return true;
  if (s.chapter < 17 || !s.res || b.own !== "e" || !["pulse", "needle", "orb", "ice", "scrap", "fire", "crescent"].includes(b.kind)) return false;
  const echo=b.kind==="needle";
  const missile=s.chapter===20 && b.kind==="pulse" && b.hold!==undefined && b.hvx!==undefined && b.hvy!==undefined;
  const held=missile && (b.hold??0)>0 && b.vx===0 && b.vy===0;
  const fused=b.kind==="scrap" && (b.fuse??0)>0;
  const spinning=b.kind==="crescent" && !reduceMotion;
  ctx.save();ctx.translate(b.x,b.y);ctx.rotate(fused?0:held?Math.atan2(b.hvy??0,b.hvx??-1):Math.atan2(b.vy,b.vx));
  ctx.lineWidth=0.8;ctx.strokeStyle="#171717";
  const r=b.r;
  if(missile){
    const scale=Math.min(1,r/3.6);ctx.scale(scale,scale);
    ctx.beginPath();ctx.moveTo(3.5,0);ctx.lineTo(1.8,-1.1);ctx.lineTo(-3.1,-1.1);
    ctx.lineTo(-3.1,1.1);ctx.lineTo(1.8,1.1);ctx.closePath();ctx.fillStyle="#a8a29e";ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-2.7,-0.8);ctx.lineTo(-2.6,-1.9);ctx.lineTo(-0.7,-0.8);
    ctx.moveTo(-2.7,0.8);ctx.lineTo(-2.6,1.9);ctx.lineTo(-0.7,0.8);ctx.fillStyle="#6b6785";ctx.fill();
    ctx.fillStyle="#b91c1c";ctx.fillRect(0,-0.9,0.7,1.8);
    ctx.fillStyle=held?"#27272e":"#fb7185";ctx.fillRect(-3.5,-0.65,0.9,1.3);
    if(!held){
      ctx.beginPath();ctx.moveTo(-3.5,-0.6);ctx.lineTo(-5.1,0);ctx.lineTo(-3.5,0.6);
      ctx.fillStyle="rgb(251 113 133 / 0.45)";ctx.fill();
    }
  }else if(fused){
    ctx.strokeStyle="#fb7185";ctx.lineWidth=0.75;
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      ctx.beginPath();ctx.moveTo(Math.cos(a)*r*0.55,Math.sin(a)*r*0.55);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();
    }
    ctx.beginPath();ctx.arc(0,0,r*0.67,0,Math.PI*2);ctx.fillStyle=s.chapter===18?"#573f35":"#292735";ctx.fill();ctx.strokeStyle="#a8a29e";ctx.stroke();
    const period=Math.max(4,Math.round((b.fuse??0)/6));
    const lit=reduceMotion || s.frame%period<period/2;
    ctx.beginPath();ctx.arc(0,0,Math.max(0.8,r*0.24),0,Math.PI*2);ctx.fillStyle=lit?"#fb7185":"#713e49";ctx.fill();
    if(lit){ctx.fillStyle="#fff1cc";ctx.fillRect(-0.4,-0.4,0.8,0.8);}
  }else if(b.kind==="scrap"){
    ctx.beginPath();ctx.moveTo(r,0);ctx.lineTo(r*0.3,-r*0.9);ctx.lineTo(-r*0.6,-r*0.7);
    ctx.lineTo(-r,r*0.15);ctx.lineTo(-r*0.25,r*0.85);ctx.lineTo(r*0.7,r*0.5);ctx.closePath();
    ctx.fillStyle=s.chapter===18?"#a67951":"#6b6785";ctx.fill();ctx.strokeStyle="#fb7185";ctx.lineWidth=0.75;ctx.stroke();
    ctx.beginPath();ctx.moveTo(-r*0.6,-r*0.7);ctx.lineTo(0,0);ctx.lineTo(r*0.7,r*0.5);
    ctx.strokeStyle=s.chapter===18?"#453537":"#39364d";ctx.lineWidth=0.7;ctx.stroke();
    ctx.fillStyle=s.chapter===18?"#e2bc83":"#b3b8ce";ctx.fillRect(-r*0.2,-r*0.4,Math.max(0.6,r*0.3),0.6);
    if(b.fuse && b.fuse>0){
      // A live blasting charge, distinct from inert ore, without an invented blast radius.
      ctx.beginPath();ctx.arc(0,0,r*0.5,0,Math.PI*2);ctx.strokeStyle="#fff1cc";ctx.lineWidth=0.65;ctx.stroke();
      ctx.fillStyle="#fb7185";ctx.fillRect(-0.7,-0.7,1.4,1.4);
    }
  }else if(b.kind==="fire"){
    /* Short, bright jets from the Vanguard's new flame weapon. Keep the flame
       body inside the projectile radius so it does not overstate its hitbox. */
    ctx.beginPath();ctx.moveTo(r,0);ctx.lineTo(r*0.25,-r*0.66);ctx.lineTo(-r*0.28,-r*0.48);
    ctx.lineTo(-r,-r*0.18);ctx.lineTo(-r*0.58,0);ctx.lineTo(-r,r*0.18);
    ctx.lineTo(-r*0.28,r*0.48);ctx.lineTo(r*0.25,r*0.66);ctx.closePath();
    ctx.fillStyle="#f97316";ctx.fill();ctx.strokeStyle="#7c2d12";ctx.lineWidth=0.55;ctx.stroke();
    ctx.beginPath();ctx.moveTo(r*0.68,0);ctx.lineTo(-r*0.32,-r*0.2);ctx.lineTo(-r*0.48,0);ctx.lineTo(-r*0.32,r*0.2);ctx.closePath();
    ctx.fillStyle="#fff1cc";ctx.fill();
  }else if(b.kind==="crescent"){
    /* A hooked metal blade reads as a boomerang even while its velocity turns
       back toward the boss. Rotation is visual only and freezes on request. */
    if(spinning)ctx.rotate((s.frame*0.12+b.x*0.025)%(Math.PI*2));
    ctx.beginPath();ctx.arc(0,0,r,-1.2,1.2);
    ctx.quadraticCurveTo(r*0.16,r*0.16,r*0.34,-r*0.48);
    ctx.arc(0,0,r*0.62,1.08,-1.08,true);ctx.closePath();
    ctx.fillStyle="#8b82a8";ctx.fill();ctx.strokeStyle="#fb7185";ctx.lineWidth=0.85;ctx.stroke();
    ctx.beginPath();ctx.moveTo(r*0.3,-r*0.18);ctx.quadraticCurveTo(r*0.7,0,r*0.3,r*0.18);
    ctx.strokeStyle="#e7ddff";ctx.lineWidth=0.65;ctx.stroke();
  }else if(b.kind==="ice"){
    ctx.beginPath();ctx.moveTo(r,0);ctx.lineTo(-r*0.45,-r*0.7);ctx.lineTo(-r,0);ctx.lineTo(-r*0.45,r*0.7);ctx.closePath();
    ctx.fillStyle="#c5e6ed";ctx.fill();ctx.strokeStyle="#fb7185";ctx.lineWidth=0.85;ctx.stroke();
    ctx.beginPath();ctx.moveTo(-r*0.6,0);ctx.lineTo(r*0.7,0);ctx.strokeStyle="#5a8aab";ctx.lineWidth=0.6;ctx.stroke();
  }else if(echo){
    ctx.fillStyle="rgb(196 181 253 / 0.2)";ctx.fillRect(-r*4,-0.6,r*4,1.2);
    ctx.beginPath();ctx.moveTo(r,0);ctx.lineTo(-r,-r*0.8);ctx.lineTo(-r*0.4,0);ctx.lineTo(-r,r*0.8);ctx.closePath();
    ctx.fillStyle="#c4b5fd";ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(-r*1.2,-r*0.8);ctx.lineTo(-r*0.6,0);ctx.lineTo(-r*1.2,r*0.8);
    ctx.strokeStyle="#e7ddff";ctx.lineWidth=0.7;ctx.stroke();
  } else if(b.kind==="orb"){
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fillStyle="#171717";ctx.fill();
    ctx.beginPath();ctx.arc(0,0,Math.max(0.5,r-0.5),0,Math.PI*2);ctx.strokeStyle="#fb7185";ctx.lineWidth=1.1;ctx.stroke();
    ctx.fillStyle="#fff1cc";ctx.fillRect(-0.6,-0.6,1.2,1.2);
  } else {
    ctx.beginPath();ctx.moveTo(r,0);ctx.lineTo(0,-r);ctx.lineTo(-r,0);ctx.lineTo(0,r);ctx.closePath();
    ctx.fillStyle="#fb7185";ctx.fill();ctx.stroke();ctx.fillStyle="#fff1cc";ctx.fillRect(-0.7,-0.7,1.4,1.4);
  }
  ctx.restore();return true;
}
