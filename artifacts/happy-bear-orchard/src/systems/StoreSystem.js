/**
 * StoreSystem — handles selling resources for coins and buying equipment upgrades.
 */
import storeData    from '../data/store.json';
import upgradesData from '../data/upgrades.json';

export class StoreSystem {
  constructor(resources) {
    this._res              = resources;
    this._listeners        = [];
    this._totalEarned      = 0;
    this._purchased        = new Set();   // upgrade ids
    this._priceMultiplier  = 1.0;
  }

  /** Called by MarketSystem when market level changes. */
  setPriceMultiplier(mult) { this._priceMultiplier = mult; }

  // ── Selling ────────────────────────────────────────────────────────────────

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

    const coins = amount * Math.round(item.price * this._priceMultiplier);
    this._res.spend({ [key]: amount });
    this._res.add('coins', coins);
    this._totalEarned += coins;

    this._notify({ type: 'sell', key, amount, coins });
    return { success: true, coins, message: `Sold ${amount} ${item.label} for ${coins} 🪙!` };
  }

  get totalEarned() { return this._totalEarned; }

  // ── Upgrades ───────────────────────────────────────────────────────────────

  /** Return all upgrades visible at the given tier. */
  getUpgrades(tier = 0) {
    return upgradesData.upgrades.filter(u => u.unlockTier <= tier);
  }

  isPurchased(id) { return this._purchased.has(id); }

  /**
   * Buy an upgrade. Returns { success, message }.
   */
  buyUpgrade(id) {
    const upgrade = upgradesData.upgrades.find(u => u.id === id);
    if (!upgrade)                        return { success: false, message: 'Unknown upgrade.' };
    if (this._purchased.has(id))         return { success: false, message: 'Already purchased!' };
    if (upgrade.requires && !this._purchased.has(upgrade.requires)) {
      return { success: false, message: 'Requires previous upgrade first.' };
    }

    const coins = this._res.get('coins');
    if (coins < upgrade.coinCost) {
      return { success: false, message: `Need ${upgrade.coinCost} 🪙 (have ${coins}).` };
    }

    this._res.spend({ coins: upgrade.coinCost });
    this._purchased.add(id);
    const evt = upgrade.type === 'land'
      ? { type: 'land', id, zone: upgrade.zone }
      : { type: 'upgrade', id };
    this._notify(evt);
    return { success: true, message: `${upgrade.icon} ${upgrade.label} purchased!` };
  }

  /** Return zone ids for all purchased land expansions (for restore). */
  getUnlockedZones() {
    return upgradesData.upgrades
      .filter(u => u.type === 'land' && this._purchased.has(u.id))
      .map(u => u.zone);
  }

  /** Return all land upgrades visible at the given tier. */
  getLandUpgrades(tier = 0) {
    return upgradesData.upgrades.filter(u => u.type === 'land' && u.unlockTier <= tier);
  }

  /** Return all equipment upgrades visible at the given tier. */
  getUpgrades(tier = 0) {
    return upgradesData.upgrades.filter(u => !u.type && u.unlockTier <= tier);
  }

  /** Return all equipment upgrades that are locked (unlockTier > current tier). */
  getLockedUpgrades(tier = 0) {
    return upgradesData.upgrades.filter(u => !u.type && u.unlockTier > tier);
  }

  /** Look up an upgrade's label by id. */
  getUpgradeLabel(id) {
    return upgradesData.upgrades.find(u => u.id === id)?.label ?? id;
  }

  /**
   * Combined speed multiplier for a station (product of all purchased multipliers).
   * Returns 1.0 if no upgrades purchased.
   */
  getSpeedMultiplier(station) {
    let mult = 1;
    for (const u of upgradesData.upgrades) {
      if (!u.type && u.station === station && this._purchased.has(u.id)) {
        mult *= u.speedMultiplier;
      }
    }
    return mult;
  }

  // ── Persistence ────────────────────────────────────────────────────────────

  snapshot() { return [...this._purchased]; }

  restore(data) {
    if (!Array.isArray(data)) return;
    this._purchased = new Set(data);
  }

  onChange(fn) { this._listeners.push(fn); }
  _notify(evt)  { this._listeners.forEach(fn => fn(evt)); }
}
