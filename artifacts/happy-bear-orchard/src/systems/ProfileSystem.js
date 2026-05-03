const STORAGE_KEY = 'hbco_profiles';

let _profiles = [];
let _selectedProfile = null;

function generateId() {
  return 'profile_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeToStorage(profiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export const ProfileSystem = {
  async loadProfiles() {
    _profiles = readFromStorage();
    return _profiles;
  },

  async saveProfiles() {
    writeToStorage(_profiles);
  },

  async createProfile(name) {
    const profile = {
      id: generateId(),
      playerName: name.trim() || 'Happy Bear',
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      saveSlots: { slot1: null, slot2: null, slot3: null },
      settings: {
        gameplay: { textSpeed: 'normal', animationSpeed: 'normal', autosave: true, dayLength: 'normal', tutorialTips: true },
        audio: { musicVolume: 0.7, sfxVolume: 0.8, ambientVolume: 0.6 },
        video: { pixelScale: 2, fullscreen: false, uiScale: 'medium' },
        accessibility: { highContrast: false, reducedMotion: false, largeText: false, screenReaderHints: false }
      },
      achievements: {},
      progressionFlags: {}
    };

    _profiles.push(profile);
    writeToStorage(_profiles);
    _selectedProfile = profile;
    return profile;
  },

  async selectProfile(id) {
    const profile = _profiles.find(p => p.id === id) || null;
    if (profile) {
      profile.lastPlayed = new Date().toISOString();
      _selectedProfile = profile;
      writeToStorage(_profiles);
    }
    return profile;
  },

  getSelectedProfile() {
    return _selectedProfile;
  },

  getAllProfiles() {
    return _profiles;
  },

  async deleteProfile(id) {
    _profiles = _profiles.filter(p => p.id !== id);
    if (_selectedProfile && _selectedProfile.id === id) {
      _selectedProfile = null;
    }
    writeToStorage(_profiles);
  },

  updateSetting(category, key, value) {
    if (!_selectedProfile) return;
    if (!_selectedProfile.settings[category]) return;
    _selectedProfile.settings[category][key] = value;
    writeToStorage(_profiles);
  },

  setProgressionFlag(flagId, value = true) {
    if (!_selectedProfile) return;
    _selectedProfile.progressionFlags[flagId] = value;
    writeToStorage(_profiles);
  },

  unlockAchievement(achievementId) {
    if (!_selectedProfile) return;
    if (_selectedProfile.achievements[achievementId]?.unlocked) return;
    _selectedProfile.achievements[achievementId] = {
      unlocked: true,
      unlockedAt: new Date().toISOString()
    };
    writeToStorage(_profiles);
  }
};
