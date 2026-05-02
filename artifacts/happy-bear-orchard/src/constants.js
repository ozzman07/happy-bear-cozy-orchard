export const GRID_SIZE = 10;

export const TILE_STATE = {
  LOCKED:      'locked',
  CLEARABLE:   'clearable',
  CLEARED:     'cleared',
  PLANTED:     'planted',
  HARVESTABLE: 'harvestable',
};

export const ACTION = {
  CLEAR:   'clear',
  DIG:     'dig',
  PLANT:   'plant',
  WATER:   'water',
  HARVEST: 'harvest',
};

export const RESOURCE = {
  WOOD:  'wood',
  STONE: 'stone',
  FRUIT: 'fruit',
  CUPS:  'cups',
  JUICE: 'juice',
  CIDER: 'cider',
};

export const RESOURCE_ICONS = {
  [RESOURCE.WOOD]:  '🪵',
  [RESOURCE.STONE]: '🪨',
  [RESOURCE.FRUIT]: '🍎',
  [RESOURCE.CUPS]:  '☕',
  [RESOURCE.JUICE]: '🧃',
  [RESOURCE.CIDER]: '🍺',
};

export const ACTION_COSTS = {
  [ACTION.CLEAR]:   {},
  [ACTION.DIG]:     { [RESOURCE.STONE]: 1 },
  [ACTION.PLANT]:   { [RESOURCE.FRUIT]: 1 },
  [ACTION.WATER]:   {},
  [ACTION.HARVEST]: {},
};

export const ACTION_YIELDS = {
  [ACTION.CLEAR]:   { [RESOURCE.WOOD]: 2 },
  [ACTION.DIG]:     {},
  [ACTION.PLANT]:   {},
  [ACTION.WATER]:   {},
  [ACTION.HARVEST]: { [RESOURCE.FRUIT]: 3, [RESOURCE.CUPS]: 1 },
};

export const ACTION_VALID_STATES = {
  [ACTION.CLEAR]:   [TILE_STATE.CLEARABLE],
  [ACTION.DIG]:     [TILE_STATE.CLEARED],
  [ACTION.PLANT]:   [TILE_STATE.CLEARED],
  [ACTION.WATER]:   [TILE_STATE.PLANTED],
  [ACTION.HARVEST]: [TILE_STATE.HARVESTABLE],
};

export const TILE_VISUAL = {
  [TILE_STATE.LOCKED]:      { emoji: '🔒', color: '#4a3728', label: 'Locked — clear a neighbour first' },
  [TILE_STATE.CLEARABLE]:   { emoji: '🌿', color: '#2e5e30', label: 'Overgrown — clear it!' },
  [TILE_STATE.CLEARED]:     { emoji: '🟫', color: '#7c4b1e', label: 'Cleared soil — dig or plant' },
  [TILE_STATE.PLANTED]:     { emoji: '🌱', color: '#3d6b2a', label: 'Growing plant' },
  [TILE_STATE.HARVESTABLE]: { emoji: '🍎', color: '#1b6b1b', label: 'Ready to harvest!' },
};

export const GROW_TICKS_NEEDED = 5;
export const WATER_GROW_BONUS  = 2;
export const GAME_TICK_MS      = 3000;

// ── Cabin ─────────────────────────────────────────────────────────────────────

export const TOOL = {
  PRESS:     'press',
  FERMENTER: 'fermenter',
  BOTTLING:  'bottling',
};

export const TOOL_STATE = {
  BLUEPRINT:    'blueprint',
  CONSTRUCTING: 'constructing',
  OPERATIONAL:  'operational',
};

export const TOOL_DEFS = {
  [TOOL.PRESS]: {
    name:            '🍎 Cider Press',
    icon:            '🍎',
    description:     'Crush fruit into fresh juice',
    costs:           { [RESOURCE.WOOD]: 4, [RESOURCE.STONE]: 2 },
    constructionSecs: 8,
    action: {
      label:  'Press Fruit',
      costs:  { [RESOURCE.FRUIT]: 2 },
      yields: { [RESOURCE.JUICE]: 1 },
    },
  },
  [TOOL.FERMENTER]: {
    name:            '🪣 Fermenter',
    icon:            '🪣',
    description:     'Ferment juice into cider',
    costs:           { [RESOURCE.WOOD]: 3, [RESOURCE.STONE]: 4 },
    constructionSecs: 12,
    action: {
      label:     'Ferment Juice',
      costs:     { [RESOURCE.JUICE]: 1 },
      yields:    { [RESOURCE.CIDER]: 1 },
      timerSecs:  8,
    },
  },
  [TOOL.BOTTLING]: {
    name:            '🍶 Bottling Station',
    icon:            '🍶',
    description:     'Bottle cider into delicious cups',
    costs:           { [RESOURCE.WOOD]: 5, [RESOURCE.STONE]: 3 },
    constructionSecs: 10,
    action: {
      label:  'Bottle Cider',
      costs:  { [RESOURCE.CIDER]: 1 },
      yields: { [RESOURCE.CUPS]: 3 },
    },
  },
};

export const SCENE = {
  ORCHARD: 'orchard',
  CABIN:   'cabin',
};
