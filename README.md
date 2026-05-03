# Happy Bear Cozy Orchard 🐻🍎

> *A cozy orchard-building and beverage-crafting game, built with warmth, care, and a lot of apple juice.*

---

## 1. Project Overview

Happy Bear Cozy Orchard is a tile-based simulation game where players tend a growing orchard, harvest seasonal fruit and botanicals, and craft small-batch beverages inside a buildable production cabin. The game blends cozy farming, light city-building, and handcrafted beverage systems — all wrapped in a storybook aesthetic built around seasonal rhythms and genuine warmth.

At the heart of the experience are two characters: **Happy Bear**, your enthusiastic companion and co-creator, and **Story Bear**, the quiet keeper of the orchard's history. Together with the player, they build something that feels handcrafted — because it is.

This repository contains the complete playable game, the full design documentation suite, all data models and schemas, and the architectural standards that keep everything consistent as the project grows.

---

## 2. Features Summary

- **Orchard Expansion** — A tile-based grid that grows outward from the Cabin through 12 distinct zones, each with unique crops, biomes, and story moments
- **Beverage Crafting Across Seven Categories** — Cider, Craft Soda, Hard Soda, Applejack, Whiskey, Beer, and Coffee, each with its own production workflow and recipe catalogue
- **Seasonal System** — Four seasons (Spring, Summer, Fall, Winter) affect crop growth, recipe availability, visual atmosphere, and Happy Bear's outfits
- **Cabin Upgrades** — Six cabin levels unlock new production wings (Distillery, Brewery, Roastery, Soda Station), each adding tools and expanding capacity
- **Story Progression** — Six narrative acts, seasonal story moments, flavor lore, and special events featuring Happy Bear, Story Bear, and supporting characters
- **Tool Building** — Eleven buildable and upgradeable workstations, each with three upgrade levels affecting speed, quality, and batch capacity
- **Zone Unlocks** — Fog-of-war orchard expansion with per-tile costs that scale with distance from the Cabin
- **Data-Driven Architecture** — Every recipe, tool, zone, crop, story event, and character is defined in structured JSON data files, keeping systems modular and easily extensible

---

## 3. Repository Structure

```
/
├── artifacts/
│   └── happy-bear-orchard/     # The playable game (Vite + vanilla JS)
│       ├── main.js             # Entry point — boots all systems and scenes
│       ├── index.html          # HTML shell with all scene containers
│       ├── style.css           # Global styles
│       └── src/                # All game source code
│           ├── constants.js    # Global enums and constants
│           ├── systems/        # Core game logic (resources, crafting, progression, etc.)
│           ├── scenes/         # One file per game screen
│           ├── ui/             # Reusable UI rendering modules
│           └── data/           # JSON data files (recipes, progression, crops, tools)
├── docs/                       # The authoritative design documentation suite
├── scripts/                    # Developer utility scripts (validation, asset audit)
├── lib/                        # Shared workspace libraries (reserved for future use)
├── pnpm-workspace.yaml         # pnpm monorepo configuration
└── package.json                # Root package for shared tooling
```

| Folder | Purpose |
|---|---|
| `/src/systems/` | Core game logic classes — one file per system, no UI dependencies |
| `/src/scenes/` | Scene controllers — one file per game screen, wired to systems via injection |
| `/src/ui/` | Stateless UI rendering helpers (HUD, menus, buttons) |
| `/src/data/` | JSON data files that drive all game systems at runtime |
| `/docs/` | Nine authoritative design documents covering every aspect of the game |
| `/scripts/` | Data validation, asset audit, and build helper scripts |
| `/lib/` | Shared TypeScript libraries for future cross-artifact code |

---

## 4. Documentation Suite

The `/docs/` folder contains nine authoritative documents that form the single source of truth for the entire project. All code, data, systems, and future features must follow these documents exactly. When a document and the codebase disagree, update the code.

| Document | What It Covers |
|---|---|
| [`GameDesign.md`](docs/GameDesign.md) | The game's concept, core gameplay loop, beverage categories, and tone |
| [`Recipes.md`](docs/Recipes.md) | All 40+ beverage recipes across every category, with ingredients, tools, unlock conditions, and flavor notes |
| [`Progression.md`](docs/Progression.md) | Cabin upgrade levels, zone unlock order, seasonal progression, story acts, and achievements |
| [`Tools.md`](docs/Tools.md) | All 11 buildable tools with construction costs, three-level upgrade paths, and dependency graphs |
| [`WorldMap.md`](docs/WorldMap.md) | All 12 orchard zones, tile types and states, biome transitions, expansion logic, and seasonal effects |
| [`Systems.md`](docs/Systems.md) | How every production, crafting, economy, and seasonal system works — including quality tiers and cross-system synergy |
| [`Narrative.md`](docs/Narrative.md) | Characters, story acts, seasonal story moments, flavor lore, and special events |
| [`RepoStructure.md`](docs/RepoStructure.md) | Folder conventions, naming standards, systems architecture, testing layout, versioning strategy, and AI-readiness rules |
| [`DataModels.md`](docs/DataModels.md) | Complete JSON schemas for all 13 data types, with field rules, relationship maps, and example objects |

---

## 5. Getting Started

### Exploring the Repo

Start with the docs. Read `GameDesign.md` to understand the game's vision, then `Progression.md` to understand how systems unlock, then `Systems.md` to understand how production works. The other docs fill in the details.

### Using the Design Docs

Every design doc is a living reference. Before implementing any new feature, find the relevant document and read the section that applies. If the section doesn't exist yet, write it first. The docs lead; the code follows.

### Extending the Project

The game is designed for modular extension. To add a new beverage category:
1. Add recipes to `docs/Recipes.md` and `src/data/recipes.json`
2. Add the new scene file to `src/scenes/`
3. Add the new scene HTML to `index.html`
4. Register the scene in `main.js`
5. Update `docs/Progression.md` with unlock conditions

No existing system files need modification for a new production category.

### Running in Replit

The game runs automatically via the Replit workflow `artifacts/happy-bear-orchard: web`. The Vite dev server starts on the assigned `PORT` and serves the game at the preview URL. To restart after changes, use the workflow restart control. No local setup is required — everything runs in the Replit environment.

---

## 6. Development Workflow

Tending the orchard well means tending the codebase well. Here is how to work consistently with the project:

1. **Update design docs first.** Before writing code, update the relevant doc to reflect what you intend to build. This keeps the design suite accurate and makes AI-assisted development reliable.

2. **Keep systems modular.** Each system class manages one domain. Systems receive dependencies via constructor injection and never import from scenes or UI. New systems follow the same `onChange(fn)` listener pattern.

3. **Follow naming conventions.** File names are lowercase and hyphen-separated. CSS classes use BEM-adjacent naming. JSON keys are camelCase. IDs are snake_case. These conventions are described in full in `docs/RepoStructure.md`.

4. **Maintain schema consistency.** Every JSON data file must conform to the schemas in `docs/DataModels.md`. Run `pnpm --filter @workspace/scripts run validate` to check data integrity before committing.

5. **Document all new features.** Every new recipe belongs in `Recipes.md`. Every new tool belongs in `Tools.md`. Every new zone belongs in `WorldMap.md`. A feature that exists in code but not in the docs is considered incomplete.

---

## 7. Tone & World Philosophy

Happy Bear Cozy Orchard is a handcrafted game, and this repository is built to reflect that.

The code is clear and unhurried. Systems are named for what they do. Data is structured so that anyone — or any AI — can read a data file and understand exactly what it means without additional context. Documentation is written completely, with care, and kept up to date.

The game is about small joys: a perfect harvest morning, the smell of the first roast, a recipe that comes out exactly right. The repository should feel the same way — organized, warm, and built with attention to detail.

When in doubt, ask: does this feel like something that belongs in Happy Bear's orchard?

---

## 8. Contribution Guidelines

- **Keep documentation updated.** Every code change that affects a system, recipe, tool, or zone must be accompanied by an update to the relevant design document.
- **Follow folder structure conventions.** Systems go in `/src/systems/`. Scenes go in `/src/scenes/`. Data goes in `/src/data/`. Nothing lives outside its folder.
- **Maintain data model integrity.** Every new data object must conform to its schema as defined in `docs/DataModels.md`. New schemas must be documented before implementation.
- **Preserve the cozy tone.** Dialogue, flavor notes, story text, and UI copy should all feel warm, unhurried, and consistent with the voices of Happy Bear and Story Bear as defined in `docs/Narrative.md`.
- **Test your changes.** Run data validation scripts before committing. Verify that new scenes register correctly in `main.js` and appear in the nav bar as expected.

---

## 9. License

License to be determined. All original content — including characters, world design, beverage names, story content, and game systems — is the intellectual property of the project creator. See credits below.

---

## 10. Credits

**Creator:** Jim — original concept, world design, characters, story, and beverage catalogue

**Characters:** Happy Bear and Story Bear are original characters created by Jim for this project. All rights reserved.

**Development:** Built with AI-assisted development using Replit Agent. All design decisions, creative direction, and project vision are Jim's.

**Technology:** Vanilla JavaScript, ES Modules, Vite, pnpm monorepo. No frameworks. Built to stay cozy and maintainable.

---

## 11. A Final Note

Every orchard begins with a single tree and someone willing to wait.

This repository is that first tree — the seed of something that will grow with each season of development, each new recipe, each new zone unlocked and tended. The documentation suite is the soil. The systems are the roots. The game the player sees is the fruit.

Build it carefully. Tend it well. And when something comes out exactly right — a recipe that works, a story moment that lands, a system that fits perfectly into the one beside it — take a moment to appreciate it.

That's what Happy Bear would do.

🐻🍎

---

*Happy Bear Cozy Orchard — handcrafted with care.*
