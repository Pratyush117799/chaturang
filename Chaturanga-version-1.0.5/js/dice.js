// Chaturanga v1.0.5 - Dice roll and four-dice display
globalThis.Dice = {
  roll(game, element, callback) {
    if (!element) return null;
    const rollBtn = document.getElementById('rollBtn');
    if (rollBtn) rollBtn.disabled = true;
    element.classList.add('dice-rolling');
    let rollCount = 0;
    let finalValue = null;
    
    // Quick completion logic
    const completeRoll = () => {
      finalValue = game.rollDice();
      element.textContent = finalValue;
      element.style.transform = 'rotateY(0deg)';
      element.classList.remove('dice-rolling');
      element.classList.add('dice-rolled');
      const forcedEl = document.getElementById('forcedPiece');
      if (forcedEl) {
        forcedEl.textContent = 'Forced: ' + this.getPieceName(game.forcedPiece);
        forcedEl.classList.add('forced-highlight');
        setTimeout(function() { forcedEl.classList.remove('forced-highlight'); }, 2000);
      }
      for (let i = 0; i < 4; i++) {
        const cell = document.getElementById('diceCell' + i);
        if (cell) {
          const face = cell.querySelector('.dice-cell-face');
          if (face) face.textContent = game.playerLastDice[i] ?? '—';
        }
      }
      if (rollBtn) setTimeout(function() { rollBtn.disabled = false; }, 500);
      setTimeout(function() { element.classList.remove('dice-rolled'); }, 1000);
      if (callback) callback();
    };

    if (document.hidden) {
      completeRoll();
      return finalValue ?? game.lastDice;
    }

    const animationInterval = setInterval(() => {
      rollCount++;
      const randomValue = Math.floor(Math.random() * 6) + 1;
      element.textContent = randomValue;
      element.style.transform = 'rotateY(' + (rollCount * 180) + 'deg)';
      if (rollCount >= 10 || document.hidden) {
        clearInterval(animationInterval);
        completeRoll();
      }
    }, 80);
    return finalValue ?? game.lastDice;
  },

  getPieceName(pieceType) {
    const names = {
      'rook': 'Ratha',
      'horse': 'Ashwa',
      'elephant': 'Danti',
      'pawn': 'Nara',
      'king': 'Raja',
      'pawn-king': 'Nara/Raja',
      'any': 'Any'
    };
    return names[pieceType] || (pieceType || '');
  }
};
