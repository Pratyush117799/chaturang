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
    if (data.elo === undefined) data.elo = 100; // Default starting ELO

    if (solved && !data.solved.includes(puzzleId)) {
      data.solved.push(puzzleId);
      data.elo += Math.max(5, Math.floor((score || 10) / 10)); // Increase ELO on first solve

      // BUG #11 FIX: streak is a DAILY streak, not a per-puzzle counter.
      // Old code incremented streak whenever last solve was within 24h, so
      // solving 5 puzzles in one day gave a 5-day streak. Completely wrong.
      //
      // Correct rules:
      //   Same calendar day as last solve → already counted today, no increment
      //   Yesterday → consecutive day → increment streak
      //   2+ days ago or first ever solve → streak broken → reset to 1
      const now        = new Date();
      const todayStr   = now.toDateString();

      if (data.lastSolvedAt) {
        const lastDate     = new Date(data.lastSolvedAt);
        const lastStr      = lastDate.toDateString();
        const yesterday    = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastStr === todayStr) {
          // Already solved a puzzle today — streak unchanged, just save
        } else if (lastStr === yesterdayStr) {
          // Last solve was yesterday → consecutive → increment
          data.streak = (data.streak || 0) + 1;
        } else {
          // Gap of 2+ days → streak broken → restart
          data.streak = 1;
        }
      } else {
        // First ever puzzle solved
        data.streak = 1;
      }

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
    if (data.elo === undefined) data.elo = 100; // migrate older saves
    return {
      solved: (data.solved || []).length,
      streak: data.streak || 0,
      scores: data.scores || {},
      elo: data.elo || 100
    };
  }

  function isSolved(puzzleId) {
    const data = loadProgress();
    return (data.solved || []).includes(puzzleId);
  }

  return { loadPuzzle, validateMove, getHint, calculateScore, saveProgress, getTotalProgress, isSolved };
})();
