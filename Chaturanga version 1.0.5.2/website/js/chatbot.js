// Chaturanga Website — Chatbot JS
// Rule-based Q&A bot for the Chaturanga website

(function () {
  'use strict';

  // ── Knowledge Base ───────────────────────────────────────────────────
  const KB = [
    {
      keys: ['how do i play', 'how to play', 'getting started', 'start', 'begin', 'rules', 'overview'],
      answer: `Chaturanga is a 4-player alliance game on an 8×8 board. Each turn you roll the dice — the result decides WHICH piece you must move (not where). Red & Green are one team, Blue & Yellow are the other. Capture the enemy Rajas to win! 🪷`
    },
    {
      keys: ['piece', 'pieces', 'army', 'units', 'what are the pieces'],
      answer: `The Chaturanga army has 5 pieces:\n• ♚ <b>Raja (King)</b> — moves 1 step any direction\n• ♜ <b>Ratha (Chariot)</b> — moves like a Rook, any number of squares\n• ♞ <b>Ashwa (Horse)</b> — moves in an L-shape, jumps over pieces\n• ♝ <b>Danti (Elephant)</b> — leaps exactly 2 squares diagonally\n• ♟ <b>Nara (Pawn)</b> — moves 1 forward, captures diagonally`
    },
    {
      keys: ['dice', 'roll', 'pashaka', 'pasaka', 'die', 'd6', 'how does dice work'],
      answer: `You roll a 4-sided die (using faces 1, 3, 4, 6):\n• Roll <b>1</b> → must move your Ratha (Chariot)\n• Roll <b>3</b> → must move your Ashwa (Horse)\n• Roll <b>4</b> → must move your Danti (Elephant)\n• Roll <b>6</b> → may move your Nara (Pawn) or Raja (King)\n\nYou have 3 manual forfeit tokens per game if you can't use the forced piece.`
    },
    {
      keys: ['capture', 'captures', 'minor', 'major', 'who can capture'],
      answer: `The capture hierarchy is:\n• <b>Minor pieces</b> (Nara, Ashwa, Danti) can only capture other minor pieces.\n• <b>Major pieces</b> (Ratha, Raja) can capture any piece.\n\nThis makes the Ratha especially powerful — guard it!`
    },
    {
      keys: ['king', 'raja', 'respawn', 'revive', 'respanning'],
      answer: `If your teammate captures an enemy Raja, your own Raja may <b>respawn</b> on any empty square on the board! This is a unique Chaturanga rule from the Maṅgalagiri manuscript — your king gets a second life.`
    },
    {
      keys: ['team', 'alliance', 'ally', 'partner', 'coalition'],
      answer: `Red & Green are Team 1. Blue & Yellow are Team 2. In team mode, if your Raja is captured, your ally can win it back by capturing an enemy Raja — reviving you. The last alliance standing wins!`
    },
    {
      keys: ['stalemate', 'no moves', 'stuck', 'forfeit'],
      answer: `In Chaturanga, <b>stalemate = WIN</b> (unlike Chess). If you cannot move your forced piece, you win that turn. You also have 3 manual forfeit tokens per game — use them wisely if the forced piece has no good moves.`
    },
    {
      keys: ['bot', 'ai', 'elo', 'computer', 'difficulty'],
      answer: `You can play vs bots from ELO 100 to 600:\n• <b>100 — Random</b>: picks any legal move\n• <b>200 — Greedy</b>: prefers captures\n• <b>300 — Tactical</b>: evaluates immediate threats\n• <b>400 — Strategic</b>: looks 2 moves ahead\n• <b>500 — Deep Tactical</b>: extended look-ahead\n• <b>600 — Paranoid</b>: king-safety obsessed\n\nHigher ELO bots (700+) are planned for v1.0.4!`
    },
    {
      keys: ['history', 'ancient', 'origin', 'india', 'chess origin', 'ancestor'],
      answer: `Chaturanga is the oldest known ancestor of Chess, Xiangqi, and Shogi — documented in India as early as the 6th century CE. The name means "four divisions of the army." Al-Bīrūnī wrote about it in 1030 CE, and H.J.R. Murray's 1913 book confirmed its Indian origin as scholarly consensus.`
    },
    {
      keys: ['version', 'v1.0.3.3', 'new features', 'what is new', "what's new"],
      answer: `<b>v1.0.3.3</b> (current) brings:\n• New authentic Indian piece artwork (Raja, Ashwa, Danti, Ratha, Nara)\n• Chess.com-style premium interface\n• Drag-and-drop pieces\n• Sound effects for captures & dice rolls\n• Seer Engine analytics panel\n• This chatbot! 🪷`
    },
    {
      keys: ['v1.0.4', '1.0.4', 'future', 'next version', 'what is v1.0.4', 'coming soon', 'puzzles', 'lessons', 'tournaments'],
      answer: `<b>v1.0.4</b> is in planning and will bring:\n🧩 <b>Puzzles</b> — tactical challenges from real Chaturanga positions\n📚 <b>Lessons</b> — guided tutorials by the Seer Engine\n🏆 <b>Tournaments</b> — bracket mode with ELO leaderboards\n🤖 <b>Higher ELO Bots</b> — ELO 700-1000 with Minimax+Alpha-Beta\n🌐 <b>Online Multiplayer</b> — play against real opponents\n📊 <b>Full Seer Engine</b> — ELO estimation, turning-point analysis, MD exports`
    },
    {
      keys: ['seer', 'analyser', 'analyzer', 'analytics', 'game data'],
      answer: `The <b>Seer Engine</b> is Chaturanga's built-in game analyser. In v1.0.3.3 it shows basic stats (move count, captures, top piece). In v1.0.4, it'll estimate ELO ratings from game logs, highlight turning points, and generate detailed Markdown reports.`
    },
    {
      keys: ['online', 'multiplayer', 'friends', 'play online'],
      answer: `Online multiplayer is planned for v1.0.4! It'll use WebSockets so you can play with friends or random opponents across the globe. For now, try Pass-and-Play (0 bots) with friends on the same screen!`
    },
    {
      keys: ['contribute', 'github', 'source code', 'open source'],
      answer: `Want to contribute? You can help with:\n• <b>Code</b> — bot engine, new features, bug fixes\n• <b>Research</b> — Sanskrit manuscripts, historical rule variants\n• <b>Art</b> — piece designs, board textures, animations\n• <b>Community</b> — testing, tutorials, translations\n\nCheck the Contribute section on the website!`
    },
    {
      keys: ['hello', 'hi', 'hey', 'namaste', 'greet'],
      answer: `Namaste, great warrior! 🪷 I am the Chaturang AI, ready to guide you through the Ashtāpada. Ask me anything about rules, pieces, strategy, or history!`
    },
    {
      keys: ['thank', 'thanks', 'tyvm', 'ty'],
      answer: `Victory is yours! 🏆 May your Ratha ride swift and your Raja reign long. Ask me anything else about Chaturanga!`
    },
  ];

  function getAnswer(input) {
    const lower = input.toLowerCase().trim();
    for (const entry of KB) {
      if (entry.keys.some(k => lower.includes(k))) return entry.answer;
    }
    return `I'm not sure about that yet — my knowledge covers rules, pieces, dice mechanics, version features, and history. Try asking:\n• "How do I play?"\n• "What are the pieces?"\n• "What's in v1.0.4?"\n• "How does the dice work?"`;
  }

  // ── DOM ───────────────────────────────────────────────────────────────
  const fab        = document.getElementById('chatbotFab');
  const panel      = document.getElementById('chatbotPanel');
  const closeBtn   = document.getElementById('chatbotClose');
  const messages   = document.getElementById('chatbotMessages');
  const input      = document.getElementById('chatbotInput');
  const sendBtn    = document.getElementById('chatbotSend');
  const quickReplies = document.getElementById('quickReplies');

  if (!fab || !panel) return;

  // ── Open / Close ───────────────────────────────────────────────────────
  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) input && input.focus();
  });
  if (closeBtn) closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('open') && !panel.contains(e.target) && e.target !== fab) {
      panel.classList.remove('open');
    }
  });

  // ── Append message ─────────────────────────────────────────────────────
  function appendMsg(text, isUser) {
    const wrap = document.createElement('div');
    wrap.className = isUser ? 'user-msg' : 'bot-msg';
    const bubble = document.createElement('span');
    bubble.className = isUser ? 'user-bubble' : 'bot-bubble';
    bubble.innerHTML = text.replace(/\n/g, '<br/>');
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
    return wrap;
  }

  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'bot-msg';
    wrap.id = 'typingIndicator';
    const bubble = document.createElement('span');
    bubble.className = 'bot-bubble typing-bubble';
    bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
  }

  // ── Send Message ───────────────────────────────────────────────────────
  function sendMessage(text) {
    if (!text.trim()) return;
    // Hide quick replies
    if (quickReplies) quickReplies.style.display = 'none';
    appendMsg(text, true);
    showTyping();
    setTimeout(() => {
      hideTyping();
      const answer = getAnswer(text);
      appendMsg(answer, false);
    }, 500 + Math.random() * 400);
  }

  if (sendBtn) sendBtn.addEventListener('click', () => { sendMessage(input.value); input.value = ''; });
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { sendMessage(input.value); input.value = ''; }
    });
  }

  // Quick reply buttons
  document.querySelectorAll('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => { sendMessage(btn.dataset.q); });
  });

})();
