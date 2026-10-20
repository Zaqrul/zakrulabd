/* Space 1's later enemies. Geometry stays within the existing body box; the
   shared actor painter adds the original articulated guns and attack warnings. */
import { missileStage, type Enemy, type State } from "./space-logic.ts";
import { metal, tube, ellipse, flame, tone } from "./space-material.ts";

type Ctx = CanvasRenderingContext2D;
const INK = "#171717", DARK = "#263241", STEEL = "#a4adb6";
const KINDS = new Set(["gunner", "bomber", "splitter", "zigzag", "turret", "orbiter", "armor", "mine", "shard", "comet", "swarm", "scout", "sniper", "diver", "fighter", "seeker", "rock", "smallrock", "pod"]);

export function drawFirstEnemy(ctx: Ctx, e: Enemy, s: State, reduceMotion = false): boolean {
  if (s.chapter > 8 || s.chapter < 1 || !KINDS.has(e.type) || s.chapter < 3 && e.type !== "pod") return false;
  const { x, y, w, h } = e, t = reduceMotion ? 0 : e.t;
  const low = e.hp < e.maxHp * .5, cx = x + w / 2, cy = y + h / 2;
  const X = (v: number) => x + w * v, Y = (v: number) => y + h * v;
  const plate = (pts: number[][], fill: string, rim = true) => {
    ctx.beginPath();pts.forEach(([a,b],i)=>i?ctx.lineTo(X(a),Y(b)):ctx.moveTo(X(a),Y(b)));ctx.closePath();
    ctx.fillStyle=tone(fill);ctx.fill();
    if(rim){ctx.strokeStyle=INK;ctx.lineWidth=w<20?.55:.65;ctx.lineJoin="round";ctx.stroke();}
  };
  const box = (a: number,b: number,c: number,d: number,fill: string) => plate([[a,b],[a+c,b],[a+c,b+d],[a,b+d]],fill);
  const rod = (a: number,b: number,c: number,d: number,fill=STEEL,width=.6) => tube(ctx,X(a),Y(b),X(c),Y(d),width,fill);
  const disc = (a: number,b: number,r: number,fill: string,ry=r) => ellipse(ctx,X(a),Y(b),r,ry,fill);
  const eye = (a: number,b: number,r: number,fill: string) => {
    disc(a,b,r+0.5,INK);
    ctx.beginPath();ctx.arc(X(a),Y(b),r,0,Math.PI*2);ctx.fillStyle=tone(fill);ctx.fill();
    ctx.fillStyle=tone("#fff1cc");ctx.fillRect(X(a)-r*.45,Y(b)-r*.45,Math.max(.35,r*.4),Math.max(.35,r*.4));
  };
  const vents = (a: number,b: number,n=3) => {for(let i=0;i<n;i++)box(a+i*.08,b,.035,.12,INK);};
  const bolts = (a: number,b: number,n=3) => {for(let i=0;i<n;i++)disc(a+i*.15,b,.38,STEEL);};
  const exhaust = (a: number,b: number,length=3,colour="#fbbf24") => {
    box(a-.1,b-.06,.1,.12,DARK);
    const len = length + Math.sin(t/4)*.7;
    plate([[a,b-.04],[Math.min(1,a+len/w),b],[a,b+.04]],colour);
  };
  ctx.save();
  switch(e.type){
    case "gunner":
      for(const b of [.12,.73]){
        box(.12,b,.78,.15,DARK);for(let i=0;i<5;i++)box(.16+i*.14,b+.025,.05,.10,"#6b8588");
      }
      plate([[.1,.3],[.33,.22],[.87,.3],[.96,.62],[.76,.78],[.16,.68]],"#508f8a");
      box(.62,.3,.24,.32,DARK);vents(.66,.34,2);bolts(.26,.66,3);
      disc(.36,.48,3,"#619593");eye(.69,.62,1,"#7dd3e8");
      if(!low)box(.16,.25,.33,.11,"#8cb7af");
      exhaust(.96,.51,1.5,"#7dd3e8");break;
    case "bomber":
      for(const b of [.05,.74])plate([[.3,b+.08],[.65,b],[.84,b+.17],[.42,b+.2]],low&&b<.1?DARK:"#ae7744");
      plate([[.02,.45],[.12,.2],[.71,.18],[.91,.3],[.97,.68],[.68,.82],[.14,.77]],"#86492a");
      box(.38,.48,.36,.26,DARK);disc(.54,.6,1.8,"#bb853e",1.1);rod(.56,.48,.56,.72,STEEL);
      plate([[.1,.34],[.29,.28],[.29,.46],[.09,.5]],"#fcd9a0");
      vents(.44,.25);bolts(.28,.77);box(.85,.13,.1,.22,STEEL);exhaust(.94,.55,2.3);break;
    case "splitter":
      box(.38,.18,.19,.64,DARK);rod(.47,.22,.47,.78,"#f5a3d0",1.3);
      for(const b of [.24,.76]){
        plate([[.07,b],[.22,b-.19],[.73,b-.19],[.91,b],[.73,b+.18],[.22,b+.18]],"#ad316c");
        box(.45,b-.12,.26,.23,"#602c53");eye(.23,b,1.1,"#fde68a");bolts(.52,b+.12,2);
      }
      rod(.08,.5,.9,.5,"#f472b6",.6);
      if(!low){box(.67,.37,.13,.26,STEEL);rod(.73,.41,.73,.59,INK);}
      break;
    case "zigzag":
      plate([[.02,.5],[.27,.06],[.49,.33],[.74,.12],[.97,.24],[.76,.53],[.8,.87],[.54,.68],[.32,.94],[.25,.62]],"#6c922f");
      plate([[.15,.49],[.34,.23],[.51,.48],[.69,.32],[.59,.62],[.34,.72]],"#a2bd65");
      rod(.36,.31,.42,.62,DARK,.7);eye(.2,.51,.7,"#ff923c");
      if(!low)box(.63,.53,.17,.12,DARK);exhaust(.91,.35,1.2,"#e5f99b");break;
    case "turret":
      box(.05,.68,.9,.24,DARK);bolts(.13,.82,5);disc(.5,.58,4.2,"#657486",2.7);
      box(.2,.25,.58,.37,"#9aabb7");box(.73,.4,.2,.26,"#4c6677");
      if(!low)box(.1,.48,.15,.23,"#bb853e");
      vents(.43,.29);eye(.65,.42,.75,"#fb7185");rod(.32,.25,.32,.61,STEEL);break;
    case "orbiter":{
      ctx.beginPath();ctx.ellipse(cx,cy,w*.43,h*.43,0,0,Math.PI*2);ctx.strokeStyle="#435c79";ctx.lineWidth=.5;ctx.stroke();
      for(let i=0;i<3;i++){
        const a=t/65+i*Math.PI*2/3,ax=.5+Math.cos(a)*.26,ay=.5+Math.sin(a)*.26,bx=.5+Math.cos(a+.24)*.41,by=.5+Math.sin(a+.24)*.41;
        rod(.5,.5,ax,ay,STEEL,1);rod(ax,ay,bx,by,"#628baa",.9);disc(ax,ay,.9,DARK);eye(bx,by,.7,"#7dd3fc");
      }
      disc(.5,.5,4.5,"#5496c2");disc(.5,.5,3,DARK);eye(.47,.5,1.9,"#bae6fd");
      if(!low)plate([[.35,.3],[.54,.22],[.69,.35],[.56,.37]],STEEL);break;
    }
    case "armor":
      plate([[.03,.5],[.23,.06],[.79,.12],[.98,.5],[.79,.88],[.23,.94]],"#536172");
      plate([[.18,.5],[.36,.23],[.76,.28],[.85,.5],[.76,.72],[.36,.77]],DARK);
      for(const side of [-1,1]){
        const b=.5+side*.14;
        plate([[.1,.5+side*.05],[.3,.5+side*.42],[.76,.5+side*.34],[low?.67:.9,b],[.4,b]],"#aab4c2");
        bolts(.4,.5+side*.31,3);rod(.29,.5+side*.34,.38,.5+side*.17,"#687b8d");
      }
      eye(.48,.5,2.1,"#fb923c");vents(.7,.43,2);break;
    case "mine":
      rod(.56,.72,.67,.91,"#7b8696");disc(.7,.92,.8,DARK);
      for(let i=0;i<6;i++){
        if(low&&i===4)continue;
        const a=i*Math.PI/3+t/90;
        plate([[.5+Math.cos(a-.18)*.24,.5+Math.sin(a-.18)*.24],[.5+Math.cos(a)*.46,.5+Math.sin(a)*.46],[.5+Math.cos(a+.18)*.24,.5+Math.sin(a+.18)*.24]],STEEL);
      }
      disc(.5,.5,4.5,"#8295a8");disc(.5,.5,3,DARK);rod(.32,.41,.68,.41,STEEL);eye(.5,.54,1.5,t%30<15?"#fb7185":"#852f42");break;
    case "shard":
      plate([[.48,.02],[.96,.44],[.62,.96],[.09,.73],[.04,.37]],"#46b9d2");
      plate([[.48,.02],[.44,.5],[.09,.73],[.04,.37]],"#c0f4fa");
      plate([[.48,.02],[.96,.44],[.44,.5]],"#88d9eb");
      plate([[.44,.5],[.62,.96],[.09,.73]],"#27869d");
      rod(.48,.18,.49,.76,"#e2fbff",.65);if(low)rod(.1,.55,.76,.36,DARK,.8);break;
    case "comet":
      ctx.save();
      for(let i=0;i<4;i++){
        ctx.globalAlpha=.55-i*.1;ctx.fillStyle=tone(i%2?"#ffba68":"#ed7841");
        ctx.beginPath();ctx.arc(X(1.1+i*.28),Y(.5+Math.sin(t/8+i)*.09),Math.max(.3,1-i*.18),0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
      for(let i=0;i<4;i++){
        const b=.28+i*.14;plate([[.42,b],[.98,b+(Math.sin(t/6+i)*.06)],[.58,b+.12]],i%2?"#bc542f":"#f3a34c");
      }
      plate([[.03,.46],[.2,.17],[.43,.21],[.63,.5],[.4,.8],[.17,.77]],"#a94a2c");
      plate([[.09,.44],[.24,.27],[.4,.35],[.41,.62],[.2,.67]],"#ffb15c");eye(.23,.45,1.3,"#fff3c4");
      if(low)rod(.2,.74,.4,.38,DARK);break;
    case "swarm":
      plate([[.04,.5],[.35,.28],[.72,.05],[.58,.44],[.97,.5],[.58,.56],[.72,.95],[.35,.72]],"#379b8b");
      plate([[.1,.5],[.44,.32],[.72,.5],[.44,.68]],DARK);eye(.26,.5,.6,"#fef08a");
      if(!low)rod(.5,.27,.64,.19,"#a7ead4",.5);exhaust(.9,.5,.8,"#b6fff0");break;
    case "scout":
      plate([[.02,.5],[.33,.32],[.81,.08],[.98,.13],[.72,.45],[.82,.7],[.98,.87],[.76,.91],[.34,.65]],"#586474");
      plate([[.15,.5],[.42,.39],[.67,.44],[.6,.6],[.38,.6]],"#b94e48");
      box(.39,.44,.2,.14,"#f4a39a");vents(.7,.57,2);if(!low)rod(.6,.28,.81,.19,STEEL);exhaust(.95,.78,1.2);break;
    case "sniper":
      plate([[.06,.5],[.31,.31],[.69,.13],[.96,.26],[.9,.75],[.69,.87],[.31,.69]],"#8468b9");
      box(.52,.28,.22,.43,DARK);vents(.78,.32,2);eye(.62,.5,1,"#c4b5fd");
      if(!low)box(.5,.12,.29,.12,STEEL);bolts(.53,.78,2);break;
    case "diver":
      plate([[.01,.5],[.46,.04],[.71,.1],[.54,.38],[.96,.3],[.79,.5],[.96,.7],[.54,.62],[.71,.9],[.46,.96]],"#b8662e");
      plate([[.08,.5],[.4,.35],[.58,.5],[.4,.65]],DARK);eye(.4,.5,.9,"#fcd9a0");
      for(const b of [.19,.72])rod(.44,b,.56,b+.05,"#fbcf33",1);
      if(!low)box(.68,.43,.13,.13,STEEL);exhaust(.96,.5,1.3);break;
    case "fighter":
      for(const side of [-1,1]){
        const b=.5+side*.24;
        plate([[.27,.5+side*.06],[.58,.5+side*.43],[.93,.5+side*.4],[.72,.5+side*.13]],"#626f80");
        box(.67,b-.08,.24,.15,DARK);exhaust(.96,b,1.3,"#fb923c");
        if(!low||side<0)rod(.49,.5+side*.24,.77,.5+side*.3,"#d36c63");
      }
      plate([[.02,.5],[.33,.35],[.77,.39],[.87,.5],[.77,.61],[.33,.65]],"#9a4243");
      plate([[.32,.47],[.54,.41],[.6,.5],[.5,.58],[.32,.54]],"#f4a39a");break;
    case "seeker":{
      ctx.translate(cx,cy);ctx.rotate(e.rot);
      metal(ctx,[[-w*.48,-h*.19],[w*.28,-h*.19],[w*.48,0],[w*.28,h*.19],[-w*.48,h*.19]],STEEL);
      for(const side of [-1,1])metal(ctx,[[-w*.4,side*h*.13],[-w*.48,side*h*.45],[-w*.17,side*h*.17]],"#64748b");
      metal(ctx,[[w*.23,-h*.18],[w*.48,0],[w*.23,h*.18]],"#c2413a");
      ctx.fillStyle=tone("#fbcf33");ctx.fillRect(-w*.05,-h*.18,.8,h*.36);
      ctx.fillStyle=tone(low?"#fb7185":"#263241");ctx.fillRect(w*.1,-.4,1.2,.8);
      if(missileStage(e.t)==="run"){
        ctx.save();ctx.scale(-1,1);flame(ctx,w*.45,0,3.2,1,t);ctx.restore();
      }
      break;
    }
    case "rock":case "smallrock":{
      const pts=Array.from({length:8},(_,i)=>{
        const a=i*Math.PI/4+t/140,r=.35+Math.abs(Math.sin(e.id*2.7+i*1.8))*.12;
        return [.5+Math.cos(a)*r,.5+Math.sin(a)*r];
      });
      plate(pts,"#666d7b");
      for(let i=0;i<8;i++)plate([[.44,.46],pts[i],pts[(i+1)%8]],i<3?"#8e98a6":i<5?"#596273":"#747d8d",false);
      const n=e.type==="rock"?3:1;
      for(let i=0;i<n;i++){
        const a=.33+i*.17,b=.37+(i%2)*.25,r=low?2:1.5;
        disc(a,b,r,DARK,r*.8);rod(a-.06,b-.05,a+.04,b-.08,STEEL,.45);
      }
      for(let i=0;i<3;i++)disc(.13+i*.025,.72+i*.04,.3,"#9a8e7f");break;
    }
    case "pod":{
      const colours=["#6a7846","#4d7b9a","#3f857d","#7a599e","#477e99","#a45c36","#666d87","#a63f4c"];
      const accents=["#fbcf33","#93dcf1","#5eead4","#e0b7ff","#b9f5ff","#ffe09a","#bfcaf2","#ffad9b"];
      const col=colours[s.chapter-1],accent=accents[s.chapter-1];
      plate([[.09,.17],[.86,.17],[.96,.3],[.96,.86],[.08,.9],[.02,.75],[.02,.29]],col);
      box(.14,.26,.69,.46,DARK);box(.23,.34,.39,.24,col);eye(.73,.47,.9,accent);
      for(let i=0;i<s.chapter;i++)box(.18+(i%4)*.12,.36+Math.floor(i/4)*.12,.07,.065,accent);
      for(const a of [.07,.83]){box(a,.2,.09,.65,STEEL);rod(a+.02,.35,a+.06,.58,INK);}
      for(let i=0;i<4;i++)plate([[.22+i*.13,.77],[.29+i*.13,.77],[.24+i*.13,.88],[.17+i*.13,.88]],"#fbcf33");
      if(!low){rod(.49,.16,.49,.04,STEEL);disc(.49,.045,.7,t%24<12?accent:"#bb853e");}
      break;
    }
  }
  if(low && !["seeker","rock","smallrock","shard","comet"].includes(e.type)){
    rod(.55,.3,.46,.47,INK,.8);rod(.46,.47,.61,.57,"#ffb15c",.65);
    disc(.61,.57,.4,"#fff1cc");
  }
  ctx.restore();
  return true;
}
