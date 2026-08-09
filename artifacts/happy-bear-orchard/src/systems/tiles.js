/**
 * Tile data model and grid management.
 * Moved from src/grid.js, simplified and decoupled from resources.
 */
import {
  GRID_SIZE, TILE_STATE, TILE_TYPE, ACTION,
  ACTION_COSTS, ACTION_YIELDS, ACTION_VALID_STATES,
  GROW_TICKS_NEEDED, WATER_GROW_BONUS, MINE_SECS, MINE_YIELD,
  ROT_TICKS_NEEDED, MAX_GRID_DIMENSION,
} from '../constants.js';
import { CROPS } from './crops.js';

// ── Zone definitions ──────────────────────────────────────────────────────────
// Each zone is a rectangular region that unlocks as a group when a tier is reached.
// Gap tiles between zones are permanently locked so adjacency can't bridge zones.
export const ZONE_DEFS = {
  start:       { rowMin: 3, rowMax: 6, colMin: 3, colMax: 6 }, // always active
  east:        { rowMin: 3, rowMax: 6, colMin: 8, colMax: 9 }, // Tier 1 (auto)
  north:       { rowMin: 0, rowMax: 1, colMin: 0, colMax: 9 }, // Tier 2 (auto)
  west:        { rowMin: 3, rowMax: 6, colMin: 0, colMax: 1 }, // Tier 3 (auto)
  south_west:  { rowMin: 8, rowMax: 9, colMin: 0, colMax: 4 }, // Tier 4 (purchasable — Hop Fields)
  south_east:  { rowMin: 8, rowMax: 9, colMin: 5, colMax: 9 }, // Tier 5 (purchasable — Coffee Grove)
};

export const ZONE_NAMES = {
  east:       'East Fields',
  north:      'Northern Slopes',
  west:       'Western Grove',
  south_west: 'Hop Fields',
  south_east: 'Coffee Grove',
};

function inZone(x, y, zone) {
  return y >= zone.rowMin && y <= zone.rowMax && x >= zone.colMin && x <= zone.colMax;
}

// Gap tiles permanently separate zones — adjacency unlock skips them.
function isGapTile(x, y) {
  if (y === 2 || y === 7) return true;                         // horizontal dividers
  if ((x === 2 || x === 7) && y >= 3 && y <= 6) return true;  // vertical dividers
  return false;
}

export class Tile {
  constructor(x, y, state = TILE_STATE.LOCKED, tileType = TILE_TYPE.GRASS) {
    this.x               = x;
    this.y               = y;
    this.state           = state;
    this.tileType        = tileType;
    this.growTicks       = 0;
    this.growTicksNeeded = GROW_TICKS_NEEDED;
    this.watered         = false;
    this.permanent       = false; // true → never unlocks via adjacency
    this.miningEnd       = null;  // timestamp when current mine completes
    this.miningStart     = null;  // timestamp when mine started (for progress %)
    this.rotTicks        = 0;     // ticks spent in HARVESTABLE state without harvest
    this.cropType        = 'apple'; // 'apple' | 'timber'
  }
}

export class TileGrid {
  constructor() {
    this.cols            = GRID_SIZE;
    this.rows            = GRID_SIZE;
    this.tiles           = [];
    this._listeners      = [];
    this._resizeListeners = [];
    this._init();
  }

  _init() {
    for (let y = 0; y < this.rows; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.cols; x++) {
        const tile = new Tile(x, y, TILE_STATE.LOCKED);

        if (isGapTile(x, y)) {
          tile.permanent = true;
        } else if (inZone(x, y, ZONE_DEFS.start)) {
          // Starter tiles
          if      (x === 5 && y === 5) tile.state = TILE_STATE.HARVESTABLE;
          else if (x === 4 && y === 5) tile.state = TILE_STATE.PLANTED;
          else                         tile.state = TILE_STATE.CLEARABLE;
        }
        // All other zones remain LOCKED until unlockZone() is called.

        this.tiles[y][x] = tile;
      }
    }
  }

  /**
   * Grow the board outward by `amount` fresh LOCKED columns on the right edge.
   * Existing coordinates never shift, so saves stay valid. Returns false if
   * already at MAX_GRID_DIMENSION (no-op) or amount <= 0.
   */
  growRight(amount) {
    if (amount <= 0 || this.cols >= MAX_GRID_DIMENSION) return false;
    const oldCols = this.cols;
    const newCols = Math.min(this.cols + amount, MAX_GRID_DIMENSION);
    for (let y = 0; y < this.rows; y++) {
      for (let x = oldCols; x < newCols; x++) {
        this.tiles[y][x] = new Tile(x, y, TILE_STATE.LOCKED);
      }
    }
    this.cols = newCols;
    // The new column bordering already-developed ground opens immediately —
    // the rest of the fresh land unlocks progressively via adjacency as usual.
    for (let y = 0; y < this.rows; y++) {
      const border = this.tiles[y][oldCols - 1];
      const fresh   = this.tiles[y][oldCols];
      if (border && fresh && border.state !== TILE_STATE.LOCKED && !fresh.permanent) {
        fresh.state = TILE_STATE.CLEARABLE;
      }
    }
    this._resizeListeners.forEach(fn => fn());
    this._notify();
    return true;
  }

  /**
   * Grow the board outward by `amount` fresh LOCKED rows on the bottom edge.
   * Existing coordinates never shift, so saves stay valid. Returns false if
   * already at MAX_GRID_DIMENSION (no-op) or amount <= 0.
   */
  growBottom(amount) {
    if (amount <= 0 || this.rows >= MAX_GRID_DIMENSION) return false;
    const oldRows = this.rows;
    const newRows = Math.min(this.rows + amount, MAX_GRID_DIMENSION);
    for (let y = oldRows; y < newRows; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.cols; x++) {
        this.tiles[y][x] = new Tile(x, y, TILE_STATE.LOCKED);
      }
    }
    this.rows = newRows;
    // The new row bordering already-developed ground opens immediately —
    // the rest of the fresh land unlocks progressively via adjacency as usual.
    for (let x = 0; x < this.cols; x++) {
      const border = this.tiles[oldRows - 1][x];
      const fresh   = this.tiles[oldRows][x];
      if (border && fresh && border.state !== TILE_STATE.LOCKED && !fresh.permanent) {
        fresh.state = TILE_STATE.CLEARABLE;
      }
    }
    this._resizeListeners.forEach(fn => fn());
    this._notify();
    return true;
  }

  /**
   * Grow both edges as needed to reach a newSize×newSize square — used by tier
   * progression, which always grows the board uniformly. No-op on any edge
   * that's already at least newSize.
   */
  resize(newSize) {
    this.growRight(newSize - this.cols);
    this.growBottom(newSize - this.rows);
  }

  onResize(fn) { this._resizeListeners.push(fn); }

  /** Make every tile in a named zone CLEARABLE (no-op if already past LOCKED). */
  unlockZone(zoneId) {
    const zone = ZONE_DEFS[zoneId];
    if (!zone) return;
    for (let y = zone.rowMin; y <= zone.rowMax; y++) {
      for (let x = zone.colMin; x <= zone.colMax; x++) {
        const tile = this.tiles[y][x];
        if (tile && tile.state === TILE_STATE.LOCKED && !tile.permanent) {
          tile.state = TILE_STATE.CLEARABLE;
        }
      }
    }
    this._notify();
  }

  getTile(x, y) {
    if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return null;
    return this.tiles[y][x];
  }

  canPerformAction(tile, action) {
    return ACTION_VALID_STATES[action]?.includes(tile.state) ?? false;
  }

  performAction(tile, action, resources, cropId = 'apple') {
    if (!this.canPerformAction(tile, action)) {
      return { success: false, message: 'Cannot do that here.' };
    }
    const crop  = CROPS[cropId];
    const costs = (action === ACTION.PLANT)
      ? (crop?.plantCost ?? ACTION_COSTS[action] ?? {})
      : (ACTION_COSTS[action] ?? {});
    if (Object.keys(costs).length && !resources.canAfford(costs)) {
      return { success: false, message: 'Not enough resources!' };
    }
    resources.spend(costs);

    // CLEAR only yields wood when removing natural overgrowth, not when resetting a farm or mine
    // HARVEST yield comes from the tile's crop data (fruit, hops, coffee beans, wood, ...)
    let yields = (action === ACTION.CLEAR && tile.state !== TILE_STATE.CLEARABLE)
      ? {}
      : (ACTION_YIELDS[action] ?? {});
    if (action === ACTION.HARVEST && CROPS[tile.cropType]) {
      yields = CROPS[tile.cropType].yields;
    }
    for (const [type, amt] of Object.entries(yields)) resources.add(type, amt);

    switch (action) {
      case ACTION.CLEAR:
        tile.state = TILE_STATE.CLEARED;
        this._unlockNeighbors(tile.x, tile.y);
        break;
      case ACTION.DIG:   tile.state = TILE_STATE.CLEARED; break;
      case ACTION.PLANT:
        tile.state           = TILE_STATE.PLANTED;
        tile.cropType        = crop ? cropId : 'apple';
        tile.growTicks       = 0;
        tile.growTicksNeeded = crop?.growTicks ?? GROW_TICKS_NEEDED;
        tile.watered         = false;
        break;
      case ACTION.WATER:
        tile.watered         = true;
        tile.growTicksNeeded = Math.max(1, tile.growTicksNeeded - WATER_GROW_BONUS);
        break;
      case ACTION.HARVEST:
        // Farm tiles stay in the growth cycle — auto-replant after harvest
        tile.state           = TILE_STATE.PLANTED;
        tile.growTicks       = 0;
        tile.growTicksNeeded = CROPS[tile.cropType]?.growTicks ?? GROW_TICKS_NEEDED;
        tile.watered         = false;
        tile.rotTicks        = 0;
        break;
      case ACTION.COMPOST:
        // Rotted apple — compost back into a fresh planting at no cost
        tile.state           = TILE_STATE.PLANTED;
        tile.growTicks       = 0;
        tile.growTicksNeeded = GROW_TICKS_NEEDED;
        tile.watered         = false;
        tile.rotTicks        = 0;
        break;
      case ACTION.MINE:
        tile.state        = TILE_STATE.MINING;
        tile.miningStart  = Date.now();
        tile.miningEnd    = Date.now() + MINE_SECS * 1000;
        break;
    }

    this._notify();
    return { success: true };
  }

  /** Advance crop growth and rot. Returns {anyRipe, rotted:[{x,y}]}. */
  tick() {
    let anyRipe = false;
    const rotted = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const t = this.tiles[y][x];
        if (t.state === TILE_STATE.PLANTED) {
          t.growTicks++;
          if (t.growTicks >= t.growTicksNeeded) {
            t.state    = TILE_STATE.HARVESTABLE;
            t.rotTicks = 0;
            anyRipe    = true;
          }
        } else if (t.state === TILE_STATE.HARVESTABLE && t.cropType !== 'timber') {
          t.rotTicks++;
          if (t.rotTicks >= ROT_TICKS_NEEDED) {
            t.state    = TILE_STATE.ROTTED;
            t.rotTicks = 0;
            rotted.push({ x, y });
          }
        }
      }
    }
    if (anyRipe || rotted.length) this._notify();
    return { anyRipe, rotted };
  }

  /** Check for completed mine timers; award stone and flip to MINE_SHAFT. Returns count. */
  completeMines(resources) {
    let count = 0;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const t = this.tiles[y][x];
        if (t.state === TILE_STATE.MINING && t.miningEnd && Date.now() >= t.miningEnd) {
          t.state        = TILE_STATE.MINE_SHAFT;
          t.miningEnd    = null;
          t.miningStart  = null;
          for (const [res, amt] of Object.entries(MINE_YIELD)) resources.add(res, amt);
          count++;
        }
      }
    }
    if (count) this._notify();
    return count;
  }

  _unlockNeighbors(x, y) {
    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const n = this.getTile(x + dx, y + dy);
      if (n && n.state === TILE_STATE.LOCKED && !n.permanent) n.state = TILE_STATE.CLEARABLE;
    }
  }

  snapshot() {
    return this.tiles.map(row => row.map(t => ({
      state:           t.state,
      tileType:        t.tileType,
      cropType:        t.cropType,
      growTicks:       t.growTicks,
      growTicksNeeded: t.growTicksNeeded,
      watered:         t.watered,
      permanent:       t.permanent,
      rotTicks:        t.rotTicks,
    })));
  }

  restore(data) {
    if (!data) return;
    for (let y = 0; y < data.length; y++) {
      for (let x = 0; x < (data[y]?.length ?? 0); x++) {
        const saved = data[y][x];
        const tile  = this.tiles[y]?.[x];
        if (!tile || !saved) continue;
        // MINING tiles that timed out while away become MINE_SHAFT on restore
        tile.state           = (saved.state === TILE_STATE.MINING) ? TILE_STATE.MINE_SHAFT : saved.state;
        tile.tileType        = saved.tileType        ?? tile.tileType;
        tile.growTicks       = saved.growTicks       ?? 0;
        tile.growTicksNeeded = saved.growTicksNeeded ?? GROW_TICKS_NEEDED;
        tile.watered         = saved.watered         ?? false;
        tile.permanent       = saved.permanent       ?? false;
        tile.rotTicks        = saved.rotTicks        ?? 0;
        tile.cropType        = saved.cropType        ?? 'apple';
        tile.miningEnd       = null; // don't restore timers; mine completes fresh
      }
    }
    this._notify();
  }

  /** Harvest every ripe tile; silently compost any rotted tiles. Returns harvested [{x,y}]. */
  autoHarvest(resources) {
    const harvested = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const tile = this.tiles[y][x];
        if (tile.state === TILE_STATE.HARVESTABLE) {
          this.performAction(tile, ACTION.HARVEST, resources);
          harvested.push({ x, y });
        } else if (tile.state === TILE_STATE.ROTTED) {
          this.performAction(tile, ACTION.COMPOST, resources);
        }
      }
    }
    return harvested;
  }

  /** Start mining on all idle mine shafts. Returns number started. */
  autoMine(resources) {
    let count = 0;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const tile = this.tiles[y][x];
        if (tile.state === TILE_STATE.MINE_SHAFT) {
          this.performAction(tile, ACTION.MINE, resources);
          count++;
        }
      }
    }
    return count;
  }

  /** Water every planted tile. Returns number watered. */
  autoWater(resources) {
    let count = 0;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const tile = this.tiles[y][x];
        if (tile.state === TILE_STATE.PLANTED && !tile.watered) {
          this.performAction(tile, ACTION.WATER, resources);
          count++;
        }
      }
    }
    return count;
  }

  /** Plant every cleared soil tile (costs 1 fruit each). Returns number planted. */
  autoPlant(resources) {
    let count = 0;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const tile = this.tiles[y][x];
        if (tile.state === TILE_STATE.CLEARED && resources.canAfford(ACTION_COSTS[ACTION.PLANT] ?? {})) {
          this.performAction(tile, ACTION.PLANT, resources);
          count++;
        }
      }
    }
    return count;
  }

  onChange(fn)  { this._listeners.push(fn); }
  _notify()     { this._listeners.forEach(fn => fn(this.tiles)); }
}
