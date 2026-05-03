# Happy Bear Cozy Orchard — Repository Structure & Architecture (v1.0)

This file is the authoritative source for repository structure and architectural organization. All contributors, systems, and AI-assisted development workflows must follow this document exactly.

---

# 1. Repository Overview

## Purpose

This repository contains the complete source code, design documentation, data models, and assets for Happy Bear Cozy Orchard — a tile-based cozy farming and beverage crafting simulation game. The codebase is written in vanilla JavaScript using ES modules, served via Vite, and structured as a pnpm monorepo.

## High-Level Architecture

The game is built as a single browser-based artifact with no backend dependency. All game logic runs client-side. Game state is held in memory during a session. Persistence (save state) is handled through localStorage. The production system is driven by data-first design: recipes, zones, tools, progression, and narrative are all defined as JSON data files that the game systems read at runtime.

## How the Repo Supports Modular Game Development

Every major system — cider, soda, whiskey, beer, coffee, crafting, construction, progression, world — is isolated in its own module. Systems communicate through a shared event bus and the central ResourceManager. Adding a new beverage category requires only: a new data file entry, a new scene file, and registration in main.js. No existing system needs to be modified.

## Philosophy

- **Clarity:** Every file does one thing. Every folder has a clearly defined scope. Names describe intent.
- **Separation of Concerns:** Data lives in `/src/data`. Logic lives in `/src/systems`. Rendering lives in `/src/scenes` and `/src/ui`. Never mix these layers.
- **AI-Readiness:** All documentation is written in structured Markdown. All data is in typed JSON. System interfaces are consistent and well-named. The codebase should be readable and modifiable by any contributor, human or AI, without requiring tribal knowledge.

---

# 2. Top-Level Directory Structure

```
/
├── artifacts/
│   └── happy-bear-orchard/     # Game artifact (Vite app)
│       ├── main.js             # Entry point
│       ├── index.html          # HTML shell
│       ├── style.css           # Global styles
│       ├── vite.config.ts      # Vite configuration
│       └── src/                # All game source code
├── docs/                       # Design documentation suite
├── scripts/                    # Workspace utility scripts
├── lib/                        # Shared workspace libraries (if added)
├── pnpm-workspace.yaml         # pnpm monorepo config
├── package.json                # Root package (tooling only)
└── tsconfig.base.json          # Shared TypeScript config
```

### `/artifacts/happy-bear-orchard/`
The primary game artifact. Contains all code, assets, data, and configuration for the playable game. This is a Vite-served vanilla JS app. All game development happens inside this folder.

### `/docs/`
The authoritative design documentation suite. Contains architecture guides, recipe definitions, world maps, system specifications, narrative content, and repo structure. All game systems must follow these documents. See Section 3.

### `/scripts/`
Workspace-level utility scripts: data validation, asset pipeline helpers, build checks. These are not game code — they are developer tooling. See Section 9.

### `/lib/`
Shared TypeScript libraries for use across multiple artifacts (if the project adds a second artifact such as an API). Currently unused but reserved for future cross-artifact shared code.

---

# 3. /docs Directory Structure

The docs folder is the authoritative design suite for the entire project. Every document is written in structured Markdown and maintained as a living reference. When game systems change, the relevant doc must be updated first.

```
/docs/
├── GameDesign.md       # Master game concept, gameplay loop, categories, tone
├── Recipes.md          # All beverage recipes, ingredients, tools, unlock conditions
├── Progression.md      # Cabin levels, zone unlocks, seasonal progression, story acts
├── Tools.md            # All 11 tools, construction costs, upgrade paths, dependencies
├── WorldMap.md         # All 12 zones, tile types, biomes, expansion logic
├── Systems.md          # All 16 production, crafting, economy, and seasonal systems
├── Narrative.md        # Characters, story acts, flavor lore, special moments
├── RepoStructure.md    # This file — repo layout, architecture, standards
└── DataModels.md       # JSON schema definitions for all data files (see below)
```

### How These Documents Form the Authoritative Design Suite

| Document | Authority Over |
|---|---|
| `GameDesign.md` | What the game is, its loop, its categories, its tone |
| `Recipes.md` | All recipe data; any `recipes.json` must match this exactly |
| `Progression.md` | All tier/level unlock logic; `progression.json` must match |
| `Tools.md` | All tool definitions; `tools.json` must match |
| `WorldMap.md` | All zone data; `zones.json` must match |
| `Systems.md` | How systems behave; code logic must follow this |
| `Narrative.md` | All dialogue, story events, character voices |
| `RepoStructure.md` | Folder layout, naming, coding standards |
| `DataModels.md` | JSON schema shapes for all data files |

If a document and the code disagree, the document is correct. Update the code.

---

# 4. /src Directory Structure

All game source code lives inside `artifacts/happy-bear-orchard/src/`.

```
src/
├── constants.js          # Global enums and constants (tile states, actions, resources)
├── systems/              # Core game logic systems
├── scenes/               # Scene controllers (one per game screen)
├── ui/                   # UI rendering modules
├── data/                 # JSON data files (recipes, progression, zones, tools)
└── utils/                # Shared utility functions
```

### `/src/systems/`
Contains all game logic. Each system is a class that manages one domain. Systems communicate via the ResourceManager (shared state) and direct method calls. No system imports from `/src/scenes/` or `/src/ui/`.

```
systems/
├── resources.js      # ResourceManager — central resource store
├── tiles.js          # TileGrid — grid state and tile operations
├── crops.js          # CropSystem — wraps TileGrid with crop-type awareness
├── crafting.js       # CraftingSystem — recipe execution and timers
├── construction.js   # ConstructionSystem — tool build states
├── progression.js    # ProgressionSystem — tier unlock logic
├── seasons.js        # SeasonSystem — season cycle and modifiers (future)
├── tasks.js          # TaskSystem — Happy Bear daily tasks (future)
└── quality.js        # QualitySystem — ingredient and output tier logic (future)
```

**Rules:**
- Every system is a class with a constructor that accepts dependencies as arguments
- Systems never import from scenes or UI
- Systems expose an `onChange(fn)` listener pattern for reactive updates
- Systems expose a `snapshot()` method returning plain serializable data

### `/src/scenes/`
Contains one file per game screen. Each scene class manages its own DOM section, wires tool slots, renders tool cards, and calls system methods in response to user input.

```
scenes/
├── sceneManager.js   # SceneManager — switches scenes, manages nav buttons
├── orchard.js        # OrchardScene — tile grid, bear speech, grow events
├── cabin.js          # CabinScene — Press, Fermenter, Bottling Station
├── distillery.js     # DistilleryScene — Copper Still, Barrel Rack
├── brewery.js        # BreweryScene — Brew Kettle
├── roastery.js       # RoasteryScene — Roaster
└── sodaStation.js    # SodaStationScene — Soda Station (future)
```

**Rules:**
- Each scene file manages exactly one scene
- Scenes receive system instances via constructor injection — they never instantiate systems
- Scenes call `document.getElementById()` only for IDs within their scene's HTML section
- Scenes register `onChange` listeners on systems during `init()` and clean up during `destroy()`

### `/src/ui/`
Contains reusable UI rendering helpers that are not scene-specific.

```
ui/
├── hud.js        # HUD — resource bar, day counter, tier badge
├── menus.js      # ActionMenu — tile action popup
└── buttons.js    # Shared button factory functions
```

**Rules:**
- UI modules are stateless rendering helpers
- They do not hold game state — they receive data and render it
- They may register DOM event listeners but must not call system methods directly
- UI modules receive callback functions from their callers for any action that changes game state

### `/src/data/`
Contains all JSON data files that drive game systems. These are the single source of truth for runtime data.

```
data/
├── recipes.json      # All beverage recipes (matches docs/Recipes.md)
├── progression.json  # Tier unlock conditions and rewards (matches docs/Progression.md)
├── crops.json        # Crop type definitions (matches docs/WorldMap.md)
├── tools.json        # Tool definitions and costs (matches docs/Tools.md)
├── zones.json        # Zone definitions and unlock conditions (future)
├── seasons.json      # Seasonal modifiers and recipe availability (future)
└── dialogue.json     # Happy Bear and Story Bear dialogue lines (future)
```

### `/src/utils/`
Shared utility functions with no game-specific logic.

```
utils/
├── timer.js      # Countdown timer utilities
├── format.js     # Number and string formatting helpers
└── events.js     # Simple event bus implementation (future)
```

---

# 5. Systems Architecture

## How Systems Are Organized in Code

Each system is an ES module class. All systems are instantiated in `main.js` and injected into scenes and other systems via constructor arguments. No system creates another system — dependency injection is used throughout.

```
ResourceManager
    ↑ (reads/writes)
TileGrid / CropSystem / CraftingSystem / ConstructionSystem
    ↑ (observes via onChange)
ProgressionSystem
    ↑ (observes via onChange)
SceneManager (wires scenes to nav)
    ↑ (registered in)
OrchardScene / CabinScene / DistilleryScene / BreweryScene / RoasteryScene
    ↑ (renders via)
HUD / ActionMenu / ToolCards
```

## Individual System Responsibilities

| System | Responsibility |
|---|---|
| ResourceManager | Holds all resource amounts; notifies on change |
| TileGrid | Grid state, tile action validation, tile state transitions |
| CropSystem | Crop growth ticks, ripening events |
| CraftingSystem | Recipe execution, timer management, station busy states |
| ConstructionSystem | Tool build state machine (blueprint → constructing → operational) |
| ProgressionSystem | Monitors resources, fires tier unlock events |
| SeasonSystem | Season cycle, seasonal modifiers, recipe availability gating |
| TaskSystem | Happy Bear daily task generation, completion, and reward delivery |
| QualitySystem | Determines output quality tier based on input quality and tool level |

## How Systems Communicate

- Systems do not import each other (except where explicitly listed in constructor args)
- Systems use the `onChange(fn)` pattern to notify consumers reactively
- Scenes subscribe to system change events during `init()` and re-render accordingly
- The ResourceManager is the central shared state — all production changes flow through it

## How Data Flows Between Systems

```
User action (click tile / button)
    → Scene method called
    → System method called (e.g., crafting.craft(), tileGrid.performAction())
    → Resources updated via ResourceManager
    → ResourceManager notifies all listeners
    → ProgressionSystem checks unlock conditions
    → HUD re-renders resource counts
    → Scene re-renders affected tool cards
```

## How Systems Remain Modular

- New beverage categories require only: new data in `/src/data/recipes.json`, a new scene file, and registration in `main.js`
- New tools require only: new entry in `construction.js` tool defs within the relevant scene
- New zones require only: new entry in `zones.json` and an update to the orchard scene's expansion logic
- No existing system file needs modification to add a new production category

---

# 6. UI Architecture

## Folder Structure

```
src/ui/
├── hud.js        # Resource bar, day counter, tier badge rendering
├── menus.js      # Tile action popup (ActionMenu class)
└── buttons.js    # makeNavButton(), makeActionButton() factories
```

## Naming Conventions

- UI module filenames are lowercase, hyphen-separated: `hud.js`, `action-menu.js`
- CSS class names use BEM-adjacent naming: `.tool-card`, `.tool-card-badge`, `.btn-build`
- HTML element IDs use hyphen-separated lowercase: `#scene-cabin`, `#tool-slot-press`, `#count-fruit`
- Scene-scoped IDs are prefixed with the scene name: `#cabin-bear`, `#cabin-wall`

## State Management

UI modules are stateless. They do not store game state. They receive data as arguments and render it. If a UI element needs to react to game state changes, it does so by subscribing to system `onChange` events in the scene or main.js that owns it.

## How UI Reads from Data Models

- HUD reads from `ResourceManager.amounts` on every `onChange` event
- ActionMenu reads tile state and `ResourceManager.canAfford()` at render time
- Tool card HTML is generated from scene-local tool definitions and system state snapshots

## How UI Updates Based on System Events

- `ResourceManager.onChange` → `HUD.updateResources(amounts)`
- `ConstructionSystem.onChange` → scene re-renders affected tool slot
- `CraftingSystem.onChange` → scene re-renders affected tool slot
- `ProgressionSystem.onChange` → nav buttons enabled, tier badge updated
- All updates are synchronous and full re-renders of the affected component (no partial diffing)

---

# 7. Asset Organization

```
src/assets/
├── sprites/
│   ├── bear/               # Happy Bear sprite sheets and seasonal variants
│   │   ├── bear-spring.png
│   │   ├── bear-summer.png
│   │   ├── bear-fall.png
│   │   └── bear-winter.png
│   ├── story-bear/         # Story Bear panel illustrations
│   └── characters/         # Supporting character sprites
├── tiles/
│   ├── orchard/            # Base tile textures (grass, cleared, planted, etc.)
│   ├── zones/              # Zone-specific tile overlays (cherry, maple, tropical, etc.)
│   └── seasonal/           # Seasonal overlay textures (snow, petals, leaves)
├── ui/
│   ├── icons/              # Resource icons, tool icons, zone icons
│   ├── panels/             # Story panel backgrounds and frames
│   └── buttons/            # Button states (normal, hover, disabled)
├── backgrounds/
│   ├── orchard/            # Orchard scene backgrounds per season
│   ├── cabin/              # Cabin interior backgrounds per level
│   └── scenes/             # Scene-specific backgrounds
└── audio/
    ├── ambient/            # Season-specific ambient loops
    ├── sfx/                # Interaction sound effects
    └── music/              # Background music tracks
```

## Naming Conventions

- All asset files use lowercase, hyphen-separated names
- Seasonal variants append `-spring`, `-summer`, `-fall`, `-winter`
- Zone-specific variants append the zone name: `-cherry-grove`, `-maple-stand`
- Sprite sheets use the pattern: `[character]-[action]-[season].png`
- Icons follow: `icon-[resource].png` or `icon-[tool].png`

## Character Asset Structure

Happy Bear has a full sprite set per season (idle, task, reaction, celebration). Story Bear has illustrated panel art rather than sprites — one illustration per story beat. Supporting characters have single static sprites used only in story panels.

---

# 8. Data Folder Structure

```
src/data/
├── recipes.json        # All beverage recipes
├── progression.json    # Progression tier definitions
├── crops.json          # Crop type definitions
├── tools.json          # Tool definitions and costs
├── zones.json          # Zone definitions (future)
├── seasons.json        # Seasonal modifiers (future)
└── dialogue.json       # Character dialogue lines (future)
```

## Schema Rules

- All JSON files use camelCase keys
- Every object has an `id` field that is a unique string identifier
- Arrays of objects are always objects keyed by `id` (not bare arrays) for O(1) lookup
- All cost and yield values are plain numbers (no strings)
- All timer values are in seconds
- Boolean flags are used sparingly; prefer `state` enum strings over multiple boolean fields

## How Systems Load Data

- Systems import JSON directly as ES module imports (Vite handles JSON imports natively)
- Data is loaded once at system instantiation and held in memory
- Systems do not re-read JSON at runtime — data is immutable after load
- If data needs to change at runtime (e.g., save state), it is managed in the system's internal state, not by mutating the imported JSON

## Schema Consistency Rules

- Recipe `station` IDs must exactly match tool `id` values in the ConstructionSystem
- Progression `unlocks` arrays must contain valid scene names or tool IDs
- Crop `yields` keys must match resource keys in ResourceManager
- Any new data file must have a corresponding schema description added to `docs/DataModels.md`

---

# 9. Scripts & Automation

```
scripts/src/
├── validate-recipes.js     # Checks that all recipe station IDs match registered tools
├── validate-progression.js # Checks that all unlock IDs are valid scene or tool names
├── validate-zones.js       # Checks that all zone crop IDs exist in crops.json
├── check-docs-sync.js      # Warns if docs are older than their corresponding data files
└── asset-audit.js          # Lists referenced assets that are missing from the filesystem
```

## Build Scripts

Vite handles the production build automatically. `pnpm --filter @workspace/happy-bear-orchard run build` produces a deployable bundle in `artifacts/happy-bear-orchard/dist/public/`.

## Data Validation Scripts

Run with `pnpm --filter @workspace/scripts run validate`. All validation scripts exit with code 1 if inconsistencies are found, enabling CI gating.

## Linting and Formatting

- ESLint with the project's shared config for JavaScript
- Prettier for consistent formatting across all JS, JSON, and Markdown files
- Run `pnpm run lint` and `pnpm run format` from the repo root
- JSON data files are always formatted with 2-space indentation

---

# 10. Testing Structure

```
tests/
├── unit/
│   ├── systems/
│   │   ├── resources.test.js       # ResourceManager unit tests
│   │   ├── crafting.test.js        # CraftingSystem unit tests
│   │   ├── construction.test.js    # ConstructionSystem unit tests
│   │   └── progression.test.js     # ProgressionSystem unit tests
│   └── utils/
│       └── timer.test.js
├── system/
│   ├── cider-workflow.test.js      # Press → Ferment → Bottle end-to-end
│   ├── progression-unlock.test.js  # Tier unlock conditions end-to-end
│   └── seasonal-recipes.test.js    # Seasonal recipe gating end-to-end
├── data/
│   ├── recipes-schema.test.js      # All recipe objects match expected schema
│   ├── progression-schema.test.js  # All tier objects match expected schema
│   └── tools-schema.test.js        # All tool objects match expected schema
└── snapshots/
    ├── hud-baseline.png            # HUD visual regression baseline
    └── cabin-baseline.png          # Cabin scene visual regression baseline
```

## Naming Conventions

- Unit test files: `[module].test.js`
- System test files: `[workflow-name].test.js`
- Data schema tests: `[data-file]-schema.test.js`
- Snapshot files: `[scene-name]-baseline.png`

## Test Runner

Vitest is the project's test runner. Run tests with `pnpm run test` from the repo root.

---

# 11. Versioning & Branching Strategy

## Main Branch Rules

- `main` is always deployable
- No direct pushes to `main`; all changes via pull request
- Pull requests require passing linting, data validation, and unit tests

## Feature Branches

- Branch naming: `feature/[short-description]` (e.g., `feature/soda-station-scene`)
- One feature or fix per branch
- Branches should be short-lived — merged and deleted within the same development session where possible

## Release Tags

- Tags follow semantic versioning: `v[major].[minor].[patch]`
- Major: new production category or scene
- Minor: new recipe, tool, or zone
- Patch: bug fix, text change, or style update

## Commit Message Conventions

- Format: `[scope]: [what changed]`
- Scopes: `scene`, `system`, `data`, `ui`, `docs`, `config`, `fix`
- Examples:
  - `scene: add SodaStation scene with syrup and carbonation tools`
  - `data: add craft soda recipes to recipes.json`
  - `system: add SeasonSystem with crop growth modifiers`
  - `docs: update Systems.md with beer workflow rules`
  - `fix: correct fermenter timer not clearing on completion`

---

# 12. AI-Readiness & Documentation Standards

## How to Maintain Clean, Structured, AI-Friendly Documentation

- Every doc file begins with a title, version number, and one-sentence purpose statement
- Section headings use numbered H1 and H2/H3 hierarchy — never flat or inconsistently nested
- Tables are used for reference data (costs, tiers, zone lists) rather than prose lists where possible
- Code blocks use proper language tags: ` ```json `, ` ```js `, ` ```text `
- No placeholder text, no TODOs, no "TBD" entries — docs are either complete or not yet created

## Rules for Updating Docs When Systems Change

1. Before changing a game system, update the relevant doc to reflect the intended new behavior
2. After implementing a change, verify the doc still accurately describes the implementation
3. If a new data file is created, add its schema to `docs/DataModels.md`
4. If a new scene is added, add it to the scene list in this document and in `docs/Progression.md`
5. The `docs/` folder is part of the codebase — doc updates belong in the same commit as the code change they describe

## Requirements for Keeping the Repo Consistent with the Design Suite

- `src/data/recipes.json` must match `docs/Recipes.md` exactly for all implemented recipes
- `src/data/progression.json` must match `docs/Progression.md` tier definitions
- Tool IDs in scene files must match tool names in `docs/Tools.md`
- Zone names referenced in code must match zone identifiers in `docs/WorldMap.md`
- Any new mechanic added to code that is not described in a doc file is considered incomplete until the doc is written

---

# 13. Final Notes

This file is the authoritative source for repository structure and architectural organization in Happy Bear Cozy Orchard. All folder conventions, naming rules, system communication patterns, data schema rules, testing standards, branching strategies, and documentation practices defined here must be followed exactly.

When this document and the actual repository state disagree, the document describes the intended state. Update the repository to match, and note any permanent exceptions in the relevant section of this document.
