/**
 * Chaturanga — Tournament Engine v1.0.5
 * Arena · Swiss · Round Robin · Bot Championship
 */
(function (G) {
  'use strict';

  const CHESS_ELO = {100:200,200:400,300:600,400:700,500:875,600:1050,700:1225,800:1400,900:1575,1000:1750};
  const BOT_NAMES  = {100:'Novice',200:'Greedy',300:'Tactical',400:'Strategic',500:'Deep Tactical',600:'Paranoid',700:'Grandmaster',800:'Maharaja',900:'Samrat',1000:'Chakravarti'};
  const BOT_ELOS   = [100,200,300,400,500,600,700,800,900,1000];
  const LS_KEY     = 'chaturanga_elo_leaderboard';

  // ── ELO Simulator ─────────────────────────────────────────────────────────
  function simulateGame(pA, pB) {
    const a = CHESS_ELO[pA.elo] || pA.elo || 800;
    const b = CHESS_ELO[pB.elo] || pB.elo || 800;
    const pWin = 1 / (1 + Math.pow(10, (b - a) / 400));
    const r = Math.random();
    if (r < pWin - 0.04)       return 'A';
    if (r < pWin + 0.04)       return 'D';
    return 'B';
  }

  function makePlayer(name, elo, isBot) {
    return { id: `${isBot?'bot':'human'}_${elo||Date.now()}_${Math.random().toString(36).slice(2,7)}`,
             name, elo: elo||0, isBot: !!isBot,
             score:0, wins:0, draws:0, losses:0 };
  }

  function makeBotPlayer(elo) { return makePlayer(BOT_NAMES[elo]||`ELO ${elo}`, elo, true); }
  function makeHumanPlayer(name, elo) { return makePlayer(name, elo||1200, false); }

  // ── Persistent ELO Leaderboard ─────────────────────────────────────────────
  const Leaderboard = {
    load() {
      try { return JSON.parse(localStorage.getItem(LS_KEY)||'{"players":{},"history":[]}'); }
      catch(e) { return {players:{},history:[]}; }
    },
    save(data) { try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch(e){} },
    recordTournament(format, standings) {
      const data = this.load();
      standings.forEach((p, i) => {
        if (p.isBot) return;
        if (!data.players[p.name]) data.players[p.name] = {elo:1200, wins:0, draws:0, losses:0, played:0};
        const entry = data.players[p.name];
        entry.played++;
        entry.wins   += p.wins   || 0;
        entry.draws  += p.draws  || 0;
        entry.losses += p.losses || 0;
        if (i === 0) entry.trophies = (entry.trophies||0)+1;
      });
      data.history.unshift({ date: new Date().toLocaleDateString(), format,
        winner: standings[0]?.name, count: standings.length });
      if (data.history.length > 20) data.history = data.history.slice(0,20);
      this.save(data);
    },
    getTopPlayers() {
      const data = this.load();
      return Object.entries(data.players)
        .map(([name, d]) => ({name, ...d}))
        .sort((a,b) => (b.trophies||0)-(a.trophies||0) || b.wins-a.wins);
    },
    getHistory() { return this.load().history; }
  };

  // ── Arena Engine ────────────────────────────────────────────────────────────
  class ArenaEngine {
    constructor(config) {
      this.duration   = (config.duration||10) * 60; // seconds
      this.players    = config.players.map(p => ({...p, score:0, wins:0, draws:0,
                          losses:0, streak:0, gamesPlayed:0, inGame:false, lastOpp:null}));
      this.games      = [];
      this.startTime  = null;
      this.active     = false;
      this._timers    = [];
      this.onGameDone = null;
      this.onTick     = null;
    }

    start() {
      this.startTime = Date.now();
      this.active    = true;
      this._tickInterval = setInterval(() => {
        if (this.onTick) this.onTick(this.timeRemaining());
        if (this.isOver()) this._end();
      }, 1000);
      this._pairAvailable();
    }

    stop() {
      this.active = false;
      clearInterval(this._tickInterval);
      this._timers.forEach(clearTimeout);
    }

    _end() {
      this.stop();
      Leaderboard.recordTournament('Arena', this.getLeaderboard());
    }

    timeRemaining() {
      if (!this.startTime) return this.duration;
      return Math.max(0, this.duration - Math.floor((Date.now()-this.startTime)/1000));
    }

    isOver() { return this.timeRemaining() === 0; }

    _available() { return this.players.filter(p => !p.inGame); }

    _pairAvailable() {
      if (!this.active || this.isOver()) return;
      const avail = this._available();
      avail.sort((a,b) => b.score - a.score);
      for (let i = 0; i+1 < avail.length; i += 2) {
        this._runGame(avail[i], avail[i+1]);
      }
    }

    _runGame(pA, pB) {
      pA.inGame = pB.inGame = true;
      const game = { id: Date.now()+Math.random(), pA: pA.id, pB: pB.id,
                     berserkA: false, berserkB: false, result: null, startTime: Date.now() };
      this.games.push(game);

      const delay = (pA.isBot && pB.isBot) ? (2000 + Math.random()*6000) : 0;
      const t = setTimeout(() => {
        if (!this.active) return;
        const r = simulateGame(pA, pB);
        game.result    = r;
        game.duration  = Math.floor((Date.now()-game.startTime)/1000);

        if (r==='A') {
          pA.streak++; pB.streak=0;
          const pts = (pA.streak>=2?4:2) + (game.berserkA?1:0);
          pA.score+=pts; pA.wins++;
          pB.losses++;
        } else if (r==='B') {
          pB.streak++; pA.streak=0;
          const pts = (pB.streak>=2?4:2) + (game.berserkB?1:0);
          pB.score+=pts; pB.wins++;
          pA.losses++;
        } else {
          pA.score+=1; pB.score+=1;
          pA.streak=pB.streak=0;
          pA.draws++; pB.draws++;
        }
        pA.gamesPlayed++; pB.gamesPlayed++;
        pA.inGame=pB.inGame=false;
        pA.lastOpp=pB.id; pB.lastOpp=pA.id;
        if (this.onGameDone) this.onGameDone(game, pA, pB);
        if (!this.isOver()) this._pairAvailable();
      }, delay);
      this._timers.push(t);
    }

    getLeaderboard() {
      return [...this.players].sort((a,b) => b.score!==a.score ? b.score-a.score : b.wins-a.wins);
    }

    recentGames(n=8) {
      return this.games.filter(g=>g.result).slice(-n).reverse()
        .map(g => ({...g, nameA: this.players.find(p=>p.id===g.pA)?.name||'?',
                          nameB: this.players.find(p=>p.id===g.pB)?.name||'?'}));
    }
  }

  // ── Swiss Engine ─────────────────────────────────────────────────────────────
  class SwissEngine {
    constructor(config) {
      this.totalRounds = config.rounds || 5;
      this.players = config.players.map(p => ({...p, score:0, wins:0, draws:0,
                       losses:0, buchholz:0, opponents:[]}));
      this.rounds  = [];
      this.current = 0;
    }

    get isFinished() { return this.current>=this.totalRounds && this._roundComplete(); }

    _roundComplete() {
      if (!this.rounds.length) return true;
      return this.rounds[this.rounds.length-1].pairings.every(p=>p.result!==null);
    }

    startNextRound() {
      if (this.current >= this.totalRounds || !this._roundComplete()) return null;
      this.current++;
      const pairings = this._pair();
      const round = { number: this.current, pairings, complete: false };
      this.rounds.push(round);
      return round;
    }

    _pair() {
      const sorted = [...this.players]
        .sort((a,b) => b.score!==a.score ? b.score-a.score : (b.elo||0)-(a.elo||0));
      const used = new Set();
      const pairs = [];

      for (let i=0; i<sorted.length; i++) {
        if (used.has(sorted[i].id)) continue;
        let paired = false;
        // prefer unplayed opponents in same score bracket
        for (let j=i+1; j<sorted.length; j++) {
          if (used.has(sorted[j].id)) continue;
          if (!sorted[i].opponents.includes(sorted[j].id)) {
            pairs.push({white:sorted[i],black:sorted[j],result:null});
            used.add(sorted[i].id); used.add(sorted[j].id);
            paired=true; break;
          }
        }
        if (!paired) {
          for (let j=i+1; j<sorted.length; j++) {
            if (!used.has(sorted[j].id)) {
              pairs.push({white:sorted[i],black:sorted[j],result:null});
              used.add(sorted[i].id); used.add(sorted[j].id); break;
            }
          }
        }
      }
      // Bye for odd players
      sorted.forEach(p => {
        if (!used.has(p.id)) { pairs.push({white:p,black:null,result:'bye'}); p.score+=1; }
      });
      return pairs;
    }

    submitResult(roundIdx, pairIdx, result) {
      const r = this.rounds[roundIdx];
      if (!r) return;
      const p = r.pairings[pairIdx];
      if (!p || p.result || !p.black) return;
      p.result = result;
      const w=p.white, b=p.black;
      w.opponents.push(b.id); b.opponents.push(w.id);
      if (result==='W') { w.score+=1; w.wins++; b.losses++; }
      else if (result==='D') { w.score+=.5; b.score+=.5; w.draws++; b.draws++; }
      else { b.score+=1; b.wins++; w.losses++; }
      r.complete = r.pairings.every(p=>p.result!==null);
      if (r.complete) this._buchholz();
    }

    simulateRound(roundIdx) {
      const r = this.rounds[roundIdx];
      if (!r) return;
      r.pairings.forEach((p,i) => {
        if (p.result || !p.black) return;
        const res = simulateGame(p.white, p.black);
        this.submitResult(roundIdx, i, res==='A'?'W':res==='D'?'D':'L');
      });
    }

    _buchholz() {
      this.players.forEach(p => {
        p.buchholz = p.opponents.reduce((s,id) => {
          const o = this.players.find(x=>x.id===id);
          return s+(o?o.score:0);
        },0);
      });
    }

    getStandings() {
      return [...this.players].sort((a,b) =>
        b.score!==a.score ? b.score-a.score : b.buchholz-a.buchholz);
    }
  }

  // ── Round Robin Engine ────────────────────────────────────────────────────────
  class RoundRobinEngine {
    constructor(config) {
      this.players = config.players.map(p=>({...p,score:0,wins:0,draws:0,losses:0}));
      this.games   = [];
      this.done    = false;
      // Generate all pairings
      for (let i=0; i<this.players.length; i++)
        for (let j=i+1; j<this.players.length; j++)
          this.games.push({id:`${i}-${j}`, pA:this.players[i], pB:this.players[j], result:null});
    }

    simulateAll(onGame) {
      let d=0;
      this.games.forEach(g=>{
        setTimeout(()=>{
          if (g.result) return;
          const r = simulateGame(g.pA, g.pB);
          g.result=r;
          if (r==='A') { g.pA.score+=1; g.pA.wins++; g.pB.losses++; }
          else if (r==='D') { g.pA.score+=.5; g.pA.draws++; g.pB.score+=.5; g.pB.draws++; }
          else { g.pB.score+=1; g.pB.wins++; g.pA.losses++; }
          if (onGame) onGame(g);
          this.done = this.games.every(x=>x.result);
          if (this.done) Leaderboard.recordTournament('Round Robin', this.getStandings());
        }, d);
        d += 300 + Math.random()*400;
      });
    }

    getStandings() {
      return [...this.players].sort((a,b)=>b.score!==a.score?b.score-a.score:b.wins-a.wins);
    }

    getMatrix() {
      const m={};
      this.players.forEach(p=>{m[p.id]={};});
      this.games.forEach(g=>{
        const a=g.pA.id,b=g.pB.id;
        if (!g.result) { m[a][b]=m[b][a]='–'; return; }
        if (g.result==='A') { m[a][b]=1; m[b][a]=0; }
        else if (g.result==='B') { m[b][a]=1; m[a][b]=0; }
        else { m[a][b]=m[b][a]='½'; }
      });
      return m;
    }
  }

  // ── Public ───────────────────────────────────────────────────────────────────
  G.ChaturangaTournament = {
    ArenaEngine, SwissEngine, RoundRobinEngine,
    makeHumanPlayer, makeBotPlayer, simulateGame,
    BOT_NAMES, BOT_ELOS, Leaderboard
  };

})(window);
