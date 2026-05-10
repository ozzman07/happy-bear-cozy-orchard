/**
 * QuestSystem — rolls 3 daily quests, tracks progress, handles reward claiming.
 */
import questData from '../data/quests.json';

export class QuestSystem {
  constructor(resources) {
    this._res       = resources;
    this._active    = [];   // { ...questDef, progress, claimed }
    this._dayTotals = {};   // type → cumulative count for today
    this._listeners = [];
  }

  /** Pick 3 quests from the pool filtered to current tier. */
  rollQuests(tier) {
    const pool     = questData.pool.filter(q => q.minTier <= tier);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    this._active    = shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, claimed: false }));
    this._dayTotals = {};
    this._notify({ type: 'rolled' });
  }

  /** Increment a progress counter. type: 'harvest' | 'craft' | 'sell_coins' | 'clear' */
  increment(type, amount = 1) {
    this._dayTotals[type] = (this._dayTotals[type] ?? 0) + amount;
    let changed = false;
    for (const q of this._active) {
      if (q.type !== type || q.claimed) continue;
      const prev = q.progress;
      q.progress = Math.min(q.target, this._dayTotals[type]);
      if (q.progress !== prev) changed = true;
      if (q.progress >= q.target) this._notify({ type: 'complete', questId: q.id });
    }
    if (changed) this._notify({ type: 'progress' });
  }

  /** Claim the coin reward for a completed quest. */
  claimReward(questId) {
    const q = this._active.find(q => q.id === questId);
    if (!q || q.claimed || q.progress < q.target) return { success: false };
    q.claimed = true;
    this._res.add('coins', q.reward);
    this._notify({ type: 'claimed', questId, reward: q.reward });
    return { success: true, reward: q.reward };
  }

  getActive()    { return this._active; }
  hasUnclaimed() { return this._active.some(q => q.progress >= q.target && !q.claimed); }

  onNewDay(tier) { this.rollQuests(tier); }

  snapshot() {
    return { active: this._active.map(q => ({ ...q })), dayTotals: { ...this._dayTotals } };
  }

  restore(data) {
    if (!data) return;
    this._active    = data.active    ?? [];
    this._dayTotals = data.dayTotals ?? {};
  }

  onChange(fn)  { this._listeners.push(fn); }
  _notify(evt)  { this._listeners.forEach(fn => fn(evt)); }
}
