# Happy Bear Cozy Orchard — Data Models & Schemas (v1.0)

This file is the authoritative source for all data structures and schemas in Happy Bear Cozy Orchard. Every JSON data file in `src/data/` must conform to the schemas defined here. All future data additions, system implementations, and AI-assisted development must follow this document exactly.

---

# 1. Data Model Overview

## Purpose of Data Models

Data models define the shape of every piece of structured information in the game. They allow game systems to be written against a stable, predictable contract rather than against hardcoded values. Every recipe, tool, zone, crop, story event, and character exists as a data object — the systems that execute gameplay behavior read from these objects at runtime.

## How Systems Read From and Write to Data

- **Read:** Systems import JSON files as ES module imports. Data is loaded once at startup and held in memory. Systems never modify the imported data directly.
- **Write:** When game state changes (e.g., a recipe is crafted, a tool is built), systems update their own internal state. Persistent state (save data) is serialized to `localStorage` as a snapshot of internal state, not as a mutation of the data files.
- **Lookup:** All data collections use `id`-keyed objects (not arrays) so any object can be retrieved in O(1) by its ID.

## Principles

- **Consistency:** Every object of the same type has the same fields. Optional fields are documented as optional and always present with a `null` or empty default rather than absent.
- **Clarity:** Field names are self-documenting camelCase strings. No abbreviations unless they are universal (e.g., `id`, `sfx`).
- **AI-Readiness:** Schemas are fully specified with types, valid values, and examples. Any contributor or AI system reading this document can produce a valid data object without additional context.
- **Modularity:** Adding a new recipe, zone, or tool requires only a new data object — no schema changes. New fields are added only when a new system requires them.

## How JSON Structures Map to Gameplay Systems

| Data File | System That Reads It |
|---|---|
| `recipes.json` | CraftingSystem |
| `progression.json` | ProgressionSystem |
| `crops.json` | CropSystem, TileGrid |
| `tools.json` | ConstructionSystem |
| `zones.json` | WorldSystem (future) |
| `seasons.json` | SeasonSystem (future) |
| `dialogue.json` | TaskSystem, narrative triggers (future) |

---

# 2. Core Data Types

| Type | Description |
|---|---|
| **Ingredient** | A harvestable input used in beverage production (fruit, botanical, grain, spice) |
| **Recipe** | A crafting formula — inputs, tools, steps, output, and unlock conditions |
| **Tool** | A buildable workstation with construction costs, upgrade levels, and supported workflows |
| **Zone** | A named orchard area with associated crops, biome identity, and unlock conditions |
| **Tile** | A single grid cell with state, type, zone membership, and optional crop/obstacle data |
| **Season** | One of four seasonal cycles with crop modifiers, visual effects, and available recipes |
| **StoryEvent** | A narrative beat with trigger conditions, character dialogue, and optional rewards |
| **Character** | A named character with personality, behaviors, outfits, and dialogue sets |
| **BeverageCategory** | A top-level production category (cider, soda, whiskey, etc.) with workflow rules |
| **QualityTier** | A named output quality level (Common, Fine, Premium, Masterwork) with effects |
| **Resource** | A tracked in-game resource (Cups, Wood, Stone, Fruit, etc.) with acquisition rules |

---

# 3. Ingredient Schema

```json
{
  "id": "string — unique identifier, snake_case",
  "name": "string — display name",
  "icon": "string — emoji or asset reference",
  "type": "string — enum: fruit | botanical | grain | spice | sap | bark | root | berry",
  "zoneSource": "string — zone ID where this ingredient is grown or harvested",
  "growthTimeTicks": "number — grow ticks needed to reach harvestable state",
  "seasonality": {
    "available": ["string — season IDs when this ingredient grows"],
    "peakSeason": "string | null — season ID when growth modifier is highest"
  },
  "qualityRange": {
    "min": "string — enum: standard | ripe | peak",
    "max": "string — enum: standard | ripe | peak"
  },
  "yieldPerHarvest": "number — units produced per harvest action",
  "unlockTier": "number — minimum progression tier required to plant or harvest",
  "notes": "string — flavor or lore note"
}
```

### Field Rules
- `id` must be unique across all ingredients and must match keys in `crops.json`
- `type` must be one of the listed enum values
- `seasonality.available` must contain at least one season ID
- `qualityRange.max` must be >= `qualityRange.min` in the ordering: standard < ripe < peak

---

# 4. Recipe Schema

```json
{
  "id": "string — unique identifier, snake_case",
  "name": "string — display name",
  "category": "string — enum: cider | craft_soda | hard_soda | applejack | whiskey | beer | coffee",
  "station": "string — tool ID of the primary station where this recipe is executed",
  "inputs": {
    "[ingredientId]": "number — quantity required"
  },
  "outputs": {
    "[resourceId]": "number — quantity produced"
  },
  "workflowSteps": ["string — ordered list of station IDs in the production chain"],
  "timerSecs": "number — seconds to complete (0 = instant)",
  "seasonality": {
    "available": ["string — season IDs when this recipe is craftable, or ['all']"],
    "seasonalBonus": "string | null — quality tier upgrade granted in peak season"
  },
  "unlockTier": "number — minimum progression tier required",
  "unlockConditions": {
    "zones": ["string | null — zone IDs that must be unlocked"],
    "tools": ["string | null — tool IDs that must be operational"],
    "storyEvent": "string | null — story event ID that must have fired"
  },
  "outputQualityRules": {
    "baseQuality": "string — enum: common | fine | premium | masterwork",
    "inputQualityBonus": "boolean — whether peak ingredients upgrade output tier",
    "toolLevelBonus": "boolean — whether tool upgrade level upgrades output tier"
  },
  "cupValue": "number — base Cup reward for completing this recipe",
  "notes": "string — flavor or lore note"
}
```

### Field Rules
- `station` must match a valid tool `id`
- All keys in `inputs` must match valid ingredient or resource `id` values
- All keys in `outputs` must match valid resource `id` values
- `timerSecs` of 0 means the recipe resolves instantly on execution
- `workflowSteps` lists the full chain (e.g., `["press", "fermenter", "bottling"]`); `station` is always the step where the player initiates the recipe

---

# 5. Tool Schema

```json
{
  "id": "string — unique identifier, snake_case",
  "name": "string — display name",
  "icon": "string — emoji or asset reference",
  "category": "string — enum: press | fermenter | bottling | flavor_table | storage | soda_station | still | mash_tun | cooling_coil | barrel_rack | roaster",
  "description": "string — one-line description of the tool's purpose",
  "constructionCost": {
    "wood": "number",
    "stone": "number",
    "cups": "number"
  },
  "constructionSecs": "number — seconds to build at Level 1",
  "upgradeLevels": [
    {
      "level": "number — 1, 2, or 3",
      "description": "string — what this level unlocks",
      "speedMultiplier": "number — production speed multiplier vs Level 1",
      "qualityBonus": "boolean — whether this level enables a higher output quality tier",
      "upgradeCost": {
        "wood": "number",
        "stone": "number",
        "cups": "number"
      }
    }
  ],
  "supportedWorkflows": ["string — recipe category IDs this tool participates in"],
  "dependencies": ["string — tool IDs or cabin level IDs that must exist before this tool can be built"],
  "unlockTier": "number — minimum progression tier required",
  "notes": "string — flavor or lore note"
}
```

### Field Rules
- `id` must match the `station` field of any recipe that uses this tool
- `upgradeLevels` always contains exactly 3 entries (levels 1, 2, 3)
- `dependencies` may be empty (`[]`) for starter tools
- `supportedWorkflows` must reference valid `BeverageCategory` IDs

---

# 6. Zone Schema

```json
{
  "id": "string — unique identifier, snake_case",
  "name": "string — display name",
  "biomeType": "string — enum: temperate_orchard | berry_fields | summer_patch | botanical_forest | maple_woods | hops_highlands | tropical",
  "unlockCondition": {
    "type": "string — enum: starter | tiles_cleared | cabin_level | zone_unlocked",
    "value": "number | string | null — the threshold value for the unlock type"
  },
  "crops": ["string — ingredient IDs harvestable in this zone"],
  "seasonalEffects": {
    "spring": "string | null — description of spring effect",
    "summer": "string | null — description of summer effect",
    "fall": "string | null — description of fall effect",
    "winter": "string | null — description of winter effect"
  },
  "visualStyle": {
    "palette": "string — description of color palette",
    "atmosphere": "string — description of visual atmosphere",
    "specialEffects": ["string — list of particle or overlay effects"]
  },
  "recipesUnlocked": ["string — recipe IDs unlocked when this zone becomes available"],
  "storyEvents": ["string — story event IDs triggered by this zone unlock"],
  "notes": "string — flavor or lore note"
}
```

### Field Rules
- `unlockCondition.type` of `starter` requires no `value`
- `unlockCondition.type` of `tiles_cleared` requires a numeric `value`
- `unlockCondition.type` of `cabin_level` requires a numeric `value` (1–6)
- `unlockCondition.type` of `zone_unlocked` requires a zone `id` as `value`
- All crop IDs in `crops` must exist in the ingredient data

---

# 7. Tile Schema

```json
{
  "id": "string — unique identifier (e.g., 'tile_4_5' for grid position x=4, y=5)",
  "x": "number — grid x coordinate (0-indexed)",
  "y": "number — grid y coordinate (0-indexed)",
  "tileType": "string — enum: grass | tree | patch | botanical | obstacle | decorative | locked | fogged",
  "tileState": "string — enum: locked | fogged | clearable | cleared | planted | growing | harvestable | dead",
  "zone": "string | null — zone ID this tile belongs to",
  "unlockCost": {
    "cups": "number",
    "wood": "number",
    "stone": "number"
  },
  "growthData": {
    "cropId": "string | null — ingredient ID of planted crop",
    "growthTicks": "number — current grow ticks accumulated",
    "growthTicksNeeded": "number — grow ticks required to reach harvestable",
    "watered": "boolean — whether tile was watered this growth cycle",
    "qualityModifier": "string | null — enum: standard | ripe | peak"
  },
  "obstacleData": {
    "obstacleType": "string | null — enum: rock | stump | log | bush",
    "clearReward": {
      "[resourceId]": "number — resource yield on clearing"
    }
  },
  "notes": "string | null"
}
```

### Field Rules
- `growthData` fields are only meaningful when `tileState` is `planted`, `growing`, or `harvestable`; all other states set `growthData.cropId` to `null`
- `obstacleData` fields are only meaningful when `tileState` is `clearable`
- `unlockCost` is only applied when the tile transitions from `locked` or `fogged` to `clearable`

---

# 8. Season Schema

```json
{
  "id": "string — enum: spring | summer | fall | winter",
  "name": "string — display name",
  "durationDays": "number — in-game days this season lasts",
  "cropModifiers": {
    "[cropId]": "number — growth speed multiplier (1.0 = baseline)"
  },
  "globalModifiers": {
    "fermentationSpeed": "number — multiplier applied to all fermentation timers",
    "applejackYieldBonus": "number — additional fractional yield per batch (0 = none)",
    "cupsValueMultiplier": "number — multiplier on Cup rewards for seasonal recipes"
  },
  "visualEffects": ["string — list of overlay or particle effect identifiers"],
  "seasonalRecipes": ["string — recipe IDs only available this season"],
  "seasonalEvents": ["string — story event IDs triggered this season"],
  "happyBearOutfit": "string — outfit identifier for Happy Bear this season",
  "notes": "string"
}
```

### Field Rules
- `cropModifiers` keys must match valid ingredient `id` values
- A crop not listed in `cropModifiers` is assumed to have a modifier of `1.0`
- A crop modifier of `0` means the crop does not grow this season
- `seasonalRecipes` must reference valid recipe `id` values

---

# 9. StoryEvent Schema

```json
{
  "id": "string — unique identifier, snake_case",
  "name": "string — display name",
  "act": "number | null — story act number (1–6), null for seasonal/standalone events",
  "triggerConditions": {
    "type": "string — enum: milestone | zone_unlock | cabin_level | recipe_crafted | season | achievement",
    "value": "string | number — the specific trigger value (e.g., zone ID, cabin level number, recipe ID)"
  },
  "charactersInvolved": ["string — character IDs present in this event"],
  "narrativeText": [
    {
      "characterId": "string — who is speaking or narrating",
      "text": "string — the dialogue or narration line",
      "type": "string — enum: dialogue | narration | thought"
    }
  ],
  "rewards": {
    "cups": "number | null",
    "ingredients": { "[ingredientId]": "number" },
    "recipes": ["string | null — recipe IDs unlocked by this event"],
    "decorations": ["string | null — decoration IDs awarded"]
  },
  "repeatable": "boolean — whether this event can trigger more than once",
  "notes": "string"
}
```

### Field Rules
- `triggerConditions.type` determines how `value` is interpreted
- `narrativeText` is an ordered array — lines display in sequence
- `rewards` fields default to `null` or `{}` when not applicable; no field is omitted
- `repeatable: false` means the event fires exactly once per save file

---

# 10. Character Schema

```json
{
  "id": "string — unique identifier, snake_case",
  "name": "string — display name",
  "role": "string — enum: main | supporting | narrator",
  "personalityTraits": ["string — descriptive trait words"],
  "behaviors": {
    "daily": ["string — descriptions of recurring daily behaviors"],
    "seasonal": {
      "spring": "string — seasonal behavior note",
      "summer": "string — seasonal behavior note",
      "fall": "string — seasonal behavior note",
      "winter": "string — seasonal behavior note"
    }
  },
  "seasonalOutfits": {
    "spring": "string — outfit identifier or description",
    "summer": "string — outfit identifier or description",
    "fall": "string — outfit identifier or description",
    "winter": "string — outfit identifier or description"
  },
  "dialogueSets": {
    "greeting": ["string — greeting dialogue lines"],
    "taskSuggestion": ["string — task suggestion lines"],
    "flavorReaction": {
      "[recipeCategory]": ["string — reaction lines for each beverage category"]
    },
    "achievement": ["string — lines triggered on player achievements"],
    "seasonal": {
      "[seasonId]": ["string — season-specific dialogue lines"]
    }
  },
  "storyRoles": ["string — story event IDs where this character appears"],
  "spriteAsset": "string — asset path or identifier for character sprite",
  "notes": "string"
}
```

### Field Rules
- `role` of `main` characters (Happy Bear, Story Bear) have full `dialogueSets` and `seasonalOutfits`
- `role` of `supporting` characters have minimal dialogue sets and appear only in `storyRoles` events
- `role` of `narrator` (Story Bear in panel mode) uses `dialogueSets.greeting` as narration lines

---

# 11. BeverageCategory Schema

```json
{
  "id": "string — enum: cider | craft_soda | hard_soda | applejack | whiskey | beer | coffee",
  "name": "string — display name",
  "icon": "string — emoji or asset reference",
  "unlockTier": "number — minimum cabin level required to access this category",
  "workflow": ["string — ordered list of tool IDs in the production chain"],
  "qualityRules": {
    "ingredientQualityMatters": "boolean",
    "toolLevelMatters": "boolean",
    "agingMatters": "boolean",
    "seasonalBonus": "boolean"
  },
  "seasonalVariants": ["string — recipe IDs that are seasonal variants of this category"],
  "recipesInCategory": ["string — all recipe IDs belonging to this category"],
  "notes": "string"
}
```

### Field Rules
- `workflow` lists the canonical tool chain for the category (e.g., `["press", "fermenter", "bottling"]` for cider)
- Individual recipes may have shorter or extended workflows; the category workflow is the default path
- `recipesInCategory` must reference valid recipe `id` values

---

# 12. QualityTier Schema

```json
{
  "id": "string — enum: common | fine | premium | masterwork",
  "name": "string — display name",
  "order": "number — sort order (1 = lowest, 4 = highest)",
  "numericRange": {
    "min": "number — minimum quality score for this tier",
    "max": "number — maximum quality score for this tier"
  },
  "visualIndicators": {
    "labelColor": "string — CSS color or color name",
    "labelText": "string — short label text (e.g., 'Common', 'Masterwork')",
    "hasShimmer": "boolean — whether the label has an animated shimmer effect"
  },
  "gameplayEffects": {
    "cupValueMultiplier": "number — multiplier on base Cup reward",
    "happyBearReaction": "string — enum: neutral | pleased | excited | amazed",
    "storyUnlock": "boolean — whether first Masterwork of a category triggers a story beat"
  },
  "unlockConditions": {
    "minToolLevel": "number — minimum tool upgrade level needed to produce this tier",
    "minIngredientQuality": "string — enum: standard | ripe | peak"
  },
  "notes": "string"
}
```

### Field Rules
- The four valid `id` values are `common`, `fine`, `premium`, `masterwork` in ascending order
- `numericRange` values are for internal quality score calculation; the ranges must be contiguous with no gaps
- `unlockConditions.minToolLevel` of 1 means the tier is achievable from day one

---

# 13. Resource Schema

```json
{
  "id": "string — unique identifier, snake_case",
  "name": "string — display name",
  "icon": "string — emoji or asset reference",
  "type": "string — enum: currency | material | ingredient | consumable",
  "usage": ["string — descriptions of what this resource is spent on"],
  "acquisitionMethods": ["string — descriptions of how this resource is obtained"],
  "stackLimit": "number — maximum amount the player can hold (use 999 for effectively unlimited)",
  "unlockTier": "number — tier at which this resource first appears in the HUD",
  "notes": "string"
}
```

### Resource Registry

| ID | Name | Type | Unlocks at Tier |
|---|---|---|---|
| `cups` | Cups | currency | 0 |
| `wood` | Wood | material | 0 |
| `stone` | Stone | material | 0 |
| `fruit` | Fruit | ingredient | 0 |
| `juice` | Juice | ingredient | 1 |
| `cider` | Cider | ingredient | 1 |
| `hops` | Hops | ingredient | 4 |
| `applejack` | Applejack | ingredient | 2 |
| `whiskey` | Whiskey | ingredient | 3 |
| `fruit_beer` | Fruit Beer | ingredient | 4 |
| `coffee_bean` | Coffee Bean | ingredient | 5 |
| `roasted_coffee` | Roasted Coffee | ingredient | 5 |
| `coffee_stout` | Coffee Stout | ingredient | 5 |

---

# 14. Cross-Model Relationships

## Recipes Reference Ingredients and Tools

- `recipe.inputs` keys must match `ingredient.id` or `resource.id` values
- `recipe.station` must match `tool.id`
- `recipe.workflowSteps` must be an ordered list of valid `tool.id` values
- `recipe.unlockConditions.zones` must match `zone.id` values
- `recipe.unlockConditions.storyEvent` must match `storyEvent.id`

## Zones Reference Crops and Biome Types

- `zone.crops` must contain valid `ingredient.id` values
- `zone.recipesUnlocked` must reference valid `recipe.id` values
- `zone.storyEvents` must reference valid `storyEvent.id` values

## Story Events Reference Characters and Seasons

- `storyEvent.charactersInvolved` must contain valid `character.id` values
- `storyEvent.triggerConditions.type` of `season` requires a valid season `id` as the value
- `storyEvent.rewards.recipes` must reference valid `recipe.id` values

## Tools Reference Workflows and Dependencies

- `tool.supportedWorkflows` must reference valid `beverageCategory.id` values
- `tool.dependencies` must reference valid `tool.id` values or cabin level identifiers
- `tool.id` must match the `station` field of any recipe that uses it

## Quality Tiers Apply Across All Beverage Categories

- Every `beverageCategory` supports all four `qualityTier` levels
- The achievable maximum tier is gated by `qualityTier.unlockConditions.minToolLevel` and `minIngredientQuality`
- `qualityTier.gameplayEffects.cupValueMultiplier` is applied to `recipe.cupValue` at output time

---

# 15. Example JSON Objects

## Ingredient Example

```json
{
  "id": "apple",
  "name": "Apple",
  "icon": "🍎",
  "type": "fruit",
  "zoneSource": "apple_grove",
  "growthTimeTicks": 5,
  "seasonality": {
    "available": ["spring", "summer", "fall", "winter"],
    "peakSeason": "fall"
  },
  "qualityRange": {
    "min": "standard",
    "max": "peak"
  },
  "yieldPerHarvest": 3,
  "unlockTier": 0,
  "notes": "The foundation of the orchard. Fall harvests yield peak-quality fruit."
}
```

## Recipe Example

```json
{
  "id": "press_juice",
  "name": "Press Juice",
  "category": "cider",
  "station": "press",
  "inputs": { "fruit": 2 },
  "outputs": { "juice": 1 },
  "workflowSteps": ["press"],
  "timerSecs": 0,
  "seasonality": {
    "available": ["all"],
    "seasonalBonus": null
  },
  "unlockTier": 1,
  "unlockConditions": {
    "zones": [],
    "tools": ["press"],
    "storyEvent": null
  },
  "outputQualityRules": {
    "baseQuality": "common",
    "inputQualityBonus": true,
    "toolLevelBonus": true
  },
  "cupValue": 0,
  "notes": "The first step in all cider production. Juice quality inherits from fruit quality."
}
```

## Tool Example

```json
{
  "id": "press",
  "name": "🍎 Cider Press",
  "icon": "🍎",
  "category": "press",
  "description": "Crushes fruit into fresh juice.",
  "constructionCost": { "wood": 10, "stone": 5, "cups": 50 },
  "constructionSecs": 8,
  "upgradeLevels": [
    {
      "level": 1,
      "description": "Basic pressing. Single-fruit input.",
      "speedMultiplier": 1.0,
      "qualityBonus": false,
      "upgradeCost": { "wood": 0, "stone": 0, "cups": 0 }
    },
    {
      "level": 2,
      "description": "Faster pressing. 30% speed increase.",
      "speedMultiplier": 1.3,
      "qualityBonus": false,
      "upgradeCost": { "wood": 8, "stone": 4, "cups": 80 }
    },
    {
      "level": 3,
      "description": "Multi-fruit pressing. Enables blended juice. Fine tier output possible.",
      "speedMultiplier": 1.6,
      "qualityBonus": true,
      "upgradeCost": { "wood": 15, "stone": 8, "cups": 150 }
    }
  ],
  "supportedWorkflows": ["cider", "applejack"],
  "dependencies": [],
  "unlockTier": 1,
  "notes": "The foundational tool. No dependencies. Built in the starter cabin."
}
```

## Zone Example

```json
{
  "id": "cherry_grove",
  "name": "Cherry Grove",
  "biomeType": "temperate_orchard",
  "unlockCondition": {
    "type": "tiles_cleared",
    "value": 20
  },
  "crops": ["cherry"],
  "seasonalEffects": {
    "spring": "Cherry blossom overlay; pink petal drift particles active.",
    "summer": "Full fruit yield; standard growth.",
    "fall": "Reduced yield; leaves begin to turn.",
    "winter": "No yield; dormant trees visible."
  },
  "visualStyle": {
    "palette": "Deep jewel greens, bright red fruit clusters, pink blossom accents",
    "atmosphere": "Delicate, romantic, slightly dramatic in spring",
    "specialEffects": ["cherry_petal_drift_spring", "autumn_leaf_fall"]
  },
  "recipesUnlocked": ["cherry_red_ale", "hard_cherry_cola", "cherry_barrel_whiskey", "cherry_orchard_soda"],
  "storyEvents": ["act2_flavors_of_the_grove"],
  "notes": "Cherry Grove introduces the concept of cherrywood barrel aging. The Old Cooper visits when the first barrel is placed here."
}
```

## Tile Example

```json
{
  "id": "tile_4_5",
  "x": 4,
  "y": 5,
  "tileType": "grass",
  "tileState": "harvestable",
  "zone": "apple_grove",
  "unlockCost": { "cups": 0, "wood": 0, "stone": 0 },
  "growthData": {
    "cropId": "apple",
    "growthTicks": 5,
    "growthTicksNeeded": 5,
    "watered": true,
    "qualityModifier": "ripe"
  },
  "obstacleData": {
    "obstacleType": null,
    "clearReward": {}
  },
  "notes": null
}
```

## StoryEvent Example

```json
{
  "id": "mama_bear_visit",
  "name": "Mama Bear's Visit",
  "act": null,
  "triggerConditions": {
    "type": "cabin_level",
    "value": 2
  },
  "charactersInvolved": ["happy_bear", "mama_bear"],
  "narrativeText": [
    {
      "characterId": "mama_bear",
      "text": "Your grandfather would have been furious that you're making cider. He hated cider.",
      "type": "dialogue"
    },
    {
      "characterId": "happy_bear",
      "text": "She's smiling when she says it.",
      "type": "narration"
    }
  ],
  "rewards": {
    "cups": 50,
    "ingredients": { "apple": 5 },
    "recipes": ["mama_bear_pecan_pie_cider"],
    "decorations": ["mama_bears_apron"]
  },
  "repeatable": false,
  "notes": "Mama Bear arrives unannounced in fall. She unlocks the Pecan Pie cider recipe and leaves before morning."
}
```

---

# 16. Final Notes

This file is the authoritative source for all data structures and schemas in Happy Bear Cozy Orchard.

Every JSON file in `src/data/` must conform exactly to the schemas defined here. Every new data type introduced in future development must have its schema added to this document before implementation begins. If a schema in this document and a data file disagree, the schema is correct — update the data file.

For system-level behavior rules, defer to `docs/Systems.md`. For narrative content, defer to `docs/Narrative.md`. For recipe-specific data, defer to `docs/Recipes.md`. This document governs shape and structure; those documents govern content and behavior.
