/**
 * StoreScene — sell resources, upgrade the market, manage distribution deals.
 */
import { BearDialogue } from '../systems/BearDialogue.js';

export class StoreScene {
  constructor({ store, market, resources, statusEl, bearSpeakFn, getTier, getDay }) {
    this._store     = store;
    this._market    = market;
    this._res       = resources;
    this._statusEl  = statusEl;
    this._bearSpeak = bearSpeakFn;
    this._getTier   = getTier ?? (() => 0);
    this._getDay    = getDay  ?? (() => 1);
  }

  init() {
    this._res.onChange(()    => this._render());
    this._store.onChange(()  => this._render());
    this._market.onChange(() => this._render());
  }

  onEnter() {
    this._setStatus('Market — sell your goods, upgrade your reach, or manage deals!');
    this._bearSpeak?.(BearDialogue.sceneGreeting('store'));
    this._render();
  }

  // ── Rendering ─────────────────────────────────────────────────────────────────

  _render() {
    this._renderMarketLevel();
    this._renderSell();
    this._renderDeals();
    this._renderLand();
    this._renderUpgrades();

    const coinsEl = document.getElementById('store-coins-total');
    if (coinsEl) coinsEl.textContent = `Total earned: ${this._store.totalEarned} 🪙`;
  }

  _renderMarketLevel() {
    const container = document.getElementById('store-market-level');
    if (!container) return;

    const tier      = this._getTier();
    const current   = this._market.levelDef;
    const next      = this._market.getNextLevel();
    const coins     = this._res.get('coins');
    const canSeeUpg = next && tier >= next.unlockTier;
    const canAfford = next && coins >= next.cost;
    const pctBoost  = Math.round((current.priceMultiplier - 1) * 100);

    container.innerHTML = `
      <div class="market-level-current">
        <span class="market-level-icon">${current.icon}</span>
        <div class="market-level-info">
          <div class="market-level-name">${current.name}</div>
          <div class="market-level-desc">${current.description}</div>
          ${pctBoost > 0 ? `<div class="market-price-boost">+${pctBoost}% on all sell prices</div>` : ''}
          ${current.dealSlots > 0 ? `<div class="market-price-boost">${current.dealSlots} distribution deal slot${current.dealSlots > 1 ? 's' : ''}</div>` : ''}
        </div>
      </div>
      ${next ? `
        <div class="market-upgrade-row${canSeeUpg ? '' : ' market-upgrade-locked'}">
          <div class="market-upgrade-next">
            <span>${next.icon}</span> <strong>${next.name}</strong>
            ${canSeeUpg ? `<span class="market-upgrade-cost">${next.cost} 🪙</span>` : `<span class="market-upgrade-tier">Tier ${next.unlockTier} required</span>`}
          </div>
          ${canSeeUpg ? `<button class="btn-market-upgrade" ${canAfford ? '' : 'disabled'}>
            ${canAfford ? 'Upgrade →' : `Need ${next.cost - coins} more 🪙`}
          </button>` : ''}
        </div>
      ` : '<div class="market-level-max">🏆 Maximum market level reached</div>'}
    `;

    container.querySelector('.btn-market-upgrade')?.addEventListener('click', () => {
      const result = this._market.upgrade(tier);
      if (result.success) {
        this._bearSpeak?.(`${result.message} 🎉`);
        this._setStatus(result.message);
      } else {
        this._setStatus('⚠ ' + result.message);
      }
    });
  }

  _renderSell() {
    const container = document.getElementById('store-grid');
    if (!container) return;

    const tier  = this._getTier();
    const items = this._store.getItems(tier);
    const amts  = this._res.amounts;
    const mult  = this._market.priceMultiplier;

    container.innerHTML = '';
    for (const item of items) {
      const stock      = amts[item.key] ?? 0;
      const unitPrice  = Math.round(item.price * mult);
      const card       = document.createElement('div');
      card.className   = `store-card${stock === 0 ? ' store-card-empty' : ''}`;
      card.innerHTML   = `
        <div class="store-card-icon">${item.icon}</div>
        <div class="store-card-name">${item.label}</div>
        <div class="store-card-price">${unitPrice} 🪙 each${mult > 1 ? ` <span class="store-price-boosted">(+${Math.round((mult-1)*100)}%)</span>` : ''}</div>
        <div class="store-card-stock">In stock: <strong>${stock}</strong></div>
        <div class="store-sell-btns">
          <button class="btn-sell" data-key="${item.key}" data-qty="1"  ${stock < 1 ? 'disabled' : ''}>Sell 1</button>
          <button class="btn-sell" data-key="${item.key}" data-qty="5"  ${stock < 5 ? 'disabled' : ''}>Sell 5</button>
          <button class="btn-sell" data-key="${item.key}" data-qty="all"${stock < 1 ? 'disabled' : ''}>Sell All</button>
        </div>`;
      container.appendChild(card);
    }

    container.querySelectorAll('.btn-sell').forEach(btn => {
      btn.addEventListener('click', () => this._doSell(btn.dataset.key, btn.dataset.qty));
    });
  }

  _renderDeals() {
    const section   = document.getElementById('store-deals-section');
    const container = document.getElementById('store-deals-grid');
    if (!container) return;

    if (this._market.level < 3) {
      section?.classList.add('hidden');
      return;
    }
    section?.classList.remove('hidden');

    const tier      = this._getTier();
    const day       = this._getDay();
    const slots     = this._market.dealSlots;
    const active    = this._market.activeCount();
    const available = this._market.getAvailableDeals(tier);
    const coins     = this._res.get('coins');

    container.innerHTML = `
      <div class="deal-slots-info">${active} of ${slots} deal slot${slots > 1 ? 's' : ''} in use</div>`;

    for (const def of available) {
      const state    = this._market.getDealState(def.id);
      const isActive = !!state;
      const card     = document.createElement('div');

      if (isActive) {
        const paused     = state.paused;
        const daysLeft   = state.nextDeadlineDay - day;
        const have       = this._res.get(def.product);
        const onTrack    = have >= def.quantity;
        const buyoutCost = Math.round(def.quantity * def.contractPrice * 0.5);
        const canBuyout  = paused && coins >= buyoutCost;
        const pauseDays  = paused ? (state.pauseUntilDay - day) : 0;

        card.className = `deal-card deal-card-active${
          paused ? ' deal-card-paused' :
          daysLeft <= 1 ? ' deal-card-urgent' :
          !onTrack ? ' deal-card-warning' : ''}`;

        card.innerHTML = `
          <div class="deal-card-header">
            <span class="deal-icon">${def.icon}</span>
            <div class="deal-info">
              <div class="deal-name">${def.name}</div>
              <div class="deal-terms">${def.quantity} ${def.productIcon} every ${def.cycleDays} days · ${def.contractPrice}🪙 each</div>
            </div>
            <div class="deal-status-badge">
              ${paused
                ? `<span class="deal-badge deal-badge-paused">⏸ Paused ${pauseDays}d</span>`
                : daysLeft <= 1
                  ? `<span class="deal-badge deal-badge-urgent">⚠ Due ${daysLeft <= 0 ? 'today' : 'tomorrow'}</span>`
                  : `<span class="deal-badge deal-badge-ok">✓ Active</span>`}
            </div>
          </div>
          <div class="deal-stock-row">
            ${paused
              ? `<span class="deal-paused-msg">Shipment missed — resumes in ${pauseDays} day${pauseDays !== 1 ? 's' : ''}. Settle now to skip the wait.</span>`
              : `<span class="${onTrack ? 'deal-stock-ok' : 'deal-stock-low'}">
                  ${onTrack ? '✓' : '⚠'} Stock: ${have} / ${def.quantity} ${def.productIcon} ready
                </span>
                <span class="deal-days-left">Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}</span>`}
          </div>
          <div class="deal-actions">
            ${paused
              ? `<button class="btn-deal-buyout" data-id="${def.id}" ${canBuyout ? '' : 'disabled'}>
                  Settle ${buyoutCost} 🪙${!canBuyout ? ' (need more coins)' : ''}
                </button>`
              : ''}
            <button class="btn-deal-cancel" data-id="${def.id}">Cancel Deal</button>
          </div>`;
      } else {
        const slotsOpen  = active < slots;
        const canSign    = slotsOpen && coins >= def.signOnFee;

        card.className = `deal-card deal-card-available${!slotsOpen ? ' deal-card-slotsfull' : ''}`;
        card.innerHTML = `
          <div class="deal-card-header">
            <span class="deal-icon">${def.icon}</span>
            <div class="deal-info">
              <div class="deal-name">${def.name}</div>
              <div class="deal-terms">${def.quantity} ${def.productIcon} every ${def.cycleDays} days · ${def.contractPrice}🪙 each</div>
              <div class="deal-desc">${def.description}</div>
            </div>
          </div>
          <div class="deal-sign-row">
            <span class="deal-sign-fee">Sign-on fee: ${def.signOnFee} 🪙</span>
            <button class="btn-deal-sign" data-id="${def.id}" ${canSign ? '' : 'disabled'}>
              ${!slotsOpen ? 'No slots free' : coins < def.signOnFee ? `Need ${def.signOnFee - coins} more 🪙` : 'Sign Deal'}
            </button>
          </div>`;
      }

      container.appendChild(card);
    }

    container.querySelectorAll('.btn-deal-sign').forEach(btn => {
      btn.addEventListener('click', () => {
        const result = this._market.signDeal(btn.dataset.id, this._getDay());
        this._setStatus(result.success ? `📋 ${result.message}` : '⚠ ' + result.message);
        if (result.success) this._bearSpeak?.(`📋 ${result.message}`);
      });
    });

    container.querySelectorAll('.btn-deal-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        this._market.cancelDeal(btn.dataset.id);
        this._setStatus('Deal cancelled.');
        this._bearSpeak?.('Deal cancelled. You can sign again any time.');
      });
    });

    container.querySelectorAll('.btn-deal-buyout').forEach(btn => {
      btn.addEventListener('click', () => {
        const result = this._market.buyout(btn.dataset.id, this._getDay());
        this._setStatus(result.success ? result.message : '⚠ ' + result.message);
        if (result.success) this._bearSpeak?.(`💰 Settled! Deal reinstated — get that shipment ready.`);
      });
    });
  }

  _renderLand() {
    const section   = document.getElementById('store-land-section');
    const container = document.getElementById('store-land-grid');
    if (!container) return;

    const tier   = this._getTier();
    const lands  = this._store.getLandUpgrades(tier);
    const coins  = this._res.get('coins');

    if (lands.length === 0) { section?.classList.add('hidden'); return; }
    section?.classList.remove('hidden');

    container.innerHTML = '';
    for (const upg of lands) {
      const bought    = this._store.isPurchased(upg.id);
      const canAfford = coins >= upg.coinCost;
      const card      = document.createElement('div');
      card.className  = `upgrade-card land-expansion-card${bought ? ' upgrade-card-owned' : ''}`;
      card.innerHTML  = `
        <div class="upgrade-card-icon">${upg.icon}</div>
        <div class="upgrade-card-info">
          <div class="upgrade-card-name">${upg.label}</div>
          <div class="upgrade-card-desc">${upg.description}</div>
          ${bought ? '' : `<div class="upgrade-card-cost">${upg.coinCost} 🪙</div>`}
        </div>
        <div class="upgrade-card-action">
          ${bought
            ? '<span class="upgrade-owned-badge">✓ Opened</span>'
            : `<button class="btn-land" data-id="${upg.id}" ${canAfford ? '' : 'disabled'}>
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

    const tier         = this._getTier();
    const upgrades     = this._store.getUpgrades(tier);
    const lockedUpgrades = this._store.getLockedUpgrades(tier);
    const coins        = this._res.get('coins');

    container.innerHTML = '';

    if (upgrades.length === 0 && lockedUpgrades.length === 0) {
      container.innerHTML = '<p class="no-upgrades">Upgrades unlock as you progress. 🌱</p>';
      return;
    }

    for (const upg of upgrades) {
      const bought    = this._store.isPurchased(upg.id);
      const prereqOk  = !upg.requires || this._store.isPurchased(upg.requires);
      const canAfford = coins >= upg.coinCost;
      const speedMult = this._store.getSpeedMultiplier(upg.station);
      const card      = document.createElement('div');
      card.className  = `upgrade-card${bought ? ' upgrade-card-owned' : ''}`;
      if (!prereqOk) card.title = `Buy "${this._store.getUpgradeLabel(upg.requires)}" first to unlock this.`;
      card.innerHTML  = `
        <div class="upgrade-card-icon">${upg.icon}</div>
        <div class="upgrade-card-info">
          <div class="upgrade-card-name">${upg.label}</div>
          <div class="upgrade-card-desc">${upg.description} · ${_stationLabel(upg.station)}</div>
          ${bought
            ? `<div class="upgrade-card-speed">⚡ ${_speedLabel(speedMult)} total</div>`
            : `<div class="upgrade-card-cost">${upg.coinCost} 🪙</div>`}
        </div>
        <div class="upgrade-card-action">
          ${bought
            ? '<span class="upgrade-owned-badge">✓ Owned</span>'
            : `<button class="btn-upgrade" data-id="${upg.id}" ${!prereqOk || !canAfford ? 'disabled' : ''}>
                ${!prereqOk ? `Requires: ${this._store.getUpgradeLabel(upg.requires)}` : !canAfford ? `Need ${upg.coinCost - coins} more 🪙` : 'Buy'}
              </button>`}
        </div>`;
      container.appendChild(card);
    }

    for (const upg of lockedUpgrades) {
      const card = document.createElement('div');
      card.className = 'upgrade-card upgrade-card-locked';
      card.innerHTML = `
        <div class="upgrade-card-icon upgrade-card-icon-locked">🔒</div>
        <div class="upgrade-card-info">
          <div class="upgrade-card-name">${upg.label}</div>
          <div class="upgrade-card-desc">${upg.description} · ${_stationLabel(upg.station)}</div>
          <div class="upgrade-card-unlock-tier">Unlocks at Tier ${upg.unlockTier}</div>
        </div>
        <div class="upgrade-card-action">
          <span class="upgrade-locked-badge">🔒 Tier ${upg.unlockTier}</span>
        </div>`;
      container.appendChild(card);
    }

    container.querySelectorAll('.btn-upgrade').forEach(btn => {
      btn.addEventListener('click', () => this._doBuy(btn.dataset.id));
    });
  }

  // ── Actions ───────────────────────────────────────────────────────────────────

  _doSell(key, qty) {
    const result = this._store.sell(key, qty);
    if (result.success) {
      this._bearSpeak?.(BearDialogue.sellReaction(result.coins));
      this._setStatus(result.message);
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function _stationLabel(station) {
  const labels = {
    press: 'Press', fermenter: 'Fermenter', bottling: 'Bottling',
    still: 'Still', barrel: 'Barrel', brew_kettle: 'Brew Kettle', roaster: 'Roaster',
  };
  return labels[station] ?? station;
}

function _speedLabel(mult) {
  if (mult >= 1) return '1× speed';
  return `${Math.round(1 / mult)}× speed`;
}
