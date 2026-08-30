export const GRID_SIZE = 10;
export const GRID_GROWTH_PER_TIER = 2; // extra rows+cols of fresh frontier added each tier milestone
export const OUTPOST_GROWTH_AMOUNT = 3; // fresh rows/cols added to one edge per outpost purchase
export const MAX_GRID_DIMENSION = 30;   // safety cap so the board can't grow without bound
export const UNLOCK_TILE_COST = 40;     // coins to unlock one locked tile early, bypassing tier/zone gates —
                                         // priced above every zone's per-tile price (Hop Fields ~17.5, Coffee
                                         // Grove 35) so buying a whole zone/outpost always stays the better deal

export const TILE_STATE = {
  LOCKED:      'locked',
  CLEARABLE:   'clearable',
  CLEARED:     'cleared',
  PLANTED:     'planted',
  HARVESTABLE: 'harvestable',
  ROTTED:      'rotted',
  MINE_SHAFT:  'mine_shaft',
  MINING:      'mining',
};

export const TILE_TYPE = {
  GRASS: 'grass',
  ROCK:  'rock',
  STUMP: 'stump',
};

export const ACTION = {
  CLEAR:       'clear',
  DIG:         'dig',
  PLANT:       'plant',
  WATER:       'water',
  HARVEST:     'harvest',
  MINE:        'mine',
  COMPOST:     'compost',
  UNLOCK:      'unlock',
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
  [ACTION.CLEAR]:      {},
  [ACTION.DIG]:        {},
  [ACTION.PLANT]:      { [RESOURCE.FRUIT]: 1 },
  [ACTION.WATER]:      {},
  [ACTION.HARVEST]:    {},
  [ACTION.MINE]:       {},
  [ACTION.COMPOST]:    {},
  [ACTION.UNLOCK]:     { coins: UNLOCK_TILE_COST },
};

export const ACTION_YIELDS = {
  [ACTION.CLEAR]:      { [RESOURCE.WOOD]: 1 },
  [ACTION.DIG]:        { [RESOURCE.STONE]: 3 },
  [ACTION.PLANT]:      {},
  [ACTION.WATER]:      {},
  [ACTION.HARVEST]:    { [RESOURCE.FRUIT]: 3 },  // overridden in tiles.js per crop
  [ACTION.MINE]:       {},   // stone awarded after MINE_SECS delay, not immediately
  [ACTION.COMPOST]:    {},   // rotted apple lost — no yield
  [ACTION.UNLOCK]:     {},
};

export const MINE_SECS   = 15;
export const MINE_YIELD  = { [RESOURCE.STONE]: 2 };

export const ACTION_VALID_STATES = {
  [ACTION.CLEAR]:      [TILE_STATE.CLEARABLE, TILE_STATE.PLANTED, TILE_STATE.HARVESTABLE, TILE_STATE.ROTTED, TILE_STATE.MINE_SHAFT],
  [ACTION.DIG]:        [TILE_STATE.CLEARABLE],
  [ACTION.PLANT]:      [TILE_STATE.CLEARED],
  [ACTION.WATER]:      [TILE_STATE.PLANTED],
  [ACTION.HARVEST]:    [TILE_STATE.HARVESTABLE],
  [ACTION.MINE]:       [TILE_STATE.CLEARED, TILE_STATE.MINE_SHAFT],
  [ACTION.COMPOST]:    [TILE_STATE.ROTTED],
  [ACTION.UNLOCK]:     [TILE_STATE.LOCKED],
};

export const TILE_VISUAL = {
  [TILE_STATE.LOCKED]:      { emoji: '🔒', color: '#4a3728', label: 'Locked — clear a neighbour first, or unlock early for coins' },
  [TILE_STATE.CLEARABLE]:   {
    [TILE_TYPE.GRASS]: { emoji: '🌿', color: '#2e5e30', label: 'Overgrown grass — clear for wood!' },
    [TILE_TYPE.ROCK]:  { emoji: '🪨', color: '#6b6b6b', label: 'Rocky outcrop — dig for stone!' },
    [TILE_TYPE.STUMP]: { emoji: '🪵', color: '#8b4513', label: 'Old stump — clear for wood!' },
  },
  [TILE_STATE.CLEARED]:     { emoji: '🟫', color: '#7c4b1e', label: 'Cleared soil — plant a tree or set up a mine' },
  [TILE_STATE.PLANTED]:     { emoji: '🌱', color: '#3d6b2a', label: 'Apple tree growing' },
  [TILE_STATE.HARVESTABLE]: { emoji: '🍎', color: '#1b6b1b', label: 'Apples ready to harvest!' },
  [TILE_STATE.ROTTED]:      { emoji: '🍂', color: '#5a3a1a', label: 'Apples rotted — compost to replant or clear to bare soil' },
  [TILE_STATE.MINE_SHAFT]:  { emoji: '⛏️', color: '#4a4040', label: 'Mine shaft — mine for stone' },
  [TILE_STATE.MINING]:      { emoji: '⛏️', color: '#2a2030', label: 'Mining in progress…' },
};

// Visuals for non-apple crops on PLANTED/HARVESTABLE tiles (apple uses the TILE_VISUAL default).
export const CROP_VISUAL = {
  hops:   { growing: '🌱', ready: '🌾', growColor: '#4d5a1e', readyColor: '#7a8a1e', label: 'Hops' },
  coffee: { growing: '🌱', ready: '☕', growColor: '#3a2a1e', readyColor: '#5a3d28', label: 'Coffee' },
  timber: { growing: '🌲', ready: '🪵', growColor: '#1e4d18', readyColor: '#3a6e24', label: 'Timber' },
  cranberry: { growing: '🌱', ready: '🍒', growColor: '#5a1e2e', readyColor: '#8a1e35', label: 'Cranberries' },
  blueberry: { growing: '🌱', ready: '🫐', growColor: '#1e3a5a', readyColor: '#2e6a9e', label: 'Blueberries' },
};

export const GROW_TICKS_NEEDED   = 7;
export const WATER_GROW_BONUS    = 2;
export const TICKS_PER_DAY      = 20;
export const ROT_TICKS_NEEDED    = 14 * TICKS_PER_DAY;  // apples rot after 14 days unharvested
export const GAME_TICK_MS        = 3000;

// ── Economy pressure: demand pricing, shelf spoilage, auto-sell ────────────
// Shipped as one bundle — see docs/TODO.md. All three unlock together so
// demand pricing (which makes dump-selling costly) never appears without
// auto-sell (the tool that avoids dump-selling) already available.
export const ECONOMY_PRESSURE_UNLOCK_TIER = 3;

// Raw harvested crops only, not crafted/bottled goods — matches the original
// complaint ("apples just sit on the shelf forever"), not a blanket rule.
export const PERISHABLE_RESOURCES = ['fruit', 'cranberry', 'blueberry', 'hops', 'coffee_bean'];
export const SHELF_ROT_TICKS_NEEDED = 10 * TICKS_PER_DAY; // a pile spoils 10 days after it was last empty
export const SHELF_SPOILAGE_PCT_PER_TICK = 0.05; // 5% of current stock lost per tick once spoiling starts

// Supply-pressure demand: each sale nudges that item's own price down;
// recovers daily. Multiplies on top of the existing market-level multiplier.
export const DEMAND_DROP_PER_UNIT_SOLD = 0.01; // -1% of full price per unit sold in one sale
export const DEMAND_MIN_MULTIPLIER     = 0.5;  // price can never drop below 50% from supply pressure alone
export const DEMAND_RECOVERY_PER_DAY   = 0.05; // +5 percentage points toward full price each day

// Auto-sell trickles the excess above a per-item reserve rather than dumping
// it — sells this fraction of the excess each day, so it asymptotically
// approaches the reserve instead of ever emptying the stack in one shot.
export const AUTO_SELL_TRICKLE_PCT = 0.5;
