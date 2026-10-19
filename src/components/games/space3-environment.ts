/* Phobos Run: an orbital battlefield, with no ground or water plane. Large
   silhouettes establish scale; all surface detail stays behind live actors. */
import { H, W, type State } from "./space-logic";
import { drawKiteCameo } from "./space3-kite-cameo";
import { drawOuterBackdrop } from "./space3-act2-art";

type Ctx = CanvasRenderingContext2D;
const noise = (n: number) => { const v=Math.sin(n*12.9898+78.233)*43758.5453;return v-Math.floor(v); };
const wrap = (n: number, span: number) => ((n%span)+span)%span;

export function drawThirdOrbit(ctx: Ctx, s: State, reduceMotion = false) {
  if (s.chapter === 18) return drawCeres(ctx, s, reduceMotion);
  if (s.chapter === 19) return drawEuropa(ctx, s, reduceMotion);
  if (s.chapter === 20) return drawKharn(ctx, s, reduceMotion);
  if (s.chapter >= 21) return drawOuterBackdrop(ctx, s, reduceMotion);
  const scroll=reduceMotion?0:s.scroll;
  ctx.save();
  const sky=ctx.createLinearGradient(0,0,W,H);
  sky.addColorStop(0,"#090f1e");sky.addColorStop(0.65,"#17182a");sky.addColorStop(1,"#2b2028");
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  for(let i=0;i<64;i++){
    const x=wrap(noise(i*7+1)*W-scroll*0.025,W),y=noise(i*11+2)*H;
    ctx.fillStyle=i%5===0?"rgb(211 204 227 / 0.45)":"rgb(164 177 209 / 0.22)";
    ctx.fillRect(x,y,i%5===0?1:0.55,0.65);
  }
  // Mars extends past the viewport: its curvature is the landmark, not a floor.
  const px=330,py=263,pr=169;
  ctx.save();ctx.beginPath();ctx.arc(px,py,pr,0,Math.PI*2);ctx.clip();
  const planet=ctx.createLinearGradient(170,90,340,240);
  planet.addColorStop(0,"#704334");planet.addColorStop(0.35,"#4a3030");planet.addColorStop(1,"#211e2b");
  ctx.fillStyle=planet;ctx.fillRect(150,90,W,H);
  // Rocky highlands and a dark rift, rather than gas-planet cloud bands.
  for(let i=0;i<11;i++){
    const x=190+noise(i+51)*220,y=112+noise(i+73)*115,size=11+noise(i+91)*28;
    ctx.beginPath();
    for(let j=0;j<8;j++){
      const a=j*Math.PI/4,r=size*(0.55+noise(i*11+j)*0.45);
      const xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r*0.6;
      if(j)ctx.lineTo(xx,yy);else ctx.moveTo(xx,yy);
    }
    ctx.closePath();ctx.fillStyle=i%2?"rgb(25 20 30 / 0.14)":"rgb(164 109 79 / 0.12)";ctx.fill();
  }
  const rift=[[204,207],[237,196],[255,197],[274,183],[296,186],[319,171],[347,174],[370,160]];
  ctx.beginPath();rift.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
  ctx.strokeStyle="rgb(27 20 30 / 0.45)";ctx.lineJoin="bevel";ctx.lineWidth=5;ctx.stroke();
  ctx.lineWidth=0.7;ctx.strokeStyle="rgb(168 114 81 / 0.3)";ctx.stroke();
  for(let i=0;i<7;i++){
    const x=250+noise(i+13)*140,y=140+noise(i+41)*90,r=3+noise(i+61)*6;
    ctx.beginPath();ctx.ellipse(x,y,r,r*0.45,-0.3,0,Math.PI*2);
    ctx.fillStyle="rgb(26 21 30 / 0.2)";ctx.fill();ctx.strokeStyle="rgb(161 112 84 / 0.18)";ctx.lineWidth=0.7;ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle="rgb(189 125 94 / 0.25)";ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(px,py,pr,Math.PI*1.03,Math.PI*1.8);ctx.stroke();
  ctx.strokeStyle="#a2735b";ctx.lineWidth=0.65;ctx.stroke();
  // Phobos: an irregular moon, with craters visible only on the lit edge.
  ctx.save();ctx.translate(76-scroll*0.003,45);
  ctx.beginPath();
  for(let i=0;i<13;i++){const a=i/13*Math.PI*2,r=25+noise(i+28)*7;const x=Math.cos(a)*r*1.45,y=Math.sin(a)*r*0.65;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}
  ctx.closePath();ctx.fillStyle="#1d202b";ctx.fill();ctx.strokeStyle="#575058";ctx.lineWidth=0.7;ctx.stroke();
  ctx.clip();
  for(let i=0;i<8;i++){ctx.beginPath();ctx.ellipse(-27+i*8,-9+noise(i+7)*13,3+noise(i)*3,2.5,0,0,Math.PI*2);ctx.strokeStyle="rgb(136 120 118 / 0.25)";ctx.stroke();}
  ctx.restore();
  // A thin chain of distant navigation buoys gives the orbit a human scale.
  for(let i=0;i<7;i++){
    const x=wrap(i*67-scroll*0.12,W+70)-35,y=66+i*6;
    ctx.fillStyle="#555062";ctx.fillRect(x,y,2.5,1);ctx.fillRect(x+1,y-2,0.5,5);
    ctx.fillStyle="rgb(251 207 51 / 0.45)";ctx.fillRect(x+1,y,0.65,0.65);
  }
  // Broken sensor trusses pass near the edges, leaving the flight lane clear.
  for(let i=0;i<4;i++){
    const x=wrap(i*151-scroll*0.42,604)-90;
    const top=i%2===0,y=top?4:H-8;
    ctx.strokeStyle="#353449";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+64,y);ctx.stroke();
    ctx.strokeStyle="#575064";ctx.lineWidth=0.65;
    for(let j=0;j<4;j++){ctx.beginPath();ctx.moveTo(x+j*16,y);ctx.lineTo(x+j*16+8,y+(top?10:-10));ctx.lineTo(x+j*16+16,y);ctx.stroke();}
    ctx.fillStyle="#343648";ctx.fillRect(x+28,y+(top?10:-17),19,7);
    ctx.fillStyle="#696078";ctx.fillRect(x+29,y+(top?11:-16),17,0.7);
  }
  ctx.restore();
}

/* Kroll's graveyard: all wrecks and ring material drift in orbit, never fall. */
function drawKharn(ctx: Ctx, s: State, reduceMotion: boolean) {
  const scroll = reduceMotion ? 0 : s.scroll;
  ctx.save();
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#070b16"); sky.addColorStop(1, "#1a1626");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = i % 6 ? "rgb(173 181 199 / 0.25)" : "rgb(222 218 202 / 0.4)";
    ctx.fillRect(wrap(noise(i + 541) * W - scroll * 0.012, W), noise(i + 621) * H, 0.65, 0.65);
  }
  // Muted planet beneath the thin ring band: its brightest surface stays dimmer
  // than the Reclaimer's plates and the pale cores of hostile ordnance.
  ctx.save(); ctx.globalAlpha *= 0.28;
  ctx.beginPath(); ctx.arc(300, 250, 150, 0, Math.PI * 2); ctx.clip();
  const saturn = ctx.createLinearGradient(190, 100, 350, 260);
  saturn.addColorStop(0, "#b79f72"); saturn.addColorStop(1, "#6b5a3e");
  ctx.fillStyle = saturn; ctx.fillRect(140, 95, 244, 121);
  ctx.save(); ctx.translate(300, 250); ctx.rotate(-0.28);
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 3 ? "rgb(78 64 54 / 0.2)" : "rgb(222 203 158 / 0.15)";
    ctx.fillRect(-160, -150 + i * 19, 320, 6 + i % 4);
  }
  ctx.restore(); ctx.restore();
  ctx.strokeStyle = "rgb(183 159 114 / 0.22)"; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.arc(300, 250, 150, Math.PI * 1.05, Math.PI * 1.8); ctx.stroke();
  for (const [radius, alpha, width] of [[236, 0.35, 1.2], [245, 0.22, 2], [254, 0.14, 3]] as const) {
    ctx.strokeStyle = `rgb(217 201 160 / ${alpha})`; ctx.lineWidth = width;
    ctx.beginPath(); ctx.ellipse(300, 250, radius, 34, 0.28, 0, Math.PI * 2); ctx.stroke();
  }
  for (let depth = 0; depth < 3; depth++) for (let i = 0; i < 20; i++) {
    const x = wrap(noise(i * 9 + depth * 73 + 812) * 440 - scroll * [0.03, 0.07, 0.12][depth], 440) - 28;
    const y = noise(i * 11 + depth * 31 + 932) * H, r = 0.45 + depth * 0.3;
    ctx.fillStyle = `rgb(185 188 196 / ${0.12 + depth * 0.09})`;
    ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x, y - r * 0.6);
    ctx.lineTo(x + r * 1.4, y); ctx.lineTo(x, y + r * 0.6); ctx.fill();
  }
  // Eight recognisable fragments at three depths, with open hangars and snapped
  // gun decks. Their dim rims distinguish scenery from coral-edged live scrap.
  for (let i = 0; i < 8; i++) {
    const depth = i % 3, scale = 0.55 + depth * 0.22;
    const x = wrap(i * 61 + noise(i + 25) * 25 - scroll * [0.05, 0.09, 0.15][depth], 480) - 48;
    const y = 23 + noise(i + 47) * 167;
    ctx.save(); ctx.translate(x, y); ctx.rotate((noise(i + 91) - 0.5) * 0.65); ctx.scale(scale, scale);
    ctx.fillStyle = "#2b2830"; ctx.strokeStyle = "#3d3946"; ctx.lineWidth = 0.8;
    ctx.beginPath();
    if (i % 4 === 0) {
      ctx.moveTo(-31, -7); ctx.lineTo(19, -9); ctx.lineTo(32, -3); ctx.lineTo(23, 0);
      ctx.lineTo(31, 5); ctx.lineTo(10, 9); ctx.lineTo(-28, 6); ctx.closePath();
    } else if (i % 4 === 1) {
      ctx.moveTo(-30, 0); ctx.lineTo(9, -15); ctx.lineTo(14, -6); ctx.lineTo(23, -8);
      ctx.lineTo(17, 0); ctx.lineTo(25, 5); ctx.lineTo(4, 12); ctx.closePath();
    } else if (i % 4 === 2) {
      ctx.rect(-31, -5, 61, 10); ctx.rect(-20, -11, 13, 6); ctx.rect(5, -10, 13, 5);
    } else {
      ctx.rect(-25, -18, 49, 36); ctx.rect(-17, -11, 31, 22);
    }
    ctx.fill(i % 4 === 3 ? "evenodd" : "nonzero"); ctx.stroke();
    if (i % 4 === 2) {
      for (const x of [-16, 9]) {
        ctx.beginPath(); ctx.moveTo(x, -9); ctx.lineTo(x - 13, -14); ctx.lineTo(x - 13, -11); ctx.stroke();
      }
    }
    ctx.strokeStyle = "#3d3946"; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(-19, 3); ctx.lineTo(12, 2); ctx.stroke();
    ctx.fillStyle = "rgb(127 29 29 / 0.5)"; ctx.fillRect(-13, -5, 8, 2); ctx.fillRect(-11, -7, 2, 6);
    ctx.restore();
  }
  ctx.restore();
}

function deepSky(ctx: Ctx, scroll: number, colour: string) {
  ctx.fillStyle = colour; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 75; i++) {
    ctx.fillStyle = i % 7 ? "#384052" : "#6c7080";
    ctx.fillRect(wrap(noise(i + 3) * W - scroll * 0.018, W), noise(i + 109) * H, 0.6, 0.6);
  }
}

function drawCeres(ctx: Ctx, s: State, reduced: boolean) {
  const scroll = reduced ? 0 : s.scroll, t = reduced ? 0 : s.frame;
  ctx.save(); deepSky(ctx, scroll, "#10131d");
  const sun = ctx.createRadialGradient(56, 29, 0, 56, 29, 42);
  sun.addColorStop(0, "#8b7356"); sun.addColorStop(0.08, "#39302c"); sun.addColorStop(1, "#10131d00");
  ctx.fillStyle = sun; ctx.fillRect(0, 0, 105, 80);
  // Broken station ring and diagonal magnetic bridges float in the far belt.
  ctx.strokeStyle = "#30313a"; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.ellipse(333, 57, 115, 86, -0.5, 0.55, 4.8); ctx.stroke();
  ctx.lineWidth = 0.6; ctx.strokeStyle = "#4a4545";
  for (let i = 0; i < 5; i++) {
    const x = 235 + i * 32 - scroll * 0.005;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x - 55, 90); ctx.lineTo(x + 73, 154); ctx.stroke();
  }
  for (let layer = 0; layer < 3; layer++) for (let i = 0; i < 12; i++) {
    const x = wrap(noise(i * 13 + layer * 83) * 480 - scroll * (0.035 + layer * 0.07), 480) - 48;
    const y = noise(i * 7 + layer * 41) * H, r = 2 + layer * 3 + noise(i + 44) * 5;
    ctx.beginPath();
    for (let j = 0; j < 7; j++) {
      const a = j / 7 * Math.PI * 2, rr = r * (0.7 + noise(i * 7 + j) * 0.3);
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * 0.7;
      if (j) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.closePath(); ctx.fillStyle = ["#20232c", "#2d292e", "#383037"][layer]; ctx.fill();
    ctx.strokeStyle = "#494047"; ctx.lineWidth = 0.5; ctx.stroke();
  }
  // Detached crane frames. Their diagonal trusses never form a flight surface.
  for (let i = 0; i < 3; i++) {
    const x = wrap(i * 193 - scroll * 0.13, 580) - 60, y = 21 + i * 71;
    ctx.strokeStyle = "#44404a"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y + 23); ctx.lineTo(x + 15, y - 10); ctx.lineTo(x + 66, y - 4); ctx.stroke();
    ctx.strokeStyle = "#302e38"; ctx.lineWidth = 0.7;
    for (let j = 0; j < 4; j++) {
      ctx.beginPath(); ctx.moveTo(x + 15 + j * 12, y - 10 + j * 1.5); ctx.lineTo(x + 21 + j * 12, y + 1 + j * 1.5); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(x + 63, y - 4); ctx.lineTo(x + 63, y + 12); ctx.stroke();
    ctx.fillStyle = "#36313b"; ctx.fillRect(x + 57, y + 12, 12, 5);
  }
  ctx.fillStyle = "#49414a";
  for (let i = 0; i < 24; i++) {
    const x = wrap(noise(i + 811) * W - scroll * 0.1, W), y = noise(i + 913) * H;
    ctx.fillRect(x, y, 0.8, 0.35);
  }
  const convoy = wrap(93 - scroll * 0.014 + t * 0.012, 470) - 36;
  ctx.globalAlpha *= 0.34;
  for (let i = 0; i < 3; i++) {
    const x = convoy + i * 44, y = 51 + i * 5;
    ctx.fillStyle = "#a5b0ac"; ctx.fillRect(x, y, 23, 5); ctx.fillRect(x + 21, y + 1, 5, 3);
    ctx.fillStyle = "#fb923c"; ctx.fillRect(x + 5, y, 2, 5); ctx.fillRect(x + 16, y, 2, 5);
    ctx.strokeStyle = "#171717"; ctx.lineWidth = 0.6; ctx.strokeRect(x, y, 23, 5);
  }
  drawKiteCameo(ctx, convoy + 18, 39, t, reduced);
  drawKiteCameo(ctx, convoy + 106, 77, t, reduced);
  ctx.restore();
}

function drawEuropa(ctx: Ctx, s: State, reduced: boolean) {
  const scroll = reduced ? 0 : s.scroll, t = reduced ? 0 : s.frame;
  ctx.save(); deepSky(ctx, scroll, "#0b1422");
  // Jupiter is a gas giant, seen obliquely in a corner, not a ground horizon.
  ctx.save(); ctx.translate(330, -18); ctx.rotate(-0.24);
  ctx.beginPath(); ctx.arc(0, 0, 112, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = "#45404a"; ctx.fillRect(-115, -115, 230, 230);
  for (let i = 0; i < 18; i++) {
    const y = -110 + i * 13;
    ctx.fillStyle = ["#51464c", "#635450", "#343547", "#6a5b55"][i % 4];
    ctx.beginPath(); ctx.moveTo(-115, y); ctx.bezierCurveTo(-45, y - 9, 54, y + 8, 115, y - 1);
    ctx.lineTo(115, y + 9); ctx.bezierCurveTo(40, y + 19, -44, y + 4, -115, y + 12); ctx.fill();
  }
  ctx.beginPath(); ctx.ellipse(-25, 61, 21, 8, 0, 0, Math.PI * 2); ctx.strokeStyle = "#806259"; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = "#3f5663"; ctx.lineWidth = 0.6;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.ellipse(251, 99, 112 + i * 7, 33 + i * 5, -0.55, 2.4, 4.7); ctx.stroke();
  }
  // A crescent beyond the left edge. Fractures run along its curvature.
  ctx.save(); ctx.beginPath(); ctx.arc(-91, 177, 157, 0, Math.PI * 2); ctx.clip();
  const ice = ctx.createLinearGradient(-20, 30, 79, 216);
  ice.addColorStop(0, "#4b606b"); ice.addColorStop(0.5, "#253a4b"); ice.addColorStop(1, "#142435");
  ctx.fillStyle = ice; ctx.fillRect(0, 0, 85, H);
  ctx.lineWidth = 1.1; ctx.strokeStyle = "#102131";
  for (let i = 0; i < 9; i++) {
    const y = i * 29 - 25, dx = (i % 3) * 7;
    ctx.beginPath(); ctx.moveTo(-4, y); ctx.lineTo(21 + dx, y + 19); ctx.lineTo(15 + dx, y + 34); ctx.lineTo(63, y + 57); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(21 + dx, y + 19); ctx.lineTo(48, y + 12); ctx.stroke();
  }
  ctx.restore();
  ctx.beginPath(); ctx.arc(-91, 177, 157, -1.05, 0.27); ctx.strokeStyle = "#516c7b"; ctx.lineWidth = 0.8; ctx.stroke();
  // Disconnected cliffs on the diagonal show depth, with open space between.
  for (let i = 0; i < 5; i++) {
    const x = wrap(i * 119 - scroll * (0.04 + i * 0.012), 595) - 80, y = 176 - i * 26;
    ctx.beginPath(); ctx.moveTo(x, y + 34); ctx.lineTo(x + 9, y + 8); ctx.lineTo(x + 19, y + 15);
    ctx.lineTo(x + 26, y - 12); ctx.lineTo(x + 39, y - 21); ctx.lineTo(x + 45, y + 13); ctx.closePath();
    ctx.fillStyle = i % 2 ? "#172b3c" : "#213545"; ctx.fill();
    ctx.strokeStyle = "#354b5c"; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 26, y - 12); ctx.lineTo(x + 29, y + 18); ctx.stroke();
    const plume = ctx.createRadialGradient(x + 28, y - 30, 0, x + 28, y - 30, 19);
    plume.addColorStop(0, "#6b8b9d19"); plume.addColorStop(1, "#6b8b9d00");
    ctx.fillStyle = plume; ctx.fillRect(x + 8, y - 50, 40, 40);
  }
  ctx.globalAlpha *= 0.3;
  drawKiteCameo(ctx, 79 + (reduced ? 0 : Math.sin(t / 900) * 10), 154 - (reduced ? 0 : Math.sin(scroll / 4000) * 9), t, reduced);
  ctx.restore();
}
