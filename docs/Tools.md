# Happy Bear Cozy Orchard — Tools & Workstations (v1.0)

Tools are the backbone of beverage production.  
Each tool has:
- A purpose  
- Construction cost  
- Upgrade levels  
- Dependencies  
- Supported workflows  

This file defines every tool in the game.

---

# 1. Press

## Purpose
Extracts juice from fruit.

## Construction Cost
- 10 Wood  
- 5 Stone  
- 50 Cups  

## Upgrade Levels
**Level 1:** Basic pressing  
**Level 2:** Faster pressing  
**Level 3:** Multi-fruit pressing  

## Used For
- Cider  
- Applejack  
- Some beer hybrids  

## Dependencies
- None (starter tool)

---

# 2. Fermenter

## Purpose
Ferments juice into cider or other bases.

## Construction Cost
- 8 Wood  
- 4 Stone  
- 40 Cups  

## Upgrade Levels
**Level 1:** Basic fermentation  
**Level 2:** Faster fermentation  
**Level 3:** Dual-batch fermentation  

## Used For
- Cider  
- Applejack base  
- Beer fermentation  

## Dependencies
- Press

---

# 3. Bottling Station

## Purpose
Bottles finished beverages.

## Construction Cost
- 6 Wood  
- 2 Stone  
- 30 Cups  

## Upgrade Levels
**Level 1:** Basic bottling  
**Level 2:** Faster bottling  
**Level 3:** Multi-bottle batching  

## Used For
- All beverage categories  

## Dependencies
- Fermenter

---

# 4. Flavor Table

## Purpose
Adds botanicals, spices, and flavorings.

## Construction Cost
- 12 Wood  
- 4 Stone  
- 100 Cups  

## Upgrade Levels
**Level 1:** Basic flavoring  
**Level 2:** Multi-ingredient blends  
**Level 3:** Precision flavoring  

## Used For
- Cider  
- Craft Soda  
- Coffee blends  
- Whiskey infusions  

## Dependencies
- Cabin Level 2

---

# 5. Storage Shelves

## Purpose
Stores ingredients and crafted items.

## Construction Cost
- 10 Wood  
- 2 Stone  
- 50 Cups  

## Upgrade Levels
**Level 1:** Basic storage  
**Level 2:** Expanded storage  
**Level 3:** Specialty storage (botanicals, barrels, etc.)  

## Used For
- All categories  

## Dependencies
- Cabin Level 2

---

# 6. Soda Station

## Purpose
Crafts syrups and carbonated sodas.

## Construction Cost
- 20 Wood  
- 10 Stone  
- 200 Cups  

## Upgrade Levels
**Level 1:** Syrup crafting  
**Level 2:** Carbonation boost  
**Level 3:** Multi-soda batching  

## Used For
- Craft Soda  
- Hard Soda (with Still)  

## Dependencies
- Cabin Level 3  
- Botanical Grove unlocked

---

# 7. Copper Still

## Purpose
Distills alcohol for hard sodas, whiskey, and applejack.

## Construction Cost
- 30 Wood  
- 20 Stone  
- 300 Cups  

## Upgrade Levels
**Level 1:** Basic distillation  
**Level 2:** Precision distillation  
**Level 3:** Flavor infusion  

## Used For
- Hard Soda  
- Applejack  
- Whiskey  

## Dependencies
- Cabin Level 4  
- Mash Tun

---

# 8. Mash Tun

## Purpose
Creates mash for whiskey and beer.

## Construction Cost
- 25 Wood  
- 15 Stone  
- 250 Cups  

## Upgrade Levels
**Level 1:** Basic mash  
**Level 2:** Faster mash  
**Level 3:** Multi-grain mash  

## Used For
- Whiskey  
- Beer  

## Dependencies
- Cabin Level 4

---

# 9. Cooling Coil

## Purpose
Cools vapor during distillation.

## Construction Cost
- 10 Wood  
- 10 Stone  
- 150 Cups  

## Upgrade Levels
**Level 1:** Basic cooling  
**Level 2:** Faster cooling  
**Level 3:** Precision cooling  

## Used For
- Distillation workflows  

## Dependencies
- Copper Still

---

# 10. Barrel Rack

## Purpose
Ages cider, whiskey, and applejack.

## Construction Cost
- 15 Wood  
- 10 Stone  
- 150 Cups  

## Upgrade Levels
**Level 1:** Basic aging  
**Level 2:** Multi-barrel aging  
**Level 3:** Specialty wood barrels  

## Used For
- Aged cider  
- Whiskey  
- Applejack  

## Dependencies
- Cabin Level 2 (Level 1)  
- Cabin Level 4 (Level 2+)  

---

# 11. Roaster

## Purpose
Roasts coffee beans.

## Construction Cost
- 20 Wood  
- 10 Stone  
- 200 Cups  

## Upgrade Levels
**Level 1:** Basic roasting  
**Level 2:** Precision roasting  
**Level 3:** Multi-batch roasting  

## Used For
- Coffee  
- Coffee-fruit blends  

## Dependencies
- Cabin Level 6  
- Tropical Greenhouse unlocked

---

# 12. Tool Dependency Graph

```
Press → Fermenter → Bottling Station
              ↓
          Flavor Table
              ↓
          Soda Station → Hard Soda (with Still)
              ↓
          Mash Tun → Still → Barrel Rack
              ↓
          Roaster
```

---

# End of Tools & Workstations
This file is the authoritative source for all tool logic, construction, upgrades, and production workflows.
