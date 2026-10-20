/* Modelled outer-system machinery. All coordinates are percentages of the existing
   body or module box. These painters observe state; collision, stages and weapons
   remain owned by the engine. */
import { modBox, type Enemy } from "./space-logic.ts";
import { ACT2_STAGES, type Mod } from "./space3-act2.ts";
import { paintHeraldBody } from "./space3-herald-art.ts";

type Ctx = CanvasRenderingContext2D;
type Point = [number, number];
const INK = "#171717", STEEL = "#a4adb6", FACE = "#758594", OCHRE = "#bb853e";
const ACCENT = ["#67e8f9", "#93c5fd", "#fbcf33", "#a78bfa", "#f472b6", "#fbcf33", "#fb7185", "#60c9ff"];

function model(ctx: Ctx, box: { x: number; y: number; w: number; h: number }, hit: boolean) {
  const X = (v: number) => box.x + v * box.w / 100, Y = (v: number) => box.y + v * box.h / 100;
  const line = (points: Point[], colour = STEEL, width = .65) => {
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)));
    ctx.strokeStyle = colour; ctx.lineWidth = width; ctx.lineJoin = "round"; ctx.stroke();
  };
  const plate = (points: Point[], fill: string, edge = INK, width = .75) => {
    ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)));
    ctx.closePath(); ctx.fillStyle = hit ? "#fff" : fill; ctx.fill();
    ctx.strokeStyle = edge; ctx.lineWidth = width; ctx.lineJoin = "round"; ctx.stroke();
  };
  const boxPlate = (x: number, y: number, w: number, h: number, colour: string) => plate([[x,y],[x+w,y],[x+w,y+h],[x,y+h]], colour);
  const disc = (x: number, y: number, rx: number, ry: number, fill: string, edge = INK, width = .75) => {
    ctx.beginPath(); ctx.ellipse(X(x), Y(y), Math.max(.18, rx*box.w/100), Math.max(.18, ry*box.h/100), 0, 0, Math.PI*2);
    ctx.fillStyle = hit ? "#fff" : fill; ctx.fill(); ctx.strokeStyle = edge; ctx.lineWidth = width; ctx.stroke();
  };
  const bolts = (x: number, y: number, n: number, gap = 5) => {
    for (let i=0;i<n;i++) { disc(x+i*gap,y,.8,1.1,INK,STEEL,.35); }
  };
  const vents = (x: number, y: number, n: number, height = 7, gap = 3) => {
    for(let i=0;i<n;i++){ boxPlate(x+i*gap,y,1.6,height,INK);line([[x+i*gap+1.9,y],[x+i*gap+1.9,y+height-1]],FACE,.35); }
  };
  const eye = (x: number, y: number, rx: number, ry: number, accent: string, exposed = false) => {
    disc(x,y,rx+2,ry+3,INK,STEEL,.75);disc(x,y,rx,ry,accent,INK,.65);
    disc(x-1,y,rx*.42,ry*.55,exposed?"#fff1c9":"#12233d",accent,.5);disc(x-rx*.3,y-ry*.3,Math.max(.6,rx*.2),Math.max(.7,ry*.2),"#fff",INK,.25);
  };
  return { X,Y,line,plate,box:boxPlate,disc,bolts,vents,eye };
}

export function paintOuterMachine(ctx: Ctx, e: Enemy, chapter: number, reduceMotion: boolean, mini = false) {
  const k=model(ctx,e,e.flash>0), accent=ACCENT[chapter-21] ?? ACCENT[7];
  const hp=Math.max(0,e.hp/Math.max(1,e.maxHp));
  const phase=Math.max(Math.min(2,e.a||0),hp<.33?2:hp<.66?1:0);
  const stages=ACT2_STAGES[e.type]?.length??0;
  const exposed=stages>0?(e.stage??0)>=stages:phase===2;
  const t=reduceMotion?0:e.t;
  ctx.save();ctx.lineCap="round";

  if(mini){
    paintMini(k,chapter,accent,phase,t);
  } else if(chapter===21){
    // Swept interceptor: two real nacelles and a left-facing piloted nose.
    for(const side of [-1,1]){
      const yy=(v:number)=>50+v*side;
      k.plate(phase===2&&side<0?[[13,43],[36,24],[55,28],[58,43],[28,49]]
        :[[12,yy(-5)],[48,yy(-43)],[83,yy(-46)],[65,yy(-10)],[30,yy(-1)]],"#385866");
      if(!(phase===2&&side<0)){
        k.plate([[34,yy(-18)],[52,yy(-36)],[72,yy(-39)],[58,yy(-15)]],STEEL);
        k.line([[32,yy(-14)],[46,yy(-24)],[51,yy(-18)],[61,yy(-31)]],accent,.8);
        k.line([[75,yy(-39)],[83,yy(-46)],[87,yy(-43)]],OCHRE,.8);
        k.disc(83,yy(-45),1.8,2.2,accent);
      }
      k.plate([[63,yy(-12)],[72,yy(-26)],[91,yy(-23)],[97,yy(-13)],[89,yy(-6)]],"#495c6a");
      k.box(74,yy(-18)-3,16,6,INK);k.vents(75,yy(-18)-2,5,4,2.5);
      k.disc(68,yy(-15),3.2,5.5,INK,STEEL);k.disc(68,yy(-15),1.7,3,accent);
      const exhaust=2+(Math.sin(t*.25+side)*.5+.5)*2;
      k.plate([[92,yy(-18)],[98,yy(-15)-exhaust],[99,yy(-15)],[98,yy(-15)+exhaust],[92,yy(-12)]],accent);
      k.bolts(48,yy(-11),5,8);
    }
    k.plate([[3,50],[20,36],[65,40],[85,47],[85,53],[65,60],[20,64]],FACE);
    k.plate([[8,50],[25,43],[44,44],[42,56],[25,57]],"#d0dce0");
    k.plate([[23,45],[31,39],[43,42],[47,50],[39,56],[23,54]],"#173e50");
    k.disc(34,47,2.2,3.5,INK);k.line([[31,53],[34,50],[38,54]],INK,1.2);
    k.line([[24,44],[39,43],[44,48]],"#a5f3fc",.55);
    k.box(8,47,10,6,"#35404c");k.disc(9,50,2,2.3,accent);
    k.vents(53,45,6,9,3);k.bolts(26,61,5,9);
    if(phase>0){ k.line([[46,33],[51,38],[46,44],[52,49]],accent,.85); }
  } else if(chapter===22){
    // Frozen walking fortress. Independent engine legs remain separate modules.
    k.plate([[8,37],[19,21],[76,18],[92,33],[92,74],[77,86],[18,82],[8,64]],"#667c96");
    k.box(19,27,61,47,STEEL);k.box(24,32,51,38,"#33465f");
    for(let i=0;i<5-phase;i++){
      const xx=14+i*15;
      k.plate([[xx,24],[xx+3,11+i%2*4],[xx+9,22],[xx+13,27]],"#d5eff6");
    }
    k.plate([[32,20],[35,7],[56,5],[64,16],[59,25]],FACE);
    k.box(39,10,15,7,INK);k.disc(42,13,2,2.2,accent);k.line([[59,9],[67,3]],STEEL,.8);
    for(const yy of [30,67]){k.box(73,yy,13,11,"#29394d");k.vents(75,yy+2,4,7,2.4);k.bolts(72,yy-2,4,4);}
    k.eye(46,51,exposed?15:10,exposed?23:17,accent,exposed);
    k.plate([[25,35],[34,31],[33,68],[25,73]],FACE);
    k.plate(phase===2?[[60,33],[66,41],[61,49],[69,66],[59,70]]:[[60,30],[69,33],[69,73],[60,70]],"#9eb5c4");
    k.line([[40,35],[45,43],[42,49],[51,55],[47,67]],"#e4faff",phase?1:.5);
    if(phase>0)k.line([[48,44],[56,40],[59,47],[55,59]],INK,.65);
    k.bolts(20,78,8,8);k.bolts(20,27,7,9);
    k.box(9,45,14,10,FACE);k.disc(10,50,2.5,3.5,"#d9f3ff");
    for(let i=0;i<3;i++){const shift=reduceMotion?0:Math.sin(t/22+i)*1.2;k.line([[79+i*3,28],[78+i*3+shift,22],[80+i*3,17]],"#a7cadb",.65);}
    if(exposed){k.plate([[27,78],[33,88],[37,80]],"#c7f0ff");k.plate([[65,77],[70,89],[74,78]],"#c7f0ff");}
  } else if(chapter===23){
    // Long gunship with a ribbed spine, two gun decks and physical pod couplings.
    k.plate([[2,50],[12,25],[29,17],[78,20],[97,36],[97,64],[78,80],[29,83],[12,75]],FACE);
    k.plate([[7,49],[22,34],[77,31],[88,41],[88,59],[77,69],[22,66]],"#383e45");
    for(let i=0;i<7;i++){
      const xx=28+i*8;
      if(phase===2&&i===2)continue;
      k.plate([[xx,29],[xx+5,24],[xx+7,69],[xx+2,75]],i%2?STEEL:"#7b8285");
      k.bolts(xx+2,33,2,2);k.line([[xx+3,40],[xx+5,61]],OCHRE,.5);
    }
    for(const yy of [23,76])for(let i=0;i<4;i++){
      const xx=19+i*18;
      k.box(xx,yy-4,11,8,"#4c535a");k.disc(xx+3,yy,3,4,STEEL);
      k.box(xx-4,yy-1.4,8,2.8,INK);k.line([[xx-4,yy],[xx+1,yy]],"#d4dce0",.6);
    }
    k.plate([[10,38],[16,24],[26,26],[29,46],[18,54]],"#b6c1c8");
    k.box(16,30,9,8,INK);k.line([[17,33],[24,33]],accent,.8);k.bolts(12,56,3,5);
    for(const yy of [37,58]){k.box(85,yy,12,9,"#4b4543");k.vents(88,yy+1,3,7,3);k.line([[95,yy+2],[99,yy+4],[95,yy+7]],"#fb923c",1);}
    k.eye(48,50,6,9,accent,exposed);k.box(9,47,9,6,INK);k.line([[9,50],[17,50]],accent,.8);
    for(const xx of [9,39]){k.line([[xx,8],[xx+4,18],[xx+10,25]],OCHRE,1.5);k.line([[xx,92],[xx+4,82],[xx+10,75]],OCHRE,1.5);}
    if(exposed){k.line([[36,35],[32,47],[41,52],[34,67]],"#fb7185",1.1);k.vents(37,42,4,17,3);}
  } else if(chapter===24){
    // Shield plates peel off a visible, layered reactor instead of disappearing as a disc.
    k.disc(50,50,25,25,"#24213e",STEEL);k.disc(50,50,19,19,"#49356c",accent,1);
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4+(reduceMotion?0:t/500),r=exposed?34:29;
      const C=(radius:number,angle:number):Point=>[50+Math.cos(angle)*radius,50+Math.sin(angle)*radius];
      k.line([C(17,a),C(r+3,a)],OCHRE,1.1);k.disc(...C(24,a),1.5,1.5,STEEL);
      if(!(phase===2&&i%3===0)){
        const push=phase*2+(exposed?4:0);
        k.plate([C(r+push,a-.29),C(44,a-.15),C(47,a+.14),C(r+push,a+.33)],i%2?STEEL:"#746b9c");
        k.line([C(r+push+3,a-.17),C(42,a),C(43,a+.12)],accent,.8);
        k.disc(...C(38,a),1.3,1.3,OCHRE);
      }
    }
    k.eye(50,50,exposed?14:9,exposed?14:9,"#c4b5fd",exposed);
    if(phase>0)k.line([[41,31],[44,39],[40,46],[44,50]],"#fff1c9",.9);
    k.box(8,47,11,6,"#302449");k.disc(10,50,2,2,accent);
  } else if(chapter===25){
    // Predator: visible rim, segmented shell, dorsal blades, sensor cluster and jaw.
    k.plate([[2,50],[19,27],[34,23],[50,30],[73,33],[97,50],[73,67],[50,70],[34,77],[19,73]],"#252332",accent,.85);
    for(let i=0;i<5;i++){
      const xx=25+i*12,edge=26+i*2;
      k.plate([[xx,edge],[xx+11,edge+3],[xx+16,50],[xx+11,100-edge-3],[xx,100-edge],[xx+5,50]],i%2?"#3b374c":"#292738");
      k.line([[xx+2,edge+3],[xx+8,edge+6],[xx+12,47]],"#b85786",.6);
      if(!(phase===2&&i===1))k.plate([[xx,31],[xx+5,6+i*3],[xx+10,29]],"#5b4a63",accent,.65);
      if(i<3)k.plate([[xx,69],[xx+8,92-i*4],[xx+12,68]],"#403349",accent,.55);
    }
    k.plate([[3,50],[14,37],[27,43],[23,57],[14,64]],"#090e19",accent,.8);
    for(const yy of [44,50,56]){k.disc(14+(yy===50?-3:3),yy,1.8,2.2,"#f9a8d4");}
    for(let i=0;i<4;i++){k.plate([[6+i*4,46],[8+i*4,51],[10+i*4,46]],"#e7c9da");}
    k.line([[22,67],[37,65],[54,64],[78,61]],accent,.65);
    k.vents(72,43,5,14,3);k.bolts(36,61,5,9);
    if(phase>0)k.line([[43,30],[39,43],[46,49],[40,62]],"#fb7185",.95);
    if(exposed)k.eye(42,50,6,11,accent,true);
  } else if(chapter===26){
    // Three independent clockwork races, teeth, bearings and broken ring sectors.
    for(let ring=0;ring<3;ring++){
      const r=43-ring*10,angle=reduceMotion?0:t/(240+ring*90)*(ring%2?-1:1),missing=phase>ring?2:0;
      for(let i=0;i<16;i++){
        if(i>=5&&i<5+missing)continue;
        const a=i*Math.PI/8+angle,C=(rr:number,aa:number):Point=>[50+Math.cos(aa)*rr,50+Math.sin(aa)*rr];
        k.plate([C(r-2,a),C(r+2,a),C(r+2,a+.35),C(r-2,a+.35)],ring===1?STEEL:OCHRE);
        if(ring===0)k.plate([C(r+1,a+.08),C(r+5,a+.08),C(r+5,a+.21),C(r+1,a+.21)],"#9e854e");
        if(i%4===0){k.line([C(10,a),C(r-3,a)],FACE,1);k.disc(...C(r-5,a),2,2,STEEL,INK);}
      }
    }
    k.disc(50,50,14,14,"#564328",STEEL);k.eye(50,50,exposed?10:7,exposed?10:7,accent,exposed);
    for(const [xx,yy]of [[28,28],[72,28],[28,72],[72,72]]){k.box(xx-3,yy-3,6,6,"#4c5355");k.disc(xx,yy,1.5,1.5,accent);}
    k.box(7,47,10,6,"#454343");k.line([[7,50],[17,50]],accent,.85);
  } else if(chapter===27){
    // Flagship's war engine: prow, bridge, hangars, batteries and broken superstructure.
    k.plate([[3,31],[17,17],[55,10],[80,17],[96,34],[96,66],[80,83],[55,90],[17,83],[3,69]],FACE);
    k.plate([[6,42],[25,27],[76,29],[85,43],[85,57],[76,71],[25,73],[6,58]],"#363643");
    for(const side of [-1,1]){
      const yy=(v:number)=>50+side*v;
      for(let i=0;i<5;i++){
        const xx=21+i*13;
        if(phase===2&&i===2&&side<0)continue;
        k.plate([[xx,yy(23)],[xx+9,yy(19)],[xx+11,yy(28)],[xx+2,yy(32)]],i%2?STEEL:"#687b89");
        k.disc(xx+4,yy(26),2.5,3,"#3f4854");k.box(xx-3,yy(26)-1,7,2,INK);
        k.bolts(xx+2,yy(20),2,5);
      }
      k.plate([[56,yy(34)],[70,yy(30)],[74,yy(40)],[61,yy(41)]],"#5e2539");
      k.line([[60,yy(34)],[67,yy(38)],[68,yy(33)]],accent,1);
    }
    k.plate(phase===2?[[21,39],[29,26],[38,25],[45,36],[42,44]]:[[18,39],[31,7],[47,5],[53,37],[45,44]],phase===2?"#3d343d":STEEL);
    k.box(31,phase===2?29:13,14,9,INK);for(let i=0;i<4;i++)k.box(33+i*3,phase===2?31:15,1.2,3,accent);
    k.plate([[8,46],[27,39],[35,46],[35,54],[27,61],[8,54]],"#a1afb5");
    k.box(7,46,19,8,INK);k.vents(9,47,5,6,3);
    for(const yy of [36,56]){k.box(64,yy,16,8,"#151e2a");k.line([[65,yy+4],[79,yy+4]],OCHRE,.7);k.bolts(66,yy+1,3,5);}
    for(const yy of [30,59]){k.box(85,yy,11,12,"#50454b");k.vents(87,yy+1,3,10,2.5);k.line([[94,yy+3],[99,yy+6],[94,yy+9]],"#fb923c",1);}
    k.eye(51,50,exposed?9:5,exposed?13:8,accent,exposed);
    if(phase>0){k.line([[35,29],[43,36],[38,44],[46,53]],"#fb7185",1);k.box(28,60,18,5,"#312533");k.vents(30,61,5,3,3);}
  } else {
    // The Herald: closed reliquary, exposed singularity, then a fractured star.
    paintHeraldBody(k,e,phase,reduceMotion);
  }
  // Damage uses deterministic broken metal and sparks, never renderer-owned randomness.
  if(phase>0){
    const xx=chapter===25?58:71,yy=chapter===22?72:62;
    k.plate([[xx,yy],[xx+5,yy-4],[xx+8,yy+2],[xx+3,yy+6]],"#201e29");
    for(let i=0;i<phase+1;i++){
      const flicker=reduceMotion?1:1+Math.sin(t*.2+i)*.4;
      k.line([[xx+2+i*2,yy+1],[xx+4+i*2,yy-3*flicker]],i%2?"#fff1c9":"#fb923c",.7);
    }
  }
  ctx.restore();
}

export type OuterModel = ReturnType<typeof model>;
type Kit = OuterModel;

/* Self-lit parts are composited after the Void's darkness. This is an actor contour,
   not a brighter background or a projected attack lane. */
export function paintVoidMachineLights(ctx: Ctx, e: Enemy) {
  const k=model(ctx,e,e.flash>0),accent="#f472b6";
  ctx.save();ctx.beginPath();ctx.rect(e.x+.4,e.y+.4,e.w-.8,e.h-.8);ctx.clip();
  for(let i=0;i<4;i++){
    const xx=27+i*13;
    k.plate([[xx,35],[xx+10,38],[xx+15,50],[xx+10,63],[xx,66],[xx+5,50]],"#1e1c2b","#65405b",.4);
  }
  for(let i=0;i<5;i++){
    if(e.hp/e.maxHp<.33&&i===1)continue;
    const xx=25+i*12;
    k.line([[xx,31],[xx+5,6+i*3],[xx+10,29]],"#b5608a",.5);
  }
  k.line([[3,50],[19,27],[34,23],[50,30],[73,33],[96,50],[73,67],[50,70],[34,77],[19,73],[3,50]],accent,.65);
  for(const yy of [44,50,56])k.disc(14+(yy===50?-3:3),yy,1.5,2,accent,INK,.4);
  k.line([[6,47],[18,51],[6,55]],accent,.5);
  k.line([[26,39],[42,44],[57,43],[75,46]],"#9f4e78",.45);
  k.line([[25,64],[43,61],[62,61],[80,56]],"#ba638e",.45);
  if(e.hp/e.maxHp<.33)k.eye(42,50,4,7,accent);
  ctx.restore();
}

function paintMini(k: Kit, chapter: number, accent: string, phase: number, t: number) {
  const dark="#293747";
  if(chapter===22){
    for(const side of [-1,1])for(const xx of [29,65]){
      const y=(v:number)=>50+v*side;
      k.line([[xx,y(9)],[xx-14,y(33)],[xx-23,y(43)]],INK,3);
      k.line([[xx,y(9)],[xx-14,y(33)],[xx-23,y(43)]],STEEL,1.6);
      k.disc(xx-14,y(33),3,4,FACE);k.line([[xx-12,y(30)],[xx-2,y(12)]],OCHRE,.7);
    }
    k.plate([[13,39],[29,25],[77,29],[91,43],[87,64],[27,73],[13,59]],FACE);
    k.box(33,34,34,26,dark);k.eye(72,49,6,10,accent,phase>0);
    k.vents(37,38,6,17,4);k.bolts(28,67,7,8);
    if(phase===0)k.plate([[25,30],[30,18],[37,29],[45,20],[51,32]],"#d9f3ff");
  }else if(chapter===26){
    k.plate([[12,12],[88,12],[94,25],[94,75],[88,88],[12,88],[6,74],[6,26]],"#786e50");
    k.box(18,17,64,66,STEEL);k.box(25,22,50,56,"#192333");
    for(const xx of [22,76]){k.vents(xx,25,2,47,3);k.bolts(xx,19,2,4);k.bolts(xx,82,2,4);}
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const C=(r:number):Point=>[50+Math.cos(a)*r,50+Math.sin(a)*r];k.line([C(15),C(27)],OCHRE,1.2);k.disc(...C(29),2.2,2.2,FACE);}
    k.eye(50,50,12,16,accent,phase>0);k.box(7,46,20,8,FACE);k.line([[7,50],[25,50]],accent,.9);
    if(phase>0)k.line([[20,17],[27,27],[22,43],[29,54]],"#fb923c",.85);
  }else if(chapter===24||chapter===28){
    const count=chapter===28?6:8;
    for(let i=0;i<count;i++){
      const a=i*Math.PI*2/count,C=(r:number,aa:number):Point=>[50+Math.cos(aa)*r,50+Math.sin(aa)*r];
      k.line([C(13,a),C(38,a)],OCHRE,1);
      if(!(phase>0&&i===2))k.plate([C(20,a-.3),C(43,a-.2),C(46,a),C(40,a+.2),C(20,a+.3)],i%2?STEEL:FACE);
      k.line([C(27,a),C(39,a)],accent,.7);k.disc(...C(32,a),1.2,1.2,OCHRE);
    }
    k.disc(50,50,22,22,dark,STEEL);k.eye(50,50,10,12,accent,phase>0);
  }else if(chapter===25){
    k.plate([[3,50],[22,23],[77,28],[97,50],[77,72],[22,77]],dark,accent,.8);
    for(let i=0;i<4;i++){
      k.plate([[30+i*13,30],[39+i*13,13],[44+i*13,32],[46+i*13,67],[34+i*13,73]],"#494252");
      k.disc(38+i*13,58,3,6,"#181927",accent,.5);
    }
    k.eye(20,50,5,8,accent,phase>0);k.vents(54,36,6,10,4);
    k.line([[25,72],[57,68],[85,62]],accent,.7);
  }else{
    k.plate([[3,50],[19,25],[75,20],[96,38],[96,64],[76,81],[19,75]],FACE);
    if(chapter===21){
      for(const side of [-1,1]){
        const y=(v:number)=>50+v*side;
        k.plate([[20,y(9)],[48,y(44)],[75,y(39)],[60,y(8)]],"#496371");
        k.line([[38,y(19)],[49,y(33)],[68,y(30)]],accent,.8);
        k.disc(79,y(20),7,9,INK,STEEL);k.disc(79,y(20),4,6,accent);
        k.line([[86,y(20)],[91+Math.sin(t*.2)*1.5,y(20)]],accent,.8);
      }
    }else if(chapter===23){
      for(let i=0;i<3;i++){
        k.box(29+i*18,27,15,43,dark);k.box(32+i*18,31,9,11,OCHRE);k.vents(32+i*18,48,3,16,3);
        k.bolts(32+i*18,73,2,7);
      }
    }else{
      k.box(27,27,42,45,dark);k.plate([[29,26],[35,15],[56,17],[61,29]],STEEL);
      for(let i=0;i<3;i++){k.box(33,36+i*11,28,6,"#616c7a");k.line([[34,39+i*11],[56,39+i*11]],accent,.6);}
      k.vents(76,33,4,31,4);k.bolts(28,76,6,8);
    }
    k.eye(17,50,5,8,accent,phase>0);k.box(4,47,10,6,INK);
    k.line([[4,50],[13,50]],accent,.7);k.bolts(26,23,6,9);
  }
}

export function decorateOuterModule(ctx: Ctx, e: Enemy, m: Mod, chapter: number) {
  const b=modBox(e,m),k=model(ctx,b,m.flash>0),accent=ACCENT[chapter-21]??"#60c9ff";
  if(m.kind==="leg"){
    k.line([[42,17],[31,55],[68,78]],INK,3);k.line([[42,17],[31,55],[68,78]],STEEL,1.8);
    k.line([[53,24],[44,58]],"#dbe7eb",.75);k.disc(34,54,9,10,FACE);k.disc(34,54,4,5,accent);
    k.plate([[39,74],[85,77],[96,92],[37,91]],FACE);k.bolts(42,85,4,12);
  }else if(m.kind==="pod"||m.kind==="tank"||m.kind==="battery"||m.kind==="engine"){
    k.box(15,20,57,55,FACE);k.box(21,28,44,36,"#1c2939");k.vents(25,33,5,24,7);
    k.bolts(16,16,5,13);k.bolts(16,80,5,13);
    if(m.kind==="pod"){k.plate([[5,43],[26,28],[31,70],[5,63]],STEEL);k.disc(22,47,6,9,accent);k.line([[9,47],[9,61]],OCHRE,.7);}
    if(m.kind==="tank"){k.line([[17,45],[69,45]],"#d9f3ff",.8);k.plate([[28,18],[34,3],[42,18],[51,8],[59,20]],"#b9e5f4");}
    if(m.kind==="battery"){k.box(57,42,27,17,STEEL);k.box(76,45,8,11,INK);k.line([[76,50],[83,50]],accent,.8);}
    if(m.kind==="engine"){k.disc(77,50,14,25,INK,STEEL);k.disc(77,50,8,17,"#fb923c");k.disc(77,50,3,9,"#fff1c9");}
  }else if(m.kind==="node"){
    k.disc(50,50,33,33,FACE);k.disc(50,50,24,24,INK,STEEL);
    k.box(56,43,27,14,STEEL);k.line([[67,50],[83,50]],accent,.9);k.vents(24,27,3,17,5);
    k.eye(40,52,8,10,accent);
    for(const [x,y]of [[25,22],[76,22],[25,78],[76,78]])k.disc(x,y,3,3,OCHRE);
  }else if(m.kind==="mirror"||m.kind==="blade"){
    k.plate([[36,12],[79,25],[70,81],[25,90],[40,52]],"#c1d6ed");
    k.line([[44,20],[57,44],[43,73]],accent,.8);k.bolts(31,77,3,13);k.line([[30,88],[69,78]],OCHRE,.65);
  }else if(m.kind==="shield"){
    k.line([[15,42],[32,25],[70,25],[88,43]],STEEL,1);k.vents(31,43,6,27,6);k.bolts(23,77,5,13);
    k.disc(50,43,8,12,accent);
  }else{
    k.line([[35,15],[56,8],[73,27],[65,77],[42,91],[28,72]],OCHRE,1);
    for(let i=0;i<5;i++){k.disc(41+(i%2)*22,23+i*13,3,3,STEEL);}
  }
  if(m.hp<m.maxHp*.45)k.line([[33,22],[48,38],[39,54],[54,73]],"#fb923c",.7);
}
