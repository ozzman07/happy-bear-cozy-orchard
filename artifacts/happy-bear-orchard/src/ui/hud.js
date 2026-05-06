/**
 * HUD — updates the top resource bar and day counter.
 */
const RESOURCE_DISPLAY = [
  { key: 'wood',           id: 'count-wood',       icon: '🪵', label: 'Wood' },
  { key: 'stone',          id: 'count-stone',      icon: '🪨', label: 'Stone' },
  { key: 'fruit',          id: 'count-fruit',      icon: '🍎', label: 'Fruit' },
  { key: 'juice',          id: 'count-juice',      icon: '🧃', label: 'Juice' },
  { key: 'cider',          id: 'count-cider',      icon: '🫗', label: 'Cider' },
  { key: 'bottles',        id: 'count-bottles',    icon: '🍾', label: 'Bottles',       tier: 1 },
  { key: 'hops',           id: 'count-hops',       icon: '🌾', label: 'Hops',          tier: 4 },
  { key: 'applejack',      id: 'count-applejack',  icon: '🥃', label: 'Applejack',     tier: 2 },
  { key: 'whiskey',        id: 'count-whiskey',    icon: '🪣', label: 'Whiskey',       tier: 3 },
  { key: 'fruit_beer',     id: 'count-fruitbeer',  icon: '🍺', label: 'Fruit Beer',    tier: 4 },
  { key: 'coffee_bean',    id: 'count-coffee',     icon: '🫘', label: 'Coffee Beans',  tier: 5 },
  { key: 'roasted_coffee', id: 'count-roasted',    icon: '🤎', label: 'Roasted',       tier: 5 },
  { key: 'cups',           id: 'count-cups',       icon: '☕', label: 'Cups',          tier: 5 },
];

export class HUD {
  constructor() {
    this._resContainer = document.getElementById('resources');
    this._dayEl        = document.getElementById('day-num');
    this._tierEl       = document.getElementById('tier-name');
    this._builtItems   = new Set();
  }

  /** Show resource items for the current progression tier. */
  syncTier(tier) {
    for (const r of RESOURCE_DISPLAY) {
      if (r.tier !== undefined && r.tier > tier) continue;
      if (this._builtItems.has(r.id)) continue;

      const el = document.createElement('div');
      el.className    = 'resource-item';
      el.id           = `res-${r.key}`;
      el.innerHTML    = `
        <span class="res-icon">${r.icon}</span>
        <span class="res-label">${r.label}</span>
        <span class="res-count" id="${r.id}">0</span>`;
      this._resContainer.appendChild(el);
      this._builtItems.add(r.id);
    }
  }

  updateResources(amounts) {
    for (const r of RESOURCE_DISPLAY) {
      const el = document.getElementById(r.id);
      if (!el) continue;
      el.textContent = amounts[r.key] ?? 0;
      const wrap = document.getElementById(`res-${r.key}`);
      if (wrap) wrap.classList.toggle('res-zero', !(amounts[r.key] > 0));
    }
  }

  updateDay(day)   { if (this._dayEl)  this._dayEl.textContent  = day; }
  updateTier(name) { if (this._tierEl) this._tierEl.textContent = name; }
}
