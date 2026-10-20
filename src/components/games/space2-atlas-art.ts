/* A left-facing fortress in three-quarter view. The near arm has a shoulder,
   elbow and breech; the far shoulder is a counterweight and launcher housing. */
import { beamMuzzle, enemyMuzzle, missileMuzzle, type Enemy, type State } from "./space-logic";
import { machineKit } from "./space2-machine-art";
import { finalAttackPose } from "./space-final-pose";

type Ctx = CanvasRenderingContext2D;
const INK="#171717", ARMOUR="#4b573c", FACE="#75816b", RIM="#b6bea0", SHADE="#354331";

export function paintAtlasFortress(ctx: Ctx,e: Enemy,s: State,reduceMotion: boolean) {
  const m=machineKit(ctx,e.x,e.y), a=e.attack, p=finalAttackPose(e,reduceMotion);
  const warning=!!a&&a.t<a.warn, firing=!!a&&a.t>=a.warn&&a.t<a.warn+a.live;
  const hot=warning?"#ffb665":firing?"#fff1cc":"#fb7185", t=reduceMotion?0:e.t;
  const quake=p.kind==="quake", fist=p.kind==="rocketfist", march=p.kind==="march";
  const lance=p.kind==="grid"||p.kind==="orbital"||p.kind==="scissor";
  const squat=quake?.075*p.charge+.09*p.kick:march?.035*p.load:fist?.025*p.charge:lance?.018*p.load:0;
  const lean=fist?.022*p.charge-.03*p.kick:march?-.018*p.load:quake?-.012*p.load:0;
  const open=lance?p.load:march?.55*p.load:0;
  const point=(x:number,y:number)=>({x:x+lean*(89-y),y:89+(y-89)*(1-squat)});
  const joint=(x:number,y:number,r=3)=>{m.disc(x,y,r,INK);m.disc(x,y,r-1,FACE);m.disc(x,y,.7,RIM);};
  const limb=(x:number,y:number,xx:number,yy:number,width:number)=>{
    m.rod(x,y,xx,yy,width+1,INK);m.rod(x,y,xx,yy,width,ARMOUR);
    m.rod(x-1,y,xx-1,yy,width*.27,RIM);
  };
  const foot=(x:number,y:number,near:boolean)=>{
    const width=near?30:23;
    m.poly([[x-8,y-7],[x+8,y-8],[x+width-15,y-3],[x+width-16,y],[x-12,y],[x-13,y-3]],INK);
    m.poly([[x-8,y-6],[x+8,y-7],[x+width-16,y-3],[x-10,y-2]],FACE);
    m.vents(x-7,y-3,near?6:4,1.5,3);m.bolts(x-7,y-5,near?4:3,5);
  };

  ctx.save();ctx.translate(e.x,e.y+89);ctx.transform(1,0,-lean,1-squat,0,0);ctx.translate(-e.x,-e.y-89);
  if(e.a<3){
    // Far leg is narrower and higher; the near foot carries the forward load.
    limb(65,57,70,69,7);joint(70,69,3.5);limb(70,69,68,80,6);foot(69,84,false);
    m.poly([[60,61],[69,59],[76,68],[72,76],[64,73]],SHADE);
    m.poly([[35,56],[59,55],[68,62],[56,68],[33,65]],INK);
    m.plate(38,58,22,8,ARMOUR,2);m.vents(43,60,5,2,3);
    limb(43,62,37,74,8);joint(37,74,4.3);limb(37,74,36,84,7);foot(36,89,true);
    m.poly([[35,63],[48,64],[45,72],[38,78],[29,75]],ARMOUR);
    m.poly([[35,64],[45,65],[42,69],[33,71]],RIM);
    m.piston(31,69,29,81,1.2);m.plate(32,78,10,6,FACE,1);

    // Oblique breastplate: narrow forward face, broad shaded far flank.
    m.poly([[25,29],[42,21],[66,23],[82,34],[77,54],[57,64],[30,55]],ARMOUR);
    m.poly([[25,29],[42,24],[56,30],[55,54],[40,59],[30,52]],FACE);
    m.poly([[56,30],[66,23],[82,34],[77,54],[57,64],[55,54]],SHADE);
    m.poly([[27,29],[42,23],[66,25],[73,29],[55,32],[42,27]],RIM);
    m.plate(61,34,15,17,ARMOUR,2);m.vents(64,37,3,10,3);
    m.bolts(61,54,4,4);m.rod(58,32,58,54,.8,RIM);
    m.poly([[34,33],[47,29],[51,34],[49,51],[38,55],[33,49]],INK);
    if(e.a<2){
      for(let i=0;i<4;i++){
        m.poly([[35,34+i*4.5],[47,31+i*4.5],[48,33+i*4.5],[35,37+i*4.5]],FACE);
        m.rod(37,35+i*4.5,45,33+i*4.5,.55,"#9f3246");
      }
    }else{
      m.disc(42,42,7.6,"#8f654a",10);m.disc(41,42,5.8,INK,8);
      m.disc(40,42,4.3,hot,6);m.disc(39,41,1.6,"#fff1cc",3);
      m.poly([[33,33],[38,34],[35,39]],FACE);m.poly([[47,48],[52,46],[48,55]],FACE);
    }

    // The rear pod is visibly bolted into the flank, not a missing second arm.
    m.poly([[67,19],[77,16],[87,23],[87,37],[78,41],[70,34]],SHADE);
    m.poly([[67,19],[77,16],[85,21],[75,25]],RIM);
    m.plate(75,24,11,12,ARMOUR,1);m.vents(78,26,2,7,3);m.bolts(72,35,3,5);
    m.piston(76,39,70,51,1.3);

    // Command cab has a left-facing snout and one visible side plane.
    m.poly([[29,13],[44,7],[59,10],[65,19],[53,28],[32,24],[25,19]],ARMOUR);
    m.poly([[29,13],[44,9],[58,11],[47,14],[27,17]],RIM);
    m.poly([[47,14],[59,10],[65,19],[53,28],[48,23]],SHADE);
    m.poly([[27,17],[44,13],[48,17],[46,23],[31,23],[25,20]],FACE);
    m.poly([[28,17],[40,15],[42,17],[30,20]],INK);
    m.rod(29,17.4,38,16.1,1,hot);m.disc(29,18,.7,"#fff1cc");
    m.vents(51,17,3,4,2.5);m.hatch(47,8,10,4,false);m.bolts(34,24,3,5);

    // Near shoulder and upper arm leave negative space below the cab.
    m.poly([[23,25],[32,22],[39,28],[34,35],[24,33],[20,29]],ARMOUR);
    m.poly([[23,25],[32,24],[36,28],[25,29]],RIM);
    joint(30,30,4);limb(29,32,25,39,5);joint(25,39,3);
    m.piston(34,31,29,40,1.1);
    if(e.a>=1)m.poly([[76,39],[81,43],[76,46],[80,51],[72,54]],INK);
    m.damage(69,44,e.a>=2?.8:e.a>=1?.45:0,t);
  }else{
    // Judgement keeps the same oblique axis: near tread, far tread, containment mast.
    m.plate(56,75,33,9,INK,2);
    for(const x of [61,70,80,85])joint(x,80,2.5);
    m.poly([[30,76],[59,70],[79,75],[88,83],[78,89],[27,89],[23,84]],INK);
    m.poly([[30,77],[58,73],[77,77],[81,81],[33,84],[27,82]],ARMOUR);
    m.plate(32,80,41,7,FACE,1.5);m.vents(36,81,10,3,3);
    for(const x of [32,42,53,64,73]){m.disc(x,86,2.8,INK);m.disc(x,86,1.4,RIM);}
    limb(58,73,66,55,6);limb(39,76,43,59,5);
    m.poly([[58,10],[68,.8],[76,10],[76,57],[65,74],[56,61]],SHADE);
    m.plate(63,12,9,49,ARMOUR,1);m.rod(66,16,66,58,1.6,hot);
    for(const y of [14,30,58]){m.plate(58,y,17,5,FACE,1);m.bolts(61,y+2,3,5);}
    // Two distinct mast roots frame the reactor without crossing its face.
    limb(43,31,31-open*2,12+open,4);limb(61,30,78+open*.4,12+open,4);
    m.poly([[24,7],[35,11],[38,26],[29,28],[22,20]],ARMOUR);
    m.plate(26-open*2,10+open,8,13,FACE,1);m.vents(28-open*2,13+open,2,7,2.5);
    m.poly([[77,5],[86,10],[88,29],[78,35],[72,19]],SHADE);
    m.plate(77,11+open,9,18,FACE,1);m.vents(79,14+open,2,11,2.5);
    m.poly([[38,26],[53,22],[66,32],[64,53],[51,64],[36,53],[31,39]],ARMOUR);
    m.disc(49,43,14,INK,19);m.disc(48,43,11.5,"#8f654a",16.5);
    m.disc(47,43,9,INK,13.5);m.disc(46,43,6.5,"#9b3540",10);
    m.disc(45,43,4.8,hot,7.5);m.disc(44,42,2,"#fff1cc",3.7);
    for(let i=0;i<6;i++){
      const angle=i*Math.PI/3,rad=(e.a>=5?17:15)+open*2;
      const x=49+Math.cos(angle)*rad*.75,y=43+Math.sin(angle)*rad;
      m.rod(x,y,x+Math.cos(angle)*4,y+Math.sin(angle)*4,2,RIM);m.disc(x,y,1,INK);
    }
    m.poly([[36,60],[45,64],[42,76],[29,77],[26,70]],FACE);
    m.poly([[69,59],[79,53],[85,67],[78,77],[66,74]],SHADE);
    m.hatch(75,56,11,13,warning||firing);
    m.damage(72,37,e.a>=5?.85:.4,t);m.damage(32,65,e.a>=4?.8:.4,t);
  }
  ctx.restore();

  // Fixed sponsons share the authoritative beam endpoints. Their roots sit on
  // the shoulder and hip, behind the near arm, rather than across the reactor.
  for(const slot of [-1,1]){
    const tip=beamMuzzle(e,slot),tx=tip.x-e.x,ty=tip.y-e.y;
    const root=point(e.a>=3?38:35,slot<0?29:59);
    m.rod(root.x,root.y,tx+8,ty,3.6,ARMOUR);
    m.rod(root.x,root.y-1,tx+8,ty-1,.8,RIM);
    m.plate(tx,ty-3.3,10,6.6,FACE,1);m.box(tx-.6,ty-2.2,2,4.4,INK);
    const lit=(a?.kind==="scissor"||a?.kind==="beam")&&(warning||firing);
    m.disc(tx,ty,1.2,lit?hot:"#e68d56");
  }
  const tip=enemyMuzzle(e,s),tx=tip.x-e.x,ty=tip.y-e.y;
  const bx=tx-Math.cos(tip.angle)*12,by=ty-Math.sin(tip.angle)*12;
  const elbow=point(e.a>=3?33:25,e.a>=3?47:39);
  const shoulder=point(e.a>=3?39:30,e.a>=3?40:30);
  limb(shoulder.x,shoulder.y,elbow.x,elbow.y,4);
  joint(elbow.x,elbow.y,2.7);limb(elbow.x,elbow.y,bx,by,4.2);
  m.piston(elbow.x+2,elbow.y-2,bx+1,by-2,.9);
  ctx.save();ctx.translate(tip.x,tip.y);ctx.rotate(tip.angle);
  const g=machineKit(ctx,0,0);
  g.poly([[-16,-3.8],[-7,-3.5],[-3,-2.1],[0,-2.1],[0,2.1],[-3,2.1],[-7,3.5],[-16,3.8]],FACE);
  g.poly([[-15,2.5],[-6,2.3],[-3,1.1],[-15,1.1]],RIM);
  g.box(-2,-2.6,2,5.2,INK);g.disc(0,0,1.1,warning?hot:INK);
  g.disc(-12,0,1.2,INK);g.rod(-9,-2,-9,2,.6,SHADE);
  const elapsed=a?a.t-a.warn:-1;
  const pulseShot=a?.kind==="cluster"?elapsed>=0&&elapsed<66&&elapsed%22<3
    : a?.kind==="volley"?elapsed>=0&&elapsed%18<3&&elapsed/18<(e.a>=1?3:2):false;
  if(firing&&pulseShot)g.poly([[0,-1.8],[5,0],[0,1.8]],"#fff1cc");
  ctx.restore();

  const rack=missileMuzzle(e,-1),rx=rack.x-e.x,ry=rack.y-e.y;
  m.plate(rx-5,ry-4,12,8,SHADE,1);m.vents(rx-3,ry-2,3,4,3);
}
