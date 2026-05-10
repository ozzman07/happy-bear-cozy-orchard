/**
 * CraftingSystem — reads recipes.json and executes production steps.
 * Each recipe may have an optional timer; the caller gets a Promise.
 */
import recipesRaw from '../data/recipes.json';

export class CraftingSystem {
  constructor(resources, gameState) {
    this._resources  = resources;
    this._gameState  = gameState;
    this._recipes    = recipesRaw;
    this._busySlots  = {};   // stationId → bool
    this._store      = null; // set via setStore() after StoreSystem is created
    this._listeners  = [];
  }

  /** Wire in StoreSystem so crafting can apply purchased speed upgrades. */
  setStore(storeSystem) { this._store = storeSystem; }

  /** Return all recipes available on a given station at current tier. */
  recipesFor(stationId) {
    return Object.values(this._recipes).filter(r =>
      r.station === stationId &&
      r.unlockTier <= (this._gameState?.tier ?? 99)
    );
  }

  getRecipe(id) { return this._recipes[id] ?? null; }

  isBusy(stationId) { return !!this._busySlots[stationId]; }

  /**
   * Attempt to craft a recipe.
   * Returns { success, message } immediately.
   * If successful and the recipe has a timer, fires onChange when done.
   */
  craft(recipeId, stationId) {
    const recipe = this._recipes[recipeId];
    if (!recipe) return { success: false, message: 'Unknown recipe.' };
    if (this.isBusy(stationId)) return { success: false, message: 'Station is busy!' };
    if (!this._resources.canAfford(recipe.inputs)) {
      return { success: false, message: 'Not enough resources!' };
    }

    this._resources.spend(recipe.inputs);

    const finish = () => {
      for (const [res, amt] of Object.entries(recipe.outputs)) {
        this._resources.add(res, amt);
      }
      this._busySlots[stationId] = false;
      this._notify({ type: 'done', recipeId, stationId });
    };

    if (recipe.timerSecs > 0) {
      const speedMult = this._store?.getSpeedMultiplier(recipe.station) ?? 1;
      const timerMs   = recipe.timerSecs * 1000 * speedMult;

      this._busySlots[stationId] = true;
      this._busySlots[stationId + '_start'] = Date.now();
      this._busySlots[stationId + '_end'] = Date.now() + timerMs;
      this._notify({ type: 'started', recipeId, stationId });
      setTimeout(finish, timerMs);
    } else {
      finish();
    }

    return { success: true };
  }

  /** Seconds remaining on a station timer (0 if idle). */
  secsRemaining(stationId) {
    const end = this._busySlots[stationId + '_end'];
    if (!end) return 0;
    return Math.max(0, Math.ceil((end - Date.now()) / 1000));
  }

  /** Completion percentage 0-100 for a running craft timer. */
  progressPct(stationId) {
    const start = this._busySlots[stationId + '_start'];
    const end   = this._busySlots[stationId + '_end'];
    if (!start || !end) return 0;
    return Math.min(100, Math.round((Date.now() - start) / (end - start) * 100));
  }

  onChange(fn)  { this._listeners.push(fn); }
  _notify(evt)  { this._listeners.forEach(fn => fn(evt)); }
}
