/**
 * main.js — Happy Bear Cozy Orchard
 * Entry point. Shows main menu first, then boots all systems on save selection.
 */

import { TICKS_PER_DAY, GAME_TICK_MS } from './src/constants.js';
import { ResourceManager }   from './src/systems/resources.js';
import { QuestSystem }       from './src/systems/QuestSystem.js';
import { TileGrid }          from './src/systems/tiles.js';
import { CropSystem }        from './src/systems/crops.js';
import { CraftingSystem }    from './src/systems/crafting.js';
import { ConstructionSystem} from './src/systems/construction.js';
import { ProgressionSystem } from './src/systems/progression.js';

import { ProfileSystem }     from './src/systems/ProfileSystem.js';
import { SaveSystem }        from './src/systems/SaveSystem.js';
import { BearDialogue }      from './src/systems/BearDialogue.js';

import { SceneManager, SCENES } from './src/scenes/sceneManager.js';
import { OrchardScene }         from './src/scenes/orchard.js';
import { CabinScene }           from './src/scenes/cabin.js';
import { DistilleryScene }      from './src/scenes/distillery.js';
import { BreweryScene }         from './src/scenes/brewery.js';
import { RoasteryScene }        from './src/scenes/roastery.js';
import { StoreScene }           from './src/scenes/store.js';
import { StoreSystem }          from './src/systems/StoreSystem.js';
import { MarketSystem }         from './src/systems/MarketSystem.js';

import { HUD }         from './src/ui/hud.js';
import { ActionMenu }  from './src/ui/menus.js';
import { AudioSystem, MusicPlayer } from './src/systems/AudioSystem.js';

import progressionData from './src/data/progression.json';

// ── Audio (module-level so Settings can reach it before game init) ───────────
const audio = new AudioSystem();
let music;
try {
  music = new MusicPlayer(import.meta.env.BASE_URL ?? '/');
} catch (e) {
  music = { start() {}, setVolume() {}, nowPlaying() { return ''; } };
}

// Start music on first user interaction anywhere in the app
document.addEventListener('click', () => { try { music.start(); } catch (_) {} }, { once: true });

// ── DOM refs ────────────────────────────────────────────────────────────────

const menuOverlay  = document.getElementById('menu-overlay');
const menuContainer = document.getElementById('menu-container');
const appEl        = document.getElementById('app');

// ── Menu helpers ────────────────────────────────────────────────────────────

function renderMainMenu() {
  menuContainer.innerHTML = '';

  const profile  = ProfileSystem.getSelectedProfile();
  const profiles = ProfileSystem.getAllProfiles();

  const wrapper = document.createElement('div');
  wrapper.className = 'menu-screen main-menu-screen';

  wrapper.innerHTML = `
    <div class="menu-bear">🐻</div>
    <h1 class="menu-title">Happy Bear<br>Cozy Orchard</h1>
    <p class="menu-subtitle">A cozy place to grow, craft, and sip 🍎</p>
  `;

  const nav = document.createElement('nav');
  nav.className = 'menu-nav';

  const btns = [];

  if (profile) {
    btns.push({ label: '🌳 Continue', primary: true, onClick: () => showSaveSelect(profile) });
  }
  btns.push({ label: profile ? '🌱 New Game' : '🌱 Start Game', primary: !profile, onClick: () => {
    if (profiles.length === 0) {
      renderProfileCreate();
    } else {
      renderProfileSelect();
    }
  }});
  if (profile) {
    btns.push({ label: '📂 Load Game',  primary: false, onClick: () => showSaveSelect(profile) });
  }
  btns.push({ label: '👤 Profiles',   primary: false, onClick: renderProfileSelect });
  btns.push({ label: '⚙️ Settings',   primary: false, onClick: () => renderSettings() });

  btns.forEach(({ label, primary, onClick }) => {
    const btn = document.createElement('button');
    btn.className = primary ? 'menu-btn menu-btn-primary' : 'menu-btn';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    nav.appendChild(btn);
  });

  wrapper.appendChild(nav);

  if (profile) {
    const profileBadge = document.createElement('p');
    profileBadge.className = 'menu-profile-badge';
    profileBadge.textContent = `Playing as ${profile.playerName}`;
    wrapper.appendChild(profileBadge);
  }

  menuContainer.appendChild(wrapper);
}

function renderProfileCreate(onBack) {
  menuContainer.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'menu-screen profile-screen';
  wrapper.innerHTML = `<div class="menu-bear">🐾</div><h2 class="menu-title">Welcome!</h2><p class="menu-subtitle">What should we call you?</p>`;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'profile-name-input';
  input.placeholder = 'Your name…';
  input.maxLength = 20;
  input.autofocus = true;

  const createBtn = document.createElement('button');
  createBtn.className = 'menu-btn menu-btn-primary';
  createBtn.textContent = '🐻 Enter the Orchard';
  createBtn.addEventListener('click', async () => {
    const name = input.value.trim() || 'Happy Bear';
    const profile = await ProfileSystem.createProfile(name);
    await showSaveSelect(profile);
  });

  input.addEventListener('keydown', e => { if (e.key === 'Enter') createBtn.click(); });

  wrapper.appendChild(input);
  wrapper.appendChild(createBtn);

  if (onBack) {
    const back = document.createElement('button');
    back.className = 'menu-btn menu-btn-secondary';
    back.textContent = '← Back';
    back.addEventListener('click', onBack);
    wrapper.appendChild(back);
  }

  menuContainer.appendChild(wrapper);
}

function renderProfileSelect() {
  menuContainer.innerHTML = '';
  const profiles = ProfileSystem.getAllProfiles();
  const wrapper = document.createElement('div');
  wrapper.className = 'menu-screen profile-screen';
  wrapper.innerHTML = `<div class="menu-bear">👤</div><h2 class="menu-title">Profiles / Saved Games</h2>`;

  if (profiles.length > 0) {
    const list = document.createElement('ul');
    list.className = 'profile-list';
    profiles.forEach(p => {
      const item = document.createElement('li');
      item.className = 'profile-card';
      item.innerHTML = `<span class="profile-name">${p.playerName}</span><span class="profile-meta">Last visited ${new Date(p.lastPlayed).toLocaleDateString()}</span>`;
      item.addEventListener('click', async () => {
        await ProfileSystem.selectProfile(p.id);
        await showSaveSelect(p);
      });
      const del = document.createElement('button');
      del.className = 'profile-delete-btn';
      del.textContent = '✕';
      del.title = 'Delete profile';
      del.addEventListener('click', async e => {
        e.stopPropagation();
        if (confirm(`Delete "${p.playerName}"? This cannot be undone.`)) {
          await ProfileSystem.deleteProfile(p.id);
          renderProfileSelect();
        }
      });
      item.appendChild(del);
      list.appendChild(item);
    });
    wrapper.appendChild(list);
  }

  if (profiles.length < 4) {
    const newBtn = document.createElement('button');
    newBtn.className = 'menu-btn menu-btn-primary';
    newBtn.textContent = '+ New Profile';
    newBtn.addEventListener('click', () => renderProfileCreate(renderProfileSelect));
    wrapper.appendChild(newBtn);
  }

  const back = document.createElement('button');
  back.className = 'menu-btn menu-btn-secondary';
  back.textContent = '← Back';
  back.addEventListener('click', renderMainMenu);
  wrapper.appendChild(back);

  menuContainer.appendChild(wrapper);
}

async function showSaveSelect(profile) {
  await ProfileSystem.selectProfile(profile.id);
  const slots = await SaveSystem.getAvailableSlots();

  menuContainer.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'menu-screen save-screen';
  wrapper.innerHTML = `<div class="menu-bear">🍎</div><h2 class="menu-title">Choose Your Orchard</h2><p class="menu-subtitle">${profile.playerName}'s orchards</p>`;

  const grid = document.createElement('div');
  grid.className = 'save-slot-grid';

  const firstEmptySlot = slots.find(s => !s.occupied)?.slot ?? null;

  slots.forEach(({ slot, occupied, data }) => {
    const isRecommended = !occupied && slot === firstEmptySlot && slot === 'slot1';
    const card = document.createElement('div');
    card.className = `save-slot-card${occupied ? '' : ' save-slot-empty'}${isRecommended ? ' save-slot-recommended' : ''}`;

    if (occupied && data) {
      card.innerHTML = `
        <div class="save-slot-label">Orchard ${slot.replace('slot','')}</div>
        <div class="save-slot-info">Day ${data.day} &nbsp;·&nbsp; ${data.season.charAt(0).toUpperCase()+data.season.slice(1)} &nbsp;·&nbsp; Cabin Lv${data.cabinLevel}</div>
        <div class="save-slot-date">Last tended ${new Date(data.timestamp).toLocaleDateString()}</div>
        <button class="save-slot-clear">✕ Clear</button>
      `;
      card.querySelector('.save-slot-clear').addEventListener('click', async e => {
        e.stopPropagation();
        if (confirm('Clear this orchard? This cannot be undone.')) {
          await SaveSystem.clearSlot(slot);
          showSaveSelect(profile);
        }
      });
      card.addEventListener('click', e => {
        if (e.target.classList.contains('save-slot-clear')) return;
        launchGame(data, slot);
      });
    } else {
      card.innerHTML = `
        <div class="save-slot-label">Orchard ${slot.replace('slot','')}</div>
        <div class="save-slot-begin">Begin Here 🌱</div>
      `;
      card.addEventListener('click', () => {
        const newSave = SaveSystem.createNewSave(slot);
        launchGame(newSave, slot);
      });
    }

    grid.appendChild(card);
  });

  wrapper.appendChild(grid);

  const back = document.createElement('button');
  back.className = 'menu-btn menu-btn-secondary';
  back.textContent = '← Back';
  back.addEventListener('click', renderMainMenu);
  wrapper.appendChild(back);

  menuContainer.appendChild(wrapper);
}

function renderSettings(onBack) {
  menuContainer.innerHTML = '';
  const profile = ProfileSystem.getSelectedProfile();
  const s = profile?.settings ?? {
    gameplay: { textSpeed: 'normal', animationSpeed: 'normal', autosave: true, dayLength: 'normal', tutorialTips: true },
    audio:    { musicVolume: 0.7, sfxVolume: 0.8, ambientVolume: 0.6 },
    video:    { pixelScale: 2, fullscreen: false, uiScale: 'medium' },
    accessibility: { highContrast: false, reducedMotion: false, largeText: false }
  };

  const wrapper = document.createElement('div');
  wrapper.className = 'menu-screen settings-screen';
  wrapper.innerHTML = `<div class="menu-bear">⚙️</div><h2 class="menu-title">Settings</h2>`;

  function row(label, el) {
    const r = document.createElement('div');
    r.className = 'settings-row';
    const lbl = document.createElement('label');
    lbl.className = 'settings-label';
    lbl.textContent = label;
    r.appendChild(lbl);
    r.appendChild(el);
    return r;
  }

  function toggle(label, cat, key) {
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'settings-toggle';
    cb.checked = s[cat][key];
    cb.addEventListener('change', () => ProfileSystem.updateSetting(cat, key, cb.checked));
    return row(label, cb);
  }

  function slider(label, cat, key, min, max, onLive) {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex'; wrap.style.gap = '8px'; wrap.style.alignItems = 'center';
    const sl = document.createElement('input');
    sl.type = 'range'; sl.min = min; sl.max = max; sl.step = 0.05;
    sl.value = s[cat][key]; sl.className = 'settings-slider';
    const val = document.createElement('span');
    val.textContent = Math.round(s[cat][key] * 100) + '%';
    sl.addEventListener('input', () => {
      const v = parseFloat(sl.value);
      ProfileSystem.updateSetting(cat, key, v);
      val.textContent = Math.round(v * 100) + '%';
      if (onLive) onLive(v);
    });
    wrap.appendChild(sl); wrap.appendChild(val);
    return row(label, wrap);
  }

  const section = (heading, ...rows) => {
    const sec = document.createElement('div');
    sec.className = 'settings-section';
    const h = document.createElement('h3');
    h.className = 'settings-heading'; h.textContent = heading;
    sec.appendChild(h);
    rows.forEach(r => sec.appendChild(r));
    return sec;
  };

  wrapper.appendChild(section('Audio',
    slider('Music',   'audio', 'musicVolume',   0, 1, v => music.setVolume(v)),
    slider('SFX',     'audio', 'sfxVolume',     0, 1, v => audio.setSfxVolume(v)),
    slider('Ambient', 'audio', 'ambientVolume', 0, 1)
  ));
  wrapper.appendChild(section('Gameplay',
    toggle('Autosave',     'gameplay', 'autosave'),
    toggle('Tutorial Tips','gameplay', 'tutorialTips')
  ));
  wrapper.appendChild(section('Accessibility',
    toggle('High Contrast', 'accessibility', 'highContrast'),
    toggle('Reduced Motion','accessibility', 'reducedMotion'),
    toggle('Larger Text',   'accessibility', 'largeText')
  ));

  const howToBtn = document.createElement('button');
  howToBtn.className = 'menu-btn menu-btn-secondary';
  howToBtn.textContent = '📖 How to Play';
  howToBtn.addEventListener('click', () => renderHowToPlay(onBack));
  wrapper.appendChild(howToBtn);

  const back = document.createElement('button');
  back.className = 'menu-btn menu-btn-secondary';
  back.textContent = onBack ? '✕ Close' : '← Back';
  back.addEventListener('click', onBack ?? renderMainMenu);
  wrapper.appendChild(back);

  menuContainer.appendChild(wrapper);
}

// ── How to Play ──────────────────────────────────────────────────────────────

const HOW_TO_PLAY_CHAPTERS = [
  {
    title: '🌿 Welcome, Friend!',
    lines: [
      "Hey there! I'm Happy Bear, and I'll be your guide around the orchard. Pull up a stump — let me show you how this all works.",
      "This little patch of land is all yours. That 10×10 grid of tiles? That's where everything starts. Tap any tile to see what you can do with it.",
    ],
  },
  {
    title: '🪓 Clearing Land',
    lines: [
      "See those glowing tiles? Overgrown ones need clearing before you can plant anything. Grass gives you wood 🪵, rocky patches give you stone 🪨, and old stumps give wood too.",
      "Once you clear a tile, it unlocks the tiles next to it — so the orchard slowly opens up as you work your way out from the middle.",
    ],
    tip: "Dig (⛏️) a rocky clearable tile instead of clearing it — you get 3 🪨 instead of 1 🪵. Worth it when you need stone!",
  },
  {
    title: '🌱 Planting & Growing',
    lines: [
      "Cleared soil is ready for planting. Apple trees cost 1 🍎 to plant and grow into harvestable fruit in about 20 seconds. Timber trees 🌲 are free but take a little longer — they give 4 🪵 when harvested.",
      "Both tree types auto-replant after each harvest, so once you've got a tile going, it just keeps producing. Nice and cozy.",
    ],
    tip: "Water 💧 your seedlings to cut grow time — it's free and takes no resources. Always worth a tap!",
  },
  {
    title: '🍎 Harvesting (Don\'t Wait Too Long!)',
    lines: [
      "When an apple tile glows bright green, it's ready! Tap it and harvest. You'll get 3 🍎 each time.",
      "Here's the thing though — apples left too long start to rot. The tile will flicker orange as a warning. Let them go fully rotten (🍂) and you get nothing. Compost a rotten tile to start fresh, or use Auto mode so I handle it for you!",
    ],
    tip: "Timber trees never rot — great for set-it-and-forget-it wood production.",
  },
  {
    title: '⛏️ Mining Stone',
    lines: [
      "Need stone? Set up a mine on any cleared tile. It takes about 15 seconds to dig, then yields 2 🪨. When it's done the shaft stays — tap it again to keep mining.",
      "Mine shafts are reusable indefinitely. Build a few and you'll have a steady stone supply without clearing new land.",
    ],
    tip: "Auto mode restarts mines automatically, so turn it on if you want stone without the tapping.",
  },
  {
    title: '🏠 Building & Crafting',
    lines: [
      "Once you've harvested 10 🍎, the Cider Cabin unlocks. Head over there and you'll find blueprints waiting — build a Press, Fermenter, and Bottling Station to start making cider.",
      "The crafting chain goes: Apples → Juice (Press) → Cider (Fermenter) → Bottles (Bottling). Each step adds value. Keep those stations busy!",
    ],
    tip: "Buy Equipment Upgrades in the Market to speed up your crafting stations — a big help once you're running full production.",
  },
  {
    title: '🥃 Growing Your Operation',
    lines: [
      "As your orchard matures, new venues unlock. The Distillery lets you turn cider into Applejack and age it into Whiskey. The Brewery adds Fruit Beer. The Roastery tops it all off with Coffee.",
      "Each tier takes time as well as resources — that's intentional. Enjoy the pace! The orchard will tell you when you're ready.",
    ],
  },
  {
    title: '🛒 The Market',
    lines: [
      "Once you've bottled a few ciders, the Market opens up. Sell your goods for coins 🪙 — coins unlock upgrades, land expansions, and better market deals.",
      "Upgrade your market from a humble Farm Stand all the way to a Wholesale Partner. Better market levels mean higher sell prices and the ability to sign distribution deals with local businesses for guaranteed recurring income.",
    ],
    tip: "Missed a distribution deal shipment? You can settle the penalty with coins instead of waiting through the 14-day pause.",
  },
  {
    title: '🤖 Auto Mode',
    lines: [
      "See that 🤖 Auto button in the orchard? Turn it on and I'll handle watering, harvesting, composting, and mining automatically. Perfect for when you're focused on crafting or just want a breather.",
      "You can flip it on and off any time — manual mode is great for micro-managing, Auto is great for keeping things ticking over.",
    ],
  },
  {
    title: '🌾 Expanding the Land',
    lines: [
      "The starting zone is the center of the grid. As you clear tiles, adjacent locked tiles open up — and as you hit higher tiers, whole new zones unlock automatically.",
      "Two special zones — the Hop Fields and Coffee Grove — can be purchased directly from the Market once you're far enough along. More land means more tiles, more crops, more coins.",
    ],
    tip: "You're doing great. The orchard grows at its own pace — just keep at it, and I'll be right here cheering you on. 🐻",
  },
];

function renderHowToPlay(onBack) {
  menuContainer.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'menu-screen howtoplay-screen';

  wrapper.innerHTML = `
    <div class="howtoplay-header">
      <div class="howtoplay-bear">🐻</div>
      <div>
        <div class="howtoplay-title">Happy Bear's Guide</div>
        <div class="howtoplay-subtitle">Everything you need to know</div>
      </div>
    </div>`;

  for (const chapter of HOW_TO_PLAY_CHAPTERS) {
    const chapterEl = document.createElement('div');
    chapterEl.className = 'howtoplay-chapter';

    const titleEl = document.createElement('div');
    titleEl.className = 'howtoplay-chapter-title';
    titleEl.textContent = chapter.title;
    chapterEl.appendChild(titleEl);

    const bubble = document.createElement('div');
    bubble.className = 'howtoplay-bubble';

    for (const line of chapter.lines) {
      const p = document.createElement('p');
      p.textContent = line;
      bubble.appendChild(p);
    }

    if (chapter.tip) {
      const tipEl = document.createElement('div');
      tipEl.className = 'howtoplay-tip';
      tipEl.innerHTML = `<span class="howtoplay-tip-icon">💡</span> ${chapter.tip}`;
      bubble.appendChild(tipEl);
    }

    chapterEl.appendChild(bubble);
    wrapper.appendChild(chapterEl);
  }

  const back = document.createElement('button');
  back.className = 'menu-btn menu-btn-secondary';
  back.textContent = '← Back to Settings';
  back.addEventListener('click', () => renderSettings(onBack));
  wrapper.appendChild(back);

  menuContainer.appendChild(wrapper);
}

// ── Game launch ─────────────────────────────────────────────────────────────

function launchGame(saveData, slot) {
  menuOverlay.classList.add('hidden');
  appEl.classList.remove('game-hidden');
  initGame(saveData, slot);
}

// ── Game init (runs after menu flow) ────────────────────────────────────────

function initGame(saveData, slot) {
  const _base = import.meta.env.BASE_URL;
  ['orchard','distillery','coffee','waving','sleeping','hiking','campfire'].forEach(b => {
    document.documentElement.style.setProperty(`--bear-${b}`, `url('${_base}bear-${b}.PNG')`);
  });

  const savedTier    = saveData?.systems?.tier ?? 0;
  const resources    = new ResourceManager();
  const tileGrid     = new TileGrid();
  const cropSystem   = new CropSystem(tileGrid);
  const construction = new ConstructionSystem(resources);

  // gameState is the single source of truth — shared with progression and crafting
  const gameState = { tier: savedTier, day: saveData?.day ?? 1, unlocks: new Set(['orchard']), firstCrafts: new Set() };

  const crafting     = new CraftingSystem(resources, gameState);
  const progression  = new ProgressionSystem(gameState, resources);
  const gameStats = { harvests: 0, crafts: 0, itemsSold: 0, upgradesBought: 0 };

  const hud      = new HUD();
  const statusEl = document.getElementById('status-msg');

  // In-game settings button in nav bar
  const navSettingsBtn = document.getElementById('nav-settings');
  if (navSettingsBtn) {
    navSettingsBtn.addEventListener('click', () => {
      menuOverlay.classList.remove('hidden');
      renderSettings(() => {
        menuOverlay.classList.add('hidden');
        menuContainer.innerHTML = '';
      });
    });
  }

  // In-game help button in nav bar
  const navHelpBtn = document.getElementById('nav-help');
  if (navHelpBtn) {
    navHelpBtn.addEventListener('click', () => {
      menuOverlay.classList.remove('hidden');
      renderHowToPlay(() => {
        menuOverlay.classList.add('hidden');
        menuContainer.innerHTML = '';
      });
    });
  }

  // Sync audio volumes from profile settings
  const _profileForAudio = ProfileSystem.getSelectedProfile();
  audio.setSfxVolume(_profileForAudio?.settings?.audio?.sfxVolume ?? 0.7);
  music.setVolume(_profileForAudio?.settings?.audio?.musicVolume ?? 0.5);

  let _lastBearMsg = '';
  let _bearHideTimers = {};

  const bearSpeak = (msg) => {
    _lastBearMsg = msg;
    ['bear-speech', 'cabin-bear-speech', 'store-bear-speech'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent = msg;
      el.classList.remove('hidden');
      clearTimeout(_bearHideTimers[id]);
      _bearHideTimers[id] = setTimeout(() => el.classList.add('hidden'), 7000);
    });
  };

  // Clicking any bear sprite replays the last message
  document.querySelectorAll('.bear-img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => { if (_lastBearMsg) bearSpeak(_lastBearMsg); });
  });

  const showStoryBear = (moment) => {
    const quote = BearDialogue.storyBearQuote(moment);
    if (!quote) return;
    const panel = document.getElementById('story-bear-panel');
    if (!panel) return;
    panel.querySelector('.story-bear-quote').textContent = `"${quote}"`;
    panel.classList.remove('hidden');
    panel.classList.add('story-bear-visible');
    setTimeout(() => {
      panel.classList.remove('story-bear-visible');
      setTimeout(() => panel.classList.add('hidden'), 600);
    }, 6000);
  };

  const setStatus = (msg) => { if (statusEl) statusEl.textContent = msg; };

  // ── Statistics modal ────────────────────────────────────────────────────────
  const STAT_DEFS = [
    { icon: '📅', label: 'Days Played',       getValue: () => gameState.day },
    { icon: '🍎', label: 'Total Harvests',     getValue: () => gameStats.harvests },
    { icon: '🍺', label: 'Crafts Completed',   getValue: () => gameStats.crafts },
    { icon: '🛒', label: 'Items Sold',         getValue: () => gameStats.itemsSold },
    { icon: '🪙', label: 'Coins Earned',       getValue: () => storeSystem.totalEarned },
    { icon: '🔧', label: 'Upgrades Bought',    getValue: () => gameStats.upgradesBought },
  ];

  const showStats = () => {
    const modal   = document.getElementById('stats-modal');
    const gridEl  = document.getElementById('stats-grid');
    if (!modal || !gridEl) return;
    gridEl.innerHTML = STAT_DEFS.map(s => `
      <div class="stat-card">
        <div class="stat-icon">${s.icon}</div>
        <div class="stat-value">${s.getValue().toLocaleString()}</div>
        <div class="stat-label">${s.label}</div>
      </div>`).join('');
    modal.classList.remove('hidden');
  };

  const hideStats = () => document.getElementById('stats-modal')?.classList.add('hidden');

  document.getElementById('stats-btn')?.addEventListener('click', showStats);
  document.getElementById('stats-close')?.addEventListener('click', e => { e.stopPropagation(); hideStats(); });
  document.getElementById('stats-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('stats-modal')) hideStats();
  });

  const CEREMONY_EMOJIS = ['🍎','🌟','✨','🎉','🌿','🍃','⭐','🥂'];
  const UNLOCK_LABELS = {
    cabin: '🏠 Cider Cabin', distillery: '🫧 Distillery', brewery: '🍻 Brewery',
    roastery: '☕ Roastery', press: '🍎 Cider Press', fermenter: '🪣 Fermenter',
    bottling: '🍶 Bottling Station', still: '🫧 Copper Still', barrel: '🛢️ Aging Barrel',
    brew_kettle: '🍺 Brew Kettle', roaster: '🔥 Roaster', coffee_crop: '🫘 Coffee Crop',
    hops_crop: '🌾 Hops Crop',
  };
  const RESOURCE_ICONS = {
    fruit: '🍎', juice: '🧃', cider: '🫗', bottles: '🍾', hops: '🌾',
    applejack: '🥃', whiskey: '🪣', fruit_beer: '🍺',
    coffee_bean: '🫘', roasted_coffee: '🤎', cups: '☕',
  };
  const RESOURCE_NAMES = {
    fruit: 'Apples', juice: 'Juice', cider: 'Cider', bottles: 'Bottles', hops: 'Hops',
    applejack: 'Applejack', whiskey: 'Whiskey', fruit_beer: 'Fruit Beer',
    coffee_bean: 'Coffee Beans', roasted_coffee: 'Roasted Coffee', cups: 'Cups',
  };

  const showTierCeremony = (tier, tierDef) => {
    const el         = document.getElementById('tier-ceremony');
    const iconEl     = document.getElementById('tier-ceremony-icon');
    const nameEl     = document.getElementById('tier-ceremony-name');
    const descEl     = document.getElementById('tier-ceremony-desc');
    const unlocksEl  = document.getElementById('tier-ceremony-unlocks');
    const confettiEl = document.getElementById('tier-ceremony-confetti');
    if (!el) return;

    iconEl.textContent = tierDef.icon;
    nameEl.textContent = tierDef.name;

    descEl.innerHTML = `
      <div class="ceremony-section-label">🎯 Your Goal</div>
      <div class="ceremony-section-text">${tierDef.description}</div>`;

    const chips = tierDef.unlocks
      .filter(u => UNLOCK_LABELS[u])
      .map(u => `<span class="ceremony-unlock-chip">${UNLOCK_LABELS[u]}</span>`)
      .join('');

    const nextTier = progressionData.tiers[tier + 1];
    const nextGoalHtml = nextTier
      ? `<div class="ceremony-next-goal">Next milestone — ${
          Object.entries(nextTier.unlockCondition)
            .map(([r, n]) => `${n} ${RESOURCE_ICONS[r] ?? ''} ${RESOURCE_NAMES[r] ?? r}`)
            .join(' & ')
        }</div>`
      : '';

    unlocksEl.innerHTML = `
      <div class="ceremony-section-label">📦 New Equipment</div>
      <div class="ceremony-chips">${chips || '<span style="color:#6a5040">All stations already built</span>'}</div>
      ${nextGoalHtml}`;

    // Burst confetti from center
    confettiEl.innerHTML = '';
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    for (let i = 0; i < 28; i++) {
      const p     = document.createElement('div');
      const angle = (Math.random() * Math.PI * 2);
      const dist  = 160 + Math.random() * 260;
      const tx    = Math.cos(angle) * dist;
      const ty    = Math.sin(angle) * dist - 80;
      p.className = 'ceremony-particle';
      p.textContent = CEREMONY_EMOJIS[i % CEREMONY_EMOJIS.length];
      p.style.left  = cx + 'px';
      p.style.top   = cy + 'px';
      p.style.setProperty('--tx',    tx + 'px');
      p.style.setProperty('--ty',    ty + 'px');
      p.style.setProperty('--rot',   (Math.random() * 720 - 360) + 'deg');
      p.style.setProperty('--dur',   (1.1 + Math.random() * 0.7) + 's');
      p.style.setProperty('--delay', (Math.random() * 0.25) + 's');
      confettiEl.appendChild(p);
    }

    el.classList.remove('hidden');
    bearBounce();

    const dismiss = () => {
      el.classList.add('hidden');
      confettiEl.innerHTML = '';
      el.removeEventListener('click', dismiss);
    };
    el.addEventListener('click', dismiss);
    setTimeout(dismiss, 5000);
  };

  const bearBounce = () => {
    document.querySelectorAll('.bear-img').forEach(el => {
      el.classList.remove('bear-bounce');
      void el.offsetWidth;
      el.classList.add('bear-bounce');
      el.addEventListener('animationend', () => el.classList.remove('bear-bounce'), { once: true });
    });
  };

  const actionMenu = new ActionMenu((tile, action) => {
    const result = tileGrid.performAction(tile, action, resources);
    if (result.success) {
      if (action === 'harvest') {
        audio.harvest();
        gameStats.harvests++;
        questSystem.increment('harvest');
        bearSpeak(BearDialogue.harvestReaction());
        bearBounce();
        setStatus('Harvested! 🍎 Plant a new seedling to keep the orchard growing.');
      } else if (action === 'plant') {
        audio.plant();
        setStatus('Apple tree planted! Water it to speed things up. 💧');
      } else if (action === 'plant_tree') {
        audio.plantTree();
        bearSpeak('🌲 Timber tree planted! Grows slower than apples but yields renewable wood. 🪵');
        setStatus('Timber tree planted — harvest in ~45 seconds for 4 🪵.');
      } else if (action === 'water') {
        audio.water();
        setStatus('Watered! Crops will grow faster. 💧');
      } else if (action === 'clear') {
        audio.clear();
        questSystem.increment('clear');
        setStatus('Cleared! New tiles unlocked nearby. 🌿');
      } else if (action === 'dig') {
        audio.dig();
        setStatus('Dug up — +3 🪨 stone!');
      } else if (action === 'mine') {
        audio.mineStart();
        setStatus('Mining started — check back in 15 seconds. ⛏️');
      } else if (action === 'compost') {
        audio.compost();
        bearSpeak('🍂 Composted — starts fresh! Next time, harvest before they turn.');
        setStatus('🍂 Rotted apple composted. Growing again from scratch.');
      } else if (action === 'clear' && (tile.state === 'planted' || tile.state === 'harvestable' || tile.state === 'mine_shaft')) {
        audio.uproot();
        setStatus('Removed — tile returned to soil.');
      } else {
        setStatus('Action complete! Keep going 🌿');
      }
    } else {
      setStatus('⚠ ' + result.message);
      bearSpeak(result.message);
    }
  });

  const scenes = new SceneManager();

  const showHowToPlayModal = () => {
    menuOverlay.classList.remove('hidden');
    renderHowToPlay(() => {
      menuOverlay.classList.add('hidden');
      menuContainer.innerHTML = '';
    });
  };

  const orchard = new OrchardScene({
    tileGrid, resources, actionMenu, statusEl,
    bearEl:   document.getElementById('bear-sprite'),
    speechEl: document.getElementById('bear-speech'),
    showHowToPlay: showHowToPlayModal,
  });

  const storeSystem  = new StoreSystem(resources);
  const marketSystem = new MarketSystem(resources);

  const isAutomatedFn = id => storeSystem.isAutomated(id);
  const cabin      = new CabinScene({ construction, crafting, resources, statusEl, bearSpeakFn: bearSpeak, isAutomatedFn });
  const distillery = new DistilleryScene({ construction, crafting, resources, statusEl, bearSpeakFn: bearSpeak, isAutomatedFn });
  const brewery    = new BreweryScene({ construction, crafting, resources, statusEl, bearSpeakFn: bearSpeak, isAutomatedFn });
  const roastery   = new RoasteryScene({ construction, crafting, resources, statusEl, bearSpeakFn: bearSpeak, isAutomatedFn });

  storeSystem.onChange(evt => {
    if (evt.type === 'sell')    { audio.sell(); gameStats.itemsSold += evt.amount; questSystem.increment('sell_coins', evt.coins); }
    if (evt.type === 'upgrade') gameStats.upgradesBought++;
    if (evt.type === 'land') {
      tileGrid.unlockZone(evt.zone);
      bearSpeak(`🌿 New land opened! Head to the orchard to start clearing.`);
      setStatus(`🌿 ${evt.zone === 'south_west' ? 'Hop Fields' : 'Coffee Grove'} unlocked — new tiles ready to clear!`);
    }
  });

  marketSystem.onChange(evt => {
    if (evt.type === 'market_upgrade') {
      audio.marketUpgrade();
      storeSystem.setPriceMultiplier(marketSystem.priceMultiplier);
      bearSpeak(`${evt.def.icon} ${evt.def.name} unlocked! Your market is growing. 🎉`);
      setStatus(`Market upgraded to ${evt.def.name}!`);
    }
    if (evt.type === 'deal_warning') {
      bearSpeak(`📦 Heads up — ${evt.def.name} expects ${evt.def.quantity} ${evt.def.productIcon} tomorrow. Make sure you're stocked!`);
      setStatus(`⚠ Deal reminder: ${evt.def.name} shipment due tomorrow.`);
    }
    if (evt.type === 'deal_fulfilled') {
      bearSpeak(`✅ Shipped ${evt.def.quantity} ${evt.def.productIcon} to ${evt.def.name} — +${evt.coins} 🪙!`);
      setStatus(`Deal fulfilled: ${evt.def.name} paid ${evt.coins} 🪙.`);
    }
    if (evt.type === 'deal_missed') {
      bearSpeak(`😬 Missed the ${evt.def.name} shipment. Deal paused 14 days — or settle for ${evt.buyoutCost} 🪙 to keep it going.`);
      setStatus(`⚠ Missed shipment to ${evt.def.name}. Deal paused — check the Market.`);
      scenes.setBadge('store', '⚠');
    }
    if (evt.type === 'deal_cancelled_permanent') {
      bearSpeak(`💔 ${evt.def.name} cancelled the deal after two missed shipments.`);
      setStatus(`Deal with ${evt.def.name} permanently cancelled.`);
    }
    if (evt.type === 'deal_reactivated') {
      bearSpeak(`📋 Deal with ${evt.def.name} is back on — next shipment coming up.`);
      setStatus(`Deal with ${evt.def.name} reactivated.`);
    }
    if (evt.type === 'deal_buyout') {
      bearSpeak(`💰 Settled with ${evt.def.name} for ${evt.cost} 🪙 — deal reinstated!`);
      setStatus(`Deal with ${evt.def.name} reinstated.`);
    }
  });

  crafting.setStore(storeSystem);

  const questSystem = new QuestSystem(resources);
  const questsBadgeEl = document.getElementById('quests-badge');

  const syncQuestsBadge = () => {
    if (questsBadgeEl) questsBadgeEl.classList.toggle('hidden', !questSystem.hasUnclaimed());
  };

  const renderQuestModal = () => {
    const listEl = document.getElementById('quests-list');
    if (!listEl) return;
    listEl.innerHTML = questSystem.getActive().map(q => {
      const pct     = Math.min(100, Math.round((q.progress / q.target) * 100));
      const done    = q.progress >= q.target;
      const cls     = q.claimed ? 'quest-claimed' : done ? 'quest-done' : '';
      const bottom  = q.claimed
        ? `<span class="quest-claimed-label">✅ Claimed +${q.reward} 🪙</span>`
        : done
          ? `<button class="quest-claim-btn" data-quest-id="${q.id}">Claim ${q.reward} 🪙</button>`
          : `<span class="quest-count">${q.progress} / ${q.target}</span>`;
      return `<div class="quest-card ${cls}">
        <div class="quest-top">
          <span class="quest-icon">${q.icon}</span>
          <span class="quest-label">${q.label}</span>
          <span class="quest-reward">+${q.reward} 🪙</span>
        </div>
        <div class="quest-bar-wrap"><div class="quest-bar-fill" style="width:${pct}%"></div></div>
        <div class="quest-bottom">${bottom}</div>
      </div>`;
    }).join('');

    listEl.querySelectorAll('.quest-claim-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const result = questSystem.claimReward(btn.dataset.questId);
        if (result.success) {
          audio.questClaim();
          bearSpeak(`+${result.reward} 🪙 Quest reward claimed!`);
          bearBounce();
          renderQuestModal();
          syncQuestsBadge();
        }
      });
    });
  };

  const showQuests = () => {
    renderQuestModal();
    document.getElementById('quests-modal')?.classList.remove('hidden');
  };
  const hideQuests = () => document.getElementById('quests-modal')?.classList.add('hidden');

  document.getElementById('quests-btn')?.addEventListener('click', showQuests);
  document.getElementById('quests-close')?.addEventListener('click', e => { e.stopPropagation(); hideQuests(); });
  document.getElementById('quests-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('quests-modal')) hideQuests();
  });

  questSystem.onChange(evt => {
    if (evt.type === 'complete') {
      syncQuestsBadge();
      scenes.setBadge('orchard', '📋');
      bearSpeak('Quest complete! Open your daily quests to claim your reward. 📋');
    }
    if (evt.type === 'progress' || evt.type === 'rolled') syncQuestsBadge();
  });
  const store       = new StoreScene({
    store: storeSystem, market: marketSystem, resources, statusEl,
    bearSpeakFn: bearSpeak,
    getTier: () => gameState.tier,
    getDay:  () => gameState.day,
  });

  scenes.register(SCENES.ORCHARD,    orchard);
  scenes.register(SCENES.CABIN,      cabin);
  scenes.register(SCENES.DISTILLERY, distillery);
  scenes.register(SCENES.BREWERY,    brewery);
  scenes.register(SCENES.ROASTERY,   roastery);
  scenes.register(SCENES.STORE,      store);

  document.querySelectorAll('[data-scene-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!btn.disabled) scenes.switchTo(btn.dataset.sceneTarget);
    });
  });

  const SCENE_UNLOCK_MAP = { cabin:'nav-cabin', distillery:'nav-distillery', brewery:'nav-brewery', roastery:'nav-roastery', store:'nav-store' };
  const MARKET_BOTTLE_THRESHOLD = 3;
  let marketUnlocked = false;

  // Zones that auto-unlock with tiers 1–3; south_west/south_east are purchasable
  const TIER_ZONE_MAP = { 1: 'east', 2: 'north', 3: 'west' };

  function applyUnlocks(tier) {
    // Run cumulatively for all tiers up to current (safe to re-run on restore)
    for (let t = 0; t <= tier; t++) {
      const def = progressionData.tiers[t];
      if (!def) continue;
      for (const u of def.unlocks) {
        // Unlock scene nav button if applicable
        const btn = document.getElementById(SCENE_UNLOCK_MAP[u]);
        if (btn) btn.disabled = false;
        // Auto-build any tool that was unlocked — no resource cost, no timer
        construction.buildInstant(u);
      }
    }
    // Unlock auto zones up to current tier
    for (let t = 1; t <= tier; t++) {
      const zone = TIER_ZONE_MAP[t];
      if (zone) tileGrid.unlockZone(zone);
    }
    // Unlock any zones from purchased land expansions
    for (const zone of storeSystem.getUnlockedZones()) {
      tileGrid.unlockZone(zone);
    }
    const tierDef = progressionData.tiers[tier];
    if (!tierDef) return;
    hud.syncTier(tier);
    hud.updateResources(resources.amounts);
    hud.updateTier(`${tierDef.icon} ${tierDef.name}`);
    const badge = document.getElementById('tier-badge');
    if (badge) badge.textContent = `${tierDef.icon} ${tierDef.name}`;
  }

  // Central craft-complete handler — fires for all production scenes
  const STATION_SCENE = {
    press: 'cabin', fermenter: 'cabin', bottling: 'cabin', harvest_bell: 'cabin',
    still: 'distillery', barrel: 'distillery',
    brew_kettle: 'brewery',
    roaster: 'roastery', coffee_brewer: 'roastery',
  };

  crafting.onChange(evt => {
    if (evt.type !== 'done') return;
    audio.craftComplete();
    const isFirst = !gameState.firstCrafts.has(evt.recipeId);
    if (isFirst) {
      gameState.firstCrafts.add(evt.recipeId);
      if (evt.recipeId === 'bottle_cider') setTimeout(() => showStoryBear('first_cider'), 4000);
    }
    gameStats.crafts++;
    questSystem.increment('craft');
    bearSpeak(BearDialogue.craftComplete(evt.recipeId, isFirst));
    bearBounce();
    setStatus('Crafting complete!');
    const craftScene = STATION_SCENE[evt.stationId];
    if (craftScene) scenes.setBadge(craftScene, '✓');
    scenes.setBadge('store', '🛒');

    // Auto-restart: if this station is automated, immediately queue one more cycle
    if (storeSystem.isAutomated(evt.stationId)) {
      const recipes = crafting.recipesFor(evt.stationId);
      const next = recipes.find(r => resources.canAfford(r.inputs));
      if (next) crafting.craft(next.id, evt.stationId);
    }
  });

  progression.onChange(({ tier }) => {
    audio.tierUnlock();
    applyUnlocks(tier);
    gameState.tier = tier;
    crafting.setTier(tier);
    const lines   = BearDialogue.tierUnlock(tier);
    const tierDef = progressionData.tiers[tier];
    setStatus(lines.status);
    setTimeout(() => {
      showTierCeremony(tier, tierDef);
      bearSpeak(lines.bear);
      showStoryBear(`tier${tier}_unlock`);
    }, 600);
  });

  resources.onChange(amounts => {
    hud.updateResources(amounts);
    if (!marketUnlocked && (amounts.bottles ?? 0) >= MARKET_BOTTLE_THRESHOLD) {
      marketUnlocked = true;
      const btn = document.getElementById('nav-store');
      if (btn) btn.disabled = false;
      bearSpeak("The market's open! Take your bottles down and see what they fetch. I think we've earned it.");
      setStatus('🛒 Happy Bear Market unlocked — sell your cider!');
    }
  });

  let tickCount = 0;

  setInterval(() => {
    tickCount++;
    const { anyRipe: ripened, rotted } = cropSystem.tick();
    const mined   = tileGrid.completeMines(resources);

    // Always notify when a mine completes (even without auto)
    if (mined > 0) {
      audio.mineComplete();
      const stone = mined * 2;
      bearSpeak(`⛏️ Mine complete! +${stone} 🪨`);
      setStatus(`Mine yielded ${stone} stone. 🪨`);
    }

    // Warn when apples rot (manual mode — auto mode handles silently)
    if (!orchard.autoEnabled && rotted.length > 0) {
      audio.rot();
      bearSpeak(`🍂 ${rotted.length} apple${rotted.length > 1 ? 's' : ''} rotted! Harvest sooner next time.`);
      setStatus(`🍂 Apples rotted on ${rotted.length} tile${rotted.length > 1 ? 's' : ''} — tap to compost and replant.`);
    }

    if (orchard.autoEnabled) {
      tileGrid.autoWater(resources);
      // Delay mine restart so MINE_SHAFT state renders briefly before restarting
      setTimeout(() => tileGrid.autoMine(resources), 600);
      // Delay harvest so HARVESTABLE tiles (🍎) are visible before auto-collecting
      setTimeout(() => {
        const harvestedTiles = tileGrid.autoHarvest(resources);
        const harvested = harvestedTiles.length;
        if (harvested > 0) {
          audio.harvest();
          gameStats.harvests += harvested;
          questSystem.increment('harvest', harvested);
          harvestedTiles.forEach(({ x, y }) => orchard.popFloat(x, y, '🍎'));
          bearBounce();
          bearSpeak(`🌳 Auto-collected ${harvested} crop${harvested > 1 ? 's' : ''}!`);
          setStatus(`Auto-harvest: ${harvested} crop${harvested > 1 ? 's' : ''} collected. 🌳`);
        }
      }, 800);
    } else if (ripened) {
      bearSpeak(BearDialogue.cropsRipened());
      setStatus('Crops are ready — tap them to harvest! 🍎');
      scenes.setBadge('orchard', '🍎');
    }
    scenes.onTick(ripened);

    if (tickCount % TICKS_PER_DAY === 0) {
      audio.newDay();
      gameState.day++;
      hud.updateDay(gameState.day);
      progression.checkDay();
      marketSystem.onNewDay(gameState.day);
      questSystem.onNewDay(gameState.tier);
      bearSpeak(BearDialogue.contextualHint(resources.amounts, gameState.tier));
      setStatus(`Day ${gameState.day} begins — keep growing! 🌳`);
      scenes.onNewDay(gameState.day);
      autoSave();
    }
  }, GAME_TICK_MS);

  hud.updateResources(resources.amounts);
  hud.updateDay(gameState.day);

  orchard.init();
  cabin.init();
  distillery.init();
  brewery.init();
  roastery.init();
  store.init();

  // ── Restore saved state (must happen after scene inits so tools are registered) ──
  const sys = saveData?.systems;
  if (sys) {
    resources.restore(sys.resources);
    tileGrid.restore(sys.tiles);
    construction.restore(sys.construction);
    crafting.restore(sys.crafting ?? null);
    if (sys.tier !== undefined) {
      gameState.tier = sys.tier;
    }
    if (sys.firstCrafts) {
      sys.firstCrafts.forEach(id => gameState.firstCrafts.add(id));
    }
    if (sys.marketUnlocked) {
      marketUnlocked = true;
      const btn = document.getElementById('nav-store');
      if (btn) btn.disabled = false;
    }
    if (sys.autoEnabled) {
      orchard.autoEnabled = true;
      const autoBtn = document.getElementById('orchard-auto-btn');
      if (autoBtn) orchard._syncAutoBtn(autoBtn);
    }
    if (sys.upgrades) {
      storeSystem.restore(sys.upgrades);
    }
    if (sys.stats)  Object.assign(gameStats, sys.stats);
    if (sys.quests) questSystem.restore(sys.quests);
    else            questSystem.rollQuests(gameState.tier);
    if (sys.market) {
      marketSystem.restore(sys.market);
      storeSystem.setPriceMultiplier(marketSystem.priceMultiplier);
    }
  }

  applyUnlocks(gameState.tier);
  // Check for any tier unlocks that should fire immediately after save restore
  progression.checkDay();
  if (!sys) questSystem.rollQuests(gameState.tier);

  // ── Autosave helpers ──────────────────────────────────────────────────────
  function buildSnapshot() {
    return {
      day:          gameState.day,
      season:       'spring',
      cabinLevel:   1,
      orchardState: { tiles: [], zonesCleared: [], tilesCleared: 0 },
      inventory:    resources.snapshot(),
      systems: {
        resources:      resources.snapshot(),
        tiles:          tileGrid.snapshot(),
        construction:   construction.snapshot(),
        crafting:       crafting.snapshot(),
        tier:           gameState.tier,
        firstCrafts:    [...gameState.firstCrafts],
        marketUnlocked,
        autoEnabled:    orchard.autoEnabled,
        upgrades:       storeSystem.snapshot(),
        stats:          { ...gameStats },
        quests:         questSystem.snapshot(),
        market:         marketSystem.snapshot(),
      },
    };
  }

  function autoSave() {
    if (!slot) return;
    SaveSystem.saveGame(slot, buildSnapshot());
  }

  const profile    = ProfileSystem.getSelectedProfile();
  const playerName = profile?.playerName ?? 'friend';
  const isNewGame  = !saveData?.systems;
  const welcome    = BearDialogue.welcome(playerName, isNewGame);
  setStatus(welcome.status);
  setTimeout(() => {
    bearSpeak(welcome.bear);
    if (welcome.followUp) {
      setTimeout(() => bearSpeak(welcome.followUp.bear), welcome.followUp.delay);
    }
  }, 800);
}

// ── Boot ─────────────────────────────────────────────────────────────────────

async function boot() {
  await ProfileSystem.loadProfiles();
  const profiles = ProfileSystem.getAllProfiles();

  if (profiles.length === 0) {
    renderProfileCreate();
  } else {
    renderMainMenu();
  }
}

boot();
