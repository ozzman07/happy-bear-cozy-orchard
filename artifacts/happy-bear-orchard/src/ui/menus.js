/**
 * ActionMenu — tile action popup for the orchard scene.
 */
import { ACTION, ACTION_COSTS, ACTION_VALID_STATES, TILE_STATE, CROP_VISUAL, UNLOCK_TILE_COST } from '../constants.js';
import { CROPS } from '../systems/crops.js';

const RES_ICON = { fruit: '🍎', hops: '🌾', coffee_bean: '☕', wood: '🪵', coins: '🪙' };

function formatCost(cost) {
  return Object.entries(cost).map(([k, v]) => `${v} ${RES_ICON[k] ?? k}`).join(' + ');
}

const ACTION_INFO = {
  [ACTION.CLEAR]:      { label: '🪓 Clear',       desc: 'Clear overgrowth  →  +1 🪵' },
  [ACTION.DIG]:        { label: '⛏️ Dig',         desc: 'Prepare soil  →  +3 🪨' },
  [ACTION.PLANT]:      { label: '🌱 Plant',        desc: 'Plant an apple tree  →  costs 1 🍎' },
  [ACTION.WATER]:      { label: '💧 Water',        desc: 'Speed up growth (free)' },
  [ACTION.HARVEST]:    { label: '🍎 Harvest',      desc: 'Pick fruit  →  +3 🍎  (auto-replants)' },
  [ACTION.MINE]:       { label: '⛏️ Mine',         desc: 'Establish a mine  →  +2 🪨' },
  [ACTION.COMPOST]:    { label: '🍂 Compost',      desc: 'Turn rotten apple back into a fresh planting (free)' },
  [ACTION.UNLOCK]:     { label: '🔓 Unlock Early', desc: `Skip the wait — instantly open this tile  →  costs ${UNLOCK_TILE_COST} 🪙` },
};

const ACTION_INFO_CONTEXT = {
  [ACTION.CLEAR]: {
    [TILE_STATE.PLANTED]:     { label: '🌿 Uproot',   desc: 'Remove crop — tile returns to soil' },
    [TILE_STATE.HARVESTABLE]: { label: '🌿 Uproot',   desc: 'Remove crop — tile returns to soil' },
    [TILE_STATE.ROTTED]:      { label: '🪓 Clear',    desc: 'Remove rotted apple — tile returns to bare soil' },
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

  show(tile, resources, tier = 0) {
    this.currentTile = tile;
    this._btnsEl.innerHTML = '';

    // Permanent forest dividers — show a message but no actions
    if (tile.permanent) {
      this._titleEl.textContent = '🌲 Ancient Forest';
      const msg = document.createElement('p');
      msg.className = 'no-actions';
      msg.textContent = 'These ancient trees can\'t be cleared — they separate growing zones.';
      this._btnsEl.appendChild(msg);
      this._menuEl.classList.remove('hidden');
      this._overlayEl.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      return;
    }

    // For growing trees, show progress prominently in the title
    if (tile.state === TILE_STATE.PLANTED) {
      const pct = Math.min(100, Math.round((tile.growTicks / tile.growTicksNeeded) * 100));
      this._titleEl.textContent = `🌱 Growing — ${pct}% complete`;
    } else if (tile.state === TILE_STATE.ROTTED) {
      this._titleEl.textContent = `🍂 Rotted apples — harvest next time before they turn!`;
    } else {
      const stateName = tile.state.charAt(0).toUpperCase() + tile.state.slice(1);
      this._titleEl.textContent = `Tile (${tile.x + 1}, ${tile.y + 1})  —  ${stateName}`;
    }

    const available = Object.values(ACTION).filter(a =>
      ACTION_VALID_STATES[a]?.includes(tile.state)
    );

    if (available.length === 0) {
      const msg = document.createElement('p');
      msg.className = 'no-actions';
      msg.textContent = 'Nothing to do here yet.';
      this._btnsEl.appendChild(msg);
    } else {
      const addBtn = (info, costs, action, cropId) => {
        const canAfford = resources.canAfford(costs);
        const btn       = document.createElement('button');
        btn.className   = `action-btn${canAfford ? '' : ' cant-afford'}`;
        btn.disabled    = !canAfford;
        btn.innerHTML   = `
          <span class="action-label">${info.label}</span>
          <span class="action-desc">${info.desc}</span>`;
        btn.addEventListener('click', () => {
          this.onAction(tile, action, cropId);
          this.hide();
        });
        this._btnsEl.appendChild(btn);
      };

      for (const action of available) {
        // PLANT offers one button per unlocked crop instead of a single generic option
        if (action === ACTION.PLANT) {
          const crops = Object.values(CROPS).filter(c => c.unlockTier <= tier);
          for (const crop of crops) {
            const hasCost = Object.keys(crop.plantCost).length > 0;
            addBtn({
              label: `${crop.icon} Plant ${crop.name}`,
              desc:  `Grow ${crop.name}  →  ${hasCost ? 'costs ' + formatCost(crop.plantCost) : 'free'}`,
            }, crop.plantCost, action, crop.id);
          }
          continue;
        }

        let info = ACTION_INFO_CONTEXT[action]?.[tile.state] ?? ACTION_INFO[action];
        // Non-apple crops get a tailored harvest label
        if (action === ACTION.HARVEST && CROPS[tile.cropType]) {
          const crop = CROPS[tile.cropType];
          const cv   = CROP_VISUAL[tile.cropType];
          info = { label: `${cv?.ready ?? crop.icon} Harvest ${crop.name}`, desc: `Pick ${crop.name}  →  +${formatCost(crop.yields)}  (auto-replants)` };
        }

        const costs = ACTION_COSTS[action] ?? {};
        addBtn(info, costs, action, tile.cropType);
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
