/* Outer-system escorts and hazards with a body: the five new craft, mines, comets and debris. */
import { type Enemy, type State } from "./space-logic.ts";
import { isAct2 } from "./space3-act2.ts";

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
  switch(e.type){
    case "lancer":{
      poly(ctx,[[x+w*.04,cy],[x+w*.23,y+h*.12],[x+w*.83,y+h*.18],[x+w*.98,cy],[x+w*.83,y+h*.82],[x+w*.23,y+h*.88]],hit?"#fff":"#394954");
      poly(ctx,[[x+w*.14,cy-2],[x+w*.9,cy-1.1],[x+w*.98,cy],[x+w*.9,cy+1.1],[x+w*.14,cy+2]],"#627888");
      line(ctx,[[x+w*.28,y+h*.23],[x+w*.72,y+h*.33],[x+w*.72,y+h*.67],[x+w*.28,y+h*.77]],"#8199a4",.65);
      const charging=e.d>0;circle(ctx,x+w*.08,cy,charging?2.5:1.6,charging?"#fff1c9":"#fb7185");
      if(charging){for(const side of [-1,1]){line(ctx,[[x+w*.52,cy+side*h*.25],[x+w*.66,cy+side*h*.42]],"#fff1c9",.75);line(ctx,[[x+w*.45,cy+side*h*.22],[x+w*.45,cy+side*h*.4]],"#5eead4",.7);}}
      break;
    }
    case "magnet":{
      const d=Math.hypot(cx-(s.p.x+10),cy-(s.p.y+8)),strength=Math.max(0,1-d/130);
      circle(ctx,cx,cy,w*.42,hit?"#fff":"#253d4d");
      ctx.strokeStyle="#5eead4";ctx.lineWidth=1.2;
      for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(cx,cy,w*(.23+i*.13),h*(.23+i*.13),0,0,Math.PI*2);ctx.stroke();}
      circle(ctx,cx,cy,Math.max(1,w*.12),strength>.25?"#fff1c9":"#67e8f9");
      if(strength>.25){ctx.strokeStyle=`rgb(94 234 212 / ${.25+strength*.45})`;ctx.lineWidth=.7;for(let i=0;i<4;i++){const a=i*Math.PI/2+t/40;ctx.beginPath();ctx.arc(cx,cy,w*.43,a,a+.72);ctx.stroke();}}
      break;
    }
    case "frigate":{
      poly(ctx,[[x+w*.02,cy],[x+w*.19,y+h*.16],[x+w*.82,y+h*.08],[x+w*.99,y+h*.28],[x+w*.99,y+h*.72],[x+w*.82,y+h*.92],[x+w*.19,y+h*.84]],hit?"#fff":"#465767");
      poly(ctx,[[x+w*.22,y+h*.22],[x+w*.75,y+h*.19],[x+w*.84,y+h*.42],[x+w*.3,y+h*.43]],"#2b3946");
      for(let i=0;i<3;i++){const xx=x+w*(.3+i*.17), lift=e.cd<20?2:0;poly(ctx,[[xx,cy-2],[xx+2,y+h*.14-lift],[xx+7,y+h*.14-lift],[xx+9,cy-1]],"#8193a4");circle(ctx,xx+5,y+h*.16-lift,1,e.cd<20?"#fff1c9":"#8bb7cc");}
      line(ctx,[[x+w*.28,y+h*.6],[x+w*.74,y+h*.6]],"#71899b",.7);
      break;
    }
    case "hangar":{
      poly(ctx,[[x+w*.04,y+h*.18],[x+w*.24,y+h*.04],[x+w*.96,y+h*.14],[x+w*.96,y+h*.86],[x+w*.24,y+h*.96],[x+w*.04,y+h*.82]],hit?"#fff":"#4b4d4c");
      poly(ctx,[[x+w*.12,y+h*.24],[x+w*.43,y+h*.3],[x+w*.43,y+h*.7],[x+w*.12,y+h*.76]],"#15191f");
      const open=e.cd>0&&e.cd<22;
      if(open){poly(ctx,[[x+w*.12,y+h*.24],[x+w*.4,y+h*.3],[x+w*.34,y+h*.42],[x+w*.12,y+h*.38]],"#a7a18e");poly(ctx,[[x+w*.12,y+h*.62],[x+w*.34,y+h*.58],[x+w*.4,y+h*.7],[x+w*.12,y+h*.76]],"#a7a18e");}
      else line(ctx,[[x+w*.15,y+h*.5],[x+w*.4,y+h*.5]],"#a7a18e",.8);
      for(const yy of [y+h*.2,y+h*.8]){circle(ctx,x+w*.79,yy,1.5,e.cd<22?"#fff1c9":"#fbcf33");}
      break;
    }
    case "shade":{
      const firing=reduceMotion||e.t%50===0;
      ctx.globalAlpha=firing?1:.1;
      poly(ctx,[[x+w*.02,cy],[x+w*.3,y+h*.08],[x+w*.97,cy],[x+w*.3,y+h*.92]],hit?"#fff":"#171a22","#171717");
      if(firing){poly(ctx,[[x+w*.25,cy],[x+w*.7,y+h*.31],[x+w*.92,cy],[x+w*.7,y+h*.69]],"#2b2530");}
      ctx.globalAlpha=1;
      circle(ctx,x+w*.2,cy,Math.max(1.3,h*.13),firing?"#fb7185":"#4f2437");
      break;
    }
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
    case "drone":{
      poly(ctx,[[x+w*.02,cy],[x+w*.3,y+h*.19],[x+w*.82,y+h*.3],[x+w*.98,cy],[x+w*.82,y+h*.7],[x+w*.3,y+h*.81]],hit?"#fff":"#4c5b65");
      poly(ctx,[[x+w*.28,y+h*.25],[x+w*.42,y+h*.03],[x+w*.56,y+h*.25]],"#374751");
      poly(ctx,[[x+w*.28,y+h*.75],[x+w*.42,y+h*.97],[x+w*.56,y+h*.75]],"#374751");
      circle(ctx,x+w*.25,cy,Math.max(1,h*.12),"#fff1c9");line(ctx,[[x+w*.58,y+h*.5],[x+w*.84,y+h*.5]],"#5eead4",.8);break;
    }
  }
  ctx.restore();return true;
}
