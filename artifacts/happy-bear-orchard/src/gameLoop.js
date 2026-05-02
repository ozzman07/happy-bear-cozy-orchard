export class GameLoop {
  constructor({ grid, ui, resources, tickMs = 3000 }) {
    this._grid       = grid;
    this._ui         = ui;
    this._resources  = resources;
    this._tickMs     = tickMs;
    this._day        = 1;
    this._tickCount  = 0;
    this._ticksPerDay = 10;
    this._intervalId = null;
    this._dayListeners = [];
  }

  get day() { return this._day; }

  start() {
    if (this._intervalId) return;
    this._intervalId = setInterval(() => this._tick(), this._tickMs);
  }

  stop() {
    clearInterval(this._intervalId);
    this._intervalId = null;
  }

  onNewDay(fn) {
    this._dayListeners.push(fn);
  }

  _tick() {
    this._tickCount++;

    const hadRipe = this._grid.tick();
    if (hadRipe) {
      this._ui.bearSpeak('Your crops are ready to harvest! 🍎');
      this._ui.setStatus('Some plants are ready to harvest — click them!');
    }

    if (this._tickCount % this._ticksPerDay === 0) {
      this._day++;
      this._ui.updateDay(this._day);
      this._ui.randomBearSpeak();
      this._dayListeners.forEach(fn => fn(this._day));
    }
  }
}
