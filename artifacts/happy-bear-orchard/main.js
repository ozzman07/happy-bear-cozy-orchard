/**
 * main.js — Happy Bear Cozy Orchard
 * Entry point. Boots all systems, registers scenes, wires the game loop.
 */

import { ResourceManager }   from './src/systems/resources.js';
import { TileGrid }          from './src/systems/tiles.js';
import { CropSystem }        from './src/systems/crops.js';
import { CraftingSystem }    from './src/systems/crafting.js';
import { ConstructionSystem} from './src/systems/construction.js';
import { ProgressionSystem } from './src/systems/progression.js';

import { SceneManager, SCENES } from './src/scenes/sceneManager.js';
import { OrchardScene }         from './src/scenes/orchard.js';
import { CabinScene }           from './src/scenes/cabin.js';
import { DistilleryScene }      from './src/scenes/distillery.js';
import { BreweryScene }         from './src/scenes/brewery.js';
import { RoasteryScene }        from './src/scenes/roastery.js';

import { HUD }        from './src/ui/hud.js';
import { ActionMenu } from './src/ui/menus.js';

import progressionData from './src/data/progression.json';

// ── Global game state ─────────────────────────────────────────────────────────

const gameState = {
  tier:    0,
  day:     1,
  unlocks: new Set(['orchard']),
};

// ── Core systems ───────────────────────────────────────────────────────────────

const resources    = new ResourceManager();
const tileGrid     = new TileGrid();
const cropSystem   = new CropSystem(tileGrid);
const crafting     = new CraftingSystem(resources, gameState);
const construction = new ConstructionSystem(resources);
const progression  = new ProgressionSystem(gameState, resources);

// ── UI helpers ─────────────────────────────────────────────────────────────────

const hud       = new HUD();
const statusEl  = document.getElementById('status-msg');

const bearSpeak = (msg) => {
  // Speak from whichever bear is currently visible
  ['bear-speech', 'cabin-bear-speech'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 3500);
  });
};

const setStatus = (msg) => { if (statusEl) statusEl.textContent = msg; };

const actionMenu = new ActionMenu((tile, action) => {
  const result = tileGrid.performAction(tile, action, resources);
  if (result.success) {
    setStatus('Action complete! Keep going 🌿');
  } else {
    setStatus('⚠ ' + result.message);
    bearSpeak(result.message);
  }
});

// ── Scenes ─────────────────────────────────────────────────────────────────────

const scenes = new SceneManager();

const orchard = new OrchardScene({
  tileGrid,
  resources,
  actionMenu,
  statusEl,
  bearEl:   document.getElementById('bear-sprite'),
  speechEl: document.getElementById('bear-speech'),
});

const cabin = new CabinScene({
  construction, crafting, resources, statusEl,
  bearSpeakFn: bearSpeak,
});

const distillery = new DistilleryScene({
  construction, crafting, resources, statusEl,
  bearSpeakFn: bearSpeak,
});

const brewery = new BreweryScene({
  construction, crafting, resources, statusEl,
  bearSpeakFn: bearSpeak,
});

const roastery = new RoasteryScene({
  construction, crafting, resources, statusEl,
  bearSpeakFn: bearSpeak,
});

scenes.register(SCENES.ORCHARD,    orchard);
scenes.register(SCENES.CABIN,      cabin);
scenes.register(SCENES.DISTILLERY, distillery);
scenes.register(SCENES.BREWERY,    brewery);
scenes.register(SCENES.ROASTERY,   roastery);

// ── Nav bar buttons ────────────────────────────────────────────────────────────

document.querySelectorAll('[data-scene-target]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.sceneTarget;
    if (!btn.disabled) scenes.switchTo(target);
  });
});

// ── Progression → unlock scenes ────────────────────────────────────────────────

const SCENE_UNLOCK_MAP = {
  cabin:      'nav-cabin',
  distillery: 'nav-distillery',
  brewery:    'nav-brewery',
  roastery:   'nav-roastery',
};

function applyUnlocks(tier) {
  const tierDef = progressionData.tiers[tier];
  if (!tierDef) return;

  for (const u of tierDef.unlocks) {
    const navId = SCENE_UNLOCK_MAP[u];
    if (navId) {
      const btn = document.getElementById(navId);
      if (btn) btn.disabled = false;
    }
  }

  hud.updateTier(`${tierDef.icon} ${tierDef.name}`);
  const badge = document.getElementById('tier-badge');
  if (badge) badge.textContent = `${tierDef.icon} ${tierDef.name}`;
}

progression.onChange(({ tier, def }) => {
  applyUnlocks(tier);
  bearSpeak(`New tier unlocked: ${def.icon} ${def.name}!`);
  setStatus(`🎉 Tier unlocked: ${def.name} — explore the new scene!`);
});

// ── Reactive bindings ──────────────────────────────────────────────────────────

resources.onChange(amounts => {
  hud.updateResources(amounts);
});

// ── Game loop ──────────────────────────────────────────────────────────────────

let tickCount  = 0;
const TICK_MS  = 3000;
const TICKS_PER_DAY = 10;

setInterval(() => {
  tickCount++;

  const ripened = cropSystem.tick();
  if (ripened) {
    bearSpeak('Your crops are ready to harvest! 🍎');
    setStatus('Some plants are ready to harvest — click them!');
  }

  if (tickCount % TICKS_PER_DAY === 0) {
    gameState.day++;
    hud.updateDay(gameState.day);
    const speeches = [
      'Keep growing! 🌱', 'Water your plants! 💧', 'The orchard blooms! 🌸',
      "Don't forget to water! 💧", 'More fruit, more cups! ☕',
    ];
    bearSpeak(speeches[Math.floor(Math.random() * speeches.length)]);
    setStatus(`Day ${gameState.day} begins — keep building your orchard! 🌳`);
  }
}, TICK_MS);

// ── Initial boot ───────────────────────────────────────────────────────────────

hud.syncTier(0);           // render tier-0 resources immediately
hud.updateResources(resources.amounts);
hud.updateDay(1);

const tier0Def = progressionData.tiers[0];
const badge    = document.getElementById('tier-badge');
if (badge && tier0Def) badge.textContent = `${tier0Def.icon} ${tier0Def.name}`;

// Build orchard grid
orchard.init();

// Init all scenes (registers tools, wires listeners)
cabin.init();
distillery.init();
brewery.init();
roastery.init();

// Apply current unlocks (tier 0 only has 'orchard')
applyUnlocks(0);

setStatus('Welcome to Happy Bear Cozy Orchard! 🐻  Click a tile to get started.');
setTimeout(() => bearSpeak('Welcome to the orchard! 🌿'), 800);
