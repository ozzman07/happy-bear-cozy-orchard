/**
 * OrchardScene — renders and manages the 10×10 tile grid.
 */
import { GRID_SIZE, TILE_STATE, TILE_TYPE, TILE_VISUAL, ROT_TICKS_NEEDED } from '../constants.js';
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
    this.autoEnabled = false;
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

    // Auto toggle button
    const autoBtn = document.getElementById('orchard-auto-btn');
    if (autoBtn) {
      this._syncAutoBtn(autoBtn);
      autoBtn.addEventListener('click', () => {
        this.autoEnabled = !this.autoEnabled;
        this._syncAutoBtn(autoBtn);
        this.setStatus(this.autoEnabled
          ? 'Auto ON — water, plant, harvest, and mine all run automatically. 🤖'
          : 'Auto OFF — back to manual control. 🌿');
      });
    }

    // React to grid changes
    this._grid.onChange(tiles => this._updateAllTiles(tiles));

    // Poll every second to keep mining progress and grow bars live
    setInterval(() => {
      for (let y = 0; y < GRID_SIZE; y++)
        for (let x = 0; x < GRID_SIZE; x++) {
          const t = this._grid.tiles[y]?.[x];
          if (t?.state === TILE_STATE.MINING || t?.state === TILE_STATE.PLANTED)
            this._renderTile(t, this._tileEls[y]?.[x]);
        }
    }, 1000);

    // Show welcome modal on first visit
    if (!localStorage.getItem('hbco_welcome_seen')) {
      this._showWelcomeModal();
    }
  }

  _showWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    modal.classList.remove('hidden');
    const closeBtn = document.getElementById('close-welcome');
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      localStorage.setItem('hbco_welcome_seen', 'true');
    });
    const guideLink = document.getElementById('guide-link');
    if (guideLink) {
      guideLink.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('hidden');
        localStorage.setItem('hbco_welcome_seen', 'true');
        document.getElementById('nav-help')?.click();
      });
    }
  }

  onEnter() {
    const tip = BearDialogue.sceneGreeting('orchard');
    this.setStatus('Back in the orchard! 🌿');
    if (tip) this.bearSpeak(tip);
  }

  onTick(ripened) {
    if (ripened && !this.autoEnabled) this.setStatus('Crops ready — tap them to harvest! 🍎');
  }

  _syncAutoBtn(btn) {
    btn.textContent = this.autoEnabled ? '🤖 Auto: ON' : '🤖 Auto: OFF';
    btn.classList.toggle('auto-btn-on', this.autoEnabled);
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

    // Permanent gap tiles are zone dividers — render as dense treeline
    if (tile.permanent) {
      el.className        = 'tile tile-permanent';
      el.style.background = '#1a3a1a';
      el.textContent      = '🌲';
      el.title            = 'Dense forest — separates growing zones';
      el.style.removeProperty('--grow-pct');
      return;
    }

    let v = TILE_VISUAL[tile.state];
    // CLEARABLE has sub-types keyed by tileType — resolve to the right visual
    if (v && !v.color) v = v[tile.tileType] ?? v[TILE_TYPE.GRASS] ?? Object.values(v)[0];
    if (!v) return;
    el.className     = `tile tile-${tile.state}`;
    el.style.background = v.color;
    el.textContent   = v.emoji;
    el.title         = v.label;

    // Timber trees use different visuals
    if (tile.cropType === 'timber') {
      if (tile.state === TILE_STATE.PLANTED) {
        v = { emoji: '🌲', color: '#1e4d18', label: 'Timber tree growing — harvest for 🪵' };
      } else if (tile.state === TILE_STATE.HARVESTABLE) {
        v = { emoji: '🪵', color: '#3a6e24', label: 'Timber ready — harvest for +4 🪵!' };
      }
      el.className     = `tile tile-${tile.state}${tile.state === TILE_STATE.HARVESTABLE ? ' tile-timber-ready' : ''}`;
      el.style.background = v.color;
      el.textContent   = v.emoji;
      el.title         = v.label;
    }

    if (tile.state === TILE_STATE.PLANTED) {
      const pct = Math.min(100, Math.round((tile.growTicks / tile.growTicksNeeded) * 100));
      el.style.setProperty('--grow-pct', pct + '%');
      el.classList.add('growing');
    } else {
      el.style.removeProperty('--grow-pct');
    }

    // Warn when apples are at risk of rotting (≥50% through their rot window)
    if (tile.state === TILE_STATE.HARVESTABLE && tile.rotTicks >= Math.floor(ROT_TICKS_NEEDED / 2)) {
      el.classList.add('tile-rotting');
    }

    if (tile.state === TILE_STATE.MINING && tile.miningEnd) {
      const total    = (tile.miningEnd - tile.miningStart) || 1;
      const elapsed  = Date.now() - tile.miningStart;
      const pct      = Math.min(100, Math.round((elapsed / total) * 100));
      el.classList.add('mining');
      el.style.setProperty('--mine-pct', pct + '%');
    } else {
      el.style.removeProperty('--mine-pct');
    }
  }

  // ── Harvest pop floaters ──────────────────────────────────────────────────

  popFloat(x, y, emoji = '🍎') {
    const gridEl = document.getElementById('grid');
    const tileEl = this._tileEls[y]?.[x];
    if (!gridEl || !tileEl) return;
    const gr = gridEl.getBoundingClientRect();
    const tr = tileEl.getBoundingClientRect();
    const el = document.createElement('div');
    el.className   = 'harvest-float';
    el.textContent = emoji;
    el.style.left  = (tr.left - gr.left + tr.width / 2) + 'px';
    el.style.top   = (tr.top  - gr.top) + 'px';
    gridEl.appendChild(el);
    el.addEventListener('animationend', () => el.remove(), { once: true });
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
