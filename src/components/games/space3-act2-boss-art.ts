/* Eight outer-system bosses and their eight miniatures. Tells come from the live director state. */
import { W, modBox, type Enemy, type State } from "./space-logic.ts";
import { ACT2, ACT2_STAGES, isAct2, type Mod } from "./space3-act2.ts";
import { corvetTell } from "./space3-boss.ts";

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
function scaled(e: Enemy, pts: number[][]) { return pts.map(([x, y]) => [e.x + x * e.w, e.y + y * e.h]); }
function hull(ctx: Ctx, e: Enemy, pts: number[][], fill: string, hit: boolean) { poly(ctx, scaled(e, pts), hit ? "#ffffff" : fill); }
function core(ctx: Ctx, x: number, y: number, r: number, color: string, hot = false) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, Math.max(0.7, r * 0.32), 0, Math.PI * 2); ctx.fillStyle = hot ? "#fff1c9" : "#ffffff"; ctx.fill();
}
function drawBossBody(ctx: Ctx, e: Enemy, chapter: number, reduceMotion: boolean) {
  const p = PALETTE[chapter], { x, y, w, h } = e, cx = x + w * 0.52, cy = y + h * 0.5;
  const hit = e.flash > 0;
  const stageCount = ACT2_STAGES[e.type]?.length ?? 0;
  const trueForm = stageCount > 0 && (e.stage ?? 0) >= stageCount;
  const phase = e.a;
  const t = reduceMotion ? 0 : e.t;
  ctx.save(); ctx.beginPath(); ctx.rect(x + 0.4, y + 0.4, Math.max(0, w - 0.8), Math.max(0, h - 0.8)); ctx.clip();
  if (chapter === 21) {
    /* Tempest Raider: a long interceptor wrapped in swept wings and tip coils. */
    hull(ctx, e, [[0.03,.5],[.21,.32],[.7,.35],[.99,.45],[.99,.55],[.7,.65],[.21,.68]], p.hull, hit);
    hull(ctx, e, [[.16,.4],[.48,.02],[.82,.12],[.63,.43],[.29,.49]], p.dark, hit);
    hull(ctx, e, [[.16,.6],[.48,.98],[.82,.88],[.63,.57],[.29,.51]], p.dark, hit);
    line(ctx, [[x+w*.22,y+h*.32],[x+w*.62,y+h*.46],[x+w*.86,y+h*.46]], p.trim, 1.1);
    line(ctx, [[x+w*.22,y+h*.68],[x+w*.62,y+h*.54],[x+w*.86,y+h*.54]], p.trim, 1.1);
    for (const yy of [y+h*.11,y+h*.89]) { ellipse(ctx,x+w*.79,yy,3,2,p.trim); ctx.strokeStyle=INK; ctx.lineWidth=.8; ctx.stroke(); }
    core(ctx,x+w*.34,cy,Math.min(5,h*.13),p.core,phase>0);
    for (const yy of [cy-5,cy+5]) { rect(ctx,x+w*.9,yy-1.5,w*.08,3,p.trim); }
  } else if (chapter === 22) {
    /* Cryo-Colossus. The legs and back tank are independent vulnerable modules. */
    hull(ctx,e,[[.05,.47],[.17,.2],[.7,.16],[.95,.37],[.94,.76],[.72,.88],[.18,.82]],p.hull,hit);
    hull(ctx,e,[[.2,.3],[.43,.22],[.53,.4],[.44,.72],[.2,.68]],p.dark,hit);
    rect(ctx,x+w*.57,y+h*.35,w*.27,h*.17,p.dark);
    line(ctx,[[x+w*.56,y+h*.43],[x+w*.86,y+h*.43]],phase>0?p.core:p.trim,1.2);
    for (let i=0;i<4;i++) { const xx=x+w*(.22+i*.16); ctx.fillStyle="#aeb9c5"; ctx.fillRect(xx,y+h*.19,1.2,1.2); }
    core(ctx,x+w*.46,cy,Math.min(7,h*.1),trueForm?p.core:p.trim,phase>1);
    if (trueForm) {
      for (const xx of [x+w*.29,x+w*.7]) { poly(ctx,[[xx-3,y+h*.83],[xx,y+h*.94],[xx+3,y+h*.83]],"#b5efff"); line(ctx,[[xx-2,y+h*.98],[xx,y+h*.91],[xx+2,y+h*.98]],"#fff1c9",1); }
    }
  } else if (chapter === 23) {
    /* Iron Goliath: broad armored carrier, with a bruised interior in true form. */
    hull(ctx,e,[[.01,.5],[.1,.25],[.29,.14],[.77,.18],[.99,.38],[.99,.62],[.77,.82],[.29,.86],[.1,.75]],p.hull,hit);
    hull(ctx,e,[[.13,.3],[.72,.25],[.9,.4],[.9,.6],[.72,.75],[.13,.7]],p.dark,hit);
    for (let i=0;i<5;i++) {
      const xx=x+w*(.22+i*.13); line(ctx,[[xx,y+h*.27],[xx+3,y+h*.73]],"#8c8273",.75);
    }
    for (const yy of [y+h*.22,y+h*.78]) {
      for (let i=0;i<4;i++) { const xx=x+w*(.18+i*.2); rect(ctx,xx,yy-2.2,w*.09,4.4,p.dark); line(ctx,[[xx+1,yy],[xx+w*.09-1,yy]],trueForm?p.trim:"#fbcf33",.7); }
    }
    core(ctx,x+w*.46,cy,Math.min(7,h*.12),trueForm?"#fb7185":p.trim,trueForm);
    if(trueForm){
      for(let i=0;i<7;i++){const xx=x+w*(.2+i*.1);line(ctx,[[xx,y+h*.25],[xx+((i%2)?-3:4),cy],[xx,y+h*.74]],"#fb7185",1.2);}
      for(const yy of [y+h*.34,y+h*.66]){poly(ctx,[[x+w*.86,yy-3],[x+w*.99,yy-2],[x+w*.99,yy+2],[x+w*.86,yy+3]],"#d2c6ab");}
    }
  } else if (chapter === 24) {
    /* Aegis-Null: mirrored octagonal body. Once its mirrors fall, only the core remains. */
    const r = Math.min(w,h)*(.46 - phase*.02);
    if(!trueForm){
      const pts:number[][]=[]; for(let i=0;i<8;i++){const a=i*Math.PI/4+Math.PI/8;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}
      poly(ctx,pts,hit?"#fff":p.hull);
      for(let i=0;i<4;i++){const a=i*Math.PI/2+t/180;line(ctx,[[cx+Math.cos(a)*r*.45,cy+Math.sin(a)*r*.45],[cx+Math.cos(a)*r*.77,cy+Math.sin(a)*r*.77]],"#9ba4c3",1);}
      ellipse(ctx,cx,cy,r*.39,r*.39,p.dark,p.trim,1);
      core(ctx,cx,cy,r*.19,p.core,phase>1);
    }else{
      ellipse(ctx,cx,cy,r*.48,r*.48,p.dark,p.trim,1.2); core(ctx,cx,cy,r*.31,"#e9ddff",true);
      for(let i=0;i<8;i++){const a=i*Math.PI/4+t/95;line(ctx,[[cx+Math.cos(a)*r*.52,cy+Math.sin(a)*r*.52],[cx+Math.cos(a)*r*.78,cy+Math.sin(a)*r*.78]],p.trim,.8);}
    }
  } else if (chapter === 25) {
    /* Void Stalker: a low, nearly lightless hull with a single readable eye. */
    ctx.globalAlpha *= trueForm ? 0.95 : 0.78;
    hull(ctx,e,[[.01,.5],[.25,.17],[.75,.27],[.99,.5],[.75,.73],[.25,.83]],p.hull,hit);
    hull(ctx,e,[[.25,.32],[.53,.39],[.74,.5],[.53,.61],[.25,.68]],p.dark,hit);
    line(ctx,[[x+w*.21,y+h*.22],[x+w*.43,y+h*.5],[x+w*.21,y+h*.78]],"#55515b",.8);
    core(ctx,x+w*.17,cy,Math.max(1.7,h*.1),"#f472b6",true);
    if(trueForm){line(ctx,[[x+w*.37,y+h*.28],[x+w*.67,cy],[x+w*.37,y+h*.72]],"#fb7185",1.2);}
  } else if (chapter === 26) {
    /* Ring Keeper: a contained ancient sphere; true form has its core exposed. */
    const r=Math.min(w,h)*.33;
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(reduceMotion?0:t/140); ctx.scale(0.76,1);
    ctx.beginPath();ctx.ellipse(0,0,r*1.58,r*1.58,0,0,Math.PI*2);ctx.strokeStyle=p.trim;ctx.lineWidth=3;ctx.stroke();
    ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke(); ctx.restore();
    if(!trueForm){
      ellipse(ctx,cx,cy,r,r,p.hull);
      ellipse(ctx,cx,cy,r*.68,r*.68,p.dark,p.trim,1);
      for(let i=0;i<8;i++){const a=i*Math.PI/4;line(ctx,[[cx+Math.cos(a)*r*.45,cy+Math.sin(a)*r*.45],[cx+Math.cos(a)*r*.9,cy+Math.sin(a)*r*.9]],"#b0a67c",.65);}
      core(ctx,cx,cy,r*.3,p.core,phase>1);
    }else{
      ellipse(ctx,cx,cy,r*.58,r*.58,p.dark,p.trim,1.2); core(ctx,cx,cy,r*.38,"#fff1c9",true);
      for(let i=0;i<6;i++){const a=i*Math.PI/3;line(ctx,[[cx+Math.cos(a)*r*.62,cy+Math.sin(a)*r*.62],[cx+Math.cos(a)*r*.92,cy+Math.sin(a)*r*.92]],p.trim,1);}
    }
  } else if (chapter === 27) {
    /* Warmaster: particle cannon, armor cheeks, battery sockets and rear engine. */
    hull(ctx,e,[[.02,.34],[.2,.14],[.67,.08],[.9,.2],[.99,.38],[.92,.62],[.99,.8],[.68,.92],[.19,.86],[.02,.66]],p.hull,hit);
    hull(ctx,e,[[.16,.3],[.66,.2],[.83,.36],[.83,.64],[.66,.8],[.16,.7]],p.dark,hit);
    poly(ctx,[[x+w*.16,y+h*.32],[x+w*.44,y+h*.4],[x+w*.44,y+h*.6],[x+w*.16,y+h*.68]],hit?"#fff":"#78605a");
    for(let i=0;i<4;i++){
      const yy=y+h*(.34+i*.11); line(ctx,[[x+w*.42,yy],[x+w*.79,yy]],trueForm?"#fff1c9":"#9b7e73",.75);
    }
    core(ctx,x+w*.55,cy,Math.min(8,h*.11),trueForm?"#ffffff":p.trim,trueForm);
    if(trueForm){
      for(const yy of [y+h*.18,y+h*.82]){poly(ctx,[[x+w*.77,yy],[x+w*.99,yy+h*.1],[x+w*.99,yy+h*.18],[x+w*.77,yy+h*.18]],"#7d343b");}
      line(ctx,[[x+w*.33,y+h*.29],[x+w*.69,cy],[x+w*.33,y+h*.71]],"#fff1c9",1.5);
    }
  } else {
    /* The Herald: cathedral geometry, then a collapsed singularity and a cracked overdrive core. */
    const form=e.stage??0;
    if(form===0){
      hull(ctx,e,[[.5,.02],[.74,.16],[.84,.39],[.78,.75],[.65,.96],[.35,.96],[.22,.75],[.16,.39],[.26,.16]],p.hull,hit);
      hull(ctx,e,[[.5,.1],[.62,.25],[.58,.66],[.5,.78],[.42,.66],[.38,.25]],p.dark,hit);
      line(ctx,[[x+w*.27,y+h*.19],[x+w*.5,y+h*.06],[x+w*.73,y+h*.19]],p.trim,1);
      for(const yy of [.3,.5,.7]) line(ctx,[[x+w*.28,y+h*yy],[x+w*.72,y+h*yy]],"#789bb4",.65);
      core(ctx,cx,cy,Math.min(9,w*.09),"#c9efff",phase>1);
    }else if(form===1){
      hull(ctx,e,[[.5,.03],[.77,.2],[.72,.43],[.61,.52],[.71,.78],[.5,.97],[.29,.78],[.39,.52],[.28,.43],[.23,.2]],p.hull,hit);
      ellipse(ctx,x+w*.31,cy,Math.min(12,w*.14),h*.4,"#080b15",p.trim,1.5);
      ellipse(ctx,x+w*.31,cy,Math.min(8,w*.095),h*.32,"#142b53","#b5eaff",1);
      core(ctx,x+w*.52,cy,Math.min(8,w*.08),"#dff7ff",true);
      for(let i=0;i<5;i++){const yy=y+h*(.18+i*.16);line(ctx,[[x+w*.12,yy],[x+w*.27,yy]],"#a8e8ff",.7);}
    }else{
      hull(ctx,e,[[.5,.01],[.78,.13],[.91,.36],[.82,.51],[.92,.72],[.68,.96],[.5,.82],[.32,.97],[.08,.72],[.18,.5],[.08,.33],[.28,.12]],"#dce9f3",hit);
      poly(ctx,[[x+w*.33,y+h*.28],[x+w*.67,y+h*.27],[x+w*.72,y+h*.62],[x+w*.5,y+h*.78],[x+w*.29,y+h*.61]],"#102848","#171717",.8);
      core(ctx,cx,cy,Math.min(15,w*.15),"#ffffff",true);
      for(let i=0;i<7;i++){const px=x+w*(.2+i*.1);line(ctx,[[px,y+h*.18],[px+(i%2?3:-3),cy],[px,y+h*.83]],i%2?"#fb7185":"#a8e8ff",1.05);}
    }
  }
  /* Charged weapons alter the machine itself; no lane, reticle or projected safe zone. */
  drawBossTell(ctx,e,chapter,reduceMotion);
  ctx.restore();
  for (const m of e.mods ?? []) if (m.hp > 0) drawModule(ctx,e,m,chapter,reduceMotion);
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
      ctx.save();ctx.globalAlpha=reduceMotion ? .12 : .08+q*.08;ctx.fillStyle="#ffffff";ctx.fillRect(x+1,y+1,w-2,h-2);ctx.restore();
      line(ctx,[[x+w*.24,y+h*.25],[x+w*(.24+q*.12),y+h*.5],[x+w*.24,y+h*.75]],"#ffffff",.85);
      break;
    case "gravity": case "ring": case "lattice": case "scan": case "coil": case "surge": case "minefield":
      ctx.beginPath();ctx.ellipse(cx,cy,Math.min(w,h)*(.18+q*.13),Math.min(w,h)*(.22+q*.12),0,0,Math.PI*2);ctx.strokeStyle=p.core;ctx.lineWidth=1+q;ctx.stroke();glow(cx,cy,Math.min(w,h)*(.07+q*.04));
      break;
    case "hyper":
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
  const tell=corvetTell(e);
  if(m.verb==="hyper"&&tell.verb==="hyper"&&tell.charge>0){
    const muzzleX=x+w*.82,muzzleY=y+h*.5,r=1+tell.charge*2.2;
    ctx.beginPath();ctx.arc(muzzleX,muzzleY,r,0,Math.PI*2);ctx.fillStyle="#fff1c9";ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke();
  }
  /* Per-part health, within the part's own collision box. */
  ctx.fillStyle="rgb(8 10 16 / 0.86)";ctx.fillRect(x+1,y+h-2.2,Math.max(0,w-2),1.3);
  ctx.fillStyle="#fb7185";ctx.fillRect(x+1,y+h-2.2,Math.max(0,(w-2)*Math.max(0,m.hp/m.maxHp)),1.3);
  ctx.restore();
}

function drawMini(ctx:Ctx,e:Enemy,chapter:number){
  const p=PALETTE[chapter],x=e.x,y=e.y,w=e.w,h=e.h,cx=x+w*.5,cy=y+h*.5,hit=e.flash>0;
  ctx.save();ctx.beginPath();ctx.rect(x+.4,y+.4,Math.max(0,w-.8),Math.max(0,h-.8));ctx.clip();
  switch(chapter){
    case 21:
      hull(ctx,e,[[.02,.5],[.19,.18],[.82,.27],[.98,.5],[.82,.73],[.19,.82]],p.hull,hit);
      for(const side of [-1,1]){ellipse(ctx,x+w*.25,y+h*(.23+(side>0?.55:0)),w*.09,h*.12,p.dark,p.trim,.8);}
      line(ctx,[[x+w*.24,cy],[x+w*.76,cy]],p.trim,.9);core(ctx,cx,cy,Math.min(5,h*.15),p.core,true);break;
    case 22:
      hull(ctx,e,[[.15,.26],[.82,.18],[.95,.5],[.82,.82],[.15,.74]],p.hull,hit);
      for(const side of [-1,1]){line(ctx,[[x+w*.25,cy+side*h*.16],[x+w*.12,cy+side*h*.42],[x+w*.02,cy+side*h*.46]],"#aebac8",1.4);line(ctx,[[x+w*.65,cy+side*h*.16],[x+w*.8,cy+side*h*.43],[x+w*.96,cy+side*h*.46]],"#aebac8",1.4);}
      poly(ctx,[[x+w*.12,cy-2],[x+w*.46,cy-3],[x+w*.62,cy],[x+w*.46,cy+3],[x+w*.12,cy+2]],"#c4d7e8");core(ctx,x+w*.68,cy,3,p.trim,true);break;
    case 23:
      hull(ctx,e,[[.02,.38],[.18,.16],[.85,.2],[.98,.4],[.98,.62],[.8,.84],[.16,.8]],p.hull,hit);
      for(let i=0;i<3;i++){rect(ctx,x+w*(.24+i*.2),y+h*.22,w*.13,h*.56,p.dark);line(ctx,[[x+w*(.27+i*.2),y+h*.3],[x+w*(.33+i*.2),y+h*.7]],p.trim,.65);}
      core(ctx,x+w*.14,cy,3,p.core,false);break;
    case 24:{
      const r=Math.min(w,h)*.45,pts:number[][]=[];for(let i=0;i<8;i++){const a=i*Math.PI/4;pts.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}
      poly(ctx,pts,p.hull);ellipse(ctx,cx,cy,r*.38,r*.38,p.dark,p.trim,.9);core(ctx,cx,cy,r*.17,p.core,true);break;
    }
    case 25:
      ctx.globalAlpha=.72;hull(ctx,e,[[.02,.5],[.18,.15],[.78,.24],[.98,.5],[.78,.76],[.18,.85]],p.dark,hit);ctx.globalAlpha=1;
      core(ctx,x+w*.18,cy,2.6,"#f472b6",true);for(let i=0;i<3;i++)ctx.fillRect(x+w*(.55+i*.1),y+h*.2,1,1);break;
    case 26:
      ctx.beginPath();ctx.ellipse(cx,cy,w*.43,h*.45,0,0,Math.PI*2);ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle=p.trim;ctx.lineWidth=1.1;ctx.stroke();
      ellipse(ctx,cx,cy,w*.26,h*.27,p.hull);core(ctx,cx,cy,Math.min(5,w*.1),p.core,true);break;
    case 27:
      hull(ctx,e,[[.03,.2],[.88,.15],[.98,.35],[.98,.65],[.88,.85],[.03,.8]],p.hull,hit);
      rect(ctx,x+w*.25,y+h*.19,w*.42,h*.62,p.dark);for(let i=0;i<3;i++)line(ctx,[[x+w*.3,y+h*(.3+i*.2)],[x+w*.66,y+h*(.3+i*.2)]],p.trim,.85);
      core(ctx,x+w*.78,cy,Math.min(5,h*.12),p.core,true);break;
    default:
      hull(ctx,e,[[.5,.02],[.8,.2],[.7,.8],[.5,.98],[.3,.8],[.2,.2]],p.hull,hit);
      for(const side of [-1,1]){line(ctx,[[cx,cy],[cx+side*w*.45,y+h*.16],[cx+side*w*.47,y+h*.3]],"#a8e8ff",2);}
      core(ctx,cx,cy,Math.min(6,w*.1),p.core,true);
  }
  /* A mini's active tell is still attached to its own weapon or core. */
  const tell=corvetTell(e);
  if(tell.verb&&tell.charge>0){
    const muzzle=["hyper","lance","plasma3","flame","ionfan","frostshell"].includes(tell.verb);
    const bay=["launch","armada","bombs","salvo","broadside"].includes(tell.verb);
    const px=muzzle?x+w*.1:bay?x+w*.72:cx,py=tell.verb==="ionfan"?y+h*.24:cy,r=1.3+tell.charge*2;
    ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fillStyle="#fff1c9";ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke();
  }
  ctx.restore();
  drawMiniPlate(ctx,e,chapter);
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
  if(mini) drawMini(ctx,e,chapter);
  else drawBossBody(ctx,e,chapter,reduceMotion);
  return true;
}
