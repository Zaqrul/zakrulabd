import type { Enemy, State } from "./space-logic.ts";
import { escortKit } from "./space3-escort-kit.ts";

/* The original tell clocks and emitter points are retained on each machine. */
export function drawOuterEscort(ctx:CanvasRenderingContext2D,e:Enemy,s:State,reduceMotion:boolean):boolean{
  if(!["lancer","magnet","frigate","hangar","shade","drone"].includes(e.type))return false;
  const k=escortKit(ctx,e),steel="#a4adb6",dark="#33414e",ochre="#bb853e",t=reduceMotion?0:e.t;
  switch(e.type){
    case "lancer":
      k.poly([[.04,.5],[.25,.15],[.67,.12],[.93,.3],[.98,.5],[.93,.7],[.67,.88],[.25,.85]],steel);
      k.poly([[.14,.38],[.76,.36],[.93,.5],[.76,.64],[.14,.62]],dark);
      k.box(.22,.45,.63,.1,"#8299a7");k.box(.08,.41,.18,.18,dark);
      for(const y of [.15,.74]){k.box(.49,y,.28,.11,"#718595");k.bolts(.53,y+.02,2);}
      k.vents(.71,.4,2);k.light(.93,.5,.6,"#67e8f9");
      k.light(.08,.5,e.d>0?2.5:1.6,e.d>0?"#fff1c9":"#fb7185");
      if(e.d>0)for(const side of [-1,1]){
        k.line([[.52,.5+side*.25],[.66,.5+side*.42]],"#fff1c9",.75);
        k.line([[.45,.5+side*.22],[.45,.5+side*.4]],"#5eead4",.7);
      }break;
    case "magnet":{
      const strength=Math.max(0,1-Math.hypot(k.X(.5)-(s.p.x+10),k.Y(.5)-(s.p.y+8))/130);
      for(let i=0;i<4;i++){
        const a=i*Math.PI/2+t/80,bx=.5+Math.cos(a)*.3,by=.5+Math.sin(a)*.3;
        k.line([[.5,.5],[bx,by]],steel,1.2);k.disc(bx,by,1.5,ochre);k.light(bx,by,.55,"#5eead4");
      }
      k.disc(.5,.5,e.w*.31,dark);k.disc(.5,.5,e.w*.24,steel);
      for(let i=0;i<3;i++){
        ctx.beginPath();ctx.ellipse(k.X(.5),k.Y(.5),e.w*(.23+i*.13),e.h*(.23+i*.13),0,0,Math.PI*2);
        ctx.strokeStyle=i===1?"#5ba89f":"#789f9f";ctx.lineWidth=i===1?1:.6;ctx.stroke();
      }
      k.light(.5,.5,Math.max(1,e.w*.12),strength>.25?"#fff1c9":"#67e8f9");
      if(strength>.25)for(let i=0;i<4;i++){
        const a=i*Math.PI/2+t/40;ctx.strokeStyle=`rgb(94 234 212 / ${.25+strength*.45})`;ctx.lineWidth=.7;ctx.beginPath();ctx.arc(k.X(.5),k.Y(.5),e.w*.43,a,a+.72);ctx.stroke();
      }break;
    }
    case "frigate":{
      k.poly([[.02,.5],[.2,.17],[.77,.1],[.97,.27],[.97,.73],[.77,.9],[.2,.83]],steel);
      k.poly([[.12,.5],[.32,.3],[.79,.28],[.88,.5],[.79,.72],[.32,.7]],dark);
      k.poly([[.18,.35],[.28,.13],[.46,.16],[.51,.36]],"#788b9b");
      k.box(.25,.23,.15,.07,"#b9d8e1");k.line([[.34,.15],[.36,.04]],steel,.6);
      for(let i=0;i<3;i++){
        const xx=e.x+e.w*(.3+i*.17),yy=e.y+e.h*.16-(e.cd<20?2:0);
        // Same three frost-shell blisters and tell lights as the original body.
        ctx.fillStyle=e.flash>0?"#fff":dark;ctx.fillRect(xx,yy,7,4);
        ctx.strokeStyle=steel;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(xx+5,yy+3);ctx.lineTo(xx+5,yy);ctx.stroke();
        ctx.beginPath();ctx.arc(xx+5,yy,1,0,Math.PI*2);ctx.fillStyle=e.cd<20?"#fff1c9":"#8bb7cc";ctx.fill();
      }
      for(const y of [.36,.66]){k.box(.86,y,.1,.1,dark);k.light(.95,y+.05,.6,"#93c5fd");}
      k.line([[.25,.72],[.72,.74]],ochre,.9);k.vents(.5,.48,4);k.bolts(.36,.8,4);break;
    }
    case "hangar":{
      k.poly([[.04,.23],[.26,.06],[.94,.16],[.97,.84],[.26,.94],[.04,.77]],steel);
      k.box(.49,.22,.34,.56,dark);k.vents(.57,.3,3,.36);k.bolts(.5,.22,3);k.bolts(.5,.76,3);
      k.poly([[.09,.23],[.42,.3],[.42,.7],[.09,.77]],"#141922");
      const open=e.cd>0&&e.cd<22;
      if(open){
        k.poly([[.09,.23],[.43,.3],[.36,.4],[.09,.36]],ochre);
        k.poly([[.09,.64],[.36,.6],[.43,.7],[.09,.77]],ochre);
        k.poly([[.15,.5],[.26,.41],[.35,.5],[.26,.59]],"#849aa6");
      }else{for(const y of [.27,.5,.67])k.line([[.12,y],[.39,y+.04]],ochre,.75);}
      for(const y of [.2,.8]){k.box(.73,y-.065,.17,.13,dark);k.light(.79,y,1.5,e.cd<22?"#fff1c9":"#fbcf33");}
      k.line([[.9,.3],[.95,.5],[.9,.7]],"#fbd486",.75);break;
    }
    case "shade":{
      const firing=reduceMotion||e.t%50===0;
      ctx.save();ctx.globalAlpha=e.flash>0||firing?1:.22;
      k.poly([[.03,.5],[.3,.1],[.59,.23],[.96,.5],[.59,.77],[.3,.9]],"#45404f");
      k.poly([[.24,.5],[.43,.3],[.72,.42],[.89,.5],[.72,.58],[.43,.7]],"#23202e");
      k.line([[.3,.16],[.57,.28],[.86,.47]],"#ad718e",.55);
      k.line([[.31,.8],[.56,.68]],"#856481",.55);k.box(.56,.42,.12,.16,ochre);
      ctx.restore();k.light(.2,.5,Math.max(1.3,e.h*.13),firing?"#fb7185":"#71415a");break;
    }
    case "drone":
      k.poly([[.02,.5],[.33,.12],[.68,.18],[.97,.5],[.68,.82],[.33,.88]],steel);
      k.poly([[.2,.5],[.39,.3],[.71,.37],[.83,.5],[.71,.63],[.39,.7]],dark);
      k.line([[.38,.2],[.56,.25],[.7,.36]],ochre,.6);k.light(.25,.5,Math.max(1,e.h*.12),"#fff1c9");
      k.box(.65,.42,.18,.16,"#162a32");k.line([[.58,.5],[.84,.5]],"#5eead4",.8);break;
  }
  if(e.hp<e.maxHp*.4)k.line([[.61,.27],[.53,.39],[.65,.47]],"#fb7185",.65);
  return true;
}
