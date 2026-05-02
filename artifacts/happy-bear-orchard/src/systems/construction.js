/**
 * ConstructionSystem — manages building tools/stations.
 * Tools go through: blueprint → constructing → operational.
 */
export const BUILD_STATE = {
  BLUEPRINT:    'blueprint',
  CONSTRUCTING: 'constructing',
  OPERATIONAL:  'operational',
};

export class ConstructionSystem {
  constructor(resources) {
    this._resources = resources;
    this._tools     = {};   // toolId → { state, constructionEnd }
    this._listeners = [];

    setInterval(() => this._poll(), 500);
  }

  register(toolId, def) {
    if (!this._tools[toolId]) {
      this._tools[toolId] = { state: BUILD_STATE.BLUEPRINT, constructionEnd: null, def };
    }
  }

  getState(toolId) { return this._tools[toolId]?.state ?? BUILD_STATE.BLUEPRINT; }
  getDef(toolId)   { return this._tools[toolId]?.def ?? null; }
  isOperational(toolId) { return this.getState(toolId) === BUILD_STATE.OPERATIONAL; }

  build(toolId) {
    const entry = this._tools[toolId];
    if (!entry || entry.state !== BUILD_STATE.BLUEPRINT) {
      return { success: false, message: 'Cannot build this right now.' };
    }
    const { costs, constructionSecs } = entry.def;
    if (!this._resources.canAfford(costs)) {
      return { success: false, message: 'Not enough resources!' };
    }
    this._resources.spend(costs);
    entry.state           = BUILD_STATE.CONSTRUCTING;
    entry.constructionEnd = Date.now() + constructionSecs * 1000;
    this._notify({ type: 'started', toolId });
    return { success: true };
  }

  secsRemaining(toolId) {
    const entry = this._tools[toolId];
    if (!entry?.constructionEnd) return 0;
    return Math.max(0, Math.ceil((entry.constructionEnd - Date.now()) / 1000));
  }

  _poll() {
    let changed = false;
    for (const [toolId, entry] of Object.entries(this._tools)) {
      if (entry.state === BUILD_STATE.CONSTRUCTING &&
          entry.constructionEnd && Date.now() >= entry.constructionEnd) {
        entry.state           = BUILD_STATE.OPERATIONAL;
        entry.constructionEnd = null;
        this._notify({ type: 'ready', toolId });
        changed = true;
      }
    }
    if (changed) this._notify({ type: 'poll' });
  }

  /** Snapshot of all tool states for rendering. */
  snapshot() {
    return Object.fromEntries(
      Object.entries(this._tools).map(([id, e]) => [id, {
        state: e.state,
        secsLeft: e.constructionEnd
          ? Math.max(0, Math.ceil((e.constructionEnd - Date.now()) / 1000))
          : 0,
        def: e.def,
      }])
    );
  }

  onChange(fn) { this._listeners.push(fn); }
  _notify(evt) { this._listeners.forEach(fn => fn(evt)); }
}
