export const GRID_SIZE = 10;

export const TILE_STATE = {
  LOCKED:      'locked',
  CLEARABLE:   'clearable',
  CLEARED:     'cleared',
  PLANTED:     'planted',
  HARVESTABLE: 'harvestable',
};

export const TILE_TYPE = {
  GRASS: 'grass',
  ROCK:  'rock',
  STUMP: 'stump',
};

export const ACTION = {
  CLEAR:   'clear',
  DIG:     'dig',
  PLANT:   'plant',
  WATER:   'water',
  HARVEST: 'harvest',
  MINE:    'mine',
};

export const RESOURCE = {
  WOOD:           'wood',
  STONE:          'stone',
  FRUIT:          'fruit',
  BOTTLES:        'bottles',
  JUICE:          'juice',
  CIDER:          'cider',
  HOPS:           'hops',
  APPLEJACK:      'applejack',
  WHISKEY:        'whiskey',
  FRUIT_BEER:     'fruit_beer',
  COFFEE_BEAN:    'coffee_bean',
  ROASTED_COFFEE: 'roasted_coffee',
  CUPS:           'cups',
};

export const ACTION_COSTS = {
  [ACTION.CLEAR]:   {},
  [ACTION.DIG]:     {},
  [ACTION.PLANT]:   { [RESOURCE.FRUIT]: 1 },
  [ACTION.WATER]:   {},
  [ACTION.HARVEST]: {},
  [ACTION.MINE]:    {},
};

export const ACTION_YIELDS = {
  [ACTION.CLEAR]:   { [RESOURCE.WOOD]: 5 },
  [ACTION.DIG]:     { [RESOURCE.STONE]: 3 },
  [ACTION.PLANT]:   {},
  [ACTION.WATER]:   {},
  [ACTION.HARVEST]: { [RESOURCE.FRUIT]: 3 },
  [ACTION.MINE]:    { [RESOURCE.STONE]: 2 },
};

export const ACTION_VALID_STATES = {
  [ACTION.CLEAR]:   [TILE_STATE.CLEARABLE],
  [ACTION.DIG]:     [TILE_STATE.CLEARABLE, TILE_STATE.CLEARED],
  [ACTION.PLANT]:   [TILE_STATE.CLEARED],
  [ACTION.WATER]:   [TILE_STATE.PLANTED],
  [ACTION.HARVEST]: [TILE_STATE.HARVESTABLE],
  [ACTION.MINE]:    [TILE_STATE.CLEARED],
};

export const TILE_VISUAL = {
  [TILE_STATE.LOCKED]:      { emoji: '🔒', color: '#4a3728', label: 'Locked — clear a neighbour first' },
  [TILE_STATE.CLEARABLE]:   {
    [TILE_TYPE.GRASS]: { emoji: '🌿', color: '#2e5e30', label: 'Overgrown grass — clear for wood!' },
    [TILE_TYPE.ROCK]:  { emoji: '🪨', color: '#6b6b6b', label: 'Rocky outcrop — dig for stone!' },
    [TILE_TYPE.STUMP]: { emoji: '🪵', color: '#8b4513', label: 'Old stump — clear for wood!' },
  },
  [TILE_STATE.CLEARED]:     { emoji: '🟫', color: '#7c4b1e', label: 'Cleared soil — dig or plant' },
  [TILE_STATE.PLANTED]:     { emoji: '�', color: '#3d6b2a', label: 'Apple tree growing' },
  [TILE_STATE.HARVESTABLE]: { emoji: '🍎', color: '#1b6b1b', label: 'Apples ready to harvest!' },
};

export const GROW_TICKS_NEEDED = 5;
export const WATER_GROW_BONUS  = 2;
export const GAME_TICK_MS      = 3000;
