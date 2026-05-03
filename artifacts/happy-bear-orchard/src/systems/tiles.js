/**
 * Tile data model and grid management.
 * Moved from src/grid.js, simplified and decoupled from resources.
 */
import {
  GRID_SIZE, TILE_STATE, ACTION,
  ACTION_COSTS, ACTION_YIELDS, ACTION_VALID_STATES,
  GROW_TICKS_NEEDED, WATER_GROW_BONUS,
} from '../constants.js';

export class Tile {
  constructor(x, y, state = TILE_STATE.LOCKED) {
    this.x               = x;
    this.y               = y;
    this.state           = state;
    this.growTicks       = 0;
    this.growTicksNeeded = GROW_TICKS_NEEDED;
    this.watered         = false;
  }
}

export class TileGrid {
  constructor() {
    this.tiles      = [];
    this._listeners = [];
    this._init();
  }

  _init() {
    for (let y = 0; y < GRID_SIZE; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        let state = TILE_STATE.LOCKED;
        if (x === 5 && y === 5) {
          state = TILE_STATE.CLEARED;
        } else if (x >= 4 && x <= 6 && y >= 4 && y <= 6) {
          state = TILE_STATE.CLEARABLE;
        }
        this.tiles[y][x] = new Tile(x, y, state);
      }
    }
  }

  getTile(x, y) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null;
    return this.tiles[y][x];
  }

  canPerformAction(tile, action) {
    return ACTION_VALID_STATES[action]?.includes(tile.state) ?? false;
  }

  performAction(tile, action, resources) {
    if (!this.canPerformAction(tile, action)) {
      return { success: false, message: 'Cannot do that here.' };
    }
    const costs = ACTION_COSTS[action] ?? {};
    if (Object.keys(costs).length && !resources.canAfford(costs)) {
      return { success: false, message: 'Not enough resources!' };
    }
    resources.spend(costs);

    const yields = ACTION_YIELDS[action] ?? {};
    for (const [type, amt] of Object.entries(yields)) resources.add(type, amt);

    switch (action) {
      case ACTION.CLEAR:
        tile.state = TILE_STATE.CLEARED;
        this._unlockNeighbors(tile.x, tile.y);
        break;
      case ACTION.DIG:   tile.state = TILE_STATE.CLEARED; break;
      case ACTION.PLANT:
        tile.state           = TILE_STATE.PLANTED;
        tile.growTicks       = 0;
        tile.growTicksNeeded = GROW_TICKS_NEEDED;
        tile.watered         = false;
        break;
      case ACTION.WATER:
        tile.watered         = true;
        tile.growTicksNeeded = Math.max(1, tile.growTicksNeeded - WATER_GROW_BONUS);
        break;
      case ACTION.HARVEST:
        tile.state     = TILE_STATE.CLEARED;
        tile.growTicks = 0;
        tile.watered   = false;
        break;
      case ACTION.MINE:
        tile.state = TILE_STATE.CLEARED;
        break;
    }

    this._notify();
    return { success: true };
  }

  /** Advance crop growth; returns true if any tile became harvestable. */
  tick() {
    let anyRipe = false;
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const t = this.tiles[y][x];
        if (t.state === TILE_STATE.PLANTED) {
          t.growTicks++;
          if (t.growTicks >= t.growTicksNeeded) {
            t.state = TILE_STATE.HARVESTABLE;
            anyRipe = true;
          }
        }
      }
    }
    if (anyRipe) this._notify();
    return anyRipe;
  }

  _unlockNeighbors(x, y) {
    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const n = this.getTile(x + dx, y + dy);
      if (n && n.state === TILE_STATE.LOCKED) n.state = TILE_STATE.CLEARABLE;
    }
  }

  onChange(fn)  { this._listeners.push(fn); }
  _notify()     { this._listeners.forEach(fn => fn(this.tiles)); }
}
