/**
 * main.js — Happy Bear Cozy Orchard
 * Entry point. Shows main menu first, then boots all systems on save selection.
 */

import { ResourceManager }   from './src/systems/resources.js';
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

import { HUD }        from './src/ui/hud.js';
import { ActionMenu } from './src/ui/menus.js';

import progressionData from './src/data/progression.json';

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
  btns.push({ label: '⚙️ Settings',   primary: false, onClick: renderSettings });

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
  wrapper.innerHTML = `<div class="menu-bear">👤</div><h2 class="menu-title">Your Profiles</h2>`;

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

function renderSettings() {
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

  function slider(label, cat, key, min, max) {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex'; wrap.style.gap = '8px'; wrap.style.alignItems = 'center';
    const sl = document.createElement('input');
    sl.type = 'range'; sl.min = min; sl.max = max; sl.step = 0.05;
    sl.value = s[cat][key]; sl.className = 'settings-slider';
    const val = document.createElement('span');
    val.textContent = Math.round(s[cat][key] * 100) + '%';
    sl.addEventListener('input', () => {
      ProfileSystem.updateSetting(cat, key, parseFloat(sl.value));
      val.textContent = Math.round(sl.value * 100) + '%';
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
    slider('Music', 'audio', 'musicVolume', 0, 1),
    slider('SFX',   'audio', 'sfxVolume',   0, 1),
    slider('Ambient','audio','ambientVolume',0, 1)
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

  const back = document.createElement('button');
  back.className = 'menu-btn menu-btn-secondary';
  back.textContent = '← Back';
  back.addEventListener('click', renderMainMenu);
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
  const savedTier    = saveData?.systems?.tier ?? 0;
  const resources    = new ResourceManager();
  const tileGrid     = new TileGrid();
  const cropSystem   = new CropSystem(tileGrid);
  const crafting     = new CraftingSystem(resources, { tier: savedTier, day: 1, unlocks: new Set(['orchard']) });
  const construction = new ConstructionSystem(resources);
  const progression  = new ProgressionSystem({ tier: savedTier, day: 1, unlocks: new Set(['orchard']) }, resources);

  const gameState = { tier: 0, day: saveData?.day ?? 1, unlocks: new Set(['orchard']), firstCrafts: new Set() };

  const hud      = new HUD();
  const statusEl = document.getElementById('status-msg');

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

  const actionMenu = new ActionMenu((tile, action) => {
    const result = tileGrid.performAction(tile, action, resources);
    if (result.success) {
      if (action === 'harvest') {
        bearSpeak(BearDialogue.harvestReaction());
        setStatus('Harvested! 🍎 Plant a new seedling to keep the orchard growing.');
      } else {
        setStatus('Action complete! Keep going 🌿');
      }
    } else {
      setStatus('⚠ ' + result.message);
      bearSpeak(result.message);
    }
  });

  const scenes = new SceneManager();

  const orchard = new OrchardScene({
    tileGrid, resources, actionMenu, statusEl,
    bearEl:   document.getElementById('bear-sprite'),
    speechEl: document.getElementById('bear-speech'),
  });

  const cabin      = new CabinScene({ construction, crafting, resources, statusEl, bearSpeakFn: bearSpeak });
  const distillery = new DistilleryScene({ construction, crafting, resources, statusEl, bearSpeakFn: bearSpeak });
  const brewery    = new BreweryScene({ construction, crafting, resources, statusEl, bearSpeakFn: bearSpeak });
  const roastery   = new RoasteryScene({ construction, crafting, resources, statusEl, bearSpeakFn: bearSpeak });

  const storeSystem = new StoreSystem(resources);
  const store       = new StoreScene({
    store: storeSystem, resources, statusEl,
    bearSpeakFn: bearSpeak,
    getTier: () => gameState.tier,
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

  // Which orchard zone opens with each tier (cumulative — applyUnlocks re-runs all)
  const TIER_ZONE_MAP = { 1: 'east', 2: 'north', 3: 'west', 4: 'south' };

  function applyUnlocks(tier) {
    const tierDef = progressionData.tiers[tier];
    if (!tierDef) return;
    for (const u of tierDef.unlocks) {
      const btn = document.getElementById(SCENE_UNLOCK_MAP[u]);
      if (btn) btn.disabled = false;
    }
    // Unlock all orchard zones up to current tier (cumulative, safe to re-run)
    for (let t = 1; t <= tier; t++) {
      const zone = TIER_ZONE_MAP[t];
      if (zone) tileGrid.unlockZone(zone);
    }
    hud.syncTier(tier);
    hud.updateResources(resources.amounts);
    hud.updateTier(`${tierDef.icon} ${tierDef.name}`);
    const badge = document.getElementById('tier-badge');
    if (badge) badge.textContent = `${tierDef.icon} ${tierDef.name}`;
  }

  // Central craft-complete handler — fires for all production scenes
  crafting.onChange(evt => {
    if (evt.type !== 'done') return;
    const isFirst = !gameState.firstCrafts.has(evt.recipeId);
    if (isFirst) {
      gameState.firstCrafts.add(evt.recipeId);
      // Story Bear appears on the first cider bottled
      if (evt.recipeId === 'bottle_cider') setTimeout(() => showStoryBear('first_cider'), 4000);
    }
    bearSpeak(BearDialogue.craftComplete(evt.recipeId, isFirst));
    setStatus('Crafting complete!');
  });

  progression.onChange(({ tier }) => {
    applyUnlocks(tier);
    gameState.tier = tier;
    const lines = BearDialogue.tierUnlock(tier);
    bearSpeak(lines.bear);
    setStatus(lines.status);
    setTimeout(() => showStoryBear(`tier${tier}_unlock`), 5000);
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
  const TICK_MS       = 3000;
  const TICKS_PER_DAY = 10;

  setInterval(() => {
    tickCount++;
    const ripened = cropSystem.tick();
    tileGrid.completeMines(resources);

    if (orchard.autoEnabled) {
      tileGrid.autoWater(resources);
      tileGrid.autoMine(resources);
      // Delay harvest 800ms so HARVESTABLE tiles (🍎) are visible before auto-collecting
      setTimeout(() => {
        const harvested = tileGrid.autoHarvest(resources);
        if (harvested > 0) {
          bearSpeak(`🌳 Auto-collected ${harvested} crop${harvested > 1 ? 's' : ''}!`);
          setStatus(`Auto-harvest: ${harvested} crop${harvested > 1 ? 's' : ''} collected. 🌳`);
        }
      }, 800);
    } else if (ripened) {
      bearSpeak(BearDialogue.cropsRipened());
      setStatus('Crops are ready — head to the orchard!');
    }
    scenes.onTick(ripened);

    if (tickCount % TICKS_PER_DAY === 0) {
      gameState.day++;
      hud.updateDay(gameState.day);
      bearSpeak(BearDialogue.contextualHint(resources.amounts, gameState.tier));
      setStatus(`Day ${gameState.day} begins — keep growing! 🌳`);
      scenes.onNewDay(gameState.day);
      autoSave();
    }
  }, TICK_MS);

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
  }

  applyUnlocks(gameState.tier);

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
        tier:           gameState.tier,
        firstCrafts:    [...gameState.firstCrafts],
        marketUnlocked,
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
