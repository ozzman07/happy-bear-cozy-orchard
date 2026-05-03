# Happy Bear Cozy Orchard — World Map & Zones (v1.0)

The world of Happy Bear Cozy Orchard is a tile-based orchard divided into themed zones. Each zone introduces new crops, botanicals, recipes, and story moments. This file defines all zones, tile types, biome rules, expansion logic, and zone-specific unlocks.

---

# 1. World Structure Overview

## 1.1 Grid-Based Orchard Layout

The orchard is built on a tile grid that expands outward from the Cabin in all directions. Each tile belongs to a zone and can hold one crop, botanical, obstacle, or decoration at a time. The grid is infinite in concept but gated by zone unlocks and expansion costs.

## 1.2 Cabin at Center

The Cabin sits at the center of the world map. All expansion rings radiate outward from it. The Cabin itself grows through upgrades and gains new wings as the player progresses.

## 1.3 Expansion Rings

- **Ring 0 (Starter):** Apple Grove — the tutorial area immediately surrounding the Cabin
- **Ring 1 (Early):** Peach Orchard, Cherry Grove, Strawberry Patch
- **Ring 2 (Mid):** Blueberry Bend, Watermelon Patch, Pear Meadow
- **Ring 3 (Late):** Botanical Grove, Ginger Patch, Maple Stand
- **Ring 4 (Advanced):** Hops Hill, Tropical Greenhouse

## 1.4 Zone Categories

- **Fruit Zones:** Apple Grove, Peach Orchard, Cherry Grove, Watermelon Patch, Pear Meadow
- **Botanical Zones:** Botanical Grove, Ginger Patch, Maple Stand
- **Berry Zones:** Strawberry Patch, Blueberry Bend
- **Specialty Zones:** Hops Hill, Tropical Greenhouse
- **Production Zones:** Cabin wings (Cider, Distillery, Brewery, Roastery)

---

# 2. Tile Types

## 2.1 Tile Type Definitions

| Tile Type | Description | Plantable | Clearable |
|---|---|---|---|
| **Grass Tile** | Empty, open land ready for planting | Yes | No |
| **Tree Tile** | Occupied by a fruit tree (apple, peach, cherry, pear) | No (occupied) | Yes (chop) |
| **Patch Tile** | Occupied by a ground crop (berries, watermelon, strawberry) | No (occupied) | Yes (uproot) |
| **Botanical Tile** | Occupied by herbs, roots, bark, or sap plants | No (occupied) | Yes (uproot) |
| **Obstacle Tile** | Rocks, stumps, or fallen logs blocking the tile | No | Yes (clear) |
| **Decorative Tile** | Player-placed decorations; no crop function | No | Yes (remove) |
| **Locked Tile** | Zone not yet purchased; cannot be interacted with | No | No |
| **Fogged Tile** | Exists but hidden; revealed when adjacent tile unlocks | No | No |

## 2.2 Tile States

| State | Description | Behavior |
|---|---|---|
| **Locked** | Not yet purchased or unlocked | Shown as padlock; no interaction |
| **Fogged** | Hidden; adjacent to unlocked area | Shown as fog/mist until neighbour unlocks |
| **Clearable** | Contains an obstacle (grass, rock, stump) | Player can clear for resources |
| **Cleared** | Open soil, ready for planting | Player can dig and plant |
| **Planted** | Crop has been placed | Shows seedling; begins growth timer |
| **Growing** | Crop is actively growing | Shows progress indicator |
| **Harvestable** | Crop is fully grown | Glows or pulses; player can harvest |
| **Dead** | Crop died from neglect | Must be cleared before replanting |

## 2.3 Tile Behavior Rules

- A tile can only hold one crop or decoration at a time
- Locked tiles cannot be interacted with until the zone is purchased
- Fogged tiles are revealed when any adjacent tile is unlocked
- Clearing an obstacle yields wood, stone, or a rare botanical reward
- A planted tile that is not watered within a grace period enters a wilting state before dying
- Harvestable tiles do not expire but remain harvestable until the player acts

---

# 3. Zone List & Details

---

## 3.1 Apple Grove (Starter Zone)

**Unlock Condition:** Automatic — tutorial start  
**Crops:** Apple Trees  
**Features:**
- First area the player sees and interacts with
- Happy Bear introduces core mechanics here
- Low-cost clearing and planting to ease the player in
- Wood and stone rewards from early clearing tiles

**Recipes Unlocked:**
- The Happy Pour (starter cider)
- Washington's Orchard (once Barrel Rack is built)

**Visual Identity:** Warm green grass, gnarled apple trees with red fruit, gentle dappled light filtering through branches. Cozy and inviting.

---

## 3.2 Peach Orchard

**Unlock Condition:** Clear 10 tiles  
**Crops:** Peach Trees  
**Features:**
- Soft golden-orange tone differentiates it visually from Apple Grove
- Peach trees have a longer grow time but higher yield
- Introduces the concept of multi-fruit cider blending

**Recipes Unlocked:**
- Peach Summer Ale (once Brewery is built)
- Peach-flavored cider variants at the Flavor Table

**Visual Identity:** Soft peach blossoms in spring, golden fruit in summer. Warm amber hues with a hazy, sun-drenched atmosphere.

---

## 3.3 Cherry Grove

**Unlock Condition:** Clear 20 tiles  
**Crops:** Cherry Trees  
**Features:**
- Cherry trees bloom dramatically in spring with pink flowers
- Cherries are used in both cider and whiskey barrel variants
- Cherrywood barrels unlock at the Barrel Rack

**Recipes Unlocked:**
- Cherry Red Ale
- Hard Cherry Cola
- Cherry Barrel Whiskey
- Cherry Orchard Soda

**Visual Identity:** Deep pink blossoms, bright red fruit clusters, delicate petal-fall effect in spring. Rich jewel-tone greens.

---

## 3.4 Strawberry Patch

**Unlock Condition:** Peach Orchard unlocked  
**Crops:** Strawberries  
**Features:**
- Ground-level patch tiles; faster harvest cycle than trees
- Spring-boosted growth rate
- Key ingredient for spring seasonal recipes

**Recipes Unlocked:**
- Strawberry Spark Soda
- Golden Vow Strawberry (cider)

**Visual Identity:** Low green rows with bright red berries. White blossom overlay in spring. Cheerful and bright.

---

## 3.5 Blueberry Bend

**Unlock Condition:** Strawberry Patch unlocked  
**Crops:** Blueberries  
**Features:**
- Blueberry bushes yield multiple harvests per season
- Summer peak yield bonus
- Key ingredient for blue-hued ciders and sodas

**Recipes Unlocked:**
- Blueberry Breeze Soda
- Cider Creek Blue
- Hard Blueberry Soda

**Visual Identity:** Dense, low bushes with dusty-blue berry clusters. Cool blue-green tones. Feels shaded and peaceful.

---

## 3.6 Watermelon Patch

**Unlock Condition:** Clear 30 tiles  
**Crops:** Watermelon  
**Features:**
- Summer-only harvest; watermelons do not grow in other seasons
- Large vine patches occupy more tile space
- High Cup value per harvest

**Recipes Unlocked:**
- Creekside Watermelon (cider)
- Watermelon Wheat (beer)

**Visual Identity:** Wide green vines sprawling across sandy soil. Giant striped melons with bright pink interior accents. Sunny and cheerful.

---

## 3.7 Pear Meadow

**Unlock Condition:** Clear 40 tiles  
**Crops:** Pear Trees  
**Features:**
- Pear trees have elegant, slender trunks
- Honey pairing unlocks floral beverage variants
- Key ingredient for spring and all-season recipes

**Recipes Unlocked:**
- Honey Pear Fizz
- Golden Vow (Original)

**Visual Identity:** Pale green-yellow tones, soft meadow grass, white pear blossoms in spring. Tranquil and open.

---

## 3.8 Botanical Grove

**Unlock Condition:** Cabin Level 3  
**Crops:**
- Sassafras
- Birch Bark
- Vanilla Bean
- Wild Cherry Bark

**Features:**
- Introduces the Botanical ingredient category
- Botanicals grow differently from fruit — some are harvested from bark, roots, or sap
- Unlocks the entire Craft Soda category
- Happy Bear has special dialogue here about forest memories

**Recipes Unlocked:**
- Happy Bear Root Beer
- Forest Vanilla Cream Soda
- All craft soda base syrups

**Visual Identity:** Dense, mossy forest floor. Tall birch trees with white bark. Dappled light and soft green undergrowth. Magical and quiet.

---

## 3.9 Ginger Patch

**Unlock Condition:** Botanical Grove unlocked  
**Crops:** Ginger Root  
**Features:**
- Underground root harvest mechanic — tiles show a dig animation
- Ginger has a spicy, warming property affecting certain recipe outcomes
- Year-round crop with fall bonus yield

**Recipes Unlocked:**
- Ginger Grove Soda
- Hard Ginger Spice

**Visual Identity:** Rich dark soil, tropical green ginger leaves, earthy brown tones. Feels warm and aromatic.

---

## 3.10 Maple Stand

**Unlock Condition:** Clear 50 tiles  
**Crops:** Maple Sap (tapped from Maple Trees)  
**Features:**
- Maple Trees are tapped rather than planted — tap spiles are placed on existing trees
- Sap flows primarily in fall and winter
- Maple provides a caramel-like sweetness to beverages

**Recipes Unlocked:**
- Maple Brown Soda
- Hard Maple Root Beer
- The Long Pour (cider, combined with oak aging)

**Visual Identity:** Towering maple trees in brilliant fall orange and red. Buckets hanging from trunks. Glowing amber lighting. Peak fall atmosphere.

---

## 3.11 Hops Hill

**Unlock Condition:** Cabin Level 5  
**Crops:** Hops (vine-trained on tall poles)  
**Features:**
- Hops grow on vertical trellis poles; visually distinct from all other crops
- Unlocks the entire Beer category
- Hops yield is tied to summer and early fall

**Recipes Unlocked:**
- Orchard Ale
- Peach Summer Ale
- Cherry Red Ale
- Watermelon Wheat
- Experimental Cider-Beer Hybrid

**Visual Identity:** Rolling green hills, tall hop poles with cascading vines, warm golden afternoon light. Rustic and pastoral.

---

## 3.12 Tropical Greenhouse

**Unlock Condition:** Cabin Level 6  
**Crops:**
- Coffee Cherries
- Citrus Fruit
- Exotic Botanicals

**Features:**
- Enclosed greenhouse structure with glass panels and warm interior lighting
- Coffee cherries must be roasted before use
- Citrus unlocks hard soda variants
- Final major zone unlock

**Recipes Unlocked:**
- Orchard Roast (coffee)
- Morning Blend
- Dawn Brew
- Hard Orange Orchard Soda
- Coffee-Fruit Fusion

**Visual Identity:** Lush tropical interior, glass ceiling with steam condensation, deep green foliage, bright citrus colors, warm humid glow.

---

# 4. Biome Transitions

## 4.1 Biome Types

| Biome | Zones Covered | Visual Character |
|---|---|---|
| **Temperate Orchard** | Apple Grove, Peach Orchard, Pear Meadow | Soft greens and golds, dappled sunlight |
| **Berry Fields** | Strawberry Patch, Blueberry Bend | Bright reds and blues, low lush ground cover |
| **Summer Patch** | Watermelon Patch | Sandy soil, vivid greens and pinks |
| **Botanical Forest** | Botanical Grove, Ginger Patch | Mossy, shadowed, earthy deep greens |
| **Maple Woods** | Maple Stand | Fiery oranges and reds, autumn atmosphere |
| **Hops Highlands** | Hops Hill | Rolling hills, tall poles, warm golden light |
| **Tropical Biome** | Tropical Greenhouse | Humid, lush, glass-enclosed, vibrant |

## 4.2 Visual Blending Rules

- Adjacent zones blend at their shared edges using gradient tile overlays
- Zone boundary tiles show mixed visual elements from both biomes
- No hard cuts between zones — transitions are always gradual across 2–3 tiles

## 4.3 Seasonal Overlays

All zones receive seasonal overlays applied on top of their base visual identity:

- **Spring:** Cherry blossom petals drifting across the screen, soft pink bloom haze, bright fresh greens
- **Summer:** High-contrast sunlight, firefly particles at tile edges in the evening, increased saturation
- **Fall:** Falling orange and red leaves, warm amber light filter, subtle fog at zone edges
- **Winter:** Snow accumulates on tile tops, frost ring effects on tree tiles, cold blue ambient light

## 4.4 Special Effects

- **Fireflies:** Appear in summer evenings in Botanical Grove and Berry Fields
- **Drifting Petals:** Appear in spring in Cherry Grove and Pear Meadow
- **Frost Crystals:** Appear in winter on Maple Stand and Apple Grove tiles
- **Steam:** Visible from the Tropical Greenhouse in fall and winter

---

# 5. Expansion Logic

## 5.1 Tile Unlock Costs

Base costs for unlocking a new tile:
- **Ring 0–1:** 10–30 Cups, 2–4 Wood, 1–2 Stone
- **Ring 2:** 30–80 Cups, 4–8 Wood, 2–4 Stone
- **Ring 3:** 80–200 Cups, 8–15 Wood, 4–8 Stone
- **Ring 4:** 200–500 Cups, 15–30 Wood, 8–15 Stone

## 5.2 Scaling Rules

- Cost multiplier increases by 1.2× for each ring farther from the Cabin
- Zone unlock events (first tile of a new zone) have a flat unlock cost on top of per-tile costs
- Biome-transition tiles cost 1.5× standard due to obstacle clearing requirements

## 5.3 Fog-of-War Reveal Rules

- A tile is revealed (fog removed) when any adjacent tile is unlocked
- Zone name and zone description appear on first reveal of any tile in a new zone
- Happy Bear reacts with dialogue when a new zone is discovered

## 5.4 Resource Rewards from Clearing

Clearing obstacle tiles may yield:
- **Common:** 1–3 Wood, 1–2 Stone
- **Uncommon:** Rare botanical (Vanilla, Birch, etc.)
- **Rare:** Seasonal ingredient bonus
- **Special:** Story page fragment or Happy Bear memory item

---

# 6. Seasonal Effects on Zones

## Spring
- Berry zones (Strawberry, Blueberry) grow 2× faster
- Cherry Grove and Pear Meadow receive blossom overlays
- Floral spring recipes unlock
- Honey Pear Fizz and Golden Vow become available

## Summer
- Watermelon Patch activates; watermelons will not grow outside this season
- Blueberry Bend reaches peak yield
- Hops Hill enters primary growing season
- Bright high-contrast lighting applied globally
- Firefly particles appear in Botanical Grove

## Fall
- Maple Stand enters sap-flow season; maple yield doubled
- Apple Grove receives harvest-glow lighting
- Falling leaf particles appear across Temperate Orchard biome
- Sticky Paws Apple Caramel and Autumn Hug unlock
- Applejack production begins; freeze-distillation available

## Winter
- Snow overlay applies to all zones
- Applejack bonus yield active — extra output from freeze-distillation
- Snowfall and Spice recipe unlocks
- Crop growth slows globally by 50%
- Maple Stand and Apple Grove retain partial yield through winter

---

# 7. World Map Layout (Abstract)

```
[ Tropical Greenhouse ]   [ Hops Hill ]
          |                     |
  [ Botanical Grove ] ←——— [ CABIN ] ———→ [ Maple Stand ]
          |                     |
  [ Ginger Patch ]       [ Pear Meadow ]
                               |
                      [ Watermelon Patch ]
                               |
              [ Blueberry Bend ] — [ Strawberry Patch ]
                               |
                       [ Cherry Grove ]
                               |
                      [ Peach Orchard ]
                               |
                       [ Apple Grove ]
```

Zones expand outward from the Cabin. Players unlock adjacent tiles first, then purchase zone access to reveal new biomes. No zone is fully isolated — all connect through shared tile borders.

---

# 8. Final Notes

This file is the authoritative source for:
- World layout and zone positions
- Zone unlock conditions and progression order
- Tile types, states, and behavior rules
- Biome visual identities and transition rules
- Seasonal effects on crops and zones
- Expansion cost scaling and fog-of-war logic

All future code, UI systems, data models, and zone-related gameplay logic must follow this document exactly.
