/**
 * StoreSystem — handles selling resources for coins and buying equipment upgrades.
 */
import storeData    from '../data/store.json';
import upgradesData from '../data/upgrades.json';
import recipesData  from '../data/recipes.json';

// A resource that's consumed as input by a "bottling"-station recipe is, by
// definition, an unbottled flavor liquid (cider, autumn_hug, ...) — only its
// bottled output should ever be sellable. Derived from recipes.json instead
// of hand-maintained in store.json, so every future flavor gets this for
// free: add the crop + flavor + bottle recipes and the raw liquid is
// automatically excluded from the Market, no bookkeeping required.
const UNSELLABLE_UNBOTTLED = new Set(
  Object.values(recipesData)
    .filter(r => r.station === 'bottling')
    .flatMap(r => Object.keys(r.inputs))
);

export class StoreSystem {
  constructor(resources) {
    this._res              = resources;
    this._listeners        = [];
    this._totalEarned      = 0;
    this._purchased        = new Set();   // upgrade ids
    this._pausedAutomation = new Set();   // automation upgrade ids currently paused
    this._priceMultiplier  = 1.0;
  }

  /** Called by MarketSystem when market level changes. */
  setPriceMultiplier(mult) { this._priceMultiplier = mult; }

  // ── Selling ────────────────────────────────────────────────────────────────

  /** Return all store items visible at the given tier. */
  getItems(tier = 0) {
    return storeData.items.filter(item => item.tier <= tier && !UNSELLABLE_UNBOTTLED.has(item.key));
  }

  /**
   * Sell `qty` of `key` resource. Returns { success, coins, message }.
   */
  sell(key, qty) {
    if (UNSELLABLE_UNBOTTLED.has(key)) return { success: false, message: 'Bottle it first!' };
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

  /** The repeatable outpost-placement upgrade, if unlocked at this tier. */
  getOutpostDef(tier = 0) {
    const def = upgradesData.upgrades.find(u => u.type === 'outpost');
    return def && def.unlockTier <= tier ? def : null;
  }

  /**
   * Buy a placeable outpost — unlike other upgrades this is repeatable (no `purchased` flag).
   * Spends coins immediately; the caller is responsible for prompting tile placement.
   */
  buyOutpost(tier = 0) {
    const def = this.getOutpostDef(tier);
    if (!def) return { success: false, message: 'Not unlocked yet.' };
    const coins = this._res.get('coins');
    if (coins < def.coinCost) {
      return { success: false, message: `Need ${def.coinCost} 🪙 (have ${coins}).` };
    }
    this._res.spend({ coins: def.coinCost });
    this._notify({ type: 'outpost_purchased', def });
    return { success: true, message: `${def.icon} Outpost purchased — tap the right or bottom edge of the grid to grow the Orchard!` };
  }

  /** Return all equipment upgrades visible at the given tier. */
  getUpgrades(tier = 0) {
    return upgradesData.upgrades.filter(u => !u.type && u.unlockTier <= tier);
  }

  /** Return all equipment upgrades that are locked (unlockTier > current tier). */
  getLockedUpgrades(tier = 0) {
    return upgradesData.upgrades.filter(u => !u.type && u.unlockTier > tier);
  }

  /** Return automation upgrades available at current tier. */
  getAutomationUpgrades(tier = 0) {
    return upgradesData.upgrades.filter(u => u.type === 'automation' && u.unlockTier <= tier);
  }

  /** Return automation upgrades not yet unlocked. */
  getLockedAutomationUpgrades(tier = 0) {
    return upgradesData.upgrades.filter(u => u.type === 'automation' && u.unlockTier > tier);
  }

  /** True if the automation upgrade for a station is purchased AND not paused. */
  isAutomated(stationId) {
    const upg = upgradesData.upgrades.find(u => u.type === 'automation' && u.station === stationId);
    return upg ? (this._purchased.has(upg.id) && !this._pausedAutomation.has(upg.id)) : false;
  }

  isAutomationPaused(id) { return this._pausedAutomation.has(id); }

  /**
   * Pause or resume a purchased automation upgrade — doesn't un-purchase it, just
   * stops it from auto-restarting its station so the player can take manual control
   * (e.g. to stop Bottling from claiming cider the player wants to send to the Still).
   */
  toggleAutomation(id) {
    if (!this._purchased.has(id)) return { success: false, message: 'Not purchased yet.' };
    const paused = this._pausedAutomation.has(id);
    if (paused) this._pausedAutomation.delete(id);
    else        this._pausedAutomation.add(id);
    this._notify({ type: 'automation_toggled', id, paused: !paused });
    return { success: true, paused: !paused };
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

  snapshot() {
    return {
      purchased:        [...this._purchased],
      pausedAutomation: [...this._pausedAutomation],
      totalEarned:      this._totalEarned,
    };
  }

  restore(data) {
    if (!data) return;
    // support old saves that stored a plain array
    const arr = Array.isArray(data) ? data : (data.purchased ?? []);
    this._purchased        = new Set(arr);
    this._pausedAutomation = new Set(data.pausedAutomation ?? []);
    this._totalEarned      = data.totalEarned ?? 0;
  }

  onChange(fn) { this._listeners.push(fn); }
  _notify(evt)  { this._listeners.forEach(fn => fn(evt)); }
}
