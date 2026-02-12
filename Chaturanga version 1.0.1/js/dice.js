// Enhanced Dice Roll with Smooth Animation
window.Dice = {
  roll(game, element) {
    if (!element) return null;
    
    // Disable button during animation
    const rollBtn = document.getElementById('rollBtn');
    if (rollBtn) rollBtn.disabled = true;

    // Animate dice roll
    element.classList.add('dice-rolling');
    
    // Show random numbers during animation
    let rollCount = 0;
    let finalValue = null;
    
    const animationInterval = setInterval(() => {
      rollCount++;
      const randomValue = Math.floor(Math.random() * 6) + 1;
      element.textContent = randomValue;
      element.style.transform = `rotateY(${rollCount * 180}deg)`;
      
      if (rollCount >= 10) {
        clearInterval(animationInterval);
        
        // Get actual roll value
        finalValue = game.rollDice();
        element.textContent = finalValue;
        element.style.transform = 'rotateY(0deg)';
        element.classList.remove('dice-rolling');
        element.classList.add('dice-rolled');
        
        // Show piece type
        const forcedEl = document.getElementById('forcedPiece');
        if (forcedEl) {
          const pieceName = this.getPieceName(game.forcedPiece);
          forcedEl.textContent = `Forced: ${pieceName}`;
          forcedEl.classList.add('forced-highlight');
          setTimeout(() => forcedEl.classList.remove('forced-highlight'), 2000);
        }
        
        // Re-enable button
        if (rollBtn) {
          setTimeout(() => {
            rollBtn.disabled = false;
          }, 500);
        }
        
        // Remove rolled class after animation
        setTimeout(() => {
          element.classList.remove('dice-rolled');
        }, 1000);
      }
    }, 80);
    
    // Return the value that will be set (for immediate feedback)
    // The actual value will be set asynchronously
    return finalValue !== null ? finalValue : game.lastDice;
  },

  getPieceName(pieceType) {
    const names = {
      'rook': '♜ Rook',
      'horse': '♞ Horse',
      'elephant': '♝ Elephant',
      'pawn': '♟ Pawn',
      'king': '♚ King',
      'pawn-king': '♟/♚ Pawn or King',
      'any': 'Any Piece'
    };
    return names[pieceType] || pieceType;
  }
};
