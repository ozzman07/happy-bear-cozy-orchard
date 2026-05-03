import { MainMenuSystem } from '../../systems/MainMenuSystem.js';

export const MainMenuScreen = {
  render(container, { hasProfile = false, hasSave = false } = {}) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'menu-screen main-menu-screen';

    const title = document.createElement('h1');
    title.className = 'menu-title';
    title.textContent = '🐻 Happy Bear Cozy Orchard';
    wrapper.appendChild(title);

    const buttons = [
      {
        label: 'Continue',
        id: 'btn-continue',
        visible: hasProfile && hasSave,
        onClick: () => MainMenuSystem.onContinueGame()
      },
      {
        label: 'Start New Game',
        id: 'btn-new-game',
        visible: true,
        onClick: () => MainMenuSystem.onStartNewGame()
      },
      {
        label: 'Load Game',
        id: 'btn-load-game',
        visible: hasProfile && hasSave,
        onClick: () => MainMenuSystem.onLoadGame()
      },
      {
        label: 'Settings',
        id: 'btn-settings',
        visible: true,
        onClick: () => MainMenuSystem.onOpenSettings()
      },
      {
        label: 'Profiles',
        id: 'btn-profiles',
        visible: true,
        onClick: () => MainMenuSystem.onOpenProfiles()
      },
      {
        label: 'Credits',
        id: 'btn-credits',
        visible: true,
        onClick: () => {
          MainMenuSystem.onChange = MainMenuSystem.onChange;
          alert('Happy Bear Cozy Orchard\n\nCreated by Jim\nHappy Bear & Story Bear — original characters\nBuilt with AI-assisted development in Replit');
        }
      }
    ];

    const nav = document.createElement('nav');
    nav.className = 'menu-nav';

    buttons.forEach(({ label, id, visible, onClick }) => {
      if (!visible) return;
      const btn = document.createElement('button');
      btn.id = id;
      btn.className = 'menu-btn';
      btn.textContent = label;
      btn.addEventListener('click', onClick);
      nav.appendChild(btn);
    });

    wrapper.appendChild(nav);
    container.appendChild(wrapper);
  },

  destroy(container) {
    container.innerHTML = '';
  }
};
