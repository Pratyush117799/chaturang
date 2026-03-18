'use strict';

var express = require('express');
var cors = require('cors');
var path = require('path');
var schema = require('./db/schema');
var authRoutes = require('./routes/auth');
var gamesRoutes = require('./routes/games');

schema.init();

var app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);

app.use(express.static(path.join(__dirname, '..')));

app.get('/api/health', function (req, res) {
  res.json({ ok: true, version: '1.0.3' });
});

app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).json({ ok: false, error: 'server error' });
});

var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
  console.log('Chaturanga 1.0.3 server on port', PORT);
});
