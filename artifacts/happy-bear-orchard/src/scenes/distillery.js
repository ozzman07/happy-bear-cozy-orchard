/**
 * DistilleryScene — Applejack & Apple Whiskey production.
 * Unlocked at Tier 2.
 */
import { BUILD_STATE } from '../systems/construction.js';
import { BearDialogue } from '../systems/BearDialogue.js';

const TOOL_DEFS = {
  still: {
    id: 'still', name: '🫧 Copper Still', icon: '🫧',
    description: 'Distil cider into Applejack',
    costs: { wood: 8, stone: 6 }, constructionSecs: 15,
    recipeId: 'distill_applejack',
  },
  barrel: {
    id: 'barrel', name: '🛢️ Aging Barrel', icon: '🛢️',
    description: 'Age Applejack into Apple Whiskey',
    costs: { wood: 10, stone: 4 }, constructionSecs: 20,
    recipeId: 'distill_whiskey',
  },
};

const RECIPE_LABELS = {
  distill_applejack: { label: 'Distil',       cost: '2🫗', yield: '1🥃' },
  distill_whiskey:   { label: 'Age Whiskey',  cost: '2🥃', yield: '1🪣' },
};

export class DistilleryScene {
  constructor({ construction, crafting, resources, statusEl, bearSpeakFn }) {
    this._cs        = construction;
    this._craft     = crafting;
    this._res       = resources;
    this._statusEl  = statusEl;
    this._bearSpeak = bearSpeakFn;
    this._pollTimer = null;
  }

  init() {
    for (const def of Object.values(TOOL_DEFS)) this._cs.register(def.id, def);

    this._cs.onChange(evt => {
      this._renderAll();
      if (evt.type === 'ready') this._bearSpeak?.(BearDialogue.toolBuilt(evt.toolId));
    });
    this._craft.onChange(() => this._renderAll());
    this._res.onChange(() => this._renderAll());
    this._pollTimer = setInterval(() => this._renderAll(), 500);
    this._renderAll();
  }

  onEnter() {
    this._setStatus('Distillery — distil cider into Applejack, then Whiskey! 🥃');
    this._bearSpeak?.(BearDialogue.sceneGreeting('distillery'));
    this._renderAll();
  }

  destroy() { clearInterval(this._pollTimer); }

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

    slot.querySelector('.btn-build')?.addEventListener('click', () => {
      const r = this._cs.build(toolId);
      if (!r.success) { this._setStatus('⚠ ' + r.message); }
      this._renderTool(toolId);
    });
    slot.querySelector('.btn-use')?.addEventListener('click', () => {
      const r = this._craft.craft(def.recipeId, toolId);
      if (!r.success) { this._setStatus('⚠ ' + r.message); }
      else this._setStatus('Distilling… 🫧');
      this._renderTool(toolId);
    });
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
    const secs = this._cs.secsRemaining(toolId);
    const pct  = Math.min(100, Math.round((1 - secs / def.constructionSecs) * 100));
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
      <div class="tool-desc">${busy ? `⏳ ${secsLeft}s` : def.description}</div>
      <button class="btn-use"${(canAfford && !busy) ? '' : ' disabled'}>
        ${busy ? `⏳ ${secsLeft}s` : (rl.label ?? 'Use')}
      </button>
    </div>`;
  }

  _setStatus(msg) { if (this._statusEl) this._statusEl.textContent = msg; }
}
