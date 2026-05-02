import { ResourceManager } from './src/resources.js';
import { Grid }            from './src/grid.js';
import { UI }              from './src/ui.js';
import { ActionMenu }      from './src/actionMenu.js';
import { GameLoop }        from './src/gameLoop.js';
import { SceneManager }    from './src/sceneManager.js';
import { Cabin }           from './src/cabin.js';
import { GAME_TICK_MS, SCENE } from './src/constants.js';

// ── Core systems ───────────────────────────────────────────────────────────────

const resources    = new ResourceManager();
const grid         = new Grid();
const ui           = new UI();
const scenes       = new SceneManager();
const cabin        = new Cabin(resources, ui);

const actionMenu = new ActionMenu((tile, action) => {
  const result = grid.performAction(tile, action, resources);
  if (result.success) {
    ui.updateTile(tile);
    ui.setStatus('Action complete! Keep going 🌿');
  } else {
    ui.setStatus(`⚠ ${result.message}`);
    ui.bearSpeak(result.message);
  }
});

const gameLoop = new GameLoop({ grid, ui, resources, tickMs: GAME_TICK_MS });

// ── Reactive bindings ──────────────────────────────────────────────────────────

resources.onChange(amounts => ui.updateResources(amounts));
grid.onChange(tiles        => ui.updateAllTiles(tiles));

// ── Scene switching ────────────────────────────────────────────────────────────

scenes.onChange(scene => {
  if (scene === SCENE.CABIN) {
    ui.setStatus('Welcome to the Cider Cabin! Build tools to make cider. 🏠');
    ui.bearSpeak('Let\'s make some cider! 🍺');
  } else {
    ui.setStatus('Back in the orchard! 🌿');
  }
});

document.getElementById('btn-enter-cabin')
  .addEventListener('click', () => scenes.switchTo(SCENE.CABIN));

document.getElementById('btn-back-orchard')
  .addEventListener('click', () => scenes.switchTo(SCENE.ORCHARD));

// ── Initial render ─────────────────────────────────────────────────────────────

scenes.init();
cabin.init();

ui.initGrid(grid.tiles, tile => actionMenu.show(tile, resources));
ui.updateResources(resources.amounts);
ui.updateDay(1);
ui.setStatus('Welcome to Happy Bear Cozy Orchard! 🐻  Click a tile to get started.');

// ── Game loop ──────────────────────────────────────────────────────────────────

gameLoop.onNewDay(day => {
  ui.setStatus(`Day ${day} begins — keep building your orchard! 🌳`);
});

gameLoop.start();

// ── Greeting ───────────────────────────────────────────────────────────────────

setTimeout(() => ui.bearSpeak('Welcome to the orchard! 🌿'), 800);
