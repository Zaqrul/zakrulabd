/* Orbital deep-core rig. Solid geometry stays inside the collision body. */
import type { Enemy, State } from "./space-logic";
import { corvetTell } from "./space3-boss";
import { drawIndustrialCue } from "./space3-industrial-cues";

export function drawExcavator(ctx: CanvasRenderingContext2D, e: Enemy, reduceMotion = false): boolean {
  if (e.type !== "boss18") return false;
  const phase=Math.min(2,e.a), tell=corvetTell(e), hit=e.flash>0;
  const steel=hit?"#ffffff":"#a4adb6", ochre=hit?"#fff1cc":"#bb853e", hot=phase===2?"#fb7185":"#fbcf33";
  ctx.save();ctx.translate(e.x,e.y);ctx.scale(e.w/92,e.h/54);ctx.lineJoin="round";
  const poly=(p:number[][],fill:string)=>{
    ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
    ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle="#171717";ctx.lineWidth=0.85;ctx.stroke();
  };
  const line=(p:number[][],colour:string,width=0.8)=>{
    ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=colour;ctx.lineWidth=width;ctx.stroke();
  };
  poly([[21,15],[35,7],[78,8],[90,20],[90,38],[74,47],[30,44],[18,35]],"#34313b");
  // Orbital drive collars and hydraulic rails, never terrestrial tracks.
  for(const side of [-1,1]){
    const y=27+side*20;
    poly([[31,y-3],[77,y-3],[85,y],[77,y+3],[31,y+3],[26,y]],steel);
    for(let i=0;i<6;i++)line([[37+i*6,y-2],[35+i*6,y+2]],"#3b3b45",1.6);
    poly([[79,y-3],[90,y-2],[90,y+2],[79,y+3]],"#4e4359");line([[86,y-1],[86,y+1]],hot,1.4);
  }
  poly([[33,15],[46,9],[76,11],[83,20],[78,38],[42,42],[29,33]],ochre);
  for(let i=0;i<4;i++){
    const x=43+i*8;poly([[x,18],[x+5,18],[x+5,35],[x,35]],"#24232c");line([[x+2,20],[x+2,33]],steel,1.3);
  }
  if(phase<2){
    poly([[34,16],[55,12],[63,18],[58,35],[36,37],[29,28]],ochre);
    line([[34,19],[53,16],[58,19]],"#e0b36b");
    if(phase===1)line([[41,14],[44,22],[40,28],[48,33]],hot,1.2);
  }
  if(phase===0)poly([[60,15],[76,15],[81,22],[76,37],[62,36],[66,26]],"#725338");
  else line([[62,16],[68,24],[63,29],[73,36]],hot,1.4);
  // Open ore hopper, armoured cab, hazard slashes.
  poly([[50,3],[70,2],[79,10],[73,16],[48,13]],"#4c4140");
  poly([[54,5],[67,4],[72,9],[53,10]],"#22242e");line([[56,7],[67,7]],hot,1.2);
  for(let i=0;i<3;i++)line([[72+i*3,18],[69+i*3,24]],"#171717",1.5);
  // Armoured shoulder blocks and recessed heat sinks reinforce the siege scale.
  for(const side of [-1,1]){
    const yy=(d:number)=>27+side*d;
    poly([[33,yy(11)],[41,yy(17)],[55,yy(18)],[53,yy(12)]],ochre);
    for(let i=0;i<3;i++)line([[41+i*4,yy(14)],[42+i*4,yy(17)]],"#3c3031",1.2);
    line([[62,yy(17)],[75,yy(15)]],phase===2?"#fb7185":"#e0b36b",1.4);
  }
  for(const y of phase>0?[13,27,41]:[13,41]){
    poly([[13,y-2],[35,y-2],[40,y],[35,y+2],[13,y+2]],steel);
    ctx.fillStyle="#171717";ctx.fillRect(13,y-1.5,3,3);
    ctx.fillStyle=tell.charge>0?"#fb7185":hot;ctx.fillRect(13,y-0.65,1,1.3);
  }
  ctx.beginPath();ctx.ellipse(25,27,8,13,0,0,Math.PI*2);ctx.fillStyle="#282832";ctx.fill();
  ctx.strokeStyle=steel;ctx.lineWidth=2;ctx.stroke();
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    line([[25+Math.cos(a)*6,27+Math.sin(a)*10],[25+Math.cos(a)*8,27+Math.sin(a)*12]],hot,1.3);
  }
  poly([[1,27],[23,16],[30,19],[30,35],[23,38]],steel);
  const spin=reduceMotion?0:e.t*(0.08+tell.charge*0.3);
  for(let i=0;i<6;i++){
    const x=5+i*4,radius=(x-1)*0.43;
    line([[x,27-radius],[x+2,27+Math.sin(spin+i*0.85)*radius],[x,27+radius]],"#475160",1.1);
  }
  line([[2,27],[19,22],[27,23]],hit?"#ffffff":"#d6e1dd",0.7);
  ctx.restore();return true;
}

export function drawExcavatorCue(ctx:CanvasRenderingContext2D,e:Enemy,s:State){
  if(e.type==="boss18")drawIndustrialCue(ctx,e,s);
}
