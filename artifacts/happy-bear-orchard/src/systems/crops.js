/**
 * CropSystem — wraps TileGrid with crop-type awareness.
 */
import cropsData from '../data/crops.json';

export const CROPS = cropsData;

export class CropSystem {
  constructor(tileGrid) {
    this._grid = tileGrid;
  }

  tick() { return this._grid.tick(); }

  getCrop(id) { return CROPS[id] ?? null; }

  /** Crops plantable at or before the given tier, in unlockTier order. */
  getAvailable(tier) {
    return Object.values(CROPS)
      .filter(c => c.unlockTier <= tier)
      .sort((a, b) => a.unlockTier - b.unlockTier);
  }
}
