/* The rules of the match-three game, kept apart from the screen so they can be
   checked on their own. A tile has a kind (which candy it is) and a position;
   gone tiles are on their way out and no longer count. */
export const COLS = 6;
export const ROWS = 7;
export const KINDS = 5;

export type Tile = { id: number; kind: number; r: number; c: number; gone?: boolean };

/* The kinds laid out by row and column, with null where there is no tile. */
export function kindGrid(tiles: Tile[]) {
  const g: (number | null)[][] = Array.from({ length: ROWS }, () => Array<number | null>(COLS).fill(null));
  for (const t of tiles) if (!t.gone && t.r >= 0 && t.r < ROWS && t.c >= 0 && t.c < COLS) g[t.r][t.c] = t.kind;
  return g;
}

/* Every cell that sits in a run of three or more of the same kind, as "r,c". */
export function matchedCells(g: (number | null)[][]) {
  const hit = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    let run = 1;
    for (let c = 1; c <= COLS; c++) {
      if (c < COLS && g[r][c] !== null && g[r][c] === g[r][c - 1]) {
        run++;
      } else {
        if (run >= 3) for (let k = 1; k <= run; k++) hit.add(`${r},${c - k}`);
        run = 1;
      }
    }
  }
  for (let c = 0; c < COLS; c++) {
    let run = 1;
    for (let r = 1; r <= ROWS; r++) {
      if (r < ROWS && g[r][c] !== null && g[r][c] === g[r - 1][c]) {
        run++;
      } else {
        if (run >= 3) for (let k = 1; k <= run; k++) hit.add(`${r - k},${c}`);
        run = 1;
      }
    }
  }
  return hit;
}

export function matchedIds(tiles: Tile[]) {
  const cells = matchedCells(kindGrid(tiles));
  return tiles.filter((t) => !t.gone && cells.has(`${t.r},${t.c}`)).map((t) => t.id);
}

/* Whether any single swap of two neighbours would make a match. */
export function hasMove(tiles: Tile[]) {
  const g = kindGrid(tiles);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        const r2 = r + dr;
        const c2 = c + dc;
        if (r2 >= ROWS || c2 >= COLS) continue;
        const a = g[r][c];
        g[r][c] = g[r2][c2];
        g[r2][c2] = a;
        const found = matchedCells(g).size > 0;
        g[r2][c2] = g[r][c];
        g[r][c] = a;
        if (found) return true;
      }
    }
  }
  return false;
}

export function randomKind() {
  return Math.floor(Math.random() * KINDS);
}

/* A full board with no ready-made matches and at least one move to make. */
export function newBoard(nextId: () => number): Tile[] {
  for (;;) {
    const tiles: Tile[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let kind = randomKind();
        const left2 = c >= 2 && tiles[r * COLS + c - 1].kind === tiles[r * COLS + c - 2].kind ? tiles[r * COLS + c - 1].kind : -1;
        const up2 = r >= 2 && tiles[(r - 1) * COLS + c].kind === tiles[(r - 2) * COLS + c].kind ? tiles[(r - 1) * COLS + c].kind : -1;
        while (kind === left2 || kind === up2) kind = randomKind();
        tiles.push({ id: nextId(), kind, r, c });
      }
    }
    if (matchedIds(tiles).length === 0 && hasMove(tiles)) return tiles;
  }
}

/* After clearing: what is left drops to the bottom of its column, and new tiles
   fill the gaps from above. The new ones start above the board (negative rows)
   so the screen can slide them in. Returns the tiles at their start positions
   and at their final positions. */
export function settle(tiles: Tile[], nextId: () => number) {
  const start: Tile[] = [];
  const end: Tile[] = [];
  for (let c = 0; c < COLS; c++) {
    const column = tiles.filter((t) => !t.gone && t.c === c).sort((a, b) => b.r - a.r);
    column.forEach((t, i) => {
      const r = ROWS - 1 - i;
      start.push({ ...t, r });
      end.push({ ...t, r });
    });
    const missing = ROWS - column.length;
    for (let k = 0; k < missing; k++) {
      const kind = randomKind();
      const id = nextId();
      end.push({ id, kind, r: missing - 1 - k, c });
      start.push({ id, kind, r: -1 - k, c });
    }
  }
  return { start, end };
}
