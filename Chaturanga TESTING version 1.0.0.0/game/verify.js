const fs = require('node:fs');
const path = require('node:path');

const REQUIRED_FILES = [
  'game.html',
  'admin.html',
  'lessons.html',
  'puzzles.html',
  'tournament.html',
  'army_builder.html',
  'documentation_hub.html',
  'css/styles.css',
  'css/animations.css',
  'css/themes.css',
  'js/game.js',
  'js/ui.js',
  'js/dice.js',
  'js/ui-enhancements.js',
  'js/anticheat.js',
  'js/seer.js',
  'js/ws-client.js',
  'js/bot/advancedBots.js',
  'js/bot/tieredBots.js',
  'lessons/lesson-engine.js',
  'lessons/lesson-data.js',
  'puzzles/puzzle-engine.js',
  'puzzles/puzzle-data.js',
  'tournament/tournament-engine.js',
  'server-ws.js',
  'phase1_pretraining.py',
  'package.json'
];

function verifyProject() {
  console.log('--- Chaturanga Asset Verification ---');
  let missing = 0;

  for (const file of REQUIRED_FILES) {
    const fullPath = path.join(__dirname, file);
    try {
      fs.accessSync(fullPath, fs.constants.F_OK);
      console.log(`[OK]   ${file}`);
    } catch (err) {
      console.error(`[FAIL] Missing required file: ${file}`);
      console.error(`       Error details: ${err.message}`);
      missing++;
    }
  }

  console.log('-----------------------------------');
  if (missing === 0) {
    console.log('Verification Success: All components are present.');
    process.exit(0);
  } else {
    console.error(`Verification Failed: ${missing} file(s) missing.`);
    process.exit(1);
  }
}

verifyProject();
