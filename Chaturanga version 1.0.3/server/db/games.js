'use strict';
var fs = require('fs');
var path = require('path');
var schema = require('./schema');

function readGames() {
  try {
    var p = schema.getGamesPath();
    if (!fs.existsSync(p)) return [];
    var data = fs.readFileSync(p, 'utf8');
    var arr = JSON.parse(data);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    console.error('readGames error:', e.message);
    return [];
  }
}

function writeGames(games) {
  try {
    var p = schema.getGamesPath();
    fs.writeFileSync(p, JSON.stringify(games, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('writeGames error:', e.message);
    return false;
  }
}

function saveGame(payload) {
  if (!payload || typeof payload !== 'object') return { ok: false, error: 'invalid payload' };
  var history = payload.history;
  if (!Array.isArray(history)) return { ok: false, error: 'history required' };

  var games = readGames();
  var id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  var record = {
    id: id,
    history: history,
    winner: payload.winner == null ? undefined : payload.winner,
    winnerPlayerId: payload.winnerPlayerId,
    gameMode: payload.gameMode || 'local',
    players: payload.players,
    savedAt: new Date().toISOString()
  };
  games.push(record);
  if (!writeGames(games)) return { ok: false, error: 'write failed' };

  var winnersDir = schema.getWinnersDir();
  if (payload.winner != null && typeof payload.winner === 'number') {
    try {
      var teamDir = path.join(winnersDir, 'team' + (payload.winner + 1));
      if (!fs.existsSync(teamDir)) fs.mkdirSync(teamDir, { recursive: true });
      fs.writeFileSync(path.join(teamDir, id + '.json'), JSON.stringify(record, null, 2), 'utf8');
    } catch (e) {
      console.error('winner write error:', e.message);
    }
  }
  if (payload.winnerPlayerId != null) {
    try {
      var playerDir = path.join(winnersDir, 'player' + payload.winnerPlayerId);
      if (!fs.existsSync(playerDir)) fs.mkdirSync(playerDir, { recursive: true });
      fs.writeFileSync(path.join(playerDir, id + '.json'), JSON.stringify(record, null, 2), 'utf8');
    } catch (e) {
      console.error('winner player write error:', e.message);
    }
  }

  return { ok: true, id: id };
}

function getGame(id) {
  if (!id || typeof id !== 'string') return null;
  var games = readGames();
  for (var i = 0; i < games.length; i++) {
    if (games[i].id === id) return games[i];
  }
  return null;
}

function listGames(limit) {
  var games = readGames();
  var n = typeof limit === 'number' && limit > 0 ? Math.min(limit, games.length) : games.length;
  return games.slice(-n).reverse();
}

module.exports = { readGames: readGames, saveGame: saveGame, getGame: getGame, listGames: listGames };
