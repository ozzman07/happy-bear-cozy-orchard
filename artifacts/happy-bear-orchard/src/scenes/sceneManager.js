/**
 * SceneManager — switches between named scenes, wires nav buttons.
 */
export const SCENES = {
  ORCHARD:    'orchard',
  CABIN:      'cabin',
  DISTILLERY: 'distillery',
  BREWERY:    'brewery',
  ROASTERY:   'roastery',
  STORE:      'store',
};

export class SceneManager {
  constructor() {
    this._current   = SCENES.ORCHARD;
    this._handlers  = {};   // sceneName → { instance }
    this._listeners = [];
  }

  /** Register a scene instance against a name. */
  register(name, instance) {
    this._handlers[name] = instance;
  }

  current() { return this._current; }

  switchTo(name) {
    if (this._current === name) return;

    // Hide old
    document.getElementById(`scene-${this._current}`)
      ?.classList.remove('scene-active');

    this._current = name;

    // Show new
    const el = document.getElementById(`scene-${name}`);
    if (el) el.classList.add('scene-active');

    // Call lifecycle hook
    this._handlers[name]?.onEnter?.();

    // Update nav buttons
    this._syncNavButtons();
    this._listeners.forEach(fn => fn(name));
  }

  _syncNavButtons() {
    document.querySelectorAll('[data-scene-target]').forEach(btn => {
      const target = btn.dataset.sceneTarget;
      btn.classList.toggle('nav-btn-active', target === this._current);
    });
  }

  /** Route a game-loop tick to the active scene. */
  onTick(ripened) { this._handlers[this._current]?.onTick?.(ripened); }

  /** Route a new-day event to the active scene. */
  onNewDay(day)   { this._handlers[this._current]?.onNewDay?.(day); }

  onChange(fn) { this._listeners.push(fn); }
}
