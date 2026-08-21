globalThis.ChaturangaPuzzleEngine = (function() {
  'use strict';

  // ── Local, backend-free persistence ─────────────────────────────────────
  // Progress used to be synced to `${API_BASE}/api/puzzles/progress/:uid`.
  // That's gone — everything now lives in localStorage on this browser.
  const STORAGE_PREFIX = 'chaturanga_puzzle_progress_';
  let userId = null;
  let cache = null; // { elo, streak, lastSolvedDate, solved: [...] }
  let ready = false;
  let Elo = 1200;

  function storageKey() {
    return STORAGE_PREFIX + (userId || 'guest');
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(storageKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.solved)) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('PuzzleEngine: failed to read local progress', err);
    }
    return { elo: 1200, streak: 0, lastSolvedDate: null, solved: [] };
  }

  function saveToStorage() {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(cache));
    } catch (err) {
      console.error('PuzzleEngine: failed to save local progress', err);
    }
  }

  function todayStr(d) {
    return (d || new Date()).toISOString().slice(0, 10);
  }

  function isYesterday(dateStr) {
    if (!dateStr) return false;
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return dateStr === todayStr(y);
  }

  async function init(uid) {
    userId = uid || 'guest';
    ready = false;
    cache = loadFromStorage();
    Elo = typeof cache.elo === 'number' ? cache.elo : 1200;
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
    if (!cache) cache = loadFromStorage();

    if (!isSolved(puzzleId)) {
      cache.solved.push(puzzleId);

      // Streak: bump once per calendar day, reset if a day was missed.
      const today = todayStr();
      if (cache.lastSolvedDate !== today) {
        cache.streak = isYesterday(cache.lastSolvedDate) ? (cache.streak || 0) + 1 : 1;
        cache.lastSolvedDate = today;
      }

      Elo = Math.max(0, Elo + (eloDelta || 0));
      cache.elo = Elo;
    }

    saveToStorage();
    return cache;
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

  return { init, isReady, loadPuzzle, validateMove, getHint, calculateScore, saveProgress, getTotalProgress, isSolved };
})();
