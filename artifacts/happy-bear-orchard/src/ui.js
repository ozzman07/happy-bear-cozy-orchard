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
    this._cabinSpeech = document.getElementById('cabin-bear-speech');
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
        el.className = 'tile';
        el.dataset.x = x;
        el.dataset.y = y;
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
    el.className        = `tile tile-${tile.state}`;
    el.style.background = v.color;
    el.textContent      = v.emoji;
    el.title            = v.label;

    if (tile.state === TILE_STATE.PLANTED) {
      const pct = Math.min(100, Math.round((tile.growTicks / tile.growTicksNeeded) * 100));
      el.style.setProperty('--grow-pct', pct + '%');
      el.classList.add('growing');
    } else {
      el.style.removeProperty('--grow-pct');
    }
  }

  updateResources(amounts) {
    const set = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.textContent = amounts[key] ?? 0;
    };

    set('count-wood',  RESOURCE.WOOD);
    set('count-stone', RESOURCE.STONE);
    set('count-fruit', RESOURCE.FRUIT);
    set('count-cups',  RESOURCE.CUPS);
    set('count-juice', RESOURCE.JUICE);
    set('count-cider', RESOURCE.CIDER);

    // Dim juice/cider items when at zero
    const juiceEl = document.getElementById('res-juice-item');
    const ciderEl = document.getElementById('res-cider-item');
    juiceEl?.classList.toggle('res-zero', !(amounts[RESOURCE.JUICE] > 0));
    ciderEl?.classList.toggle('res-zero', !(amounts[RESOURCE.CIDER] > 0));
  }

  updateDay(day) {
    this._dayEl.textContent = day;
  }

  setStatus(msg) {
    this._statusEl.textContent = msg;
  }

  bearSpeak(msg) {
    if (this._speechTimer) clearTimeout(this._speechTimer);

    // Update whichever bubble is visible (orchard or cabin)
    [this._speechEl, this._cabinSpeech].forEach(el => {
      if (!el) return;
      el.textContent = msg;
      el.classList.remove('hidden');
    });

    this._speechTimer = setTimeout(() => {
      this._speechEl?.classList.add('hidden');
      this._cabinSpeech?.classList.add('hidden');
    }, 3500);
  }

  randomBearSpeak() {
    const msg = BEAR_SPEECHES[Math.floor(Math.random() * BEAR_SPEECHES.length)];
    this.bearSpeak(msg);
  }
}
