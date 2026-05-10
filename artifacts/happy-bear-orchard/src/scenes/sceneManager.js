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
    this._handlers  = {};
    this._listeners = [];
  }

  register(name, instance) {
    this._handlers[name] = instance;
  }

  current() { return this._current; }

  switchTo(name) {
    if (this._current === name) return;

    // Fade out the leaving scene
    const outEl = document.getElementById(`scene-${this._current}`);
    if (outEl) {
      outEl.classList.add('scene-leaving');
      outEl.classList.remove('scene-active');
      setTimeout(() => outEl.classList.remove('scene-leaving'), 240);
    }

    this._current = name;
    this.clearBadge(name);

    // Fade in the entering scene
    const el = document.getElementById(`scene-${name}`);
    if (el) el.classList.add('scene-active');

    this._handlers[name]?.onEnter?.();
    this._syncNavButtons();
    this._listeners.forEach(fn => fn(name));
  }

  // ── Badge API ───────────────────────────────────────────────────────────

  setBadge(scene, text = '!') {
    if (scene === this._current) return; // no badge on active scene
    const btn = document.querySelector(`[data-scene-target="${scene}"]`);
    const badge = btn?.querySelector('.nav-badge');
    if (!badge) return;
    badge.textContent = text;
    badge.classList.remove('hidden');
  }

  clearBadge(scene) {
    const btn = document.querySelector(`[data-scene-target="${scene}"]`);
    const badge = btn?.querySelector('.nav-badge');
    if (badge) badge.classList.add('hidden');
  }

  _syncNavButtons() {
    document.querySelectorAll('[data-scene-target]').forEach(btn => {
      const target = btn.dataset.sceneTarget;
      btn.classList.toggle('nav-btn-active', target === this._current);
    });
  }

  onTick(ripened) { this._handlers[this._current]?.onTick?.(ripened); }
  onNewDay(day)   { this._handlers[this._current]?.onNewDay?.(day); }
  onChange(fn)    { this._listeners.push(fn); }
}
