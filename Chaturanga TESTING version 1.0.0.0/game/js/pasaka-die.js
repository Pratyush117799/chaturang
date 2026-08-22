/**
 * PasakaDie — Reusable 4-sided elongated Pāśaka die widget
 * Creates and animates the ivory-bone 3-D die to replace
 * the generic 🎲 emoji and fa-dice-d6 icon everywhere.
 *
 * Usage:
 *   const die = new PasakaDie(containerEl);
 *   die.setFace(3);         // Show face 3 instantly
 *   die.roll(callback);     // Animate roll, call callback(value) when done
 *   die.setValue(value);    // Just update displayed value
 *
 * The container element must have a fixed or relative position.
 */
(function (globalThis) {
  'use strict';

  /* Number of beads to render across each bead row */
  const BEAD_COUNT = 8;

  class PasakaDie {
    constructor(wrapEl, options = {}) {
      this.wrap = wrapEl;
      this.options = Object.assign({
        showResult: true,
        resultLabels: {
          1: 'Ratha only',
          2: 'Free Choice',
          3: 'Ashwa only',
          4: 'Danti only',
          5: 'Free Choice',
          6: 'Nara / Raja',
        }
      }, options);

      this._value = '?';
      this._rolling = false;
      this._buildDOM();
    }

    /* ── Build the die DOM structure ────────────────────────── */
    _buildDOM() {
      this.wrap.innerHTML = '';
      this.wrap.classList.add('pasaka-die-wrap');

      this.dieEl = document.createElement('div');
      this.dieEl.className = 'pasaka-die';

      const body = document.createElement('div');
      body.className = 'pasaka-die__body';

      const cap = document.createElement('div');
      cap.className = 'pasaka-die__cap';

      const beadsTop = this._makeBeads();
      beadsTop.classList.add('pasaka-die__beads-top');

      const beadsBot = this._makeBeads();
      beadsBot.classList.add('pasaka-die__beads-bot');

      const frame = document.createElement('div');
      frame.className = 'pasaka-die__frame';

      this.numEl = document.createElement('div');
      this.numEl.className = 'pasaka-die__number';
      this.numEl.textContent = this._value;

      body.appendChild(cap);
      body.appendChild(beadsTop);
      body.appendChild(beadsBot);
      body.appendChild(frame);
      body.appendChild(this.numEl);

      this.dieEl.appendChild(body);
      this.wrap.appendChild(this.dieEl);
    }

    _makeBeads() {
      const row = document.createElement('div');
      for (let i = 0; i < BEAD_COUNT; i++) {
        const b = document.createElement('span');
        b.className = 'pasaka-die__bead';
        row.appendChild(b);
      }
      return row;
    }

    /* ── Public API ─────────────────────────────────────────── */

    /** Set the displayed face number instantly (no animation) */
    setValue(v) {
      this._value = v;
      if (this.numEl) this.numEl.textContent = v;
    }

    /** Alias */
    setFace(v) { this.setValue(v); }

    /**
     * Animate the roll and then show value.
     * @param {number} finalValue  — the value to land on
     * @param {function} [cb]      — called when animation finishes
     */
    roll(finalValue, cb) {
      if (this._rolling) return;
      this._rolling = true;

      this.wrap.classList.remove('rolled');
      this.wrap.classList.add('rolling');

      let count = 0;
      const faces = [2, 3, 4, 5]; // 4-sided Pāśaka: values 2–5
      const interval = setInterval(() => {
        count++;
        const rnd = faces[Math.floor(Math.random() * faces.length)];
        if (this.numEl) this.numEl.textContent = rnd;
        if (count >= 9 || document.hidden) {
          clearInterval(interval);
          this.wrap.classList.remove('rolling');
          this.wrap.classList.add('rolled');
          if (this.numEl) this.numEl.textContent = finalValue ?? rnd;
          this._value = finalValue ?? rnd;
          this._rolling = false;
          setTimeout(() => this.wrap.classList.remove('rolled'), 1200);
          if (typeof cb === 'function') cb(this._value);
        }
      }, 75);
    }

    /** Get current displayed value */
    get value() { return this._value; }
  }

  /* Expose globally */
  globalThis.PasakaDie = PasakaDie;

  /**
   * makePasakaDieWidget(containerEl, options)
   * Convenience factory — builds the full widget with label,
   * die, result text, and roll button inside containerEl.
   *
   * Options:
   *   rollFn: function() -> number   called to get roll value
   *   onRoll: function(value)        called after animation
   *   btnLabel: string               default "Cast Pāśaka"
   *   resultLabels: {1..6: string}
   */
  globalThis.makePasakaDieWidget = function (containerEl, options = {}) {
    const rl = options.resultLabels || {
      1: 'Ratha only (Chariot)',
      2: 'Free Choice — any piece',
      3: 'Ashwa only (Knight)',
      4: 'Danti only (Elephant)',
      5: 'Free Choice — any piece',
      6: 'Nara or Raja (Pawn / King)',
    };

    containerEl.innerHTML = 
      <div class="pasaka-label">Pāśaka Casting (पासा)</div>
      <div class="pasaka-die-wrap" id="pasakaDieWrap3d"></div>
      <div class="pasaka-result" id="pasakaResult3d"></div>
      <div style="position:relative;display:inline-block;">
        <button type="button" class="pasaka-roll-btn" id="pasakaRollBtn3d">
          <span class="btn-die-icon"></span>
          
        </button>
        <div id="rollDiceArrow" style="display:none;position:absolute;bottom:115%;left:50%;transform:translateX(-50%);color:var(--gold-light);font-size:1.6rem;animation:bounceDown 1s infinite;z-index:10;pointer-events:none;">
          <i class="fa-solid fa-arrow-down"></i>
        </div>
      </div>
    ;

    const wrapEl   = containerEl.querySelector('#pasakaDieWrap3d');
    const resultEl = containerEl.querySelector('#pasakaResult3d');
    const btnEl    = containerEl.querySelector('#pasakaRollBtn3d');

    const die = new PasakaDie(wrapEl, { resultLabels: rl });
    die.setValue('?');

    btnEl.addEventListener('click', () => {
      if (die._rolling) return;
      btnEl.disabled = true;
      const rollFn  = typeof options.rollFn === 'function' ? options.rollFn : () => Math.floor(Math.random() * 4) + 1;
      const value   = rollFn();
      die.roll(value, (v) => {
        if (resultEl) resultEl.textContent = rl[v] || '';
        if (typeof options.onRoll === 'function') options.onRoll(v);
        setTimeout(() => { btnEl.disabled = false; }, 500);
      });
    });

    return { die, btn: btnEl, resultEl };
  };

})(globalThis);
