import { ProfileSystem } from '../../systems/ProfileSystem.js';

export const ProfileScreen = {
  render(container, { onProfileSelected, onBack } = {}) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'menu-screen profile-screen';

    const title = document.createElement('h2');
    title.className = 'menu-title';
    title.textContent = '🐾 Your Profiles';
    wrapper.appendChild(title);

    const profiles = ProfileSystem.getAllProfiles();

    if (profiles.length > 0) {
      const list = document.createElement('ul');
      list.className = 'profile-list';

      profiles.forEach(profile => {
        const item = document.createElement('li');
        item.className = 'profile-card';

        const name = document.createElement('span');
        name.className = 'profile-name';
        name.textContent = profile.playerName;

        const meta = document.createElement('span');
        meta.className = 'profile-meta';
        const lastPlayed = new Date(profile.lastPlayed).toLocaleDateString();
        meta.textContent = `Last tended: ${lastPlayed}`;

        const selectBtn = document.createElement('button');
        selectBtn.className = 'menu-btn profile-select-btn';
        selectBtn.textContent = 'Select';
        selectBtn.addEventListener('click', async () => {
          await ProfileSystem.selectProfile(profile.id);
          if (typeof onProfileSelected === 'function') onProfileSelected(profile);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'menu-btn menu-btn-danger profile-delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', async () => {
          const confirmed = window.confirm(`Delete profile "${profile.playerName}"? This cannot be undone.`);
          if (confirmed) {
            await ProfileSystem.deleteProfile(profile.id);
            ProfileScreen.render(container, { onProfileSelected, onBack });
          }
        });

        item.appendChild(name);
        item.appendChild(meta);
        item.appendChild(selectBtn);
        item.appendChild(deleteBtn);
        list.appendChild(item);
      });

      wrapper.appendChild(list);
    }

    if (profiles.length < 4) {
      const createSection = document.createElement('div');
      createSection.className = 'profile-create-section';

      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'profile-name-input';
      input.placeholder = 'Enter your name…';
      input.maxLength = 20;

      const createBtn = document.createElement('button');
      createBtn.className = 'menu-btn';
      createBtn.textContent = '+ Create Profile';
      createBtn.addEventListener('click', async () => {
        const name = input.value.trim();
        if (!name) {
          input.focus();
          return;
        }
        const profile = await ProfileSystem.createProfile(name);
        if (typeof onProfileSelected === 'function') onProfileSelected(profile);
      });

      createSection.appendChild(input);
      createSection.appendChild(createBtn);
      wrapper.appendChild(createSection);
    }

    if (typeof onBack === 'function') {
      const backBtn = document.createElement('button');
      backBtn.className = 'menu-btn menu-btn-secondary';
      backBtn.textContent = '← Back';
      backBtn.addEventListener('click', onBack);
      wrapper.appendChild(backBtn);
    }

    container.appendChild(wrapper);
  },

  destroy(container) {
    container.innerHTML = '';
  }
};
