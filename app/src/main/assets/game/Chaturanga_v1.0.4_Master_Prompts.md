# Chaturanga v1.0.4 — Master Development Prompt File
### For use with: Antigravity Claude Sonnet 4.6 (Extended Thinking) · Gemini 2.5 Pro High

> **How to use this file**: Each prompt is self-contained. Copy the entire
> **MASTER CONTEXT** block first, then paste whichever **PROMPT** you are
> working on. Every prompt is written to be given to the AI fresh — context
> is always included so you never need to re-explain the game.
>
> **Sonnet 4.6 Thinking**: Best for architecture decisions, bot logic,
> algorithm design, and anything requiring multi-step reasoning.  
> **Gemini 2.5 Pro High**: Best for long-file generation, UI components,
> CSS, multi-language content, and document-heavy tasks.

---

## ═══════════════════════════════════════════════════════════════
## MASTER CONTEXT BLOCK — PASTE THIS BEFORE EVERY PROMPT
## ═══════════════════════════════════════════════════════════════

```
You are building Chaturanga v1.0.4 — a digital revival of the ancient
Indian 4-player war game (c. 280–600 CE), ancestor of chess, xiangqi,
shogi, and makruk. Current stable version is v1.0.3.3.

━━━ GAME RULES (non-negotiable — do not deviate) ━━━

Board: 8×8 (Ashtapada). Players: 4 — Red (bottom), Blue (right),
Green (top), Yellow (left). Teams: Red+Green vs Blue+Yellow.

DICE MECHANIC (Pāśaka — core of the game):
  Every turn begins with a dice roll that FORCES which piece must move:
  Face 1 → Ratha (Rook) — slides any squares orthogonally
  Face 2 → Any piece (player's free choice)
  Face 3 → Ashwa (Horse) — L-shape jump, same as chess knight
  Face 4 → Danti (Elephant) — leaps EXACTLY 2 squares diagonally,
            jumping over any piece (NOT a sliding bishop)
  Face 5 → Any piece (player's free choice) [same as face 2]
  Face 6 → Nara (Pawn) OR Raja (King) — player chooses which

CAPTURE RULES (differ from modern chess):
  - Cannot capture own pieces
  - Kings CANNOT capture each other (authentic Chaturanga law)
  - Minor pieces (pawn, horse, elephant) CANNOT capture other
    minor pieces — this does NOT exist in modern chess

ELIMINATION: 3 forfeits (no legal move for forced piece type) = out
PIECE VALUES: Pawn=1, Horse=3, Elephant=3, Rook=5, King=100
ELO HYPOTHESIS: 2000 Chaturanga ELO ≈ 3500 Chess ELO

━━━ CURRENT FILE STRUCTURE ━━━

Chaturanga-version-1.0.3.3/
  game.html                    ← main game UI (do not break)
  js/game.js                   ← core game loop & board
  js/bot/tieredBots.js         ← AI ELO 100–600 (DO NOT MODIFY)
  js/bot/advancedBots.js       ← AI ELO 700–1000 (v1.0.4, new)
  engine/gameState.js          ← serialisable game snapshot
  engine/randomMoveGenerator.js← ELO 100 random bot
  engine/rules.js              ← canCapture() rules
  css/styles.css               ← design system (DO NOT BREAK)
  css/animations.css           ← particle effects, shimmer
  server.js                    ← Node.js static server port 8765

━━━ LIVE GAME OBJECT API ━━━

  game.board              Map<string, Piece> e.g. game.board.get("a1")
  game.turnIndex          0=Red, 1=Blue, 2=Green, 3=Yellow
  game.forcedPiece        'rook'|'horse'|'elephant'|'pawn-king'|'any'
  game.lastDice           1–6
  game.players[]          [{id, eliminated, frozen, team, forfeits}]
  game.gameMode           'team' | 'ffa'
  game.getLegalMoves(sq)  returns string[] of target squares
  game.getPlayer()        returns current player object
  game.gameOver           boolean

━━━ DESIGN SYSTEM (CSS variables — never hardcode colours) ━━━

  --gold: #c9a84c       --dark: #0f0c07      --dark2: #1a1306
  --dark3: #231a08      --border: rgba(201,168,76,0.22)
  Fonts: 'Cinzel' (serif headings) + 'Outfit' (body)
  All new pages MUST import both fonts from Google Fonts and
  maintain the gold-on-dark premium aesthetic.

━━━ HARD CONSTRAINTS ━━━

  1. NEVER modify tieredBots.js — ELO 100–600 must remain unchanged
  2. NEVER change CSS variable names in styles.css
  3. NEVER change the game object API shape
  4. All new JS modules must be IIFEs or UMD — no ES module imports
     (the project runs as plain HTML files on a static server)
  5. localStorage key 'chaturanga_custom_army' is reserved for the
     army builder — do not use it for anything else
  6. All new standalone HTML files must work when opened directly via
     the Node.js server at localhost:8765 — no build step required
```

---

## ═══════════════════════════════════════════════════════════════
## PROMPT 1 — ADVANCED BOTS (ELO 700–1000)
## ═══════════════════════════════════════════════════════════════
**Best model**: Sonnet 4.6 Thinking  
**Files produced**: `js/bot/advancedBots.js` + edits to `game.html` + `js/game.js`

```
[PASTE MASTER CONTEXT BLOCK HERE]

━━━ TASK: IMPLEMENT ADVANCED BOT ENGINE (ELO 700–1000) ━━━

Create js/bot/advancedBots.js as a self-contained IIFE that registers
window.ChaturangaAdvancedBots. It must implement four new bot tiers:

ELO 700 — Grandmaster
  Algorithm: Team expecti-alpha-beta, 3-ply search
  Key: PST (piece-square tables), basic move ordering (MVV-LVA)
  Time: No limit (fast enough at depth 3)

ELO 800 — Maharaja
  Algorithm: All of ELO 700 + quiescence search (depth 4 + QS depth 4)
  Key: Stand-pat pruning; capture-only QS extension
  Time: No limit

ELO 900 — Samrat
  Algorithm: All of ELO 800 + iterative deepening
  Time limit: 1800ms — search deeper as time allows, up to depth 5
  Key: Always returns best move found so far if cut off

ELO 1000 — Chakravarti
  Algorithm: All of ELO 900 + transposition table + opening book
  Time limit: 2500ms, up to depth 6
  Transposition table: 60,000-entry Map, LRU pruning (drop oldest 25%
  when full), keyed on board state string + turnIndex
  Opening book: nudge good first 4 half-moves based on dice face

PIECE-SQUARE TABLES (PST):
  Define RAW_PST for pawn, horse, elephant, rook, king as [8][8] arrays
  (rank 0 = home row, rank 7 = promotion row, from Red/Player 0 perspective)
  Rotation: Player 0 (Red) moves up → no rotation
            Player 2 (Green) moves down → flip rank
            Player 1 (Blue) moves left → rotate 90° CW
            Player 3 (Yellow) moves right → rotate 90° CCW

CORE SEARCH — expectiTeamAB(game, depth, alpha, beta, playerId, useQS, tt):
  Game tree per ply:
    Chance node: average score over all 6 dice faces (1/6 each)
      → for each face, set game.forcedPiece = DICE_TO_FORCED[face]
      → get legal moves, order them (captures first by MVV-LVA)
      → Max node if current player is ally, Min node if enemy
      → alpha-beta prune within each dice branch
  Leaf evaluation: teamEval(game, playerId)
  If useQS=true and depth=0: call quiescence() instead of teamEval

TEAM EVALUATION — teamEval(game, playerId):
  From playerId's perspective (team-aware):
  1. Material: each piece ×10, sign +1 for ally -1 for enemy
  2. PST bonus: getPST(type, sq, owner) × 0.12
  3. Pawn advancement: distance advanced × 0.8 per pawn
  4. Rook open file: +1.5 if no pawns on rook's file
  5. Mobility: our total reachable squares vs avg opponent × 0.18
     (temporarily set forcedPiece='any' to count; restore after)
  6. King safety: −1.8 × count of opponent-threatened squares adjacent
     to each ally king; scale by endgame factor
  7. Endgame factor: 1.0 normal, 1.3 if <22 pieces, 2.0 if <14 pieces

QUIESCENCE — quiescence(game, alpha, beta, playerId, qdepth):
  Stand-pat: eval = teamEval(); if eval >= beta return beta
  Only generate capture moves (temporarily forcedPiece='any')
  Sort by MVV-LVA, recurse, alpha-beta prune

PUBLIC API:
  window.ChaturangaAdvancedBots = {
    getMove(game, eloLevel)          // returns {from, to} or null
    resetOpeningBook()               // call on new game start
    clearTranspositionTable()        // call on new game start
    _teamEval, _getPST,              // exposed for benchmarking
    _quiescence, _expectiTeamAB
  }

INTEGRATION INTO game.html:
  Add AFTER the existing tieredBots.js script tag:
    <script src="js/bot/advancedBots.js"></script>

  Extend the botElo <select> in the settings drawer:
    <option value="700">700 — Grandmaster</option>
    <option value="800">800 — Maharaja</option>
    <option value="900">900 — Samrat</option>
    <option value="1000">1000 — Chakravarti</option>

INTEGRATION INTO js/game.js:
  Find the bot dispatch function (calls ChaturangaTieredBot.getMove).
  Change it to:
    function getBotMove() {
      const elo = parseInt(document.getElementById('botElo').value);
      if (elo >= 700 && window.ChaturangaAdvancedBots) {
        return window.ChaturangaAdvancedBots.getMove(game, elo);
      }
      return ChaturangaTieredBot.getMove(game, elo);
    }
  Find the new-game / reset function. Add at its top:
    if (window.ChaturangaAdvancedBots) {
      window.ChaturangaAdvancedBots.resetOpeningBook();
      window.ChaturangaAdvancedBots.clearTranspositionTable();
    }

VERIFICATION:
  [ ] ELO 700–1000 appear in the settings dropdown
  [ ] Bots make valid moves at all 4 new levels
  [ ] ELO 100–600 still work exactly as before
  [ ] No console errors on load
  [ ] New game resets transposition table (no state bleed)
  [ ] At ELO 900/1000, bot moves within the time limit
```

---

## ═══════════════════════════════════════════════════════════════
## PROMPT 2 — PUZZLE SYSTEM
## ═══════════════════════════════════════════════════════════════
**Best model**: Gemini 2.5 Pro High (large file generation)  
**Files produced**: `puzzles/puzzle-data.js` · `puzzles/puzzle-engine.js` · `puzzles/puzzle-ui.js` · `puzzles.html`

```
[PASTE MASTER CONTEXT BLOCK HERE]

━━━ TASK: BUILD THE PUZZLE SYSTEM ━━━

Create a complete puzzle feature as a standalone page (puzzles.html) that
uses the same gold-dark design system. No build step — plain JS files.

━━━ DATA LAYER — puzzles/puzzle-data.js ━━━

Export window.ChaturangaPuzzleData as an array of 20+ puzzle objects.
Each puzzle object shape:
  {
    id: "P001",
    title: "Ratha's Last Stand",
    type: "win-in-2" | "save-the-raja" | "ratha-hunt" |
          "danti-fork" | "stalemate-trap" | "alliance-combo",
    rating: 320,            // ELO difficulty 100–800
    forcedDice: [1, 3],     // dice sequence for each move
    boardState: {           // compact board: "sq": "owner:type"
      "a1": "0:rook", "d4": "1:king", ...
    },
    turnIndex: 0,           // who moves first (0=Red)
    solution: [
      { from: "a1", to: "h1" },
      { from: "b3", to: "c5" }
    ],
    hint: [
      "Look for a pin on the h-file",
      "The horse delivers the final blow"
    ],
    moralLesson: "Patience and precision, like Arjuna's arrow."
  }

Include at least: 4 win-in-2, 4 save-the-raja, 4 ratha-hunt,
                  3 danti-fork, 3 stalemate-trap, 2 alliance-combo
Vary ratings: 4 easy (100–250), 8 medium (251–500), 8 hard (501–800)

━━━ ENGINE — puzzles/puzzle-engine.js ━━━

window.ChaturangaPuzzleEngine = {
  loadPuzzle(puzzle):
    Set up a minimal game-like state from puzzle.boardState.
    Set turnIndex and forcedDice[0] as current forced piece.
    Return the board state object.

  validateMove(puzzleState, from, to):
    Check if {from, to} matches puzzleState.solution[currentStep].
    If correct: advance step, return { correct: true, complete: bool }
    If wrong: return { correct: false, hint: null }
    Do NOT reveal hint on first wrong — only after 2nd wrong attempt.

  getHint(puzzleState):
    Return puzzle.hint[currentStep] if available.
    Mark hint as used (counts against score).

  calculateScore(puzzle, hintsUsed, timeSeconds, wrong):
    Base score = puzzle.rating
    Deduct: hintsUsed × 20, wrong × 10, time > 60s → −(time−60) × 0.5
    Minimum score = 10

  saveProgress(puzzleId, score, solved):
    localStorage key: 'chaturanga_puzzles'
    Schema: { solved: Set, scores: {id: score}, streak: number,
              lastSolvedAt: timestamp }
    Update streak: consecutive solves within 24h increment it.
}

━━━ UI — puzzles/puzzle-ui.js ━━━

window.ChaturangaPuzzleUI = {
  init():
    Render puzzle browser grid (filter by type and difficulty).
    Show user stats bar: puzzles solved, current streak, best score.
    Each card shows: title, type badge, star difficulty, moral lesson teaser.

  renderPuzzleBoard(puzzleState):
    Render an 8×8 board in fixed position (no scroll).
    Highlight: squares in solution[currentStep].from with gold pulse.
    Show forced piece name below board: "You must move: Ratha (Rook)".
    Arrow overlay: draw SVG arrow from from→to on correct solve.

  showHintArrow(from, to):
    Draw a dashed gold SVG arrow on the board overlay.
    Pulse it twice then fade to 50% opacity.

  showResult(correct, complete, moralLesson):
    Correct but not complete: green flash on piece, advance dice display.
    Wrong: red shake animation on board.
    Complete: show modal — score, moral lesson quote, next puzzle button.

  renderProgressBar():
    Show "X of 20 solved" with gold fill bar.
    Show streak badge if streak >= 3.
}

━━━ PAGE — puzzles.html ━━━

Structure:
  Top nav (same as game.html style: logo, version, title)
  Left panel: puzzle browser (filter chips: All / Win-in-2 / Save-Raja
              / Ratha-Hunt / Danti-Fork / etc.)
  Centre: active puzzle board + move input area
  Right panel: stats (streak, score, moral lesson history)

Puzzle browser cards:
  Each card clickable → loads puzzle into centre board.
  Show: title, type, rating stars (1–5), solved/unsolved indicator.
  Filter chips update the card grid without page reload.

Active puzzle area:
  Board (8×8, same sq size as game.html)
  Below board: "Move [dice face] → [piece name]" instruction
  Two buttons: "Hint (-20pts)" and "Give Up"
  Timer display (counts up from 00:00)
  After solve: moral lesson popup with share button

Scripts load order:
  <script src="puzzles/puzzle-data.js"></script>
  <script src="puzzles/puzzle-engine.js"></script>
  <script src="puzzles/puzzle-ui.js"></script>

VERIFICATION:
  [ ] puzzles.html loads without errors
  [ ] Filter chips correctly filter the puzzle grid
  [ ] Correct first move is accepted, board advances to next dice
  [ ] Wrong move triggers red shake, no advance
  [ ] Second wrong move reveals hint arrow
  [ ] On completion, modal shows score and moral lesson
  [ ] Progress saves to localStorage and persists on reload
  [ ] Streak counter increments correctly
```

---

## ═══════════════════════════════════════════════════════════════
## PROMPT 3 — LESSONS MODULE WITH CULTURAL CONTENT
## ═══════════════════════════════════════════════════════════════
**Best model**: Gemini 2.5 Pro High (multilingual content + long generation)  
**Files produced**: `lessons/lesson-data.js` · `lessons/lesson-engine.js` · `lessons/lesson-ui.js` · `lessons.html`

```
[PASTE MASTER CONTEXT BLOCK HERE]

━━━ TASK: BUILD THE LESSONS MODULE ━━━

Create a guided lesson system where a scripted "co-pilot" bot follows a
predefined move script while the player is taught concepts step by step.
Every lesson is tied to authentic Indian cultural wisdom.

━━━ CULTURAL PHILOSOPHY ━━━

Every lesson must end with a moral reflection drawn from one of:
  Bhagavad Gita · Mahabharata · Ramayana · Panchatantra · Chanakya Niti
The connection must be genuine and specific (not generic "ancient wisdom").
Examples that MUST appear in the data:
  Pawn patience → Panchatantra "Tortoise and Geese" (slow steady wins)
  Army setup → Ramayana "Rama's vanara sena" (unity of force)
  Fork attacks → Chanakya Niti "Divide and weaken the enemy"
  King safety → Mahabharata (protect the king above all in Kurukshetra)
  Alliance play → Gita 2.47 "Act without attachment to result"

━━━ LESSON DATA — lessons/lesson-data.js ━━━

window.ChaturangaLessonData = array of lessons. Each lesson:
  {
    id: "L001",
    title: "The Patient Foot Soldier",
    category: "basics" | "opening" | "tactics" | "endgame" |
              "alliance" | "advanced",
    difficulty: "newbie" | "beginner" | "intermediate" | "advanced",
    culturalSource: "Panchatantra — The Tortoise and the Geese",
    moralLesson: "Patience prevents hasty falls. Move with purpose.",
    steps: [
      {
        step: 1,
        narration: "Your Nara (pawn) is like a foot soldier in Ashoka's
                    army. It moves forward one square at a time.",
        instruction: "Move the pawn from a2 to a3.",
        expectedDice: 6,           // null = any dice accepted
        expectedMove: { from: "a2", to: "a3" },
        highlight: ["a2", "a3"],
        arrows: [{ from: "a2", to: "a3", color: "gold" }],
        allowAnyMove: false,
        successMessage: "Well done, warrior! One steady step forward.",
        wrongMessage: "The pawn can only move straight ahead. Try again."
      }
    ],
    completionReward: "Patience Badge — Tortoise of Panchatantra"
  }

Include at least 18 lessons across 6 categories (3 per category):
  Basics (3): Pawn moves, Board orientation, Dice rules
  Opening (3): Centre control, Piece development, Ratha deployment
  Tactics (3): Ratha pin, Ashwa fork, Danti leap attack
  Endgame (3): King activation, Ratha endgame, Pawn promotion
  Alliance (3): Coordinating with teammate, Respawn timing, Sacrifice
  Advanced (3): Asymmetric positions, Zugzwang, Multi-piece combinations

━━━ ENGINE — lessons/lesson-engine.js ━━━

window.ChaturangaLessonEngine = {
  startLesson(lesson):
    Set up board from lesson initial position (defined per lesson).
    Set currentStep = 0.
    Schedule co-pilot bot moves for opponent turns using lesson script.

  validatePlayerMove(from, to):
    If step.allowAnyMove = true: accept anything legal, advance step.
    If step.expectedMove defined: must match exactly.
    Return { valid, successMessage, wrongMessage, stepComplete }

  getCopilotsMove(stepIndex):
    Return the scripted move for the co-pilot at this step.
    Co-pilot always moves instantly (no delay needed in data).

  advanceStep():
    Increment currentStep.
    If currentStep >= lesson.steps.length: lesson complete.
    Update UI: new narration, new highlights, new arrows.

  saveProgress(lessonId, completed, stepsReached):
    localStorage key: 'chaturanga_lessons'
    Schema: { completed: [], inProgress: {id: stepIndex} }

  getNextLesson(currentId):
    Return next uncompleted lesson in same category, or first in next.
}

━━━ UI — lessons/lesson-ui.js ━━━

window.ChaturangaLessonUI = {
  renderLessonBrowser():
    Category tabs: Basics | Opening | Tactics | Endgame | Alliance | Advanced
    Each tab shows lesson cards: title, difficulty pip, completion tick.
    Locked lessons (require prev completion) shown with lock icon.

  renderLessonBoard(state):
    Board + highlighted squares (gold outline glow).
    Arrow overlays drawn as SVG on top of board.
    Narration bubble: top of board, shows current step narration.
    Progress bar: "Step 3 of 7" below narration.

  showNarrationBubble(text, culturalRef):
    Bubble with Cinzel font for cultural quote, Outfit for instruction.
    Gold left-border accent. Smooth fade-in transition.
    Include small cultural source citation in muted text below.

  showStepResult(success, message):
    Success: board flash green, piece animation forward, advance bubble.
    Wrong: board shake animation, wrong message in narration bubble.

  showLessonComplete(lesson):
    Modal: lesson title, moral lesson quote (large, Cinzel font),
    cultural source, badge earned, "Next Lesson" button.
    Background: subtle gold particle animation.

  renderProgressTree():
    Side panel showing 6 category icons with progress circles.
    Each filled proportionally to lessons completed in that category.
}

━━━ PAGE — lessons.html ━━━

Structure:
  Top nav (consistent with rest of project)
  Left panel: lesson browser with category tabs
  Centre: active lesson board with narration overlay
  Right panel: cultural wisdom panel (shows all moral lessons unlocked)

The cultural wisdom panel (right):
  Header: "Wisdom from the Battlefield"
  List of unlocked moral lessons with their sources.
  Empty state: "Complete lessons to unlock ancient wisdom."

Scripts load order:
  <script src="lessons/lesson-data.js"></script>
  <script src="lessons/lesson-engine.js"></script>
  <script src="lessons/lesson-ui.js"></script>

VERIFICATION:
  [ ] lessons.html loads without errors
  [ ] Category tabs filter lesson cards correctly
  [ ] Correct move advances to next step with success message
  [ ] Wrong move shows error without advancing
  [ ] Co-pilot bot makes its scripted moves automatically
  [ ] Lesson complete modal shows correct moral lesson and badge
  [ ] Progress persists in localStorage across page reloads
  [ ] Cultural wisdom panel fills as lessons are completed
```

---

## ═══════════════════════════════════════════════════════════════
## PROMPT 4 — TOURNAMENT SYSTEM
## ═══════════════════════════════════════════════════════════════
**Best model**: Sonnet 4.6 Thinking (bracket logic, ELO math)  
**Files produced**: `tournament/tournament-engine.js` · `tournament/tournament-ui.js` · `tournament.html`

```
[PASTE MASTER CONTEXT BLOCK HERE]

━━━ TASK: BUILD THE LOCAL TOURNAMENT SYSTEM ━━━

A localStorage-backed tournament manager. No backend required. Supports
round-robin, single elimination, and bot championship formats.

━━━ ENGINE — tournament/tournament-engine.js ━━━

window.ChaturangaTournamentEngine = {

  createTournament(config):
    config shape:
      { name, format: 'round-robin'|'single-elim'|'bot-championship',
        participants: [{id, name, type:'human'|'bot', eloLevel, rating}],
        timeControlSeconds: 300 }
    Generate bracket/schedule. Save to localStorage 'chaturanga_tournaments'.
    Return tournamentId (timestamp string).

  generateRoundRobin(participants):
    Every participant plays every other exactly once.
    Return array of rounds, each round = array of {p1, p2, result:null}
    Handle odd numbers: give bye to lowest-rated player.

  generateSingleElim(participants):
    Seed by rating. Generate bracket of 4, 8, or 16.
    If not power of 2: give byes to top seeds in round 1.
    Return bracket tree structure.

  generateBotChampionship():
    Auto-create participants: one bot at each ELO level 100–1000.
    Use round-robin format. Games play automatically without human input.

  recordResult(tournamentId, matchId, winnerId):
    Update match result in localStorage.
    Recalculate standings: wins × 3 + draws × 1.
    If elimination: advance winner to next round.
    Update ELO ratings using standard formula:
      K = 32 (for players with <30 games), 16 otherwise
      Expected = 1 / (1 + 10^((oppRating - myRating) / 400))
      newRating = oldRating + K × (actual - expected)
      actual: win=1, draw=0.5, loss=0

  getStandings(tournamentId):
    Return sorted array by points, then tiebreak by:
    1. Head-to-head result, 2. Wins count, 3. Rating

  exportResults(tournamentId):
    Return markdown string with:
    - Tournament name, format, date
    - Standings table
    - All results table
    - ELO changes per player

  saveAll():
    Persist entire tournaments array to localStorage 'chaturanga_tournaments'
  
  loadAll():
    Return tournaments array from localStorage.
}

━━━ UI — tournament/tournament-ui.js ━━━

window.ChaturangaTournamentUI = {
  renderCreationForm():
    Form fields: name (text), format (select), participants setup.
    Participant rows: add human player (name input) or bot (ELO select).
    "Add Player" and "Add Bot" buttons.
    Show total count. Warn if not valid for chosen format.
    Create button activates when >= 4 participants.

  renderBracket(tournament):
    Round-robin: table grid showing all match results (like standings).
    Single-elim: tree diagram using nested divs (no library needed).
      Columns = rounds, rows = matches, lines connecting winners.
    Bot championship: auto-updating table.

  renderStandings(standings):
    Table: Rank | Name/Bot | Points | W/D/L | Rating Δ
    Highlight current leader in gold.
    Show ELO change (+/- in green/red).

  renderMatchCard(match):
    Card showing p1 vs p2, current result or "Pending".
    If pending and it's a human match: "Play Match" button.
    If pending and bot-vs-bot: "Simulate" button (runs instantly).
    Completed: show winner highlighted, score.

  renderLiveSpectator(tournament, speedMultiplier):
    For bot championship: show one game board at a time.
    Speed control: 1×, 2×, 4× (adjusts setTimeout delay between moves).
    Show current match in standings context.

  showExportModal(markdownText):
    Textarea with the export markdown, pre-selected.
    Copy to clipboard button.
}

━━━ PAGE — tournament.html ━━━

Three tabs:
  "Active" — shows ongoing tournament if one exists
  "Create" — tournament creation form
  "History" — past tournaments with results

Active tournament view:
  Top: tournament name + format badge + round indicator
  Centre: bracket or standings (switch toggle)
  Bottom row: pending match cards

History view:
  List of past tournaments, click to expand results.
  Export button on each.

SIMULATION LOGIC for bot-vs-bot:
  When simulating a match, run the game loop in a setTimeout chain:
    1. Roll dice (random 1-6)
    2. Get bot move using appropriate ChaturangaTieredBot or
       ChaturangaAdvancedBots based on eloLevel
    3. Apply move to a minimal board state
    4. Repeat until game over (king captured or 150 moves)
  Do NOT render a visual board during simulation — just calculate result.
  Show spinner on the match card while simulating.

VERIFICATION:
  [ ] tournament.html loads without errors
  [ ] Can create a 4-player round-robin with 2 humans + 2 bots
  [ ] Standings update correctly after recording a result
  [ ] ELO changes calculated and displayed
  [ ] Single-elimination bracket advances winners correctly
  [ ] Bot championship simulates all matches and shows final standings
  [ ] Export produces valid markdown
  [ ] All data persists in localStorage across reload
```

---

## ═══════════════════════════════════════════════════════════════
## PROMPT 5 — SEER ENGINE (FULL ANALYTICS)
## ═══════════════════════════════════════════════════════════════
**Best model**: Sonnet 4.6 Thinking (algorithmic analysis logic)  
**Files produced**: `js/seer.js` + edits to `js/game.js` + `js/ui.js` for right panel

```
[PASTE MASTER CONTEXT BLOCK HERE]

━━━ TASK: BUILD FULL SEER ENGINE ANALYTICS ━━━

The Seer Engine analyses game play in real time and post-game.
Currently game.html has a stub "Battle Intel" panel on the right.
Replace the stub with the full implementation.

━━━ TRACKING (add to js/game.js) ━━━

Create a game.seerData object initialised at game start:
  {
    moveHistory: [],        // push each move record
    captureCount: 0,
    pieceCaptureCounts: {}, // {type: count}
    materialBalance: [],    // material diff after each move
    turningPoint: null      // auto-detected
  }

After every legal move, push to moveHistory:
  {
    moveNumber: int,
    player: 0|1|2|3,
    from: string, to: string,
    pieceMoved: string,
    captured: string|null,
    dice: int,
    materialBalanceAfter: int,  // ally material - enemy material
    timestamp: Date.now()
  }

materialBalance = sum of all ally piece values - sum of all enemy piece values
(use PIECE_VALUES: pawn=1, horse=3, elephant=3, rook=5, ignore king)

━━━ SEER MODULE — js/seer.js ━━━

window.ChaturangaSeer = {

  detectTurningPoint(moveHistory):
    Find the move with the largest absolute delta in materialBalance
    vs the previous move. That is the turning point.
    Return the move record or null if < 3 moves played.

  getInsightAnnotation(moveRecord, game):
    Return a plain-language string describing the move.
    Examples:
      Capture of high-value piece → "Red captured Blue's Ratha! (+5 pts)"
      King moved into danger → "Warning: Raja moved toward enemy territory"
      Forced forfeit → "Yellow had no legal Danti moves — turn forfeited"
      First capture → "First blood! The battle has truly begun."
    Keep annotations short (max 12 words).

  getMoveQuality(moveRecord, previousBestMove):
    Compare moveRecord to previousBestMove (from ELO 600 bot evaluation).
    Return: 'excellent' | 'good' | 'inaccuracy' | 'blunder'
    Thresholds (material score delta vs optimal):
      excellent: within 0.5 of optimal
      good: within 2.0
      inaccuracy: within 5.0
      blunder: > 5.0 worse than optimal

  analyseLastMove(game):
    After a human move: call ChaturangaTieredBot.getMove to get what
    ELO 600 would have played. Compare. Return quality + annotation.
    Use applyMoveTemp/undoMoveTemp — never actually change game state.

  exportGameReport(game):
    Return a markdown string:
      # Chaturanga Game Report — [date]
      ## Summary
      Moves played, pieces captured, game duration
      ## Turning Point
      "Move 23: Red captured Blue's Ratha, shifting the balance by +5"
      ## Move Quality (Human players only)
      Table: Move | Piece | From→To | Quality | Bot's choice
      ## Material Balance
      Text description of how material shifted
      ## Most Hunted Piece
      Whichever piece type was captured most often

  getTopPieceCaptured(moveHistory):
    Count captures by piece type. Return the most captured type name.

  updatePanel():
    Called after every move. Refresh the right panel HTML:
      Moves played count
      Pieces taken count
      Most hunted piece
      Current material balance indicator (+/- X pts)
      Turning point (if detected): brief description
      Last move annotation
      "Export Report" button
}

━━━ HISTORICAL VAULT ━━━

Add to js/seer.js:
  ChaturangaSeer.saveGame(game):
    Serialize game.seerData + outcome to localStorage key 'chaturanga_vault'
    Store as array (max 20 games, drop oldest). Each entry:
    { date, winner, totalMoves, turningPoint, materialSwings, moveHistory }

  ChaturangaSeer.getVault():
    Return array from localStorage, newest first.

Add "History" tab to right panel:
  List of saved games: date, winner badge, move count.
  Click → expand to show turning point + export button.
  "Clear Vault" button at bottom.

━━━ INTEGRATION ━━━

In js/game.js:
  - Initialise game.seerData at game start
  - Push move records after every legal move
  - Call ChaturangaSeer.updatePanel() after every move
  - On game over: call ChaturangaSeer.saveGame(game)

In right panel HTML (game.html):
  Replace the .seer-panel contents with:
    Stats row: moves | captures | most hunted | material balance
    Insight line: last move annotation
    Turning point indicator (hidden until detected)
    Two tabs: "Live" (current game) | "History" (vault)
    Export button

VERIFICATION:
  [ ] After first move, move count shows 1
  [ ] After a capture, captures count increments
  [ ] Material balance shows correct value
  [ ] Move annotation appears for each move
  [ ] Turning point detects the largest material swing
  [ ] Export button copies markdown report
  [ ] Vault saves games on game over
  [ ] History tab lists saved games
  [ ] Clicking a vault game shows its turning point
```

---

## ═══════════════════════════════════════════════════════════════
## PROMPT 6 — ANTI-CHEAT & SECURITY
## ═══════════════════════════════════════════════════════════════
**Best model**: Sonnet 4.6 Thinking (security logic, statistical analysis)  
**Files produced**: `js/anticheat.js` + optional `admin.html`

```
[PASTE MASTER CONTEXT BLOCK HERE]

━━━ TASK: IMPLEMENT ANTI-CHEAT AND FAIR PLAY SYSTEM ━━━

For local play this is a statistical fairness monitor. For future
multiplayer it provides the foundation for server-side validation.
Philosophy: "Honour in battle" — dharma from Indian epics. Cheating
is adharma; the system detects it without false accusation.

━━━ MODULE — js/anticheat.js ━━━

window.ChaturangaAntiCheat = {

  init():
    Attach to game.seerData.moveHistory (must exist).
    Start recording per-player metrics.

  recordMoveTime(player, durationMs):
    Store array of move durations per player.
    Used for timing anomaly detection.

  analysePlayer(playerIndex, moveHistory):
    Returns a suspicion report object:
    {
      player: int,
      avgMoveTimeMs: float,
      movesAnalysed: int,
      engineCorrelation: float,   // 0.0 to 1.0
      suspicionLevel: 'clean'|'watch'|'flag',
      reasons: string[]
    }

    ENGINE CORRELATION:
      For each human move, check if it matches what ELO 600 bot would
      play (via ChaturangaTieredBot.getMove on a temp copy of game).
      Track: matchCount / totalMoves. 
      Threshold: >0.85 over 10+ moves = 'flag'
      (Random expected correlation ~0.35 at ELO 600)

    TIMING ANALYSIS:
      Average move time < 800ms consistently = suspicious (too fast)
      Perfectly consistent timing (variance < 100ms) = suspicious
      These add to reasons array but do not flag alone.

    SUSPICION LEVELS:
      clean: engineCorrelation < 0.65 or < 5 moves analysed
      watch: engineCorrelation 0.65–0.85
      flag:  engineCorrelation > 0.85 AND movesAnalysed >= 10

  showFairPlayNotice(playerIndex):
    If suspicionLevel = 'flag': show a subtle non-accusatory notice:
      "Unusual move accuracy detected for [player]. 
       Ensuring a fair game for everyone."
    Style: small banner below player card, gold border, no alarm icon.
    Dismiss button. Never block gameplay.

  getFairPlayReport():
    Return full analysis for all human players.
    Used by admin.html if present.

  exportFairPlayLog():
    Return JSON of all per-player metrics for the session.
}

━━━ ADMIN PAGE (admin.html) — OPTIONAL BUT INCLUDE ━━━

Simple password-protected page (password = 'chaturanga-admin'):
  Show fair play reports from last 5 saved games (from vault).
  Per-game: list each human player's suspicion level.
  Suspicious games flagged with gold ⚠ icon.
  Each game expandable: shows move correlation stats.
  Export all data as JSON button.

Password gate: simple prompt() — not real security, just a basic gate
since this is a local-play app currently.

━━━ INPUT SANITISATION ━━━

Add to js/game.js move handler:
  Validate all user-input moves server-side style before applying:
    - from and to must be strings matching /^[a-h][1-8]$/
    - game.board.get(from) must exist and be owned by current player
    - to must be in game.getLegalMoves(from)
    - game.forcedPiece must match piece type at from (or be 'any'/'pawn-king')
  Reject silently (no error message to user — just ignore the move).
  Log rejected moves to console in development.

━━━ RATE LIMITING (in-memory, for future multiplayer prep) ━━━

Add to anticheat.js:
  ChaturangaAntiCheat.rateLimiter = {
    lastMoveTime: {},     // { player: timestamp }
    minIntervalMs: 200,   // minimum 200ms between moves

    check(player):
      const now = Date.now();
      const last = this.lastMoveTime[player] || 0;
      if (now - last < this.minIntervalMs) return false;
      this.lastMoveTime[player] = now;
      return true;
  }
  Apply in move handler: if !rateLimiter.check(player) return early.

VERIFICATION:
  [ ] anticheat.js loads without errors
  [ ] After 10 moves by same player, analysePlayer returns a report
  [ ] Bot vs bot game correctly shows no human player concerns
  [ ] Move input validation rejects invalid square strings
  [ ] Rate limiter prevents double-move on rapid clicks
  [ ] Admin page prompts for password
  [ ] Fair play notice appears (manually test by setting threshold to 0)
  [ ] Notice can be dismissed without interrupting game
```

---

## ═══════════════════════════════════════════════════════════════
## PROMPT 7 — CUSTOM ARMY BUILDER
## ═══════════════════════════════════════════════════════════════
**Best model**: Gemini 2.5 Pro High (UI-heavy, large standalone page)  
**Files produced**: `army_builder.html` + edits to `js/game.js`

```
[PASTE MASTER CONTEXT BLOCK HERE]

━━━ TASK: BUILD CUSTOM ARMY BUILDER ━━━

Standalone page (army_builder.html) where players design custom armies
within a point budget before the game begins. Three board sizes, two
formats. Guptchar (spy piece) exclusive to 10×10 and 12×12 2-player.

━━━ POINT BUDGETS ━━━

  Ashtapada 8×8,  2-player: 30 pts  (2 Danti + 2 Ashwa + 2 Ratha + 8 Nara)
  Ashtapada 8×8,  4-player: 15 pts  (half)
  Dasapada  10×10, 2-player: 43 pts  (3 Danti + 3 Ashwa + 3 Ratha + 10 Nara)
  Dasapada  10×10, 4-player: 21 pts  (half)
  Vrihadapada 12×12, 2-player: 51 pts  (4 Danti + 4 Ashwa + 3 Ratha + 12 Nara)
  Vrihadapada 12×12, 4-player: 25 pts  (half)

PIECE COSTS: Pawn=1, Horse=3, Elephant=3, Rook=5, King=free (required)

━━━ GUPTCHAR (SPY PIECE) — DASAPADA + VRIHADAPADA, 2-PLAYER ONLY ━━━

  - One optional spy per player
  - Cannot be pawn or king
  - To opponent: looks like any normal piece
  - When captured by opponent (not by opponent's king):
    the capturing piece is SIMULTANEOUSLY also removed
  - Owner sees spy square with light red (#e74c3c, 30% opacity) highlight
  - Opponent's board view: NO highlight on that square
  - localStorage stores which square is the spy

━━━ PAGE LAYOUT ━━━

Config bar (top): Board size select | Format select | Reset | Undo | Begin Battle
Left panel (220px): Player tabs | Point budget display | Piece palette | 
                    Guptchar section (hidden for 8×8) | Mark Ready button
Centre: Board with placement zone highlights + placed pieces
Right panel (200px): Per-player army status bars + rules reference

━━━ PLACEMENT ZONES ━━━

  8×8, 2-player:  Player 0 = rows 1–3 (red zone), Player 1 = rows 6–8
  8×8, 4-player:  Player 0 = rows 1–3, Player 1 = right 3 files,
                  Player 2 = rows 6–8, Player 3 = left 3 files
  10×10, 2-player: Player 0 = rows 1–3, Player 1 = rows 8–10
  12×12, 2-player: Player 0 = rows 1–4, Player 1 = rows 9–12

Zones shown as coloured board squares:
  Player 0 = rgba(231,76,60,.25)   Player 1 = rgba(52,152,219,.25)
  Player 2 = rgba(39,174,96,.25)   Player 3 = rgba(243,156,18,.25)

━━━ INTERACTIONS ━━━

Click piece in palette → select it (highlighted border)
Click valid zone square → place selected piece
Click placed own piece → remove it (refund cost)
Click placed own piece in Guptchar mode → designate as spy
Mark Ready → validate raja placed → lock this player → switch to next

━━━ LAUNCH FLOW ━━━

When all players ready → show modal with army preview per player
"Launch Battle" → save to localStorage + redirect or alert to game

localStorage schema (key: 'chaturanga_custom_army'):
  {
    boardSize: 8|10|12,
    numPlayers: 2|4,
    armies: [{ player, pieces: [{sq, type, player}], guptchar: sq|null }],
    timestamp: Date.now()
  }

━━━ GAME.JS INTEGRATION ━━━

At the TOP of the game initialisation function, before setting up the
default board:
  const customArmy = localStorage.getItem('chaturanga_custom_army');
  if (customArmy) {
    try {
      const config = JSON.parse(customArmy);
      if (Date.now() - config.timestamp < 300000) { // 5 min window
        applyCustomArmy(config);
        localStorage.removeItem('chaturanga_custom_army');
        return; // skip default setup
      }
    } catch(e) { console.warn('Custom army parse error', e); }
  }

function applyCustomArmy(config):
  Clear entire board.
  For each army in config.armies:
    Place each piece on its sq.
    If army.guptchar: game.guptcharSquares = game.guptcharSquares || {};
                      game.guptcharSquares[army.player] = army.guptchar;

In the capture handler (where a piece landing on an occupied square
removes the occupant), ADD this block immediately after capture confirmed:
  if (game.guptcharSquares) {
    const spySq = game.guptcharSquares[capturedPiece.owner];
    if (spySq === toSquare && capturingPiece.type !== 'king') {
      game.board.set(fromSquare, null); // remove capturing piece too
      // Show brief notification: "Guptchar! Spy revealed!"
    }
  }

VERIFICATION:
  [ ] army_builder.html loads without errors
  [ ] 8×8 2P shows budget 30, 10×10 2P shows 43, 12×12 2P shows 51
  [ ] 4P budgets are exactly half
  [ ] Guptchar section hidden on 8×8, visible on 10×10 and 12×12 2P
  [ ] Pawn and King cannot be set as Guptchar
  [ ] Mark Ready blocked if no Raja placed
  [ ] Budget goes negative if overspent (red colour)
  [ ] Undo restores previous army state correctly
  [ ] localStorage has correct schema after launch
  [ ] game.js reads custom army on init (test manually)
  [ ] Guptchar interception works (test by capturing the spy)
```

---

## ═══════════════════════════════════════════════════════════════
## PROMPT 8 — ONLINE MULTIPLAYER (WEBSOCKET)
## ═══════════════════════════════════════════════════════════════
**Best model**: Sonnet 4.6 Thinking (architecture, state sync, reconnection logic)  
**Files produced**: `server-ws.js` · `js/ws-client.js` + edits to `game.html` + `js/game.js`

```
[PASTE MASTER CONTEXT BLOCK HERE]

━━━ TASK: IMPLEMENT ONLINE MULTIPLAYER ━━━

Architecture:
  Server: Node.js + 'ws' npm package (no Socket.IO, no Express)
  Authoritative: Server owns game state. Clients are display-only.
  Rooms: 4-player rooms with 6-character alphanumeric join code
  Chat: Text-only, in-game sidebar
  Reconnection: 60-second grace period

━━━ SERVER — server-ws.js ━━━

Extend the existing server.js static file server with a WebSocket
server running on port 8766 (separate from HTTP port 8765).

Data structures (in-memory):
  rooms = Map<code, Room>
  Room = {
    code: string,           // 6-char e.g. "CHTR42"
    players: [null,null,null,null],  // null = empty slot
    spectators: [],
    gameState: null,        // full serialised board
    chat: [],               // last 50 messages
    status: 'lobby'|'playing'|'finished',
    createdAt: timestamp,
    settings: { mode, eloLevel }
  }
  Player = { ws, name, colour: 0|1|2|3, connected: bool, disconnectTime }

Message protocol — Client → Server:
  { type: "create_room", name, settings }
    → Response: { type: "room_created", code, colour: 0 }

  { type: "join_room", code, name }
    → Response to joiner: { type: "room_joined", code, colour: int,
                             players: [...] }
    → Broadcast to room: { type: "player_joined", name, colour }

  { type: "start_game" }  (only room creator)
    → Broadcast: { type: "game_started", initialBoard }

  { type: "roll_dice", roomCode }
    → Server validates it's this player's turn
    → Broadcast: { type: "dice_rolled", player: int, face: int,
                   forcedPiece: string }

  { type: "move", from, to }
    → Server validates move legality (full rules check server-side)
    → If valid: Broadcast { type: "move_applied", from, to, player,
                             newBoard, nextPlayer, captured }
    → If invalid: send { type: "move_rejected", reason } to sender only

  { type: "chat", message }
    → Sanitise (max 200 chars, strip HTML)
    → Broadcast: { type: "chat_message", name, message, timestamp }

  { type: "forfeit_turn" }
    → Broadcast: { type: "turn_forfeited", player, forfeitCount }

Server → Client broadcasts:
  { type: "room_state", players, spectators, status, settings }
  { type: "game_over", winner, winnerTeam }
  { type: "player_disconnected", colour, gracePeriodSeconds: 60 }
  { type: "player_reconnected", colour }

RECONNECTION:
  On disconnect: mark player.connected = false, store disconnect time
  Keep their slot for 60 seconds
  If they reconnect with same name + code within 60s: restore slot,
  send full game state so they can re-sync
  After 60s: remove player, broadcast player_left, if < 2 players pause game

SERVER-SIDE VALIDATION:
  For every 'move' message, the server must independently verify:
    - It is this player's turn (turnIndex matches)
    - The piece at 'from' belongs to this player
    - 'to' is in the legal moves for 'from'
    - The piece type matches forcedPiece
  Never trust the client's move without server verification.

━━━ CLIENT — js/ws-client.js ━━━

window.ChaturangaWS = {
  connect(serverUrl):
    Open WebSocket to 'ws://localhost:8766'
    Set up message handler routing by type.

  createRoom(playerName, settings):
    Send create_room message.
    On room_created: store code, show lobby UI.

  joinRoom(code, playerName):
    Send join_room message.
    On room_joined: store code and colour assignment.

  sendMove(from, to):
    Only send if it is our colour's turn.
    Send { type: "move", from, to }
    Disable board interaction while waiting for server response.
    On move_applied: update board from server's authoritative state.
    On move_rejected: re-enable board, show error toast.

  sendRollDice():
    Send { type: "roll_dice", roomCode }
    On dice_rolled: update dice display, set forcedPiece.

  onDisconnect():
    Show reconnection banner: "Connection lost. Reconnecting..."
    Attempt reconnect every 3 seconds for 60 seconds.
    On success: send join_room with same name+code to re-authenticate.
    After 60s failure: show "Game ended due to disconnection."

  onMessage(data):
    Route by data.type to appropriate handler.
    All board updates come from server — never update board from
    your own move optimistically.
}

━━━ LOBBY UI ADDITIONS TO game.html ━━━

Add a "Multiplayer" button to the top nav.
Clicking it shows a multiplayer modal with two states:

State 1 — Join/Create:
  "Create Room" button → prompts for name → shows 6-char code
  "Join Room" input → enter 6-char code + name → join

State 2 — Lobby (room created/joined):
  Shows room code (large, copyable)
  Shows 4 player slots: filled (name + colour) or "Waiting..."
  Shows spectator count
  "Start Game" button (only for creator, only when 2+ players joined)
  Chat sidebar (small, collapsible)

━━━ GAME MODE DETECTION ━━━

Add game.isOnline = false flag.
When WS game starts: set game.isOnline = true.
In move handler: if game.isOnline, send move to server instead of
applying locally. Wait for server's move_applied to update board.
Roll dice button: if online, send roll_dice to server.
Bot dispatch: if game.isOnline, bots are disabled.

VERIFICATION:
  [ ] server-ws.js runs alongside server.js without port conflict
  [ ] Two browser tabs can create + join the same room
  [ ] Dice roll is broadcast and both tabs update
  [ ] Legal move on one tab updates board on both tabs
  [ ] Illegal move on one tab is rejected (no board update)
  [ ] Chat messages appear on both tabs
  [ ] Disconnecting one tab shows reconnection banner on both
  [ ] Reconnecting within 60s restores the player's slot
  [ ] Game over is broadcast to all tabs
```

---

## ═══════════════════════════════════════════════════════════════
## PROMPT 9 — UI/UX POLISH
## ═══════════════════════════════════════════════════════════════
**Best model**: Gemini 2.5 Pro High (CSS, animations, theme generation)  
**Files produced**: `css/themes.css` · edits to `css/styles.css` · `js/ui-enhancements.js`

```
[PASTE MASTER CONTEXT BLOCK HERE]

━━━ TASK: UI/UX POLISH PASS ━━━

━━━ THEME SYSTEM ━━━

Create css/themes.css with three themes. Themes override only CSS
variables — no structural changes.

Theme 1 — Classic (default, already implemented):
  --gold: #c9a84c; --dark: #0f0c07; --dark2: #1a1306; etc.

Theme 2 — Night (deeper, starker):
  --gold: #e8c96a           (brighter gold on deep black)
  --dark: #000000           (pure black)
  --dark2: #0a0a0a          (near-black surface)
  --dark3: #141414          (card surface)
  --border: rgba(232,201,106,0.18)
  Board light squares: #2a2a2a  Board dark squares: #1a1a1a

Theme 3 — Parchment (aged paper, daytime):
  --gold: #8b6914           (dark warm gold)
  --dark: #f4ead4           (cream background — INVERTED light theme)
  --dark2: #ede3c4          (lighter parchment)
  --dark3: #e6d9b0          (card surface)
  --border: rgba(139,105,20,0.22)
  --text: #2c1810           (dark brown for text)
  Board light squares: #f0d9b5  Board dark squares: #b58863

Theme switcher:
  Add three theme buttons to the settings drawer.
  Apply theme by adding class 'theme-night' or 'theme-parchment' to
  <body>. Default (classic) = no class.
  Persist selection in localStorage 'chaturanga_theme'.
  Apply on page load before first render to avoid flash.

━━━ PIECE TOOLTIPS ━━━

Add to js/ui-enhancements.js:
  On mouseenter of any board square with a piece:
    Show a tooltip card near the piece (not overlapping the board).
    Tooltip contains:
      Piece name (Sanskrit + English): "Ratha — Rook"
      Point value: "Value: 5 pts"
      Movement description: "Slides any number of squares orthogonally"
      Small ASCII diagram of movement pattern (5×5 grid with X marks)
    Tooltip hides on mouseleave with 150ms fade-out delay.
  
  Movement ASCII patterns:
    Ratha:  "· X ·\nX · X\n· X ·" — wait, that's for horse
    Ratha:  ". ↑ .\n← · →\n. ↓ ." — orthogonal slides
    Ashwa:  "· ♞ ·\n♞ · ♞" — L-shapes
    Danti:  "✕ · ✕\n· · ·\n✕ · ✕" — 2-diagonal leaps
    etc.
  Keep them simple — just describe in text if ASCII is unclear.

━━━ BOARD ANIMATIONS ━━━

In js/ui-enhancements.js:
  Piece move animation:
    When a piece moves, briefly float it above the board (translateY -8px,
    scale 1.1, duration 150ms) then land at destination.
    Use CSS transitions — no library needed.

  Capture animation:
    Captured piece briefly scales up to 1.3, then fades out (duration 200ms).

  Dice roll animation:
    On dice roll: rotate the dice icon element 360° in 400ms.
    Then snap to the result face icon.

  King in danger:
    If king is on a threatened square: add pulsing red glow to that square.
    Class: 'sq-danger' → box-shadow: 0 0 12px rgba(231,76,60,0.7)
    Pulse: alternate 0.7 and full opacity, 1s cycle.

━━━ ACCESSIBILITY ━━━

Add ARIA attributes:
  Board squares: role="gridcell", aria-label="[file][rank], [piece] or empty"
  Selected piece: aria-selected="true"
  Turn indicator: aria-live="polite" (updates are announced)
  Game status: aria-live="assertive" for game over

Keyboard navigation:
  Tab moves focus through board squares.
  Enter/Space on a square: selects piece or applies move.
  Arrow keys: move focus around the board.
  Escape: deselect piece.

━━━ PWA SUPPORT ━━━

Create manifest.json:
  { "name": "Chaturanga", "short_name": "चतुरंग",
    "start_url": "/game.html", "display": "standalone",
    "background_color": "#0f0c07", "theme_color": "#c9a84c",
    "icons": [{ "src": "icon-192.png", "sizes": "192x192" }] }

Create sw.js (service worker):
  Cache on install: game.html, js/game.js, all CSS files, all engine files,
  all bot files. Version the cache: 'chaturanga-v1.0.4'.
  Serve from cache, fall back to network.
  This enables offline play vs bots after first load.

Add to game.html <head>:
  <link rel="manifest" href="manifest.json">
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  </script>

━━━ RESPONSIVE BOARD ━━━

In css/styles.css add at bottom:
  @media (max-width: 768px) {
    .game-layout { flex-direction: column; }
    .panel-left, .panel-right { width: 100%; height: auto; }
    .board-center { order: -1; }
    .sq { width: calc((100vw - 32px) / 8); height: calc((100vw - 32px) / 8); }
  }
  @media (max-width: 480px) {
    .top-nav .nav-logo-text, .top-nav .nav-logo-sub { display: none; }
    .nav-roll-btn span { display: none; }
  }

VERIFICATION:
  [ ] Theme switcher in settings changes board and UI colours
  [ ] Theme persists across page reload
  [ ] Piece tooltips appear on hover, hide on mouseout
  [ ] Move animation plays on piece move
  [ ] Capture animation plays on piece capture
  [ ] Dice roll animation plays on roll
  [ ] King danger pulsing glow appears when king is threatened
  [ ] Board is navigable with keyboard (Tab + Enter/Space)
  [ ] manifest.json loads without errors
  [ ] Service worker registers and caches files
  [ ] Game playable offline after first load
  [ ] Board fits on 375px wide mobile without horizontal scroll
```

---

## ═══════════════════════════════════════════════════════════════
## PROMPT 10 — RL PRETRAINING PIPELINE (PHASE 1)
## ═══════════════════════════════════════════════════════════════
**Best model**: Sonnet 4.6 Thinking (ML architecture) + Gemini for data generation code  
**Files produced**: `phase1_pretraining.py` · `chaturanga_env.py` (optional split)

```
[PASTE MASTER CONTEXT BLOCK HERE]

━━━ TASK: RL PHASE 1 — SUPERVISED PRETRAINING ━━━

Create a standalone Python script (no connection to the JS game yet)
that generates training data from a heuristic oracle and trains a
policy-value network via behavioural cloning.

━━━ WHY THIS APPROACH ━━━

Starting PPO from random play on a 4-player stochastic game wastes
thousands of games on near-random noise. Instead:
  1. Generate oracle games using a Python reimplementation of the
     ELO 600 bot heuristics
  2. Train the network to imitate those moves (behavioural cloning)
  3. The result: chaturanga_bc.pth — a warm-start policy that already
     plays decent moves from turn 1

━━━ GAME ENVIRONMENT CLASS ━━━

class ChaturangaEnv:
  Implements the full game rules in Python:
    - 8×8 board as Dict[str, Optional[Piece]]
    - 4 players: {id, eliminated, frozen, team, forfeits}
    - roll_dice() → sets self.forced_piece
    - get_legal_moves(sq) → List[str]  (all target squares)
    - get_all_legal_moves() → List[Tuple[str,str]]  (respects forced_piece)
    - apply_move(from_sq, to_sq)
    - get_state_tensor() → np.ndarray shape [8, 8, 40]
    - get_action_mask() → np.ndarray shape [4096] bool
    - reset() → initial state

  Piece movement rules (must match JS engine exactly):
    Rook: slides orthogonally any distance, blocked by pieces
    Horse: L-shape (±1,±2 or ±2,±1), jumps over pieces
    Elephant: exactly 2 diagonal squares, jumps over pieces
    King: one step any direction
    Pawn: one step forward (direction per player), diagonal capture only

  Capture rules (Chaturanga-specific — same as JS):
    No self-capture
    King cannot capture king
    Minor pieces (pawn/horse/elephant) cannot capture minor pieces

  State tensor channels [8, 8, 40]:
    0–4:   Player 0 piece planes (one per piece type, binary)
    5–9:   Player 1 piece planes
    10–14: Player 2 piece planes
    15–19: Player 3 piece planes
    20–23: Turn one-hot (broadcast to all 64 squares)
    24–29: Dice face one-hot (broadcast)
    30–33: Eliminated flags per player (broadcast)
    34–39: Reserved (zeros)

  Action encoding:
    move_to_action(from_sq, to_sq) = sq_to_flat(from_sq) * 64 + sq_to_flat(to_sq)
    Total: 4096 actions (most masked illegal)

━━━ ORACLE POLICY ━━━

def greedy_oracle(env) → Optional[Tuple[str, str]]:
  Score each legal move:
    +captured_piece_value * 10 if capture
    +centre_bonus(to_sq)  (Chebyshev distance from 3.5,3.5) * 0.3
    +random.random() * 0.3  (tiebreak noise, matches JS ELO 600 style)
  Return the highest-scoring move.

━━━ NEURAL NETWORK — ChaturangaNet(nn.Module) ━━━

Input:  [B, 40, 8, 8]  (channels first after permuting state tensor)

Trunk:
  Conv2d(40→256, 3×3, pad=1) + BatchNorm2d + ReLU
  10 × ResBlock(256 filters, 3×3)

Policy head:
  Conv2d(256→2, 1×1) + BN + ReLU
  Flatten → Linear(128, 4096)
  (softmax applied at inference time after masking illegal actions)

Value head:
  Conv2d(256→1, 1×1) + BN + ReLU
  Flatten → Linear(64, 256) → ReLU → Linear(256, 1) → Tanh

ResBlock:
  conv1 = Conv2d(C, C, 3, padding=1, bias=False)
  bn1   = BatchNorm2d(C)
  conv2 = Conv2d(C, C, 3, padding=1, bias=False)
  bn2   = BatchNorm2d(C)
  forward(x): out = relu(bn1(conv1(x))); return relu(bn2(conv2(out)) + x)

━━━ TRAINING LOOP ━━━

def generate_episodes(num_episodes=2000, max_steps=200):
  For each episode: reset env, roll dice, get oracle move,
  record (state_tensor, action_int), apply move, repeat.
  Return list of (state, action) pairs.

def train_bc(dataset, epochs=30, batch=256, lr=1e-3):
  Loss: F.cross_entropy(policy_logits, action_targets)
  Optimiser: Adam, weight_decay=1e-4
  LR schedule: CosineAnnealingLR over all epochs
  Gradient clip: nn.utils.clip_grad_norm_(model.params, 1.0)
  Log: epoch number, loss, current LR per epoch
  Save: torch.save checkpoint to chaturanga_bc.pth

def evaluate_model(model, num_games=50):
  Model (player 0) vs greedy oracle (players 1,2,3).
  Count wins (team 0 = Red+Green wins).
  Report win rate. Target: >40% indicates successful pretraining.

━━━ CLI INTERFACE ━━━

argparse flags:
  --generate N    number of oracle episodes (default 2000)
  --epochs N      training epochs (default 30)
  --batch N       batch size (default 256)
  --lr FLOAT      learning rate (default 1e-3)
  --save PATH     checkpoint path (default chaturanga_bc.pth)
  --eval          run evaluation after training
  --data-path     path to save/load dataset .npy
  --load-data     skip generation, load existing dataset

Typical usage:
  pip install torch numpy tqdm
  python phase1_pretraining.py --generate 2000 --epochs 30 --eval

━━━ PHASE 2 NOTES (future, do not implement now) ━━━

After Phase 1, the path to Phase 2 is:
  Load chaturanga_bc.pth as warm-start policy
  Run PPO self-play: one network plays all 4 sides
  Reward: +1 win team, -1 loss team, +0.01 per capture
         -0.01 per piece lost, +0.001 per pawn advance
  Use GAE (lambda=0.95, gamma=0.99) for advantage estimation
  PPO clip epsilon=0.2, value loss coeff=0.5, entropy coeff=0.01

VERIFICATION:
  [ ] Script runs: python phase1_pretraining.py --help shows options
  [ ] ChaturangaEnv.reset() returns shape (8, 8, 40) tensor
  [ ] get_action_mask() returns exactly as many True values as legal moves
  [ ] generate_episodes(10) runs without error
  [ ] With PyTorch: train_bc runs for 1 epoch
  [ ] Without PyTorch: script prints install instructions cleanly
  [ ] Checkpoint .pth file is created and loadable
  [ ] evaluate_model prints a win rate percentage
```

---

## ═══════════════════════════════════════════════════════════════
## QUICK REFERENCE — MODEL ROUTING GUIDE
## ═══════════════════════════════════════════════════════════════

| Prompt | Feature | Best Model | Why |
|--------|---------|-----------|-----|
| 1 | Advanced Bots 700–1000 | **Sonnet 4.6 Thinking** | Multi-step search algorithm design |
| 2 | Puzzle System | **Gemini 2.5 Pro High** | Large data + UI generation |
| 3 | Lessons + Culture | **Gemini 2.5 Pro High** | Long multilingual content |
| 4 | Tournament System | **Sonnet 4.6 Thinking** | Bracket logic, ELO maths |
| 5 | Seer Analytics | **Sonnet 4.6 Thinking** | Statistical analysis algorithms |
| 6 | Anti-Cheat | **Sonnet 4.6 Thinking** | Security reasoning, edge cases |
| 7 | Army Builder | **Gemini 2.5 Pro High** | Complex UI, large standalone HTML |
| 8 | Online Multiplayer | **Sonnet 4.6 Thinking** | Arch decisions, state sync |
| 9 | UI/UX Polish | **Gemini 2.5 Pro High** | CSS, animations, themes |
| 10 | RL Pretraining | **Sonnet 4.6 Thinking** | ML architecture |

### Tips for Sonnet 4.6 Thinking
- Let it think before asking follow-ups. The thinking block often
  pre-empts your question.
- For bot logic: paste the existing `tieredBots.js` in full so it
  sees the exact pattern to follow.
- For architecture questions: ask "what are the tradeoffs" — thinking
  mode shines here.
- One task per conversation — do not mix Prompt 1 and Prompt 4.

### Tips for Gemini 2.5 Pro High
- Excellent at generating long complete files in one pass.
- Paste the full `game.html` for UI prompts so it matches style.
- Ask it to "write the entire file, no truncation" explicitly.
- Good for iterative CSS: paste your current styles and ask for diffs.
- For cultural content (Prompt 3): it handles multilingual text well.

### General Rules
- Always paste the Master Context Block first in every session.
- Always include the file you're modifying when asking for edits.
- After each prompt: run the verification checklist before moving on.
- Never mix "create new file" and "edit existing file" in one prompt.
- If the AI truncates output, say: "Continue from [last line]" — do
  not start a new conversation, or context is lost.

---

*Chaturanga v1.0.4 Master Prompt File — March 2026*  
*"The true warrior masters not just the pieces, but the patterns between them."*
