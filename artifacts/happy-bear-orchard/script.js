import { ResourceManager } from './src/resources.js';
import { Grid }            from './src/grid.js';
import { UI }              from './src/ui.js';
import { ActionMenu }      from './src/actionMenu.js';
import { GameLoop }        from './src/gameLoop.js';
import { GAME_TICK_MS }    from './src/constants.js';

// ── Boot ──────────────────────────────────────────────────────────────────────

const resources  = new ResourceManager();
const grid       = new Grid();
const ui         = new UI();

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

// ── Reactive bindings ─────────────────────────────────────────────────────────

resources.onChange(amounts  => ui.updateResources(amounts));
grid.onChange(tiles         => ui.updateAllTiles(tiles));

// ── Initial render ────────────────────────────────────────────────────────────

ui.initGrid(grid.tiles, tile => actionMenu.show(tile, resources));
ui.updateResources(resources.amounts);
ui.updateDay(1);
ui.setStatus('Welcome to Happy Bear Cozy Orchard! 🐻  Click a tile to get started.');

// ── Game loop ─────────────────────────────────────────────────────────────────

gameLoop.onNewDay(day => {
  ui.setStatus(`Day ${day} begins — keep building your orchard! 🌳`);
});

gameLoop.start();

// ── Greeting ──────────────────────────────────────────────────────────────────

setTimeout(() => ui.bearSpeak('Welcome to the orchard! 🌿'), 800);
