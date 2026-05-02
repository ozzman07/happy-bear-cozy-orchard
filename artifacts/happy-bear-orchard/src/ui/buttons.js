/**
 * Shared button helpers used across scenes.
 */

/**
 * Create a styled scene navigation button.
 * @param {string} label
 * @param {function} onClick
 * @param {string} [extraClass]
 */
export function makeNavButton(label, onClick, extraClass = '') {
  const btn     = document.createElement('button');
  btn.className = `scene-nav-btn ${extraClass}`.trim();
  btn.innerHTML = label;
  btn.addEventListener('click', onClick);
  return btn;
}

/**
 * Create a tool action button (used in cabin-style scenes).
 */
export function makeActionButton(label, onClick, disabled = false) {
  const btn     = document.createElement('button');
  btn.className = 'tool-action-btn';
  btn.innerHTML = label;
  btn.disabled  = disabled;
  if (!disabled) btn.addEventListener('click', onClick);
  return btn;
}
