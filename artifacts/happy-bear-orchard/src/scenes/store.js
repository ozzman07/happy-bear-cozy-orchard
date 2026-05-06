/**
 * StoreScene — sell resources for coins.
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
    this._setStatus('Market — sell your goods for 🪙 coins!');
    this._bearSpeak?.(BearDialogue.sceneGreeting('store'));
    this._render();
  }

  // ── Rendering ──────────────────────────────────────────────────────────────

  _render() {
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

    const coinsEl = document.getElementById('store-coins-total');
    if (coinsEl) coinsEl.textContent = `Total earned: ${this._store.totalEarned} 🪙`;
  }

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

  _setStatus(msg) { if (this._statusEl) this._statusEl.textContent = msg; }
}
