/* Eight outer-system bosses and their eight miniatures. Tells come from the live director state. */
import { W, modBox, type Enemy, type State } from "./space-logic.ts";
import { ACT2, isAct2, type Mod } from "./space3-act2.ts";
import { corvetTell } from "./space3-boss.ts";
import { decorateOuterModule, paintOuterMachine, paintVoidMachineLights } from "./space3-outer-machine-art.ts";
import { drawHeraldEmitters, drawHeraldLinks } from "./space3-herald-art.ts";

type Ctx = CanvasRenderingContext2D;
const INK = "#171717";
const PALETTE: Record<number, { hull: string; dark: string; trim: string; core: string }> = {
  21: { hull: "#365660", dark: "#192d36", trim: "#5eead4", core: "#fff1c9" },
  22: { hull: "#55627a", dark: "#202b40", trim: "#93c5fd", core: "#d9f3ff" },
  23: { hull: "#56504b", dark: "#28272a", trim: "#fbcf33", core: "#fff1c9" },
  24: { hull: "#4a4468", dark: "#171a30", trim: "#c4b5fd", core: "#f4efff" },
  25: { hull: "#22242d", dark: "#10131a", trim: "#fb7185", core: "#ffe4e8" },
  26: { hull: "#514d3d", dark: "#24271f", trim: "#fbcf33", core: "#fff1c9" },
  27: { hull: "#533a32", dark: "#261a1b", trim: "#fb7185", core: "#ffe6db" },
  28: { hull: "#d9e5ef", dark: "#293b55", trim: "#60c9ff", core: "#ffffff" },
};

function poly(ctx: Ctx, points: number[][], fill: string | CanvasGradient, edge = INK, width = 0.8) {
  if (points.length < 3) return;
  ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = width; ctx.lineJoin = "round"; ctx.stroke();
}
function line(ctx: Ctx, points: number[][], color: string, width = 0.75) {
  ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = "round"; ctx.stroke();
}
function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, fill: string, edge = INK, width = 0.8) {
  ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.2, rx), Math.max(0.2, ry), 0, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = width; ctx.stroke();
}
function rect(ctx: Ctx, x: number, y: number, w: number, h: number, fill: string, edge = INK, width = 0.8) {
  if (w <= 0 || h <= 0) return;
  ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); ctx.strokeStyle = edge; ctx.lineWidth = width; ctx.strokeRect(x + width / 2, y + width / 2, Math.max(0, w - width), Math.max(0, h - width));
}
function core(ctx: Ctx, x: number, y: number, r: number, color: string, hot = false) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, Math.max(0.7, r * 0.32), 0, Math.PI * 2); ctx.fillStyle = hot ? "#fff1c9" : "#ffffff"; ctx.fill();
}
function drawBossBody(ctx: Ctx, e: Enemy, s: State, chapter: number, reduceMotion: boolean) {
  if(chapter===28) drawHeraldLinks(ctx,e);
  ctx.save(); ctx.beginPath(); ctx.rect(e.x + .4, e.y + .4, Math.max(0, e.w - .8), Math.max(0, e.h - .8)); ctx.clip();
  paintOuterMachine(ctx, e, chapter, reduceMotion);
  // Existing director-driven warnings remain the final layer on the machine.
  drawBossTell(ctx, e, chapter, reduceMotion);
  ctx.restore();
  for (const part of e.mods ?? []) if (part.hp > 0) drawModule(ctx, e, part, chapter, reduceMotion);
  if(chapter===28) drawHeraldEmitters(ctx,e,s);
}
function drawBossTell(ctx: Ctx, e: Enemy, chapter: number, reduceMotion: boolean) {
  const tell=corvetTell(e); if(!tell.verb || tell.charge<=0) return;
  const p=PALETTE[chapter], x=e.x,y=e.y,w=e.w,h=e.h,cx=x+w*.5,cy=y+h*.5,q=tell.charge;
  const glow = (px:number,py:number,r:number) => {ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fillStyle=`rgb(255 241 201 / ${0.18+q*.42})`;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke();};
  switch(tell.verb){
    case "dash3":
      for(const yy of [cy-h*.27,cy,cy+h*.27]){glow(x+w*.9,yy,1.2+q*2);line(ctx,[[x+w*.82,yy],[x+w*.97,yy]],"#fff1c9",1.1);}
      break;
    case "bombs": case "salvo": case "broadside":
      for(let i=0;i<3;i++){const yy=y+h*(.22+i*.28);ctx.strokeStyle="#fff1c9";ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(x+w*.7,yy);ctx.lineTo(x+w*.9,yy);ctx.stroke();glow(x+w*.9,yy,1+q);}
      break;
    case "blink":
      if(chapter===28) break; // Herald's phase brackets follow its silhouette; keep empty corners clear.
      ctx.save();ctx.globalAlpha=reduceMotion ? .12 : .08+q*.08;ctx.fillStyle="#ffffff";ctx.fillRect(x+1,y+1,w-2,h-2);ctx.restore();
      line(ctx,[[x+w*.24,y+h*.25],[x+w*(.24+q*.12),y+h*.5],[x+w*.24,y+h*.75]],"#ffffff",.85);
      break;
    case "gravity": case "ring": case "lattice": case "scan": case "coil": case "surge": case "minefield":
      ctx.beginPath();ctx.ellipse(cx,cy,Math.min(w,h)*(.18+q*.13),Math.min(w,h)*(.22+q*.12),0,0,Math.PI*2);ctx.strokeStyle=p.core;ctx.lineWidth=1+q;ctx.stroke();glow(cx,cy,Math.min(w,h)*(.07+q*.04));
      break;
    case "hyper":
      if(chapter===28) break; // Exact beamMuzzle ports are painted outside the body clip.
      for(const yy of [cy-h*.26,cy,cy+h*.26]){line(ctx,[[x+w*.07,yy],[x+w*.22,yy]],p.core,1+q);glow(x+w*.08,yy,1+q*1.4);}
      break;
    case "terrain": case "drill": case "breach": case "quake":
      for(const side of [-1,1]){const yy=cy+side*h*.22;poly(ctx,[[x+w*.21,yy-side*3],[x+w*.34,yy],[x+w*.21,yy+side*3]],p.trim);}
      break;
    case "disaster":
      for(let i=0;i<4;i++){const xx=x+w*(.25+i*.16);line(ctx,[[xx, y+h*.1],[xx,y+h*.22]],p.core,1.2);glow(xx,y+h*.2,1+q);}
      break;
    case "ionfan": case "fang": case "blades": case "plasma3":
      for(const side of [-1,1]){const yy=cy+side*h*.27;glow(x+w*.3,yy,1+q*1.2);line(ctx,[[x+w*.22,yy],[x+w*.38,yy]],p.core,1);}
      break;
    case "frostshell": case "shards": case "chain":
      glow(x+w*.18,cy,1.4+q*2);line(ctx,[[x+w*.12,cy],[x+w*.27,cy]],"#d9f3ff",1.1);
      break;
    case "ambush": case "pinch": case "pincer":
      for(const side of [-1,1]){const yy=cy+side*h*.22;glow(x+w*.82,yy,1.3+q);line(ctx,[[x+w*.78,yy],[x+w*.96,yy]],p.trim,.9);}
      break;
    case "launch": case "armada": case "train": case "echo": case "playback": case "recall":
      rect(ctx,x+w*.68,cy-h*.14,w*.2,h*.28,p.dark,p.trim,.8);line(ctx,[[x+w*.69,cy-h*.1],[x+w*.85,cy]],p.core,.9);
      break;
    case "flame": case "blast": case "charge": case "dash": case "snap": case "lance": case "sweep": case "debris":
      glow(x+w*.12,cy,1.4+q*2.4);line(ctx,[[x+w*.08,cy],[x+w*.25,cy]],p.core,1.15);
      break;
    default:
      glow(cx,cy,Math.max(1.4,Math.min(w,h)*(.05+q*.05)));
  }
}

function drawModule(ctx:Ctx,e:Enemy,m:Mod,chapter:number,reduceMotion:boolean){
  const b=modBox(e,m),p=PALETTE[chapter],x=b.x,y=b.y,w=b.w,h=b.h,flash=m.flash>0;
  if(w<=0||h<=0)return;
  ctx.save();ctx.beginPath();ctx.rect(x+.4,y+.4,Math.max(0,w-.8),Math.max(0,h-.8));ctx.clip();
  const fill=flash?"#ffffff":p.dark;
  if(m.kind==="leg"){
    poly(ctx,[[x+w*.04,y+h*.08],[x+w*.72,y+h*.08],[x+w*.58,y+h*.42],[x+w*.9,y+h*.72],[x+w*.98,y+h*.88],[x+w*.38,y+h*.85],[x+w*.18,y+h*.48]],fill);
    line(ctx,[[x+w*.48,y+h*.28],[x+w*.4,y+h*.7],[x+w*.8,y+h*.78]],"#a5adba",.75);
  }else if(m.kind==="tank"){
    poly(ctx,[[x+.5,y+h*.3],[x+w*.14,y+.5],[x+w*.83,y+.5],[x+w-.5,y+h*.25],[x+w-.5,y+h*.8],[x+w*.18,y+h-.5],[x+.5,y+h*.74]],fill);
    rect(ctx,x+w*.28,y+h*.34,w*.48,h*.32,"#526c83");
    ctx.fillStyle=flash?"#fff":"#b5e9ff";ctx.fillRect(x+w*.35,y+h*.43,Math.max(1,w*.24),Math.max(1,h*.1));
  }else if(m.kind==="pod"){
    rect(ctx,x+.5,y+.5,w-1,h-1,fill);line(ctx,[[x+w*.2,y+h*.2],[x+w*.72,y+h*.2],[x+w*.84,y+h*.78],[x+w*.16,y+h*.78]],"#9c9584",.65);
    if(corvetTell(e).verb==="launch"&&corvetTell(e).charge>0){line(ctx,[[x+w*.45,y+h*.24],[x+w*.45,y+h*.76]],p.core,1.1);line(ctx,[[x+w*.55,y+h*.24],[x+w*.55,y+h*.76]],p.core,1.1);}
    else rect(ctx,x+w*.24,y+h*.32,w*.52,h*.36,"#11151b");
  }else if(m.kind==="mirror"){
    poly(ctx,[[x+w*.5,y+.5],[x+w-.5,y+h*.18],[x+w*.8,y+h*.98],[x+w*.12,y+h*.8]],flash?"#fff":"#b7b8d5");
    line(ctx,[[x+w*.5,y+h*.12],[x+w*.34,y+h*.7],[x+w*.76,y+h*.84]],"#f8fbff",.9);
  }else if(m.kind==="node"){
    ellipse(ctx,x+w/2,y+h/2,Math.max(1,w*.42),Math.max(1,h*.42),fill,p.trim,1);
    ellipse(ctx,x+w/2,y+h/2,Math.max(.7,w*.23),Math.max(.7,h*.23),"#11121a","#a9edff",.7);
    core(ctx,x+w/2,y+h/2,Math.max(.6,Math.min(w,h)*.1),p.core,true);
  }else if(m.kind==="shield"){
    poly(ctx,[[x+w*.5,y+.5],[x+w-.5,y+h*.28],[x+w*.82,y+h*.84],[x+w*.5,y+h-.5],[x+w*.18,y+h*.84],[x+.5,y+h*.28]],fill);
    ellipse(ctx,x+w/2,y+h*.54,w*.22,h*.24,p.trim);
  }else if(m.kind==="battery"){
    rect(ctx,x+.5,y+h*.22,w*.7,h*.56,fill);
    rect(ctx,x+w*.62,y+h*.38,w*.36,h*.24,flash?"#fff":"#8e8580");
    ctx.fillStyle=p.core;ctx.fillRect(x+w*.72,y+h*.43,w*.2,h*.14);
  }else if(m.kind==="engine"){
    poly(ctx,[[x+.5,y+h*.14],[x+w*.72,y+.5],[x+w-.5,y+h*.28],[x+w-.5,y+h*.72],[x+w*.72,y+h-.5],[x+.5,y+h*.86]],fill);
    ellipse(ctx,x+w*.25,y+h/2,Math.max(.8,w*.14),h*.24,"#10141b",p.trim,.9);
    if(!reduceMotion){poly(ctx,[[x+w*.08,y+h*.35],[x+.5,y+h*.5],[x+w*.08,y+h*.65]],"#fff1c9",INK,.5);}
  }else if(m.kind==="blade"){
    const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,"#fff");g.addColorStop(.45,"#a8e8ff");g.addColorStop(1,"#327fb6");
    poly(ctx,[[x+w*.22,y+h*.04],[x+w*.82,y+h*.2],[x+w*.98,y+h*.5],[x+w*.82,y+h*.8],[x+w*.22,y+h*.96],[x+w*.36,y+h*.5]],flash?"#fff":g);
    line(ctx,[[x+w*.34,y+h*.5],[x+w*.82,y+h*.5]],"#ffffff",.8);
  }else{
    ctx.save();ctx.translate(x+w/2,y+h/2);ctx.scale(.6,1);
    ctx.beginPath();ctx.ellipse(0,0,w*.46,h*.46,0,0,Math.PI*2);ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.stroke();
    ctx.strokeStyle=flash?"#fff":p.trim;ctx.lineWidth=1.6;ctx.stroke();ctx.restore();
    ctx.fillStyle="#02040a";ctx.beginPath();ctx.ellipse(x+w/2,y+h/2,w*.21,h*.31,0,0,Math.PI*2);ctx.fill();
    core(ctx,x+w/2,y+h/2,Math.max(.8,Math.min(w,h)*.08),p.core,true);
  }
  decorateOuterModule(ctx,e,m,chapter);
  const tell=corvetTell(e);
  if(m.verb==="hyper"&&tell.verb==="hyper"&&tell.charge>0){
    const muzzleX=x+w*.82,muzzleY=y+h*.5,r=1+tell.charge*2.2;
    ctx.beginPath();ctx.arc(muzzleX,muzzleY,r,0,Math.PI*2);ctx.fillStyle="#fff1c9";ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke();
  }
  if(m.verb==="launch"&&tell.verb==="launch"&&tell.charge>0){
    line(ctx,[[x+w*.45,y+h*.24],[x+w*.45,y+h*.76]],p.core,1.1);
    line(ctx,[[x+w*.55,y+h*.24],[x+w*.55,y+h*.76]],p.core,1.1);
  }
  /* Per-part health, within the part's own collision box. */
  ctx.fillStyle="rgb(8 10 16 / 0.86)";ctx.fillRect(x+1,y+h-2.2,Math.max(0,w-2),1.3);
  ctx.fillStyle="#fb7185";ctx.fillRect(x+1,y+h-2.2,Math.max(0,(w-2)*Math.max(0,m.hp/m.maxHp)),1.3);
  ctx.restore();
}

function drawMini(ctx:Ctx,e:Enemy,chapter:number,reduceMotion:boolean){
  const x=e.x,y=e.y,w=e.w,h=e.h;
  ctx.save();ctx.beginPath();ctx.rect(x+.4,y+.4,Math.max(0,w-.8),Math.max(0,h-.8));ctx.clip();
  paintOuterMachine(ctx,e,chapter,reduceMotion,true);
  drawMiniTell(ctx,e);
  ctx.restore();
  drawMiniPlate(ctx,e,chapter);
}

function drawMiniTell(ctx:Ctx,e:Enemy){
  const x=e.x,y=e.y,w=e.w,h=e.h,cx=x+w*.5,cy=y+h*.5;
  /* A mini's active tell is still attached to its own weapon or core. */
  const tell=corvetTell(e);
  if(tell.verb&&tell.charge>0){
    const muzzle=["hyper","lance","plasma3","flame","ionfan","frostshell"].includes(tell.verb);
    const bay=["launch","armada","bombs","salvo","broadside"].includes(tell.verb);
    const px=muzzle?x+w*.1:bay?x+w*.72:cx,py=tell.verb==="ionfan"?y+h*.24:cy,r=1.3+tell.charge*2;
    ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fillStyle="#fff1c9";ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke();
  }
}

function drawMiniPlate(ctx:Ctx,e:Enemy,chapter:number){
  const text=ACT2[chapter as keyof typeof ACT2].mini.toUpperCase();
  ctx.save();ctx.font="bold 5px monospace";const width=Math.min(104,Math.max(48,ctx.measureText(text).width+8));
  const x=Math.max(2,Math.min(W-width-2,e.x+e.w/2-width/2)),y=Math.max(2,e.y-12);
  ctx.fillStyle="rgb(5 10 18 / 0.92)";ctx.fillRect(x,y,width,10);
  ctx.strokeStyle=PALETTE[chapter].trim;ctx.lineWidth=.7;ctx.strokeRect(x+.35,y+.35,width-.7,9.3);
  ctx.fillStyle="#eaf4ff";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(text,x+width/2,y+4.1,width-5);
  ctx.fillStyle="#171717";ctx.fillRect(x+2,y+7,width-4,1.8);ctx.fillStyle="#fb7185";ctx.fillRect(x+2,y+7,(width-4)*Math.max(0,e.hp/e.maxHp),1.8);
  ctx.restore();
}

export function drawOuterBoss(ctx:Ctx,e:Enemy,s:State,reduceMotion=false):boolean{
  const mini=e.type.startsWith("mini"),boss=e.type.startsWith("boss");
  if(!mini&&!boss)return false;
  const chapter=Number(e.type.slice(4));if(!isAct2(chapter))return false;
  if(mini) drawMini(ctx,e,chapter,reduceMotion);
  else drawBossBody(ctx,e,s,chapter,reduceMotion);
  return true;
}

export function drawOuterBossLights(ctx: Ctx, s: State, reduceMotion: boolean) {
  if (s.chapter !== 25) return;
  for (const e of s.enemies) {
    if (e.type !== "boss25" && e.type !== "mini25") continue;
    paintVoidMachineLights(ctx,e);
    if (e.type === "boss25") drawBossTell(ctx,e,25,reduceMotion);
    else {
      ctx.save();ctx.beginPath();ctx.rect(e.x+.4,e.y+.4,Math.max(0,e.w-.8),Math.max(0,e.h-.8));ctx.clip();
      drawMiniTell(ctx,e);
      ctx.restore();
    }
  }
}
