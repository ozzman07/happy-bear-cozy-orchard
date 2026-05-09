# Happy Bear Cozy Orchard — Game Design Overview (Expanded v1.4)

## 1. Game Concept
Happy Bear Cozy Orchard is a warm, storybook-style simulation game where players grow an expanding orchard, harvest fruit and botanicals, and craft small-batch beverages inside a buildable production cabin. The game blends cozy farming, light city-building, and handcrafted beverage systems.

Players begin with a small plot of land and a single apple tree. Over time, they clear land, plant new crops, unlock botanical zones, build cider-making tools, craft sodas, distill spirits, and explore advanced beverage categories. The heart of the game is the Cider Cabin — later expanded into a multi‑wing workshop — where harvested ingredients become cider, soda, hard soda, applejack, whiskey, beer, and coffee.

Happy Bear acts as a friendly guide, helper, and emotional anchor throughout the experience.

## 2. Core Gameplay Loop
- Grow fruit and botanicals in the orchard
- Harvest apples, berries, cherries, pears, watermelons, and specialty botanicals
- Process ingredients inside the Cabin
- Craft beverages using tools the player builds
- Earn Cups (soft currency) from completed batches
- Expand the orchard, unlock new zones, and upgrade the cabin
- Discover new recipes, seasonal flavors, and story moments

## 3. Orchard System
### 3.1 Tile-Based Land
The orchard is a grid of tiles with states:
- Locked
- Clearable (grass, rocks, stumps)
- Cleared
- Planted (tree, patch, vine, botanical)
- Harvestable
- Mine Shaft (active stone extraction site)
- Decorative

### 3.2 Player Tools
Players interact with tiles using:
- Clear (removes overgrowth → +1 wood; or uproots a crop / decommissions a mine at no yield)
- Dig
- Plant
- Water
- Harvest (auto-replants — tile stays in the growth cycle)
- Mine (establishes a Mine Shaft on first use; subsequent mines extract +2 stone in place)

### 3.3 Crop Types
- Apple Trees
- Peach Trees
- Cherry Trees
- Pear Trees
- Watermelon Patches
- Strawberry Patches
- Blueberry Bushes
- Botanicals:
  - Sassafras
  - Birch Bark
  - Vanilla Bean
  - Ginger Root
  - Maple Sap
  - Honey Pear
  - Wild Cherry Bark

### 3.4 Flavor & Botanical Zones
- Peach Orchard
- Cherry Grove
- Watermelon Patch
- Pear Meadow
- Strawberry Patch
- Blueberry Bend
- Botanical Grove
- Ginger Patch
- Maple Stand

### 3.5 Land Expansion System
Players unlock new land tiles using Cups, wood, and stone. Includes:
- Fog-of-war style locked tiles
- Clearable obstacles
- Resource rewards
- Biome transitions

## 4. Cabin & Beverage Production System
The Cider Cabin is the player's production hub. As the game progresses, it expands into a multi‑wing workshop supporting cider, soda, spirits, beer, and coffee.

### 4.1 Buildable Tools
- Press
- Fermenter
- Barrel Rack
- Flavor Table
- Bottling Station
- Storage Shelves
- Soda Station
- Copper Still
- Mash Tun
- Cooling Coil
- Roaster

### 4.2 Beverage Workflows
#### Cider
1. Press fruit (2 fruit → 1 juice, 12s) — repeat 3× to fill the Fermenter
2. Ferment (3 juice → 1 cider, 90s) — repeat 3× to fill the Bottling Station
3. Bottle (3 cider → 6 bottles, 20s)
4. Market unlocks at 3 bottles held
5. Flavor (optional, future)
6. Age (optional, future)

#### Craft Soda
1. Gather botanicals
2. Create syrup at Soda Station
3. Carbonate
4. Bottle

#### Hard Soda
1. Create soda base
2. Distill or ferment alcohol base
3. Blend
4. Bottle

#### Applejack
1. Freeze-distill cider
2. Age
3. Bottle

#### Whiskey
1. Mash
2. Distill
3. Barrel age
4. Bottle

#### Beer
1. Mash
2. Boil with hops
3. Ferment
4. Bottle

#### Coffee
1. Harvest cherries
2. Roast
3. Brew or blend
4. Bottle or serve

## 5. Resource Economy
### 5.1 Resources
- Cups
- Wood
- Stone
- Fruit
- Botanicals
- Bear Energy

### 5.2 Usage
Resources are used to:
- Build tools
- Expand the orchard
- Unlock new zones
- Upgrade the cabin
- Craft beverages

## 6. Happy Bear Character System
### 6.1 Behaviors
- Helps build tools
- Reacts to new flavors
- Gives small tasks
- Checks on fermenters
- Sweeps the cabin
- Seasonal outfits

### 6.2 Story Moments
Short narrative scenes unlock as the player progresses, featuring:
- Happy Bear
- Story Bear
- Seasonal events
- Orchard lore

## 7. Progression & Expansion
### 7.1 Orchard Expansion
Unlock new land tiles using Cups, wood, and stone.

### 7.2 Cabin Upgrades
Add:
- More tool slots
- Decorative items
- Larger production capacity

### 7.3 New Flavors
Each new crop or botanical unlocks:
- New recipes
- New story pages
- New Happy Bear reactions

## 8. Beverage Categories & Advanced Progression
### 8.1 Cider (Core Category)
- The Happy Pour
- Autumn Hug
- Cider Creek Blue
- Creekside Watermelon
- Golden Vow Strawberry
- Washington's Orchard
- Sticky Paws Apple Caramel
- Mama Bear's Famous Pecan Pie
- Snowfall and Spice
- The Long Pour
- Golden Vow (Original)

### 8.2 Applejack Mastery
Freeze-distillation, winter boosts, aging barrels.

### 8.3 Distillery Construction
Copper still, mash tun, cooling coil. Unlocks:
- Apple Whiskey
- Hard Sodas

### 8.4 Apple Whiskey Crafting
Barrel selection, long-term aging, fruitwood variants.

### 8.5 Hops & Brewery System
Unlock Hops Hill. Introduces:
- Orchard Ale
- Fruit beers
- Experimental hybrids

### 8.6 Coffee & Roastery
Unlock Tropical Greenhouse. Roast levels, blends, coffee-fruit drinks.

### 8.7 Craft Soda (New Category)
Non-alcoholic sodas crafted at the Soda Station:
- Happy Bear Root Beer
- Forest Vanilla Cream Soda
- Blueberry Breeze Soda
- Strawberry Spark Soda
- Ginger Grove Soda
- Honey Pear Fizz
- Cherry Orchard Soda
- Maple Brown Soda

### 8.8 Hard Soda (New Category)
Alcoholic sodas crafted via Distillery/Brewery:
- Campfire Reserve Root Beer
- Hard Vanilla Cream
- Hard Cherry Cola
- Hard Ginger Spice
- Hard Maple Root Beer
- Hard Blueberry Soda
- Hard Orange Orchard Soda

## 9. Seasonal System
The game cycles through:
- Spring
- Summer
- Fall
- Winter

Seasonal recipes appear only during their season:
- Snowfall and Spice → Winter
- Sticky Paws Apple Caramel → Fall
- The Long Pour → Fall/Winter
- Golden Vow → Spring
- Creekside Watermelon → Summer

## 10. Visual & Tone Direction
- Soft, cozy, storybook aesthetic
- Warm color palette
- Gentle animations
- Seasonal variations
- Emphasis on handcrafted charm

## 11. Future Expansion Ideas
- Weather system
- Day/night cycle
- NPC visitors
- Bear Builder
- Seasonal festivals
- Sticker exports

## 12. Summary
Happy Bear Cozy Orchard is a cozy, expandable simulation game centered on orchard growth, handcrafted beverages, and warm character interactions. Its modular systems support cider, soda, spirits, beer, and coffee — all tied together through progression, seasonal content, and the charm of Happy Bear's world.
