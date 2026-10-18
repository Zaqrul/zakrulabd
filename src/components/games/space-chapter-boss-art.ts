/* Chapter bosses: Metal Slug-inspired machines, rebuilt as simple Canvas
   silhouettes. Shared simulation mounts keep effects attached to the weapons. */
import { beamMuzzle, bossScale, bossModel, coils, enemyMuzzle, missileMuzzle, shipSize, type Enemy, type State } from "./space-logic";
import { tone } from "./space-material";
import { drawDreadnought } from "./space-final-boss-art";
import { drawCrimsonFang } from "./space-fang-art";
import { drawSecondBoss } from "./space2-boss-art";
type Ctx = CanvasRenderingContext2D;
const INK = "#252c30", STEEL = "#929b96", CREAM = "#e5d8ad";

export function drawChapterBoss(ctx: Ctx, e: Enemy, s: State, reduceMotion: boolean) {
  const scale = bossScale(e);
  if (scale !== 1) {
    ctx.save();ctx.translate(e.x,e.y);ctx.scale(scale,scale);ctx.translate(-e.x,-e.y);
    const model = bossModel(e);
    const size = shipSize(s.p.level);
    const local = { ...s, p: { ...s.p, x: e.x + (s.p.x + size.w / 2 - e.x) / scale - size.w / 2, y: e.y + (s.p.y + size.h / 2 - e.y) / scale - size.h / 2 } };
    drawChapterBoss(ctx,model,local,reduceMotion);
    ctx.restore();return;
  }
  if (e.type === "boss8") { drawDreadnought(ctx, e, s, reduceMotion); return; }
  if (e.type === "boss7") { drawCrimsonFang(ctx, e, s, reduceMotion); return; }
  if (drawSecondBoss(ctx, e, s, reduceMotion)) return;
  const { x, y, h } = e, cy = h / 2;
  const t = reduceMotion ? 0 : e.t;
  const a = e.attack, warning = !!a && a.t < a.warn;
  const firing = !!a && a.t >= a.warn && a.t < a.warn + a.live;
  const hot = warning ? "#ffb665" : firing ? "#fff0c4" : "#d96948";
  const poly = (pts: number[][], colour: string) => {
    ctx.beginPath(); pts.forEach(([px, py], i) => i ? ctx.lineTo(x + px, y + py) : ctx.moveTo(x + px, y + py));
    ctx.closePath(); ctx.fillStyle = tone(colour); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 0.8; ctx.stroke();
  };
  const box = (px: number, py: number, bw: number, bh: number, c: string) => poly([[px,py],[px+bw,py],[px+bw,py+bh],[px,py+bh]],c);
  const disc = (px: number, py: number, r: number, c: string, ry = r) => {
    ctx.beginPath(); ctx.ellipse(x+px,y+py,r,ry,0,0,Math.PI*2); ctx.fillStyle=tone(c);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=0.8;ctx.stroke();
  };
  const rod = (px: number, py: number, qx: number, qy: number, width: number, c: string) => {
    ctx.lineCap="round";ctx.beginPath();ctx.moveTo(x+px,y+py);ctx.lineTo(x+qx,y+qy);
    ctx.strokeStyle=INK;ctx.lineWidth=width+1.4;ctx.stroke();ctx.strokeStyle=tone(c);ctx.lineWidth=width;ctx.stroke();ctx.lineCap="butt";
  };
  const rivets = (px: number, py: number, n: number, gap = 7) => {
    for(let i=0;i<n;i++) disc(px+i*gap,py,0.8,CREAM);
  };
  const vents = (px: number, py: number, n: number) => {
    for(let i=0;i<n;i++) box(px+i*3,py,1.2,5,INK);
  };
  const gun = (slot=0, length=14, width=3) => {
    const m=enemyMuzzle(e,s,slot), mx=m.x-x,my=m.y-y;
    rod(mx-Math.cos(m.angle)*length,my-Math.sin(m.angle)*length,mx,my,width,STEEL);
    disc(mx-Math.cos(m.angle)*length,my-Math.sin(m.angle)*length,width+1,"#5d685f");
    disc(mx,my,width*0.55,warning?hot:INK);
    if(firing && a && ["burst","fan","curtain"].includes(a.kind) && (a.t-a.warn)%10<3) {
      poly([[mx-Math.sin(m.angle)*2,my+Math.cos(m.angle)*2],[mx+Math.cos(m.angle)*6,my+Math.sin(m.angle)*6],[mx+Math.sin(m.angle)*2,my-Math.cos(m.angle)*2]],CREAM);
    }
  };
  const beam = (slot=0) => {
    const m=beamMuzzle(e,slot), mx=m.x-x,my=m.y-y;
    box(mx,my-3.5,9,7,"#64747a");box(mx-1,my-2.5,3,5,INK);
    disc(mx,my,1.5,a?.kind==="beam"&&(warning||firing)?hot:"#e68d56");
  };
  const rack = (slot=0) => {
    const m=missileMuzzle(e,slot), mx=m.x-x,my=m.y-y;
    const open=a?.kind==="missiles"&&(warning||firing);
    box(mx-5,my-4,13,8,"#424d43");
    for(let i=0;i<3;i++) disc(mx-3+i*4,my,1.3,open?hot:INK);
    box(mx-5,my-4-(open?4:0),13,open?2:7,"#88916a");
  };
  const damage = (px: number, py: number) => {
    if(e.a<1)return;
    poly([[px,py],[px+4,py+2],[px+2,py+6],[px+6,py+9]],INK);
    if(e.a>=2) {
      box(px+8,py+4,8,7,INK);vents(px+9,py+5,2);
      const rise=t%18;
      ctx.globalAlpha=0.35;disc(px+11,py-rise,2+rise/7,"#79766b");ctx.globalAlpha=1;
      poly([[px+8,py+7],[px+10,py+1-t%3],[px+12,py+5],[px+14,py+2],[px+14,py+7]],"#eda65a");
    }
  };
  ctx.save();
  switch(e.type) {
    case "boss1": {
      // Low forward glacis, rear engine mass, cast turret and continuous tracks.
      // Three flat values describe the armour planes; no gradients or textures.
      const olive="#697251", face="#85906a", bevel="#abb38b", shade="#424e3f";
      // Far track and exhaust plumbing behind the hull.
      poly([[9,39],[54,37],[62,42],[60,53],[12,54],[5,48]],"#343d36");
      rod(52,30,57,22,3,"#747c67");
      rod(57,22,57,10,3,"#747c67");
      box(54.5,9,5,3,"#303b34");
      for(let i=0;i<3;i++)box(55,15+i*3,4,1,"#aaa88b");
      // Continuous near track, shaped around the idler and drive sprocket.
      poly([[8,42],[53,41],[61,46],[62,52],[56,59],[8,59],[1,53],[1,48]],"#252f2b");
      poly([[9,45],[52,44],[58,48],[58,52],[53,56],[10,56],[5,52],[5,49]],"#555f4c");
      for(const [px,py,r] of [[10,51,4.6],[22,52,4],[34,52,4],[46,51,4],[54,49,4.4]]) {
        disc(px,py,r,"#8b9278");disc(px,py,r-1.3,"#424e41");disc(px,py,1.2,"#b6b79b");
        const angle=t/11+px;
        rod(px+Math.cos(angle)*1.6,py+Math.sin(angle)*1.6,px+Math.cos(angle)*3,py+Math.sin(angle)*3,0.6,"#a5ad8c");
      }
      for(let px=8+t%4;px<55;px+=4) {
        box(px,56.8,2.6,1.5,"#8b927c");
        box(px,42.4,2.6,1.4,"#7a846d");
      }
      for(const [px,py,ang] of [[3,48,-0.7],[3,53,0.7],[58,46,0.6],[59,52,-0.7]]) {
        rod(px,py,px+Math.cos(ang)*2.5,py+Math.sin(ang)*2.5,1.4,"#919783");
      }
      // Chassis: sloped front, bevelled engine deck and deep side armour.
      poly([[2,37],[13,27],[44,25],[57,31],[62,40],[57,47],[8,48],[1,43]],olive);
      poly([[2,37],[13,27],[44,25],[54,30],[20,32],[8,40]],bevel);
      poly([[2,37],[8,40],[57,36],[62,40],[57,47],[8,48],[1,43]],shade);
      poly([[13,33],[34,31],[33,42],[10,44],[7,40]],face);
      poly([[36,31],[52,31],[57,36],[54,43],[35,43]],olive);
      // Individual skirt plates overlap the upper track instead of floating above it.
      for(let i=0;i<3;i++) {
        const px=10+i*14;
        poly([[px,42],[px+12,41],[px+11,48],[px+2,49]],i===1?"#78835f":"#677451");
        rod(px+2,43,px+10,42.5,0.7,bevel);disc(px+3,45,0.8,"#c1bda0");
      }
      // Front towing eye and inspection hatch.
      disc(6,41,2.2,"#a0a58a");disc(6,41,0.9,INK);
      poly([[17,34],[29,33],[28,39],[16,40]],shade);
      rod(18,34.5,27,34,0.9,"#b8c3a0");
      box(19,36,7,1.3,"#243933");
      for(let i=0;i<4;i++)rod(39+i*3,33,38+i*3,38,1.1,"#2f3b32");
      // Turret race joins the cast turret to the hull.
      disc(32,26,16,shade,4);
      rod(19,27,43,27,1.5,"#a1a989");
      // Asymmetric turret: curved cheek, sloping roof and rear counterweight.
      ctx.beginPath();ctx.moveTo(x+19,y+21);
      ctx.quadraticCurveTo(x+12,y+12,x+21,y+6);
      ctx.lineTo(x+35,y+3);ctx.lineTo(x+48,y+8);
      ctx.lineTo(x+50,y+18);ctx.lineTo(x+42,y+24);
      ctx.lineTo(x+23,y+25);ctx.closePath();
      ctx.fillStyle=tone(face);ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=0.9;ctx.stroke();
      poly([[21,6],[35,3],[48,8],[39,10],[22,10]],bevel);
      poly([[40,10],[48,8],[50,18],[42,24],[37,23]],olive);
      rod(24,22,36,22,1,shade);rivets(34,16,2,6);
      // Low command cupola and periscope.
      disc(34,4,7,shade,2.6);box(29,0.5,10,3.5,olive);
      rod(29,1,38,1,1,bevel);box(31,1,4,1.1,"#253e38");
      rod(44,7,46,-1,0.7,"#929c85");
      // Armoured mantlet follows the real aim. Its muzzle remains at the
      // simulation tip; the sliding recoil jacket moves independently behind it.
      const m=enemyMuzzle(e,s);
      const shot=firing&&a&&["burst","fan","curtain"].includes(a.kind);
      const recoil=shot&&!reduceMotion?Math.max(0,1-(a.t-a.warn)%10/5)*2:0;
      ctx.save();ctx.translate(x+30,y+14);ctx.rotate(m.angle);ctx.translate(-x,-y);
      disc(0,0,8.2,shade);disc(0,0,6.6,"#929d78");
      poly([[1,-5],[12-recoil,-4.2],[17-recoil,-3],[17-recoil,3],[12-recoil,4.2],[1,5]],olive);
      poly([[4,-4],[12-recoil,-3.2],[15-recoil,-2],[4,-2]],bevel);
      box(13,-2.5,16,5,"#7d8773");
      box(16,-2.1,11,1.1,"#b9bea5");
      box(17-recoil,-3.4,3.3,6.8,"#4b5848");
      // Oversized slotted muzzle brake makes the artillery readable at 1x.
      poly([[28,-4],[33,-4],[34,-2.8],[34,2.8],[33,4],[28,4]],"#a0a58b");
      box(29,-2.5,1.3,5,"#384438");box(32.5,-2.7,1.5,5.4,INK);
      if(warning)box(33.8,-1.7,0.7,3.4,hot);
      if(shot && a && (a.t-a.warn)%10<3) {
        poly([[34,-2],[39,-4],[38,-1.5],[44,0],[38,1.5],[39,4],[34,2]],"#edb666");
        poly([[34,-1],[40,0],[34,1]],CREAM);
      }
      ctx.restore();
      // Rear missile cassette is recessed into its own angled mounting bracket.
      poly([[42,18],[51,16],[57,21],[55,29],[44,29]],shade);
      rack();
      if(e.a>=1) {
        poly([[37,32],[41,34],[39,36],[44,39]],INK);
        if(e.a>=2) {
          poly([[47,34],[53,33],[56,39],[49,42],[46,39]],"#29372e");
          rod(49,35,53,40,1.1,"#b2966a");
          const rise=t%16;
          ctx.globalAlpha=0.4;disc(54,29-rise,2+rise/6,"#777567");ctx.globalAlpha=1;
          poly([[49,38],[50,32-t%3],[52,35],[54,31],[54,39]],"#e6a35c");
        }
      }
      break;
    }
    case "boss2": {
      // Big Shiee: a low armoured amphibious battleship with three turrets.
      poly([[-10,h-21],[5,h-8],[18,h],[85,h],[96,h-9],[94,h-23]],"#667c79");
      poly([[0,h-10],[18,h-1],[85,h-1],[93,h-8]],"#a55e46");
      box(6,h-25,80,5,STEEL);
      box(40,8,25,18,"#82928b");box(46,1,16,11,"#a9b0a2");
      for(let i=0;i<3;i++)box(48+i*4,4,2,3,"#314b54");
      box(68,12,7,14,"#4c5956");box(67,10,9,3,INK);
      rod(55,1,55,-8,1,STEEL);
      rod(50,-5,60,-5,1,CREAM);
      for(const slot of [0,1,2]) {
        const m=enemyMuzzle(e,s,slot);
        const bx=m.x-x-Math.cos(m.angle)*17,by=m.y-y-Math.sin(m.angle)*17;
        disc(bx,by+3,8,"#394e49",3);
        poly([[bx-7,by+2],[bx-6,by-4],[bx+2,by-6],[bx+7,by-2],[bx+6,by+4]],"#82917b");
        rod(bx-4,by-4,bx+2,by-5,1,"#bac2a3");
        gun(slot,17,2.3);
        rod(m.x-x-Math.cos(m.angle)*4,m.y-y-Math.sin(m.angle)*4,m.x-x,m.y-y,3.6,"#9ba995");
      }
      // Layered bow armour, waterline ribs and recessed portholes.
      poly([[-10,h-21],[5,h-18],[19,h-5],[14,h-2],[5,h-8]],"#a0aaa0");
      poly([[19,h-5],[87,h-5],[93,h-9],[88,h-1],[18,h-1]],"#714737");
      for(let i=0;i<6;i++) {
        const px=22+i*10;
        rod(px,h-19,px-2,h-8,0.8,"#445c59");
        disc(px+3,h-15,1.9,"#263c3e");disc(px+3,h-15,0.8,"#aac7b5");
      }
      poly([[40,8],[46,1],[46,11],[40,16]],"#c0c3a7");
      poly([[62,1],[65,8],[65,26],[61,23]],"#53685e");
      rod(43,13,61,13,1,"#c0c3a7");
      box(49,17,10,7,"#526b61");box(51,19,6,3,"#283f3e");
      for(let i=0;i<3;i++)box(69,15+i*3,5,1,"#a7ad91");
      // Safety rail and deck supports leave the turret silhouettes clear.
      for(const px of [35,40,65,70,87])rod(px,h-25,px,h-30,0.6,"#a9b3a2");
      rod(35,h-30,87,h-30,0.7,"#a9b3a2");
      rivets(18,h-12,9);rack();beam();damage(44,14);
      for(let i=0;i<4;i++)rod(97+i*4,h-1,103+i*4,h-1+Math.sin(t/10+i),0.8,"#b7d2ca");
      break;
    }
    case "boss3": {
      // Huge Hermit: armoured shell, turret and articulated mechanical pincers.
      for(let i=0;i<4;i++) {
        const py=14+i*12, bend=Math.sin(t/14+i)*2;
        rod(47,py,65,py+bend,4,"#8d6849");
        rod(65,py+bend,73,py+8,3,"#c29a68");disc(65,py+bend,2.6,STEEL);
      }
      // Curved cast shell with overlapping radial plates instead of a square box.
      ctx.beginPath();ctx.moveTo(x+12,y+cy);
      ctx.bezierCurveTo(x+11,y+10,x+37,y+1,x+56,y+7);
      ctx.bezierCurveTo(x+76,y+14,x+72,y+48,x+56,y+57);
      ctx.quadraticCurveTo(x+30,y+69,x+13,y+45);ctx.closePath();
      ctx.fillStyle=tone("#927047");ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1;ctx.stroke();
      poly([[18,23],[24,12],[37,7],[38,18],[27,25]],"#d1af77");
      poly([[40,7],[54,9],[63,16],[51,22],[41,18]],"#ba925e");
      poly([[64,19],[68,32],[65,43],[54,38],[54,25]],"#a78350");
      poly([[63,46],[54,55],[41,60],[40,47],[53,41]],"#725839");
      poly([[20,45],[30,51],[37,48],[37,60],[25,56]],"#b28d5b");
      disc(39,33,16,"#4d5745");disc(39,33,12,"#a19e6d");
      disc(39,33,8,"#58664e");vents(33,30,5);
      for(let i=0;i<8;i++)disc(39+Math.cos(i*Math.PI/4)*14,33+Math.sin(i*Math.PI/4)*14,0.9,CREAM);
      poly([[29,13],[30,7],[46,5],[52,10],[49,16]],"#8a8d63");
      box(35,5,9,3,"#c2bb86");
      for(const side of [-1,1]) {
        const py=cy+side*22, elbow=cy+side*(18+(warning?4:Math.sin(t/15)*2));
        rod(24,cy+side*10,5,elbow,5,"#b18b5a");
        rod(24,cy+side*10+side*3,7,elbow+side*3,1.3,"#e0c894");
        rod(5,elbow,-9,py,4,STEEL);disc(5,elbow,4,"#635641");
        disc(5,elbow,2.6,"#d0b67b");disc(5,elbow,1,INK);
        const spread=warning?7:4;
        poly([[-4,py-3],[-15,py-spread],[-20,py-spread+2],[-9,py-1]],"#bba16e");
        poly([[-4,py+3],[-15,py+spread],[-20,py+spread-2],[-9,py+1]],"#bba16e");
        rod(-5,py-3,-14,py-spread,0.9,"#e0c894");
        rod(-5,py+3,-14,py+spread,0.9,"#e0c894");
        beam(side);
      }
      rod(18,cy,-10,cy,4,STEEL);gun(0,12,2.5);damage(43,36);
      break;
    }
    case "boss4": {
      // Rugname-inspired alien carrier, retaining its hanging jellyfish silhouette.
      for(let i=0;i<5;i++) {
        const px=18+i*10, sway=Math.sin(t/17+i)*3;
        rod(px,45,px+sway,58,2,"#777e93");rod(px+sway,58,px-5+sway,70,2,"#a4a8a1");
        disc(px+sway,58,2.4,"#4f5a69");disc(px+sway,58,1.1,"#bdc2aa");
        poly([[px-2,46],[px+2,46],[px+sway+2,54],[px+sway-2,54]],"#858f91");
        disc(px-5+sway,70,2,"#cf976d");
      }
      disc(35,30,33,"#626b7b",17);
      disc(35,25,22,"#929990",16);
      poly([[18,20],[24,11],[45,11],[53,20]],"#a7b4a4");
      box(25,15,20,5,"#394e57");box(28,16,12,1,"#afd5cd");
      disc(35,35,35,"#8c8c78",9);
      // Ribbed upper dome, armoured rim and inset segmented docking ring.
      for(const side of [-1,1])for(let i=0;i<3;i++) {
        ctx.beginPath();ctx.moveTo(x+35+side*(4+i*5),y+10+i);
        ctx.quadraticCurveTo(x+35+side*(12+i*5),y+17,x+35+side*(15+i*6),y+29);
        ctx.strokeStyle=tone(i===0?"#c8ccaf":"#586975");ctx.lineWidth=1.2;ctx.stroke();
      }
      disc(35,35,31,"#43535d",5);
      disc(35,32,32,"#b0b39a",4);
      for(let i=0;i<6;i++)poly([[8+i*9,33],[14+i*9,33],[13+i*9,39],[9+i*9,39]],"#747e77");
      for(let i=0;i<7;i++)disc(7+i*9,35,1.6,(warning||firing)&&i%2===0?hot:"#b8bb93");
      box(24,40,22,9,INK);
      if(a?.kind==="support"&&(warning||firing))box(28,41,14,8,"#dba464");
      else box(25,41,20,6,"#6d7775");
      for(const slot of [-1,0,1]) {
        const m=beamMuzzle(e,slot);
        const my=m.y-y;
        rod(19,cy,m.x-x+7,my,4,"#818f94");
        rod(20,cy-2,m.x-x+8,my-2,1,"#c0c6ac");
        disc(18,cy,4,"#617277");disc(18,cy,2,"#c2c3a1");
        box(m.x-x+4,my-4.2,7,8.4,"#84938b");beam(slot);
      }
      gun(0,8,2);damage(43,22);
      break;
    }
    case "boss5": {
      // Iron Death Worm: each moving coil retains its exact collision radius.
      const segments=coils(e);
      for(let i=segments.length-1;i>=0;i--) {
        const pt=segments[i],px=pt.x-x,py=pt.y-y,r=Math.max(4,9-i*0.45);
        disc(px,py,r,i%2?"#687f83":"#96b1b0");
        poly([[px-r*0.65,py-r*0.55],[px,py-r*0.9],[px+r*0.65,py-r*0.55],[px+r*0.65,py+r*0.55],[px,py+r*0.85],[px-r*0.65,py+r*0.55]],"#7c9899");
        poly([[px-r*0.65,py-r*0.55],[px,py-r*0.9],[px+r*0.65,py-r*0.55],[px+r*0.4,py-r*0.3],[px-r*0.4,py-r*0.3]],"#bdd0c5");
        disc(px,py,r*0.45,"#354f55");disc(px,py,r*0.25,"#90aaa5");
        rod(px-r*0.7,py-r*0.15,px-r*0.7,py+r*0.3,1,"#c2c9ac");
        disc(px+2,py-3,0.7,CREAM);
      }
      poly([[-14,cy+3],[-4,4],[12,0],[33,3],[34,25],[12,28],[-5,23]],"#92afb0");
      poly([[-12,cy+3],[-3,7],[10,6],[5,cy+3]],"#c4d4c9");
      poly([[8,5],[25,5],[31,10],[29,21],[13,23],[8,17]],"#4f686c");
      poly([[10,5],[24,5],[28,9],[12,10]],"#a6c3ba");
      vents(14,12,4);
      poly([[-5,6],[0,1],[10,0],[7,6],[0,9]],"#d3d8b9");
      rod(10,22,28,20,1.2,"#a6c3ba");
      disc(28,13,3.3,"#324c50");disc(28,13,1.6,"#c4cdb7");
      rod(-4,20,5,24,2,"#657c77");disc(5,24,2,"#c2c9ac");
      for(let i=0;i<3;i++) poly([[-8+i*5,cy+4],[-6+i*5,cy+9],[-4+i*5,cy+4]],CREAM);
      disc(3,9,2,hot);gun(0,7,2);damage(17,14);
      break;
    }
    case "boss6": {
      // Flying Tara / heavy bomber language: articulated solar attack wings.
      const fold=warning?0.1:Math.sin(t/18)*0.08;
      for(const side of [-1,1]) {
        ctx.save();ctx.translate(x+35,y+cy);ctx.rotate(side*fold);ctx.translate(-x-35,-y-cy);
        poly([[24,cy],[38,cy+side*9],[60,cy+side*25],[69,cy+side*22],[56,cy+side*3]],"#a36045");
        poly([[38,cy+side*9],[60,cy+side*25],[64,cy+side*23],[45,cy+side*8]],"#d8ab72");
        for(let i=0;i<3;i++)rod(39+i*6,cy+side*(8+i*4),48+i*5,cy+side*(7+i*5),0.9,"#704a36");
        disc(36,cy+side*7,4,"#594e3b");disc(36,cy+side*7,2.2,"#d7bc8c");
        rod(38,cy+side*9,48,cy+side*15,1.3,"#b9c4ab");
        poly([[43,cy+side*13-3],[48,cy+side*13-5],[62,cy+side*13-5],[66,cy+side*13-2],[66,cy+side*13+3],[49,cy+side*13+5],[43,cy+side*13+2]],"#80634b");
        box(48,cy+side*13-4,13,1.4,"#c4ac7a");vents(49,cy+side*13-1,4);
        box(62,cy+side*13-3.5,4,7,"#37453c");
        poly([[65,cy+side*13-2],[73+t%3,cy+side*13],[65,cy+side*13+2]],"#f1b55f");
        ctx.restore();
      }
      poly([[1,cy-1],[17,cy-11],[43,cy-8],[52,cy],[43,cy+9],[17,cy+11]],"#b9744c");
      poly([[8,cy-3],[22,cy-8],[31,cy-6],[29,cy-1]],"#a8c2b9");
      rod(16,cy-5,19,cy-1,1,"#485c54");rod(24,cy-7,25,cy-1,1,"#485c54");
      poly([[6,cy+1],[20,cy+2],[31,cy+8],[17,cy+11]],"#cf9b68");
      poly([[33,cy-6],[44,cy-5],[51,cy],[43,cy+6],[33,cy+5]],"#79583e");
      disc(39,cy,4,"#394d44");disc(39,cy,2.4,"#bfa572");
      rod(18,cy+7,29,cy+8,0.8,"#eee0ab");
      box(23,cy+3,20,4,"#734c3b");rivets(22,cy+8,4,5);
      gun(0,9,2.5);
      box(35,4,7,9,"#826047");disc(38,7,2,a?.kind==="flare"?hot:"#dba969");
      damage(32,cy-5);
      break;
    }
  }
  ctx.restore();
}
