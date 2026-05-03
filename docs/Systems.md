# Happy Bear Cozy Orchard — Core Game Systems (v1.0)

This document defines every production, farming, crafting, seasonal, and progression system in the game. All future code, data models, and gameplay logic must follow this document exactly.

---

# 1. Overview of All Systems

Happy Bear Cozy Orchard is built on a set of interlocking modular systems. Each system operates independently but feeds into others, creating cross-category synergy that rewards players for expanding their operation.

**Core Systems:**
- Cider Production
- Craft Soda
- Hard Soda
- Applejack
- Whiskey
- Beer
- Coffee
- Seasonal Cycle
- Happy Bear Tasks
- Cabin Expansion
- Resource Economy
- Quality & Tier
- Automation & Efficiency

**How they interact:**
- The orchard produces fruit and botanicals that feed every beverage system
- Cider is the foundation for Applejack and some whiskey bases
- Botanicals feed both the Craft Soda and Coffee systems
- Seasonal crops unlock limited-time recipes across all categories
- Cabin upgrades unlock new wings, which unlock new systems
- Tool upgrades increase speed and quality, enabling late-game efficiency loops
- Happy Bear tasks provide bonus resources and story progression

The result is a layered simulation where early decisions (which zones to unlock, which tools to build first) shape a player's unique production identity.

---

# 2. Cider Production System

## 2.1 Full Workflow

```
Press → Fermenter → Flavor Table (optional) → Barrel Rack (optional) → Bottling Station
```

## 2.2 Input Rules

- Minimum input: 2 fruit per batch
- Higher fruit quantity increases batch yield
- Fruit quality (Standard / Ripe / Peak) affects the base quality tier of the output
- Mixed fruit inputs are supported at the Flavor Table for blended ciders
- Overripe fruit yields a lower quality base but can be salvaged with botanical additions

## 2.3 Fermentation Timing

- Level 1 Fermenter: 60 seconds per batch
- Level 2 Fermenter: 40 seconds per batch
- Level 3 Fermenter: 20 seconds, dual-batch capable
- Fermentation cannot be interrupted without losing the batch
- A "check" action by Happy Bear can boost fermentation speed by 10%

## 2.4 Flavoring Rules

- Botanicals are added at the Flavor Table after fermentation
- Up to 3 flavor ingredients can be combined in a single batch
- Spices (cinnamon, ginger) add warmth and complexity
- Fruit additions (blueberry, strawberry, cherry) add color and sweetness
- Honey adds floral notes and increases quality tier by one step
- Incorrect combinations produce a usable but lower-quality output

## 2.5 Aging Rules

- Aging is optional but increases output quality and Cup value
- Level 1 Barrel Rack: Standard oak aging — adds depth notes
- Level 2 Barrel Rack: Multi-barrel aging — allows parallel aging queues
- Level 3 Barrel Rack: Specialty wood (cherrywood, fruitwood, maple) — unlocks premium flavor profiles
- Minimum aging time: 30 seconds (game time); maximum: 120 seconds for Masterwork tier

## 2.6 Output Quality Tiers

| Tier | Condition | Cup Value Multiplier |
|---|---|---|
| Common | Basic fruit, no flavoring, no aging | 1× |
| Fine | Ripe fruit, flavoring applied | 1.5× |
| Premium | Peak fruit, flavored, aged | 2× |
| Masterwork | Peak fruit, multi-botanical blend, specialty barrel | 3× |

---

# 3. Craft Soda System

## 3.1 Syrup Creation

- Botanicals are processed at the Soda Station into concentrated syrups
- Each syrup requires 2–4 botanical inputs
- Syrup creation is instantaneous at Level 1; faster at higher levels
- Syrups can be stored in the Storage Shelves for later use

## 3.2 Carbonation Rules

- Syrup is combined with water and carbonated at the Soda Station
- Level 1: Basic carbonation — standard fizz
- Level 2: Carbonation boost — higher fizz, increases Cup value
- Level 3: Precision carbonation — fine-tuned effervescence, enables premium tier

## 3.3 Flavor Infusion Rules

- A single botanical syrup produces a classic soda
- Combining two syrups produces a blended soda with higher value
- Seasonal fruit additions at the Flavor Table produce limited seasonal variants
- Invalid combinations produce a drinkable but unexciting "Mystery Soda"

## 3.4 Seasonal Soda Variations

- Spring: Honey Pear Fizz, Strawberry Spark Soda
- Summer: Blueberry Breeze Soda, Cherry Orchard Soda
- Fall/Winter: Maple Brown Soda, Ginger Grove Soda (all-season but boosted in fall)

## 3.5 Output Quality Tiers

| Tier | Condition | Cup Value Multiplier |
|---|---|---|
| Common | Single botanical, basic carbonation | 1× |
| Fine | Dual botanical, standard carbonation | 1.5× |
| Premium | Seasonal fruit addition, carbonation boost | 2× |
| Masterwork | Triple blend, precision carbonation, Flavor Table infusion | 3× |

---

# 4. Hard Soda System

## 4.1 Combination Workflow

```
Soda Station (syrup + carbonation) + Copper Still (distilled alcohol base) → Blend → Bottle
```

## 4.2 Alcohol Base Creation

- The Copper Still produces a neutral distilled base from fermented fruit or botanical mash
- Base strength is determined by Still upgrade level
- Level 1: Light base (low ABV equivalent, standard Cup value)
- Level 2: Precision base (medium strength, higher value)
- Level 3: Flavor-infused base (the base itself carries botanical notes)

## 4.3 Blending Rules

- The soda base and alcohol base are blended in a 2:1 ratio by default
- Adjusting ratios at the Flavor Table modifies strength and flavor balance
- Over-alcoholed blends reduce customer satisfaction but increase rarity value
- Botanical additions during blending produce signature hard soda flavors

## 4.4 Strength Tiers

| Tier | Description | Cup Value Modifier |
|---|---|---|
| Session | Light, approachable | 1.2× |
| Standard | Balanced, crowd-pleasing | 1.5× |
| Bold | Strong, complex | 2× |
| Reserve | Maximum strength, rare botanicals | 3× |

## 4.5 Seasonal Hard Sodas

- Summer: Hard Blueberry Soda, Hard Orange Orchard Soda, Hard Cherry Cola
- Fall/Winter: Hard Maple Root Beer, Hard Ginger Spice, Campfire Reserve Root Beer
- All-season: Hard Vanilla Cream

---

# 5. Applejack System

## 5.1 Freeze-Distillation Rules

- Applejack is produced by freeze-distilling cider — concentrating it through cold
- Requires: Fermenter (cider base) + Winter season or Cold Coil tool
- Minimum input: 2 cider per batch → yields 1 Applejack
- Winter season passively enables freeze-distillation without the Cooling Coil
- Outside winter, the Cooling Coil must be Level 2+ to simulate cold conditions

## 5.2 Winter Yield Bonus

- During Winter, Applejack yield increases: 2 cider → 1.5 Applejack (rounded down per batch, accumulated over multiple batches)
- Happy Bear's "check fermenter" task during winter adds a 10% yield bonus

## 5.3 Aging Rules

- Applejack can be aged in the Barrel Rack to produce Aged Applejack
- Oak aging: adds smoothness, increases Cup value by 1.5×
- Specialty wood aging: fruitwood barrels produce Fruitwood Applejack at 2× value

## 5.4 Quality Tiers

| Tier | Condition | Cup Value Multiplier |
|---|---|---|
| Common | Basic cider base, no aging | 1× |
| Fine | Ripe cider, winter production | 1.5× |
| Premium | Peak cider, oak aged | 2× |
| Masterwork | Peak cider, winter, specialty barrel | 3× |

---

# 6. Whiskey System

## 6.1 Mash Creation

- Apple mash is created in the Mash Tun from crushed fruit
- Level 1 Mash Tun: basic apple mash — standard base
- Level 2: Faster mashing, improved consistency
- Level 3: Multi-grain mash — can incorporate hops or botanicals for specialty whiskeys

## 6.2 Distillation

```
Mash Tun → Copper Still → Cooling Coil → Raw Whiskey Spirit
```

- Distillation produces a raw spirit that must be aged before it becomes whiskey
- Cooling Coil quality affects clarity and consistency of the spirit
- Level 3 Still enables flavor infusion during distillation (adds botanical notes to the spirit itself)

## 6.3 Barrel Aging

- Raw spirit is placed in the Barrel Rack to age into whiskey
- Minimum aging: 45 seconds (game time)
- Recommended aging: 90 seconds for Fine tier; 120+ seconds for Masterwork
- Age duration affects smoothness and Cup value

## 6.4 Wood Types & Flavor Effects

| Wood Type | Flavor Profile | Unlock Condition |
|---|---|---|
| Standard Oak | Classic, smooth, vanilla notes | Barrel Rack Level 1 |
| Cherrywood | Sweet, fruity, aromatic | Cherry Grove unlocked |
| Fruitwood | Subtle fruit essence, delicate | Fruitwood Barrels upgrade |
| Maple | Rich, caramel undertones | Maple Stand unlocked |

## 6.5 Output Quality Tiers

| Tier | Condition | Cup Value Multiplier |
|---|---|---|
| Common | Standard mash, oak barrel, minimum age | 1× |
| Fine | Ripe fruit mash, standard aging | 1.5× |
| Premium | Peak mash, cherrywood barrel, full aging | 2.5× |
| Masterwork | Peak mash, specialty barrel, maximum age, botanical infusion | 4× |

---

# 7. Beer System

## 7.1 Full Workflow

```
Mash Tun → Boil Kettle → Hops Addition → Fermenter → Bottling Station
```

## 7.2 Hops Hill Integration

- Hops are grown at Hops Hill and harvested seasonally (summer peak)
- Hops quantity affects bitterness and aroma profile
- More hops → more bitter; fewer hops → softer, fruit-forward
- Hop varieties will be introduced in future updates

## 7.3 Step Details

- **Mash:** Grain or fruit mash created in the Mash Tun (same tool as whiskey mash)
- **Boil:** Mash is boiled to sterilize and concentrate; duration affects body
- **Hops Addition:** Added during or after boil; affects aroma and bitterness
- **Ferment:** Fermented in the Fermenter (same tool as cider); separate queue from cider batches
- **Bottle:** Bottled at the Bottling Station

## 7.4 Seasonal Beer Variants

- Spring: N/A (hops not in season)
- Summer: Peach Summer Ale, Cherry Red Ale, Watermelon Wheat
- Fall: Orchard Ale (hops peak), Experimental Cider-Beer Hybrid
- Winter: N/A (reduced hops yield)

## 7.5 Hybrid Cider-Beer Rules

- Cider-Beer Hybrid requires: cider base + malt + hops
- Produced in the Fermenter after combining inputs at the Mash Tun
- Unlocks at Brewery Level 2
- Output has characteristics of both categories; high Cup value

---

# 8. Coffee System

## 8.1 Coffee Cherry Harvesting

- Coffee Cherries are grown in the Tropical Greenhouse
- Harvest cycle: longer than fruit trees (requires patience)
- Raw cherries must be processed before use — they cannot go directly into beverages

## 8.2 Roasting Levels

| Roast Level | Profile | Unlocks |
|---|---|---|
| Light | Bright, fruity, acidic | Orchard Roast, Morning Blend |
| Medium | Balanced, smooth, caramel | Dawn Brew, standard coffee |
| Dark | Bold, rich, bitter | Coffee-Fruit Fusion, Coffee Stout base |

- Roaster Level 1: Light and Medium roasts only
- Roaster Level 2: All roast levels; precision timing
- Roaster Level 3: Multi-batch roasting; roast-level blending

## 8.3 Flavor Blending

- Roasted coffee can be blended with fruit, botanicals, or honey at the Flavor Table
- Apple + coffee → Morning Blend (bright, fruity)
- Honey + coffee → Dawn Brew (smooth, floral)
- Seasonal fruit + coffee → Coffee-Fruit Fusion (rotating)

## 8.4 Specialty Brews

- Coffee-Fruit Fusion: seasonal, high Cup value, changes recipe each season
- Coffee Stout: requires Brewery + Roastery both operational; combines dark roast with beer base
- Iced Coffee variants: future update

## 8.5 Output Quality Tiers

| Tier | Condition | Cup Value Multiplier |
|---|---|---|
| Common | Light roast, no blending | 1× |
| Fine | Medium roast, single blend | 1.5× |
| Premium | Dark roast, dual blend | 2× |
| Masterwork | Precision roast, multi-botanical blend, seasonal fruit | 3× |

---

# 9. Seasonal System

## 9.1 Season Cycle Rules

- Seasons cycle automatically based on in-game day count
- Each season lasts 10 in-game days
- Season order: Spring → Summer → Fall → Winter → repeat
- Season transitions trigger a Happy Bear story moment and visual overlay change

## 9.2 Seasonal Crop Growth Modifiers

| Season | Apples | Berries | Watermelon | Hops | Maple | Coffee |
|---|---|---|---|---|---|---|
| Spring | 1.2× | 1.5× | 0× | 0.5× | 0.5× | 0.8× |
| Summer | 1.0× | 1.2× | 1.5× | 1.5× | 0.5× | 1.2× |
| Fall | 1.3× | 0.8× | 0× | 1.2× | 2.0× | 1.0× |
| Winter | 0.5× | 0× | 0× | 0× | 1.0× | 0.5× |

## 9.3 Seasonal Recipe Availability

- Seasonal recipes appear in the recipe list only during their season
- Attempting to craft a seasonal recipe outside its season produces an error message from Happy Bear
- Stockpiling seasonal ingredients allows crafting after the season ends (one-time allowance)

## 9.4 Seasonal Visual Effects

- **Spring:** Pastel bloom haze, drifting cherry petals, bright greens
- **Summer:** High-contrast sunlight, firefly particles at dusk, vivid saturation
- **Fall:** Falling leaf particles, amber/orange light filter, harvest glow on ripe tiles
- **Winter:** Snow accumulation on tiles, frost effects, cold blue ambient lighting

## 9.5 Seasonal Bonuses

- **Spring:** Berry yield +50%, floral recipe quality +1 tier
- **Summer:** Watermelon activated, hops yield boosted
- **Fall:** Maple sap flow ×2, apple yield +30%, cider aging time reduced by 20%
- **Winter:** Applejack freeze-distillation yield bonus, seasonal decorations unlock

---

# 10. Happy Bear Task System

## 10.1 Daily Tasks

Each in-game day, Happy Bear presents 1–3 small tasks:
- Water a specific tile
- Harvest a ripe crop
- Craft a specific beverage
- Check on a fermenter or still

Completing daily tasks rewards:
- Bonus Cups
- Rare ingredients
- Story fragments
- Bear Energy (for larger tasks)

## 10.2 Cabin Cleaning

- Happy Bear periodically sweeps the Cabin
- Cleaning improves tool efficiency by 5% for the rest of the day
- Player can trigger a cleaning early by interacting with Happy Bear

## 10.3 Fermenter Checks

- Happy Bear checks fermenters and stills automatically every few in-game hours
- A successful check boosts fermentation speed by 10%
- A missed check (if Happy Bear is busy elsewhere) has no penalty — just no bonus

## 10.4 Flavor Reactions

- When a new recipe is crafted for the first time, Happy Bear reacts with unique dialogue
- Each beverage category has 3–5 flavor reaction lines
- Premium and Masterwork outputs trigger special "delighted" animations

## 10.5 Seasonal Outfits

- Happy Bear changes outfit each season:
  - Spring: Flower crown and light apron
  - Summer: Straw hat and rolled sleeves
  - Fall: Cozy scarf and harvest vest
  - Winter: Woolly hat and mittens

## 10.6 Story-Triggered Tasks

- Certain story milestones unlock special one-time tasks (e.g., "Help Happy Bear build the Soda Station")
- These tasks reward story pages, exclusive decorations, or bonus recipes

---

# 11. Cabin Expansion System

## 11.1 Wing Unlock Order

| Wing | Unlock Condition | New Tools |
|---|---|---|
| Cider Cabin (Starter) | Automatic | Press, Fermenter, Bottling Station |
| Flavor Wing | Cabin Level 2 | Flavor Table, Storage Shelves |
| Soda Station Wing | Cabin Level 3 | Soda Station |
| Distillery Wing | Cabin Level 4 | Copper Still, Mash Tun, Cooling Coil |
| Brewery Wing | Cabin Level 5 | Brew Kettle (Mash Tun shared) |
| Roastery Wing | Cabin Level 6 | Roaster |

## 11.2 Capacity Increases

- Each new wing adds 2–4 additional tool slots
- Storage Shelves upgrade increases ingredient inventory cap by 20 per level
- Multi-batch upgrades allow parallel production queues

## 11.3 Tool Slot Expansion

- Cabin Level 1: 3 tool slots
- Cabin Level 2: 5 tool slots
- Cabin Level 3: 7 tool slots
- Cabin Level 4: 10 tool slots
- Cabin Level 5: 13 tool slots
- Cabin Level 6: 16 tool slots

## 11.4 Decorative Upgrades

- Each cabin level unlocks new decorative items (shelves, signs, rugs, seasonal items)
- Decorations have no mechanical effect but contribute to the cabin's visual cozy rating
- High cozy rating triggers Happy Bear bonus dialogue and occasional gift items

---

# 12. Resource Economy System

## 12.1 Cups (Soft Currency)

- Primary currency for tile unlocks, cabin upgrades, and zone access
- Earned by bottling and selling finished beverages
- Cup value scales with quality tier and rarity of recipe
- Seasonal and limited recipes yield bonus Cups

## 12.2 Wood and Stone (Construction Resources)

- Used to build and upgrade tools and cabin wings
- Sourced from clearing orchard tiles (wood from trees/stumps, stone from rocks)
- Scaling costs: later tools require significantly more wood and stone
- Cannot be purchased with Cups — must be farmed from the orchard

## 12.3 Fruit and Botanicals (Production Inputs)

- Core production resources consumed during crafting
- Quality varies: Standard → Ripe → Peak (based on watering and grow time)
- Seasonal modifiers affect growth speed and peak yield windows
- Botanicals are rarer and take longer to harvest than fruit

## 12.4 Bear Energy (Task Pacing)

- Happy Bear has a daily energy pool
- Each task Happy Bear performs consumes 1 Bear Energy
- Bear Energy refills completely at the start of each in-game day
- Player can restore Bear Energy mid-day using Honey (consumable resource)

## 12.5 Scaling Rules

- Tool construction costs scale exponentially: each tier costs roughly 2–3× the previous
- Zone unlock costs scale linearly with distance from the Cabin (see WorldMap.md)
- Cup rewards scale with recipe complexity, quality tier, and seasonal bonus
- Late-game recipes yield 5–10× more Cups than starter recipes

---

# 13. Quality & Tier System

## 13.1 How Ingredient Quality Affects Output

- Standard fruit → maximum Common tier output
- Ripe fruit → maximum Fine tier output
- Peak fruit → Fine or Premium tier output (depends on tools and process)
- Botanical quality follows the same three-tier model

## 13.2 How Tool Upgrades Affect Quality

- Level 1 tools cap output at Fine tier
- Level 2 tools enable Premium tier output
- Level 3 tools enable Masterwork tier output
- Using a Level 3 tool with low-quality inputs still caps at Fine tier — ingredients matter

## 13.3 Tier Definitions

| Tier | Description | Visual Indicator | Cup Multiplier |
|---|---|---|---|
| Common | Basic recipe, standard ingredients, basic tools | Grey label | 1× |
| Fine | Good ingredients, standard process | Blue label | 1.5× |
| Premium | Peak ingredients, flavored or aged, upgraded tools | Gold label | 2–2.5× |
| Masterwork | Peak everything, specialty barrel or botanical blend | Platinum label with shimmer | 3–4× |

---

# 14. Automation & Efficiency Systems

## 14.1 Tool Upgrades That Reduce Time

- Every tool has 3 levels; each level reduces processing time by 30–40%
- Level 3 tools in the same category can share batches (e.g., dual fermentation)
- Cooling Coil Level 3 enables continuous distillation with no cooldown period

## 14.2 Multi-Batch Systems

- Level 3 Fermenter: runs two fermentation batches simultaneously
- Level 3 Bottling Station: bottles three products in one action
- Level 3 Soda Station: produces two soda types in parallel
- Level 3 Roaster: roasts two coffee batches with different roast levels at once

## 14.3 Storage and Inventory Rules

- Each resource type has an inventory cap (default: 20 units)
- Storage Shelves increase cap by 20 per upgrade level (max cap: 80 units at Level 3)
- Botanical storage is separate from fruit storage; expanded by Botanical Grove unlock
- Overflow resources are lost — the player must manage inventory actively

## 14.4 Late-Game Efficiency Loops

- Fully upgraded cabin produces beverages in 30–50% of the time of starter tools
- Multi-batch production enables passive income during orchard expansion
- Seasonal bonuses align naturally with high-demand production windows
- Hybrid beverages (cider-beer, coffee-fruit) require multiple systems running simultaneously — the ultimate late-game loop

---

# 15. Cross-System Synergy

## 15.1 Cider Supports Whiskey and Applejack

- Cider is the direct input for Applejack (freeze-distilled)
- Apple Whiskey begins with apple mash — a parallel of the cider press step
- A player investing in cider quality automatically benefits whiskey and applejack output quality

## 15.2 Botanicals Support Soda and Coffee

- The same botanical harvest (Botanical Grove) feeds both Craft Soda and Coffee systems
- Sassafras and birch are used in root beer; vanilla is used in cream soda and coffee blends
- A well-stocked botanical inventory enables simultaneous soda and coffee production

## 15.3 Seasonal Crops Unlock Hybrid Beverages

- Summer watermelon → Watermelon Wheat (beer hybrid)
- Fall maple → Hard Maple Root Beer (soda hybrid)
- Spring honey pear → Honey Pear Fizz + Golden Vow (cider hybrid)
- Coffee + hops (both late-game crops) → Coffee Stout (the ultimate cross-system recipe)

## 15.4 Cabin Upgrades Unlock New Systems

- Each cabin level does not just add tools — it enables previously impossible recipes
- Cabin Level 4 is the pivot point: Distillery wing enables hard soda, applejack, and whiskey simultaneously
- Cabin Level 6 completes the loop: Roastery enables coffee, which blends with every other system

---

# 16. Final Notes

This file is the authoritative source for all production, crafting, seasonal, and progression systems in Happy Bear Cozy Orchard.

All future code implementations, data model definitions, recipe JSON entries, UI logic, and gameplay mechanics must follow the rules and structures defined in this document. Where this document conflicts with earlier documents, this document takes precedence for system-level rules. For recipe-specific data, defer to `docs/Recipes.md`. For zone-specific data, defer to `docs/WorldMap.md`.
