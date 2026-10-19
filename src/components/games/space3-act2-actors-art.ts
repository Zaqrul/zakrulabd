/* The chapter-aware dispatch keeps the older campaign painters untouched. */
import { type Enemy, type State } from "./space-logic.ts";
import { drawOuterBoss } from "./space3-act2-boss-art.ts";
import { drawOuterEnemy } from "./space3-act2-enemy-art.ts";

type Ctx=CanvasRenderingContext2D;
export function drawOuterActor(ctx:Ctx,e:Enemy,s:State,reduceMotion=false):boolean{
  if(drawOuterBoss(ctx,e,s,reduceMotion))return true;
  return drawOuterEnemy(ctx,e,s,reduceMotion);
}
