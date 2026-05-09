/**
 * BearDialogue — all of Happy Bear's lines, faithful to docs/Narrative.md.
 * Happy Bear: warm, earnest, endlessly enthusiastic, easily delighted.
 * Tips follow a Civilization-advisor style: in-character, directed at the player.
 */

// ── TIER UNLOCK SPEECHES ──────────────────────────────────────────────────────

const TIER_LINES = {
  1: {
    bear:   "Ten apples! The Cabin's yours now — I've had the press ready for a while, I'll be honest. Press the fruit into juice, let the Fermenter work, then get it into bottles. I'll walk you through all of it.",
    status: "Cider Cabin unlocked — build the Press and start the chain! 🍎→🧃→🫗→🍾",
  },
  2: {
    bear:   "Fifteen bottles. Story Bear left some copper piping in the corner of the Cabin last fall — I knew it would come in handy. The Distillery's yours. Build the Still and we'll start turning cider into something stronger.",
    status: "Distillery unlocked — build the Copper Still and distil your first Applejack! 🫗→🥃",
  },
  3: {
    bear:   "Five batches of Applejack. The Old Cooper came by last week — said something about oak and patience and left before I could ask what he meant. I think he meant build the Barrel. So. Let's build the Barrel.",
    status: "Aging Barrel unlocked — in the Distillery. Good whiskey takes time. 🥃→🪣",
  },
  4: {
    bear:   "Three whiskeys and the Brewery opens up. There's a hermit up on the hill who apparently has very strong feelings about hops. I'm going to go talk to him. You should start on the Brew Kettle.",
    status: "Brewery unlocked — grow hops and brew your first fruit ale! 🌾→🍺",
  },
  5: {
    bear:   "Five beers. The Greenhouse Keeper sent word — the coffee plants are ready. She's coming tomorrow to do a formal introduction, which I didn't know was a thing but apparently it is. The Roastery is yours.",
    status: "Roastery unlocked — roast coffee beans and brew something extraordinary. ☕",
  },
};

// ── STORY BEAR QUOTES ─────────────────────────────────────────────────────────

const STORY_BEAR_MOMENTS = {
  act1_open:
    "Every orchard begins with a single tree and someone willing to wait.",
  first_cider:
    "Every orchard begins with a single tree and someone willing to wait. Tonight, you bottled your first cider. The waiting was worth it.",
  tier2_unlock:
    "A delivery arrives — copper piping, a used mash tun, and a note that reads only: 'You're ready.'",
  tier3_unlock:
    "Worth every day of waiting.",
  tier4_unlock:
    "The first Orchard Ale was brewed with the specific intention of having enough for everyone — and a glass left in the orchard for no one in particular, which Happy Bear says is for the bees.",
  tier5_unlock:
    "I think this is what I imagined when I planted that first tree. Something like this. Something exactly like this.",
};

function storyBearQuote(moment) {
  return STORY_BEAR_MOMENTS[moment] ?? null;
}

// ── SCENE GREETINGS ───────────────────────────────────────────────────────────

const SCENE_GREETINGS = {
  orchard: [
    "The orchard's all yours. I was out here at first light — everything looks good. Those far tiles have been waiting a while, though.",
    "Fresh air and apple trees. This is the part of the day I like best.",
    "I checked the planted tiles this morning. A few are getting close. Keep an eye on the ones in the back.",
    "Something about standing in the middle of a proper orchard just — anyway. Tap something. Let's get to work.",
    "More cleared tiles means more trees. More trees means more apples. You know where I'm going with this.",
    "Good time to be out here. The soil looks ready for another planting if you've got the fruit for it.",
  ],
  cabin: [
    "The press is warmed up. I cleaned it this morning, which I do whether or not anyone notices.",
    "Fermenter's going. Good. I get nervous when it sits empty too long.",
    "The cabin smells incredible when things are running. I'm going to say that every time.",
    "Press, ferment, bottle — in that order. I know you know. I just like saying it.",
    "Every batch we make in here starts with something you grew out there. I find that genuinely satisfying.",
    "The Bottling Station's ready whenever the cider is. Which it nearly is, by my count.",
  ],
  distillery: [
    "I'm always a little quieter in here. It just feels like a room that deserves some quiet.",
    "The barrel's got a good smell to it today. Something's coming along in there.",
    "Applejack first, then whiskey. You can't rush the second one. I learned that the hard way.",
    "The Still does its best work when you leave it alone. Start it up and step back.",
    "Story Bear says good spirits are mostly patience with a little copper thrown in. He's not wrong.",
  ],
  brewery: [
    "Hops! We're doing hops. I've wanted to do hops for years. Do you know how long I've wanted to do hops?",
    "The Brew Kettle's ready. I've got the hops sorted and everything.",
    "There's something generous about making beer. You always end up with more than you planned.",
    "Fruit and hops together. I didn't know this was going to be one of my favorite combinations. It is.",
    "The Hops Hermit would probably have something to say about how we're running things in here. Fortunately, he's on the hill.",
  ],
  roastery: [
    "The smell in here is the best smell in the entire orchard. The Greenhouse Keeper would say it's the plants. She's not wrong. But the roasting is something else.",
    "Coffee takes patience. I thought I knew what patience was before we started roasting. I was somewhat wrong.",
    "The Morning Blend is the one I keep coming back to. Something about apple and coffee together that I didn't see coming.",
    "Roast first, then brew. The Greenhouse Keeper was very specific about the order and I am not going to argue with her.",
    "Every batch that comes out of the Roaster has a smell that stops me for a second. Every time.",
  ],
  store: [
    "Sell what you've got, keep what you need. That's my general approach. Story Bear would add something wise about abundance.",
    "The market likes quality. Aged whiskey, bottled cider, fresh roast — those fetch real prices.",
    "I always feel a little strange selling things we made. Then the coins come in and I feel fine.",
    "Bring your best and the market will notice. Leave the scraps for a day when you really need the coins.",
  ],
};

// ── DAILY CONTEXTUAL HINTS (Civilization-advisor style) ───────────────────────

function contextualHint(amounts, tier) {
  const {
    fruit = 0, juice = 0, cider = 0, bottles = 0,
    hops = 0, applejack = 0, whiskey = 0, fruit_beer = 0,
    coffee_bean = 0, roasted_coffee = 0, cups = 0,
    wood = 0, stone = 0,
  } = amounts;

  // Tier 0 — orchard building
  if (tier === 0) {
    if (fruit < 3)
      return "We're getting a little low on apples. If you can get a few more seedlings in the ground before the day gets away from us, I'd feel a lot better about where we stand.";
    if (fruit >= 3 && fruit < 8)
      return "Those cleared tiles won't plant themselves. A few more seedlings in the ground and we'll have a proper harvest going before long.";
    if (fruit >= 8)
      return `Just ${10 - fruit} more apple${10 - fruit === 1 ? '' : 's'} and the Cabin swings open. I've already got the press polished.`;
  }

  // Tier 1 — cider chain
  if (tier >= 1) {
    if (fruit >= 2 && juice === 0)
      return "You've got fruit and the press is waiting. Head to the Cabin — the Fermenter has been sitting idle since this morning and I feel guilty on its behalf.";
    if (juice >= 3 && cider === 0)
      return "Three juices in stock — that's enough for a fermentation run. Get the Fermenter going and let it work.";
    if (cider >= 3 && bottles === 0)
      return "Three ciders ready. That's a full bottling run. The Bottling Station has been patient. It is a very patient machine.";
    if (bottles >= 10 && tier < 2)
      return "We've got quite a stack of bottles building up. Story Bear left some copper piping in the corner of the Cabin last fall. I keep looking at it.";
  }

  // Tier 2 — distillery
  if (tier >= 2) {
    if (cider >= 2 && applejack === 0)
      return "The Still is ready and we've got the cider for it. Applejack doesn't make itself, though I sometimes wish it did.";
    if (applejack >= 2 && whiskey === 0)
      return "Enough Applejack to start the Barrel. The Old Cooper would say something about patience here. I'm going to say it anyway: patience.";
  }

  // Tier 3 — whiskey
  if (tier === 3 && whiskey === 0 && applejack >= 2)
    return "The Barrel's waiting. I know the aging takes time. That's the point of it.";

  // Tier 4 — brewery
  if (tier >= 4) {
    if (hops === 0)
      return "The Brew Kettle needs hops and the orchard needs hops planted. Worth fixing today — the Kettle is doing nothing but sitting there looking expectant.";
    if (hops >= 1 && fruit >= 2 && fruit_beer === 0)
      return "Hops in stock, fruit in stock. The Brew Kettle is ready when you are.";
  }

  // Tier 5 — roastery
  if (tier >= 5) {
    if (coffee_bean === 0)
      return "No coffee beans yet. Plant a coffee plot in the orchard — they take longer than apples, but the Greenhouse Keeper says they're worth it. She's right.";
    if (coffee_bean >= 2 && roasted_coffee === 0)
      return "Beans are ready for the Roaster. The Greenhouse Keeper said to watch the first roast carefully. I intend to.";
    if (roasted_coffee >= 1 && cups === 0)
      return "Roasted coffee's ready for the Brewer. This is the moment the whole Roastery was built for.";
  }

  // Low resource warnings
  if (wood < 2 && tier >= 1)
    return "We're running low on wood. Clear some overgrown tiles or get a forest plot going — there's always another build on the horizon.";
  if (stone < 2 && tier >= 1)
    return "Stone's getting thin. The mine shaft will sort that out if we give it a few minutes.";

  // General pool
  const general = [
    "A good day starts with a walk through the orchard and ends with something in the Fermenter. That's my theory and I'm holding to it.",
    "The more tiles we clear, the more room we have to grow things. I keep coming back to that thought.",
    "I was reading the old orchard journal last night. Story Bear kept very detailed notes. They're helpful — and a little humbling.",
    "Plant what you can, press what you've grown, and let the Still do the rest. That's the whole system, really.",
    "Some days the orchard just runs. Those are good days. Let's keep this one going.",
    "Coins in the store, cider in the Fermenter, apples on the trees. That's a healthy orchard right there.",
    "I find myself checking the Fermenter more often than strictly necessary. I've accepted this about myself.",
    "The orchard looks different from the far tiles — more complete. Worth expanding toward if we can.",
    "Story Bear says the first year of an orchard tells you what kind of orchard it wants to be. I think ours wants to be a busy one.",
    "Every bottle we fill and sell is the whole chain working the way it's supposed to. I find that satisfying every single time.",
  ];
  return general[Math.floor(Math.random() * general.length)];
}

// ── HARVEST REACTIONS ─────────────────────────────────────────────────────────

const HARVEST_REACTIONS = [
  "Oh, those are good ones. Get a few more and we'll have enough for the press.",
  "There we go. Right on time. Well — a little early, actually. I may have watered them twice.",
  "Look at that. Story Bear would say something meaningful right now. I'm just glad we've got fruit.",
  "Perfect. Those are going straight to the press.",
  "Yes! That's what I'm talking about.",
  "Every harvest is the orchard doing exactly what it's supposed to. I never get tired of it.",
  "Good fruit. Plant them back and let's keep the chain going.",
  "The press is going to love these.",
  "That's a proper harvest right there.",
  "Nice. Keep the trees turning and we'll never run short.",
];

function harvestReaction() {
  return HARVEST_REACTIONS[Math.floor(Math.random() * HARVEST_REACTIONS.length)];
}

// ── CROPS RIPENED ─────────────────────────────────────────────────────────────

const RIPENED_REACTIONS = [
  "Something's ready in the orchard. I can tell by — I just know. I've been doing this a while.",
  "The crops are there. Ripe and ready. Go get them before they think we've forgotten.",
  "Harvest time. I may have been checking those tiles more often than strictly necessary.",
  "Your trees came through. Head out there and bring them in.",
  "The orchard's calling. That's my interpretation of the situation.",
  "Ripe! Go. I'll be here.",
];

function cropsRipened() {
  return RIPENED_REACTIONS[Math.floor(Math.random() * RIPENED_REACTIONS.length)];
}

// ── FIRST-CRAFT REACTIONS ─────────────────────────────────────────────────────

const FIRST_CRAFT_LINES = {
  press_juice:
    "There it is. Fresh pressed. You can smell the difference from store-bought — I don't know why more people don't do this.",
  ferment_cider:
    "The Fermenter's running. Now we wait. I'm not going to pretend I'm not going to check on it every fifteen minutes.",
  bottle_cider:
    "Oh — oh, that's the one. That's exactly right. … YES! That's a proper cider right there. Story Bear is going to love this.",
  distill_applejack:
    "The Still is doing something remarkable right now. Just — let it work. Don't touch anything. Actually, you can touch things. I just get a little protective.",
  distill_whiskey:
    "That took a long time. But some things have to. Story Bear wrote half a journal about this moment. I understand why now.",
  brew_beer:
    "Hops! We're doing hops now! I've always wanted to do hops! Sorry. I'm — this is a big day.",
  roast_coffee:
    "The cabin smells like something I didn't know I was missing. The Greenhouse Keeper said to pay attention during the roast. I'm going to pay so much attention.",
  brew_coffee:
    "I had a dream about this once. I wasn't sure it was possible. … It's possible.",
};

const REPEAT_CRAFT_LINES = [
  "Done. Check the shelves.",
  "Another good batch.",
  "There we go. Keep the chain running.",
  "That's one more. I like seeing the numbers go up.",
  "Finished. The orchard thanks you.",
  "Good work. On to the next.",
  "Running smoothly. That's what we want.",
];

function craftComplete(recipeId, isFirst) {
  if (isFirst && FIRST_CRAFT_LINES[recipeId]) return FIRST_CRAFT_LINES[recipeId];
  return REPEAT_CRAFT_LINES[Math.floor(Math.random() * REPEAT_CRAFT_LINES.length)];
}

// ── TOOL BUILT REACTIONS ──────────────────────────────────────────────────────

const TOOL_BUILT_LINES = {
  press:
    "The Press is up! This is where everything starts. Put some fruit in there and let's get going.",
  fermenter:
    "The Fermenter's assembled. That's the heart of the cider operation right there. Juice goes in, time does the work, cider comes out. I find it genuinely moving.",
  bottling:
    "Bottling Station's good to go. Every bottle we fill is something we made, start to finish. I like that.",
  still:
    "The Copper Still is up. It's a beautiful thing, isn't it? The Old Cooper would probably just grunt if I said that to him. But it is.",
  barrel:
    "The Barrel's in place. That wood is going to do something to whatever we put in it. We just have to be patient enough to find out what.",
  brew_kettle:
    "Brew Kettle's ready. The hops can go in anytime. I've already been watching them grow. I'm very invested in those hops.",
  roaster:
    "The Roaster's up. The Greenhouse Keeper is going to be so pleased. I'm going to send her a note after the first roast.",
  coffee_brewer:
    "Coffee Brewer's assembled. Roasted beans in, cups out. The Greenhouse Keeper would call this the culmination of a process. She's right.",
  harvest_bell:
    "The Harvest Bell is up. I hung it myself — took three tries to get it level. It'll ring when something's ready. You don't have to be there.",
};

function toolBuilt(toolId) {
  return TOOL_BUILT_LINES[toolId] ?? "New tool ready. Let's put it to work.";
}

// ── SELL REACTIONS ────────────────────────────────────────────────────────────

function sellReaction(coins) {
  if (coins >= 100) return `${coins} coins. Story Bear is going to hear about this. That's a serious sale.`;
  if (coins >= 40)  return `${coins} coins in the bag. The orchard is paying for itself.`;
  if (coins >= 15)  return `${coins} coins. Every batch we sell is the whole chain working the way it's supposed to.`;
  return `${coins} coins. The market likes what we've got. Let's make more.`;
}

// ── WELCOME ───────────────────────────────────────────────────────────────────

const WELCOME_BACK_LINES = [
  "You're back. I've been checking the Fermenter every twenty minutes. Don't tell anyone.",
  "Good morning. The orchard looked good this morning. Come see.",
  "I was hoping it was you. The apple trees came along nicely overnight.",
  "Welcome back. I've been saving the news about the barrel — it's coming along.",
  "There you are. I may have been a little anxious about the Fermenter. It's fine. Everything's fine.",
];

function welcome(playerName, isNewGame) {
  if (isNewGame) {
    return {
      bear: `Oh! You're here. I wasn't sure you were coming — the orchard's been quiet for a while. I'm Happy Bear. This is the place. Tap that apple tree and let's begin.`,
      status: `Welcome to Happy Bear's Cozy Orchard, ${playerName}. Tap a tile to get started.`,
      followUp: {
        delay: 7000,
        bear: "Tap the 🌿 tiles next to where you've harvested to clear them, then plant new seedlings. The more trees we grow, the more we can make.",
      },
    };
  }
  return {
    bear:     WELCOME_BACK_LINES[Math.floor(Math.random() * WELCOME_BACK_LINES.length)],
    status:   `Welcome back, ${playerName}. The orchard is ready when you are.`,
    followUp: null,
  };
}

// ── SCENE GREETING PICKER ─────────────────────────────────────────────────────

function sceneGreeting(sceneName) {
  const pool = SCENE_GREETINGS[sceneName];
  if (!pool) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── TIER ANNOUNCEMENT ─────────────────────────────────────────────────────────

function tierUnlock(tier) {
  return TIER_LINES[tier] ?? {
    bear:   "Something new has opened up. I can feel it.",
    status: "New tier reached.",
  };
}

// ── EXPORTS ───────────────────────────────────────────────────────────────────

export const BearDialogue = {
  welcome,
  sceneGreeting,
  tierUnlock,
  contextualHint,
  harvestReaction,
  cropsRipened,
  craftComplete,
  toolBuilt,
  sellReaction,
  storyBearQuote,
};
