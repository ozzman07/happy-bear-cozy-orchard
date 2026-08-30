/**
 * SpoilageSystem — raw harvested crops decay if they sit unsold too long.
 * Approximates per-batch freshness with one "since empty" timestamp per
 * resource type (see ResourceManager) rather than true per-unit aging —
 * cheap, and directionally correct: a pile that's been sitting untouched
 * for a while starts shrinking, a pile you're actively selling from never
 * empties long enough to trigger it.
 */
import { PERISHABLE_RESOURCES, SHELF_ROT_TICKS_NEEDED, SHELF_SPOILAGE_PCT_PER_TICK } from '../constants.js';

export class SpoilageSystem {
  constructor(resources) {
    this._res = resources;
    this._listeners = [];
  }

  /**
   * Call once per game tick. `active` is the caller's tier gate
   * (ECONOMY_PRESSURE_UNLOCK_TIER) — this system holds no tier state of
   * its own, matching how MarketSystem/StoreSystem take tier as a
   * per-call argument rather than caching it.
   */
  tick(currentTick, active) {
    if (!active) return [];
    const spoiled = [];
    for (const key of PERISHABLE_RESOURCES) {
      const since = this._res.sinceEmptyTick(key);
      if (since === undefined) continue;
      if (currentTick - since < SHELF_ROT_TICKS_NEEDED) continue;
      const stock = this._res.get(key);
      if (stock <= 0) continue;
      const lost = Math.min(stock, Math.max(1, Math.round(stock * SHELF_SPOILAGE_PCT_PER_TICK)));
      this._res.spend({ [key]: lost });
      spoiled.push({ key, amount: lost });
    }
    if (spoiled.length > 0) this._notify({ type: 'spoiled', spoiled });
    return spoiled;
  }

  /** Ticks remaining before `key` starts spoiling, or null if not applicable right now. */
  ticksUntilSpoil(key, currentTick, active) {
    if (!active || !PERISHABLE_RESOURCES.includes(key)) return null;
    const since = this._res.sinceEmptyTick(key);
    if (since === undefined) return null;
    return Math.max(0, SHELF_ROT_TICKS_NEEDED - (currentTick - since));
  }

  onChange(fn) { this._listeners.push(fn); }
  _notify(evt) { this._listeners.forEach(fn => fn(evt)); }
}
