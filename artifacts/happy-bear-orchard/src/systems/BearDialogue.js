/**
 * BearDialogue — all of Happy Bear's lines, contextual tips and tier announcements.
 * Pure data/logic. Callers pass the string to bearSpeak / setStatus.
 */

// ── Tier announcements ────────────────────────────────────────────────────────

const TIER_LINES = {
  1: {
    bear:   "The Cider Cabin is open! 🏠 Go build the Cider Press and squeeze some juice! 🧃",
    status: "Tier 1 unlocked — head to the Cabin and build your press! 🍎→🧃→🫗→🍾",
  },
  2: {
    bear:   "The Distillery is yours! 🫧 Build the Copper Still and turn cider into Applejack! 🥃",
    status: "Tier 2 unlocked — open the Distillery and start distilling! 🫗→🥃",
  },
  3: {
    bear:   "Time to age some Applejack! 🛢️ Build the Barrel and make silky Apple Whiskey! 🪣",
    status: "Tier 3 unlocked — build the Aging Barrel in the Distillery! 🥃→🪣",
  },
  4: {
    bear:   "The Brewery is open! 🍺 Plant hops in the orchard, then brew some fruit ales!",
    status: "Tier 4 unlocked — grow hops and brew in the Brewery! 🌾→🍺",
  },
  5: {
    bear:   "The Roastery is ready! ☕ Roast coffee beans and brew hot cups — cozy life achieved!",
    status: "Tier 5 unlocked — roast beans and brew ☕ cups in the Roastery!",
  },
};

// ── Scene-enter lines ─────────────────────────────────────────────────────────

const SCENE_GREETINGS = {
  store: [
    "Sell your finest goods here! 🪙 Higher-tier items fetch the best price!",
    "The market's open! 🛒 Bottles and Whiskey sell for a premium!",
    "Got a big harvest? Sell it here for coins! 🪙",
    "Premium goods fetch premium prices — those cups are worth 28 🪙 each! ☕",
  ],
  orchard: [
    "The orchard is looking great! 🌿 Tap a tile to get started.",
    "Harvest the glowing apples 🍎, then plant more seedlings!",
    "Water your seedlings 💧 to help them grow faster!",
    "Clear overgrown tiles 🌿 to expand the orchard!",
    "Back in the fresh air! 🌳 Keep those trees growing.",
  ],
  cabin: [
    "Build the Press first, then the Fermenter, then the Bottling Station! 🏠",
    "Press fruit → juice → ferment → cider → bottle it! 🍎🧃🫗🍾",
    "Got cider ready? Head to the Bottling Station! 🍾",
    "The Fermenter takes a little time — check back soon! ⏳",
  ],
  distillery: [
    "You'll need cider to fire up the Still! 🫗",
    "Distil cider into Applejack, then age it into Whiskey! 🥃🪣",
    "The Aging Barrel takes time — good things come to those who wait! ⏳",
  ],
  brewery: [
    "Grow hops in the orchard, then brew fruit ales here! 🌾🍺",
    "Fruit + hops = one great beer! 🍎🌾→🍺",
    "Keep planting hops — you'll need plenty to brew! 🌾",
  ],
  roastery: [
    "Roast your beans first, then brew them into cups! 🫘🤎☕",
    "Build the Roaster, then the Coffee Brewer for the full chain! ☕",
    "Fresh-roasted coffee — the cozy orchard life! ☕",
  ],
};

// ── Orchard daily tips ────────────────────────────────────────────────────────

const DAILY_TIPS = [
  "Keep growing! 🌱",
  "Water your seedlings for faster growth! 💧",
  "The orchard is blooming! 🌸",
  "Don't forget to water! 💧",
  "Plant more trees — the more you grow, the more you make! 🌳",
  "Clear some overgrown tiles to unlock new soil! 🌿",
  "Every harvest brings you closer to the next tier! 🍎",
  "Happy Bear is rooting for you! 🐻",
  "A new day, a fresh harvest! 🌅",
];

// ── Contextual resource hints (called on new day) ─────────────────────────────

function contextualHint(amounts, tier) {
  const fruit  = amounts.fruit  ?? 0;
  const juice  = amounts.juice  ?? 0;
  const cider  = amounts.cider  ?? 0;
  const bottles = amounts.bottles ?? 0;

  if (tier === 0 && fruit < 3)
    return "Getting low on apples 🍎 — plant more seeds before you run out!";
  if (tier === 0 && fruit >= 8)
    return `Almost at 10 fruit! ${10 - fruit} more and the Cabin unlocks! 🏠`;
  if (tier >= 1 && juice === 0 && fruit >= 2)
    return "You've got fruit — head to the Cabin and press some juice! 🧃";
  if (tier >= 1 && juice >= 3)
    return "Juice is piling up! 🧃 Get the Fermenter running!";
  if (tier >= 1 && cider >= 3)
    return "Cider ready to bottle! 🫗 Fire up the Bottling Station!";
  if (tier >= 2 && bottles >= 15)
    return "Amazing stock of bottles! 🍾 The Distillery is waiting for you!";

  return DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
}

// ── Welcome lines ─────────────────────────────────────────────────────────────

function welcome(playerName, isNewGame) {
  if (isNewGame) {
    return {
      bear:   `Welcome, ${playerName}! 🐻 I'm Happy Bear! Tap the glowing 🍎 tile to harvest your first apple!`,
      status: `Welcome to the orchard, ${playerName}! Tap a tile to begin. Grow 10 fruit to unlock the Cabin! 🏠`,
      followUp: {
        delay: 5000,
        bear:   "Tap a 🌿 tile next to the apple to clear it, then plant a new seedling! 🌱",
      },
    };
  }
  return {
    bear:   `Welcome back, ${playerName}! 🐻 Great to see you again!`,
    status: `Welcome back, ${playerName}! Keep growing your orchard. 🌳`,
    followUp: null,
  };
}

// ── Sell reaction lines ───────────────────────────────────────────────────────

function sellReaction(coins) {
  if (coins >= 100) return `Wow, ${coins} 🪙! Big sale! You're rolling in it! 💰`;
  if (coins >= 40)  return `Nice! ${coins} 🪙 in the bag! 💰`;
  if (coins >= 15)  return `${coins} 🪙 earned! Every bit adds up! 🪙`;
  return `${coins} 🪙! The market likes what you've got! 🛒`;
}

// ── Harvest reaction lines ────────────────────────────────────────────────────

const HARVEST_REACTIONS = [
  "Fresh apples! 🍎 Keep harvesting!",
  "Great harvest! 🍎 Plant that seed back down!",
  "Juicy apples! 🍎 The press is going to love these!",
  "Apples collected! 🌟 Don't forget to replant!",
];

function harvestReaction() {
  return HARVEST_REACTIONS[Math.floor(Math.random() * HARVEST_REACTIONS.length)];
}

// ── Scene greeting picker ─────────────────────────────────────────────────────

function sceneGreeting(sceneName) {
  const pool = SCENE_GREETINGS[sceneName];
  if (!pool) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── Tier announcement ─────────────────────────────────────────────────────────

function tierUnlock(tier) {
  return TIER_LINES[tier] ?? {
    bear:   `New tier unlocked! Keep it up! 🎉`,
    status: `New tier reached! 🎉`,
  };
}

export const BearDialogue = {
  welcome,
  sceneGreeting,
  tierUnlock,
  contextualHint,
  harvestReaction,
  sellReaction,
};
