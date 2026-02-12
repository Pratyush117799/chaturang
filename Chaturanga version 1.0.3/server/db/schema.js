var path = require('path');
var fs = require('fs');
var DB_DIR = path.join(__dirname, '..', '..', 'database');
var WINNERS_DIR = path.join(DB_DIR, 'winners');
var GAMES_FILE = path.join(DB_DIR, 'games.json');

function init() {
  try {
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    if (!fs.existsSync(WINNERS_DIR)) fs.mkdirSync(WINNERS_DIR, { recursive: true });
    if (!fs.existsSync(GAMES_FILE)) fs.writeFileSync(GAMES_FILE, '[]', 'utf8');
  } catch (e) {}
}

module.exports = {
  init: init,
  getGamesPath: function () { return GAMES_FILE; },
  getWinnersDir: function () { return WINNERS_DIR; }
};
