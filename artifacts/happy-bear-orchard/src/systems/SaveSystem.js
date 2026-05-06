import { ProfileSystem } from './ProfileSystem.js';

const STORAGE_PREFIX = 'hbco_save_';

function storageKey(profileId, slot) {
  return `${STORAGE_PREFIX}${profileId}_${slot}`;
}

function defaultSave(slot) {
  return {
    id: `save_${Date.now()}`,
    profileId: null,
    slot,
    orchardState: {
      tiles: [],
      zonesCleared: [],
      tilesCleared: 0
    },
    cabinLevel: 1,
    toolsUnlocked: {},
    zonesUnlocked: ['apple_grove'],
    inventory: {
      bottles: 0,
      cups:    0,
      wood:    10,
      stone:   5,
      fruit:   5
    },
    storyProgress: {
      currentAct: 1,
      eventsTriggered: [],
      eventsCompleted: []
    },
    season: 'spring',
    day: 1,
    happyBearState: {
      mood: 'excited',
      currentTask: null
    },
    timestamp: new Date().toISOString()
  };
}

function isValidSave(data) {
  if (!data || typeof data !== 'object') return false;
  if (data.empty === true) return false;
  const required = ['orchardState', 'cabinLevel', 'inventory', 'season', 'day', 'timestamp'];
  return required.every(k => k in data);
}

export const SaveSystem = {
  async loadSave(slot) {
    const profile = ProfileSystem.getSelectedProfile();
    if (!profile) return null;

    const key = storageKey(profile.id, slot);
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return isValidSave(data) ? data : null;
    } catch {
      return null;
    }
  },

  async saveGame(slot, data) {
    const profile = ProfileSystem.getSelectedProfile();
    if (!profile) return;

    const save = {
      ...data,
      profileId: profile.id,
      slot,
      timestamp: new Date().toISOString()
    };

    const key = storageKey(profile.id, slot);
    localStorage.setItem(key, JSON.stringify(save));

    profile.saveSlots[slot] = save.id;
  },

  async getAvailableSlots() {
    const profile = ProfileSystem.getSelectedProfile();
    if (!profile) return [];

    const slots = ['slot1', 'slot2', 'slot3'];
    const results = [];

    for (const slot of slots) {
      const key = storageKey(profile.id, slot);
      try {
        const raw = localStorage.getItem(key);
        const data = raw ? JSON.parse(raw) : null;
        results.push({
          slot,
          occupied: isValidSave(data),
          data: isValidSave(data) ? data : null
        });
      } catch {
        results.push({ slot, occupied: false, data: null });
      }
    }

    return results;
  },

  async getMostRecentSave() {
    const slots = await this.getAvailableSlots();
    const occupied = slots.filter(s => s.occupied && s.data);
    if (occupied.length === 0) return null;

    return occupied.reduce((latest, current) => {
      const latestTime = new Date(latest.data.timestamp).getTime();
      const currentTime = new Date(current.data.timestamp).getTime();
      return currentTime > latestTime ? current : latest;
    });
  },

  createNewSave(slot) {
    const profile = ProfileSystem.getSelectedProfile();
    const save = defaultSave(slot);
    if (profile) save.profileId = profile.id;
    return save;
  },

  async clearSlot(slot) {
    const profile = ProfileSystem.getSelectedProfile();
    if (!profile) return;
    const key = storageKey(profile.id, slot);
    localStorage.removeItem(key);
    profile.saveSlots[slot] = null;
  }
};
