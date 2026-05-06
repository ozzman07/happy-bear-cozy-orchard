/**
 * ResourceManager — central store for all game resources.
 * Replaces the old src/resources.js.
 */
export class ResourceManager {
  constructor(initial = {}) {
    this.amounts = {
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
      ...initial,
    };
    this._listeners = [];
  }

  get(type) { return this.amounts[type] ?? 0; }

  add(type, amount) {
    this.amounts[type] = (this.amounts[type] ?? 0) + amount;
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
    }
    this._notify();
    return true;
  }

  onChange(fn) { this._listeners.push(fn); }
  _notify()    { this._listeners.forEach(fn => fn({ ...this.amounts })); }
}
