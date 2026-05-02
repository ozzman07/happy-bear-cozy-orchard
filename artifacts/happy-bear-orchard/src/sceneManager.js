import { SCENE } from './constants.js';

export class SceneManager {
  constructor() {
    this._current   = SCENE.ORCHARD;
    this._scenes    = {};
    this._listeners = [];
  }

  /** Call after DOM is ready. */
  init() {
    this._scenes[SCENE.ORCHARD] = document.getElementById('scene-orchard');
    this._scenes[SCENE.CABIN]   = document.getElementById('scene-cabin');
    this._apply();
  }

  current() { return this._current; }

  switchTo(sceneName) {
    if (this._current === sceneName) return;
    this._current = sceneName;
    this._apply();
    this._listeners.forEach(fn => fn(sceneName));
  }

  onChange(fn) {
    this._listeners.push(fn);
  }

  _apply() {
    for (const [name, el] of Object.entries(this._scenes)) {
      if (!el) continue;
      el.classList.toggle('scene-active', name === this._current);
    }
  }
}
