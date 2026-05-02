import { GRID_SIZE, TILE_STATE, TILE_VISUAL, RESOURCE } from './constants.js';

const BEAR_SPEECHES = [
  'Keep growing! 🌱',
  'Water your plants! 💧',
  'The orchard blooms! 🌸',
  'Harvest time is coming! 🍎',
  'Build your dream orchard! 🌳',
  'Cozy day in the orchard! ☕',
  'More fruit, more cups! ☕',
  'Looking great out there! 🌿',
  'A new day in the orchard! 🌅',
  'Don\'t forget to water! 💧',
];

export class UI {
  constructor() {
    this._gridEl      = document.getElementById('grid');
    this._speechEl    = document.getElementById('bear-speech');
    this._statusEl    = document.getElementById('status-msg');
    this._dayEl       = document.getElementById('day-num');
    this._tileEls     = [];
    this._speechTimer = null;
  }

  initGrid(tiles, onTileClick) {
    this._gridEl.innerHTML = '';
    this._tileEls = [];

    for (let y = 0; y < GRID_SIZE; y++) {
      this._tileEls[y] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const el = document.createElement('div');
        el.className   = 'tile';
        el.dataset.x   = x;
        el.dataset.y   = y;
        el.addEventListener('click', () => onTileClick(tiles[y][x]));
        this._gridEl.appendChild(el);
        this._tileEls[y][x] = el;
        this._renderTile(tiles[y][x], el);
      }
    }
  }

  updateTile(tile) {
    const el = this._tileEls[tile.y]?.[tile.x];
    if (el) this._renderTile(tile, el);
  }

  updateAllTiles(tiles) {
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        this.updateTile(tiles[y][x]);
      }
    }
  }

  _renderTile(tile, el) {
    const v = TILE_VISUAL[tile.state];
    el.className         = `tile tile-${tile.state}`;
    el.style.background  = v.color;
    el.textContent       = v.emoji;
    el.title             = v.label;

    if (tile.state === TILE_STATE.PLANTED) {
      const pct = Math.min(100, Math.round((tile.growTicks / tile.growTicksNeeded) * 100));
      el.style.setProperty('--grow-pct', pct + '%');
      el.classList.add('growing');
    } else {
      el.style.removeProperty('--grow-pct');
    }
  }

  updateResources(amounts) {
    document.getElementById('count-wood').textContent  = amounts[RESOURCE.WOOD]  ?? 0;
    document.getElementById('count-stone').textContent = amounts[RESOURCE.STONE] ?? 0;
    document.getElementById('count-fruit').textContent = amounts[RESOURCE.FRUIT] ?? 0;
    document.getElementById('count-cups').textContent  = amounts[RESOURCE.CUPS]  ?? 0;
  }

  updateDay(day) {
    this._dayEl.textContent = day;
  }

  setStatus(msg) {
    this._statusEl.textContent = msg;
  }

  bearSpeak(msg) {
    if (this._speechTimer) clearTimeout(this._speechTimer);
    this._speechEl.textContent = msg;
    this._speechEl.classList.remove('hidden');
    this._speechTimer = setTimeout(() => {
      this._speechEl.classList.add('hidden');
    }, 3500);
  }

  randomBearSpeak() {
    const msg = BEAR_SPEECHES[Math.floor(Math.random() * BEAR_SPEECHES.length)];
    this.bearSpeak(msg);
  }
}
