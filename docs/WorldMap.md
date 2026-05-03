# Happy Bear Cozy Orchard — World Map & Zones (v1.0)

The world of Happy Bear Cozy Orchard is a tile-based orchard divided into themed zones.  
Each zone introduces new crops, botanicals, recipes, and story moments.

This file defines:
- All zones  
- Tile types  
- Zone unlock conditions  
- Biome transitions  
- Resource distribution  
- Seasonal variations  

---

# 1. World Structure Overview

The orchard is a grid-based world expanding outward from the Cabin.  
The Cabin sits at the center of the map and acts as the anchor for all expansion.

## 1.1 World Layout
- Central Cabin  
- Surrounding starter tiles  
- Expanding rings of zones  
- Special biomes at the edges  

## 1.2 Zone Types
- Fruit Zones  
- Botanical Zones  
- Specialty Zones  
- Seasonal Zones  
- Production Zones (Cabin wings)  

---

# 2. Tile Types

Each tile has a type and a state.

## 2.1 Tile Types
- **Grass Tile** — empty, plantable  
- **Tree Tile** — fruit tree  
- **Patch Tile** — berries, watermelon  
- **Botanical Tile** — herbs, roots, bark  
- **Obstacle Tile** — rocks, stumps, logs  
- **Decorative Tile** — placed by player  
- **Locked Tile** — not yet unlocked  
- **Fogged Tile** — hidden until adjacent tile is unlocked  

## 2.2 Tile States
- Locked  
- Fogged  
- Clearable  
- Cleared  
- Planted  
- Growing  
- Harvestable  
- Dead (if neglected)  

---

# 3. Zone List & Details

---

## 3.1 Apple Grove (Starter Zone)

**Unlock:** Starter  
**Crops:** Apple Trees  
**Features:**  
- Tutorial area  
- Happy Bear's first tasks  
- Basic resources  

---

## 3.2 Peach Orchard

**Unlock:** Clear 10 tiles  
**Crops:** Peach Trees  
**Features:**  
- Early-game fruit variety  
- Unlocks peach-based ciders  

---

## 3.3 Cherry Grove

**Unlock:** Clear 20 tiles  
**Crops:** Cherry Trees  
**Features:**  
- Cherry-based sodas and ciders  
- Cherrywood barrels for whiskey  

---

## 3.4 Strawberry Patch

**Unlock:** Unlock Peach Orchard  
**Crops:** Strawberries  
**Features:**  
- Spring recipes  
- Strawberry Spark Soda  

---

## 3.5 Blueberry Bend

**Unlock:** Unlock Strawberry Patch  
**Crops:** Blueberries  
**Features:**  
- Blueberry Breeze Soda  
- Cider Creek Blue  

---

## 3.6 Watermelon Patch

**Unlock:** Clear 30 tiles  
**Crops:** Watermelon  
**Features:**  
- Summer-only harvest  
- Creekside Watermelon cider  

---

## 3.7 Pear Meadow

**Unlock:** Clear 40 tiles  
**Crops:** Pear Trees  
**Features:**  
- Honey Pear Fizz  
- Golden Vow (Original)  

---

## 3.8 Botanical Grove

**Unlock:** Cabin Level 3  
**Crops:**  
- Sassafras  
- Birch Bark  
- Vanilla Bean  
- Wild Cherry Bark  

**Features:**  
- Root beer ingredients  
- Craft soda expansion  

---

## 3.9 Ginger Patch

**Unlock:** Unlock Botanical Grove  
**Crops:** Ginger Root  
**Features:**  
- Ginger Grove Soda  
- Hard Ginger Spice  

---

## 3.10 Maple Stand

**Unlock:** Clear 50 tiles  
**Crops:** Maple Sap  
**Features:**  
- Maple Brown Soda  
- Hard Maple Root Beer  

---

## 3.11 Hops Hill

**Unlock:** Cabin Level 5  
**Crops:** Hops  
**Features:**  
- Beer system unlock  
- Orchard Ale  
- Seasonal beer variants  

---

## 3.12 Tropical Greenhouse

**Unlock:** Cabin Level 6  
**Crops:**  
- Coffee Cherries  
- Citrus  
- Exotic botanicals  

**Features:**  
- Coffee system  
- Hard Orange Orchard Soda  
- Coffee-fruit blends  

---

# 4. Biome Transitions

Each zone has a visual and mechanical identity.

## 4.1 Biome Types
- Temperate Orchard (Apples, Pears, Peaches)  
- Berry Fields (Strawberries, Blueberries)  
- Summer Patch (Watermelon)  
- Botanical Forest (Sassafras, Birch, Ginger)  
- Maple Woods (Maple Stand)  
- Hops Highlands (Hops Hill)  
- Tropical Biome (Greenhouse)  

## 4.2 Transition Rules
- Adjacent zones blend visually  
- Seasonal overlays apply globally  
- Special effects:  
  - Fireflies in summer  
  - Falling leaves in fall  
  - Snow in winter  

---

# 5. Expansion Logic

## 5.1 Unlock Requirements
Each tile requires:
- Cups  
- Wood  
- Stone  

Costs scale with distance from the Cabin.

## 5.2 Fog-of-War
Tiles remain hidden until:
- Adjacent tile is unlocked  
- Zone unlock condition is met  

## 5.3 Resource Rewards
Clearing tiles may yield:
- Wood  
- Stone  
- Rare botanicals  
- Seasonal bonuses  

---

# 6. Seasonal Effects on Zones

## Spring
- Fast berry growth  
- Floral overlays  
- Seasonal recipes unlock  

## Summer
- Watermelon grows  
- Blueberries peak  
- Bright lighting  
- Firefly particle effects  

## Fall
- Maple Stand active — sap flowing  
- Falling leaf particle effects  
- Apple yields boosted  
- Warm amber lighting  

## Winter
- Snow overlay across all zones  
- Applejack bonus yield active  
- Slow crop growth  
- Winter decorations unlock  

---

# 7. Zone Summary Table

| # | Zone | Unlock Condition | Key Crops | Key Recipes |
|---|---|---|---|---|
| 1 | Apple Grove | Starter | Apples | The Happy Pour |
| 2 | Peach Orchard | Clear 10 tiles | Peaches | Peach Summer Ale |
| 3 | Cherry Grove | Clear 20 tiles | Cherries | Cherry Red Ale, Hard Cherry Cola |
| 4 | Strawberry Patch | Peach Orchard unlocked | Strawberries | Strawberry Spark Soda |
| 5 | Blueberry Bend | Strawberry Patch unlocked | Blueberries | Blueberry Breeze, Cider Creek Blue |
| 6 | Watermelon Patch | Clear 30 tiles | Watermelon | Creekside Watermelon, Watermelon Wheat |
| 7 | Pear Meadow | Clear 40 tiles | Pears | Honey Pear Fizz, Golden Vow |
| 8 | Botanical Grove | Cabin Level 3 | Sassafras, Birch, Vanilla | Happy Bear Root Beer |
| 9 | Ginger Patch | Botanical Grove unlocked | Ginger Root | Ginger Grove Soda, Hard Ginger Spice |
| 10 | Maple Stand | Clear 50 tiles | Maple Sap | Maple Brown Soda, Hard Maple Root Beer |
| 11 | Hops Hill | Cabin Level 5 | Hops | Orchard Ale, Fruit Beers |
| 12 | Tropical Greenhouse | Cabin Level 6 | Coffee, Citrus | Orchard Roast, Hard Orange Orchard Soda |

---

# End of World Map & Zones
This file is the authoritative source for world layout, zone progression, tile behavior, and biome transitions.
