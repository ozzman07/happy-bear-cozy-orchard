import { RESOURCE } from './constants.js';

export class ResourceManager {
  constructor() {
    this.amounts = {
      [RESOURCE.WOOD]:  10,
      [RESOURCE.STONE]: 5,
      [RESOURCE.FRUIT]: 2,
      [RESOURCE.CUPS]:  0,
    };
    this._listeners = [];
  }

  get(type) {
    return this.amounts[type] ?? 0;
  }

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

  onChange(fn) {
    this._listeners.push(fn);
  }

  _notify() {
    this._listeners.forEach(fn => fn(this.amounts));
  }
}
