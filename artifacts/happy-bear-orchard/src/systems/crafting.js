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

  /** Update the current tier so recipesFor() returns newly unlocked recipes. */
  setTier(tier) { this._gameState.tier = tier; }

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
      delete this._busySlots[stationId + '_start'];
      delete this._busySlots[stationId + '_end'];
      delete this._busySlots[stationId + '_recipe'];
      this._notify({ type: 'done', recipeId, stationId });
    };

    if (recipe.timerSecs > 0) {
      const speedMult = this._store?.getSpeedMultiplier(recipe.station) ?? 1;
      const timerMs   = recipe.timerSecs * 1000 * speedMult;

      this._busySlots[stationId] = true;
      this._busySlots[stationId + '_start'] = Date.now();
      this._busySlots[stationId + '_end'] = Date.now() + timerMs;
      this._busySlots[stationId + '_recipe'] = recipeId;
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

  snapshot() {
    // Save any stations that are currently mid-craft
    const active = {};
    for (const [k, v] of Object.entries(this._busySlots)) {
      if (v !== false) active[k] = v;
    }
    return Object.keys(active).length ? active : null;
  }

  restore(data) {
    if (!data) return;
    const now = Date.now();
    for (const [k, v] of Object.entries(data)) {
      this._busySlots[k] = v;
    }
    // Re-arm any timers that haven't expired yet; fire immediately if already past
    const stations = new Set(
      Object.keys(data).filter(k => !k.endsWith('_start') && !k.endsWith('_end') && !k.endsWith('_recipe') && data[k] === true)
    );
    for (const stationId of stations) {
      const end = data[stationId + '_end'];
      if (!end) continue;
      const remaining = end - now;
      const finish = () => {
        // Prefer the recipe id saved alongside this craft; older saves (before this was
        // tracked) fall back to guessing by station, which only works while every
        // station has exactly one recipe.
        const savedRecipeId = data[stationId + '_recipe'];
        const recipe = (savedRecipeId && this._recipes[savedRecipeId])
          ?? Object.values(this._recipes).find(r => r.station === stationId);
        if (recipe) {
          for (const [res, amt] of Object.entries(recipe.outputs)) {
            this._resources.add(res, amt);
          }
        }
        this._busySlots[stationId] = false;
        delete this._busySlots[stationId + '_start'];
        delete this._busySlots[stationId + '_end'];
        delete this._busySlots[stationId + '_recipe'];
        this._notify({ type: 'done', recipeId: recipe?.id ?? stationId, stationId });
      };
      if (remaining <= 0) finish();
      else setTimeout(finish, remaining);
    }
  }

  onChange(fn)  { this._listeners.push(fn); }
  _notify(evt)  { this._listeners.forEach(fn => fn(evt)); }
}
