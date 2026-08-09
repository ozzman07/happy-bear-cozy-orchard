/**
 * OrchardScene — renders and manages the 10×10 tile grid.
 */
import { TILE_STATE, TILE_TYPE, TILE_VISUAL, CROP_VISUAL, ROT_TICKS_NEEDED, OUTPOST_GROWTH_AMOUNT } from '../constants.js';
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

  /** Enter outpost-placement mode — the next tap on the right or bottom edge grows the board that way. */
  enterOutpostPlacement() {
    this._placingOutpost = true;
    document.getElementById('outpost-cancel-btn')?.classList.remove('hidden');
    this.setStatus('🏕️ Tap a glowing tile along the right or bottom edge to grow the orchard that way.');
    this._updateAllTiles(this._grid.tiles); // re-render to show the glowing edge highlight
  }

  cancelOutpostPlacement() {
    this._placingOutpost = false;
    document.getElementById('outpost-cancel-btn')?.classList.add('hidden');
    this._updateAllTiles(this._grid.tiles); // re-render to clear the glowing edge highlight
  }

  _attemptOutpostPlacement(x, y) {
    const onRightEdge  = x === this._grid.cols - 1;
    const onBottomEdge = y === this._grid.rows - 1;
    if (!onRightEdge && !onBottomEdge) {
      this.setStatus('⚠ Tap a glowing tile along the right or bottom edge to grow the orchard that way.');
      return;
    }
    const grewRight  = onRightEdge  && this._grid.growRight(OUTPOST_GROWTH_AMOUNT);
    const grewBottom = onBottomEdge && this._grid.growBottom(OUTPOST_GROWTH_AMOUNT);
    if (!grewRight && !grewBottom) {
      this.setStatus("⚠ The orchard can't grow any further that way — try the other edge.");
      return;
    }
    this.cancelOutpostPlacement();
    const dir = grewRight && grewBottom ? 'east and south' : grewRight ? 'east' : 'south';
    this.setStatus(`🏕️ New outpost built — the orchard grows ${dir}!`);
    this.bearSpeak('🏕️ The land stretches further! More room to grow.');
  }

  /** (Re)build the grid DOM to match the current TileGrid dimensions. */
  _buildGrid() {
    const gridEl = document.getElementById('grid');
    if (!gridEl) return;
    const { cols, rows } = this._grid;
    gridEl.style.gridTemplateColumns = `repeat(${cols}, var(--tile-size))`;
    gridEl.style.gridTemplateRows    = `repeat(${rows}, var(--tile-size))`;
    gridEl.innerHTML = '';
    this._tileEls    = [];

    for (let y = 0; y < rows; y++) {
      this._tileEls[y] = [];
      for (let x = 0; x < cols; x++) {
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
      for (let y = 0; y < this._grid.rows; y++)
        for (let x = 0; x < this._grid.cols; x++) {
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

    // While placing an outpost, glow every tile along the right/bottom edge —
    // those are the only taps that grow the board.
    if (this._placingOutpost && (tile.x === this._grid.cols - 1 || tile.y === this._grid.rows - 1)) {
      el.classList.add('tile-grow-target');
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
