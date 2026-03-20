globalThis.ChaturangaTournamentEngine = (function() {
  'use strict';
  const STORAGE_KEY = 'chaturanga_tournaments';

  function loadAll() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e) { return []; }
  }
  function saveAll(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function createTournament(config) {
    const id = String(Date.now());
    const tournament = {
      id,
      name: config.name || 'Unnamed Tournament',
      format: config.format || 'round-robin',
      participants: config.participants || [],
      timeControlSeconds: config.timeControlSeconds || 300,
      status: 'active',
      createdAt: new Date().toISOString(),
      rounds: [],
      standings: []
    };
    if (config.format === 'round-robin') {
      tournament.rounds = generateRoundRobin(config.participants);
    } else if (config.format === 'single-elim') {
      tournament.rounds = generateSingleElim(config.participants);
    } else if (config.format === 'bot-championship') {
      tournament.participants = generateBotChampionship();
      tournament.rounds = generateRoundRobin(tournament.participants);
    }
    tournament.standings = initStandings(tournament.participants);
    const all = loadAll();
    all.push(tournament);
    saveAll(all);
    return id;
  }

  function generateRoundRobin(participants) {
    const rounds = [];
    const ps = [...participants];
    if (ps.length % 2 !== 0) ps.push({ id: 'bye', name: 'BYE', type: 'bye' });
    const n = ps.length;
    for (let r = 0; r < n - 1; r++) {
      const round = { round: r + 1, matches: [] };
      for (let i = 0; i < n / 2; i++) {
        const p1 = ps[i], p2 = ps[n - 1 - i];
        if (p1.id !== 'bye' && p2.id !== 'bye') {
          round.matches.push({ id: r + '_' + i, p1: p1.id, p2: p2.id, result: null });
        }
      }
      // Rotate everyone except the last player
      ps.splice(1, 0, ps.pop());
      rounds.push(round);
    }
    return rounds;
  }

  function generateSingleElim(participants) {
    const sorted = [...participants].sort((a,b) => (b.rating||0)-(a.rating||0));
    let size = 4;
    while (size < sorted.length) size *= 2;
    // Seed with byes: top seeds get byes
    const seeded = [];
    for (let i = 0; i < size; i++) seeded.push(sorted[i] || { id: 'bye', name: 'BYE', type: 'bye' });
    const rounds = [];
    let current = seeded;
    let rIdx = 1;
    while (current.length > 1) {
      const round = { round: rIdx++, matches: [] };
      const next = [];
      for (let i = 0; i < current.length; i += 2) {
        const p1 = current[i], p2 = current[i+1];
        const mId = 'se_' + rIdx + '_' + i;
        if (p1.id === 'bye') { next.push(p2); continue; }
        if (p2.id === 'bye') { next.push(p1); continue; }
        round.matches.push({ id: mId, p1: p1.id, p2: p2.id, result: null });
        next.push(null); // placeholder for winner
      }
      rounds.push(round);
      current = next.filter(Boolean);
    }
    return rounds;
  }

  function generateBotChampionship() {
    const elos = [100,200,300,400,500,600,700,800,900,1000];
    const names = ['Random','Greedy','Tactical','Strategic','Deep Tactical','Paranoid','Grandmaster','Maharaja','Samrat','Chakravarti'];
    return elos.map((elo,i) => ({ id:'bot_'+elo, name:names[i]+' ('+elo+')', type:'bot', eloLevel:elo, rating:elo }));
  }

  function initStandings(participants) {
    return participants.map(p => ({ id: p.id, name: p.name, points: 0, wins: 0, draws: 0, losses: 0, ratingChange: 0 }));
  }

  function recordResult(tournamentId, matchId, winnerId) {
    const all = loadAll();
    const t   = all.find(x => x.id === tournamentId);
    if (!t) return;

    for (const round of t.rounds) {
      const match = round.matches.find(m => m.id === matchId);
      if (!match) continue;
      match.result = winnerId === 'draw' ? 'draw' : winnerId;

      // Update standings
      const s1 = t.standings.find(s => s.id === match.p1);
      const s2 = t.standings.find(s => s.id === match.p2);
      if (s1 && s2) {
        if (winnerId === 'draw') {
          s1.points+=1; s1.draws++;
          s2.points+=1; s2.draws++;
        } else if (winnerId === match.p1) {
          s1.points+=3; s1.wins++;
          s2.losses++;
        } else {
          s2.points+=3; s2.wins++;
          s1.losses++;
        }
        // ELO update
        const p1info = t.participants.find(p => p.id === match.p1);
        const p2info = t.participants.find(p => p.id === match.p2);
        if (p1info && p2info) {
          const K1 = ((p1info.gamesPlayed||0) < 30) ? 32 : 16;
          const K2 = ((p2info.gamesPlayed||0) < 30) ? 32 : 16;
          const r1 = p1info.rating || 500, r2 = p2info.rating || 500;
          const e1 = 1 / (1 + Math.pow(10, (r2-r1)/400));
          const e2 = 1 - e1;
          const a1 = winnerId === match.p1 ? 1 : winnerId === 'draw' ? 0.5 : 0;
          const a2 = 1 - a1;
          s1.ratingChange = Math.round(s1.ratingChange + K1 * (a1 - e1));
          s2.ratingChange = Math.round(s2.ratingChange + K2 * (a2 - e2));
        }
      }
      break;
    }

    saveAll(all);
  }

  function getStandings(tournamentId) {
    const t = loadAll().find(x => x.id === tournamentId);
    if (!t) return [];
    return [...t.standings].sort((a,b) => b.points-a.points || b.wins-a.wins || (b.ratingChange||0)-(a.ratingChange||0));
  }

  function exportResults(tournamentId) {
    const t = loadAll().find(x => x.id === tournamentId);
    if (!t) return '';
    const standings = getStandings(tournamentId);
    let md = '# ' + t.name + ' — ' + t.format + '\n';
    md += '**Date:** ' + new Date(t.createdAt).toLocaleString() + '\n\n';
    md += '## Standings\n| Rank | Player | Pts | W/D/L | ELO Δ |\n|---|---|---|---|---|\n';
    standings.forEach((s,i) => {
      md += '| ' + (i+1) + ' | ' + s.name + ' | ' + s.points + ' | ' + s.wins + '/' + s.draws + '/' + s.losses + ' | ' + (s.ratingChange>=0?'+':'')+s.ratingChange + ' |\n';
    });
    md += '\n## Results\n';
    t.rounds.forEach(r => {
      md += '### Round ' + r.round + '\n';
      r.matches.forEach(m => {
        const p1 = t.participants.find(p=>p.id===m.p1);
        const p2 = t.participants.find(p=>p.id===m.p2);
        md += '- ' + (p1?.name||m.p1) + ' vs ' + (p2?.name||m.p2) + ': ' + (m.result||'Pending') + '\n';
      });
    });
    return md;
  }

  function simulateBotMatch(t, match) {
    // Simple simulation: higher ELO wins with probability based on ELO diff
    const p1 = t.participants.find(p=>p.id===match.p1);
    const p2 = t.participants.find(p=>p.id===match.p2);
    if (!p1||!p2) return match.p1;
    const r1=p1.eloLevel||p1.rating||500, r2=p2.eloLevel||p2.rating||500;
    const e1=1/(1+Math.pow(10,(r2-r1)/400));
    const rand=Math.random();
    if (rand < e1-0.1) return match.p1;
    if (rand > e1+0.1) return match.p2;
    return 'draw';
  }

  function simulateBotChampionship(tournamentId) {
    const all = loadAll();
    const t   = all.find(x => x.id === tournamentId);
    if (!t) return;
    t.rounds.forEach(round => {
      round.matches.forEach(match => {
        if (!match.result) {
          match.result = simulateBotMatch(t, match);
          const s1=t.standings.find(s=>s.id===match.p1);
          const s2=t.standings.find(s=>s.id===match.p2);
          if (s1&&s2) {
            if (match.result==='draw'){s1.points+=1;s1.draws++;s2.points+=1;s2.draws++;}
            else if (match.result===match.p1){s1.points+=3;s1.wins++;s2.losses++;}
            else {s2.points+=3;s2.wins++;s1.losses++;}
          }
        }
      });
    });
    t.status='finished';
    saveAll(all);
    return t;
  }

  return { createTournament, generateRoundRobin, generateSingleElim, recordResult, getStandings, exportResults, loadAll, simulateBotChampionship };
})();
