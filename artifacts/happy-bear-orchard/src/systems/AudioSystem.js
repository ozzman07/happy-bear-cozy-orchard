/**
 * AudioSystem — procedural sound effects via Web Audio API.
 * No audio files needed; all sounds are synthesised.
 * AudioContext is created lazily on first play (requires a user gesture).
 */
export class AudioSystem {
  constructor() {
    this._ctx        = null;
    this._master     = null;
    this._sfxVol     = 0.7;
    this._enabled    = true;
  }

  // ── Volume & enable ────────────────────────────────────────────────────────

  setSfxVolume(v) {
    this._sfxVol = Math.max(0, Math.min(1, v));
    if (this._master) this._master.gain.value = this._sfxVol;
  }

  setEnabled(v) { this._enabled = v; }

  // ── Context bootstrap ──────────────────────────────────────────────────────

  _ctx_() {
    if (!this._ctx) {
      this._ctx    = new AudioContext();
      this._master = this._ctx.createGain();
      this._master.gain.value = this._sfxVol;
      this._master.connect(this._ctx.destination);
    }
    if (this._ctx.state === 'suspended') this._ctx.resume();
    return this._ctx;
  }

  // ── Synthesis primitives ───────────────────────────────────────────────────

  _tone(freq, dur, type = 'sine', peak = 0.28, attackT = 0.008) {
    if (!this._enabled || this._sfxVol === 0) return;
    const ctx  = this._ctx_();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this._master);
    osc.type = type;
    osc.frequency.value = freq;
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + attackT);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  _sweep(f0, f1, dur, type = 'sine', peak = 0.22) {
    if (!this._enabled || this._sfxVol === 0) return;
    const ctx  = this._ctx_();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(this._master);
    osc.type = type;
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(f0, now);
    osc.frequency.exponentialRampToValueAtTime(f1, now + dur);
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  _noise(dur, cutoff = 600, peak = 0.25) {
    if (!this._enabled || this._sfxVol === 0) return;
    const ctx      = this._ctx_();
    const sr       = ctx.sampleRate;
    const buf      = ctx.createBuffer(1, Math.ceil(sr * dur), sr);
    const data     = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src    = ctx.createBufferSource();
    src.buffer   = buf;
    const filt   = ctx.createBiquadFilter();
    filt.type    = 'lowpass';
    filt.frequency.value = cutoff;
    const gain   = ctx.createGain();
    const now    = ctx.currentTime;
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(filt);
    filt.connect(gain);
    gain.connect(this._master);
    src.start(now);
  }

  // Schedules a sequence of tones with a fixed delay between each.
  _seq(notes, gap = 90) {
    notes.forEach(([freq, dur, type, peak], i) => {
      setTimeout(() => this._tone(freq, dur, type ?? 'sine', peak ?? 0.24), i * gap);
    });
  }

  // ── Sound effects ──────────────────────────────────────────────────────────

  harvest() {
    // Soft two-note ascending ding — rewarding
    this._tone(660, 0.09, 'sine', 0.22, 0.004);
    setTimeout(() => this._tone(990, 0.18, 'sine', 0.22, 0.004), 75);
  }

  plant() {
    // Earthy thud + soft tone
    this._noise(0.12, 300, 0.28);
    this._sweep(220, 110, 0.14, 'sine', 0.16);
  }

  plantTree() {
    // Deeper, woodier thud
    this._noise(0.16, 200, 0.30);
    this._sweep(180, 80, 0.18, 'sine', 0.18);
  }

  water() {
    // Two quick drips
    this._sweep(1600, 1000, 0.10, 'sine', 0.18);
    setTimeout(() => this._sweep(1800, 1100, 0.08, 'sine', 0.14), 110);
  }

  clear() {
    // Wood chop — sharp noise + low body
    this._noise(0.10, 700, 0.32);
    this._tone(160, 0.14, 'triangle', 0.18, 0.004);
  }

  dig() {
    // Rock scrape — higher noise + mid tone
    this._noise(0.12, 1200, 0.28);
    this._tone(280, 0.14, 'triangle', 0.16, 0.005);
  }

  mineStart() {
    // Metallic pick strike
    this._noise(0.06, 1400, 0.30);
    this._sweep(500, 220, 0.12, 'square', 0.14);
  }

  mineComplete() {
    // Satisfying stone clunk + low rumble
    this._noise(0.22, 400, 0.30);
    this._tone(100, 0.30, 'sine', 0.22, 0.012);
    setTimeout(() => this._tone(140, 0.20, 'sine', 0.14, 0.010), 60);
  }

  craftComplete() {
    // Ascending three-note chime — C5, E5, G5
    this._seq([[523, 0.28], [659, 0.28], [784, 0.35]], 90);
  }

  sell() {
    // Coin clink — two bright tones
    this._tone(1318, 0.07, 'sine', 0.20, 0.002);
    setTimeout(() => this._tone(1568, 0.12, 'sine', 0.18, 0.002), 55);
  }

  tierUnlock() {
    // Ascending fanfare — C5, E5, G5, C6
    this._seq([[523, 0.22], [659, 0.22], [784, 0.22], [1047, 0.40]], 100);
  }

  compost() {
    // Soft downward whomp
    this._sweep(350, 100, 0.22, 'sine', 0.18);
    this._noise(0.10, 250, 0.14);
  }

  rot() {
    // Two descending sad tones
    this._sweep(440, 280, 0.20, 'sine', 0.16);
    setTimeout(() => this._sweep(330, 180, 0.18, 'sine', 0.12), 120);
  }

  newDay() {
    // Gentle morning bell — two harmonics
    this._tone(880, 0.55, 'sine', 0.20, 0.006);
    setTimeout(() => this._tone(1108, 0.40, 'sine', 0.12, 0.006), 40);
  }

  uproot() {
    // Soft pull-out sound
    this._noise(0.10, 500, 0.20);
    this._sweep(300, 150, 0.16, 'sine', 0.14);
  }

  questClaim() {
    // Cheerful two-tone reward
    this._seq([[784, 0.18], [1047, 0.28]], 80);
  }

  marketUpgrade() {
    // Fanfare with extra flair
    this._seq([[523, 0.18], [659, 0.18], [784, 0.18], [880, 0.18], [1047, 0.38]], 85);
  }
}

// ── Music player ──────────────────────────────────────────────────────────────

const TRACKS = [
  'Blueberry Morning.mp3',
  'The Happy Pour.mp3',
  'Sunshine Sip.mp3',
  'Hand in Mine (From the creek to the porch) - A duet for lifelong partners.mp3',
  'Two Mugs, One Fire.mp3',
  'Campfire Pour.mp3',
  'Blueberry Moonlight.mp3',
  'Autumn Hug.mp3',
  'Wanderin\' Cider Creek.mp3',
  'Sip Slow.mp3',
];

export class MusicPlayer {
  constructor(baseUrl) {
    this._base    = baseUrl.replace(/\/$/, '');
    this._audio   = null;
    this._vol     = 0.5;
    this._started = false;
    this._order   = this._shuffle([...Array(TRACKS.length).keys()]);
    this._idx     = 0;
    this._shouldPlay = false;
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Called on first user gesture — browsers block autoplay before interaction.
  start() {
    if (this._started) return;
    this._started = true;
    this._shouldPlay = true;
    this._play(this._order[this._idx]);
  }

  _play(trackIdx) {
    if (this._audio) {
      this._audio.pause();
      this._audio.src = '';
    }
    const name = TRACKS[trackIdx];
    const src  = `${this._base}/music/${encodeURIComponent(name)}`;
    const el   = new Audio(src);
    el.volume  = this._vol;
    el.addEventListener('ended', () => this._next());
    el.addEventListener('error', () => this._next());   // skip bad track
    el.play().catch(() => {});
    this._audio = el;
  }

  _next() {
    this._idx = (this._idx + 1) % this._order.length;
    // Re-shuffle when we've gone through all tracks
    if (this._idx === 0) {
      this._order = this._shuffle([...Array(TRACKS.length).keys()]);
    }
    // Always play the next track immediately
    this._play(this._order[this._idx]);
  }

  setVolume(v) {
    this._vol = Math.max(0, Math.min(1, v));
    if (this._audio) this._audio.volume = this._vol;
  }

  resume() {
    if (this._shouldPlay && this._audio && this._audio.paused) {
      this._audio.play().catch(() => {});
    }
  }

  nowPlaying() {
    return TRACKS[this._order[this._idx]]?.replace('.mp3', '') ?? '';
  }
}
