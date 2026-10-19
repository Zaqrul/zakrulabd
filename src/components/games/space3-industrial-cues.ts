/* Origin/direction warnings, never guessed safe gaps or clock-based tells. */
import { H,W,shipSize,type Enemy,type State } from "./space-logic";
import { corvetTell } from "./space3-boss";

export function drawIndustrialCue(ctx:CanvasRenderingContext2D,e:Enemy,s:State){
  const tell=corvetTell(e);if(!tell.verb||tell.charge<=0)return;
  const x=e.x,y=e.y+e.h/2,q=tell.charge;
  ctx.save();ctx.strokeStyle=`rgb(251 113 133 / ${0.35+q*0.4})`;ctx.lineWidth=0.65;
  const line=(x0:number,y0:number,x1:number,y1:number)=>{ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();};
  if(tell.verb==="drill"||tell.verb==="train"){
    ctx.setLineDash([5,5]);line(5,tell.lane,x,tell.lane);ctx.setLineDash([]);
    for(const yy of [tell.lane-5,tell.lane+5])line(x-16,yy,x-10,tell.lane);
    if(tell.verb==="train")for(let i=0;i<3;i++){
      ctx.strokeRect(x-22-i*12,tell.lane-3,7,6);
    }
  }else if(tell.verb==="debris"){
    for(const a of [-0.6,-0.3,0,0.3,0.6])line(x-4,y,x-8-Math.cos(a)*(9+q*10),y+Math.sin(a)*(9+q*10));
  }else if(tell.verb==="lance"){
    ctx.setLineDash([3,4]);line(x,y,s.p.x+shipSize(s.p.level).w/2,tell.lane);
  }else if(tell.verb==="chain"){
    ctx.setLineDash([3,5]);line(x,y-14,x-112,y+14);line(x,y+14,x-112,y-14);
  }else if(tell.verb==="pinch"){
    for(const yy of [y-16,y+16]){ctx.beginPath();ctx.arc(x+6,yy,2+4*(1-q),0,Math.PI*2);ctx.stroke();}
  }else if(tell.verb==="sweep"||tell.verb==="lattice"||tell.verb==="coil"){
    line(W-2,14,W-2,H-14);
    for(let yy=24;yy<H-14;yy+=24){line(W-4,yy-2,W-7,yy);line(W-7,yy,W-4,yy+2);}
  }else if(tell.verb==="ring"){
    ctx.beginPath();ctx.arc(x,y,5+5*(1-q),0,Math.PI*2);ctx.stroke();
  }else if(tell.verb==="echo"){
    ctx.strokeStyle="#c4b5fd";ctx.beginPath();ctx.arc(x+e.w/2,y,5+q*4,0,Math.PI*2*q);ctx.stroke();
  }else if(tell.verb==="charge"||tell.verb==="quake"||tell.verb==="breach"){
    // Bursting charges and radial ore: origin only, gap angle is not exposed.
    const rings=tell.verb==="breach"?4:tell.verb==="quake"?3:1;
    for(let i=0;i<rings;i++){
      ctx.beginPath();ctx.arc(x,y,5+i*4+(1-q)*3,0,Math.PI*2);ctx.stroke();
    }
    if(tell.verb==="charge")for(const a of [-0.4,0,0.4]){
      const px=x-Math.cos(a)*17,py=y+Math.sin(a)*17;
      ctx.beginPath();ctx.arc(px,py,2,0,Math.PI*2);ctx.stroke();
    }
    if(tell.verb==="breach"){
      ctx.setLineDash([4,5]);line(x,y,5,tell.lane);
    }
  }else if(tell.verb==="fang"){
    // Predictive aim is private to the director. Show the maw, not a false target.
    for(const side of [-1,1]){line(x-14,y+side*6,x-5,y);line(x-22,y+side*6,x-13,y);}
  }else if(tell.verb==="snap"||tell.verb==="surge"){
    const size=shipSize(s.p.level),px=s.p.x+size.w/2,py=s.p.y+size.h/2;
    const rings=tell.verb==="surge"?2:1;
    for(let i=0;i<rings;i++){
      // Brackets are a threat symbol, not the undisclosed jaw radius or safe gap.
      ctx.beginPath();ctx.arc(px,py,15+i*6+(1-q)*3,-0.7,0.7);ctx.stroke();
    }
    if(tell.verb==="surge")line(W-2,14,W-2,H-14);
  }
  ctx.restore();
}
