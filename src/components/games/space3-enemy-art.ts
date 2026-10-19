/* Vanguard units share the Corvet's suspended iris and segmented violet
   armour, but retain distinct silhouettes and the engine's exact muzzles. */
import { enemyMuzzle, type Enemy, type State } from "./space-logic";

const TYPES=new Set(["drone","scout","seeker","diver","orbiter","gunner","sniper","swarm","armor","cruiser","mine","fighter","zigzag","wave","bomber","funnel","splitter","shard","rock","smallrock","comet","pod"]);

function drawDroneNozzle(ctx: CanvasRenderingContext2D, e: Enemy, s: State, cy: number, ink: string) {
  const firing=s.bullets.some(b=>b.own==="e"&&b.kind==="fire"&&Math.abs(b.x-e.x)<8&&Math.abs(b.y-cy)<8);
  ctx.beginPath();ctx.moveTo(e.x+3.5,cy-2.2);ctx.lineTo(e.x+0.8,cy-1.1);ctx.lineTo(e.x+0.8,cy+1.1);ctx.lineTo(e.x+3.5,cy+2.2);ctx.closePath();
  ctx.fillStyle=firing?"#f97316":"#596171";ctx.fill();ctx.strokeStyle=firing?"#fff1cc":ink;ctx.lineWidth=0.65;ctx.stroke();
  ctx.beginPath();ctx.moveTo(e.x+0.8,cy);ctx.lineTo(e.x,cy);ctx.strokeStyle=firing?"#fbbf24":"#9ca3af";ctx.lineWidth=1.2;ctx.stroke();
}

export function drawVanguard(ctx: CanvasRenderingContext2D, e: Enemy, s: State, reduceMotion=false): boolean {
  if(s.chapter<17 || !TYPES.has(e.type))return false;
  const {x,y,w,h}=e,hit=e.flash>0;
  const ink="#171717",violet=hit?"#ffffff":"#665387",steel=hit?"#fff1cc":"#b3b8ce",gold="#fbcf33";
  const cx=x+w/2,cy=y+h/2;
  const panel=(points:number[][],fill=violet)=>{
    ctx.beginPath();points.forEach(([px,py],i)=>i?ctx.lineTo(x+px*w,y+py*h):ctx.moveTo(x+px*w,y+py*h));ctx.closePath();
    ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=ink;ctx.lineWidth=0.7;ctx.stroke();
  };
  const line=(x1:number,y1:number,x2:number,y2:number,col=steel,width=0.7)=>{
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=col;ctx.lineWidth=width;ctx.stroke();
  };
  ctx.save();ctx.lineJoin="round";
  if(e.type==="pod"){
    panel([[0.15,0.1],[0.85,0.1],[0.98,0.3],[0.98,0.7],[0.85,0.9],[0.15,0.9],[0.02,0.7],[0.02,0.3]],hit?"#ffffff":"#ced8cf");
    line(x+w*0.2,y+h*0.18,x+w*0.2,y+h*0.82,"#0f766e",Math.max(1,w*0.08));
    line(x+w*0.8,y+h*0.18,x+w*0.8,y+h*0.82,"#0f766e",Math.max(1,w*0.08));
    line(cx-w*0.13,cy,cx+w*0.13,cy,"#fb923c",2);line(cx,cy-h*0.16,cx,cy+h*0.16,"#fb923c",2);
    ctx.restore();return true;
  }else if(s.chapter===20&&["rock","smallrock"].includes(e.type)){
    panel([[0.03,0.4],[0.23,0.1],[0.82,0.07],[0.96,0.34],[0.8,0.51],[0.95,0.7],[0.59,0.92],[0.16,0.79]],hit?"#ffffff":"#4a4650");
    panel([[0.23,0.1],[0.82,0.07],[0.67,0.27],[0.32,0.37]],hit?"#ffffff":"#79737c");
    line(x+w*0.16,y+h*0.6,x+w*0.73,y+h*0.54,"#302e39");
    for(let i=0;i<3;i++){
      ctx.fillStyle=steel;ctx.fillRect(x+w*(0.3+i*0.16),y+h*0.2,0.65,0.65);
    }
    if(e.id%3!==0){
      line(x+w*0.38,y+h*0.45,x+w*0.61,y+h*0.45,"#b91c1c",Math.max(1,h*0.08));
      line(x+w*0.49,y+h*0.36,x+w*0.49,y+h*0.59,"#b91c1c",Math.max(1,w*0.05));
    }
    ctx.restore();return true;
  }else if(s.chapter===20&&e.type==="drone"){
    for(const side of [-1,1]){
      const yy=(d:number)=>0.5+side*d;
      panel([[0.06,yy(0.12)],[0.02,yy(0.35)],[0.18,yy(0.45)],[0.55,yy(0.28)],[0.59,yy(0.08)],[0.43,yy(0.12)],[0.24,yy(0.29)],[0.16,yy(0.15)]],steel);
      line(x+w*0.08,y+h*yy(0.2),x+w*0.16,y+h*yy(0.25),"#b78157",1.2);
    }
    panel([[0.3,0.32],[0.67,0.19],[0.94,0.35],[0.94,0.65],[0.67,0.81],[0.3,0.68]],violet);
    line(x+w*0.74,y+h*0.33,x+w*0.84,y+h*0.33,steel,1.1);
    drawDroneNozzle(ctx,e,s,cy,ink);
  }else if(s.chapter===20&&e.type==="fighter"){
    panel([[0.02,0.5],[0.35,0.35],[0.86,0.32],[0.98,0.5],[0.86,0.68],[0.35,0.65]],hit?"#ffffff":"#6e6967");
    for(const side of [-1,1]){
      const yy=(d:number)=>0.5+side*d;
      panel([[0.22,yy(0.1)],[0.67,yy(0.46)],[0.88,yy(0.43)],[0.75,yy(0.08)]],steel);
      panel([[0.4,yy(0.19)],[0.67,yy(0.4)],[0.76,yy(0.38)],[0.56,yy(0.14)]],violet);
    }
    line(x+w*0.18,cy,x+w*0.37,cy,"#c4b5fd",1.1);
  }else if(["rock","smallrock"].includes(e.type)||(s.chapter===18&&["bomber","shard","splitter"].includes(e.type))){
    panel([[0.03,0.48],[0.17,0.13],[0.48,0.03],[0.87,0.2],[0.97,0.57],[0.7,0.94],[0.24,0.85]],hit?"#ffffff":"#89664e");
    panel([[0.17,0.13],[0.48,0.03],[0.64,0.3],[0.38,0.47]],hit?"#ffffff":"#b18c68");
    line(x+w*0.38,y+h*0.47,x+w*0.25,y+h*0.8,"#453537");
    if(["bomber","shard","splitter"].includes(e.type)){
      if(e.type==="bomber")for(const side of [-1,1]){
        const yy=(d:number)=>0.5+side*d;
        panel([[0.3,yy(0.1)],[0.55,yy(0.45)],[0.88,yy(0.35)],[0.75,yy(0.1)]],violet);
      }
      if(e.type==="shard")panel([[0.03,0.5],[0.3,0.26],[0.42,0.5],[0.3,0.74]],steel);
      panel([[0.04,0.5],[0.32,0.3],[0.6,0.34],[0.64,0.66],[0.32,0.7]],violet);
      line(x+w*0.12,cy,x+w*0.5,cy,steel,2);
      for(let i=0;i<3;i++)line(x+w*(0.18+i*0.09),cy-h*0.1,x+w*(0.23+i*0.09),cy+h*0.1,ink,0.8);
      if(e.type==="splitter"){
        line(cx,y+h*0.09,cx,y+h*0.9,"#fb7185",0.8);
        panel([[0.62,0.28],[0.85,0.3],[0.94,0.5],[0.85,0.7],[0.62,0.72]],violet);
        const ready=e.cd<=1;
        for(const side of [-1,1]){
          const py=cy+side*h*0.24,pr=Math.max(1.4,Math.min(w,h)*0.13);
          ctx.beginPath();ctx.arc(x+w*0.12,py,pr,-1.05,1.05);
          ctx.strokeStyle=ready?"#fff1cc":"#c4b5fd";ctx.lineWidth=ready?1.1:0.75;ctx.stroke();
          line(x+w*0.06,py,x+w*0.19,py,ready?"#fb7185":steel,0.8);
        }
      }
      if(e.type==="bomber"){
        const m=enemyMuzzle(e,s);line(m.x+5,m.y,m.x,m.y,steel,2);ctx.fillStyle=gold;ctx.fillRect(m.x-0.5,m.y-0.5,1,1);
      }
    }else{ctx.restore();return true;}
  }else if(s.chapter===19&&["mine","comet","sniper"].includes(e.type)||e.type==="comet"){
    if(e.type==="mine"){
      for(let i=0;i<6;i++){
        const a=i*Math.PI/3;
        line(cx+Math.cos(a)*w*0.15,cy+Math.sin(a)*h*0.15,cx+Math.cos(a)*w*0.46,cy+Math.sin(a)*h*0.46,"#b4d4de",1.8);
      }
      panel([[0.2,0.35],[0.5,0.17],[0.8,0.35],[0.8,0.65],[0.5,0.83],[0.2,0.65]],"#567689");
    }else{
      panel([[0.02,0.5],[0.31,0.12],[0.76,0.06],[0.96,0.4],[0.78,0.92],[0.33,0.82]],hit?"#ffffff":"#789eaf");
      panel([[0.31,0.12],[0.76,0.06],[0.64,0.4],[0.36,0.51]],hit?"#ffffff":"#c3dce2");
      line(x+w*0.36,y+h*0.51,x+w*0.67,y+h*0.81,"#44596e");
    }
    line(x+w*0.23,y+h*0.28,x+w*0.42,y+h*0.42,"#fb7185",0.8);
  }else if(["drone","orbiter","mine","funnel"].includes(e.type)){
    const petals=e.type==="mine"?6:4;
    const angle=reduceMotion?0:e.type==="orbiter"?e.t/100:0;
    for(let i=0;i<petals;i++){
      const a=i*Math.PI*2/petals+angle;
      ctx.save();ctx.translate(cx,cy);ctx.rotate(a);ctx.beginPath();
      ctx.moveTo(w*0.12,-h*0.14);ctx.lineTo(w*0.36,-h*0.22);ctx.lineTo(w*0.45,0);ctx.lineTo(w*0.28,h*0.12);ctx.lineTo(w*0.12,h*0.1);
      ctx.closePath();ctx.fillStyle=violet;ctx.fill();ctx.strokeStyle=steel;ctx.lineWidth=0.6;ctx.stroke();ctx.restore();
    }
    ctx.beginPath();ctx.ellipse(cx,cy,w*0.24,h*0.26,0,0,Math.PI*2);ctx.fillStyle=ink;ctx.fill();ctx.strokeStyle=steel;ctx.lineWidth=0.7;ctx.stroke();
  } else if(["armor","cruiser","gunner","bomber","splitter"].includes(e.type)){
    panel([[0.08,0.5],[0.26,0.25],[0.76,0.2],[0.95,0.5],[0.76,0.8],[0.26,0.75]],"#302940");
    for(const side of [-1,1]){
      const yy=(v:number)=>0.5+side*v;
      panel([[0.13,yy(0.2)],[0.33,yy(0.44)],[0.86,yy(0.42)],[0.98,yy(0.25)],[0.68,yy(0.17)],[0.4,yy(0.12)]]);
      line(x+w*0.36,y+h*yy(0.34),x+w*0.8,y+h*yy(0.32),steel,0.8);
      if(e.type==="cruiser")for(let i=0;i<3;i++){
        ctx.fillStyle=gold;ctx.fillRect(x+w*(0.46+i*0.13),y+h*yy(0.22)-0.5,1.5,1);
      }
    }
    if(e.type==="armor")panel([[0.07,0.23],[0.24,0.1],[0.28,0.9],[0.07,0.77]],steel);
  } else if(e.type==="sniper" || e.type==="seeker"){
    panel([[0,0.5],[0.43,0.25],[0.8,0.3],[0.98,0.5],[0.8,0.7],[0.43,0.75]]);
    panel([[0.4,0.25],[0.83,0.04],[0.7,0.36]],steel);
    panel([[0.4,0.75],[0.83,0.96],[0.7,0.64]],steel);
  } else if(e.type==="diver"){
    panel([[0.04,0.5],[0.38,0.25],[0.81,0.03],[0.65,0.36],[0.98,0.5],[0.65,0.64],[0.81,0.97],[0.38,0.75]]);
    panel([[0.15,0.46],[0.4,0.32],[0.54,0.08],[0.32,0.36]],steel);
    panel([[0.15,0.54],[0.4,0.68],[0.54,0.92],[0.32,0.64]],steel);
  } else if(e.type==="fighter"){
    panel([[0.04,0.5],[0.35,0.35],[0.92,0.25],[0.76,0.5],[0.92,0.75],[0.35,0.65]]);
    panel([[0.22,0.42],[0.1,0.02],[0.9,0.28],[0.55,0.35]],steel);
    panel([[0.22,0.58],[0.1,0.98],[0.9,0.72],[0.55,0.65]],steel);
  } else {
    panel([[0.02,0.5],[0.46,0.28],[0.93,0.4],[0.8,0.5],[0.93,0.6],[0.46,0.72]]);
    panel([[0.25,0.38],[0.68,0.04],[0.95,0.12],[0.63,0.4]],steel);
    panel([[0.25,0.62],[0.68,0.96],[0.95,0.88],[0.63,0.6]]);
  }
  const pupil=Math.max(0.85,Math.min(w,h)*0.105);
  ctx.beginPath();ctx.arc(cx,cy,pupil+1.1,0,Math.PI*2);ctx.fillStyle=ink;ctx.fill();
  ctx.beginPath();ctx.arc(cx,cy,pupil,0,Math.PI*2);ctx.fillStyle=gold;ctx.fill();
  ctx.fillStyle=ink;ctx.fillRect(cx-0.4,cy-pupil*0.7,0.8,pupil*1.4);
  if(["gunner","sniper","armor","cruiser","bomber"].includes(e.type)){
    const m=enemyMuzzle(e,s);
    const len=Math.min(w*0.35,9);
    line(m.x-Math.cos(m.angle)*len,m.y-Math.sin(m.angle)*len,m.x,m.y,ink,3);
    line(m.x-Math.cos(m.angle)*len,m.y-Math.sin(m.angle)*len,m.x,m.y,steel,1.5);
    ctx.fillStyle=e.cd>0 && e.cd<24?"#fb7185":gold;ctx.beginPath();ctx.arc(m.x,m.y,0.8,0,Math.PI*2);ctx.fill();
  }
  if(e.type==="drone"){
    drawDroneNozzle(ctx,e,s,cy,ink);
  }
  ctx.restore();return true;
}
