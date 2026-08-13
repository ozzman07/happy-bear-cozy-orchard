/**
 * BackupSystem — export/import all game data (every profile + save) as a
 * single JSON file, for manual backup and moving a save to another device.
 *
 * There's no way to autosave to a real file on iOS: Safari/WebKit (which
 * every iOS browser and installed PWA runs on) doesn't implement the File
 * System Access API, so silent background file writes aren't possible here.
 * This is a deliberate, user-triggered action only — a button, not a timer.
 */
const KEY_PREFIX = 'hbco_';

function collectAllData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(KEY_PREFIX)) data[key] = localStorage.getItem(key);
  }
  return data;
}

function backupFilename() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `happy-bear-orchard-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
}

export const BackupSystem = {
  /**
   * Export every profile + save as a downloadable JSON file. Uses the native
   * "Save As" picker when the browser supports it (desktop Chrome/Edge — lets
   * the player choose the exact folder and filename); falls back to a
   * standard triggered download everywhere else, including iOS, where that
   * picker API doesn't exist at all. Returns { success, message }.
   */
  async exportBackup() {
    const data = collectAllData();
    if (Object.keys(data).length === 0) {
      return { success: false, message: 'Nothing to back up yet.' };
    }
    const payload = {
      app: 'happy-bear-cozy-orchard',
      exportedAt: new Date().toISOString(),
      data,
    };
    const json = JSON.stringify(payload, null, 2);
    const name = backupFilename();

    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: name,
          types: [{ description: 'Happy Bear Orchard Backup', accept: { 'application/json': ['.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
        return { success: true, message: `Saved as ${name}.` };
      } catch (err) {
        if (err?.name === 'AbortError') return { success: false, message: 'Backup cancelled.' };
        // Any other failure (e.g. picker unsupported mid-flow) — fall through to download.
      }
    }

    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return { success: true, message: `Downloaded ${name}.` };
  },

  /**
   * Restore from a previously-exported backup File. Overwrites any hbco_*
   * localStorage keys present in the file; keys not present in the backup
   * are left untouched. Returns { success, message, count }.
   */
  async importBackup(file) {
    let text;
    try {
      text = await file.text();
    } catch {
      return { success: false, message: "Couldn't read that file." };
    }
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      return { success: false, message: "That file isn't valid JSON — couldn't read it as a backup." };
    }
    const data = payload?.data;
    const keys = data && typeof data === 'object' ? Object.keys(data).filter(k => k.startsWith(KEY_PREFIX)) : [];
    if (keys.length === 0) {
      return { success: false, message: "That doesn't look like a Happy Bear Orchard backup file." };
    }
    for (const key of keys) localStorage.setItem(key, data[key]);
    return { success: true, message: `Restored ${keys.length} item${keys.length === 1 ? '' : 's'}.`, count: keys.length };
  },
};
