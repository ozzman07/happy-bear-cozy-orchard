/**
 * RoasteryScene — Coffee roasting & Coffee Stout brewing.
 * Unlocked at Tier 5.
 */
import { BUILD_STATE } from '../systems/construction.js';
import { BearDialogue } from '../systems/BearDialogue.js';

const TOOL_DEFS = {
  roaster: {
    id: 'roaster', name: '🫘 Coffee Roaster', icon: '🫘',
    description: 'Roast raw coffee beans into roasted coffee',
    costs: { wood: 8, stone: 10 }, constructionSecs: 15,
    recipeId: 'roast_coffee',
  },
  coffee_brewer: {
    id: 'coffee_brewer', name: '☕ Coffee Brewer', icon: '☕',
    description: 'Brew roasted coffee into cups',
    costs: { wood: 5, stone: 6 }, constructionSecs: 12,
    recipeId: 'brew_coffee',
  },
};

export class RoasteryScene {
  constructor({ construction, crafting, resources, statusEl, bearSpeakFn, isAutomatedFn }) {
    this._cs          = construction;
    this._craft       = crafting;
    this._res         = resources;
    this._statusEl    = statusEl;
    this._bearSpeak   = bearSpeakFn;
    this._isAutomated = isAutomatedFn ?? (() => false);
    this._pollTimer   = null;
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
    this._setStatus('Roastery — roast beans and brew ☕ cups!');
    this._bearSpeak?.(BearDialogue.sceneGreeting('roastery'));
    this._renderAll();
  }

  destroy() { clearInterval(this._pollTimer); }

  _renderAll() {
    for (const toolId of Object.keys(TOOL_DEFS)) this._renderTool(toolId);
  }

  _renderTool(toolId) {
    const slot = document.getElementById(`tool-slot-${toolId}`);
    if (!slot) return;
    const state     = this._cs.getState(toolId);
    const def       = TOOL_DEFS[toolId];
    const secs      = this._cs.secsRemaining(toolId);
    const busy      = this._craft.isBusy(toolId);
    const csecs     = this._craft.secsRemaining(toolId);
    const recipe    = this._craft.getRecipe(def.recipeId);
    const canAfford = recipe ? this._res.canAfford(recipe.inputs) : false;
    const costStr   = Object.entries(def.costs).map(([r,a])=>`${a} ${r}`).join(' + ');
    const pct       = state === BUILD_STATE.CONSTRUCTING
      ? Math.min(100, Math.round((1 - secs / def.constructionSecs) * 100)) : 0;

    let html = '';
    if (state === BUILD_STATE.BLUEPRINT) {
      const ca = this._res.canAfford(def.costs);
      html = `<div class="tool-card tool-blueprint${ca?'':' tool-broke'}">
        <div class="tool-card-badge">Blueprint</div>
        <div class="tool-card-icon">📐</div>
        <div class="tool-name">${def.name}</div>
        <div class="tool-desc">${def.description}</div>
        <div class="tool-cost">Cost: ${costStr}</div>
        <button class="btn-build"${ca?'':' disabled'}>🔨 Build</button>
      </div>`;
    } else if (state === BUILD_STATE.CONSTRUCTING) {
      html = `<div class="tool-card tool-constructing">
        <div class="tool-card-badge">Building</div>
        <div class="tool-card-icon hammer-anim">🔨</div>
        <div class="tool-name">${def.name}</div>
        <div class="tool-building-text">Building… ${secs}s left</div>
        <div class="tool-progress-bar"><div class="tool-progress-fill" style="width:${pct}%"></div></div>
      </div>`;
    } else {
      const automated = this._isAutomated(toolId);
      const craftPct = busy ? this._craft.progressPct(toolId) : 0;
      html = `<div class="tool-card tool-operational${busy?' tool-busy':''}">
        <div class="tool-card-badge">Operational${automated ? ' 🤖' : ''}</div>
        <div class="tool-card-icon">${def.icon}</div>
        <div class="tool-name">${def.name}</div>
        <div class="tool-recipe">${def.recipeId === 'roast_coffee' ? '1🫘 → 1🤎' : '1🤎 → 1☕'}</div>
        <div class="tool-desc">${busy ? `⏳ ${csecs}s` : def.description}</div>
        ${busy ? `<div class="tool-progress-bar"><div class="tool-progress-fill craft-fill" style="width:${craftPct}%"></div></div>` : ''}
        <button class="btn-use"${(canAfford&&!busy)?'':' disabled'}>${busy?`⏳ ${csecs}s`:def.recipeId === 'roast_coffee' ? 'Roast' : 'Brew'}</button>
      </div>`;
    }

    if (!slot._delegated) {
      slot.addEventListener('click', e => {
        const def = TOOL_DEFS[toolId];
        if (e.target.closest('.btn-build')) {
          const r = this._cs.build(toolId);
          if (!r.success) this._setStatus('⚠ ' + r.message);
        }
        if (e.target.closest('.btn-use')) {
          const r = this._craft.craft(def.recipeId, toolId);
          if (!r.success) this._setStatus('⚠ ' + r.message);
          else this._setStatus('Roasting! ☕');
        }
      });
      slot._delegated = true;
    }

    slot.innerHTML = html;
  }

  _setStatus(msg) { if (this._statusEl) this._statusEl.textContent = msg; }
}
