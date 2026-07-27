'use strict';
var express = require('express');
var router = express.Router();
var db = require('../db/games');

router.post('/', function (req, res) {
  try {
    var r = db.saveGame(req.body || {});
    if (!r.ok) return res.status(400).json(r);
    res.json(r);
  } catch (e) {
    res.status(500).json({ ok: false, error: 'server error' });
  }
});

router.get('/', function (req, res) {
  try {
    var limit = parseInt(req.query.limit, 10);
    if (isNaN(limit)) limit = 50;
    res.json({ ok: true, games: db.listGames(limit) });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'server error' });
  }
});

router.get('/:id', function (req, res) {
  try {
    var g = db.getGame(req.params.id);
    if (!g) return res.status(404).json({ ok: false, error: 'not found' });
    res.json(g);
  } catch (e) {
    res.status(500).json({ ok: false, error: 'server error' });
  }
});

module.exports = router;
