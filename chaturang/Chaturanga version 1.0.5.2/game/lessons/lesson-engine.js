globalThis.ChaturangaLessonEngine = (function() {
  'use strict';
  const STORAGE_KEY = 'chaturanga_lessons';

  let currentLesson = null;
  let currentStep   = 0;

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) { return {}; }
  }

  function startLesson(lesson) {
    currentLesson = lesson;
    currentStep   = 0;
    const saved   = loadProgress();
    if (saved.inProgress && saved.inProgress[lesson.id] != null) {
      currentStep = saved.inProgress[lesson.id];
    }
    return { lesson, currentStep };
  }

  function validatePlayerMove(from, to) {
    if (!currentLesson) return { valid: false, wrongMessage: 'No lesson loaded.' };
    const steps = currentLesson.steps;
    if (currentStep >= steps.length) return { valid: false, wrongMessage: 'Lesson already complete.' };
    const step = steps[currentStep];

    if (step.allowAnyMove) {
      return advanceStep();
    }
    if (!step.expectedMove) {
      return advanceStep();
    }
    if (step.expectedMove.from === from && step.expectedMove.to === to) {
      return advanceStep();
    }
    return {
      valid: false,
      stepComplete: false,
      wrongMessage: step.wrongMessage || 'Try again.'
    };
  }

  function advanceStep() {
    const step = currentLesson.steps[currentStep];
    currentStep++;
    const complete = currentStep >= currentLesson.steps.length;
    _saveInProgress();
    return {
      valid: true,
      stepComplete: true,
      complete,
      successMessage: step.successMessage || 'Well done!',
      moralLesson: complete ? currentLesson.moralLesson : null,
      badge: complete ? currentLesson.completionReward : null,
      nextStep: complete ? null : currentLesson.steps[currentStep]
    };
  }

  function _saveInProgress() {
    const data = loadProgress();
    if (!data.inProgress) data.inProgress = {};
    if (currentLesson) data.inProgress[currentLesson.id] = currentStep;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function saveProgress(lessonId, completed) {
    const data = loadProgress();
    if (!data.completed) data.completed = [];
    if (completed && !data.completed.includes(lessonId)) data.completed.push(lessonId);
    if (data.inProgress) delete data.inProgress[lessonId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function isCompleted(lessonId) {
    return (loadProgress().completed || []).includes(lessonId);
  }

  function getNextLesson(currentId) {
    const lessons = globalThis.ChaturangaLessonData || [];
    const idx     = lessons.findIndex(l => l.id === currentId);
    if (idx < 0 || idx >= lessons.length - 1) return null;
    return lessons[idx + 1];
  }

  function getUnlockedWisdom() {
    const data    = loadProgress();
    const done    = data.completed || [];
    const lessons = globalThis.ChaturangaLessonData || [];
    return lessons.filter(l => done.includes(l.id))
      .map(l => ({ title: l.title, source: l.culturalSource, lesson: l.moralLesson }));
  }

  function getCurrentStepData() {
    if (!currentLesson) return null;
    return currentLesson.steps[currentStep] || null;
  }

  return { startLesson, validatePlayerMove, saveProgress, isCompleted, getNextLesson, getUnlockedWisdom, getCurrentStepData, get currentStep() { return currentStep; } };
})();
