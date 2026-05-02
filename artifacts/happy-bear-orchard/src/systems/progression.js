/**
 * ProgressionSystem — checks tier unlock conditions and advances tiers.
 */
import tiersRaw from '../data/progression.json';

export class ProgressionSystem {
  constructor(gameState, resources) {
    this._gameState = gameState;
    this._resources = resources;
    this._tiers     = tiersRaw.tiers;
    this._listeners = [];

    // Check on every resource change
    this._resources.onChange(() => this._check());
  }

  currentTier()  { return this._gameState.tier; }
  tierDef(n)     { return this._tiers[n] ?? null; }
  allTiers()     { return this._tiers; }
  isUnlocked(id) { return this._gameState.unlocks.has(id); }

  _check() {
    const next = this._gameState.tier + 1;
    const def  = this._tiers[next];
    if (!def) return;

    const cond = def.unlockCondition;
    const met  = Object.entries(cond).every(
      ([res, amt]) => this._resources.get(res) >= amt
    );
    if (!met) return;

    this._gameState.tier = next;
    for (const u of def.unlocks) this._gameState.unlocks.add(u);
    this._notify({ tier: next, def });
  }

  onChange(fn) { this._listeners.push(fn); }
  _notify(evt) { this._listeners.forEach(fn => fn(evt)); }
}
