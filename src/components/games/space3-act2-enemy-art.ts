/* Outer-system escorts and hazards with a body: the five new craft, mines, comets and debris. */
import { type Enemy, type State } from "./space-logic.ts";
import { isAct2 } from "./space3-act2.ts";
import { drawOuterEscort } from "./space3-outer-escort-art.ts";

type Ctx = CanvasRenderingContext2D;
const INK = "#171717";
function poly(ctx:Ctx,pts:number[][],fill:string,edge=INK){if(pts.length<3)return;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=edge;ctx.lineWidth=.8;ctx.lineJoin="round";ctx.stroke();}
function line(ctx:Ctx,pts:number[][],color:string,width=.75){ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin="round";ctx.stroke();}
function circle(ctx:Ctx,x:number,y:number,r:number,fill:string){ctx.beginPath();ctx.arc(x,y,Math.max(.3,r),0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=.8;ctx.stroke();}
function bodyClip(ctx:Ctx,e:Enemy){ctx.beginPath();ctx.rect(e.x+.4,e.y+.4,Math.max(0,e.w-.8),Math.max(0,e.h-.8));ctx.clip();}

export function drawOuterEnemy(ctx:Ctx,e:Enemy,s:State,reduceMotion=false):boolean{
  if(!isAct2(s.chapter))return false;
  const {x,y,w,h}=e,cx=x+w/2,cy=y+h/2,t=reduceMotion?0:e.t,hit=e.flash>0;
  if(!["lancer","magnet","frigate","hangar","shade","mine","comet","boulder","drone"].includes(e.type))return false;
  ctx.save();bodyClip(ctx,e);
  if(drawOuterEscort(ctx,e,s,reduceMotion)){ctx.restore();return true;}
  switch(e.type){
    case "mine":{
      const lit=reduceMotion?true:Math.floor(e.t/18)%2===0;
      for(let i=0;i<8;i++){const a=i*Math.PI/4+t/70,px=cx+Math.cos(a)*w*.36,py=cy+Math.sin(a)*h*.36;line(ctx,[[cx,cy],[px,py]],"#646b75",.8);circle(ctx,px,py,Math.max(.7,Math.min(w,h)*.06),"#5d6672");}
      circle(ctx,cx,cy,Math.min(w,h)*.3,hit?"#fff":"#202832");
      circle(ctx,cx,cy,Math.max(1.1,Math.min(w,h)*.12),lit?"#fb7185":"#35202a");
      if(lit){ctx.fillStyle="rgb(251 113 133 / .25)";ctx.beginPath();ctx.arc(cx,cy,Math.min(w,h)*.48,0,Math.PI*2);ctx.fill();circle(ctx,cx,cy,.8,"#fff1c9");}
      break;
    }
    case "comet":{
      /* Tail is glow only; the collision body is the outlined, bright nucleus. */
      ctx.save();const tail=ctx.createLinearGradient(x+w*.15,cy,x+w+22,cy);tail.addColorStop(0,"rgb(255 214 152 / .7)");tail.addColorStop(1,"rgb(251 113 133 / 0)");ctx.fillStyle=tail;ctx.beginPath();ctx.moveTo(x+w*.1,cy-h*.15);ctx.lineTo(x+w+22,cy);ctx.lineTo(x+w*.1,cy+h*.15);ctx.closePath();ctx.fill();ctx.restore();
      poly(ctx,[[x+w*.04,cy],[x+w*.25,y+h*.15],[x+w*.72,y+h*.05],[x+w*.98,cy],[x+w*.72,y+h*.95],[x+w*.25,y+h*.85]],hit?"#fff":"#7d4b3a");
      poly(ctx,[[x+w*.22,cy],[x+w*.42,y+h*.2],[x+w*.82,cy],[x+w*.42,y+h*.8]],"#ffab58");
      circle(ctx,x+w*.35,cy,Math.max(1,h*.13),"#fff1c9");break;
    }
    case "boulder":{
      const pts:number[][]=[];for(let i=0;i<9;i++){const a=i*Math.PI*2/9,r=.35+((Math.sin(e.id*7+i*2.1)+1)/2)*.15;pts.push([cx+Math.cos(a)*w*r,cy+Math.sin(a)*h*r]);}
      poly(ctx,pts,hit?"#fff":"#635a53");
      line(ctx,[[x+w*.2,y+h*.35],[x+w*.45,y+h*.24],[x+w*.55,y+h*.42]],"#b2a391",.7);
      for(let i=0;i<3;i++){circle(ctx,x+w*(.28+i*.2),y+h*(.56+(i%2)*.1),Math.max(.7,h*.045),"#292a2c");}
      circle(ctx,cx,cy,Math.max(.8,h*.07),"#fff1c9");break;
    }
  }
  ctx.restore();return true;
}
