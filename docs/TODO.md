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
- [ ] **Purchasable outposts (Option B)** — spend coins to drop a new 3×3 clearable cluster anywhere on the locked grid; player chooses where to expand; requires placement UI
- [ ] **Multi-crop planting** — hops and coffee exist in `crops.json` with `unlockTier` values but the plant action only supports apples; needs: crop selection UI when planting, tile `cropType` tracking, tier-gated availability, harvest yields from crop data
- [ ] **Forest tile** — plantable crop that yields 4–5 wood on harvest; slots into multi-crop system; replaces the one-time wood from clearing as a renewable source
- [ ] **Woodcutter's Shed** — mid-game building that passively produces wood; alternative to forest tiles

---

## Production & Crafting

- [x] Press timer (12s), Ferment requires 3 juice (90s), Bottle requires 3 cider → 6 bottles (20s)
- [x] Market locked until player holds ≥ 3 bottles
- [x] **Auto-harvest** — Harvest Bell building in Cabin (6 wood, 4 stone); once built, auto-collects all ripe tiles each game tick
- [ ] **Distillery recipe balance** — review Applejack/Whiskey input quantities for realism (similar audit to cider chain)
- [ ] **Brewery recipe balance** — hops crop not yet plantable; brew_beer recipe inputs need review once multi-crop is live
- [ ] **Roastery recipe balance** — coffee_bean crop not yet plantable; roastery currently unreachable in normal play

---

## Coffee & Roastery

- [ ] Coffee crop plantable in orchard (Tier 5 zone or specific area)
- [ ] `brew_coffee` recipe currently routes to `brew_kettle` (Brewery station) but should use `coffee_brewer` (Roastery station) — fix station assignment in `recipes.json`
- [ ] Roastery end-to-end reachable: plant coffee → harvest beans → roast → brew cups → sell

---

## Progression & Story

- [x] Tier-gated scene unlocks (Cabin, Distillery, Brewery, Roastery)
- [x] BearDialogue system — scene greetings, tier speeches, first-craft reactions, Civ-advisor daily hints
- [x] Story Bear panel — text notifications on tier unlock and first bottle_cider
- [x] **Scene lifecycle wiring** — SceneManager now routes `onTick(ripened)` and `onNewDay(day)` to the active scene each game loop
- [x] **HUD tier sync** — juice and cider now hidden at Tier 0; each resource appears when its tier unlocks

---

## Save & Persistence

- [x] **Save/Load** — `ResourceManager`, `TileGrid`, and `ConstructionSystem` all have `snapshot()`/`restore()`; autosaves to localStorage on each new day; restores resources, tiles, tool states, tier, first-crafts, and market unlock on load. In-progress crafting timers are not saved (player restarts those).

---

## Art & Presentation

- [ ] **AI-generated bear sprites** — current `bear.svg` is a placeholder flat illustration; commission proper Happy Bear character art for guide/speaking poses
- [ ] **Story Bear vignettes** — currently text-only panel; full illustrated vignette system (story pages with art) planned for Act milestones
- [ ] **Zone labels** — show zone name ("East Fields", "Northern Slopes") when a new zone first unlocks

---

## Infrastructure

- [ ] **Crops.json integration** — `crops.json` defines growth times, yields, and unlock tiers for all crops but most of this data is ignored; CropSystem is a thin wrapper with no crop-type awareness
