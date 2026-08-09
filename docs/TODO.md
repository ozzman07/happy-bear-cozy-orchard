# Happy Bear Cozy Orchard — Planned Work

Items are grouped by theme. Checked items are complete.

---

## Orchard & Land

- [x] Tile state machine — planted/mine tiles retain function until explicitly cleared
- [x] Mine Shaft state — repeated mining in place, Clear to decommission
- [x] Auto-replant after harvest (tile stays in growth cycle)
- [x] Zone-based orchard expansion (Option A) — 5 named zones unlock with tiers
  - East zone → Tier 1, North → Tier 2, West → Tier 3, South → Tier 4
  - Permanent treeline dividers separate zones visually
- [x] **Purchasable outposts (Option B)** — 200 🪙 (Market, Tier 2+) buys a placement: the game switches to the Orchard and the next tile tap tries to drop a 3×3 clearable cluster there. Hit a real design conflict while building this: the existing 10×10 map has *zero* contiguous 3×3-locked area anywhere, at any tier — every named zone (`ZONE_DEFS` in tiles.js) is only 2 tiles thick, by design, so a literal "3×3 anywhere on the locked grid" could never succeed. Resolved per direction from Jim: the grid itself now grows +2 rows/cols on the bottom-right for every tier reached (`GRID_GROWTH_PER_TIER` in constants.js, `TileGrid.resize()` in tiles.js — existing coordinates never shift, so old saves restore correctly into the bigger grid), so there's always fresh open frontier for outposts to land in. Bonus: normal tile-clearing now also organically bleeds into the new frontier via the existing adjacency-unlock, not just outposts.
- [x] **Multi-crop planting** — crop selection UI on Plant, tile `cropType` tracking, tier-gated availability (per `crops.json` `unlockTier`), harvest yields pulled from crop data. Fixed a bootstrap bug along the way: hops/coffee `plantCost` consumed the same resource they produce, so first-ever planting was impossible — a starter seed grant now fires on tier unlock (mirrors the existing `bottles:3` starter fix for the cider chain). Also fixed hops' `unlockTier` (was 3, didn't match when `hops_crop` actually unlocks at tier 4).
- [x] **Forest tile** — timber trees were already a renewable-wood mechanic but lived as a hardcoded parallel system (`ACTION.PLANT_TREE`, `cropType === 'timber'` special-cases scattered across tiles.js/menus.js/main.js) alongside the new crops.json-driven planting. Folded it in as a real `timber` crop entry (free to plant, 15 ticks, +4 wood) so it's just another Plant-menu option now — `PLANT_TREE` and the `TIMBER_GROW_TICKS`/`TIMBER_YIELD` constants are gone. Kept its distinct "woodier thud" plant sound as the one intentional special-case (audio flavor, not game logic).
- [x] **Woodcutter's Shed** — new Cabin building (12 wood + 8 stone, 25s), +1 wood every game tick once operational, using the same "passive/Active" card pattern as Harvest Bell. Found and fixed a real bug while wiring it: the Orchard's "Auto: ON" toggle enabled auto-water/mine/harvest for free from Tier 0, completely ignoring whether Harvest Bell (6 wood + 4 stone) had ever been built — the building had zero actual function. Now both the toggle button and the tick-loop auto-logic are gated on `construction.isOperational('harvest_bell')`.

---

## Production & Crafting

- [x] Press timer (12s), Ferment requires 3 juice → 1 cider (90s), Bottle requires 3 cider → 3 bottles (20s). Caught a real bug from an earlier balance pass: `ferment_cider` was quietly also outputting a free bottle (propping up its own economics, since 3 juice → 1 cider alone is a loss at store prices), which meant `bottle_cider`'s "3 cider + 1 bottle → 1 bottle" was a dead step — net zero bottles gained, players had no reason to ever use the Bottling Station. Removed the bonus bottle from fermenting and gave bottling a real 1:1 cider→bottle yield, so it's the step that actually produces bottles now (+55% margin). Also reverted the `bottles: 3` starting stock (`resources.js`) — it was only ever a workaround for the old self-referential recipe and was trivializing the "reach 3 bottles" Market-unlock gate by starting past it.
- [x] Market locked until player holds ≥ 3 bottles
- [x] **Auto-harvest** — Harvest Bell building in Cabin (6 wood, 4 stone); once built, auto-collects all ripe tiles each game tick
- [x] **Distillery recipe balance** — audited sell price vs. input cost for every Distillery/Brewery/Roastery recipe. Found `distill_whiskey` was a straight loss (2 applejack = 44 coins of value → 1 whiskey = 38 coins) — no reason to ever craft it. Fixed by dropping the input to 1 applejack: barrel-aging matures one batch over time (200s), it doesn't need to blend two batches. Now +73% margin.
- [x] **Brewery recipe balance** — hops is now plantable; `brew_beer` margin (2 fruit + 1 hops = 8 → 1 fruit_beer = 18, +125%) is healthy, no change needed.
- [x] **Roastery recipe balance** — coffee_bean is now plantable. Found `roast_coffee` was also a loss (2 coffee_bean = 12 → 1 roasted_coffee = 11) — fixed the same way, dropped input to 1 bean (roasting concentrates a batch, it doesn't double the raw beans needed). `brew_coffee` margin was already healthy (+87%).
- [x] **Automation pause/resume** — once purchased, station automation (`auto_bottling`, `auto_still`, etc.) had no way to turn back off; `StoreSystem.isAutomated()` just checked "ever purchased," permanently. Real problem, not hypothetical: cider is shared between Bottling (`bottle_cider`) and the Still (`distill_applejack`), and automated Bottling will claim cider for bottles the instant 3 are available, faster than the player can react to send 2 to the Still for whiskey production, with no warning when the Still's manual craft silently fails for lack of cider. Added `StoreSystem.toggleAutomation(id)` / `isAutomationPaused(id)` (persisted, doesn't un-purchase) and a Pause/Resume button on each owned automation card in the Market — the station's 🤖 badge and auto-restart both correctly stop while paused, verified round-trip through save/reload.
- [x] **Consistency audit** — swept every data file (`recipes.json`, `upgrades.json`, `crops.json`, `progression.json`, `store.json`, `deals.json`) plus every hardcoded label/hint map in the JS against each other. Found and fixed: `auto_bottling`'s description said "juice is ready" (bottling takes cider, not juice — stale from an older recipe version); Coffee Brewer had no speed-upgrade tier while every other station has one (added `brewer_speed_1/2`, matching Roaster's tier/cost pattern); the Tier 5 unlock ceremony's `UNLOCK_LABELS` map was missing `coffee_brewer`, so it silently vanished from that tier's "New Equipment" chips; `BearDialogue.js`'s daily-hint thresholds still checked `applejack >= 2` / `coffee_bean >= 2` after the whiskey/roasted-coffee balance fixes above dropped those recipes to 1 input. Also updated the in-game "How to Play" guide, which had gone stale relative to this session's other changes — it never mentioned Hops/Coffee as later-unlocking crops, didn't say Auto Mode needs the Harvest Bell built first, and didn't mention Outposts or per-tier grid growth.

---

## Coffee & Roastery

- [x] Coffee crop plantable in orchard (any cleared tile, tier 5+ — not zone-restricted)
- [x] `brew_coffee` recipe routes to `coffee_brewer` (Roastery station) — checked and already correct in `recipes.json`/`roastery.js`/`main.js`'s STATION_SCENE map; this note was stale (an earlier session's fix wasn't reflected here). Verified in-browser: Roastery's Coffee Brewer crafts it, Brewery has no coffee option.
- [x] Roastery end-to-end reachable: plant coffee → harvest beans → roast → brew cups → sell — verified in-browser (selling uses the same generic Market code path as every other resource)

---

## Progression & Story

- [x] Tier-gated scene unlocks (Cabin, Distillery, Brewery, Roastery)
- [x] BearDialogue system — scene greetings, tier speeches, first-craft reactions, Civ-advisor daily hints
- [x] Story Bear panel — text notifications on tier unlock and first bottle_cider
- [x] **Scene lifecycle wiring** — SceneManager now routes `onTick(ripened)` and `onNewDay(day)` to the active scene each game loop
- [x] **HUD tier sync** — juice and cider now hidden at Tier 0; each resource appears when its tier unlocks

---

## Save & Persistence

- [x] **Save/Load** — `ResourceManager`, `TileGrid`, and `ConstructionSystem` all have `snapshot()`/`restore()`; autosaves to localStorage on each new day; restores resources, tiles, tool states, tier, first-crafts, and market unlock on load. In-progress crafting timers *are* saved and re-armed on load (fixed a stale note here claiming otherwise — `CraftingSystem.restore()` already re-arms `setTimeout`s for unexpired timers and finishes expired ones immediately).
- [x] **Hardening pass** — found and fixed a real stored-XSS gap: the player-name field (the game's only free-text input) was interpolated unescaped into `innerHTML` on the Profile Select and Choose Your Orchard screens, so a name like `<img src=x onerror=...>` would execute as markup. Added an `escapeHtml()` helper and applied it everywhere `playerName` renders. Also fixed: deleting a profile never removed its `hbco_save_*` localStorage entries — they became permanently orphaned since the profile id is unreachable once deleted; and `CraftingSystem.restore()` matched a running craft back to its recipe by scanning for *any* recipe on that station, which only worked by coincidence (every station currently has exactly one recipe) — now the actual `recipeId` is saved alongside the timer so restore can't silently apply the wrong recipe's output if a station ever gets a second recipe.

---

## Art & Presentation

- [ ] **AI-generated bear sprites** — current `bear.svg` is a placeholder flat illustration; commission proper Happy Bear character art for guide/speaking poses
- [ ] **Story Bear vignettes** — currently text-only panel; full illustrated vignette system (story pages with art) planned for Act milestones
- [x] **Zone labels** — a fixed-position banner (`#zone-banner`, styled distinct from the Story Bear panel) fades in with the zone's name whenever it unlocks, both for tier-based auto-unlocks (East Fields/Northern Slopes/Western Grove) and store-purchased land (Hop Fields/Coffee Grove). Names live in `ZONE_NAMES` next to `ZONE_DEFS` in tiles.js.

---

## Infrastructure

- [x] **Crops.json integration** — TileGrid now reads growTicks/yields/plantCost/unlockTier from crops.json for every crop (apple, hops, coffee, timber); no more hardcoded per-crop special-casing anywhere in tiles.js/menus.js. Caught and fixed a real regression along the way: `crops.json`'s `apple.growTicks` was stale unused data (`50`) left over from before this integration — wiring it in had silently made apple trees take 150s to grow instead of the actual tuned 21s (`GROW_TICKS_NEEDED = 7`). Fixed by correcting the data file to match the live-tested value.
