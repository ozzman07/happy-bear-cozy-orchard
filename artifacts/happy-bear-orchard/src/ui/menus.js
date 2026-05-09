/**
 * ActionMenu — tile action popup for the orchard scene.
 */
import { ACTION, ACTION_COSTS, ACTION_VALID_STATES, TILE_STATE } from '../constants.js';

const ACTION_INFO = {
  [ACTION.CLEAR]:   { label: '🪓 Clear',    desc: 'Clear overgrowth  →  +1 🪵' },
  [ACTION.DIG]:     { label: '⛏️ Dig',     desc: 'Prepare soil  →  +3 🪨' },
  [ACTION.PLANT]:   { label: '🌱 Plant',   desc: 'Plant a crop  →  costs 1 🍎' },
  [ACTION.WATER]:   { label: '💧 Water',   desc: 'Speed up growth (free)' },
  [ACTION.HARVEST]: { label: '🍎 Harvest', desc: 'Pick fruit  →  +3 🍎  (auto-replants)' },
  [ACTION.MINE]:    { label: '⛏️ Mine',    desc: 'Establish a mine  →  +2 🪨' },
};

const ACTION_INFO_CONTEXT = {
  [ACTION.CLEAR]: {
    [TILE_STATE.PLANTED]:     { label: '🌿 Uproot',   desc: 'Remove crop — tile returns to soil' },
    [TILE_STATE.HARVESTABLE]: { label: '🌿 Uproot',   desc: 'Remove crop — tile returns to soil' },
    [TILE_STATE.MINE_SHAFT]:  { label: '🪨 Fill In',  desc: 'Decommission mine — tile returns to soil' },
  },
  [ACTION.MINE]: {
    [TILE_STATE.MINE_SHAFT]:  { label: '⛏️ Mine',    desc: 'Extract stone  →  +2 🪨' },
  },
};

export class ActionMenu {
  constructor(onAction) {
    this.onAction   = onAction;
    this.currentTile = null;
    this._menuEl    = document.getElementById('action-menu');
    this._titleEl   = document.getElementById('action-menu-title');
    this._btnsEl    = document.getElementById('action-menu-buttons');
    this._overlayEl = document.getElementById('overlay');

    document.getElementById('action-cancel')
      ?.addEventListener('click', () => this.hide());
    this._overlayEl
      ?.addEventListener('click', () => this.hide());
  }

  show(tile, resources) {
    this.currentTile = tile;
    const stateName  = tile.state.charAt(0).toUpperCase() + tile.state.slice(1);
    this._titleEl.textContent = `Tile (${tile.x + 1}, ${tile.y + 1})  —  ${stateName}`;
    this._btnsEl.innerHTML   = '';

    const available = Object.values(ACTION).filter(a =>
      ACTION_VALID_STATES[a]?.includes(tile.state)
    );

    if (available.length === 0) {
      const msg = document.createElement('p');
      msg.className = 'no-actions';
      msg.textContent = 'Nothing to do here yet.';
      this._btnsEl.appendChild(msg);
    } else {
      for (const action of available) {
        const info      = ACTION_INFO_CONTEXT[action]?.[tile.state] ?? ACTION_INFO[action];
        const costs     = ACTION_COSTS[action] ?? {};
        const canAfford = resources.canAfford(costs);

        const btn       = document.createElement('button');
        btn.className   = `action-btn${canAfford ? '' : ' cant-afford'}`;
        btn.disabled    = !canAfford;
        btn.innerHTML   = `
          <span class="action-label">${info.label}</span>
          <span class="action-desc">${info.desc}</span>`;
        btn.addEventListener('click', () => {
          this.onAction(tile, action);
          this.hide();
        });
        this._btnsEl.appendChild(btn);
      }
    }
    this._menuEl.classList.remove('hidden');
    this._overlayEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this._menuEl.classList.add('hidden');
    this._overlayEl.classList.add('hidden');
    document.body.style.overflow = '';
    this.currentTile = null;
  }
}
