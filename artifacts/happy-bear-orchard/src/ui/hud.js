/**
 * HUD — updates the top resource bar and day counter.
 */
const RESOURCE_DISPLAY = [
  { key: 'wood',           id: 'count-wood',       icon: '🪵', label: 'Wood' },
  { key: 'stone',          id: 'count-stone',      icon: '🪨', label: 'Stone' },
  { key: 'fruit',          id: 'count-fruit',      icon: '🍎', label: 'Apples' },
  { key: 'juice',          id: 'count-juice',      icon: '🧃', label: 'Juice',          tier: 1 },
  { key: 'cider',          id: 'count-cider',      icon: '🫗', label: 'Cider',          tier: 1 },
  { key: 'bottles',        id: 'count-bottles',    icon: '🍾', label: 'Bottles',        tier: 1 },
  { key: 'cranberry',      id: 'count-cranberry',  icon: '🍒', label: 'Cranberries',    tier: 1 },
  { key: 'autumn_hug',     id: 'count-autumnhug',  icon: '🍁', label: 'Autumn Hug',     tier: 1 },
  { key: 'bottled_autumn_hug', id: 'count-autumnhugbottled', icon: '🍶', label: 'Bottled Autumn Hug', tier: 1 },
  { key: 'hops',           id: 'count-hops',       icon: '🌾', label: 'Hops',           tier: 4 },
  { key: 'applejack',      id: 'count-applejack',  icon: '🥃', label: 'Applejack',      tier: 2 },
  { key: 'whiskey',        id: 'count-whiskey',    icon: '🪣', label: 'Whiskey',        tier: 2 },
  { key: 'fruit_beer',     id: 'count-fruitbeer',  icon: '🍺', label: 'Fruit Beer',     tier: 4 },
  { key: 'coffee_bean',    id: 'count-coffee',     icon: '🫘', label: 'Coffee Beans',   tier: 5 },
  { key: 'roasted_coffee', id: 'count-roasted',    icon: '🤎', label: 'Roasted',        tier: 5 },
  { key: 'cups',           id: 'count-cups',       icon: '☕', label: 'Cups',           tier: 5 },
];

export class HUD {
  constructor() {
    this._resContainer = document.getElementById('resources');
    this._dayEl        = document.getElementById('day-num');
    this._tierEl       = document.getElementById('tier-name');
    this._coinsEl      = document.getElementById('hud-coins');
    this._builtItems   = new Set();
    this._prevAmounts  = {};
  }

  syncTier(tier) {
    for (const r of RESOURCE_DISPLAY) {
      if (r.tier !== undefined && r.tier > tier) continue;
      if (this._builtItems.has(r.id)) continue;

      const el = document.createElement('div');
      el.className = 'resource-item';
      el.id        = `res-${r.key}`;
      el.innerHTML = `
        <span class="res-icon">${r.icon}</span>
        <span class="res-label">${r.label}</span>
        <span class="res-count" id="${r.id}">0</span>`;
      this._resContainer.appendChild(el);
      this._builtItems.add(r.id);
    }
  }

  updateResources(amounts) {
    for (const r of RESOURCE_DISPLAY) {
      const el   = document.getElementById(r.id);
      const wrap = document.getElementById(`res-${r.key}`);
      if (!el) continue;

      const prev = this._prevAmounts[r.key] ?? 0;
      const next = amounts[r.key] ?? 0;
      el.textContent = next;

      if (wrap) {
        wrap.classList.toggle('res-zero', next === 0);
        if (next > prev) this._bump(wrap);
      }
    }

    const prevCoins = this._prevAmounts.coins ?? 0;
    const nextCoins = amounts.coins ?? 0;
    if (this._coinsEl) {
      this._coinsEl.textContent = nextCoins;
      if (nextCoins > prevCoins) this._bump(this._coinsEl.closest('#hud-coin-display') ?? this._coinsEl);
    }

    this._prevAmounts = { ...amounts };
  }

  _bump(el) {
    if (!el) return;
    el.classList.remove('res-bump');
    void el.offsetWidth; // reflow to restart animation
    el.classList.add('res-bump');
    el.addEventListener('animationend', () => el.classList.remove('res-bump'), { once: true });
  }

  updateDay(day)   { if (this._dayEl)  this._dayEl.textContent  = day; }
  updateTier(name) { if (this._tierEl) this._tierEl.textContent = name; }
}
