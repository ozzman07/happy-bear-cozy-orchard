import { ProfileSystem } from '../../systems/ProfileSystem.js';

function makeSlider(label, category, key, min, max, step, currentValue) {
  const row = document.createElement('div');
  row.className = 'settings-row';

  const lbl = document.createElement('label');
  lbl.className = 'settings-label';
  lbl.textContent = label;

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.value = currentValue;
  slider.className = 'settings-slider';

  const valueDisplay = document.createElement('span');
  valueDisplay.className = 'settings-value';
  valueDisplay.textContent = currentValue;

  slider.addEventListener('input', () => {
    const val = parseFloat(slider.value);
    valueDisplay.textContent = val;
    ProfileSystem.updateSetting(category, key, val);
  });

  row.appendChild(lbl);
  row.appendChild(slider);
  row.appendChild(valueDisplay);
  return row;
}

function makeToggle(label, category, key, currentValue) {
  const row = document.createElement('div');
  row.className = 'settings-row';

  const lbl = document.createElement('label');
  lbl.className = 'settings-label';
  lbl.textContent = label;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = currentValue;
  checkbox.className = 'settings-toggle';

  checkbox.addEventListener('change', () => {
    ProfileSystem.updateSetting(category, key, checkbox.checked);
  });

  row.appendChild(lbl);
  row.appendChild(checkbox);
  return row;
}

function makeSelect(label, category, key, options, currentValue) {
  const row = document.createElement('div');
  row.className = 'settings-row';

  const lbl = document.createElement('label');
  lbl.className = 'settings-label';
  lbl.textContent = label;

  const select = document.createElement('select');
  select.className = 'settings-select';

  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
    option.selected = opt === currentValue;
    select.appendChild(option);
  });

  select.addEventListener('change', () => {
    ProfileSystem.updateSetting(category, key, select.value);
  });

  row.appendChild(lbl);
  row.appendChild(select);
  return row;
}

export const SettingsScreen = {
  render(container, { onBack } = {}) {
    container.innerHTML = '';

    const profile = ProfileSystem.getSelectedProfile();
    const s = profile ? profile.settings : {
      gameplay: { textSpeed: 'normal', animationSpeed: 'normal', autosave: true, dayLength: 'normal', tutorialTips: true },
      audio: { musicVolume: 0.7, sfxVolume: 0.8, ambientVolume: 0.6 },
      video: { pixelScale: 2, fullscreen: false, uiScale: 'medium' },
      accessibility: { highContrast: false, reducedMotion: false, largeText: false, screenReaderHints: false }
    };

    const wrapper = document.createElement('div');
    wrapper.className = 'menu-screen settings-screen';

    const title = document.createElement('h2');
    title.className = 'menu-title';
    title.textContent = '⚙️ Settings';
    wrapper.appendChild(title);

    const sections = [
      {
        heading: 'Gameplay',
        controls: [
          makeSelect('Text Speed', 'gameplay', 'textSpeed', ['slow', 'normal', 'fast', 'instant'], s.gameplay.textSpeed),
          makeSelect('Animation Speed', 'gameplay', 'animationSpeed', ['slow', 'normal', 'fast'], s.gameplay.animationSpeed),
          makeSelect('Day Length', 'gameplay', 'dayLength', ['short', 'normal', 'long'], s.gameplay.dayLength),
          makeToggle('Autosave', 'gameplay', 'autosave', s.gameplay.autosave),
          makeToggle('Tutorial Tips', 'gameplay', 'tutorialTips', s.gameplay.tutorialTips)
        ]
      },
      {
        heading: 'Audio',
        controls: [
          makeSlider('Music Volume', 'audio', 'musicVolume', 0, 1, 0.05, s.audio.musicVolume),
          makeSlider('SFX Volume', 'audio', 'sfxVolume', 0, 1, 0.05, s.audio.sfxVolume),
          makeSlider('Ambient Volume', 'audio', 'ambientVolume', 0, 1, 0.05, s.audio.ambientVolume)
        ]
      },
      {
        heading: 'Video',
        controls: [
          makeSelect('Pixel Scale', 'video', 'pixelScale', ['1', '2', '3'], String(s.video.pixelScale)),
          makeSelect('UI Scale', 'video', 'uiScale', ['small', 'medium', 'large'], s.video.uiScale),
          makeToggle('Fullscreen', 'video', 'fullscreen', s.video.fullscreen)
        ]
      },
      {
        heading: 'Accessibility',
        controls: [
          makeToggle('High Contrast', 'accessibility', 'highContrast', s.accessibility.highContrast),
          makeToggle('Reduced Motion', 'accessibility', 'reducedMotion', s.accessibility.reducedMotion),
          makeToggle('Larger Text', 'accessibility', 'largeText', s.accessibility.largeText),
          makeToggle('Screen Reader Hints', 'accessibility', 'screenReaderHints', s.accessibility.screenReaderHints)
        ]
      }
    ];

    sections.forEach(({ heading, controls }) => {
      const section = document.createElement('div');
      section.className = 'settings-section';

      const h3 = document.createElement('h3');
      h3.className = 'settings-heading';
      h3.textContent = heading;
      section.appendChild(h3);

      controls.forEach(ctrl => section.appendChild(ctrl));
      wrapper.appendChild(section);
    });

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
