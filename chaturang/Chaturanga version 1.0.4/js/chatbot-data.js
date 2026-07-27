/**
 * Chaturanga — Acharya Drona Chatbot (Local, No API)
 * Comprehensive keyword/pattern matching in Drona's voice.
 * Covers: piece movements, dice, capture rules, strategy,
 *         vyuha formations, bot tiers, alliance rules, and more.
 */
globalThis.ChaturangaChatbot = (function () {
  'use strict';

  // ── Response bank ──────────────────────────────────────────────────────────
  const RULES = [

    // ── Greetings ─────────────────────────────────────────────────────────
    {
      match: /^(hello|hi|hey|pranam|namaste|greetings|salutations)/i,
      reply: `Pranam, young warrior! I am Acharya Drona — teacher of the Pandavas and Kauravas, and now your guide through the ancient game of Chaturanga. Ask me anything: piece movements, the dice law, vyuha formations, strategy, or the history of this sacred board. I am here to illuminate your path.`
    },
    {
      match: /who are you|your name|acharya|drona/i,
      reply: `I am Acharya Drona — the Brahmin warrior who taught archery and strategy to both the Pandavas and Kauravas at Hastinapura. In this incarnation, I teach the ancient game of Chaturanga: the four divisions of the Mauryan army — Ratha (chariot), Ashwa (cavalry), Danti (elephant corps), and Nara (infantry). Ask, and I shall teach.`
    },
    {
      match: /thank|thanks|dhanyavad|shukriya/i,
      reply: `The student's gratitude honours the teacher. But remember — the true reward is your growth on the Ashtāpada. Return whenever you face a puzzle you cannot solve. I am always here.`
    },
    {
      match: /help|what can you|what do you know|topics/i,
      reply: `I can guide you on:\n• Piece movements — how Nara, Ashwa, Danti, Ratha, and Raja move\n• Dice rules — which piece each face forces you to move\n• Capture rules — what can capture what in Chaturanga\n• Strategy — opening principles, endgame technique, tactical patterns\n• Vyuha formations — Chakravyuha, Garuda, Kurma, and 22 others\n• Alliance play — team coordination, Raja respawn timing\n• Bot difficulty — what each ELO level uses and how to beat it\n\nAsk me anything, student.`
    },

    // ── Pawn / Nara ────────────────────────────────────────────────────────
    {
      match: /\b(pawn|nara|foot soldier|infantry)\b.*move|how.*\b(pawn|nara)\b/i,
      reply: `The Nara (Pawn) — the foot soldier of Chandragupta's army — moves one square straight forward each turn. It never retreats; it never moves sideways. However, it captures by moving one square diagonally forward — different from its normal march. When a Nara reaches the farthest rank, it promotes to a Ratha (Rook), the most powerful piece. Dice face 6 forces you to move a Nara or your Raja.`
    },
    {
      match: /pawn promot|nara promot|promotion|reach.*end|last rank/i,
      reply: `Promotion is the Nara's greatest aspiration — like the Panchatantra crow who rose to lead. When a Nara reaches the farthest rank of the board, it transforms into a Ratha (Rook). This is why advancing a passed pawn is often worth sacrificing material to achieve. Protect your advancing pawns with your Raja in the endgame.`
    },
    {
      match: /pawn capture|nara capture|diagonal.*pawn/i,
      reply: `The Nara captures differently from how it moves: it strikes one square diagonally forward, not straight ahead. This means a pawn that controls the centre diagonally is extremely powerful — it threatens two squares simultaneously with each step. However, remember: minor pieces (Nara, Ashwa, Danti) cannot capture other minor pieces in Chaturanga. A Nara can only capture the enemy Ratha or Raja directly.`
    },

    // ── Horse / Ashwa ──────────────────────────────────────────────────────
    {
      match: /\b(horse|ashwa|knight|cavalry)\b.*move|how.*\b(horse|ashwa|knight)\b/i,
      reply: `The Ashwa (Horse) moves in a precise L-shape: two squares in one direction, then one square perpendicular. Like Hanuman leaping the ocean to Lanka, it jumps over all pieces — nothing can block its path. From the centre of the board, an Ashwa attacks up to 8 squares simultaneously. This unique jumping ability makes it a master of forks and surprise attacks. Dice face 3 forces an Ashwa move.`
    },
    {
      match: /fork|ashwa fork|horse fork|knight fork/i,
      reply: `The Ashwa fork is the most feared tactic in Chaturanga. The horse attacks two enemy pieces simultaneously from a single square. The enemy can only save one — the other is taken. The Panchatantra's Jackal divided the two Lions with words; your Ashwa divides them with threats. Always look for fork squares when your horse is near two enemy pieces.`
    },
    {
      match: /ashwa jump|horse jump|knight jump|jump over/i,
      reply: `The Ashwa is unique — it is the only piece in Chaturanga that can jump over other pieces, both friendly and enemy. No barrier can block it. This makes it exceptionally powerful in crowded positions where all other pieces are restricted. Deploy your horses early precisely because they do not need open lines.`
    },

    // ── Elephant / Danti ───────────────────────────────────────────────────
    {
      match: /\b(elephant|danti|bishop)\b.*move|how.*\b(elephant|danti)\b/i,
      reply: `The Danti (Elephant) leaps exactly 2 squares diagonally in any direction — not 1, not 3, exactly 2. It jumps over any piece in between, like Hanuman's mighty bound. Critically, each Danti is colour-bound: it can only ever reach squares of one diagonal colour. This makes them stronger in closed positions but weaker on open boards. Dice face 4 forces a Danti move.`
    },
    {
      match: /colour.bound|color.bound|danti.colour|same.color.*elephant|diagonal.*colour/i,
      reply: `An important Chaturanga truth: the Danti is colour-bound. Because it always leaps exactly 2 diagonal squares, it permanently stays on the same colour complex. If your Danti starts on a light square, it will only ever reach light squares for the entire game. This is why having both Dantis is valuable — together they cover the whole board, but a lone Danti can only influence half of it.`
    },

    // ── Rook / Ratha ───────────────────────────────────────────────────────
    {
      match: /\b(rook|ratha|chariot)\b.*move|how.*\b(rook|ratha|chariot)\b/i,
      reply: `The Ratha (Rook / Chariot) slides any number of squares horizontally or vertically — it is the swiftest and most powerful piece in Chaturanga. It cannot jump over pieces; a Ratha is blocked by the first piece it meets on its path. On open files and ranks, the Ratha dominates. Dice face 1 forces you to move a Ratha. The first principle of Ratha play: seize open files immediately.`
    },
    {
      match: /open file|ratha.*file|rook.*file|dominate.*file/i,
      reply: `Chanakya Niti teaches: "Clear the road for your strongest warrior." An open file — a column with no pawns blocking it — is the Ratha's highway. Two Rathas doubled on an open file control that entire column, and no enemy piece can safely use it. In the opening, clear your own pawns from the file if needed; in the endgame, the Ratha on the 7th rank (cutting off the enemy king) is a decisive weapon.`
    },

    // ── King / Raja ────────────────────────────────────────────────────────
    {
      match: /\b(king|raja)\b.*move|how.*\b(king|raja)\b/i,
      reply: `The Raja (King) moves one square in any direction — up, down, sideways, or diagonally. It is both the most important piece (lose it and you lose) and a powerful endgame fighter. In the opening and middle game, keep your Raja safe. But in the endgame, Krishna's words apply — "Rise, Arjuna." The Raja must become active and march to the centre where it controls 8 squares and supports every adjacent piece.`
    },
    {
      match: /king.*safety|raja.*safety|protect.*king|safeguard.*raja/i,
      reply: `King safety in Chaturanga has a unique twist: dice face 6 forces you to move a Nara or Raja. This means your king can be forced to move into danger if it has no safe pawn moves! Always maintain a few pawns near your Raja so that when face 6 arrives, you can move a pawn instead of exposing your king. ELO 300+ bots apply a penalty of −40 when moving the Raja into threatened squares.`
    },
    {
      match: /king.*capture.*king|raja.*capture.*raja|can king.*take|king.*take.*king/i,
      reply: `No — Kings can never capture each other in Chaturanga. This is an authentic ancient rule, preserved from the Bhavishya Purana. The Raja is inviolable from direct royal combat. Victory comes from capturing the enemy Raja with other pieces, never from your own Raja making the final strike.`
    },
    {
      match: /king.*endgame|raja.*endgame|activate.*king|centralise.*king/i,
      reply: `The Raja's transformation in the endgame is one of Chaturanga's most beautiful themes. In the opening, it hides. In the endgame, it leads. The Bhagavad Gita 2.47: "Act, do not be idle." Centralise your Raja as soon as heavy pieces come off the board. A centralised Raja controls 8 squares, supports pawns, and helps deliver the decisive blow alongside your Ratha.`
    },

    // ── Dice rules ─────────────────────────────────────────────────────────
    {
      match: /dice.*rule|pashaka|how.*dice.*work|dice.*face|what.*dice/i,
      reply: `The Pāśaka (dice) is the soul of Chaturanga — it decides which piece you MUST move each turn:\n\n• Face 1 → Ratha (Rook) must move\n• Face 2 → Any piece of your choice\n• Face 3 → Ashwa (Horse) must move\n• Face 4 → Danti (Elephant) must move\n• Face 5 → Any piece of your choice\n• Face 6 → Nara (Pawn) OR Raja (King) must move\n\nFaces 2 and 5 together give you free choice 2/6 = 33% of the time. The dice does not make Chaturanga random — it makes it a game of strategic adaptation.`
    },
    {
      match: /dice.*1|face.*1|ratha.*dice|dice.*rook/i,
      reply: `Dice face 1 forces you to move a Ratha (Rook). This is the highest-value piece (5 points) and the most tactically significant roll. If your Ratha is well-placed, a face 1 is a powerful attacking turn. If it is exposed, you may be forced to move it into a bad square. This is why Ratha placement must anticipate the dice — always park your Ratha where any move from it is useful.`
    },
    {
      match: /dice.*2|dice.*5|face.*2|face.*5|any piece|free choice/i,
      reply: `Dice faces 2 and 5 both give you complete freedom — move any piece you choose. Together they represent 33.3% of all rolls, making them the most common outcome. This is when your strategic planning truly shines: you choose what to develop, what to protect, and what to attack. ELO 400+ bots weight these faces at 2/6 in their expectiminimax calculations.`
    },
    {
      match: /dice.*3|face.*3|horse.*dice|ashwa.*dice/i,
      reply: `Dice face 3 forces you to move an Ashwa (Horse). Horses are the tactical wildcards — their L-shaped jump can spring surprises from seemingly harmless squares. Always keep your horses on active squares so a face 3 is an opportunity, not a burden. If you have no horse (they've been captured), you forfeit your turn and gain one forfeit counter.`
    },
    {
      match: /dice.*4|face.*4|elephant.*dice|danti.*dice/i,
      reply: `Dice face 4 forces you to move a Danti (Elephant). The Elephant's 2-diagonal leap is unusual — it can jump over pieces and create surprising threats. The weakness: it's colour-bound, so it can only reach half the board. With face 4, think about which squares your Danti can threaten that also support future plans.`
    },
    {
      match: /dice.*6|face.*6|pawn.*king.*dice|nara.*raja.*dice/i,
      reply: `Dice face 6 — the most dramatic roll. You must move a Nara (Pawn) OR your Raja (King). If your pawns are all blocked or captured and your king has no safe square, you are in grave danger. This is why king safety and pawn structure matter in Chaturanga even more than in chess — a bad face 6 can expose your king instantly. Keep escape pawns available.`
    },
    {
      match: /no.*move|forfeit|frozen|pass.*turn|skip.*turn/i,
      reply: `If the dice forces you to move a piece type you don't have, or all your pieces of that type have no legal moves, you forfeit that turn. In team mode, three consecutive forfeits eliminates a player. This is why maintaining a variety of piece types matters — losing all your horses, for example, makes face 3 rolls automatic forfeits.`
    },

    // ── Capture rules ──────────────────────────────────────────────────────
    {
      match: /minor.*capture|pawn.*capture.*pawn|horse.*capture.*elephant|elephant.*capture.*horse|minor.*minor/i,
      reply: `One of Chaturanga's most distinctive rules: minor pieces (Nara, Ashwa, Danti) cannot capture other minor pieces. A Pawn cannot take a Horse; a Horse cannot take an Elephant. Only major pieces — Ratha (Rook) and Raja (King) — can capture minor pieces directly. This dramatically affects tactics: a Ratha is not just powerful because it slides far, but because it is the only non-royal piece that can remove enemy pawns and horses.`
    },
    {
      match: /capture.*rule|what.*can.*capture|who.*can.*take|capture.*law/i,
      reply: `Chaturanga capture laws (from the Bhavishya Purana):\n\n1. You cannot capture your own pieces.\n2. Kings can never capture each other — the royal duel is forbidden.\n3. Minor pieces (Nara/Ashwa/Danti) cannot capture other minor pieces — only major pieces (Ratha/Raja) can take minors.\n\nThis third rule is unique to Chaturanga and doesn't exist in modern chess. It gives the Ratha outsized tactical importance.`
    },

    // ── Win condition ──────────────────────────────────────────────────────
    {
      match: /how.*win|win.*condition|victory|eliminate|defeat/i,
      reply: `Victory in Chaturanga comes from capturing ALL enemy Rajas (Kings). There is no checkmate — the King is literally taken off the board. In FFA (4-player free-for-all), the last player with a King standing wins. In team mode (Red+Green vs Blue+Yellow), the team that eliminates both enemy Kings wins. This is why protecting your Raja is absolute — lose it and you are eliminated.`
    },
    {
      match: /team.*mode|alliance|2v2|partner|ally/i,
      reply: `Team mode: Red (player 0) and Green (player 2) fight together against Blue (player 1) and Yellow (player 3). Your ally's pieces protect yours and vice versa. Most importantly: when your ally captures an enemy Raja, your own Raja — if previously lost — can respawn on any empty square you choose. Time this respawn wisely — near your ally, away from enemy threats. Coordinate by controlling shared files and ranks together.`
    },
    {
      match: /respawn|raja.*respawn|king.*return|come.*back/i,
      reply: `In team mode, if your Raja is captured (eliminating you), you can re-enter the game! When your ally captures an enemy Raja, you immediately choose any empty square and place your Raja there. This is inspired by Rama's triumphant return from Lanka. Choose your respawn square carefully: near your teammate's pieces, away from enemy Rathas, and ideally on a square where you can contribute immediately.`
    },
    {
      match: /ffa|free.*for.*all|4.*player.*free|all.*vs/i,
      reply: `In FFA (Free-For-All) mode, all four players are rivals — there are no allies. You must manage three threats simultaneously. Key FFA principles: (1) Don't overextend against one player while the others grow. (2) Let two enemies fight each other and enter the weakened winner. (3) The player with the most Rathas in the endgame usually wins — don't trade them carelessly.`
    },

    // ── Opening strategy ───────────────────────────────────────────────────
    {
      match: /opening.*principle|opening.*strategy|opening.*tip|how.*start.*game|early.*game/i,
      reply: `Opening principles from Arthashastra:\n\n1. Control the centre — pawns on d3/e3 claim the heartland\n2. Develop your cavalry — deploy both Ashwas before the middle battle\n3. Seize open files — place Rathas on files with no enemy pawns\n4. Keep your Raja safe — maintain pawn cover for face-6 dice rolls\n5. Don't move the same piece twice in the opening without good reason\n\nThe enemy will try the same. He who develops faster usually dictates the game's flow.`
    },
    {
      match: /centre.*control|control.*centre|central.*square/i,
      reply: `Kautilya in Arthashastra Book X: "Place your strongest forces where they command the widest ground." The four central squares (d4, d5, e4, e5) are the most powerful positions on the Ashtāpada. A piece in the centre attacks more squares than the same piece on the edge. Pawns in the centre restrict enemy movement. Horses in the centre attack 8 squares; horses on the edge attack only 2. Fight for the centre from move one.`
    },

    // ── Endgame strategy ───────────────────────────────────────────────────
    {
      match: /endgame.*tip|endgame.*strategy|how.*win.*endgame|late.*game/i,
      reply: `Endgame principles:\n\n1. Activate your Raja immediately — it becomes a fighting piece, not a liability\n2. Ratha + Raja endgame: cut off the enemy king with the Ratha first, then march your own king to assist\n3. Passed pawns become lethal — escort them with your Raja toward promotion\n4. The player with more Rathas wins if both sides play correctly — don't trade Rathas unnecessarily in the endgame\n5. Zugzwang: position your Rathas to make every enemy dice roll painful`
    },

    // ── Tactics ────────────────────────────────────────────────────────────
    {
      match: /\bpin\b|what.*pin|ratha.*pin|pinned.*piece/i,
      reply: `A pin in Chaturanga: your Ratha sits on the same rank or file as an enemy piece, with the enemy Raja behind it. The piece in front cannot safely move — if it does, your Ratha captures the exposed Raja. Chanakya Niti: "Immobilise the enemy general." To create pins, look for Rathas that can align with enemy pieces and the Raja behind them. To break pins, either move the Raja off the line or interpose another piece.`
    },
    {
      match: /\bsacrifice\b|sacrifice.*piece|give.*up.*piece|noble.*sacrifice/i,
      reply: `In team mode, a sacrifice that saves your ally's Raja is often the highest strategic move. The Bhagavad Gita 3.25 teaches Nishkama Karma — action without attachment to personal gain. Sacrifice a Ratha to shield your ally's King, and the alliance gains two pieces of counterattack time. A well-timed sacrifice wins games; a hasty sacrifice just loses material.`
    },
    {
      match: /zugzwang|bad.*position.*any.*move|every.*move.*bad/i,
      reply: `Zugzwang in Chaturanga has a unique twist because of the dice. To create zugzwang, position your Rathas so the enemy's squares are restricted — then every dice roll forces the enemy King to move to a worse square, or forces other pieces onto squares they don't want. Two Rathas cutting off ranks and files simultaneously is the classic Chaturanga zugzwang setup.`
    },
    {
      match: /combination|combo|multi.*piece|two.*piece.*attack/i,
      reply: `Multi-piece combinations in Chaturanga follow the Chakravyuha principle: each piece enables the next in sequence. A simple example: your Ashwa leaps to fork the enemy Ratha at f6, forcing it to move; your own Ratha then slides to the newly vacated file to attack the enemy Raja. Always ask: "If I make this move, what does my next piece do?" Think two or three pieces ahead, not just one.`
    },

    // ── Vyuha formations ───────────────────────────────────────────────────
    {
      match: /chakravyuha|chakra.*formation|seven.*ring|7.*ring/i,
      reply: `The Chakravyuha (Wheel Formation) is the legendary formation from Kurukshetra's Day 13 — designed by Acharya Drona himself. Seven concentric rings of increasingly elite warriors. The formation constantly rotates inward. Once a warrior enters, he cannot exit without knowing all seven exit angles. Abhimanyu, Arjuna's son, entered all seven rings alone — but knowing only the entry, not the exit — and was killed inside. Only Arjuna, Krishna, Drona, and Pradyumna knew both entry and exit.`
    },
    {
      match: /garuda.*formation|garuda.*vyuha|eagle.*formation/i,
      reply: `The Garuda (Eagle) Vyuha — used by Bhishma on Days 2 and 3. The army forms an eagle in flight: a sharp beak of Rathas at the front, cavalry at the eyes, infantry wings sweeping wide, and the Raja safe at the tail. The eagle swoops forward while the wings encircle. Its natural enemy is the Krauncha (Heron) formation, whose long neck targets the eagle's exposed spine.`
    },
    {
      match: /kurma.*formation|kurma.*vyuha|tortoise.*formation/i,
      reply: `The Kurma (Tortoise) Vyuha — used by Bhishma on Day 8, almost impenetrable. Elephants form the hard outer shell; horses fill the inner rings; Rathas extend at the four limb positions as strike arms; the Raja sits at the absolute centre. Nearly impossible to breach frontally — Arjuna countered it on Day 8 with the Trishula (Trident), targeting the gaps at the limb joints.`
    },
    {
      match: /vyuha|formation|battle.*array|army.*formation|mahabharata.*formation/i,
      reply: `The Vyuhas (battle formations) of the Mahabharata were strategic arrays for deploying armies. In our Chaturanga Vyuha Builder, we have 26 formations across four board sizes:\n\n• 12×12 — Shakata, Vajra, Mandala, Sringataka, Mala\n• 14×14 — Garuda, Krauncha, Makara, Ardha Chandra, Shyen, Gomutrika\n• 16×16 — Chakravyuha 3-ring, Trishula, Kurma, Suchimukha, and more\n• 18×18 — The legendary 7-ring Chakravyuha, Padma, Asura, Deva, and others\n\nVisit the Vyuha Builder to study each formation's historical purpose and counter-formation.`
    },
    {
      match: /garuda.*vs.*krauncha|eagle.*vs.*heron|counter.*garuda|counter.*krauncha/i,
      reply: `The Garuda-Krauncha rivalry is the Mahabharata's great formation duel. The Eagle (Garuda) swoops with its beak forward and wings encircling — Bhishma's chosen array. The Heron (Krauncha) counters with a long narrow neck of Rathas driving straight through the eagle's spine, before the wings can close. Arjuna used the Krauncha to counter Bhishma on Days 2 and 11.`
    },

    // ── Bot difficulty ─────────────────────────────────────────────────────
    {
      match: /elo.*100|novice.*bot|random.*bot|easiest.*bot/i,
      reply: `ELO 100 is the Random bot — it picks any legal move at random with no strategy. Equivalent to approximately 200 Chess ELO. It exists to let absolute beginners learn piece movements without being punished. You should be able to beat it regularly within your first few games.`
    },
    {
      match: /elo.*200|greedy.*bot|elo.*300|tactical.*bot/i,
      reply: `ELO 200 (Greedy bot) always captures the most valuable available piece — it has no positional awareness and will happily expose its own Ratha to take a pawn. ELO 300 (Tactical bot) adds five heuristics: material gain, centre bonus, hanging piece penalty, escape bonus, and king safety. ELO 300 will not mindlessly walk its king into danger. Both are good for learning tactical patterns.`
    },
    {
      match: /elo.*400|strategic.*bot|expectiminimax/i,
      reply: `ELO 400 (Strategic bot) is where the AI truly begins to "think." It uses 1-ply Expectiminimax — for each candidate move, it averages over all six dice outcomes to calculate the expected material loss from the opponent's best reply. It was the first tier to reason about what happens after it moves. Equivalent to approximately 700 Chess ELO.`
    },
    {
      match: /elo.*500|deep.*tactical|see.*algorithm|static.*exchange/i,
      reply: `ELO 500 (Deep Tactical) adds Static Exchange Evaluation (SEE), 2-ply lookahead, mobility scoring, and promotion pressure. SEE simulates the full capture-recapture sequence on a square without touching the board. Captures with negative SEE (losing trades) are penalised; winning trades are rewarded. Equivalent to approximately 875 Chess ELO.`
    },
    {
      match: /elo.*600|paranoid.*bot|hardest.*bot|strongest.*bot/i,
      reply: `ELO 600 (Paranoid Strategist) is the flagship bot, equivalent to approximately 1050 Chess ELO. It uses the Paranoid Algorithm — assuming all three opponents are cooperating to minimise your score. It evaluates 216 leaf positions per candidate move (6×6×6 dice outcomes). Its evaluator, richEval600, scores material, centre proximity, promotion pressure, rook open files, mobility, king exposure, and piece coordination. Very difficult to defeat.`
    },
    {
      match: /elo.*700|grandmaster.*bot|elo.*800|maharaja.*bot|elo.*900|samrat|elo.*1000|chakravarti/i,
      reply: `The advanced bots (ELO 700–1000) use Team Expecti-Alpha-Beta search with piece-square tables tuned specifically for Chaturanga:\n\n• ELO 700 Grandmaster — depth 3, team alpha-beta (~1225 Chess ELO)\n• ELO 800 Maharaja — + quiescence search, depth 4 (~1400 Chess ELO)\n• ELO 900 Samrat — + iterative deepening, 1800ms time control (~1575 Chess ELO)\n• ELO 1000 Chakravarti — + transposition table (60k entries), opening book, depth 6 (~1750 Chess ELO)\n\nChakravarti is the strongest — extremely rare to beat without careful planning.`
    },
    {
      match: /how.*beat.*bot|beat.*elo|strategy.*against.*bot|defeat.*bot/i,
      reply: `Strategies for different bot levels:\n\n• vs ELO 100–200: Make any developing moves; they don't punish anything.\n• vs ELO 300: Avoid leaving pieces en prise — it won't hang material.\n• vs ELO 400: Create threats faster than it expects; it only looks 1-ply ahead.\n• vs ELO 500–600: Use the dice against it — when face 2 or 5 arrives, make a positional move it hasn't anticipated. Its search depth is limited.\n• vs ELO 700–1000: You need a long-term plan. Closed positions reduce its search effectiveness. Aim for Ratha endgames where its eval can be confused.`
    },

    // ── Historical / cultural ──────────────────────────────────────────────
    {
      match: /history.*chaturanga|origin.*chaturanga|where.*chaturanga.*from|when.*invented|chaturanga.*history/i,
      reply: `Chaturanga is the ancestor of all modern chess variants. Originating in India around 280–600 CE, it is mentioned in Kautilya's Arthashastra, Banabhatta's Harshacharita, and the Bhavishya Purana. "Chaturanga" means "four divisions" — the four corps of the Mauryan army: Rathas (chariots), Ashwas (cavalry), Dantis (elephants), and Naras (infantry). It spread west to Persia as Chatrang/Shatranj, then to Arabia, then to medieval Europe as Chess. Every chess variant on Earth traces its lineage to this ancient Indian game.`
    },
    {
      match: /ancestor.*chess|chess.*ancestor|parent.*chess|chaturanga.*chess|chess.*origin/i,
      reply: `Chaturanga is the great ancestor. Its transmission:\n\nChaturanga (India, c.280–600 CE) → Chatrang/Shatranj (Persia/Arabia, 600–900 CE) → Medieval Chess (Europe, 1000–1400 CE) → Modern Chess (1475 CE onward)\n\nSimultaneously, Chaturanga spread east and became Xiangqi (China), Shogi (Japan), Makruk (Thailand), and Janggi (Korea). Every strategy board game with pieces of differing power descends from the Ashtāpada.`
    },
    {
      match: /arthashastra|kautilya|chanakya/i,
      reply: `Kautilya (also known as Chanakya) was the brilliant minister of Chandragupta Maurya, whose Arthashastra — a treatise on statecraft — contains some of the earliest references to board gaming and military strategy that influenced Chaturanga's design. His strategic principles echo throughout the game: control the centre, use open files, exploit asymmetry, immobilise before striking.`
    },
    {
      match: /mahabharata|kurukshetra|pandava|kaurava|bhishma|arjuna|drona.*battle/i,
      reply: `The Mahabharata's 18-day Kurukshetra war is the spiritual backdrop for many of our lessons and all the Vyuha formations. The battle formations — Chakravyuha, Garuda, Kurma, Shakata, and more — were real tactical arrays used by generals like Bhishma, Drona, Arjuna, and Karna. Studying these formations in our Vyuha Builder will deepen your understanding of coordinated piece play.`
    },
    {
      match: /bhagavad.*gita|gita|krishna.*arjuna|arjuna.*resolve/i,
      reply: `The Bhagavad Gita's wisdom permeates Chaturanga. Krishna's teachings to Arjuna before the Kurukshetra battle — "Act without attachment to outcomes," "Rise and fight," "The self is eternal" — map directly to how we should play: commit fully to each move, do not dwell on what was lost, and keep advancing. Several of our lessons draw directly from the Gita's verses.`
    },

    // ── Piece values ────────────────────────────────────────────────────────
    {
      match: /piece.*value|how.*much.*worth|point.*value|value.*piece/i,
      reply: `Piece values in Chaturanga:\n\n• Nara (Pawn) = 1 point\n• Ashwa (Horse) = 3 points\n• Danti (Elephant) = 3 points\n• Ratha (Rook) = 5 points\n• Raja (King) = priceless (lose it = eliminated)\n\nNote: Horse and Elephant are equal at 3 points each — unlike chess where the bishop is often preferred. The Ratha (5 points) is the decisive material advantage to fight for.`
    },

    // ── Online / multiplayer ────────────────────────────────────────────────
    {
      match: /online.*play|multiplayer|websocket|play.*with.*friend|play.*another.*human/i,
      reply: `Online multiplayer is planned for Chaturanga v1.0.4 — expected in Month 5-6 of development. The architecture will use WebSocket rooms with unique join codes, real-time game state sync, and spectator slots. For now, you can play locally on the same device against bots or with friends in pass-and-play mode. Check the game's roadmap for the latest online multiplayer progress.`
    },

    // ── Puzzle help ─────────────────────────────────────────────────────────
    {
      match: /puzzle.*help|stuck.*puzzle|hint.*puzzle|solve.*puzzle/i,
      reply: `If a puzzle has you puzzled, remember these principles:\n\n1. Look at the dice constraint — what piece are you forced to move?\n2. Ask: which piece threatens the enemy Raja or a high-value piece?\n3. Count the squares: does the move create a fork, pin, or discovered attack?\n4. Think forward — after your move, does the enemy have an answer? If not, it's likely correct.\n\nThe puzzles in our library are rated from ELO 100 to ELO 800. Harder puzzles involve multi-piece combinations. Each puzzle also has built-in hints — use them without shame.`
    },

    // ── Miscellaneous ───────────────────────────────────────────────────────
    {
      match: /how.*many.*pieces|starting.*pieces|piece.*count|army.*size/i,
      reply: `Each player starts with: 1 Raja (King), 2 Rathas (Rooks), 2 Ashwas (Horses), 2 Dantis (Elephants), and 8 Naras (Pawns) — 15 pieces total on an 8×8 board. The total for all four players is 60 pieces. With the Army Builder, you can customise this count within a point budget for each board size.`
    },
    {
      match: /army.*builder|custom.*army|build.*army/i,
      reply: `The Chaturanga Army Builder lets you design custom starting positions within a point budget (30 points for 8×8 standard). Each piece costs points: Nara=1, Ashwa=3, Danti=3, Ratha=5, Raja is free but required. On larger boards (10×10, 12×12) the budget scales up. You can even designate a Guptchar (Spy) piece on boards of 10×10 and above — a hidden piece that eliminates the capturing enemy piece when taken (except by a King).`
    },
    {
      match: /spy.*piece|guptchar|hidden.*piece/i,
      reply: `The Guptchar (Spy) is a special piece exclusive to the 10×10 and 12×12 Army Builder modes. Its identity is hidden from your opponent — it appears as a normal piece. When the enemy captures your Guptchar, their capturing piece is simultaneously removed from the board! Only the enemy's Raja is immune — if the King captures the spy, only the spy is removed. The Guptchar cannot be a Nara (Pawn) or Raja. One per army.`
    },
  ];

  // ── Fallback responses (rotate for variety) ────────────────────────────────
  const FALLBACKS = [
    `That question reaches the edges of my immediate knowledge, student. Could you rephrase it? You can ask me about piece movements, dice rules, capture laws, opening strategy, endgame technique, vyuha formations, bot difficulty levels, or the history of Chaturanga.`,
    `A warrior who asks unclear questions fights with a blunt sword. Sharpen your query — ask specifically about a piece, a rule, a tactic, or a formation, and I shall answer precisely.`,
    `Hmm. I meditate on this question but find no clear answer in my teaching scrolls. Try asking about the Ashwa's movement, the dice rules, how to win, or a specific vyuha formation — those I know well.`,
    `Even Drona sometimes says: "Ask differently, student." Could you ask about a specific piece, tactic, strategy, or the history of Chaturanga? I have deep knowledge to share.`
  ];
  let _fallbackIdx = 0;

  // ── Core matching function ─────────────────────────────────────────────────
  function getResponse(msg) {
    if (!msg || !msg.trim()) return FALLBACKS[0];

    const text = msg.trim();

    for (const rule of RULES) {
      if (rule.match.test(text)) {
        return rule.reply;
      }
    }

    // Rotate fallback for variety
    const reply = FALLBACKS[_fallbackIdx % FALLBACKS.length];
    _fallbackIdx++;
    return reply;
  }

  return { getResponse };
})();
