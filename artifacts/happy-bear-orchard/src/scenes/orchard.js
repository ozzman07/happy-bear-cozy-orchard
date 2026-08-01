/**
 * OrchardScene — renders and manages the 10×10 tile grid.
 */
import { TILE_STATE, TILE_TYPE, TILE_VISUAL, CROP_VISUAL, ROT_TICKS_NEEDED } from '../constants.js';
import { BearDialogue } from '../systems/BearDialogue.js';


export class OrchardScene {
  constructor({ tileGrid, resources, actionMenu, statusEl, bearEl, speechEl, getTier, isAutoUnlockedFn }) {
    this._grid      = tileGrid;
    this._resources = resources;
    this._menu      = actionMenu;
    this._statusEl  = statusEl;
    this._bearEl    = bearEl;
    this._speechEl  = speechEl;
    this._getTier   = getTier ?? (() => 0);
    this._isAutoUnlocked = isAutoUnlockedFn ?? (() => true);
    this._tileEls   = [];
    this._speechTmr = null;
    this.autoEnabled = false;
    this._placingOutpost = false;
  }

  /** Enter outpost-placement mode — the next tile tap attempts to place a 3×3 outpost there. */
  enterOutpostPlacement() {
    this._placingOutpost = true;
    document.getElementById('outpost-cancel-btn')?.classList.remove('hidden');
    this.setStatus('🏕️ Tap a locked tile to place your new outpost (3×3, away from the edge and forest dividers).');
  }

  cancelOutpostPlacement() {
    this._placingOutpost = false;
    document.getElementById('outpost-cancel-btn')?.classList.add('hidden');
  }

  _attemptOutpostPlacement(x, y) {
    if (this._grid.placeOutpost(x, y)) {
      this.cancelOutpostPlacement();
      this.setStatus('🏕️ Outpost placed! New tiles ready to clear.');
      this.bearSpeak('🏕️ New outpost claimed! Clear it out and start planting.');
    } else {
      this.setStatus("⚠ Can't place an outpost there — needs a full 3×3 of locked tiles, away from the edge and forest dividers. Try another spot.");
    }
  }

  /** (Re)build the grid DOM to match the current TileGrid size. */
  _buildGrid() {
    const gridEl = document.getElementById('grid');
    if (!gridEl) return;
    const size = this._grid.size;
    gridEl.style.gridTemplateColumns = `repeat(${size}, var(--tile-size))`;
    gridEl.style.gridTemplateRows    = `repeat(${size}, var(--tile-size))`;
    gridEl.innerHTML = '';
    this._tileEls    = [];

    for (let y = 0; y < size; y++) {
      this._tileEls[y] = [];
      for (let x = 0; x < size; x++) {
        const el       = document.createElement('div');
        el.className   = 'tile';
        el.dataset.x   = x;
        el.dataset.y   = y;
        el.addEventListener('click', () => {
          if (this._placingOutpost) { this._attemptOutpostPlacement(x, y); return; }
          this._menu.show(this._grid.tiles[y][x], this._resources, this._getTier());
        });
        gridEl.appendChild(el);
        this._tileEls[y][x] = el;
        this._renderTile(this._grid.tiles[y][x], el);
      }
    }
  }

  /** Build the grid DOM. Call once after mount. */
  init() {
    this._buildGrid();
    this._grid.onResize(() => this._buildGrid());

    // Auto toggle button
    const autoBtn = document.getElementById('orchard-auto-btn');
    if (autoBtn) {
      this._syncAutoBtn(autoBtn);
      autoBtn.addEventListener('click', () => {
        if (!this.autoEnabled && !this._isAutoUnlocked()) {
          this.setStatus('🔔 Build the Harvest Bell in the Cabin to unlock auto-harvesting!');
          return;
        }
        this.autoEnabled = !this.autoEnabled;
        this._syncAutoBtn(autoBtn);
        this.setStatus(this.autoEnabled
          ? 'Auto ON — water, plant, harvest, and mine all run automatically. 🤖'
          : 'Auto OFF — back to manual control. 🌿');
      });
    }

    // Outpost placement cancel button
    document.getElementById('outpost-cancel-btn')
      ?.addEventListener('click', () => {
        this.cancelOutpostPlacement();
        this.setStatus('Outpost placement cancelled.');
      });

    // React to grid changes
    this._grid.onChange(tiles => this._updateAllTiles(tiles));

    // Poll every second to keep mining progress and grow bars live
    setInterval(() => {
      for (let y = 0; y < this._grid.size; y++)
        for (let x = 0; x < this._grid.size; x++) {
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
    for (let y = 0; y < tiles.length; y++)
      for (let x = 0; x < tiles[y].length; x++)
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

    // Non-apple crops (timber, hops, coffee) use their own growing/ready visuals
    const cv = CROP_VISUAL[tile.cropType];
    if (cv) {
      if (tile.state === TILE_STATE.PLANTED) {
        v = { emoji: cv.growing, color: cv.growColor, label: `${cv.label} growing` };
      } else if (tile.state === TILE_STATE.HARVESTABLE) {
        v = { emoji: cv.ready, color: cv.readyColor, label: `${cv.label} ready — tap to harvest!` };
      }
      el.className     = `tile tile-${tile.state}${tile.state === TILE_STATE.HARVESTABLE ? ' tile-crop-ready' : ''}`;
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
