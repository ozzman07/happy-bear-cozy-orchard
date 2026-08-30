/**
 * MarketSystem — market level upgrades and distribution deal contracts.
 */
import levelsData from '../data/market_levels.json';
import dealsData  from '../data/deals.json';
import { ECONOMY_PRESSURE_UNLOCK_TIER, DEMAND_DROP_PER_UNIT_SOLD, DEMAND_MIN_MULTIPLIER, DEMAND_RECOVERY_PER_DAY } from '../constants.js';

export class MarketSystem {
  constructor(resources) {
    this._res       = resources;
    this._level     = 1;
    this._deals     = {};   // dealId → DealState
    this._demand    = {};   // itemKey → current multiplier (0..1); absent = full price
    this._listeners = [];
  }

  // ── Supply-pressure demand ──────────────────────────────────────────────────

  /** Current demand multiplier for an item — 1.0 unless recent selling has pushed it down. */
  demandMultiplier(key) { return this._demand[key] ?? 1.0; }

  /**
   * Called by StoreSystem right after a sale. No-ops below the unlock tier
   * so early selling stays simple — tier gate lives here (not cached) to
   * match the rest of this class taking tier as a per-call argument.
   */
  recordSale(key, amount, tier) {
    if (tier < ECONOMY_PRESSURE_UNLOCK_TIER) return;
    const current = this.demandMultiplier(key);
    const next    = Math.max(DEMAND_MIN_MULTIPLIER, current - amount * DEMAND_DROP_PER_UNIT_SOLD);
    this._demand[key] = next;
  }

  // ── Market level ──────────────────────────────────────────────────────────────

  get level()           { return this._level; }
  get levelDef()        { return levelsData.levels.find(l => l.level === this._level); }
  get priceMultiplier() { return this.levelDef?.priceMultiplier ?? 1.0; }
  get dealSlots()       { return this.levelDef?.dealSlots ?? 0; }

  allLevels()    { return levelsData.levels; }
  getNextLevel() { return levelsData.levels.find(l => l.level === this._level + 1) ?? null; }

  canUpgrade(tier) {
    const next = this.getNextLevel();
    if (!next)               return { can: false, reason: 'Already at maximum market level.' };
    if (tier < next.unlockTier)
      return { can: false, reason: `Requires Tier ${next.unlockTier}.` };
    if (this._res.get('coins') < next.cost)
      return { can: false, reason: `Need ${next.cost} 🪙.` };
    return { can: true };
  }

  upgrade(tier) {
    const check = this.canUpgrade(tier);
    if (!check.can) return { success: false, message: check.reason };
    const next = this.getNextLevel();
    this._res.spend({ coins: next.cost });
    this._level = next.level;
    this._notify({ type: 'market_upgrade', level: next.level, def: next });
    return { success: true, message: `${next.icon} ${next.name} unlocked!` };
  }

  // ── Distribution deals ────────────────────────────────────────────────────────

  getAvailableDeals(tier) {
    return dealsData.deals.filter(d => d.unlockTier <= tier);
  }

  isDealActive(dealId) { return dealId in this._deals; }
  getDealState(dealId) { return this._deals[dealId] ?? null; }
  activeCount()        { return Object.keys(this._deals).length; }

  signDeal(dealId, currentDay) {
    const def = dealsData.deals.find(d => d.id === dealId);
    if (!def)                              return { success: false, message: 'Unknown deal.' };
    if (this.isDealActive(dealId))         return { success: false, message: 'Deal already active.' };
    if (this.activeCount() >= this.dealSlots)
      return { success: false, message: 'No deal slots available — upgrade your market.' };
    if (this._res.get('coins') < def.signOnFee)
      return { success: false, message: `Need ${def.signOnFee} 🪙 sign-on fee.` };

    this._res.spend({ coins: def.signOnFee });
    this._deals[dealId] = {
      startDay:        currentDay,
      nextDeadlineDay: currentDay + def.cycleDays,
      warningGiven:    false,
      paused:          false,
      pauseUntilDay:   null,
      missCount:       0,
    };
    this._notify({ type: 'deal_signed', dealId, def });
    return { success: true, message: `Deal signed with ${def.name}!` };
  }

  cancelDeal(dealId) {
    if (!this._deals[dealId]) return;
    const def = dealsData.deals.find(d => d.id === dealId);
    delete this._deals[dealId];
    this._notify({ type: 'deal_cancelled', dealId, def });
  }

  buyout(dealId, currentDay) {
    const def   = dealsData.deals.find(d => d.id === dealId);
    const state = this._deals[dealId];
    if (!def || !state || !state.paused) return { success: false, message: 'Deal is not paused.' };

    const cost = Math.round(def.quantity * def.contractPrice * 0.5);
    if (this._res.get('coins') < cost)
      return { success: false, message: `Need ${cost} 🪙 to settle.` };

    this._res.spend({ coins: cost });
    state.paused          = false;
    state.pauseUntilDay   = null;
    state.missCount       = 0;
    state.nextDeadlineDay = currentDay + def.cycleDays;
    this._notify({ type: 'deal_buyout', dealId, def, cost });
    return { success: true, cost, message: `Deal with ${def.name} reinstated.` };
  }

  // ── Daily tick — call once per new day ────────────────────────────────────────

  onNewDay(day) {
    const events = [];

    for (const [dealId, state] of Object.entries(this._deals)) {
      const def = dealsData.deals.find(d => d.id === dealId);
      if (!def) continue;

      // Unpause when pause period expires
      if (state.paused && state.pauseUntilDay && day >= state.pauseUntilDay) {
        state.paused          = false;
        state.pauseUntilDay   = null;
        state.missCount       = 0;
        state.nextDeadlineDay = day + def.cycleDays;
        state.warningGiven    = false;
        events.push({ type: 'deal_reactivated', dealId, def });
        continue;
      }

      if (state.paused) continue;

      // Warning: one day before deadline
      if (day === state.nextDeadlineDay - 1 && !state.warningGiven) {
        state.warningGiven = true;
        events.push({ type: 'deal_warning', dealId, def, deadline: state.nextDeadlineDay });
      }

      // Deadline reached
      if (day >= state.nextDeadlineDay) {
        state.warningGiven = false;
        const have = this._res.get(def.product);

        if (have >= def.quantity) {
          // Fulfilled
          this._res.spend({ [def.product]: def.quantity });
          const coins = def.quantity * def.contractPrice;
          this._res.add('coins', coins);
          state.missCount       = 0;
          state.nextDeadlineDay += def.cycleDays;
          events.push({ type: 'deal_fulfilled', dealId, def, coins });
        } else {
          // Missed
          state.missCount++;
          if (state.missCount >= 2) {
            // Second miss — cancel permanently
            delete this._deals[dealId];
            events.push({ type: 'deal_cancelled_permanent', dealId, def });
          } else {
            // First miss — pause 14 days
            const buyoutCost      = Math.round(def.quantity * def.contractPrice * 0.5);
            state.paused          = true;
            state.pauseUntilDay   = day + 14;
            state.nextDeadlineDay += def.cycleDays;
            events.push({ type: 'deal_missed', dealId, def, buyoutCost, pauseUntilDay: state.pauseUntilDay });
          }
        }
      }
    }

    // Demand recovery — every item that took a supply-pressure hit drifts
    // back toward full price by a fixed amount per day, regardless of tier
    // (an item can only have an entry here at all if recordSale already
    // passed the tier gate, so no separate check needed on the way back up).
    for (const key of Object.keys(this._demand)) {
      const next = this._demand[key] + DEMAND_RECOVERY_PER_DAY;
      if (next >= 1.0) delete this._demand[key];
      else this._demand[key] = next;
    }

    events.forEach(evt => this._notify(evt));
    return events;
  }

  // ── Persistence ───────────────────────────────────────────────────────────────

  snapshot() {
    return { level: this._level, deals: { ...this._deals }, demand: { ...this._demand } };
  }

  restore(data) {
    if (!data) return;
    this._level  = data.level  ?? 1;
    this._deals  = data.deals  ?? {};
    this._demand = data.demand ?? {};
  }

  onChange(fn) { this._listeners.push(fn); }
  _notify(evt) { this._listeners.forEach(fn => fn(evt)); }
}
