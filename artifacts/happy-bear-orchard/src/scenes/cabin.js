/**
 * CabinScene — Cider Cabin with Press, Fermenter, Bottling Station.
 */
import { BUILD_STATE } from '../systems/construction.js';
import { BearDialogue } from '../systems/BearDialogue.js';

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
    description: 'Bottle cider — plain or a specialty flavor',
    costs: { wood: 5, stone: 3 }, constructionSecs: 10,
    recipeId: 'bottle_cider',
  },
  harvest_bell: {
    id: 'harvest_bell', name: '🔔 Harvest Bell', icon: '🔔',
    description: 'Rings each harvest — automatically collects all ripe crops',
    costs: { wood: 6, stone: 4 }, constructionSecs: 20,
    recipeId: null,
  },
  woodcutter_shed: {
    id: 'woodcutter_shed', name: '🪓 Woodcutter\'s Shed', icon: '🪓',
    description: 'Passively gathers wood every tick — a steady alternative to planting Forest tiles',
    costs: { wood: 12, stone: 8 }, constructionSecs: 25,
    recipeId: null,
  },
  flavor_table: {
    id: 'flavor_table', name: '🍁 Flavor Table', icon: '🍁',
    description: 'Blend cider with fruit into specialty flavors',
    costs: { wood: 6, stone: 3 }, constructionSecs: 15,
    recipeId: 'flavor_autumn_hug',
  },
};

const RECIPE_LABELS = {
  press_juice:              { label: 'Press Fruit',            cost: '2🍎',        yield: '1🧃' },
  ferment_cider:             { label: 'Ferment',                cost: '3🧃',        yield: '1🫗' },
  bottle_cider:              { label: 'Bottle Cider',           cost: '3🫗',        yield: '3🍾' },
  bottle_autumn_hug:         { label: 'Bottle Autumn Hug',      cost: '3🍁',        yield: '3🍶' },
  flavor_autumn_hug:         { label: 'Make Autumn Hug',        cost: '3🫗 + 2🍒',  yield: '3🍁' },
  bottle_cider_creek_blue:   { label: 'Bottle Cider Creek Blue', cost: '3💧',        yield: '3🫙' },
  flavor_cider_creek_blue:   { label: 'Make Cider Creek Blue',  cost: '3🫗 + 2🫐',  yield: '3💧' },
};

// Icons for the "Need N more X" shortfall hint on recipe rows.
const NEEDS_ICON = {
  juice: '🧃', cider: '🫗', fruit: '🍎', wood: '🪵', stone: '🪨',
  bottles: '🍾', cranberry: '🍒', autumn_hug: '🍁',
  blueberry: '🫐', cider_creek_blue: '💧',
};

export class CabinScene {
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
    // Register all tools
    for (const def of Object.values(TOOL_DEFS)) {
      this._cs.register(def.id, def);
    }

    // Re-render on construction events
    this._cs.onChange(evt => {
      this._renderAll();
      if (evt.type === 'ready') {
        this._bearSpeak?.(BearDialogue.toolBuilt(evt.toolId));
        this._setStatus('New tool ready — tap it to start crafting!');
      }
    });

    // Re-render on crafting events (dialogue handled centrally in main.js)
    this._craft.onChange(() => this._renderAll());

    // Re-render on resource changes (affordability)
    this._res.onChange(() => this._renderAll());

    // Smooth countdown polling
    this._pollTimer = setInterval(() => this._renderAll(), 500);

    this._renderAll();
  }

  onEnter() {
    this._setStatus('Cider Cabin — press, ferment, and bottle your cider! 🏠');
    this._bearSpeak?.(BearDialogue.sceneGreeting('cabin'));
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

    // Wire up delegation once so clicks survive innerHTML replacement
    if (!slot._delegated) {
      slot.addEventListener('click', e => {
        if (e.target.closest('.btn-build')) this._doBuild(toolId);
        const useBtn = e.target.closest('.btn-use');
        if (useBtn) this._doCraft(toolId, useBtn.dataset.recipe);
      });
      slot._delegated = true;
    }

    const state = this._cs.getState(toolId);
    const def   = TOOL_DEFS[toolId];

    let html = '';
    if (state === BUILD_STATE.BLUEPRINT)    html = this._blueprintHTML(def);
    if (state === BUILD_STATE.CONSTRUCTING) html = this._constructingHTML(toolId, def);
    if (state === BUILD_STATE.OPERATIONAL)  html = this._operationalHTML(toolId, def);

    // A station offering more than one recipe (e.g. Bottling: plain vs. Autumn
    // Hug) needs extra room — grow the slot only for those, everyone else keeps
    // the standard compact card.
    const recipeCount = def.recipeId ? this._craft.recipesFor(toolId).length : 1;
    slot.classList.toggle('tool-slot-multi', recipeCount > 1);

    slot.innerHTML = html;
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
    if (!def.recipeId) {
      return `<div class="tool-card tool-operational tool-passive">
        <div class="tool-card-badge">Active</div>
        <div class="tool-card-icon">${def.icon}</div>
        <div class="tool-name">${def.name}</div>
        <div class="tool-desc">${def.description}</div>
        <div class="tool-passive-label">✅ Running automatically</div>
      </div>`;
    }

    // A station can offer more than one recipe (e.g. Bottling: plain cider vs.
    // Autumn Hug) — recipesFor() returns every one unlocked at the current tier,
    // so a single-recipe station just renders one row, same as before.
    const recipes   = this._craft.recipesFor(toolId);
    const busy      = this._craft.isBusy(toolId);
    const secsLeft  = this._craft.secsRemaining(toolId);
    const activeId  = this._craft.activeRecipeId(toolId);
    const automated = this._isAutomated(toolId);
    const craftPct  = busy ? this._craft.progressPct(toolId) : 0;

    const rows = recipes.map(recipe => {
      const rl        = RECIPE_LABELS[recipe.id] ?? {};
      const isRunning = busy && activeId === recipe.id;
      const canAfford = this._res.canAfford(recipe.inputs);

      // Build a shortfall hint when idle and can't afford — e.g. "Need 2 more 🧃"
      let needsHint = '';
      if (!busy && !canAfford) {
        const parts = Object.entries(recipe.inputs)
          .map(([res, needed]) => {
            const have  = this._res.amounts[res] ?? 0;
            const short = needed - have;
            if (short <= 0) return null;
            return `${short} more ${NEEDS_ICON[res] ?? res}`;
          })
          .filter(Boolean);
        if (parts.length) needsHint = `<div class="tool-needs">Need ${parts.join(', ')}</div>`;
      }

      return `<div class="tool-recipe-row">
        <div class="tool-recipe">${rl.cost ?? ''} → ${rl.yield ?? ''}</div>
        ${isRunning ? '' : needsHint}
        <button class="btn-use" data-recipe="${recipe.id}"${(canAfford && !busy) ? '' : ' disabled'}>
          ${isRunning ? `⏳ ${secsLeft}s` : (rl.label ?? 'Use')}
        </button>
      </div>`;
    }).join('');

    return `<div class="tool-card tool-operational${busy?' tool-busy':''}">
      <div class="tool-card-badge">Operational${automated ? ' 🤖' : ''}</div>
      <div class="tool-card-icon">${def.icon}</div>
      <div class="tool-name">${def.name}</div>
      <div class="tool-desc">${busy ? `⏳ Working… ${secsLeft}s` : def.description}</div>
      ${busy ? `<div class="tool-progress-bar"><div class="tool-progress-fill craft-fill" style="width:${craftPct}%"></div></div>` : ''}
      <div class="tool-recipe-rows">${rows}</div>
    </div>`;
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  _doBuild(toolId) {
    const r = this._cs.build(toolId);
    if (!r.success) { this._setStatus('⚠ ' + r.message); this._bearSpeak?.(r.message); }
    this._renderTool(toolId);
  }

  _doCraft(toolId, recipeId) {
    const r = this._craft.craft(recipeId, toolId);
    if (!r.success) { this._setStatus('⚠ ' + r.message); this._bearSpeak?.(r.message); }
    else this._setStatus('Crafting started! 🍺');
    this._renderTool(toolId);
  }

  _setStatus(msg) { if (this._statusEl) this._statusEl.textContent = msg; }
}
