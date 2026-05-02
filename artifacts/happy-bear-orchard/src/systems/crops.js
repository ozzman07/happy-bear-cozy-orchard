/**
 * CropSystem — wraps TileGrid with crop-type awareness.
 * Currently a thin wrapper; expand later for multi-crop support.
 */
export class CropSystem {
  constructor(tileGrid) {
    this._grid = tileGrid;
  }

  tick() { return this._grid.tick(); }
}
