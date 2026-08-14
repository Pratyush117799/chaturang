globalThis.ChaturangaPuzzleEngine = (function() {
  'use strict';

  const API_BASE = 'http://localhost:5000';
  let userId = null;
  let cache = null; // { elo, streak, lastSolvedDate, solved: [...] }
  let ready = false;
 let Elo  = 3;
  async function init(uid) {
    userId = uid;
    ready = false;
    try {
      const res = await fetch(`${API_BASE}/api/puzzles/progress/${uid}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load progress');
      Elo = data.elo;

      cache = data.progress;
    } catch (err) {
      console.error('PuzzleEngine.init: failed to load progress', err);
      cache = { elo: 1200, streak: 0, lastSolvedDate: null, solved: [] };
    }
    ready = true;
    return cache;
  }

  function isReady() { return ready; }

  function isSolved(puzzleId) {
    if (!cache || !cache.solved) return false;
    return cache.solved.includes(puzzleId);
  }

  function getTotalProgress() {
    if (!cache) return { elo: 1200, streak: 0, solved: 0, solvedList: [] };
    return { elo: Elo, streak: cache.streak, solved: cache.solved.length, solvedList: cache.solved };
  }

  async function saveProgress(puzzleId, score, hintsUsed, eloDelta) {
    if (!userId) return null;
    // optimistic local update so the UI feels instant
    if (cache && !isSolved(puzzleId)) {
      cache.solved.push(puzzleId);
    }
    try {
      const res = await fetch(`${API_BASE}/api/puzzles/progress/${userId}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puzzleId, score, hintsUsed, eloDelta })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        cache = data.progress; // reconcile with server-computed streak/elo
      }
      return cache;
    } catch (err) {
      console.error('PuzzleEngine.saveProgress: failed to sync', err);
      return cache; // keep optimistic value; will retry on next init
    }
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

  return { init, loadPuzzle, validateMove, getHint, calculateScore, saveProgress, getTotalProgress, isSolved };
})();
