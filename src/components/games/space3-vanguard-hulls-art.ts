import type { Enemy, State } from "./space-logic.ts";
import { escortKit } from "./space3-escort-kit.ts";

const TYPES=new Set(["scout","diver","fighter","gunner","sniper","armor","cruiser","bomber","splitter","orbiter","drone","swarm","zigzag","wave","seeker"]);

/* Hulls only. The existing iris, exact enemyMuzzle barrels, drone flame nozzle
   and all attack warnings are still painted by drawVanguard afterwards. */
export function drawVanguardHull(ctx:CanvasRenderingContext2D,e:Enemy,s:State,reduceMotion:boolean):boolean{
  if(!TYPES.has(e.type))return false;
  // Keep the Ceres mining machines, Jovian ice sniper and Reclaimer salvage craft.
  if(s.chapter===18&&["bomber","splitter"].includes(e.type)||s.chapter===19&&e.type==="sniper"||s.chapter===20&&["drone","fighter"].includes(e.type))return false;
  const k=escortKit(ctx,e),v="#776294",steel="#b3b8ce",dark="#302940",gold="#bda04e";
  const tier=s.chapter>=25?2:s.chapter>=21?1:0,t=reduceMotion?0:e.t,low=e.hp<e.maxHp*.4;
  switch(e.type){
    case "bomber":case "cruiser":{
      const heavy=e.type==="cruiser";
      k.poly([[.04,.5],[.17,.21],[.76,.16],[.97,.31],[.97,.69],[.76,.84],[.17,.79]],dark);
      for(const side of [-1,1]){
        const y=(n:number)=>.5+side*n;
        k.poly([[.12,y(.2)],[.32,y(.43)],[.81,y(.39)],[.94,y(.22)],[.64,y(.15)]],v);
        const bays=heavy?3:2;
        for(let i=0;i<bays;i++){
          const x=.3+i*(heavy?.18:.24);k.box(x,y(.3),.13,.1,steel);k.box(x+.025,y(.3)+.025,.08,.045,"#141522");
          k.line([[x+.015,y(.3)],[x+.1,y(.3)]],gold,.5);
        }
        k.box(.86,y(.13)-.045,.1,.09,steel);k.light(.94,y(.13),.5,"#c4b5fd");
      }
      k.poly([[.25,.37],[.39,.24],[.56,.28],[.59,.4],[.43,.44]],steel);k.box(.37,.31,.13,.06,dark);k.bolts(.62,.46,2);
      break;
    }
    case "sniper":
      k.poly([[.05,.47],[.57,.32],[.84,.15],[.98,.31],[.9,.71],[.67,.83],[.47,.62],[.05,.56]],v);
      k.box(.2,.42,.5,.15,steel);k.box(.38,.45,.35,.09,dark);
      k.poly([[.63,.29],[.72,.05],[.9,.13],[.82,.36]],steel);k.poly([[.63,.71],[.72,.95],[.9,.87],[.82,.64]],steel);k.vents(.76,.39,2);break;
    case "gunner":
      k.poly([[.13,.5],[.26,.2],[.72,.17],[.91,.4],[.84,.73],[.36,.81]],dark);
      for(const y of [.12,.73]){k.box(.3,y,.53,.15,v);k.bolts(.38,y+.045,3);}
      k.disc(.5,.5,e.h*.23,steel,e.h*.2);k.box(.65,.3,.19,.34,v);k.vents(.7,.36,2);break;
    case "armor":
      k.poly([[.04,.5],[.25,.07],[.73,.1],[.97,.5],[.73,.9],[.25,.93]],steel);
      k.poly([[.14,.5],[.33,.2],[.7,.24],[.87,.5],[.7,.76],[.33,.8]],dark);
      for(const side of [-1,1]){
        const y=(n:number)=>.5+side*n;
        k.poly([[.1,y(.08)],[.27,y(.4)],[.69,y(.34)],[low?.73:.9,y(.15)],[.44,y(.12)]],v);
        k.bolts(.33,y(.29),3);k.line([[.34,y(.2)],[.66,y(.24)]],steel);
      }k.vents(.69,.43,2);break;
    case "orbiter":{
      const r=Math.min(e.w,e.h)*.42;
      ctx.beginPath();ctx.ellipse(k.X(.5),k.Y(.5),r,r,0,0,Math.PI*2);ctx.strokeStyle=gold;ctx.lineWidth=.6;ctx.stroke();
      for(let i=0;i<3;i++){
        const a=t/100+i*Math.PI*2/3,x=.5+Math.cos(a)*.32,y=.5+Math.sin(a)*.32;
        k.line([[.5,.5],[x,y]],steel,.9);k.disc(x,y,1.25,v);k.light(x,y,.55,"#e9d5ff");
      }
      k.poly([[.31,.4],[.5,.26],[.69,.4],[.69,.6],[.5,.74],[.31,.6]],dark);break;
    }
    case "splitter":
      k.box(.4,.16,.2,.68,steel);
      for(const y of [.26,.74]){
        k.poly([[.08,y],[.26,y-.18],[.77,y-.16],[.94,y],[.77,y+.16],[.26,y+.18]],v);
        k.box(.56,y-.09,.18,.18,dark);k.light(.17,y,.65,"#fbcf33");
      }
      k.line([[.12,.5],[.87,.5]],"#c4b5fd",.8);
      // The blade ports remain at the existing left-side emitter positions.
      for(const y of [.26,.74])k.line([[.06,y],[.19,y]],e.cd<=1?"#fff1cc":steel,.8);break;
    case "swarm":
      for(const side of [-1,1]){
        const y=(n:number)=>.5+side*n;
        k.poly([[.27,y(.06)],[.42,y(.36)],[.65,y(.46)],[.87,y(.36)],[.63,y(.22)]],v);
        k.poly([[.56,y(.05)],[.68,y(.22)],[.94,y(.28)],[.82,y(.08)]],steel);
      }k.poly([[.06,.5],[.38,.32],[.68,.5],[.38,.68]],dark);break;
    case "scout":
      k.poly([[.03,.5],[.39,.3],[.74,.08],[.94,.16],[.67,.4],[.89,.5],[.67,.6],[.94,.84],[.74,.92],[.39,.7]],v);
      k.poly([[.21,.5],[.51,.38],[.69,.5],[.51,.62]],dark);k.line([[.65,.2],[.79,.17]],steel);k.light(.86,.5,.5,"#c4b5fd");break;
    case "diver":
      k.poly([[.03,.5],[.47,.07],[.71,.04],[.58,.37],[.96,.5],[.58,.63],[.71,.96],[.47,.93]],v);
      k.poly([[.11,.5],[.36,.3],[.48,.12],[.45,.5],[.48,.88],[.36,.7]],steel);
      k.box(.64,.42,.2,.16,dark);k.light(.84,.5,.6,"#c4b5fd");break;
    case "fighter":
      for(const side of [-1,1]){
        const y=(n:number)=>.5+side*n;
        k.poly([[.28,y(.04)],[.64,y(.44)],[.94,y(.36)],[.79,y(.13)]],steel);
        k.poly([[.49,y(.16)],[.67,y(.35)],[.8,y(.3)],[.66,y(.12)]],v);
        k.box(.79,y(.25)-.05,.12,.1,dark);k.light(.92,y(.25),.5,"#c4b5fd");
      }k.poly([[.02,.5],[.35,.34],[.76,.39],[.88,.5],[.76,.61],[.35,.66]],dark);break;
    case "wave":
      k.poly([[.04,.5],[.3,.13],[.63,.04],[.92,.17],[.75,.33],[.42,.31],[.3,.5],[.42,.69],[.75,.67],[.92,.83],[.63,.96],[.3,.87]],v);
      k.poly([[.29,.5],[.48,.33],[.81,.39],[.95,.5],[.81,.61],[.48,.67]],dark);
      for(const y of [.24,.76])k.light(.62,y,.65,"#e9d5ff");break;
    case "zigzag":
      k.poly([[.02,.5],[.26,.1],[.43,.32],[.65,.05],[.9,.2],[.7,.48],[.94,.72],[.62,.92],[.43,.68],[.28,.9],[.24,.62]],v);
      k.line([[.26,.24],[.41,.51],[.62,.24],[.69,.51],[.58,.73]],steel,.8);break;
    case "drone":
      k.poly([[.15,.5],[.34,.18],[.72,.09],[.94,.32],[.94,.68],[.72,.91],[.34,.82]],v);
      for(const y of [.18,.71])k.box(.44,y,.3,.11,steel);k.box(.7,.37,.2,.26,dark);break;
    case "seeker":
      k.poly([[.03,.5],[.22,.3],[.68,.34],[.85,.08],[.96,.12],[.84,.5],[.96,.88],[.85,.92],[.68,.66],[.22,.7]],steel);
      k.box(.35,.36,.34,.28,v);k.line([[.65,.39],[.65,.61]],gold,.8);break;
  }
  // Extra cheek plates and exposed seams mark later deployments within the same box.
  if(tier>0){
    for(const side of [-1,1]){
      const y=(n:number)=>.5+side*n;
      k.poly([[.63,y(.22)],[.73,y(.36)],[.89,y(.3)],[.83,y(.17)]],steel);
      if(tier>1)k.line([[.65,y(.24)],[.8,y(.27)],[.86,y(.22)]],"#d3b6ff",.65);
    }
  }
  if(low)k.line([[.7,.26],[.62,.39],[.75,.46]],"#fb7185",.65);
  return true;
}
