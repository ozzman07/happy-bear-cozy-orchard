/**
 * AchievementSystem — evaluates permanent, profile-level milestones.
 * Unlocks persist on the player's ProfileSystem profile (not per-save), since
 * achievements track lifetime progress across all three orchard slots, not
 * any single playthrough.
 */
import achievementData from '../data/achievements.json';
import { ProfileSystem } from './ProfileSystem.js';

export class AchievementSystem {
  constructor() {
    this._listeners = [];
  }

  _entry(id) {
    return ProfileSystem.getSelectedProfile()?.achievements?.[id] ?? null;
  }

  /** All achievement defs with an `unlocked`/`unlockedAt` flag mixed in. */
  getAll() {
    return achievementData.achievements.map(a => {
      const entry = this._entry(a.id);
      return { ...a, unlocked: !!entry?.unlocked, unlockedAt: entry?.unlockedAt ?? null };
    });
  }

  get totalCount()    { return achievementData.achievements.length; }
  get unlockedCount()  { return achievementData.achievements.filter(a => this._entry(a.id)?.unlocked).length; }

  /** Evaluate every locked achievement against the current game state; unlock any that now qualify. */
  check(ctx) {
    const newlyUnlocked = [];
    for (const a of achievementData.achievements) {
      if (this._entry(a.id)?.unlocked) continue;
      if (this._meets(a.condition, ctx)) {
        ProfileSystem.unlockAchievement(a.id);
        newlyUnlocked.push(a);
      }
    }
    if (newlyUnlocked.length) this._notify(newlyUnlocked);
    return newlyUnlocked;
  }

  _meets(cond, ctx) {
    switch (cond.type) {
      case 'tier':        return ctx.tier >= cond.min;
      case 'day':         return ctx.day >= cond.min;
      case 'stat':        return (ctx.stats[cond.key] ?? 0) >= cond.min;
      case 'totalEarned': return ctx.totalEarned >= cond.min;
      case 'firstCraft':  return ctx.firstCrafts.has(cond.recipeId);
      case 'built':       return ctx.isOperational(cond.toolId);
      case 'allBuilt':    return cond.toolIds.every(t => ctx.isOperational(t));
      default:            return false;
    }
  }

  onChange(fn)  { this._listeners.push(fn); }
  _notify(list) { this._listeners.forEach(fn => fn(list)); }
}
