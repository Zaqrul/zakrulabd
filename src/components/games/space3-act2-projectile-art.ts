/* Heavy weapon shots use unmistakable silhouettes and bright cores at every size. */
import { type Beam, type Bullet, type Hazard, type State } from "./space-logic.ts";
import { drawOuterBeam, drawOuterHazard } from "./space3-act2-hazard-art.ts";

type Ctx=CanvasRenderingContext2D;
const INK="#171717";
function outline(ctx:Ctx,fill:string){ctx.fillStyle=fill;ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.lineJoin="round";ctx.fill();ctx.stroke();}

export function drawOuterBullet(ctx:Ctx,b:Bullet,s:State,reduceMotion=false):boolean{
  if(s.chapter<21||s.chapter>28||b.own!=="e")return false;
  const r=Math.max(.9,b.r),angle=Math.atan2(b.vy,b.vx),visualY=s.chapter===21&&!reduceMotion?b.y+Math.sin(s.frame/3+b.x*.07)*1.1:b.y;
  ctx.save();ctx.translate(b.x,visualY);ctx.rotate(angle);
  /* The afterglow is transparent and may spill out; the solid shot stays in its radius. */
  ctx.fillStyle=`rgb(251 113 133 / ${reduceMotion ? .1 : .15})`;ctx.beginPath();ctx.ellipse(-r*.95,0,r*1.35,Math.max(.45,r*.48),0,0,Math.PI*2);ctx.fill();
  if((b.kind==="pulse"||b.kind==="scrap"||b.kind==="frost")&&(b.fuse??0)>0){
    ctx.beginPath();ctx.arc(0,0,r*.86,0,Math.PI*2);outline(ctx,b.kind==="frost"?"#aacfe0":"#65584b");
    ctx.strokeStyle="#fb7185";ctx.lineWidth=.75;ctx.beginPath();ctx.arc(0,0,r*.64,-Math.PI*.8,Math.PI*.15);ctx.stroke();
    ctx.fillStyle="#fb7185";ctx.beginPath();ctx.arc(r*.18,-r*.26,Math.max(.6,r*.23),0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#fff1c9";ctx.beginPath();ctx.arc(r*.18,-r*.26,Math.max(.4,r*.1),0,Math.PI*2);ctx.fill();
  }else if(b.kind==="scrap"){
    ctx.beginPath();ctx.moveTo(r,0);ctx.lineTo(r*.32,-r*.86);ctx.lineTo(-r*.38,-r*.58);ctx.lineTo(-r,-r*.15);ctx.lineTo(-r*.52,r*.78);ctx.lineTo(r*.22,r*.54);ctx.closePath();outline(ctx,"#737174");
    ctx.strokeStyle="#fb7185";ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-r*.45,-r*.48);ctx.lineTo(r*.2,r*.2);ctx.stroke();
    ctx.fillStyle="#fff1c9";ctx.fillRect(-r*.13,-r*.13,Math.max(.8,r*.26),Math.max(.8,r*.26));
  }else if(b.kind==="needle"||b.kind==="lance"){
    ctx.beginPath();ctx.moveTo(r,0);ctx.lineTo(-r*.72,-r*.52);ctx.lineTo(-r*.3,0);ctx.lineTo(-r*.72,r*.52);ctx.closePath();outline(ctx,b.kind==="lance"?"#9ceaff":"#fb7185");
    ctx.fillStyle="#fff1c9";ctx.fillRect(-r*.25,-Math.max(.35,r*.16),Math.max(.8,r*.55),Math.max(.7,r*.32));
  }else if(b.kind==="orb"||b.kind==="spiral"||b.kind==="wisp"){
    ctx.beginPath();ctx.arc(0,0,r*.84,0,Math.PI*2);outline(ctx,b.kind==="wisp"?"#d8c9ff":"#fb7185");
    ctx.beginPath();ctx.arc(0,0,r*.52,0,Math.PI*2);ctx.strokeStyle="#171717";ctx.lineWidth=.65;ctx.stroke();
    ctx.fillStyle="#fff1c9";ctx.beginPath();ctx.arc(0,0,Math.max(.6,r*.28),0,Math.PI*2);ctx.fill();
  }else if(b.kind==="ice"||b.kind==="frost"||b.kind==="shell"||b.kind==="icebomb"){
    ctx.beginPath();ctx.moveTo(r,0);ctx.lineTo(r*.1,-r*.88);ctx.lineTo(-r*.84,-r*.35);ctx.lineTo(-r*.42,0);ctx.lineTo(-r*.83,r*.4);ctx.lineTo(r*.08,r*.88);ctx.closePath();outline(ctx,"#a8ddeb");
    ctx.strokeStyle="#4d8ba5";ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(-r*.45,0);ctx.lineTo(r*.58,0);ctx.stroke();
    ctx.fillStyle="#fff1c9";ctx.fillRect(-r*.08,-r*.19,Math.max(.7,r*.3),Math.max(.7,r*.38));
  }else if(b.kind==="fire"||b.kind==="flame"){
    ctx.beginPath();ctx.moveTo(r,0);ctx.lineTo(r*.1,-r*.72);ctx.lineTo(-r*.1,-r*.42);ctx.lineTo(-r,0);ctx.lineTo(-r*.1,r*.42);ctx.lineTo(r*.1,r*.72);ctx.closePath();outline(ctx,"#fb7185");
    ctx.fillStyle="#fff1c9";ctx.beginPath();ctx.moveTo(r*.46,0);ctx.lineTo(-r*.35,-r*.16);ctx.lineTo(-r*.53,0);ctx.lineTo(-r*.35,r*.16);ctx.closePath();ctx.fill();
  }else if(b.kind==="crescent"||b.kind==="slash"){
    ctx.beginPath();ctx.arc(0,0,r*.9,-1.2,1.2);ctx.quadraticCurveTo(r*.1,r*.12,r*.28,-r*.4);ctx.arc(0,0,r*.55,1.05,-1.05,true);ctx.closePath();outline(ctx,"#a9a6b6");
    ctx.strokeStyle="#fff1c9";ctx.lineWidth=.65;ctx.beginPath();ctx.arc(0,0,r*.68,-.9,.9);ctx.stroke();
  }else{
    ctx.beginPath();ctx.arc(0,0,r*.78,0,Math.PI*2);outline(ctx,"#fb7185");
    ctx.fillStyle="#fff1c9";ctx.beginPath();ctx.arc(0,0,Math.max(.6,r*.32),0,Math.PI*2);ctx.fill();
  }
  ctx.restore();return true;
}

export function drawAct2Hazard(ctx:Ctx,h:Hazard,s:State,reduceMotion=false){return drawOuterHazard(ctx,h,s,reduceMotion);}
export function drawAct2Beam(ctx:Ctx,bm:Beam,s:State,reduceMotion=false){return drawOuterBeam(ctx,bm,s,reduceMotion);}
