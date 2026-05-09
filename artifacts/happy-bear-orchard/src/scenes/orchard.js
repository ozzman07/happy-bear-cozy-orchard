/**
 * OrchardScene — renders and manages the 10×10 tile grid.
 */
import { GRID_SIZE, TILE_STATE, TILE_TYPE, TILE_VISUAL } from '../constants.js';
import { BearDialogue } from '../systems/BearDialogue.js';


export class OrchardScene {
  constructor({ tileGrid, resources, actionMenu, statusEl, bearEl, speechEl }) {
    this._grid      = tileGrid;
    this._resources = resources;
    this._menu      = actionMenu;
    this._statusEl  = statusEl;
    this._bearEl    = bearEl;
    this._speechEl  = speechEl;
    this._tileEls   = [];
    this._speechTmr = null;
  }

  /** Build the grid DOM. Call once after mount. */
  init() {
    const gridEl = document.getElementById('grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';
    this._tileEls    = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      this._tileEls[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const el       = document.createElement('div');
        el.className   = 'tile';
        el.dataset.x   = x;
        el.dataset.y   = y;
        el.addEventListener('click', () =>
          this._menu.show(this._grid.tiles[y][x], this._resources)
        );
        gridEl.appendChild(el);
        this._tileEls[y][x] = el;
        this._renderTile(this._grid.tiles[y][x], el);
      }
    }

    // React to grid changes
    this._grid.onChange(tiles => this._updateAllTiles(tiles));

    // Show welcome modal
    this._showWelcomeModal();
  }

  _showWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    modal.classList.remove('hidden');
    const closeBtn = document.getElementById('close-welcome');
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  onEnter() {
    const tip = BearDialogue.sceneGreeting('orchard');
    this.setStatus('Back in the orchard! 🌿');
    if (tip) this.bearSpeak(tip);
  }

  onTick(ripened) {
    if (ripened) {
      this.bearSpeak('Your crops are ready to harvest! 🍎');
      this.setStatus('Some plants are ready to harvest — click them!');
    }
  }

  onNewDay() { this.bearSpeak(BearDialogue.sceneGreeting('orchard')); }

  // ── Rendering ──────────────────────────────────────────────────────────────

  _updateAllTiles(tiles) {
    for (let y = 0; y < GRID_SIZE; y++)
      for (let x = 0; x < GRID_SIZE; x++)
        this._renderTile(tiles[y][x], this._tileEls[y]?.[x]);
  }

  _renderTile(tile, el) {
    if (!el) return;
    let v = TILE_VISUAL[tile.state];
    // CLEARABLE has sub-types keyed by tileType — resolve to the right visual
    if (v && !v.color) v = v[tile.tileType] ?? v[TILE_TYPE.GRASS] ?? Object.values(v)[0];
    if (!v) return;
    el.className     = `tile tile-${tile.state}`;
    el.style.background = v.color;
    el.textContent   = v.emoji;
    el.title         = v.label;

    if (tile.state === TILE_STATE.PLANTED) {
      const pct = Math.min(100, Math.round((tile.growTicks / tile.growTicksNeeded) * 100));
      el.style.setProperty('--grow-pct', pct + '%');
      el.classList.add('growing');
    } else {
      el.style.removeProperty('--grow-pct');
    }
  }

  // ── Bear speech ────────────────────────────────────────────────────────────

  bearSpeak(msg) {
    if (!this._speechEl) return;
    if (this._speechTmr) clearTimeout(this._speechTmr);
    this._speechEl.textContent = msg;
    this._speechEl.classList.remove('hidden');
    this._speechTmr = setTimeout(() => this._speechEl.classList.add('hidden'), 3500);
  }

  setStatus(msg) { if (this._statusEl) this._statusEl.textContent = msg; }
}
