/**
 * StoreScene — sell resources for coins, buy equipment upgrades.
 */
import { BearDialogue } from '../systems/BearDialogue.js';

export class StoreScene {
  constructor({ store, resources, statusEl, bearSpeakFn, getTier }) {
    this._store     = store;
    this._res       = resources;
    this._statusEl  = statusEl;
    this._bearSpeak = bearSpeakFn;
    this._getTier   = getTier ?? (() => 0);
  }

  init() {
    this._res.onChange(() => this._render());
    this._store.onChange(() => this._render());
  }

  onEnter() {
    this._setStatus('Market — sell your goods or buy upgrades with 🪙 coins!');
    this._bearSpeak?.(BearDialogue.sceneGreeting('store'));
    this._render();
  }

  // ── Rendering ──────────────────────────────────────────────────────────────

  _render() {
    this._renderSell();
    this._renderLand();
    this._renderUpgrades();

    const coinsEl = document.getElementById('store-coins-total');
    if (coinsEl) coinsEl.textContent = `Total earned: ${this._store.totalEarned} 🪙`;
  }

  _renderSell() {
    const container = document.getElementById('store-grid');
    if (!container) return;

    const tier  = this._getTier();
    const items = this._store.getItems(tier);
    const amts  = this._res.amounts;

    container.innerHTML = '';
    for (const item of items) {
      const stock = amts[item.key] ?? 0;
      const card  = document.createElement('div');
      card.className = `store-card${stock === 0 ? ' store-card-empty' : ''}`;
      card.innerHTML = `
        <div class="store-card-icon">${item.icon}</div>
        <div class="store-card-name">${item.label}</div>
        <div class="store-card-price">${item.price} 🪙 each</div>
        <div class="store-card-stock">In stock: <strong>${stock}</strong></div>
        <div class="store-sell-btns">
          <button class="btn-sell" data-key="${item.key}" data-qty="1"  ${stock < 1  ? 'disabled' : ''}>Sell 1</button>
          <button class="btn-sell" data-key="${item.key}" data-qty="5"  ${stock < 5  ? 'disabled' : ''}>Sell 5</button>
          <button class="btn-sell" data-key="${item.key}" data-qty="all"${stock < 1  ? 'disabled' : ''}>Sell All</button>
        </div>`;
      container.appendChild(card);
    }

    container.querySelectorAll('.btn-sell').forEach(btn => {
      btn.addEventListener('click', () => this._doSell(btn.dataset.key, btn.dataset.qty));
    });
  }

  _renderLand() {
    const section = document.getElementById('store-land-section');
    const container = document.getElementById('store-land-grid');
    if (!container) return;

    const tier   = this._getTier();
    const lands  = this._store.getLandUpgrades(tier);
    const coins  = this._res.get('coins');

    if (lands.length === 0) {
      section?.classList.add('hidden');
      return;
    }
    section?.classList.remove('hidden');

    container.innerHTML = '';
    for (const upg of lands) {
      const bought    = this._store.isPurchased(upg.id);
      const canAfford = coins >= upg.coinCost;

      const card = document.createElement('div');
      card.className = `upgrade-card land-expansion-card${bought ? ' upgrade-card-owned' : ''}`;
      card.innerHTML = `
        <div class="upgrade-card-icon">${upg.icon}</div>
        <div class="upgrade-card-info">
          <div class="upgrade-card-name">${upg.label}</div>
          <div class="upgrade-card-desc">${upg.description}</div>
          ${bought ? '' : `<div class="upgrade-card-cost">${upg.coinCost} 🪙</div>`}
        </div>
        <div class="upgrade-card-action">
          ${bought
            ? '<span class="upgrade-owned-badge">✓ Opened</span>'
            : `<button class="btn-upgrade btn-land" data-id="${upg.id}" ${canAfford ? '' : 'disabled'}>
                ${canAfford ? 'Open Land' : `Need ${upg.coinCost - coins} more 🪙`}
              </button>`}
        </div>`;
      container.appendChild(card);
    }

    container.querySelectorAll('.btn-land').forEach(btn => {
      btn.addEventListener('click', () => this._doBuy(btn.dataset.id));
    });
  }

  _renderUpgrades() {
    const container = document.getElementById('store-upgrades-grid');
    if (!container) return;

    const tier     = this._getTier();
    const upgrades = this._store.getUpgrades(tier);
    const coins    = this._res.get('coins');

    if (upgrades.length === 0) {
      container.innerHTML = '<p class="no-upgrades">Upgrades unlock as you progress. 🌱</p>';
      return;
    }

    container.innerHTML = '';
    for (const upg of upgrades) {
      const bought   = this._store.isPurchased(upg.id);
      const prereqOk = !upg.requires || this._store.isPurchased(upg.requires);
      const canAfford = coins >= upg.coinCost;

      const card = document.createElement('div');
      card.className = `upgrade-card${bought ? ' upgrade-card-owned' : ''}`;

      const speedMult  = this._store.getSpeedMultiplier(upg.station);
      const stationLabel = _stationLabel(upg.station);

      card.innerHTML = `
        <div class="upgrade-card-icon">${upg.icon}</div>
        <div class="upgrade-card-info">
          <div class="upgrade-card-name">${upg.label}</div>
          <div class="upgrade-card-desc">${upg.description} · ${stationLabel}</div>
          ${bought
            ? `<div class="upgrade-card-speed">⚡ ${_speedLabel(speedMult)} total</div>`
            : `<div class="upgrade-card-cost">${upg.coinCost} 🪙</div>`}
        </div>
        <div class="upgrade-card-action">
          ${bought
            ? '<span class="upgrade-owned-badge">✓ Owned</span>'
            : `<button class="btn-upgrade" data-id="${upg.id}"
                ${!prereqOk || !canAfford ? 'disabled' : ''}>
                ${!prereqOk ? 'Locked' : !canAfford ? `Need ${upg.coinCost - coins} more 🪙` : 'Buy'}
              </button>`}
        </div>`;
      container.appendChild(card);
    }

    container.querySelectorAll('.btn-upgrade').forEach(btn => {
      btn.addEventListener('click', () => this._doBuy(btn.dataset.id));
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  _doSell(key, qty) {
    const result = this._store.sell(key, qty);
    if (result.success) {
      this._bearSpeak?.(BearDialogue.sellReaction(result.coins));
      this._setStatus(`${result.message}`);
    } else {
      this._setStatus('⚠ ' + result.message);
      this._bearSpeak?.(result.message);
    }
  }

  _doBuy(id) {
    const result = this._store.buyUpgrade(id);
    if (result.success) {
      this._bearSpeak?.(`${result.message} 🎉`);
      this._setStatus(result.message);
    } else {
      this._setStatus('⚠ ' + result.message);
    }
  }

  _setStatus(msg) { if (this._statusEl) this._statusEl.textContent = msg; }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function _stationLabel(station) {
  const labels = {
    press:       'Press',
    fermenter:   'Fermenter',
    bottling:    'Bottling',
    still:       'Still',
    barrel:      'Barrel',
    brew_kettle: 'Brew Kettle',
    roaster:     'Roaster',
  };
  return labels[station] ?? station;
}

function _speedLabel(mult) {
  if (mult >= 1) return '1× speed';
  const x = Math.round(1 / mult);
  return `${x}× speed`;
}
