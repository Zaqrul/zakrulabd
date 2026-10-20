import { W, H, type State } from "./space-logic.ts";

type Ctx=CanvasRenderingContext2D;
const wrap=(n:number,span:number)=>((n%span)+span)%span;
const hash=(n:number)=>{const v=Math.sin(n*91.7+12.3)*43758.5453;return v-Math.floor(v);};

export function drawVoidBackdrop(ctx:Ctx,frame:number,scroll:number,reduceMotion:boolean){
  ctx.fillStyle="#0b0819";ctx.fillRect(0,0,W,H);
  // Far galaxies, dust lanes and pinprick stars drift at the slowest depth.
  for(let i=0;i<3;i++){
    const x=wrap(78+i*137-scroll*.006,W+80)-25,y=34+i*67;
    ctx.save();ctx.translate(x,y);ctx.rotate(-.35+i*.23);
    const g=ctx.createRadialGradient(0,0,1,0,0,38);
    g.addColorStop(0,"rgb(98 75 121 / .19)");g.addColorStop(.4,"rgb(72 54 101 / .12)");g.addColorStop(1,"rgb(17 10 31 / 0)");
    ctx.fillStyle=g;ctx.scale(1,.3);ctx.beginPath();ctx.arc(0,0,38,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  ctx.strokeStyle="rgb(75 48 92 / .14)";ctx.lineWidth=9;
  for(let i=0;i<3;i++){
    ctx.beginPath();ctx.moveTo(-20,39+i*66);ctx.bezierCurveTo(90,75+i*31,190,8+i*70,W+20,46+i*64);ctx.stroke();
  }
  for(let i=0;i<54;i++){
    ctx.fillStyle=i%9===0?"#4e3d63":"#2a203b";
    ctx.fillRect(wrap(hash(i+72)*W-scroll*.009,W),hash(i+137)*H,i%9===0?.8:.45,.55);
  }
  // Mid-depth: the broken ribs of a dead station, lit on one edge only.
  for(let i=0;i<7;i++){
    const x=wrap(70+i*72-scroll*(.027+i%3*.006),W+90)-45,y=29+hash(i+209)*155;
    const size=i===3?1.3:.48+hash(i+94)*.6;
    ctx.save();ctx.translate(x,y);ctx.rotate(-.6+i*.39);ctx.scale(size,size);
    ctx.fillStyle="#191426";ctx.beginPath();ctx.moveTo(-23,-5);ctx.lineTo(-13,-14);ctx.lineTo(26,-10);ctx.lineTo(21,-2);ctx.lineTo(4,-3);ctx.lineTo(3,9);ctx.lineTo(-8,12);ctx.lineTo(-9,-4);ctx.closePath();ctx.fill();
    ctx.strokeStyle="#51405e";ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-23,-5);ctx.lineTo(-13,-14);ctx.lineTo(26,-10);ctx.stroke();
    ctx.strokeStyle="#30233f";ctx.lineWidth=.7;
    for(let j=0;j<4;j++){ctx.beginPath();ctx.moveTo(-10+j*8,-12);ctx.lineTo(-6+j*8,-5);ctx.stroke();}
    ctx.fillStyle="#0c0a16";ctx.fillRect(-3,-9,6,3);ctx.fillRect(10,-8,7,3);ctx.restore();
  }
  // A quiet, incomplete arch is a landmark rather than a combat marker.
  ctx.save();ctx.translate(wrap(276-scroll*.018,W+180)-40,110);ctx.rotate(-.3);
  ctx.strokeStyle="#20172f";ctx.lineWidth=9;ctx.beginPath();ctx.ellipse(0,0,49,69,0,-1.8,.2);ctx.stroke();
  ctx.strokeStyle="#4e3658";ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(-2,-1,53,72,0,-1.75,.17);ctx.stroke();
  for(const a of [-1.6,-1.2,-.8,-.4]){
    ctx.beginPath();ctx.moveTo(Math.cos(a)*44,Math.sin(a)*64);ctx.lineTo(Math.cos(a)*55,Math.sin(a)*75);ctx.stroke();
  }ctx.restore();
  // Near particles carry a third, faster parallax speed, without projectile colours.
  for(let i=0;i<25;i++){
    const x=wrap(hash(i+341)*W-scroll*(.065+i%3*.012),W),y=hash(i+391)*H;
    ctx.fillStyle=i%5===0?"#66506f":"#3b2b4b";ctx.fillRect(x,y,1+i%4,.45);
  }
  const edge=ctx.createRadialGradient(W+38,99,8,W+38,99,203);
  edge.addColorStop(0,"rgb(132 44 98 / .20)");edge.addColorStop(.6,"rgb(75 26 68 / .09)");edge.addColorStop(1,"rgb(28 10 39 / 0)");
  ctx.fillStyle=edge;ctx.fillRect(0,0,W,H);
  const breath=reduceMotion?.4:.4+Math.sin(frame/150)*.045;
  const vignette=ctx.createRadialGradient(W*.48,H*.5,34,W*.48,H*.5,W*.64);
  vignette.addColorStop(0,"rgb(0 0 5 / 0)");vignette.addColorStop(.7,`rgb(0 0 5 / ${breath*.35})`);vignette.addColorStop(1,`rgb(0 0 5 / ${breath})`);
  ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
}

let veil:HTMLCanvasElement|OffscreenCanvas|null=null;

/* Cut light pools out of the veil, not out of the already-painted world. The
   old destination-out pass erased the backdrop and actors along with the fog. */
export function drawVoidShade(ctx:Ctx,s:State){
  if(!veil){
    if(typeof OffscreenCanvas!=="undefined")veil=new OffscreenCanvas(W,H);
    else if(typeof document!=="undefined"){veil=document.createElement("canvas");veil.width=W;veil.height=H;}
  }
  const mask=veil?.getContext("2d") as CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D|null;
  if(!mask||!veil){ctx.fillStyle="rgb(2 1 8 / .48)";ctx.fillRect(0,0,W,H);return;}
  mask.clearRect(0,0,W,H);mask.globalCompositeOperation="source-over";
  mask.fillStyle="rgb(2 1 8 / .48)";mask.fillRect(0,0,W,H);mask.globalCompositeOperation="destination-out";
  const pool=(x:number,y:number,r:number)=>{
    const g=mask.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,"rgb(0 0 0 / .92)");g.addColorStop(.62,"rgb(0 0 0 / .62)");g.addColorStop(1,"rgb(0 0 0 / 0)");
    mask.fillStyle=g;mask.fillRect(x-r,y-r,r*2,r*2);
  };
  pool(s.p.x+11,s.p.y+8,64);
  if(s.lumen){pool(s.lumen.x+8,s.lumen.y+4,38);if(s.lumen.firing){mask.fillStyle="rgb(0 0 0 / .58)";mask.fillRect(s.lumen.x+7,s.lumen.y-4,150,8);}}
  ctx.drawImage(veil,0,0,W,H);
}
