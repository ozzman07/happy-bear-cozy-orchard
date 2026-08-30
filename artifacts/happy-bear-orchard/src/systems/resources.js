/**
 * ResourceManager — central store for all game resources.
 * Replaces the old src/resources.js.
 */
export class ResourceManager {
  constructor(initial = {}) {
    this.amounts = {
      coins:          0,
      wood:           5,
      stone:          3,
      fruit:          2,
      bottles:        0,
      juice:          0,
      cider:          0,
      hops:           0,
      applejack:      0,
      whiskey:        0,
      fruit_beer:     0,
      coffee_bean:    0,
      roasted_coffee: 0,
      cups:           0,
      cranberry:      0,
      autumn_hug:     0,
      bottled_autumn_hug: 0,
      blueberry:      0,
      cider_creek_blue: 0,
      bottled_cider_creek_blue: 0,
      ...initial,
    };
    // Tick number each resource type most recently went from 0 to >0 —
    // generic bookkeeping (no notion of "perishable" here), used by
    // SpoilageSystem to approximate "how long has this pile been sitting."
    // Only tracks the empty→nonzero transition, not every top-up: adding
    // one fresh apple to an existing pile doesn't reset the whole pile's
    // clock, or a player could refresh stale stock by harvesting one more.
    this._sinceEmptyTick = {};
    this._currentTick = 0;
    this._listeners = [];
  }

  get(type) { return this.amounts[type] ?? 0; }

  /** Call once per game tick, before any add()/spend() that tick. */
  setCurrentTick(tick) { this._currentTick = tick; }

  /** Tick the given type last went from 0 to >0, or undefined if currently empty/never set. */
  sinceEmptyTick(type) { return this._sinceEmptyTick[type]; }

  add(type, amount) {
    const prev = this.amounts[type] ?? 0;
    this.amounts[type] = prev + amount;
    if (prev <= 0 && this.amounts[type] > 0) this._sinceEmptyTick[type] = this._currentTick;
    this._notify();
  }

  canAfford(costs) {
    for (const [type, amount] of Object.entries(costs)) {
      if (this.get(type) < amount) return false;
    }
    return true;
  }

  spend(costs) {
    if (!this.canAfford(costs)) return false;
    for (const [type, amount] of Object.entries(costs)) {
      this.amounts[type] -= amount;
      if (this.amounts[type] <= 0) delete this._sinceEmptyTick[type];
    }
    this._notify();
    return true;
  }

  snapshot() { return { ...this.amounts, _sinceEmptyTick: { ...this._sinceEmptyTick } }; }

  restore(data) {
    if (!data) return;
    const { _sinceEmptyTick, ...amounts } = data;
    Object.assign(this.amounts, amounts);
    this._sinceEmptyTick = _sinceEmptyTick ?? {};
    this._notify();
  }

  onChange(fn) { this._listeners.push(fn); }
  _notify()    { this._listeners.forEach(fn => fn({ ...this.amounts })); }
}
