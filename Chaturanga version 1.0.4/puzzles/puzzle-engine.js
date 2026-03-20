globalThis.ChaturangaPuzzleEngine = (function() {
  'use strict';

  const STORAGE_KEY = 'chaturanga_puzzles';

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) { return {}; }
  }
  function saveProgress(puzzleId, score, solved) {
    const data = loadProgress();
    if (!data.solved) data.solved = [];
    if (!data.scores) data.scores = {};
    if (!data.streak) data.streak = 0;
    if (solved && !data.solved.includes(puzzleId)) {
      data.solved.push(puzzleId);
      const last = data.lastSolvedAt ? new Date(data.lastSolvedAt) : null;
      const now  = new Date();
      if (last && (now - last) < 86400000) data.streak++;
      else data.streak = (solved ? 1 : data.streak);
      data.lastSolvedAt = now.toISOString();
    }
    if (score !== undefined) data.scores[puzzleId] = Math.max(data.scores[puzzleId] || 0, score);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  }

  function loadPuzzle(puzzle) {
    return {
      puzzle,
      currentStep: 0,
      hintsUsed: 0,
      wrongAttempts: [0, 0],
      startTime: Date.now(),
      complete: false
    };
  }

  function validateMove(puzzleState, from, to) {
    const sol = puzzleState.puzzle.solution;
    const step = puzzleState.currentStep;
    if (step >= sol.length) return { correct: false, complete: true, hint: null };

    const expected = sol[step];
    if (from === expected.from && to === expected.to) {
      puzzleState.currentStep++;
      const complete = puzzleState.currentStep >= sol.length;
      return { correct: true, complete };
    } else {
      puzzleState.wrongAttempts[step] = (puzzleState.wrongAttempts[step] || 0) + 1;
      const hint = puzzleState.wrongAttempts[step] >= 2
        ? getHint(puzzleState)
        : null;
      return { correct: false, complete: false, hint };
    }
  }

  function getHint(puzzleState) {
    const step    = puzzleState.currentStep;
    const hints   = puzzleState.puzzle.hint;
    const hint    = hints && hints[step] ? hints[step] : 'Think about which piece to move.';
    puzzleState.hintsUsed++;
    return hint;
  }

  function calculateScore(puzzle, hintsUsed, timeSeconds, wrongAttempts) {
    let score = puzzle.rating;
    score -= (hintsUsed || 0) * 20;
    const allWrong = Array.isArray(wrongAttempts) ? wrongAttempts.reduce((a,b)=>a+b,0) : (wrongAttempts||0);
    score -= allWrong * 10;
    if (timeSeconds > 60) score -= (timeSeconds - 60) * 0.5;
    return Math.max(10, Math.round(score));
  }

  function getTotalProgress() {
    const data = loadProgress();
    return {
      solved: (data.solved || []).length,
      streak: data.streak || 0,
      scores: data.scores || {}
    };
  }

  function isSolved(puzzleId) {
    const data = loadProgress();
    return (data.solved || []).includes(puzzleId);
  }

  return { loadPuzzle, validateMove, getHint, calculateScore, saveProgress, getTotalProgress, isSolved };
})();
