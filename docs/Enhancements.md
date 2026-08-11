# Happy Bear Cozy Orchard — Enhancement Ideas

Brainstormed candidates for future work, not yet scheduled. Unlike `TODO.md`
(planned, in-progress, or already-shipped work), nothing here is committed to.
Check items off as they move into `TODO.md` and get built.

---

## Nearly free — scaffolding already exists, unused

- [x] **Achievements** — done. 24 milestones across progression/first-crafts/orchard/economy/building/time/land in `src/data/achievements.json`, evaluated by the new `AchievementSystem.js` against `ProfileSystem`'s existing (previously-unused) `unlockAchievement()` plumbing. Toast notification + a modal (🏆 button in the HUD) listing all 24 with lock/unlock state. Retroactive: loading a save that already qualifies for milestones credits them immediately instead of waiting for the next matching event. Caught a real ordering bug while building it — `resources.onChange` fires *before* handler-local stat counters (`gameStats.harvests++` etc.) update in the same click handler, so the achievement check needed explicit calls after those counters update, not just a listener on resource changes.
- [ ] **Storage / Cabin upgrades** — `docs/GameDesign.md` §7.2 specs "more tool slots, decorative items, larger production capacity" as a Cabin Upgrade category; never built. Resources also have no storage cap today, which removes a management layer the original design assumed (a Storage Shelves tool is named in `docs/GameDesign.md` §4.1 but doesn't exist in code).

---

## Content depth using systems that already exist

- [ ] **More crops / flavor variants** — in progress. First flavor shipped: **Autumn Hug** (cranberry), see `docs/TODO.md`. Remaining: the multi-crop system (crop-aware `TileGrid`, per-crop `crops.json` entries) has apple/hops/coffee/timber/cranberry; `docs/GameDesign.md` §3.4 still names unused botanical zones (Peach Orchard, Cherry Grove, Blueberry Bend, etc.) and §8.1 still names more cider flavors (Creekside Watermelon, Sticky Paws Apple Caramel, ...) not yet wired to a recipe. The Autumn Hug slice established the pattern to repeat: new crop (free to plant, tier-gated) + the previously-unbuilt Flavor Table station (`docs/GameDesign.md` §4.1) blending bottled cider + the crop into a new premium sellable resource — cheap to extend to another flavor, since the station and pattern already exist.
- [ ] **Craft Soda line** — non-alcoholic production category speced in `docs/GameDesign.md` §8.7 (Soda Station, botanical-based flavors), unbuilt. Would diversify away from "everything is alcohol," which matters for a family-friendly game.
- [ ] **Seasonal cycle** — spring/summer/fall/winter (`docs/GameDesign.md` §9) with season-locked recipes/crops. The day counter and calendar already exist (`gameState.day`, `TICKS_PER_DAY`); this would mostly be gating logic on top, for replay variety.

---

## Bigger swings

- [ ] **Post-Tier-5 endgame** — progression hard-stops at "Master Roaster" (`progression.json` tier 5). Nothing beyond that today. Worth a prestige mechanic, a Tier 6, or just more deals/recipes to chase once maxed out.
- [ ] **NPC visitors / one-off requests** — dynamic income on top of the existing fixed 14-day distribution-deals system (`deals.json`, `MarketSystem.js`), for more variety than static contracts.

---

## Notes
- Recommended starting point: **Achievements** — highest payoff-to-effort ratio since the backend already exists.
- Source of most of the "planned but unbuilt" items above: `docs/GameDesign.md`, which documents a fair amount of scope beyond what's currently implemented.
