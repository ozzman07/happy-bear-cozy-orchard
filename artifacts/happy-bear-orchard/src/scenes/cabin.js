/**
 * CabinScene — Cider Cabin with Press, Fermenter, Bottling Station.
 */
import { BUILD_STATE } from '../systems/construction.js';

const TOOL_DEFS = {
  press: {
    id: 'press', name: '🍎 Cider Press', icon: '🍎',
    description: 'Crush fruit into fresh juice',
    costs: { wood: 4, stone: 2 }, constructionSecs: 8,
    recipeId: 'press_juice',
  },
  fermenter: {
    id: 'fermenter', name: '🪣 Fermenter', icon: '🪣',
    description: 'Ferment juice into cider',
    costs: { wood: 3, stone: 4 }, constructionSecs: 12,
    recipeId: 'ferment_cider',
  },
  bottling: {
    id: 'bottling', name: '🍶 Bottling Station', icon: '🍶',
    description: 'Bottle cider into cups',
    costs: { wood: 5, stone: 3 }, constructionSecs: 10,
    recipeId: 'bottle_cider',
  },
};

const RECIPE_LABELS = {
  press_juice:    { label: 'Press Fruit',  cost: '2🍎', yield: '1🧃' },
  ferment_cider:  { label: 'Ferment',      cost: '1🧃', yield: '1🫗' },
  bottle_cider:   { label: 'Bottle Cider', cost: '1🫗', yield: '3🍾' },
};

export class CabinScene {
  constructor({ construction, crafting, resources, statusEl, bearSpeakFn }) {
    this._cs         = construction;
    this._craft      = crafting;
    this._res        = resources;
    this._statusEl   = statusEl;
    this._bearSpeak  = bearSpeakFn;
    this._pollTimer  = null;
  }

  init() {
    // Register all tools
    for (const def of Object.values(TOOL_DEFS)) {
      this._cs.register(def.id, def);
    }

    // Re-render on construction events
    this._cs.onChange(evt => {
      this._renderAll();
      if (evt.type === 'ready') {
        this._bearSpeak?.(`${TOOL_DEFS[evt.toolId]?.name} is ready! 🎉`);
        this._setStatus('New tool ready — tap it to make cider!');
      }
    });

    // Re-render on crafting events
    this._craft.onChange(evt => {
      this._renderAll();
      if (evt.type === 'done') {
        this._bearSpeak?.('Done! Check your resources 🍺');
        this._setStatus('Crafting complete!');
      }
    });

    // Re-render on resource changes (affordability)
    this._res.onChange(() => this._renderAll());

    // Smooth countdown polling
    this._pollTimer = setInterval(() => this._renderAll(), 500);

    this._renderAll();
  }

  onEnter() {
    this._setStatus('Welcome to the Cider Cabin! Build tools to make cider. 🏠');
    this._bearSpeak?.("Let's make some cider! 🍺");
    this._renderAll();
  }

  destroy() { clearInterval(this._pollTimer); }

  // ── Rendering ──────────────────────────────────────────────────────────────

  _renderAll() {
    for (const toolId of Object.keys(TOOL_DEFS)) this._renderTool(toolId);
  }

  _renderTool(toolId) {
    const slot = document.getElementById(`tool-slot-${toolId}`);
    if (!slot) return;
    const state = this._cs.getState(toolId);
    const def   = TOOL_DEFS[toolId];

    let html = '';
    if (state === BUILD_STATE.BLUEPRINT)    html = this._blueprintHTML(def);
    if (state === BUILD_STATE.CONSTRUCTING) html = this._constructingHTML(toolId, def);
    if (state === BUILD_STATE.OPERATIONAL)  html = this._operationalHTML(toolId, def);

    slot.innerHTML = html;
    slot.querySelector('.btn-build')?.addEventListener('click', () => this._doBuild(toolId));
    slot.querySelector('.btn-use')?.addEventListener('click', () => this._doCraft(toolId, def));
  }

  _blueprintHTML(def) {
    const costStr   = Object.entries(def.costs).map(([r,a])=>`${a} ${r}`).join(' + ');
    const canAfford = this._res.canAfford(def.costs);
    return `<div class="tool-card tool-blueprint${canAfford?'':' tool-broke'}">
      <div class="tool-card-badge">Blueprint</div>
      <div class="tool-card-icon">📐</div>
      <div class="tool-name">${def.name}</div>
      <div class="tool-desc">${def.description}</div>
      <div class="tool-cost">Cost: ${costStr}</div>
      <button class="btn-build"${canAfford?'':' disabled'}>🔨 Build</button>
    </div>`;
  }

  _constructingHTML(toolId, def) {
    const secs  = this._cs.secsRemaining(toolId);
    const total = def.constructionSecs;
    const pct   = Math.min(100, Math.round((1 - secs / total) * 100));
    return `<div class="tool-card tool-constructing">
      <div class="tool-card-badge">Building</div>
      <div class="tool-card-icon hammer-anim">🔨</div>
      <div class="tool-name">${def.name}</div>
      <div class="tool-building-text">Building… ${secs}s left</div>
      <div class="tool-progress-bar"><div class="tool-progress-fill" style="width:${pct}%"></div></div>
    </div>`;
  }

  _operationalHTML(toolId, def) {
    const rl        = RECIPE_LABELS[def.recipeId] ?? {};
    const busy      = this._craft.isBusy(toolId);
    const secsLeft  = this._craft.secsRemaining(toolId);
    const recipe    = this._craft.getRecipe(def.recipeId);
    const canAfford = recipe ? this._res.canAfford(recipe.inputs) : false;
    return `<div class="tool-card tool-operational${busy?' tool-busy':''}">
      <div class="tool-card-badge">Operational</div>
      <div class="tool-card-icon">${def.icon}</div>
      <div class="tool-name">${def.name}</div>
      <div class="tool-recipe">${rl.cost ?? ''} → ${rl.yield ?? ''}</div>
      <div class="tool-desc">${busy ? `⏳ Working… ${secsLeft}s` : def.description}</div>
      <button class="btn-use"${(canAfford && !busy) ? '' : ' disabled'}>
        ${busy ? `⏳ ${secsLeft}s` : (rl.label ?? 'Use')}
      </button>
    </div>`;
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  _doBuild(toolId) {
    const r = this._cs.build(toolId);
    if (!r.success) { this._setStatus('⚠ ' + r.message); this._bearSpeak?.(r.message); }
    this._renderTool(toolId);
  }

  _doCraft(toolId, def) {
    const r = this._craft.craft(def.recipeId, toolId);
    if (!r.success) { this._setStatus('⚠ ' + r.message); this._bearSpeak?.(r.message); }
    else this._setStatus('Crafting started! 🍺');
    this._renderTool(toolId);
  }

  _setStatus(msg) { if (this._statusEl) this._statusEl.textContent = msg; }
}
