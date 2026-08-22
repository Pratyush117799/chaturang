// Chaturanga — Pāśaka 4-sided die driver (replaces generic d6 display)
globalThis.Dice = {
  roll(game, element, callback) {
    // 'element' is now the .pasaka-die div (id="diceFace")
    // The wrap for animation classes is its parent .pasaka-die-wrap (id="diceFaceWrap")
    const wrap   = document.getElementById('diceFaceWrap') || element;
    const numEl  = document.getElementById('diceFaceNumber')
                   || (element && element.querySelector('.pasaka-die__number'));
    const rollBtn = document.getElementById('rollBtn');
    if (rollBtn) rollBtn.disabled = true;

    let rollCount = 0;
    let finalValue = null;

    // ── Faces to shuffle through (4-sided Pāśaka shows 2–5) ──
    const faces = [2, 3, 4, 5];

    const completeRoll = () => {
      finalValue = game.rollDice();

      // Show the final number on the die face
      if (numEl) numEl.textContent = finalValue;

      // Update sidebar forced label
      const forcedEl = document.getElementById('forcedPiece');
      if (forcedEl) {
        forcedEl.textContent = 'Forced: ' + this.getPieceName(game.forcedPiece);
        forcedEl.classList.add('forced-highlight');
        setTimeout(() => forcedEl.classList.remove('forced-highlight'), 2000);
      }

      // Update per-player history cells
      for (let i = 0; i < 4; i++) {
        const cell = document.getElementById('diceCell' + i);
        if (cell) {
          const face = cell.querySelector('.dice-cell-face');
          if (face) face.textContent = game.playerLastDice[i] ?? '—';
        }
      }

      // Update focus overlay die if visible
      const focusNumEl = document.getElementById('focusDiceFaceNumber');
      const focusWrap  = document.getElementById('focusDiceFaceWrap');
      if (focusNumEl) focusNumEl.textContent = finalValue;
      if (focusWrap) {
        focusWrap.classList.remove('rolling');
        focusWrap.classList.add('rolled');
        setTimeout(() => focusWrap.classList.remove('rolled'), 1200);
      }

      // Clear animation states
      if (wrap) {
        wrap.classList.remove('rolling');
        wrap.classList.add('rolled');
        setTimeout(() => wrap.classList.remove('rolled'), 1200);
      }

      if (rollBtn) setTimeout(() => rollBtn.disabled = false, 500);
      if (callback) callback();
    };

    // Instant completion when tab is hidden
    if (document.hidden) {
      completeRoll();
      return finalValue ?? game.lastDice;
    }

    // Start the rolling animation on the wrapper
    if (wrap) wrap.classList.add('rolling');
    const focusWrapEl = document.getElementById('focusDiceFaceWrap');
    if (focusWrapEl) focusWrapEl.classList.add('rolling');

    const animationInterval = setInterval(() => {
      rollCount++;
      const rnd = faces[Math.floor(Math.random() * faces.length)];
      if (numEl) numEl.textContent = rnd;
      // Also update focus overlay during shuffle
      const fn = document.getElementById('focusDiceFaceNumber');
      if (fn) fn.textContent = rnd;

      if (rollCount >= 10 || document.hidden) {
        clearInterval(animationInterval);
        completeRoll();
      }
    }, 80);

    return finalValue ?? game.lastDice;
  },

  getPieceName(pieceType) {
    const names = {
      'rook':      'Ratha',
      'horse':     'Ashwa',
      'elephant':  'Danti',
      'pawn':      'Nara',
      'king':      'Raja',
      'pawn-king': 'Nara/Raja',
      'any':       'Any'
    };
    return names[pieceType] || (pieceType || '');
  }
};
