// bridge.js — wraps all Android.* calls with existence checks
window.ChaturangaBridge = {

  // Called when a Raja is captured and game ends
  // winnerId: 0 or 1 (player index)
  gameOver: (winnerId, winnerName, turnCount, dharmaScore, captures) => {
    if (window.Android && typeof window.Android.onGameOver === 'function') {
      window.Android.onGameOver(winnerId, winnerName, turnCount, dharmaScore, captures);
    } else {
      console.log("Game Over (no bridge):", winnerId, winnerName, turnCount, dharmaScore, captures);
    }
  },

  // Called after every executed move
  moveExecuted: (fromSq, toSq, pieceType, capturedType) => {
    if (window.Android && typeof window.Android.onMoveExecuted === 'function') {
      window.Android.onMoveExecuted(fromSq, toSq, pieceType, capturedType ?? '');
    } else {
      console.log("Move Executed (no bridge):", fromSq, toSq, pieceType, capturedType);
    }
  },

  // Called after dice is rolled
  diceRolled: (face, pieceName) => {
    if (window.Android && typeof window.Android.onDiceRolled === 'function') {
      window.Android.onDiceRolled(face, pieceName);
    } else {
      console.log("Dice Rolled (no bridge):", face, pieceName);
    }
  },

  // Called when pawn reaches final rank
  pawnPromoted: (square) => {
    if (window.Android && typeof window.Android.onPawnPromoted === 'function') {
      window.Android.onPawnPromoted(square);
    } else {
      console.log("Pawn Promoted (no bridge):", square);
    }
  },

  // Called when a puzzle is solved
  puzzleSolved: (puzzleId, turnsUsed, hintsUsed) => {
    if (window.Android && typeof window.Android.onPuzzleSolved === 'function') {
      window.Android.onPuzzleSolved(puzzleId, turnsUsed, hintsUsed);
    } else {
      console.log("Puzzle Solved (no bridge):", puzzleId, turnsUsed, hintsUsed);
    }
  },

  // Called when a lesson step completes
  lessonStepComplete: (lessonId, stepIndex, totalSteps) => {
    if (window.Android && typeof window.Android.onLessonStepComplete === 'function') {
      window.Android.onLessonStepComplete(lessonId, stepIndex, totalSteps);
    } else {
      console.log("Lesson Step Complete (no bridge):", lessonId, stepIndex, totalSteps);
    }
  },

  // Called to request page title update (for pass-play prompt)
  requestPassDevice: (nextPlayerName) => {
    if (window.Android && typeof window.Android.onRequestPassDevice === 'function') {
      window.Android.onRequestPassDevice(nextPlayerName);
    } else {
      console.log("Request Pass Device (no bridge):", nextPlayerName);
    }
  },

  // Called when game is ready (board rendered, waiting for roll)
  gameReady: () => {
    if (window.Android && typeof window.Android.onGameReady === 'function') {
      window.Android.onGameReady();
    } else {
      console.log("Game Ready (no bridge)");
    }
  },

};
