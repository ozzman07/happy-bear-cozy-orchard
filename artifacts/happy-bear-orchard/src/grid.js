import {
  GRID_SIZE,
  TILE_STATE,
  ACTION,
  ACTION_COSTS,
  ACTION_YIELDS,
  ACTION_VALID_STATES,
  GROW_TICKS_NEEDED,
  WATER_GROW_BONUS,
} from './constants.js';

export class Tile {
  constructor(x, y, state = TILE_STATE.LOCKED) {
    this.x = x;
    this.y = y;
    this.state = state;
    this.growTicks = 0;
    this.growTicksNeeded = GROW_TICKS_NEEDED;
    this.watered = false;
  }
}

export class Grid {
  constructor() {
    this.tiles = [];
    this._listeners = [];
    this._init();
  }

  _init() {
    for (let y = 0; y < GRID_SIZE; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const cx = 4, cy = 4;
        const dist = Math.max(Math.abs(x - cx), Math.abs(y - cy));
        let state;
        if (x >= 4 && x <= 5 && y >= 4 && y <= 5) {
          state = TILE_STATE.CLEARED;
        } else if (dist <= 2) {
          state = TILE_STATE.CLEARABLE;
        } else if (dist === 3) {
          state = TILE_STATE.LOCKED;
        } else {
          state = TILE_STATE.LOCKED;
        }
        this.tiles[y][x] = new Tile(x, y, state);
      }
    }
    // Unlock the ring right outside the cleared centre
    for (let y = 3; y <= 6; y++) {
      for (let x = 3; x <= 6; x++) {
        if (this.tiles[y][x].state === TILE_STATE.LOCKED) {
          this.tiles[y][x].state = TILE_STATE.CLEARABLE;
        }
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
    if (Object.keys(costs).length > 0 && !resources.canAfford(costs)) {
      return { success: false, message: 'Not enough resources!' };
    }
    resources.spend(costs);

    const yields = ACTION_YIELDS[action] ?? {};
    for (const [type, amount] of Object.entries(yields)) {
      resources.add(type, amount);
    }

    switch (action) {
      case ACTION.CLEAR:
        tile.state = TILE_STATE.CLEARED;
        this._unlockNeighbors(tile.x, tile.y);
        break;
      case ACTION.DIG:
        tile.state = TILE_STATE.CLEARED;
        break;
      case ACTION.PLANT:
        tile.state = TILE_STATE.PLANTED;
        tile.growTicks = 0;
        tile.growTicksNeeded = GROW_TICKS_NEEDED;
        tile.watered = false;
        break;
      case ACTION.WATER:
        tile.watered = true;
        tile.growTicksNeeded = Math.max(1, tile.growTicksNeeded - WATER_GROW_BONUS);
        break;
      case ACTION.HARVEST:
        tile.state = TILE_STATE.CLEARED;
        tile.growTicks = 0;
        tile.watered = false;
        break;
    }

    this._notify();
    return { success: true };
  }

  tick() {
    let anyRipe = false;
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const tile = this.tiles[y][x];
        if (tile.state === TILE_STATE.PLANTED) {
          tile.growTicks++;
          if (tile.growTicks >= tile.growTicksNeeded) {
            tile.state = TILE_STATE.HARVESTABLE;
            anyRipe = true;
          }
        }
      }
    }
    if (anyRipe) this._notify();
    return anyRipe;
  }

  _unlockNeighbors(x, y) {
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dx, dy] of dirs) {
      const n = this.getTile(x + dx, y + dy);
      if (n && n.state === TILE_STATE.LOCKED) {
        n.state = TILE_STATE.CLEARABLE;
      }
    }
  }

  onChange(fn) {
    this._listeners.push(fn);
  }

  _notify() {
    this._listeners.forEach(fn => fn(this.tiles));
  }
}
