import {
  TOOL, TOOL_STATE, TOOL_DEFS, RESOURCE_ICONS,
} from './constants.js';

export class Cabin {
  constructor(resources, ui) {
    this._resources = resources;
    this._ui        = ui;

    this._tools = {
      [TOOL.PRESS]:     { state: TOOL_STATE.BLUEPRINT, constructionEnd: null, actionBusy: false, actionEnd: null },
      [TOOL.FERMENTER]: { state: TOOL_STATE.BLUEPRINT, constructionEnd: null, actionBusy: false, actionEnd: null },
      [TOOL.BOTTLING]:  { state: TOOL_STATE.BLUEPRINT, constructionEnd: null, actionBusy: false, actionEnd: null },
    };

    // Re-render tool affordability whenever resources change
    this._resources.onChange(() => this._renderAllTools());

    // Poll every 500 ms for smooth countdown timers
    setInterval(() => this._poll(), 500);
  }

  /** Call once after DOM is ready to do the initial render. */
  init() {
    this._renderAllTools();
  }

  // ── Public actions ──────────────────────────────────────────────────────────

  buildTool(toolId) {
    const tool = this._tools[toolId];
    const def  = TOOL_DEFS[toolId];

    if (tool.state !== TOOL_STATE.BLUEPRINT) {
      return { success: false, message: 'Already built or building.' };
    }
    if (!this._resources.canAfford(def.costs)) {
      return { success: false, message: 'Not enough resources!' };
    }

    this._resources.spend(def.costs);
    tool.state           = TOOL_STATE.CONSTRUCTING;
    tool.constructionEnd = Date.now() + def.constructionSecs * 1000;
    this._renderTool(toolId);
    return { success: true };
  }

  useTool(toolId) {
    const tool = this._tools[toolId];
    const def  = TOOL_DEFS[toolId];

    if (tool.state !== TOOL_STATE.OPERATIONAL) {
      return { success: false, message: 'Tool not ready yet.' };
    }
    if (tool.actionBusy) {
      return { success: false, message: 'Tool is already working!' };
    }

    const action = def.action;
    if (!this._resources.canAfford(action.costs)) {
      return { success: false, message: 'Not enough resources!' };
    }

    this._resources.spend(action.costs);

    if (action.timerSecs) {
      tool.actionBusy = true;
      tool.actionEnd  = Date.now() + action.timerSecs * 1000;
      this._renderTool(toolId);

      setTimeout(() => {
        for (const [res, amt] of Object.entries(action.yields)) {
          this._resources.add(res, amt);
        }
        tool.actionBusy = false;
        tool.actionEnd  = null;
        this._renderTool(toolId);
        this._ui?.bearSpeak('Fermentation done! 🍺');
        this._ui?.setStatus('Cider is ready — bottle it at the Bottling Station!');
      }, action.timerSecs * 1000);
    } else {
      for (const [res, amt] of Object.entries(action.yields)) {
        this._resources.add(res, amt);
      }
      this._renderTool(toolId);
    }

    return { success: true };
  }

  // ── Internal ────────────────────────────────────────────────────────────────

  _poll() {
    const now = Date.now();
    for (const [toolId, tool] of Object.entries(this._tools)) {
      if (tool.state === TOOL_STATE.CONSTRUCTING &&
          tool.constructionEnd && now >= tool.constructionEnd) {
        tool.state           = TOOL_STATE.OPERATIONAL;
        tool.constructionEnd = null;
        this._ui?.bearSpeak(`${TOOL_DEFS[toolId].name} is ready! 🎉`);
        this._ui?.setStatus('New tool ready — tap it to start the cider workflow!');
      }
    }
    // Always re-render to keep countdowns live
    this._renderAllTools();
  }

  _renderAllTools() {
    for (const toolId of Object.keys(TOOL_DEFS)) {
      this._renderTool(toolId);
    }
  }

  _renderTool(toolId) {
    const slot = document.getElementById(`tool-slot-${toolId}`);
    if (!slot) return;

    const tool = this._tools[toolId];
    const def  = TOOL_DEFS[toolId];

    slot.innerHTML = this._getHTML(toolId, tool, def);

    // Wire build button
    slot.querySelector('.btn-build')?.addEventListener('click', () => {
      const r = this.buildTool(toolId);
      if (!r.success) {
        this._ui?.setStatus('⚠ ' + r.message);
        this._ui?.bearSpeak(r.message);
      }
    });

    // Wire use button
    slot.querySelector('.btn-use')?.addEventListener('click', () => {
      const r = this.useTool(toolId);
      if (!r.success) {
        this._ui?.setStatus('⚠ ' + r.message);
        this._ui?.bearSpeak(r.message);
      } else {
        this._ui?.setStatus('Action underway! 🍺');
      }
    });
  }

  _getHTML(toolId, tool, def) {
    switch (tool.state) {
      case TOOL_STATE.BLUEPRINT:    return this._blueprintHTML(def);
      case TOOL_STATE.CONSTRUCTING: return this._constructingHTML(def, tool);
      case TOOL_STATE.OPERATIONAL:  return this._operationalHTML(def, tool);
    }
    return '';
  }

  _blueprintHTML(def) {
    const costStr  = Object.entries(def.costs)
      .map(([r, a]) => `${a}${RESOURCE_ICONS[r]}`).join(' + ');
    const canAfford = this._resources.canAfford(def.costs);
    return `
      <div class="tool-card tool-blueprint${canAfford ? '' : ' tool-broke'}">
        <div class="tool-card-badge">Blueprint</div>
        <div class="tool-card-icon">📐</div>
        <div class="tool-name">${def.name}</div>
        <div class="tool-desc">${def.description}</div>
        <div class="tool-cost">Cost: ${costStr}</div>
        <button class="btn-build"${canAfford ? '' : ' disabled'}>🔨 Build</button>
      </div>`;
  }

  _constructingHTML(def, tool) {
    const remaining = Math.max(0, Math.ceil((tool.constructionEnd - Date.now()) / 1000));
    const total     = def.constructionSecs;
    const pct       = Math.min(100, Math.round((1 - remaining / total) * 100));
    return `
      <div class="tool-card tool-constructing">
        <div class="tool-card-badge">Building</div>
        <div class="tool-card-icon hammer-anim">🔨</div>
        <div class="tool-name">${def.name}</div>
        <div class="tool-building-text">Building… ${remaining}s left</div>
        <div class="tool-progress-bar">
          <div class="tool-progress-fill" style="width:${pct}%"></div>
        </div>
      </div>`;
  }

  _operationalHTML(def, tool) {
    const action    = def.action;
    const costStr   = Object.entries(action.costs)
      .map(([r, a]) => `${a}${RESOURCE_ICONS[r]}`).join(' + ');
    const yieldStr  = Object.entries(action.yields)
      .map(([r, a]) => `${a}${RESOURCE_ICONS[r]}`).join(' + ');
    const canAfford = this._resources.canAfford(action.costs);
    const busy      = tool.actionBusy;
    const busySecs  = busy ? Math.max(0, Math.ceil((tool.actionEnd - Date.now()) / 1000)) : 0;
    return `
      <div class="tool-card tool-operational${busy ? ' tool-busy' : ''}">
        <div class="tool-card-badge">Operational</div>
        <div class="tool-card-icon">${def.icon}</div>
        <div class="tool-name">${def.name}</div>
        <div class="tool-recipe">${costStr} → ${yieldStr}</div>
        <div class="tool-desc">${busy ? `⏳ Working… ${busySecs}s` : def.description}</div>
        <button class="btn-use"${(canAfford && !busy) ? '' : ' disabled'}>
          ${busy ? `⏳ ${busySecs}s` : action.label}
        </button>
      </div>`;
  }
}
