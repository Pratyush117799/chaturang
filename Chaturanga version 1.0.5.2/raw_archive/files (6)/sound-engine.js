/**
 * sound-engine.js — Chaturanga v1.0.5.2
 * Full sound overhaul. Per-piece positional audio. Dice tumble. Carnatic chord.
 * Replace/extend the existing sound module in ui.js.
 * Usage: ChaturangaSound.play('move', { piece:'R' })
 *        ChaturangaSound.play('capture', { piece:'A' })
 *        ChaturangaSound.play('dice', { face: 4 })
 *        ChaturangaSound.play('check')
 *        ChaturangaSound.play('gameend', { winner: true })
 *        ChaturangaSound.play('promotion')
 *        ChaturangaSound.setMute(bool)
 */

const ChaturangaSound = (() => {
  let _ctx = null;
  let _muted = localStorage.getItem('chaturanga_muted') === 'true';

  function _getCtx() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  /* ── Master gain ── */
  function _masterGain() {
    const g = _getCtx().createGain();
    g.gain.value = 0.55;
    g.connect(_getCtx().destination);
    return g;
  }

  /* ── Basic oscillator ── */
  function _osc(type, freq, start, dur, gainVal, masterG, detune = 0) {
    const ctx = _getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (detune) o.detune.setValueAtTime(detune, start);
    g.gain.setValueAtTime(gainVal, start);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g);
    g.connect(masterG);
    o.start(start);
    o.stop(start + dur);
  }

  /* ── Noise burst (for dice tumble) ── */
  function _noise(dur, masterG) {
    const ctx = _getCtx();
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 800;
    f.Q.value = 0.5;
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    src.connect(f);
    f.connect(g);
    g.connect(masterG);
    src.start();
  }

  /* ── Sound definitions ── */
  const SOUNDS = {
    /* Ratha: deep slide — descending sawtooth portamento */
    move_R(ctx, t, m) {
      _osc('sawtooth', 220, t, 0.18, 0.4, m);
      _osc('sawtooth', 180, t + 0.06, 0.14, 0.25, m);
    },
    /* Ashwa: hollow clip-clop — two brief square pulses */
    move_A(ctx, t, m) {
      _osc('square', 380, t, 0.05, 0.35, m);
      _osc('square', 320, t + 0.08, 0.05, 0.3, m);
    },
    /* Danti: heavy thud — low sine boom */
    move_D(ctx, t, m) {
      _osc('sine', 90, t, 0.25, 0.6, m);
      _osc('triangle', 70, t + 0.02, 0.2, 0.35, m);
    },
    /* Nara: light tap — high triangle tick */
    move_N(ctx, t, m) {
      _osc('triangle', 600, t, 0.08, 0.3, m);
      _osc('triangle', 500, t + 0.03, 0.06, 0.2, m);
    },
    /* Raja: resonant tone — sine + overtone */
    move_K(ctx, t, m) {
      _osc('sine', 310, t, 0.35, 0.45, m);
      _osc('sine', 620, t, 0.3, 0.2, m);
      _osc('sine', 465, t + 0.05, 0.25, 0.15, m);
    },
    /* Generic move */
    move_(ctx, t, m) {
      _osc('triangle', 440, t, 0.12, 0.35, m);
    },

    /* Captures — louder, lower versions of piece sounds */
    capture_R(ctx, t, m) {
      _osc('sawtooth', 140, t, 0.3, 0.7, m);
      _osc('sawtooth', 110, t + 0.05, 0.22, 0.5, m);
    },
    capture_A(ctx, t, m) {
      _osc('square', 260, t, 0.08, 0.6, m);
      _osc('square', 210, t + 0.09, 0.07, 0.5, m);
      _osc('square', 180, t + 0.18, 0.06, 0.4, m);
    },
    capture_D(ctx, t, m) {
      _osc('sine', 60, t, 0.4, 0.8, m);
      _osc('sawtooth', 90, t, 0.35, 0.5, m);
    },
    capture_N(ctx, t, m) {
      _osc('triangle', 420, t, 0.12, 0.5, m);
      _osc('square', 350, t + 0.04, 0.08, 0.35, m);
    },
    capture_K(ctx, t, m) {
      // Raja captured = dramatic gong
      _osc('sine', 220, t, 0.6, 0.8, m);
      _osc('sine', 440, t, 0.5, 0.5, m);
      _osc('sine', 660, t, 0.4, 0.3, m);
      _osc('sawtooth', 110, t + 0.02, 0.4, 0.4, m);
    },
    capture_(ctx, t, m) {
      _osc('sawtooth', 180, t, 0.2, 0.55, m);
    },

    /* Check — tense rising pulse */
    check(ctx, t, m) {
      _osc('square', 440, t, 0.08, 0.5, m);
      _osc('square', 550, t + 0.1, 0.08, 0.5, m);
      _osc('square', 660, t + 0.2, 0.1, 0.6, m);
    },

    /* Promotion */
    promotion(ctx, t, m) {
      [523, 659, 784, 1047].forEach((f, i) => {
        _osc('sine', f, t + i * 0.07, 0.2, 0.45 - i * 0.05, m);
      });
    },

    /* Dice tumble then resolve */
    dice(ctx, t, m, opts) {
      // Tumble: rapid noise bursts
      for (let i = 0; i < 5; i++) {
        setTimeout(() => _noise(0.04, m), i * 60);
      }
      // Resolve: tone matching face
      const faceFreqs = { 1: 261, 2: 294, 3: 330, 4: 349, 5: 392, 6: 440 };
      const freq = faceFreqs[opts?.face] || 350;
      const resolveT = t + 0.32;
      _osc('sine', freq, resolveT, 0.25, 0.5, m);
      _osc('triangle', freq * 1.5, resolveT, 0.2, 0.3, m);
    },

    /* Game end — 3-note Carnatic resolution chord Sa-Ga-Pa */
    gameend(ctx, t, m, opts) {
      const isWin = opts?.winner;
      // Sa = 261.63 Hz (C4), Ga = 329.63 (E4), Pa = 392 (G4)
      // Loss: descend instead
      const freqs = isWin
        ? [261.63, 329.63, 392.00]
        : [392.00, 329.63, 261.63];

      freqs.forEach((f, i) => {
        const st = t + i * 0.18;
        _osc('sine', f, st, 0.7, 0.55 - i * 0.05, m);
        _osc('triangle', f * 2, st, 0.5, 0.2, m); // overtone shimmer
      });
      // Sustain final chord together
      freqs.forEach(f => {
        _osc('sine', f, t + 0.55, 1.0, 0.25, m);
      });
    },

    /* Forfeit */
    forfeit(ctx, t, m) {
      _osc('sawtooth', 220, t, 0.1, 0.4, m);
      _osc('sawtooth', 180, t + 0.12, 0.1, 0.35, m);
      _osc('sawtooth', 140, t + 0.24, 0.15, 0.3, m);
    },

    /* Unlock achievement */
    unlock(ctx, t, m) {
      [523, 659, 784, 1047, 1319].forEach((f, i) => {
        _osc('sine', f, t + i * 0.06, 0.15, 0.4, m);
        _osc('triangle', f, t + i * 0.06, 0.12, 0.2, m);
      });
    }
  };

  /* ── Public play ── */
  function play(event, opts = {}) {
    if (_muted) return;
    try {
      const ctx = _getCtx();
      const t = ctx.currentTime;
      const m = _masterGain();

      // Route to best matching sound
      const piece = opts.piece || '';
      const key = `${event}_${piece}`;
      const fn = SOUNDS[key] || SOUNDS[event] || SOUNDS[`${event}_`];
      if (fn) fn(ctx, t, m, opts);
    } catch (e) {
      console.warn('ChaturangaSound error:', e);
    }
  }

  function setMute(val) {
    _muted = val;
    localStorage.setItem('chaturanga_muted', val ? 'true' : 'false');
  }

  function getMuted() { return _muted; }

  /* ── Auto-hook into existing game events ── */
  window.addEventListener('chaturanga:move', e => {
    const { piece, capture, isCapture } = e.detail || {};
    play(capture || isCapture ? 'capture' : 'move', { piece });
  });
  window.addEventListener('chaturanga:check', () => play('check'));
  window.addEventListener('chaturanga:promotion', () => play('promotion'));
  window.addEventListener('chaturanga:dice', e => play('dice', { face: e.detail?.face }));
  window.addEventListener('chaturanga:gameend', e => {
    const { winner, localPlayerIdx } = e.detail || {};
    play('gameend', { winner: winner === localPlayerIdx });
  });
  window.addEventListener('chaturanga:forfeit', () => play('forfeit'));
  window.addEventListener('chaturanga:unlock', () => play('unlock'));

  return { play, setMute, getMuted };
})();
