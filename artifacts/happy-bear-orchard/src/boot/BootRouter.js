import { ProfileSystem } from '../systems/ProfileSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';

let _onGameStart = null;

export const BootRouter = {
  async boot(onGameStart) {
    _onGameStart = onGameStart;
    const profiles = await ProfileSystem.loadProfiles();

    if (profiles.length === 0) {
      return { route: 'profile-create' };
    }

    return { route: 'main-menu' };
  },

  async startGameWithProfile(profileId, slot) {
    const profile = await ProfileSystem.selectProfile(profileId);
    if (!profile) {
      console.error(`[BootRouter] Profile not found: ${profileId}`);
      return;
    }

    const saveData = await SaveSystem.loadSave(slot);

    if (typeof _onGameStart === 'function') {
      _onGameStart({ profile, saveData, slot });
    }
  }
};
