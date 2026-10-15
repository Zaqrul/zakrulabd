"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { COLS, ROWS, hasMove, matchedIds, newBoard, settle, type Tile } from "./match-logic";
import { loadBest, saveBest } from "./shared";

const MOVES = 20;

export type MatchLabels = { score: string; moves: string; best: string; over: string; again: string; shuffled: string; hint: string };

/* Each candy is told apart by shape as well as colour, so the board reads for
   anyone who cannot tell the colours apart. */
const CANDY: { color: string; shape: React.CSSProperties; name: string }[] = [
  { color: "#fbcf33", shape: { borderRadius: "50%" }, name: "yellow circle" },
  { color: "#f43f5e", shape: { borderRadius: "24%" }, name: "red square" },
  { color: "#22c55e", shape: { clipPath: "polygon(50% 6%, 95% 90%, 5% 90%)" }, name: "green triangle" },
  { color: "#38bdf8", shape: { clipPath: "polygon(50% 3%, 97% 50%, 50% 97%, 3% 50%)" }, name: "blue diamond" },
  { color: "#8b5cf6", shape: { clipPath: "polygon(25% 5%, 75% 5%, 98% 50%, 75% 95%, 25% 95%, 2% 50%)" }, name: "purple hexagon" },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* A match-three game in the spirit of the candy-crushing kind: swap two
   neighbouring candies to line up three or more, watch them clear and the rest
   fall, and chain reactions score more. Tap one candy then its neighbour, or
   drag a candy toward the one it should swap with. */
export default function Match({ labels }: { labels: MatchLabels }) {
  const idCounter = useRef(0);
  const nextId = useCallback(() => ++idCounter.current, []);
  const tilesRef = useRef<Tile[]>([]);
  const busy = useRef(false);
  const alive = useRef(true);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);

  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(MOVES);
  const [best, setBest] = useState(0);
  const [note, setNote] = useState("");
  const [over, setOver] = useState(false);
  const scoreRef = useRef(0);
  const movesRef = useRef(MOVES);

  const commit = useCallback((next: Tile[]) => {
    tilesRef.current = next;
    setTiles(next);
  }, []);

  const reset = useCallback(() => {
    busy.current = false;
    scoreRef.current = 0;
    movesRef.current = MOVES;
    setScore(0);
    setMoves(MOVES);
    setOver(false);
    setSelected(null);
    setNote("");
    commit(newBoard(nextId));
  }, [commit, nextId]);

  useEffect(() => {
    alive.current = true;
    const first = setTimeout(() => {
      setBest(loadBest("match"));
      reset();
    }, 0);
    return () => {
      alive.current = false;
      clearTimeout(first);
    };
  }, [reset]);

  /* Clears matches again and again until the board is quiet, scoring more for
     each step of the chain. */
  const resolve = useCallback(async () => {
    let chain = 0;
    for (;;) {
      const ids = matchedIds(tilesRef.current);
      if (ids.length === 0 || !alive.current) break;
      chain += 1;

      const gone = new Set(ids);
      commit(tilesRef.current.map((t) => (gone.has(t.id) ? { ...t, gone: true } : t)));
      scoreRef.current += ids.length * 10 * chain;
      setScore(scoreRef.current);
      await wait(240);
      if (!alive.current) return;

      const { start, end } = settle(tilesRef.current, nextId);
      commit(start);
      await wait(40);
      commit(end);
      await wait(300);
    }
  }, [commit, nextId]);

  const finishTurn = useCallback(async () => {
    if (movesRef.current <= 0) {
      setBest((b) => {
        const next = Math.max(b, scoreRef.current);
        if (next > b) saveBest("match", next);
        return next;
      });
      setNote(labels.over);
      setOver(true);
      busy.current = false;
      return;
    }
    if (!hasMove(tilesRef.current)) {
      setNote(labels.shuffled);
      commit(newBoard(nextId));
    }
    busy.current = false;
  }, [commit, labels.over, labels.shuffled, nextId]);

  const swap = useCallback(
    async (a: Tile, b: Tile) => {
      busy.current = true;
      setSelected(null);
      setNote("");
      const swapped = (list: Tile[]) =>
        list.map((t) => (t.id === a.id ? { ...t, r: b.r, c: b.c } : t.id === b.id ? { ...t, r: a.r, c: a.c } : t));

      commit(swapped(tilesRef.current));
      await wait(220);
      if (!alive.current) return;

      if (matchedIds(tilesRef.current).length === 0) {
        commit(swapped(tilesRef.current));
        await wait(220);
        busy.current = false;
        return;
      }

      movesRef.current -= 1;
      setMoves(movesRef.current);
      await resolve();
      await finishTurn();
    },
    [commit, resolve, finishTurn],
  );

  const tileAt = (r: number, c: number) => tilesRef.current.find((t) => !t.gone && t.r === r && t.c === c);

  const tap = useCallback(
    (tile: Tile) => {
      if (busy.current || movesRef.current <= 0) return;
      if (selected === null) {
        setSelected(tile.id);
        return;
      }
      if (selected === tile.id) {
        setSelected(null);
        return;
      }
      const first = tilesRef.current.find((t) => t.id === selected);
      if (first && Math.abs(first.r - tile.r) + Math.abs(first.c - tile.c) === 1) swap(first, tile);
      else setSelected(tile.id);
    },
    [selected, swap],
  );

  function onBoardPointerUp(e: React.PointerEvent) {
    const start = drag.current;
    drag.current = null;
    if (!start) return;
    const tile = tilesRef.current.find((t) => t.id === start.id);
    if (!tile) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) {
      tap(tile);
      return;
    }
    if (busy.current || movesRef.current <= 0) return;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const target = tileAt(tile.r + (horizontal ? 0 : Math.sign(dy)), tile.c + (horizontal ? Math.sign(dx) : 0));
    if (target) swap(tile, target);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[12px] font-bold text-navy">
        <span>{labels.score}: {score}</span>
        <span>{labels.moves}: {moves}</span>
        <span>{labels.best}: {best}</span>
      </div>

      <div
        onPointerUp={onBoardPointerUp}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onPointerLeave={() => {
          drag.current = null;
        }}
        className="relative mx-auto w-full max-w-[300px] select-none overflow-hidden rounded-xl border border-neutral-200 bg-[#fff8dc]"
        style={{ aspectRatio: `${COLS} / ${ROWS}` }}
      >
        {tiles.map((t) => {
          const candy = CANDY[t.kind];
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-label={`${candy.name}, row ${t.r + 1}, column ${t.c + 1}`}
              aria-pressed={isSelected}
              onPointerDown={(e) => {
                drag.current = { id: t.id, x: e.clientX, y: e.clientY };
              }}
              onClick={(e) => {
                /* Pointer taps are handled on release; this is for the keyboard. */
                if (e.detail === 0) tap(t);
              }}
              className="absolute touch-none p-[5%] focus-visible:outline-none"
              style={{
                width: `${100 / COLS}%`,
                height: `${100 / ROWS}%`,
                left: `${(t.c * 100) / COLS}%`,
                top: `${(t.r * 100) / ROWS}%`,
                opacity: t.gone ? 0 : 1,
                transform: t.gone ? "scale(0.3)" : isSelected ? "scale(1.12)" : "scale(1)",
                transition: "top 0.24s ease-in, left 0.22s ease, transform 0.22s ease, opacity 0.22s ease",
              }}
            >
              <span
                className="block h-full w-full"
                style={{
                  ...candy.shape,
                  background: `radial-gradient(circle at 32% 28%, rgb(255 255 255 / 0.75) 0, rgb(255 255 255 / 0) 38%), ${candy.color}`,
                  boxShadow: isSelected ? `0 0 0 3px #171717` : undefined,
                  outline: isSelected ? "none" : undefined,
                }}
              />
            </button>
          );
        })}

        {over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/75 text-navy">
            <span className="text-base font-extrabold">{labels.over}</span>
            <span className="text-sm font-bold">{labels.score}: {score}</span>
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-amber-400 px-4 py-1.5 text-[12px] font-bold hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            >
              {labels.again}
            </button>
          </div>
        )}
      </div>

      <p role="status" className="min-h-4 text-center text-[11.5px] font-semibold text-neutral-500">
        {note || labels.hint}
      </p>
    </div>
  );
}
