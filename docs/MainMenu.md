# Happy Bear Cozy Orchard — Main Menu, Profiles, Saves, and Settings (v1.0)

This file is the authoritative source for the game's entry flow, user profile system, save system, settings system, and all main menu behavior. All code implementing these features must conform to this document exactly.

---

# 1. Purpose of the Main Menu System

The main menu is the first thing a player sees when they open Happy Bear Cozy Orchard. It exists entirely outside of the orchard game world — no tiles, no tools, no inventory — and serves as the calm, welcoming threshold between the player's world and the orchard.

Its purpose is to:

- Orient the player immediately with warmth and visual identity
- Allow players to manage multiple save slots across different runs
- Allow per-profile settings customization before any gameplay begins
- Ensure that save data and settings are fully loaded before the orchard scene initializes

No game system (ResourceManager, CraftingSystem, ProgressionSystem, etc.) is instantiated until a player has selected a profile and loaded or started a save. The main menu loads first, completes its flow fully, and only then hands off to the game.

---

# 2. Main Menu Overview

## Visual Style

The main menu presents the exterior of Happy Bear's cabin set against the orchard. The scene is illustrated in the same warm, storybook aesthetic as the game itself. The background is static but season-aware: spring shows blossoms on the trees, summer shows full green canopy and fireflies, fall shows amber leaves and a harvest glow, and winter shows bare branches with soft snow settling on the cabin roof.

Soft ambient music plays automatically. The volume respects the player's audio settings if a profile is already selected. A gentle title card reading "Happy Bear Cozy Orchard" sits in the upper third of the screen in the game's display font.

## Layout and UI Philosophy

The menu is vertically centered, left-aligned, presented as a clean card over the scenic background. Buttons are wide, readable, and softly animated on hover. No button is ever greyed out without a tooltip explaining why. The layout does not shift or scroll — everything visible is everything available.

## Menu Options

| Option | Availability | Description |
|---|---|---|
| **Continue Game** | Only if a current profile has a save | Immediately loads the most recently played save slot |
| **Start New Game** | Always | Begins new game creation flow — profile selection or creation, then save slot assignment |
| **Load Game** | Only if a current profile has at least one save | Opens the save slot selection screen |
| **User Profile** | Always | Opens profile management — create, select, or delete a profile |
| **Settings** | Always (uses defaults if no profile selected) | Opens the settings screen |
| **Credits** | Always | Opens the credits screen |
| **Exit** | Desktop builds only | Closes the application |

---

# 3. User Profile System

## Overview

Profiles are local. There is no account system, no cloud sync, and no login. Each profile lives in the player's local storage under a unique profile ID. Players can create up to four profiles, each with independent save slots, settings, and achievement records.

## Profile Creation Flow

1. Player selects "Start New Game" or "User Profile" from the main menu.
2. If no profiles exist, the game immediately opens the profile creation screen.
3. Player enters a name (up to 20 characters). The name is required; the game provides "Happy Bear" as a suggested placeholder but does not auto-fill it.
4. A profile is created with a unique ID, the entered name, the current timestamp, and default settings.
5. The new profile becomes the active profile.
6. The player is returned to the main menu.

## Profile Selection Flow

1. Player selects "User Profile" from the main menu.
2. All existing profiles are listed as cards showing: player name, last played date, and current cabin level (from the most recent save).
3. Player selects a profile to make it active.
4. The menu reflects the active profile — "Continue" becomes available if that profile has saves.
5. Players may also choose to delete a profile from this screen. Deletion requires a confirmation prompt and permanently removes all associated saves.

## Profile Data Fields

```json
{
  "id": "string — unique identifier (UUID)",
  "playerName": "string — display name chosen by player",
  "createdAt": "string — ISO timestamp of profile creation",
  "lastPlayed": "string — ISO timestamp of most recent session",
  "saveSlots": {
    "slot1": "string | null — save ID or null if empty",
    "slot2": "string | null — save ID or null if empty",
    "slot3": "string | null — save ID or null if empty"
  },
  "settings": "object — per-profile settings object (see Section 7)",
  "achievements": {
    "[achievementId]": {
      "unlocked": "boolean",
      "unlockedAt": "string | null — ISO timestamp"
    }
  },
  "progressionFlags": {
    "[flagId]": "boolean — persistent one-time flags (e.g., firstBarrelPlaced: true)"
  }
}
```

## Integration with Saves and Settings

When a profile is selected, its `settings` object is applied immediately — audio levels, accessibility flags, and gameplay options all take effect before the game loads. When a save is loaded, the profile's `saveSlots` map determines which save files to present.

---

# 4. Save System

## Save Slots

Each profile has three save slots (Slot 1, Slot 2, Slot 3). Slots are independent — each represents a separate playthrough. A slot can be empty, active, or completed. A completed slot is a playthrough that has reached the end of Story Act 6.

Slot selection is presented as a three-card layout showing: slot number, cabin level, current season, total days played, and the timestamp of the last save. Empty slots display a "Begin Here" prompt.

## Autosave Rules

- Autosave triggers at the end of each in-game day
- Autosave triggers when the player leaves a scene (e.g., exits the Distillery back to the Orchard)
- Autosave triggers when a story event completes
- Autosave writes to the active save slot without user prompt
- A small autosave indicator (a brief animated leaf icon) appears in the corner during autosave
- If autosave is disabled in settings, none of the above triggers fire

## Manual Save Rules

- Players can manually save at any time from the in-game pause menu
- Manual save always writes to the currently active save slot
- Manual save presents a confirmation toast: "Orchard saved."
- Manual saves do not prompt the player to select a slot — the active slot is always used

## Save Data Fields

```json
{
  "id": "string — unique save identifier (UUID)",
  "profileId": "string — ID of the profile this save belongs to",
  "slot": "number — 1, 2, or 3",
  "orchardState": {
    "tiles": "array — serialized tile grid state (see Tile schema in DataModels.md)",
    "zonesCleared": ["string — IDs of zones with at least one cleared tile"],
    "tilesCleared": "number — total cleared tile count"
  },
  "cabinLevel": "number — current cabin level (1–6)",
  "toolsUnlocked": {
    "[toolId]": {
      "built": "boolean",
      "level": "number — current upgrade level (1–3)",
      "builtAt": "string | null — ISO timestamp"
    }
  },
  "zonesUnlocked": ["string — zone IDs fully unlocked (starter zone accessible)"],
  "inventory": {
    "[resourceId]": "number — current amount held"
  },
  "storyProgress": {
    "currentAct": "number — current story act (1–6)",
    "eventsTriggered": ["string — story event IDs that have fired"],
    "eventsCompleted": ["string — story event IDs the player has seen through to completion"]
  },
  "season": "string — current season ID (spring | summer | fall | winter)",
  "day": "number — total in-game days elapsed",
  "happyBearState": {
    "mood": "string — enum: content | excited | worried | proud",
    "currentTask": "string | null — active task ID"
  },
  "timestamp": "string — ISO timestamp of when this save was last written"
}
```

## Storage Location

Save files are stored in `localStorage` under namespaced keys: `hbco_save_[profileId]_slot[slotNumber]`. Profile data is stored under `hbco_profile_[profileId]`. The profiles index (listing all profile IDs) is stored under `hbco_profiles`. No files are written to disk in the browser build.

---

# 5. Load Game Flow

## Checking for Existing Saves

When the main menu loads, it reads from `localStorage` to determine the current active profile and its save slots. If no profile exists, the "Continue" and "Load Game" options are not shown. If a profile exists but has no saves, "Continue" is hidden and "Load Game" is shown but opens to three empty slots.

## The Continue Button

"Continue" loads the most recently played save slot for the active profile without navigating to the save selection screen. It is equivalent to pressing "Load Game" and then selecting the slot with the most recent timestamp. "Continue" is hidden if the active profile has no saves.

## The Load Game Screen

The Load Game screen shows three save slot cards side by side. Each card displays:

- Slot number
- Cabin level and current season (icon + name)
- Total days played
- Last saved timestamp (formatted as a friendly date, e.g., "Last tended: May 3rd, 2026")
- A thumbnail illustration appropriate to the current zone and season

Empty slots display a soft "Begin Here" prompt instead. Selecting a filled slot immediately begins loading that save. Selecting an empty slot redirects to the Start New Game flow with that slot pre-selected.

## Error Handling

- **Corrupted save:** If a save file fails to parse, the slot card displays "Something went wrong in the orchard." and offers two options: Clear This Slot (permanently deletes the save) or Go Back.
- **Missing save:** If a save ID is listed in the profile but the corresponding localStorage key is absent, the slot is treated as empty and the slot card shows the "Begin Here" prompt.
- **Version mismatch:** If the save was written by an older version of the game, a migration attempt is made. If migration fails, the player is shown a warning and offered the option to clear the slot.

---

# 6. Start New Game Flow

## Initialization Sequence

When a player starts a new game, the following is initialized in order:

1. A new save object is created with a unique ID and assigned to the selected slot
2. Orchard state initializes to a 5x5 grid with all tiles set to their default states
3. The Apple Grove zone is unlocked and its starter tiles are set to `clearable`
4. Starter inventory is granted: 10 Wood, 5 Stone, 0 Cups, 0 Fruit
5. No tools are built; the Press, Fermenter, and Bottling Station are available as buildable blueprints in the Cabin scene
6. Season is set to Spring; Day is set to 1
7. Story Act 1 begins immediately: the opening narration from Story Bear triggers before the orchard is interactive
8. Happy Bear's mood is set to `excited`
9. The save is written to the active slot before the orchard scene loads

## Confirmation Prompt

If the player selects a slot that already contains a save, a confirmation dialog appears:

> "This will clear your orchard and start fresh. Are you sure?"
>
> **Start Fresh** | **Keep My Orchard**

Selecting "Keep My Orchard" returns the player to the slot selection screen. Selecting "Start Fresh" permanently deletes the existing save and proceeds with the initialization sequence above.

---

# 7. Settings Menu

## Gameplay Settings

| Setting | Options | Default | Description |
|---|---|---|---|
| Text Speed | Slow / Normal / Fast / Instant | Normal | Controls how quickly dialogue text appears character by character |
| Animation Speed | Slow / Normal / Fast | Normal | Controls UI animation speed (not tile growth, which is time-based) |
| Autosave | On / Off | On | Toggles automatic saving at end-of-day and scene transitions |
| Day Length | Short / Normal / Long | Normal | Controls how many real-time seconds constitute one in-game day tick |
| Tutorial Tips | On / Off | On | Shows contextual tips for new players on first interactions |

## Audio Settings

| Setting | Range | Default | Description |
|---|---|---|---|
| Music Volume | 0–100 | 70 | Background music volume |
| SFX Volume | 0–100 | 80 | Button clicks, tool sounds, harvest pops |
| Ambient Volume | 0–100 | 60 | Birdsong, wind, rain, seasonal ambient loops |

## Video Settings

| Setting | Options | Default | Description |
|---|---|---|---|
| Pixel Scaling | 1x / 2x / 3x | 2x | Scales pixel art assets up for higher-resolution displays |
| Fullscreen | On / Off | Off | Toggles browser fullscreen mode |
| UI Scale | Small / Medium / Large | Medium | Scales all UI panels and text globally |

## Accessibility Settings

| Setting | Options | Default | Description |
|---|---|---|---|
| High Contrast | On / Off | Off | Increases contrast on all UI elements and tile outlines |
| Reduced Motion | On / Off | Off | Disables non-essential animations (particles, shimmer effects) |
| Larger Text | On / Off | Off | Increases base font size across all UI panels |
| Screen Reader Hints | On / Off | Off | Adds aria-label attributes and announces major game events |

## Storage and Application

Settings are stored inside the active profile's `settings` object and written to `localStorage` whenever a setting changes. Settings apply immediately — audio changes take effect the moment the slider is released, visual changes apply on the next render frame. No restart is required. If no profile is active, the settings screen uses temporary defaults that are not persisted.

---

# 8. Credits Screen

## Tone and Layout

The credits screen is quiet and warm. It appears against a soft, blurred version of the seasonal main menu background. Text fades in gently, section by section. There is no scroll — each section appears as a centered card that transitions to the next automatically, or the player can advance manually with a click or keypress.

Background music continues softly. No sound effects play during credits.

## Contents

| Section | Content |
|---|---|
| **A Game By** | Jim |
| **Original Characters** | Happy Bear & Story Bear, created by Jim |
| **Development** | Built with AI-assisted development in Replit |
| **Music & Audio** | To be credited as audio assets are finalized |
| **Additional Thanks** | To be updated as contributors join the project |
| **A Final Word** | A short warm message from Happy Bear, consistent with the game's tone |

A "Return to Menu" button appears below the final card.

---

# 9. Integration with Game Flow

## Load Order

The main menu is the first system initialized when the game starts. The full load order is:

1. `MainMenuSystem` initializes and reads from `localStorage`
2. Profile data is loaded into `ProfileSystem`
3. The main menu screen renders with the correct options for the active profile
4. Player completes menu flow (profile selection → save selection or new game)
5. Selected profile's `settings` are applied
6. Selected save's data is loaded into `SaveSystem`
7. Game systems are instantiated and injected with save data: ResourceManager, TileGrid, CraftingSystem, ConstructionSystem, ProgressionSystem
8. SceneManager initializes and opens the orchard scene
9. Main menu DOM is removed from view; game UI becomes active

## Profile and Settings Application

When a profile is selected, its `settings` object is read and applied before any game system initializes. This ensures that audio levels, text speed, and accessibility settings are correct from the first moment of gameplay.

## Orchard Scene Load Gate

The orchard scene never initializes until the full menu flow has completed and a save has been selected or created. There is no way to skip this flow in the shipping build. A developer mode flag (`?devSkip=true`) bypasses the menu in local development only.

---

# 10. File & System Architecture

```
src/
├── systems/
│   ├── MainMenuSystem.js     # Coordinates overall menu flow and state
│   ├── ProfileSystem.js      # Profile CRUD, active profile management
│   └── SaveSystem.js         # Save slot CRUD, autosave triggers, load/write logic
└── ui/
    └── screens/
        ├── MainMenuScreen.js  # Renders the main menu layout and handles nav
        ├── ProfileScreen.js   # Renders profile creation and selection UI
        ├── SaveScreen.js      # Renders save slot cards and load/new game flow
        ├── SettingsScreen.js  # Renders settings categories and applies changes
        └── CreditsScreen.js   # Renders the credits sequence
```

## System Responsibilities

| System | Responsibility |
|---|---|
| `MainMenuSystem` | Owns the top-level menu state machine; coordinates profile, save, and settings flow |
| `ProfileSystem` | Reads, writes, creates, and deletes profile objects from localStorage |
| `SaveSystem` | Reads, writes, creates, and deletes save slot data from localStorage; fires autosave triggers |
| `MainMenuScreen` | Renders the scenic menu and button layout; fires callbacks to MainMenuSystem |
| `ProfileScreen` | Renders profile creation and selection UI; calls ProfileSystem methods |
| `SaveScreen` | Renders save slot cards; calls SaveSystem to load or initialize saves |
| `SettingsScreen` | Renders setting controls; reads from and writes to active profile settings |
| `CreditsScreen` | Renders the credits sequence; no system dependencies |

## Modularity Rules

- No menu system imports from game systems (ResourceManager, CraftingSystem, etc.)
- No game system imports from menu systems
- MainMenuSystem hands off to the game by calling a single registered `onGameStart(saveData)` callback, which is wired in `main.js`
- All localStorage reads and writes are isolated to `ProfileSystem` and `SaveSystem` — no other module touches localStorage directly

---

# 11. UX & Cozy Design Notes

## Warmth and Calm

The main menu should feel like arriving at a familiar place. Nothing is urgent. Buttons have gentle hover animations — a soft brightness increase and a slight scale. Transitions between menu screens use a brief fade rather than a slide or pop. Text is set in a warm serif or rounded display font consistent with the in-game UI.

## Seasonal Variants

| Season | Background Details |
|---|---|
| Spring | Cherry blossoms drift across the cabin exterior; soft pink and green palette |
| Summer | Golden afternoon light; fireflies appear near the orchard's edge at dusk |
| Fall | Amber and copper leaves settle in the foreground; warm lantern glow from the cabin window |
| Winter | Soft snow accumulates on the cabin roof and fence posts; bare apple trees; interior candlelight visible through the window |

The season displayed on the main menu matches the season of the active profile's most recent save. If no save exists, the menu defaults to the current real-world season or Fall if the real-world season is unavailable.

## Happy Bear Animations

Happy Bear appears in the lower corner of the main menu in a small illustrated vignette. His animation state is idle by default and cycles through one of three loops based on the active session:

- **First launch ever:** Happy Bear waves with both arms, looking excited
- **Returning session:** Happy Bear sits reading a small book, occasionally looking up
- **Long absence (7+ days since last play):** Happy Bear is tending a small pot plant, perks up when the player returns

These animations are optional — if the `Reduced Motion` accessibility setting is enabled, Happy Bear sits still in a single illustrated pose.

---

# 12. Final Notes

This file is the authoritative source for the following systems in Happy Bear Cozy Orchard:

- **Main Menu** — layout, options, visual style, seasonal variants
- **User Profiles** — creation, selection, deletion, data schema
- **Save System** — save slots, autosave rules, manual saves, data schema, storage method
- **Settings System** — all setting categories, storage, and application behavior
- **Game Entry Flow** — the full load order from app launch to orchard scene

All code implementing these features must conform to this document. If a system and this document disagree, update the system. When new settings, profile fields, or save data fields are added, this document must be updated first.
