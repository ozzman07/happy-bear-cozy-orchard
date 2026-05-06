/**
 * StoreSystem — handles selling resources for coins.
 */
import storeData from '../data/store.json';

export class StoreSystem {
  constructor(resources) {
    this._res       = resources;
    this._listeners = [];
    this._totalEarned = 0;
  }

  /** Return all store items visible at the given tier. */
  getItems(tier = 0) {
    return storeData.items.filter(item => item.tier <= tier);
  }

  /**
   * Sell `qty` of `key` resource. Returns { success, coins, message }.
   */
  sell(key, qty) {
    const item = storeData.items.find(i => i.key === key);
    if (!item) return { success: false, message: 'Unknown item.' };

    const have = this._res.get(key);
    if (have < 1) return { success: false, message: `No ${item.label} to sell!` };

    const amount = qty === 'all' ? have : Math.min(Number(qty), have);
    if (amount < 1) return { success: false, message: 'Nothing to sell.' };

    const coins = amount * item.price;
    this._res.spend({ [key]: amount });
    this._res.add('coins', coins);
    this._totalEarned += coins;

    this._notify({ key, amount, coins });
    return { success: true, coins, message: `Sold ${amount} ${item.label} for ${coins} 🪙!` };
  }

  get totalEarned() { return this._totalEarned; }

  onChange(fn) { this._listeners.push(fn); }
  _notify(evt)  { this._listeners.forEach(fn => fn(evt)); }
}
