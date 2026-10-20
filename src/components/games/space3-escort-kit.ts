import type { Enemy } from "./space-logic.ts";

type Ctx = CanvasRenderingContext2D;
export const ESCORT_INK = "#171717";

/* Fractional body coordinates, with small details measured in logical pixels.
   Nothing scales a collision box or advances an attack clock. */
export function escortKit(ctx: Ctx, e: Enemy) {
  const X=(v:number)=>e.x+v*e.w,Y=(v:number)=>e.y+v*e.h;
  const colour=(fill:string)=>e.flash>0?"#ffffff":fill;
  const poly=(pts:number[][],fill:string)=>{
    ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y)));ctx.closePath();
    ctx.fillStyle=colour(fill);ctx.fill();ctx.strokeStyle=ESCORT_INK;ctx.lineWidth=.65;ctx.lineJoin="round";ctx.stroke();
  };
  const box=(x:number,y:number,w:number,h:number,fill:string)=>poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],fill);
  const line=(pts:number[][],fill:string,width=.6)=>{
    ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y)));
    ctx.strokeStyle=colour(fill);ctx.lineWidth=width;ctx.lineJoin="round";ctx.stroke();
  };
  const disc=(x:number,y:number,r:number,fill:string,ry=r)=>{
    ctx.beginPath();ctx.ellipse(X(x),Y(y),Math.max(.2,r),Math.max(.2,ry),0,0,Math.PI*2);ctx.fillStyle=colour(fill);ctx.fill();
    ctx.strokeStyle=ESCORT_INK;ctx.lineWidth=.55;ctx.stroke();
  };
  const light=(x:number,y:number,r:number,fill:string)=>{
    disc(x,y,r+.45,ESCORT_INK);ctx.beginPath();ctx.arc(X(x),Y(y),Math.max(.25,r),0,Math.PI*2);ctx.fillStyle=colour(fill);ctx.fill();
  };
  const vents=(x:number,y:number,n=3,height=.15)=>{for(let i=0;i<n;i++)box(x+i*.07,y,.028,height,ESCORT_INK);};
  const bolts=(x:number,y:number,n=3)=>{for(let i=0;i<n;i++){ctx.fillStyle=colour("#a4adb6");ctx.fillRect(X(x+i*.12),Y(y),.55,.55);}};
  return {X,Y,poly,box,line,disc,light,vents,bolts};
}
