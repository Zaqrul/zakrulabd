import assert from 'node:assert/strict';
import test from 'node:test';
import { HQ, HQ_LAUNCHERS, PICKUP_PLANS, UPGRADE_LUCK, ARMOR, BLASTER, BOMBS, BOSS_SHIELD, BOSS_SHIELD_AT, CALM, CLEAR, FLAME, POWER, WARP, warpPower, FREEZE, GUNS, ICEBOMB, KATANA, LEVEL_AT, MAX_LEVEL, NUKE, TWIN_AT, UPGRADE_AT, hasUpgrade, podMuzzle, shipScale, BLINK, BURST_LIFE, HYPERSONIC, LIFE, SHIELD, TUBES, maxLife, maxShield, nextChapter, retryChapter, bossScale, C4, CHILL, DIVE, EMBER, FINAL_PHASE_AT, FLAK, GROUND_Y, H, LAUNCH_RAIL_Y, LOCK_FRAMES, MISSILE, PINCER, SIGNATURE, SPIRE, SPORE, STOMP, SURGE, TORPEDO, W, WAVE, WISP, hazardBoxes, pinch, shipSize, spireHeight, beamMuzzle, bossCheckpoint, chapterProgress, chapterResult, createState, enemyMuzzle, launchShipY, maxHpFor, missileMuzzle, step, torpedoSpeed } from '../src/components/games/space-logic.ts';
const idle={mx:0,my:0,bomb:false};
const life=(s)=>s.p.hp+s.p.shield;const HIT=LIFE.hit;
const sizes=[[64,60,160],[96,52,300],[74,66,650],[70,74,720],[34,28,560],[64,52,1100],[60,38,1250],[96,84,5000]];
// The final boss has six phases, by share of its health (FINAL_PHASE_AT).
const finalShare=[1,0.75,0.55,0.38,0.22,0.07];
test('bosses spawn at the larger physical size and their outer armour takes hits',()=>{
 for(let ch=1;ch<=8;ch++){
  const s=bossCheckpoint(createState(ch));s.p.inv=1e6;s.p.cd=1e6;s.p.launchCd=1e6;
  step(s,idle);const e=s.enemies.find(e=>e.type==='boss'+ch);assert(e);
  const k=bossScale(e);assert.equal(e.w,sizes[ch-1][0]*k);assert.equal(e.h,sizes[ch-1][1]*k);
  e.x=160;e.y=50;e.stun=1000;s.talk=null;
  const hp=e.hp,sh=e.shield??0;
  s.bullets=[{x:e.x+e.w-6,y:e.y+e.h/2,vx:0,vy:0,r:2,own:'p',dmg:2,kind:'pulse'}];
  step(s,idle);assert(e.hp<hp||(e.shield??0)<sh,'expanded armour must take damage, chapter '+ch);
 }
});
test('scaled boss weapons stay on their canonical drawing mounts',()=>{
 for(let ch=1;ch<=8;ch++){
  const {s,e}=encounter(ch);e.attack={kind:'fan',t:0,warn:40,live:1,recover:40,angle:Math.PI,targetY:80,targetX:40};
  const k=bossScale(e),model={...e,w:e.w/k,h:e.h/k,renderScale:1};
  for(const mount of [enemyMuzzle,beamMuzzle,missileMuzzle]){
   const p=mount===enemyMuzzle?mount(e,s):mount(e);
   const q=mount===enemyMuzzle?mount(model,s):mount(model);
   assert(Math.abs(p.x-(e.x+(q.x-e.x)*k))<1e-8);
   assert(Math.abs(p.y-(e.y+(q.y-e.y)*k))<1e-8);
  }
 }
});
function encounter(chapter,phase=0){
 const s=createState(chapter),[baseW,baseH,hp]=sizes[chapter-1];
 const scale=bossScale({type:'boss'+chapter}),w=baseW*scale,h=baseH*scale;
 s.phase='play';s.planIdx=9999;s.pickupIdx=999;s.p.inv=100000;s.p.cd=100000;s.p.launchCd=100000;s.p.x=45;s.p.y=100;
 const e={id:1,type:'boss'+chapter,x:chapter===2?258:272,y:chapter===1?188-h:chapter===2?178-h:108-h/2,w,h,vx:0,vy:0,hp:hp*(chapter===8?finalShare[phase]:[1,0.6,0.25][phase]),maxHp:hp,t:0,cd:90,y0:0,flash:0,stun:0,a:phase,b:1,c:0,d:0,n:0,rot:0,guard:0,parts:[]};
 s.enemies=[e];s.bossId=1;return {s,e};
}
for(let chapter=1;chapter<=8;chapter++){
 test(`boss ${chapter} gives a warning before its opening attack`,()=>{
  const {s,e}=encounter(chapter);step(s,idle);assert(e.attack);const warn=e.attack.warn;assert(warn>=32);
  for(let i=1;i<warn;i++){step(s,idle);assert.equal(s.bullets.filter(b=>b.own==='e').length,0);}
  assert.equal(s.bullets.filter(b=>b.own==='e').length,0);step(s,idle);assert(s.bullets.some(b=>b.own==='e'));
 });
}
test('aim locks for the last eighteen warning frames and does not chase a late dodge',()=>{
 const {s,e}=encounter(1);step(s,idle);while(e.attack.t<e.attack.warn-18)step(s,idle);
 const angle=e.attack.angle,target=e.attack.targetY;s.p.y=30;
 while(e.attack.t<=e.attack.warn)step(s,idle);
 assert.equal(e.attack.angle,angle);assert.equal(e.attack.targetY,target);
});
test('every boss phase has a firing-free recovery window and a bounded projectile count',()=>{
 for(let ch=1;ch<=8;ch++)for(let phase=0;phase<(ch===8?6:3);phase++){
  const {s,e}=encounter(ch,phase);let sawRecovery=false;
  for(let i=0;i<900;i++){
   const before=e.attack;const recovering=before&&before.t>=before.warn+before.live;
   if(recovering){s.bullets=[];s.enemies=[e];}
   step(s,idle);
   assert(s.bullets.filter(b=>b.own==='e').length<=160);
   if(recovering){assert.equal(s.bullets.filter(b=>b.own==='e').length,0,`boss ${ch} phase ${phase}`);sawRecovery=true;}
  }
  assert(sawRecovery,`No recovery for boss ${ch} phase ${phase}`);
 }
});
test('final-boss beams stay attached to visible owner mounts during warning and firing',()=>{
 const {s,e}=encounter(8,2);let sawWarning=false,sawLive=false,sawPair=false;
 for(let i=0;i<900;i++){
  step(s,idle);
  const beams=s.beams.filter(b=>b.ownerId===e.id);if(beams.length===2)sawPair=true;
  for(const b of beams){const m=beamMuzzle(e,b.slot);assert.equal(b.x0,m.x);assert.equal(b.y,m.y);if(b.t<b.warn)sawWarning=true;else sawLive=true;}
 }
 assert(sawWarning&&sawLive&&sawPair);
});
test('destroying a beam owner removes its beam rather than leaving an invisible source',()=>{
 const {s,e}=encounter(8);s.beams=[{...beamMuzzle(e),x0:beamMuzzle(e).x,y:beamMuzzle(e).y,h:18,t:20,warn:62,live:34,ownerId:1,slot:0}];
 e.hp=0;step(s,idle);assert.equal(s.beams.length,0);
});
test('a new final-boss phase cancels old hazards and gives the player a quiet transition',()=>{
 const {s,e}=encounter(8);e.hp=5000*0.75;e.attack={kind:'beam',t:80,warn:62,live:34,recover:38,angle:Math.PI,targetX:50,targetY:100};
 s.bullets=[{x:180,y:100,vx:-1,vy:0,r:2,own:'e',dmg:1,kind:'orb'}];s.beams=[{x0:280,y:100,h:18,t:70,warn:62,live:34,ownerId:1}];
 step(s,idle);assert.equal(e.a,1);assert(e.stun>0);assert.equal(e.attack,undefined);assert.equal(s.bullets.filter(b=>b.own==='e').length,0);assert.equal(s.beams.length,0);
});
test('the overload curtain leaves a deliberate angular opening',()=>{
 const {s,e}=encounter(8,3);
 for(let i=0;i<3000&&e.attack?.kind!=='curtain';i++)step(s,idle);
 assert.equal(e.attack?.kind,'curtain');
 while(e.attack.t<e.attack.warn)step(s,idle);
 s.bullets=[];step(s,idle);
 const bullets=s.bullets.filter(b=>b.own==='e');assert(bullets.length>=13,`only ${bullets.length} curtain shots`);
 const angles=bullets.map(b=>Math.atan2(b.vy,b.vx)).map(a=>a<0?a+Math.PI*2:a).sort((a,b)=>a-b);
 const gaps=angles.slice(1).map((a,i)=>a-angles[i]);assert(Math.max(...gaps)>0.4);
});
test('a charge locks its height before moving and its blade matches the scaled drawing',()=>{
 const {s,e}=encounter(7);let charged=false;
 for(let i=0;i<700;i++){
  step(s,idle);
  if(e.attack?.kind==='charge'&&e.attack.t===e.attack.warn-1){const y=e.y;s.p.y=30;step(s,idle);assert.equal(e.y,y);}
  if(e.c===2){charged=true;assert.equal(e.parts.length,1);assert.equal(e.parts[0].h,10*bossScale(e));assert.equal(e.parts[0].w,48*bossScale(e));}
 }
 assert(charged);
});
test('death explosions expire at the same time as their visual fade',()=>{
 const s=createState();s.phase='dead';s.bursts=[{x:100,y:100,t:BURST_LIFE-1,big:true}];step(s,idle);assert.equal(s.bursts.length,0);
});
test('the whole gunpod clears the launch rail at every ship level',()=>{
 for(const level of [1,2,3]){const y=launchShipY(level),k=1+0.2*(level-1);assert(y+17*k<LAUNCH_RAIL_Y);assert(y-13*k>30);assert(y<H);}
});
test('a ground cannon fires from the barrel tip rather than its rotation pivot',()=>{
 const {s}=encounter(1);const e={...s.enemies[0],type:'tank',x:200,y:172,w:26,h:16,a:0,attack:undefined};const m=enemyMuzzle(e,s);
 assert(Math.abs(Math.hypot(m.x-214,m.y-176)-14)<1e-8);
 s.enemies=[e];e.cd=0;e.b=0;e.vx=0;step(s,idle);const b=s.bullets.find(b=>b.own==='e');assert(b);assert(Math.abs(b.x-b.vx-m.x)<1e-8);assert(Math.abs(b.y-b.vy-m.y)<1e-8);
});

test('a moving boss holds its mount still once an aimed fan locks',()=>{
 const {s,e}=encounter(3);step(s,idle);while(e.attack.t<e.attack.warn-17)step(s,idle);
 const position={x:e.x,y:e.y};s.p.y=30;
 while(e.attack.t<=e.attack.warn){step(s,idle);assert.equal(e.x,position.x);assert.equal(e.y,position.y);}
});
test('crab beams originate at both claw ports, including the first beam phase',()=>{
 const {s,e}=encounter(3,1);let found=false;
 for(let i=0;i<700;i++){
  step(s,idle);
  if(e.attack?.kind==='beam'&&s.beams.length===2){
   found=true;assert.deepEqual(s.beams.map(b=>b.slot).sort(),[-1,1]);
   for(const beam of s.beams){const port=beamMuzzle(e,beam.slot);assert.equal(beam.x0,port.x);assert.equal(beam.y,port.y);}
   break;
  }
 }
 assert(found);
});
test('surface-to-air missiles appear at the angled launch tube tip',()=>{
 const {s}=encounter(1);const e={...s.enemies[0],type:'samsite',x:200,y:170,w:20,h:18,a:0,b:0,vx:0,cd:0,attack:undefined};s.enemies=[e];
 const tip=missileMuzzle(e);step(s,idle);const missile=s.enemies.find(e=>e.type==='seeker');assert(missile);
 assert(Math.abs(missile.x+missile.w/2-tip.x)<1e-8);assert(Math.abs(missile.y+missile.h/2-tip.y)<1e-8);
});
test('a cleared chapter scores its kills, a clean run and a quick boss, once',()=>{
 const {s,e}=encounter(3);s.stats={spawned:20,kills:15,hits:0,bossFrames:600};
 const r=chapterResult(s);
 assert.equal(r.killRate,0.75);assert.equal(r.killBonus,940);assert.equal(r.noHitBonus,1250);assert.equal(r.bossSeconds,10);assert.equal(r.speedBonus,1040);assert.equal(r.bonus,3230);
 const before=s.score;e.hp=0;
 for(let i=0;i<600&&s.phase!=='clear';i++)step(s,idle);
 assert.equal(s.phase,'clear');assert(s.result);assert.equal(s.result.noHitBonus,1250);assert(s.score>=before+s.result.bonus);
 const after=s.score;for(let i=0;i<120;i++)step(s,idle);assert.equal(s.score,after);
});
test('a hit, a slow boss or no kills earn nothing for that part',()=>{
 const s=createState(5);s.stats={spawned:10,kills:0,hits:1,bossFrames:60*120};
 const r=chapterResult(s);assert.equal(r.killBonus,0);assert.equal(r.noHitBonus,0);assert.equal(r.speedBonus,0);assert.equal(r.bonus,0);
});
test('the boss checkpoint starts at the boss with the ship the chapter began with',()=>{
 const s=createState(4,5000,2,2,3);s.phase='play';s.score=9000;s.p.hp=1;s.p.weapon=3;s.stats.kills=12;
 const c=bossCheckpoint(s);
 assert.equal(c.phase,'play');assert.equal(c.chapter,4);assert.equal(c.score,5000);assert.equal(c.p.weapon,2);assert.equal(c.p.level,2);assert.equal(c.p.extra,3);
 assert.equal(c.p.hp,maxHpFor(2));assert.equal(c.enemies.length,0);assert(c.checkpoint);assert.equal(chapterProgress(c),1);
 for(let i=0;i<5&&c.bossId===0;i++)step(c,idle);
 assert.notEqual(c.bossId,0);assert(c.enemies.some(e=>e.type==='boss4'));assert.equal(c.stats.spawned,0);
 const r=chapterResult(c);assert.equal(r.killRate,null);assert.equal(r.killBonus,0);
});
test('chapter progress runs from the start of the script to the boss',()=>{
 const s=createState(6);assert.equal(chapterProgress(s),0);s.t=100000;assert.equal(chapterProgress(s),1);
});
test('every enemy shot runs on the same motor as the ship torpedo, frame for frame',()=>{
 const track=(b,s)=>{const v=[];for(let i=0;i<40;i++){v.push(Math.hypot(b.vx,b.vy));step(s,idle);}return v;};
 const {s}=encounter(1);const e={...s.enemies[0],type:'tank',x:200,y:172,w:26,h:16,a:0,attack:undefined};s.enemies=[e];e.cd=0;e.b=0;e.vx=0;
 step(s,idle);const shot=s.bullets.find(b=>b.own==='e');assert(shot);s.enemies=[];
 const enemy=track(shot,s);
 const t=createState();t.phase='play';t.planIdx=9999;t.pickupIdx=999;t.p.x=40;t.p.y=100;t.p.inv=1e5;t.p.launchCd=1e5;t.p.gun='torpedo';t.p.ammo=5;t.p.cd=0;
 t.enemies=[{...e,id:50,type:'rock',x:300,y:70,w:40,h:80,hp:1e4,maxHp:1e4,vx:0,vy:0,cd:999}];
 step(t,idle);const mine=t.bullets.find(b=>b.own==='p'&&b.kind==='torpedo');assert(mine);t.p.gun='blaster';
 const ship=track(mine,t);
 for(let i=0;i<40;i++){assert(Math.abs(enemy[i]-ship[i])<1e-9,`frame ${i+1}: enemy ${enemy[i]} ship ${ship[i]}`);assert(Math.abs(enemy[i]-torpedoSpeed(i+1))<1e-9);}
 assert(enemy[0]<1&&enemy[TORPEDO.eject+TORPEDO.ignite-1]<1,'slow while it leaves the tube and lights');
 assert(Math.abs(Math.max(...enemy)-TORPEDO.top)<1e-9);assert(Math.abs(enemy[39]-TORPEDO.top)<1e-9);
});
test('enemy fire keeps the line it was launched on',()=>{
 const {s,e}=encounter(8,3);for(let i=0;i<3000&&e.attack?.kind!=='curtain';i++)step(s,idle);
 while(e.attack.t<e.attack.warn)step(s,idle);s.bullets=[];step(s,idle);
 const shots=s.bullets.filter(b=>b.own==='e');const before=shots.map(b=>Math.atan2(b.vy,b.vx));
 for(let i=0;i<30;i++)step(s,idle);
 shots.forEach((b,i)=>assert(Math.abs(Math.atan2(b.vy,b.vx)-before[i])<1e-9));
});
const turn=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));
test('a guided missile slows, turns after the ship, holds a long lock, then runs straight at the locked spot',()=>{
 const {s,e:boss}=encounter(1);boss.stun=1e9;
 const m={...boss,id:77,type:'seeker',x:300,y:40,w:14,h:7,vx:-1.6,vy:0,hp:2,maxHp:2,t:0,cd:999,stun:0,a:0,b:0,c:0,parts:[],attack:undefined,lock:undefined,rot:0};
 s.enemies.push(m);
 const center=()=>({x:m.x+m.w/2,y:m.y+m.h/2});
 for(let i=0;i<MISSILE.out;i++)step(s,idle);
 assert(Math.hypot(m.vx,m.vy)<0.5,'slows once clear of the launcher');
 let prev=m.rot;
 for(let i=0;i<MISSILE.track;i++){step(s,idle);assert(turn(m.rot,prev)<=MISSILE.turn+1e-9,'turns a little at a time');prev=m.rot;assert.equal(m.lock,undefined);}
 const c=center();assert(turn(m.rot,Math.atan2(s.p.y+5-c.y,s.p.x+9-c.x))<0.15,'nose on the ship once it has tracked');
 step(s,idle);assert(m.lock,'locks once tracking ends');const lock={...m.lock};
 s.p.y=180;
 for(let i=1;i<MISSILE.lock;i++){step(s,idle);assert.deepEqual(m.lock,lock,'the lock holds while the ship moves');assert.equal(Math.hypot(m.vx,m.vy),0);}
 const start=center();
 for(let i=0;i<30;i++)step(s,idle);
 assert.equal(MISSILE.pace,0.85);assert(Math.abs(Math.hypot(m.vx,m.vy)-TORPEDO.top*MISSILE.pace)<1e-9,'runs 15% slower than the ship torpedo');
 const now=center();const cross=(now.x-start.x)*(lock.y-start.y)-(now.y-start.y)*(lock.x-start.x);
 assert(Math.abs(cross)/Math.hypot(lock.x-start.x,lock.y-start.y)<0.5,'runs along the line to the locked spot');
});
test('a gun holds its lock on the ship for LOCK_FRAMES before it fires',()=>{
 const {s,e:boss}=encounter(1);boss.stun=1e9;
 const tank={...boss,id:78,type:'tank',x:200,y:172,w:26,h:16,a:0,b:0,vx:0,cd:LOCK_FRAMES+5,attack:undefined,lock:undefined,stun:0,n:0,parts:[]};
 s.enemies.push(tank);
 let held=0,first=null;
 for(let i=0;i<LOCK_FRAMES+10&&!s.bullets.some(b=>b.own==='e');i++){step(s,idle);if(tank.lock){held++;first??={...tank.lock};assert.deepEqual(tank.lock,first);s.p.y=100+held;}}
 assert(s.bullets.some(b=>b.own==='e'),'fired');assert(held>=LOCK_FRAMES,`held ${held}`);
});
test('the final boss has twice its health and a sixth phase',()=>{
 const s=createState(8);const {e}=encounter(8);assert.equal(e.maxHp,5000);assert.equal(FINAL_PHASE_AT.length,5);
 finalShare.forEach((share,phase)=>assert.equal(FINAL_PHASE_AT.filter(cut=>share<=cut).length,phase));
 assert(s);
});
function c4Volley(){
 const {s,e}=encounter(8,5);
 for(let i=0;i<3000&&!(e.attack?.kind==='c4'&&e.attack.t>e.attack.warn);i++)step(s,idle);
 assert.equal(e.attack?.kind,'c4');return {s,e};
}
test('the C4 barrage throws a volley that always leaves room to stand',()=>{
 const {s}=c4Volley();
 assert.equal(s.charges.length,C4.count);
 const spots=s.charges.map(c=>[c.tx,c.ty]);
 let safe=0;
 for(let x=20;x<=220;x+=4)for(let y=34;y<=196;y+=4){
  const clear=spots.every(([tx,ty])=>{const nx=Math.min(Math.max(tx,x),x+18),ny=Math.min(Math.max(ty,y),y+10);return Math.hypot(tx-nx,ty-ny)>=C4.radius;});
  if(clear)safe++;
 }
 assert(safe>20,`only ${safe} safe spots`);
});
test('a charge hurts the ship only inside its blast, and only when it goes off',()=>{
 for(const inside of [true,false]){
  const {s}=c4Volley();s.p.inv=0;const hp=life(s);
  const first=s.charges.reduce((a,c)=>c.t>a.t?c:a);
  const place=()=>{if(inside){s.p.x=first.tx-9;s.p.y=first.ty-5;}else{s.p.x=first.tx-9;s.p.y=first.ty+C4.radius+8;if(s.p.y>190)s.p.y=first.ty-C4.radius-20;}};
  s.charges=[first];s.bullets=[];s.enemies=s.enemies.filter(e=>e.type==='boss8');
  while(first.t<C4.fuse-1){place();s.p.inv=0;step(s,idle);s.bullets=[];s.beams=[];assert.equal(life(s),hp,'no damage before it goes off');}
  place();step(s,idle);
  assert.equal(life(s),inside?hp-HIT:hp);
 }
});
test('charges that are still waiting vanish when the boss falls',()=>{
 const {s,e}=c4Volley();assert(s.charges.length>0);
 e.hp=0;step(s,idle);assert.equal(s.charges.length,0);
});
test('the barrage phase begins with no charge left over',()=>{
 const {s:t,e}=encounter(8,4);
 t.charges=[{x:100,y:100,sx:100,sy:100,tx:100,ty:100,t:40}];
 e.hp=5000*0.1;step(t,idle);
 assert.equal(e.a,5);assert.equal(t.charges.length,0);assert.equal(t.callout?.kind,'c4');
});

/* ---- the chapter bosses' own moves and weapons ---- */
function until(ch,phase,kind,limit=6000){
 const {s,e}=encounter(ch,phase);
 for(let i=0;i<limit&&e.attack?.kind!==kind;i++)step(s,idle);
 assert.equal(e.attack?.kind,kind,`${kind} never came up`);return {s,e};
}
const toFiring=(s,e)=>{while(e.attack.t<e.attack.warn)step(s,idle);};
const run=(s,n)=>{for(let i=0;i<n;i++)step(s,idle);};
const ofKind=(s,k)=>s.charges.filter(c=>c.kind===k);

test('boss health is two to three times what it was, and the last boss has more than three times, and a shield on top',()=>{
 const before=[80,140,280,300,200,450,480,1500];
 sizes.forEach(([,,hp],i)=>{const grew=hp/before[i]-1;assert(grew>=1&&grew<=(i===7?2.4:2.05),`boss ${i+1} grew ${(grew*100).toFixed(0)}%`);});
});
test('every signature attack warns for 44 to 64 frames and gives time to recover',()=>{
 const plan={stomp:[1,1],flak:[1,1],surge:[2,1],salvo:[2,1],pincer:[3,1],boulders:[3,1],undertow:[4,1],spores:[4,1],breach:[5,1],frost:[5,1],dive:[6,1],wisps:[6,1],blink:[7,1],crescent:[7,1]};
 for(const [kind,[ch,phase]] of Object.entries(plan)){
  const {e}=until(ch,phase,kind);
  assert(e.attack.warn>=44&&e.attack.warn<=64,`${kind} warns ${e.attack.warn}`);
  assert(e.attack.recover>=38,`${kind} recovers ${e.attack.recover}`);
  assert(SIGNATURE.includes(kind));
 }
});

test('siege tank stomp: rears up, slams, and sends shockwaves along the ground, each taller than the last',()=>{
 const {s,e}=until(1,1,'stomp');
 let lift=0;while(e.attack.t<e.attack.warn){step(s,idle);lift=Math.max(lift,GROUND_Y-e.h-e.y);}
 assert(lift>=STOMP.lift-1,`lifted ${lift}`);
 run(s,STOMP.slam+1);assert.equal(e.y,GROUND_Y-e.h);
 const waves=()=>s.hazards.filter(h=>h.kind==='wave');
 assert.equal(waves().length,1);
 const w=waves()[0],x=w.x;step(s,idle);assert(Math.abs(w.x-(x-WAVE.speed))<1e-9);
 run(s,26);assert.equal(waves().length,2);
 const heights=waves().map(h=>GROUND_Y-hazardBoxes(h)[0].y);assert.deepEqual(heights,[WAVE.heights[0],WAVE.heights[1]]);
 const high=until(1,2,'stomp');toFiring(high.s,high.e);run(high.s,60);
 assert.equal(high.s.hazards.filter(h=>h.kind==='wave').length,3);
});
test('a shockwave hurts a ship on the ground and passes under one above it',()=>{
 for(const [y,hurt] of [[GROUND_Y-8,true],[GROUND_Y-WAVE.heights[1]-30,false]]){
  const s=createState(1);s.phase='play';s.planIdx=9999;s.pickupIdx=999;s.p.cd=1e9;s.p.launchCd=1e9;s.p.x=100;s.p.y=y;
  s.hazards=[{id:5,kind:'wave',x:110,w:WAVE.w,g:[],half:H-(GROUND_Y-WAVE.heights[1]),base:GROUND_Y-WAVE.heights[1],t:0}];
  const hp=life(s);run(s,12);assert.equal(life(s),hurt?hp-HIT:hp,`y ${y}`);
 }
});

test('siege tank flak: shells arc to marked spots and burst there into rings of fire',()=>{
 const {s,e}=until(1,1,'flak');toFiring(s,e);
 step(s,idle);assert.equal(e.attack.spots.length,3);
 const first=ofKind(s,'flak')[0];assert(first);
 const spot={x:first.tx,y:first.ty};
 run(s,FLAK.every*2);assert.equal(ofKind(s,'flak').length,3);
 while(first.t<FLAK.burst-1)step(s,idle);
 s.bullets=[];
 step(s,idle);
 const ring=s.bullets.filter(b=>b.own==='e'&&b.kind==='fire'&&Math.hypot(b.x-spot.x,b.y-spot.y)<8);
 assert.equal(ring.length,FLAK.count);
 const late=until(1,2,'flak');toFiring(late.s,late.e);step(late.s,idle);assert.equal(late.e.attack.spots.length,4);
});

test('flagship surge: winds back, rams forward along the water, and returns home',()=>{
 const {s,e}=until(2,1,'surge');const home=e.x;
 let least=e.x,most=e.x;
 const frames=e.attack.warn+e.attack.live+e.attack.recover-2;
 for(let i=0;i<frames;i++){step(s,idle);least=Math.min(least,e.x);most=Math.max(most,e.x);}
 assert(least<=SURGE.stop+0.01,`got to ${least}`);assert(most>home,'winds back first');
 assert(Math.abs(e.x-Math.min(W-126,W-e.w-14))<0.01,`ended at ${e.x}`);
 const t=until(2,1,'surge');toFiring(t.s,t.e);run(t.s,40);
 t.s.p.inv=0;t.s.p.x=t.e.x+10;t.s.p.y=t.e.y+10;const hp=life(t.s);step(t.s,idle);assert.equal(life(t.s),hp-HIT);
});
test('flagship salvo: four marked lanes forty apart, fired one after another',()=>{
 const {s,e}=until(2,1,'salvo');const lanes=e.attack.lanes;
 assert.equal(lanes.length,4);lanes.forEach((y,i)=>{if(i)assert.equal(y-lanes[i-1],40);});assert(lanes[0]>=34&&lanes[3]<=176);
 toFiring(s,e);const seen=[];
 for(let i=0;i<40;i++){step(s,idle);for(const b of s.bullets)if(b.kind==='shell'&&b.age===1)seen.push(Math.round(b.y));}
 assert.deepEqual(seen,lanes);
 const late=until(2,2,'salvo');toFiring(late.s,late.e);let shells=0;
 for(let i=0;i<80;i++){step(late.s,idle);shells+=late.s.bullets.filter(b=>b.kind==='shell'&&b.age===1).length;}
 assert.equal(shells,8);
});

test('hermit pincer: two arms clamp across the screen, leaving only the marked gap',()=>{
 const {s,e}=until(3,1,'pincer');const gy=e.attack.gapY;assert(gy>=70&&gy<=146);
 toFiring(s,e);run(s,PINCER.open+8);
 assert.equal(e.parts.length,2);
 const [top,bottom]=e.parts;assert.equal(top.y+top.h,gy-PINCER.gap/2);assert.equal(bottom.y,gy+PINCER.gap/2);
 assert(top.x<=2&&bottom.x<=2,'the arms reach the left edge');
 assert(pinch(0)===0&&pinch(PINCER.open)===1&&pinch(PINCER.open+PINCER.hold+PINCER.close)===0);
 for(const [y,hurt] of [[gy-6,false],[gy+PINCER.gap/2+20,true],[gy-PINCER.gap/2-26,true]]){
  const t=until(3,1,'pincer');t.e.attack.gapY=gy;toFiring(t.s,t.e);run(t.s,PINCER.open+8);
  t.s.p.inv=0;t.s.p.x=40;t.s.p.y=y;const hp=life(t.s);step(t.s,idle);
  assert.equal(life(t.s),hurt?hp-HIT:hp,`ship at ${y}, gap at ${gy}`);
 }
});
test('hermit boulders: three rocks you can shoot, which break into smaller ones',()=>{
 const {s,e}=until(3,1,'boulders');toFiring(s,e);run(s,40);
 const rocks=()=>s.enemies.filter(o=>o.type==='boulder');assert.equal(rocks().length,3);
 const r=rocks()[0],x=r.x;step(s,idle);assert(r.x<x);
 const small=s.enemies.filter(o=>o.type==='smallrock').length;r.hp=0;step(s,idle);
 assert(s.enemies.filter(o=>o.type==='smallrock').length>small);
 assert.equal(r.fromPlan,undefined);
});

test('hive carrier undertow: draws the ship in, then blooms a ring with a gap toward it',()=>{
 const {s,e}=until(4,1,'undertow');s.p.x=150;s.p.y=100;toFiring(s,e);
 const start=Math.hypot(e.x+e.w*0.25-(s.p.x+9),e.y+e.h/2-(s.p.y+5));
 run(s,40);
 const now=Math.hypot(e.x+e.w*0.25-(s.p.x+9),e.y+e.h/2-(s.p.y+5));
 assert(now<start-20,`pulled ${start-now}`);
 while(e.attack.t<e.attack.warn+e.attack.live-1)step(s,idle);
 s.bullets=[];step(s,idle);
 const ring=s.bullets.filter(b=>b.own==='e'&&b.kind==='spiral');
 assert.equal(ring.length,15);
 const angles=ring.map(b=>Math.atan2(b.uy,b.ux)).map(a=>a<0?a+Math.PI*2:a).sort((a,b)=>a-b);
 const gaps=angles.map((a,i)=>(i?a-angles[i-1]:a+Math.PI*2-angles[angles.length-1]));
 assert(Math.max(...gaps)>0.9,'the gap');
});
test('hive carrier spores: clouds settle on marked spots, stay for five seconds, and hurt what stays in them',()=>{
 const {s,e}=until(4,1,'spores');const spots=e.attack.spots;
 assert.equal(spots.length,4);
 for(let i=0;i<spots.length;i++)for(let j=i+1;j<spots.length;j++)assert(Math.hypot(spots[i].x-spots[j].x,spots[i].y-spots[j].y)>35);
 toFiring(s,e);run(s,SPORE.every*3+1);assert.equal(ofKind(s,'spore').length,4);
 const c=ofKind(s,'spore')[0];while(c.t<SPORE.flight+10)step(s,idle);
 s.p.inv=0;s.p.x=c.x-9;s.p.y=c.y-5;const hp=life(s);step(s,idle);assert.equal(life(s),hp-HIT);
 s.p.inv=0;s.p.x=c.x+SPORE.radius+30;step(s,idle);assert.equal(life(s),hp-HIT);
 while(c.t<SPORE.flight+SPORE.life-2)step(s,idle);assert(s.charges.includes(c));
 run(s,4);assert(!s.charges.includes(c));
 const full=until(4,1,'spores');for(let i=0;i<SPORE.cap;i++)full.s.charges.push({kind:'spore',x:100,y:100,sx:100,sy:100,tx:100,ty:100,t:60});
 toFiring(full.s,full.e);run(full.s,40);assert.equal(ofKind(full.s,'spore').length,SPORE.cap);
});

test('iron worm breach: dives under, spires erupt from the floor at marked spots, and it comes back',()=>{
 const {s,e}=until(5,1,'breach');
 let under=false;for(let i=0;i<e.attack.warn+e.attack.live;i++){step(s,idle);if(e.y>H)under=true;}
 assert(under,'the head leaves the screen');
 const spires=s.hazards.filter(h=>h.kind==='spire');assert.equal(spires.length,3);
 const xs=spires.map(h=>h.x+SPIRE.w/2).sort((a,b)=>a-b);assert.equal(xs[1]-xs[0],76);assert.equal(xs[2]-xs[1],76);
 assert.equal(spireHeight(0),0);assert.equal(spireHeight(SPIRE.warn+SPIRE.rise),SPIRE.height);assert.equal(spireHeight(SPIRE.warn+SPIRE.rise+SPIRE.hold+SPIRE.fall),0);
 run(s,e.attack.recover);assert(e.y<H-20,`head back at ${e.y}`);
 const t=until(5,1,'breach');
 while(t.e.attack.t<t.e.attack.warn+4)step(t.s,idle);
 for(let i=0;i<SPIRE.warn+SPIRE.rise+4;i++)step(t.s,idle);
 const spire=t.s.hazards.find(h=>h.kind==='spire');assert(spire);
 t.s.p.inv=0;t.s.p.x=spire.x+SPIRE.w/2-9;t.s.p.y=H-40;const hp=life(t.s);step(t.s,idle);assert.equal(life(t.s),hp-HIT);
 t.s.p.inv=0;t.s.p.y=40;step(t.s,idle);assert.equal(life(t.s),hp-HIT);
});
test('iron worm frost: waves of shards with a moving gap, and a hit chills the ship',()=>{
 const {s,e}=until(5,1,'frost');toFiring(s,e);
 s.bullets=[];step(s,idle);
 const wave=s.bullets.filter(b=>b.kind==='frost');assert.equal(wave.length,8);
 const hp=life(s);s.p.inv=0;s.bullets=[{x:s.p.x+9,y:s.p.y+5,vx:0,vy:0,ux:1,uy:0,age:99,r:2.5,own:'e',dmg:1,kind:'frost'}];step(s,idle);
 assert.equal(life(s),hp-HIT);assert(s.p.chill>0&&s.p.chill<=CHILL.frames);
 const x=s.p.x;step(s,{...idle,mx:2.7});assert(Math.abs(s.p.x-x-2.7*CHILL.slow)<1e-9);
 const plain=createState();plain.phase='play';plain.planIdx=9999;plain.pickupIdx=999;const px=plain.p.x;step(plain,{...idle,mx:2.7});assert(Math.abs(plain.p.x-px-2.7)<1e-9);
 s.p.chill=2;step(s,idle);step(s,idle);step(s,idle);assert.equal(s.p.chill,0);
});

test('bomber dive: climbs, plunges across the screen along the locked line, and leaves fire behind',()=>{
 const {s,e}=until(6,1,'dive');
 let top=1e9;for(let i=0;i<e.attack.warn-1;i++){step(s,idle);top=Math.min(top,e.y);}
 assert(top<=DIVE.top+3,`climbed to ${top}`);
 const angle=Math.atan2(e.attack.targetY-(e.y+e.h/2),e.attack.targetX-(e.x+e.w/2));
 run(s,2);assert(Math.abs(e.attack.angle-angle)<0.05);
 let gone=false,embers=0;
 for(let i=0;i<e.attack.live+e.attack.recover-3;i++){step(s,idle);if(e.x<0||e.x>W)gone=true;embers=Math.max(embers,ofKind(s,'ember').length);}
 assert(gone,'it left the screen');assert(embers>=5,`only ${embers} embers at once`);
 assert(e.x>W-120&&e.y>20&&e.y<H-e.h,`back at ${e.x},${e.y}`);
 const t=until(6,1,'dive');toFiring(t.s,t.e);
 let em;for(let i=0;i<120&&!em;i++){step(t.s,idle);em=ofKind(t.s,'ember').find(c=>c.x<190&&c.x>40&&c.y>30&&c.y<180);}
 assert(em,'an ember lands where the ship can reach');t.s.p.inv=0;t.s.p.x=em.x-9;t.s.p.y=em.y-5;const hp=life(t.s);step(t.s,idle);assert.equal(life(t.s),hp-HIT);
 assert.equal(EMBER.life,120);
});
test('bomber wisps: steer after the ship a little at a time, on the torpedo motor',()=>{
 const {s,e}=until(6,1,'wisps');s.p.x=60;s.p.y=100;toFiring(s,e);step(s,idle);
 const w=s.bullets.find(b=>b.kind==='wisp');assert(w);
 const dir=()=>{const sz=shipSize(s.p.level);return Math.atan2(s.p.y+sz.h/2-w.y,s.p.x+sz.w/2-w.x);};
 const miss=()=>{const cur=Math.atan2(w.uy,w.ux),d=dir();return Math.abs(Math.atan2(Math.sin(d-cur),Math.cos(d-cur)));};
 const first=miss();let last=Math.atan2(w.uy,w.ux);
 for(let i=0;i<40;i++){step(s,idle);const now=Math.atan2(w.uy,w.ux);assert(Math.abs(Math.atan2(Math.sin(now-last),Math.cos(now-last)))<=WISP.turn+1e-9);last=now;}
 assert(miss()<first,'it turned toward the ship');
 assert(Math.abs(Math.hypot(w.vx,w.vy)-torpedoSpeed(w.age))<1e-9);
 run(s,WISP.track+5);const frozen=Math.atan2(w.uy,w.ux);run(s,5);assert.equal(Math.atan2(w.uy,w.ux),frozen);
});

test('Crimson Fang blink: vanishes, comes back at the marked spot with its blade out, and goes home',()=>{
 const {s,e}=until(7,1,'blink');s.p.x=60;s.p.y=100;
 while(e.attack.t<e.attack.warn)step(s,idle);
 const spot=e.attack.spots[0];assert(spot);
 let hidden=false,arrived=false,blade=0;
 for(let i=0;i<e.attack.live;i++){
  step(s,idle);if(e.x>W+50)hidden=true;
  if(Math.abs(e.x-spot.x)<0.01&&Math.abs(e.y-spot.y)<0.01)arrived=true;
  if(e.parts.length)blade++;
 }
 assert(hidden&&arrived);assert(blade>=BLINK.strike-BLINK.blade-1&&blade<=BLINK.strike-BLINK.blade+1,`blade for ${blade}`);
 run(s,e.attack.recover);assert(Math.abs(e.x-Math.min(W-90,W-e.w-14))<0.5,`home ${e.x}`);
 const t=until(7,1,'blink');t.s.p.x=60;t.s.p.y=100;toFiring(t.s,t.e);
 const sp=t.e.attack.spots[0];run(t.s,BLINK.gone+BLINK.blade+2);
 t.s.p.inv=0;t.s.p.x=sp.x-60;t.s.p.y=sp.y+t.e.h/2-5;const hp=life(t.s);step(t.s,idle);assert.equal(life(t.s),hp-HIT);
});
test('Crimson Fang crescents: a volley that turns round at the same place and comes back',()=>{
 const {s,e}=until(7,1,'crescent');toFiring(s,e);step(s,idle);
 const blades=s.bullets.filter(b=>b.kind==='crescent');assert.equal(blades.length,3);
 let turned=0;const dir=blades.map(b=>Math.sign(b.vx));
 for(let i=0;i<400;i++){step(s,idle);blades.forEach((b,k)=>{if(Math.sign(b.vx)&&Math.sign(b.vx)!==dir[k]){dir[k]=Math.sign(b.vx);turned++;}});}
 assert.equal(turned,3,'each turns once');
 const late=until(7,2,'crescent');toFiring(late.s,late.e);step(late.s,idle);assert.equal(late.s.bullets.filter(b=>b.kind==='crescent').length,5);
});

test('a new phase clears what the old one left: waves, spires, clouds and fire',()=>{
 for(const ch of [1,4,5,6]){
  const {s,e}=encounter(ch,0);
  s.hazards.push({id:77,kind:'wave',x:200,w:WAVE.w,g:[],half:40,base:GROUND_Y-30,t:0},{id:78,kind:'spire',x:100,w:SPIRE.w,g:[],half:0,base:0,t:0});
  s.charges.push({kind:'spore',x:100,y:100,sx:100,sy:100,tx:100,ty:100,t:50},{kind:'ember',x:100,y:100,sx:100,sy:100,tx:100,ty:100,t:50});
  e.hp=sizes[ch-1][2]*0.5;step(s,idle);
  assert.equal(e.a,1);assert.equal(s.charges.length,0);assert(!s.hazards.some(h=>h.kind==='wave'||h.kind==='spire'));
 }
});
test('every chapter boss keeps working for a long fight: always on screen, never stuck out of reach',()=>{
 for(let ch=1;ch<=7;ch++)for(let phase=0;phase<3;phase++){
  const {s,e}=encounter(ch,phase);let seen=0;
  for(let i=0;i<5000;i++){
   s.p.x=40+30*Math.sin(i/37);s.p.y=100+60*Math.sin(i/53);s.p.inv=1e9;
   step(s,idle);
   assert(s.enemies.includes(e),`boss ${ch} phase ${phase} left the game at frame ${i}`);
   assert(Number.isFinite(e.x)&&Number.isFinite(e.y),`boss ${ch} NaN`);
   if(e.x<W&&e.y>-e.h&&e.y<H)seen++;
  }
  assert(seen>4000,`boss ${ch} phase ${phase} on screen ${seen} of 5000 frames`);
 }
});

/* ---- health bars, shield, self-healing, levels, the new weapons and the nuclear warheads ---- */
const playing=(level=1,extra=0)=>{const s=createState(1,0,1,level,extra);s.phase='play';s.planIdx=0;s.t=-1e6;s.pickupIdx=999;s.p.x=60;s.p.y=100;s.p.cd=1e9;s.p.launchCd=1e9;return s;};
const hurt=(s)=>{s.p.inv=0;s.bullets.push({x:s.p.x+7,y:s.p.y+4,vx:0,vy:0,r:2,own:'e',dmg:1,kind:'orb'});step(s,idle);};
const foe=(id,type,x,y,w,h,hp)=>({id,type,x,y,w,h,vx:0,vy:0,hp,maxHp:hp,t:0,cd:999,y0:0,flash:0,stun:0,a:0,b:0,c:0,d:0,n:0,rot:0,guard:0,parts:[]});
const gain=(s)=>{s.pickups.push({x:s.p.x+7,y:s.p.y+4,kind:'E',t:0});step(s,idle);};

test('the ship has its own health bar and a small shield: a hit goes to the shield first',()=>{
 const s=playing();assert.equal(s.p.hp,maxHpFor(1));assert.equal(s.p.hp,100);assert.equal(s.p.shield,SHIELD.base);
 s.p.weapon=3;hurt(s);
 assert.equal(s.p.shield,0);assert.equal(s.p.hp,100);
 hurt(s);assert.equal(s.p.hp,100-LIFE.hit);assert.equal(s.p.weapon,3,'the blaster has no power levels to lose');
 for(let i=0;i<4;i++)hurt(s);assert.equal(s.phase,'dead');assert.equal(s.p.hp,0);
});
test('a hit bigger than the shield takes the rest from the health bar',()=>{
 const s=playing();s.p.shield=8;hurt(s);assert.equal(s.p.shield,0);assert.equal(s.p.hp,100-(LIFE.hit-8));
});
test('nothing mends the ship by itself before level 5: shield and health stay where the hits left them',()=>{
 const s=playing(3);
 s.p.hp=60;s.p.shield=0;
 run(s,3000);assert.equal(s.p.hp,60);assert.equal(s.p.shield,0);
 hurt(s);const after=life(s);run(s,3000);assert.equal(life(s),after,'and a hit does not start any mending');
 const t=playing(1);t.p.hp=50;t.pickups.push({x:t.p.x+7,y:t.p.y+4,kind:'H',t:0});step(t,idle);assert.equal(t.p.hp,50+LIFE.heal,'a life crate still mends');
});

test('levels arrive by themselves up to ten: gold hearts only, one more for each level than the last, each with its upgrade announced',()=>{
 assert.equal(MAX_LEVEL,10);assert.equal(LEVEL_AT.length,MAX_LEVEL);assert.deepEqual(LEVEL_AT,[0,1,3,6,10,15,21,28,36,45]);
 const s=playing(1);const seen=[];
 for(let i=0;i<LEVEL_AT[MAX_LEVEL-1]+3;i++){const before=s.p.level;gain(s);
  const want=1+LEVEL_AT.filter((v,k)=>k>0&&s.p.extra>=v).length;assert.equal(s.p.level,want,'extra '+s.p.extra);
  if(s.p.level>before){seen.push([s.p.level,s.callout.kind]);assert.equal(s.p.hp,maxLife(s.p),'a level refills health');assert(s.p.morph>0);}
 }
 assert.equal(s.p.level,10);
 assert.deepEqual(seen.slice(0,4),[[2,'hypersonic'],[3,'mechshield'],[4,'launcher'],[5,'repair']]);
 assert.deepEqual(seen.slice(4),[[6,'levelup'],[7,'levelup'],[8,'levelup'],[9,'hq'],[10,'levelup']]);assert.equal(seen.length,9);
});
test('the upgrades come with the level: torpedo 1, hypersonic 2, mechanical shield 3, self-repair 5, HQ support 9',()=>{
 assert.deepEqual(UPGRADE_AT,{torpedo:1,hypersonic:2,armor:3,repair:5,hq:9});assert.equal(TWIN_AT,4);
 const has=(l)=>['torpedo','hypersonic','armor','repair','hq'].filter(u=>hasUpgrade({level:l},u));
 assert.deepEqual(has(1),['torpedo']);assert.deepEqual(has(2),['torpedo','hypersonic']);assert.deepEqual(has(3),['torpedo','hypersonic','armor']);
 assert.deepEqual(has(4),['torpedo','hypersonic','armor']);assert.deepEqual(has(5),['torpedo','hypersonic','armor','repair']);assert.deepEqual(has(8),has(5));assert.deepEqual(has(9),['torpedo','hypersonic','armor','repair','hq']);assert.deepEqual(has(10),has(9));
});
test('health and shield grow with the level, the ship only through its first three',()=>{
 assert.deepEqual([1,2,3,4,10].map(maxHpFor),[100,110,120,130,190]);
 assert.deepEqual([1,2,3,4,5,10].map(l=>maxShield({level:l})),[1,2,3,4,5,10].map(l=>Math.round((20+5*Math.max(0,l-3))*(l>=3?1.1:1))));
 assert.equal(maxShield({level:2}),20);assert.equal(maxShield({level:4}),Math.round(25*1.1),'from level 4 five more for each level, a tenth more with the armour');
 assert(shipScale(1)<shipScale(2)&&shipScale(2)<shipScale(3));assert.equal(shipScale(3),shipScale(10));
 assert.equal(playing(10).p.hp,maxLife({level:10}));assert.equal(createState(1,0,1,10).p.nukes,NUKE.count+1);assert.equal(createState(1,0,1,9).p.nukes,NUKE.count);
});
test('the level, the gold hearts and the nuclear warheads carry to the next chapter, a retry and the boss checkpoint',()=>{
 const s=playing(6,7);
 for(const next of [nextChapter(s),retryChapter(s),bossCheckpoint(s)]){assert.equal(next.p.level,6);assert.equal(next.p.extra,7);assert.equal(next.p.nukes,NUKE.count);}
 assert.equal(nextChapter(s).p.hp,maxLife(s.p));
});

test('being hit costs health only: no level, no upgrade and no gold heart is ever lost',()=>{
 const s=playing(9,36);s.p.shield=0;s.p.calm=1e9;
 const level=s.p.level,extra=s.p.extra,names=['torpedo','hypersonic','armor','repair','hq'];
 const has=()=>names.map(u=>hasUpgrade(s.p,u));const before=has();
 assert.deepEqual(before,[true,true,true,true,true]);
 const cut=LIFE.hit*(1-ARMOR.reduction);
 hurt(s);assert(Math.abs(s.p.hp-(maxLife(s.p)-cut))<1e-9,'the hit came off the health bar');
 let calls=0;
 while(s.phase==='play'&&calls++<80){hurt(s);assert.equal(s.p.level,level);assert.equal(s.p.extra,extra);assert.deepEqual(has(),before);assert(s.p.morph===0,'the ship does not change shape');}
 assert.equal(s.phase,'dead','only health ran out');assert.equal(s.p.hp,0);assert.equal(s.p.level,level);
});
test('a hit goes to the shield first and then to the health, at every level',()=>{
 for(const level of [1,2,3,5,9,10]){
  const s=playing(level);s.p.shield=8;s.p.calm=1e9;
  const dmg=LIFE.hit*(hasUpgrade(s.p,'armor')?1-ARMOR.reduction:1);
  hurt(s);assert.equal(s.p.shield,0,'level '+level);assert(Math.abs(s.p.hp-(maxLife(s.p)-(dmg-8)))<1e-9,'level '+level);assert.equal(s.p.level,level);
 }
});

test('mechanical shield (level 3): 30% less damage and 10% more health and shield',()=>{
 const plain=playing(2),armour=playing(3);
 assert.equal(maxLife(armour.p),Math.round(maxHpFor(3)*1.1));assert.equal(armour.p.hp,maxLife(armour.p));
 assert.equal(maxShield(armour.p),Math.round(SHIELD.base*1.1));assert.equal(armour.p.shield,maxShield(armour.p));
 plain.p.shield=0;armour.p.shield=0;hurt(plain);hurt(armour);
 assert.equal(plain.p.hp,maxLife(plain.p)-LIFE.hit);
 assert(Math.abs(armour.p.hp-(maxLife(armour.p)-LIFE.hit*(1-ARMOR.reduction)))<1e-9,'a hit does 70% of the damage');
});
test('hypersonic (level 2): a faster ship and guns that fire more often, and not before',()=>{
 const plain=playing(1),fast=playing(2);
 plain.p.cd=fast.p.cd=0;
 const x0=plain.p.x;step(plain,{...idle,mx:2.7});const x1=fast.p.x;step(fast,{...idle,mx:2.7});
 assert(Math.abs(plain.p.x-x0-2.7)<1e-9);assert(Math.abs(fast.p.x-x1-2.7*HYPERSONIC.speed)<1e-9);
 assert.equal(plain.p.cd,12,'the blaster waits twelve frames');assert.equal(fast.p.cd,Math.round(12*HYPERSONIC.rate));
 const shot=fast.bullets.find(b=>b.own==='p');assert.equal(shot.vx,HYPERSONIC.shot);assert.equal(plain.bullets.find(b=>b.own==='p').vx,BLASTER.speed);
 const g=playing(2);g.p.gun='machine';g.p.ammo=50;g.p.cd=0;g.enemies=[foe(9,'rock',200,g.p.y-10,30,30,1e4)];
 step(g,idle);assert.equal(g.p.cd,Math.round(4*HYPERSONIC.rate));
});
test('torpedo launchers: one from the start and a second on top at level 4, which fires faster and harder',()=>{
 for(const [level,expected,cd,dmg] of [[1,1,TUBES.single.cooldown,TUBES.single.damage],[3,1,TUBES.single.cooldown,TUBES.single.damage],[4,2,TUBES.twin.cooldown,TUBES.twin.damage],[10,2,TUBES.twin.cooldown,TUBES.twin.damage]]){
  const s=playing(level);s.p.launchCd=0;
  const size=shipSize(level),low=s.p.y+size.h+2,high=s.p.y-2;
  s.enemies=[low,high].map((y,i)=>foe(20+i,'rock',220,y-15,30,30,1e4));
  step(s,idle);
  const tubes=s.bullets.filter(b=>b.own==='p'&&b.kind==='torpedo');assert.equal(tubes.length,expected,'level '+level);
  assert(tubes.every(b=>b.dmg===dmg&&!b.icy),'level '+level);assert.equal(s.p.launchCd,cd);
 }
 assert(TUBES.single.cooldown>TUBES.twin.cooldown&&TUBES.single.damage<TUBES.twin.damage);
});

test('frost: an ice bomb freezes what it catches, but not a boss; a frozen enemy barely moves and takes more damage',()=>{
 const s=playing(1);s.p.launchCd=1e9;
 const a=foe(40,'scout',200,100,16,12,1000);a.vx=-2;const b=foe(41,'armor',215,112,32,28,1000);b.vx=-1;
 const boss=foe(42,'boss1',215,90,64,60,1e5);boss.stun=1e9;
 const far=foe(43,'scout',330,20,16,12,1000);
 s.enemies=[a,b,boss,far];
 s.bullets=[{x:196,y:106,vx:3,vy:0,r:4,own:'p',dmg:ICEBOMB.damage,kind:'icebomb',life:150,icy:true}];
 step(s,idle);
 assert(a.freeze>0&&b.freeze>0,'the ones the blast reached are frozen');assert.equal(boss.freeze,undefined,'a boss is not frozen');assert.equal(far.freeze,undefined);
 const x=a.x;step(s,idle);assert(Math.abs(a.x-x-(-2*FREEZE.slow))<1e-9,'it drifts at a quarter of its speed');
 assert.equal(FREEZE.shatter,1.5);
 const hp=a.hp;s.bullets=[{x:a.x+8,y:a.y+6,vx:2,vy:0,r:2,own:'p',dmg:2,kind:'pulse'}];step(s,idle);assert(Math.abs((hp-a.hp)-2*POWER*FREEZE.shatter)<1e-9,'a frozen enemy takes half as much again');
 for(let i=0;i<FREEZE.frames+5;i++)step(s,idle);assert(a.freeze<=0);const x2=a.x;step(s,idle);assert(Math.abs(a.x-x2-(-2))<1e-9,'thawed, it moves at its own speed');
 const plain=playing(4);plain.p.launchCd=1e9;const c=foe(44,'scout',200,100,16,12,1000);plain.enemies=[c];
 plain.bullets=[{x:196,y:106,vx:3,vy:0,ux:1,uy:0,age:40,r:3,own:'p',dmg:TUBES.twin.damage,kind:'torpedo',life:150}];step(plain,idle);assert.equal(c.freeze,undefined,'an ordinary torpedo does not freeze');
});

test('weapon crates: three new guns, fewer of them, and less ammunition in each',()=>{
 for(const [kind,gun] of [['I','icebomb'],['F','flame'],['K','katana'],['M','machine']]){
  const s=playing();s.pickups.push({x:s.p.x+7,y:s.p.y+4,kind,t:0});step(s,idle);
  assert.equal(s.p.gun,gun);assert.equal(s.p.ammo,GUNS[gun].ammo);assert(s.p.swap>0);
 }
 assert(GUNS.machine.ammo<170&&GUNS.spread.ammo<48&&GUNS.laser.ammo<150&&GUNS.torpedo.ammo<18,'the old guns hold less');
});
test('ice bomb: bursts on contact or where it runs out, and freezes everything in the blast but a boss',()=>{
 const s=playing();s.p.gun='icebomb';s.p.ammo=3;s.p.cd=0;
 const m=podMuzzle(s.p);const target=foe(50,'rock',m.x+60,m.y-12,30,30,1e4);const near=foe(51,'scout',m.x+66,m.y+22,16,12,1e4);const boss=foe(52,'boss1',m.x+70,m.y-30,64,60,1e5);boss.stun=1e9;
 s.enemies=[target,near,boss];
 step(s,idle);const bomb=s.bullets.find(b=>b.kind==='icebomb');assert(bomb&&bomb.icy);assert.equal(s.p.ammo,2);assert.equal(s.p.cd,GUNS.icebomb.cooldown);
 let n=0;while(s.bullets.some(b=>b.kind==='icebomb')&&n++<60)step(s,idle);
 assert(target.freeze>0,'the one it hit');assert(near.freeze>0,'the one beside it');assert.equal(boss.freeze,undefined);
 assert(target.hp<1e4&&near.hp<1e4);
 const t=playing();const wall=foe(53,'rock',215,115,30,30,1e4);t.enemies=[wall];
 t.bullets=[{x:200,y:100,vx:4.2,vy:0,r:4,own:'p',dmg:ICEBOMB.damage,kind:'icebomb',life:1,icy:true}];
 step(t,idle);assert.equal(t.bullets.filter(b=>b.kind==='icebomb').length,0);assert(wall.freeze>0,'it goes off where it runs out');
});
test('flamethrower: short-ranged fire that goes through everything in a line',()=>{
 const s=playing();s.p.gun='flame';s.p.ammo=40;s.p.cd=0;
 const m=podMuzzle(s.p);
 const a=foe(60,'rock',m.x+18,m.y-8,16,16,1e4),b=foe(61,'rock',m.x+44,m.y-8,16,16,1e4),far=foe(62,'rock',m.x+130,m.y-8,16,16,1e4);
 s.enemies=[a,b,far];
 step(s,idle);const flames=s.bullets.filter(x=>x.kind==='flame');assert.equal(flames.length,3);assert(flames.every(f=>f.pierce&&f.life<=FLAME.life));
 assert.equal(s.p.cd,GUNS.flame.cooldown);
 for(let i=0;i<24;i++)step(s,idle);
 assert(a.hp<1e4&&b.hp<1e4,'both in the line were burnt');assert.equal(far.hp,1e4,'too far to reach');
 assert(FLAME.speed*FLAME.life<80,'the range is short');
 const t=playing();t.p.gun='flame';t.p.ammo=40;t.p.cd=0;const out=foe(63,'rock',podMuzzle(t.p).x+160,podMuzzle(t.p).y-8,16,16,1e4);t.enemies=[out];
 step(t,idle);assert.equal(t.bullets.filter(x=>x.kind==='flame').length,0,'nothing in reach: the blaster fires instead');assert.equal(t.p.ammo,40);
});
test('katana: cuts enemies and their shots in front of the ship, and throws a wave',()=>{
 const s=playing();s.p.gun='katana';s.p.ammo=5;s.p.cd=0;
 const m=podMuzzle(s.p);
 const rock=foe(70,'rock',m.x+20,m.y-10,26,20,1e4),boss=foe(71,'boss1',m.x+30,m.y-30,64,60,1e5);boss.stun=1e9;
 s.enemies=[rock,boss];
 s.bullets=[{x:m.x+25,y:m.y+4,vx:-2,vy:0,r:2,own:'e',dmg:1,kind:'orb'},{x:m.x+200,y:m.y,vx:-2,vy:0,r:2,own:'e',dmg:1,kind:'orb'}];
 step(s,idle);
 assert(rock.hp<=1e4-KATANA.damage*POWER+1e-9);const bossLost=1e5-boss.hp;assert(bossLost>=KATANA.boss*POWER-1e-9&&bossLost<=(KATANA.boss+KATANA.wave)*POWER+1e-9,'a boss is cut for less, plus the wave that starts inside it');assert(1e4-rock.hp>bossLost-KATANA.wave*POWER);
 const shots=s.bullets.filter(b=>b.own==='e');assert.equal(shots.length,1,'the shot in front was cut and the far one left');assert(shots[0].x>m.x+150);
 assert(s.bullets.some(b=>b.kind==='slash'&&b.pierce));assert.equal(s.p.slashT,10-0);assert.equal(s.p.ammo,4);assert.equal(s.p.cd,GUNS.katana.cooldown);
 const t=playing();t.p.gun='katana';t.p.ammo=5;t.p.cd=0;const tm=podMuzzle(t.p);
 t.bullets=[{x:tm.x+18,y:tm.y,vx:-2,vy:0,r:2,own:'e',dmg:1,kind:'orb'}];step(t,idle);
 assert.equal(t.p.ammo,4,'a shot to cut is reason enough to swing');assert.equal(t.bullets.filter(b=>b.own==='e').length,0);
 const u=playing();u.p.gun='katana';u.p.ammo=5;u.p.cd=0;step(u,idle);assert.equal(u.p.ammo,5,'nothing to cut: no swing');
});

const lastsOut=(s,cap=400)=>{let i=0;while((s.warheads.length||s.nuke)&&i++<cap)step(s,idle);};

test('nuclear warheads: three a chapter, each a missile that is fired, flies, and only goes off where it hits',()=>{
 const s=playing(1);assert.equal(s.p.nukes,3);assert.equal(NUKE.count,3);
 const scout=foe(30,'scout',300,100,16,12,2),cruiser=foe(31,'cruiser',200,150,58,34,44);
 s.enemies=[scout,cruiser];
 const hp=life(s);
 step(s,{...idle,nuke:true});
 assert.equal(s.p.nukes,2);assert.equal(s.warheads.length,1);assert.equal(s.nuke,null,'nothing goes off at the launch');
 step(s,{...idle,nuke:true});assert.equal(s.p.nukes,2,'a second warhead cannot be fired while the first is in the air');
 let n=0;while(s.warheads.length&&n++<300)step(s,idle);
 assert(s.nuke,'it went off on arrival');assert(s.nuke.x>150&&s.nuke.x<=W,'where it hit, not at the ship');
 assert(s.p.inv>0,'the ship cannot be hurt while it burns');
 lastsOut(s);
 assert.equal(s.nuke,null);assert(!s.enemies.some(e=>[30,31].includes(e.id)),'everything small is gone');
 assert.equal(life(s),hp,'the ship was not hurt');
});
test('a warhead runs down the boss before anything nearer, and the boss loses a twentieth of its health to it plus a scratch from the blast',()=>{
 const s=playing(1);
 const boss=foe(50,'boss1',260,80,64,60,1000);boss.stun=1e9;
 const near=foe(51,'scout',110,20,16,12,1e4);
 s.enemies=[near,boss];
 step(s,{...idle,nuke:true});assert.equal(s.warheads[0].target,50);
 let n=0;while(s.warheads.length&&n++<300)step(s,idle);
 assert(s.nuke);assert(s.nuke.x>=boss.x-10,'it went off at the boss');
 const lost=1000-boss.hp;assert(lost>=1000*NUKE.bossShare-1e-9,`the boss lost ${lost}`);
 lastsOut(s);
 const total=1000-boss.hp;assert(total>=1000*NUKE.bossShare&&total<=1000*NUKE.bossShare+NUKE.boss*Math.ceil(NUKE.frames/NUKE.every)+1e-9,`the boss lost ${total} in all`);
 assert.equal(NUKE.bossShare,0.05);
});
test('with nothing to aim at a warhead flies straight on and goes off in the open',()=>{
 const s=playing(1);step(s,{...idle,nuke:true});assert.equal(s.warheads[0].target,0);
 let n=0;while(s.warheads.length&&n++<300)step(s,idle);
 assert(s.nuke&&s.nuke.x>200,'it went off ahead of the ship');
});
test('nuclear warheads run out after three, come back with the next chapter and the blast wipes out boss fire too',()=>{
 const s=playing(1);
 for(let n=0;n<4;n++){step(s,{...idle,nuke:true});lastsOut(s);}
 assert.equal(s.p.nukes,0);assert.equal(s.nuke,null);assert.equal(s.warheads.length,0);
 step(s,{...idle,nuke:true});assert.equal(s.warheads.length,0,'none left to fire');
 assert.equal(nextChapter(s).p.nukes,3);assert.equal(retryChapter(s).p.nukes,3);assert.equal(bossCheckpoint(s).p.nukes,3);
 const f=playing(1);
 f.bullets=[{x:150,y:90,vx:-1,vy:0,r:2,own:'e',dmg:1,kind:'orb'}];f.beams=[{y:90,h:14,x0:200,t:0,warn:10,live:30}];
 f.charges.push({kind:'spore',x:100,y:100,sx:100,sy:100,tx:100,ty:100,t:60});
 f.hazards.push({id:99,kind:'wave',x:200,w:WAVE.w,g:[],half:40,base:GROUND_Y-30,t:0});
 f.warheads.push({x:200,y:100,vx:2,vy:0,t:170,target:0});
 step(f,idle);
 assert(f.nuke);assert.equal(f.bullets.filter(b=>b.own==='e').length,0);assert.equal(f.beams.length,0);assert.equal(f.charges.length,0);assert(!f.hazards.some(h=>h.kind==='wave'));
});

test('a bomb is ten timed bombs: they fly out and each goes off three seconds later, not before',()=>{
 assert.equal(BOMBS.count,10);assert.equal(BOMBS.fuse,3*60);
 const s=playing(1);s.p.bombs=2;
 step(s,{...idle,bomb:true});
 assert.equal(s.p.bombs,1);assert.equal(s.timedBombs.length,10);
 assert(new Set(s.timedBombs.map(b=>Math.round(b.y))).size>5,'fanned out, not thrown in a line');
 step(s,{...idle,bomb:true});assert.equal(s.p.bombs,1,'one throw at a time');
 const xs=s.timedBombs.map(b=>b.x);
 for(let i=0;i<BOMBS.fuse-4;i++)step(s,idle);
 assert.equal(s.timedBombs.length,10,'none has gone off yet');
 assert(s.timedBombs.every(b=>b.x<W&&b.y>0&&b.y<H),'they stay on screen');
 assert(Math.max(...s.timedBombs.map(b=>b.x))>Math.max(...xs),'they flew out ahead of the ship');
 for(let i=0;i<6;i++)step(s,idle);
 assert.equal(s.timedBombs.length,0,'all ten have gone off');
});
test('a bomb that goes off hurts what is in its reach (a boss for less), clears enemy shots, and leaves the rest alone',()=>{
 const s=playing(1);
 const rock=foe(80,'rock',190,95,30,30,100),far=foe(81,'rock',320,20,30,30,100),boss=foe(82,'boss1',100,10,64,60,1e5);boss.stun=1e9;
 s.enemies=[rock,far,boss];
 s.bullets=[{x:208,y:112,vx:0,vy:0,r:2,own:'e',dmg:1,kind:'orb'},{x:330,y:200,vx:0,vy:0,r:2,own:'e',dmg:1,kind:'orb'}];
 s.timedBombs=[{x:205,y:110,vx:0,vy:0,t:BOMBS.fuse-1},{x:132,y:40,vx:0,vy:0,t:BOMBS.fuse-1},{x:60,y:200,vx:0,vy:0,t:10}];
 step(s,idle);
 assert.equal(rock.hp,100-BOMBS.damage);assert.equal(far.hp,100);
 assert.equal(1e5-boss.hp,BOMBS.boss);assert(BOMBS.boss<BOMBS.damage);
 const shots=s.bullets.filter(b=>b.own==='e');assert.equal(shots.length,1,'the shot in its reach is gone');assert(shots[0].x>300);
 assert.equal(s.timedBombs.length,1,'the one still counting stays');
});
test('a bomb that goes off defuses the charges, clouds and fire in its reach',()=>{
 const {s}=until(4,1,'spores');
 s.charges=[{kind:'spore',x:100,y:100,sx:100,sy:100,tx:100,ty:100,t:60},{kind:'ember',x:90,y:90,sx:90,sy:90,tx:90,ty:90,t:10},{kind:'spore',x:300,y:30,sx:300,sy:30,tx:300,ty:30,t:60}];
 s.timedBombs=[{x:95,y:95,vx:0,vy:0,t:BOMBS.fuse-1}];
 step(s,idle);
 assert.equal(s.charges.length,1);assert(s.charges[0].x>250,'the one out of reach is still there');
});

test('the last boss has a shield of its own: it takes the damage first, mends after five seconds untouched, and no chapter boss has one',()=>{
 assert.deepEqual(BOSS_SHIELD_AT,{boss8:1500});assert.equal(BOSS_SHIELD.wait,300);
 for(let ch=1;ch<=7;ch++){const t=bossCheckpoint(createState(ch));step(t,idle);const b=t.enemies.find(e=>e.type==='boss'+ch);assert(b);assert.equal(b.shield,undefined,'chapter '+ch);}
 const s=bossCheckpoint(createState(8));s.p.inv=1e6;s.p.cd=1e6;s.p.launchCd=1e6;step(s,idle);
 const e=s.enemies.find(e=>e.type==='boss8');assert(e);
 assert.equal(e.maxHp,5000);assert.equal(e.hp,5000);assert.equal(e.shield,1500);assert.equal(e.maxShield,1500);
 e.x=160;e.y=50;e.stun=1e6;s.talk=null;
 const hit=(n)=>{s.bullets=[{x:e.x+e.w-6,y:e.y+e.h/2,vx:0,vy:0,r:2,own:'p',dmg:n,kind:'pulse'}];step(s,idle);};
 hit(100);assert(e.shield<1500&&e.shield>1400,'the shield took it');assert.equal(e.hp,5000,'and the boss lost no health');
 e.shield=10;hit(100);assert.equal(e.shield,0);assert(e.hp<5000,'what the shield could not take went through');
 const hp=e.hp;
 for(let i=0;i<BOSS_SHIELD.wait-4;i++){s.bullets=[];step(s,idle);}
 assert.equal(e.shield,0,'it does not mend while it was hit a moment ago');
 for(let i=0;i<20;i++){s.bullets=[];step(s,idle);}
 assert(e.shield>0&&e.shield<30,'it mends slowly once left alone');assert.equal(e.hp,hp);
 hit(1);assert(e.shield<=e.maxShield);
});

test('after take-off the stars streak past, in space only, and then settle',()=>{
 for(const ch of [1,2,3,5]){
  const s=createState(ch);let n=0;while(s.phase==='launch'&&n++<3000)step(s,idle);
  assert.equal(s.phase,'play','chapter '+ch);s.p.inv=1e9;
  if(ch<3){assert.equal(s.warp,0,'chapter '+ch);assert.equal(warpPower(s),0);continue;}
  assert.equal(s.warp,WARP.frames);assert(warpPower(s)>0.95);
  const a=s.scroll;step(s,idle);assert(s.scroll-a>2,'the scenery runs fast');
  for(let i=0;i<WARP.frames;i++){s.p.inv=1e9;step(s,idle);}
  assert.equal(s.warp,0);assert.equal(warpPower(s),0);
  const b=s.scroll;step(s,idle);assert.equal(s.scroll-b,1,'and settles to its own pace');
 }
});
test('when the boss falls the ship settles in the middle, then flies off; orders and hits do nothing meanwhile',()=>{
 const {s,e}=encounter(3);e.hp=0;
 for(let i=0;i<300&&s.phase!=='clear';i++)step(s,idle);
 assert.equal(s.phase,'clear');const p=s.p;
 const hp=life(s);
 for(let i=0;i<CLEAR.go-2;i++){s.bullets.push({x:p.x+7,y:p.y+4,vx:0,vy:0,r:2,own:'e',dmg:1,kind:'orb'});step(s,{...idle,mx:-3,my:3,bomb:true,nuke:true});}
 const size=shipSize(p.level);
 assert(Math.abs(p.x+size.w/2-W/2)<12&&Math.abs(p.y+size.h/2-H/2)<12,'in the middle of the screen');
 assert.equal(life(s),hp);assert.equal(s.timedBombs.length,0);assert.equal(s.warheads.length,0);assert.equal(warpPower(s),0);
 const x=p.x;for(let i=0;i<40;i++)step(s,idle);
 assert(p.x>x+40,'then it gathers speed');assert(warpPower(s)>0.9,'with the stars streaking past');
 for(let i=0;i<CLEAR.talk-CLEAR.go-40+2;i++)step(s,idle);
 assert(p.x>W,'and is gone by the time the story starts');assert.equal(s.phase,'clear');
 const early=encounter(1);early.e.hp=0;for(let i=0;i<300&&early.s.phase!=='clear';i++)step(early.s,idle);
 for(let i=0;i<CLEAR.go+60;i++)step(early.s,idle);assert.equal(warpPower(early.s),0,'no streaking stars in the first two chapters');
});
test('nothing is picked up once the boss has fallen, so the score stays what the results screen says',()=>{
 const {s,e}=encounter(2);e.hp=0;
 for(let i=0;i<300&&s.phase!=='clear';i++)step(s,idle);
 s.pickups.push({x:s.p.x+7,y:s.p.y+4,kind:'E',t:0});const score=s.score,extra=s.p.extra;
 step(s,idle);assert.equal(s.score,score);assert.equal(s.p.extra,extra);
});

test('the ship\'s own weapons do three quarters of the damage, and the blaster\'s bolt flies a fifth slower',()=>{
 assert.equal(POWER,0.75);assert.equal(BLASTER.speed,4.8);assert.equal(HYPERSONIC.shot,6);
 const s=playing(1);const r=foe(90,'rock',100,96,30,30,1000);s.enemies=[r];
 s.bullets=[{x:116,y:110,vx:0,vy:0,r:2,own:'p',dmg:4,kind:'pulse'}];step(s,idle);
 assert(Math.abs(1000-r.hp-4*POWER)<1e-9,`took ${1000-r.hp}`);
 const t=playing(1);t.p.cd=0;step(t,idle);assert.equal(t.bullets.find(b=>b.own==='p').vx,BLASTER.speed);
});
test('a life crate mends health but is no step toward a level; only gold hearts are',()=>{
 const s=playing(1);
 for(let i=0;i<30;i++){s.pickups.push({x:s.p.x+7,y:s.p.y+4,kind:'H',t:0});step(s,idle);}
 assert.equal(s.p.extra,0);assert.equal(s.p.level,1);
 s.p.hp=40;s.pickups.push({x:s.p.x+7,y:s.p.y+4,kind:'H',t:0});step(s,idle);assert(s.p.hp>40,'it mends');assert.equal(s.p.extra,0);
 for(let i=0;i<LEVEL_AT[1]-1;i++)gain(s);assert.equal(s.p.level,1,'before the first heart');
 gain(s);assert.equal(s.p.level,2,'the first heart is level 2');
 for(let i=0;i<LEVEL_AT[2]-LEVEL_AT[1]-1;i++)gain(s);assert.equal(s.p.level,2);gain(s);assert.equal(s.p.level,3);
});

test('level-up crates are a matter of luck: fourteen places for a gold heart, each with a 30% chance',()=>{
 assert.equal(UPGRADE_LUCK,0.3);assert.equal(PICKUP_PLANS.flat().length,14);
 let appeared=0;const trials=600;
 for(let k=0;k<trials;k++){
  const s=createState(2,0,1,1,0);s.phase='play';s.p.inv=1e9;s.p.cd=1e9;s.p.launchCd=1e9;s.seed=1000+k*7919;
  s.t=PICKUP_PLANS[2][0].t-2;step(s,idle);assert(!s.pickups.some(p=>p.kind==='E'),'not before its time');step(s,idle);step(s,idle);
  if(s.pickups.some(p=>p.kind==='E'))appeared++;
  assert.equal(s.pickupIdx,1,'the place is used up whether the heart came or not');
 }
 assert(appeared>trials*0.3-70&&appeared<trials*0.3+70,`${appeared} of ${trials} turned up`);
 assert(appeared>0&&appeared<trials,'sometimes yes, sometimes no');
});
test('the blaster is a single shot, whatever the old power level says, and a weapon switches it off',()=>{
 for(const w of [1,2,3]){const s=playing(1);s.p.weapon=w;s.p.cd=0;step(s,idle);assert.equal(s.bullets.filter(b=>b.own==='p').length,1,'power '+w);}
 const s=playing(1);s.p.gun='flame';s.p.ammo=40;s.p.cd=0;
 for(let i=0;i<60;i++)step(s,idle);
 assert.equal(s.bullets.filter(b=>b.own==='p').length,0,'a weapon with nothing in its line fires nothing, the blaster does not take over');assert.equal(s.p.ammo,40);assert.equal(s.p.gun,'flame');
 s.enemies=[foe(5,'rock',podMuzzle(s.p).x+30,podMuzzle(s.p).y-8,16,16,1e4)];step(s,idle);
 assert(s.bullets.some(b=>b.kind==='flame'),'the weapon fires the moment something is in its line');assert(!s.bullets.some(b=>b.kind==='pulse'));assert(s.p.ammo<40);
 const t=playing(1);t.p.gun='flame';t.p.ammo=1;t.p.cd=0;t.enemies=[foe(6,'rock',podMuzzle(t.p).x+30,podMuzzle(t.p).y-8,16,16,1e4)];step(t,idle);
 assert.equal(t.p.gun,'blaster','out of ammunition, the blaster is back');t.p.cd=0;step(t,idle);assert(t.bullets.some(b=>b.kind==='pulse'));
});

test('self-repair (level 5): after six seconds without a hit the shield, upgrade bar and health mend together, and a hit starts the six seconds again',()=>{
 assert.equal(CALM,360);assert.equal(UPGRADE_AT.repair,5);
 const s=playing(5);
 s.p.hp=60;s.p.shield=0;s.p.calm=CALM;
 run(s,CALM-2);assert.equal(s.p.hp,60);assert.equal(s.p.shield,0);
 run(s,12);assert(s.p.hp>60&&s.p.shield>0);
 run(s,4000);assert.equal(s.p.hp,maxLife(s.p));assert.equal(s.p.shield,maxShield(s.p));
 hurt(s);hurt(s);const after=life(s);run(s,CALM-10);assert.equal(life(s),after,'a hit starts the six seconds again');
});
test('below level 5 nothing mends the ship by itself',()=>{
 for(const level of [1,2,3,4]){const s=playing(level);s.p.hp=50;s.p.shield=0;run(s,3000);assert.equal(s.p.hp,50,'level '+level);assert.equal(s.p.shield,0);}
});
test('HQ support (level 9): a hangar slides in at the left edge, the ship keeps clear of it, and four launchers, two at the top and two at the bottom, fire homing torpedoes in turn',()=>{
 assert.equal(UPGRADE_AT.hq,9);assert.equal(HQ_LAUNCHERS.length,4);
 assert.deepEqual(HQ_LAUNCHERS.map(l=>l.y<H/2),[true,true,false,false]);
 const low=playing(8);run(low,60);assert.equal(low.hq.slide,0,'not before level 9');
 const s=playing(9);s.p.x=10;run(s,40);
 assert.equal(s.hq.slide,1);assert(s.p.x>=HQ.width,'the ship keeps clear of the hangar');
 step(s,{...idle,mx:-50});assert(s.p.x>=HQ.width+6-1e-9);
 run(s,250);assert(!s.bullets.some(b=>b.own==='p'&&b.track!==undefined),'nothing to shoot at, nothing fires');
 const rock=foe(60,'rock',300,110,30,30,1e5);s.enemies=[rock];
 const seen=new Set(),launches=[];
 for(let i=0;i<HQ.cooldown+HQ.stagger*4;i++){
  step(s,idle);
  for(const b of s.bullets)if(b.own==='p'&&b.track!==undefined&&!seen.has(b)){seen.add(b);launches.push({frame:i,y:b.y,dmg:b.dmg});}
 }
 assert(launches.length>=5,'four in turn, and the first again after its cooldown');
 assert.deepEqual(launches.slice(0,4).map(l=>l.y<H/2),[true,true,false,false],'two from the top corner and two from the bottom');
 assert.equal(new Set(launches.slice(0,4).map(l=>Math.round(l.y))).size,4);
 for(let i=1;i<4;i++)assert(launches[i].frame-launches[i-1].frame>=HQ.stagger-1,'one launcher at a time');
 assert(launches[4].frame-launches[0].frame>=HQ.cooldown-1,'a launcher waits out its cooldown');
 assert(launches.every(l=>l.dmg===HQ.damage));
 run(s,260);
 assert(1e5-rock.hp>=4*HQ.damage*POWER-1e-9,`the homing torpedoes found the enemy: it lost ${1e5-rock.hp}`);
 s.p.level=8;run(s,40);assert.equal(s.hq.slide,0,'and the HQ goes if the level is lost');
});
