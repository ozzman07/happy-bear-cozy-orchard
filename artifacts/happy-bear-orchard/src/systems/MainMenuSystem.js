import { BootRouter } from '../boot/BootRouter.js';

let _currentScreen = null;
let _listeners = [];

function emit(event, data) {
  _listeners.forEach(fn => fn(event, data));
}

export const MainMenuSystem = {
  onChange(fn) {
    _listeners.push(fn);
  },

  showMainMenu() {
    _currentScreen = 'main-menu';
    emit('screen-change', { screen: 'main-menu' });
  },

  onStartNewGame() {
    _currentScreen = 'save-select-new';
    emit('screen-change', { screen: 'save-select-new' });
  },

  onContinueGame(profileId) {
    BootRouter.startGameWithProfile(profileId, 'mostRecent');
  },

  onLoadGame() {
    _currentScreen = 'save-select-load';
    emit('screen-change', { screen: 'save-select-load' });
  },

  onOpenSettings() {
    _currentScreen = 'settings';
    emit('screen-change', { screen: 'settings' });
  },

  onOpenProfiles() {
    _currentScreen = 'profiles';
    emit('screen-change', { screen: 'profiles' });
  },

  onExitGame() {
    emit('exit-requested', {});
    if (window.close) window.close();
  },

  getCurrentScreen() {
    return _currentScreen;
  }
};
