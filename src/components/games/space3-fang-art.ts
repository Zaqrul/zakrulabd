/* Design study only. Not mounted in the game and has no wingman rules.
   Vex retains the old Fang's forward mandibles, repaired with mismatched scrap. */
import type { State } from "./space-logic";

export function drawFang(ctx:CanvasRenderingContext2D,x:number,y:number,s:State,reduceMotion=false){
  const t=reduceMotion?0:s.frame;
  ctx.save();ctx.translate(x,y);ctx.lineJoin="round";
  const panel=(p:number[][],fill:string)=>{
    ctx.beginPath();p.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.closePath();
    ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle="#171717";ctx.lineWidth=0.65;ctx.stroke();
  };
  // Allied orientation, nose right. Mandibles recall Vex's original Crimson Fang.
  for(const side of [-1,1]){
    const yy=(d:number)=>side*d;
    panel([[-10,yy(2)],[-8,yy(7)],[1,yy(9)],[13,yy(6)],[3,yy(6)],[-2,yy(2)]],side<0?"#a61c38":"#6f2734");
    panel([[-8,yy(5)],[-3,yy(8)],[2,yy(8)],[0,yy(5)]],side<0?"#c8233f":"#667483");
    ctx.fillStyle="#fb923c";ctx.fillRect(-14-(reduceMotion?0:Math.sin(t/7)*0.5),yy(3)-0.6,4,1.2);
    panel([[-11,yy(2)-1],[-6,yy(2)-1],[-6,yy(2)+1],[-11,yy(2)+1]],"#343d4f");
  }
  panel([[-10,-3],[-2,-4],[8,-2],[14,0],[8,2],[-2,4],[-10,3]],"#c8233f");
  panel([[-8,-2],[-1,-3],[5,-1],[1,0],[-8,0]],"#df514c");
  panel([[-5,1],[0,1],[2,3],[-4,3]],"#7b7d7a");
  panel([[-2,-3],[2,-4],[6,-2],[4,0],[-1,-0.5]],"#314858");
  ctx.strokeStyle="#ece6dc";ctx.lineWidth=0.7;
  ctx.beginPath();ctx.moveTo(7,-2);ctx.lineTo(5,0);ctx.lineTo(7,2);ctx.stroke();
  ctx.strokeStyle="#171717";ctx.beginPath();ctx.moveTo(-6,1);ctx.lineTo(-3,1.5);ctx.moveTo(-4,0.5);ctx.lineTo(-4,2);ctx.stroke();
  // A narrow, cold steel rail channel rather than a luminous plasma emitter.
  ctx.strokeStyle="#aab6b8";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-3,2.8);ctx.lineTo(11,1.3);ctx.stroke();
  ctx.fillStyle="#fbcf33";ctx.fillRect(-5,-1,1,0.7);
  ctx.restore();
}
