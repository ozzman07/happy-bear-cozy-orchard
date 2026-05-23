# Happy Bear Cozy Orchard

## Tech Stack
- **Languages:** TypeScript, JavaScript
- **Frameworks:** Vite for frontend, Node.js for backend
- **Libraries:** React, Drizzle ORM, Zod, Axios

<!-- This is a comment added to the README.md file -->

## Build and Test Commands
- **Build:** `pnpm run build`
- **Typecheck:** `pnpm run typecheck`

## Project Structure
This is a monorepo with three sub-projects. **Most game tasks involve only the Happy Bear Orchard frontend.**

- **Happy Bear Orchard (THE GAME)** — `artifacts/happy-bear-orchard/`
  - `src/scenes/` — scene logic: `orchard.js`, `cabin.js`, `distillery.js`, `brewery.js`, `roastery.js`
  - `src/ui/` — **`menus.js`** (all menus and panels), **`hud.js`** (heads-up display)
  - `src/systems/` — `BearDialogue.js`, game systems
  - `src/data/` — JSON data files (crops, recipes, etc.)
  - `style.css` — all game CSS
  - `index.html` — game entry point, contains all HTML structure including modals
  - The welcome/instructions modal is `#welcome-modal` in `index.html`, triggered from `orchard.js`

- **API Server** — `artifacts/api-server/` (backend, rarely needs changes)

- **Mockup Sandbox** — `artifacts/mockup-sandbox/` — a SEPARATE component library sandbox, NOT part of the game. Ignore files here unless the task explicitly mentions "mockup-sandbox".

## Key Docs
- **Planned work / to-do list:** `docs/TODO.md` — grouped by theme, checked items are complete

## Important Conventions
- Game code is vanilla JavaScript (not TypeScript) — do NOT use TypeScript syntax in game files.
- Use TypeScript only for `artifacts/api-server/` and `artifacts/mockup-sandbox/`.
- Follow the Vite configuration for frontend build processes.
- Ensure type safety with Zod for data validation in the API server.

REPOSITORY ROOT: /Users/jimosborn/Library/Mobile Documents/com~apple~CloudDocs/Projects/happy-bear-cozy-orchard
