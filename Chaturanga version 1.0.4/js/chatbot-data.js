/**
 * Chaturanga - Acharya Chatbot Data & Logic (Issue 15 & 16)
 * Acharya Drona acts as the interactive guide.
 */

// Basic Levenshtein distance for fuzzy matching
function levenshteinDistance(s1, s2) {
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;

  const matrix = [];
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1) // deletion
        );
      }
    }
  }
  return matrix[s2.length][s1.length];
}

function normalizeInput(str) {
  return str.toLowerCase().replace(/[?,.!]/g, '').trim();
}

/**
 * 500+ Query mapping concepts are reduced to intents for the frontend.
 * Each intent has trigger keywords/phrases in English and Hinglish.
 */
const chatbotIntents = [
  {
    intent: 'greeting',
    triggers: ['hello', 'hi', 'namaste', 'pranam', 'hey', 'acharya', 'guru ji', 'kese ho', 'how are you'],
    response: "Pranam! I am Acharya Drona. I can guide you through the ancient rules of Chaturanga, Vyuha formations, or help you solve puzzles. What seek ye?"
  },
  {
    intent: 'rules_general',
    triggers: ['how to play', 'rules', 'kese khelte hai', 'game rules', 'what is chaturanga', 'guide me', 'explain rules'],
    response: "Chaturanga is a 4-player ancestor of chess played on an 8x8 Ashtapada board. Players roll a Pashaka (dice) to determine which piece must move. You win by eliminating all opposing Rajas (Kings)."
  },
  {
    intent: 'piece_raja',
    triggers: ['raja', 'king', 'raja kese chalta hai', 'how does king move', 'king rule', 'raja movement'],
    response: "The Raja (King) moves exactly 1 square in any direction. However, unlike modern chess, a Raja cannot capture another Raja. If your Raja is threatened, you must protect it. If a Raja is captured, that army is absorbed by the conqueror."
  },
  {
    intent: 'piece_ratha',
    triggers: ['ratha', 'rook', 'chariot', 'ratha kese chalta hai', 'how does ratha move', 'rook rules', 'ratha rules', 'chariot move'],
    response: "The Ratha (Chariot/Rook) is the most powerful piece. It moves any number of squares orthogonally (straight lines). It corresponds to dice face 1."
  },
  {
    intent: 'piece_ashwa',
    triggers: ['ashwa', 'horse', 'knight', 'ashwa move', 'how does horse move', 'ghoda', 'ghoda kese chalta'],
    response: "The Ashwa (Horse/Knight) jumps in an 'L' shape (2 squares in one direction, 1 square perpendicular). It can leap over other pieces. It corresponds to dice face 3."
  },
  {
    intent: 'piece_danti',
    triggers: ['danti', 'elephant', 'bishop', 'haathi', 'elephant move', 'danti rules', 'haathi kese chalta hai', 'how does elephant move'],
    response: "The Danti (Elephant) leaps exactly two squares diagonally, ignoring any pieces in between. This makes it color-bound to specific squares on the board. It corresponds to dice face 4."
  },
  {
    intent: 'piece_nara',
    triggers: ['nara', 'pawn', 'infantry', 'soldier', 'pyada', 'pawn move', 'nara kese chalta', 'how does pawn move'],
    response: "The Nara (Pawn) moves forward 1 square at a time, and captures diagonally forward 1 square. If it reaches the opposite end of the board, it promotes to a Mantri (a piece that moves only 1 square diagonally)."
  },
  {
    intent: 'dice_rules',
    triggers: ['dice', 'pashaka', 'roll', 'how does dice work', 'dice face', 'dice meaning', 'pase', 'pasa'],
    response: "The Pashaka (dice) drives the game:\n• Face 1: Ratha (Chariot)\n• Face 2/5: Any piece\n• Face 3: Ashwa (Horse)\n• Face 4: Danti (Elephant)\n• Face 6: Nara (Pawn) or Raja (King)"
  },
  {
    intent: 'vyuha',
    triggers: ['vyuha', 'formations', 'chakra', 'padma', 'formation', 'strategy', 'what is vyuha'],
    response: "Vyuhas are ancient military formations from the Dhanurveda. Famous ones include the Chakra Vyuha (defensive wheel) and Garuda Vyuha (offensive eagle). Check the 'Vyuha Niti' in our Docs for interactive 14x14 visualizers!"
  },
  {
    intent: 'strategy_advice',
    triggers: ['kya move karu', 'how to win', 'strategy', 'tips', 'help me win', 'best move', 'kaise jeetein'],
    response: "My advice: Never leave your Raja exposed on open diagonals. Protect your Ratha at all costs. Since the dice limits your moves, always keep your pieces defended. A lone piece is easily captured when the dice denies you the chance to move it."
  },
  {
    intent: 'multiplayer',
    triggers: ['online', 'multiplayer', 'friends', 'play online', 'dosto ke sath kese khele', 'room', 'host'],
    response: "You can play online by going to 'Play Game' and clicking 'Online Multiplayer' in the settings drawer. Create a room code and share it with your friends. You can even bring Custom Armies into online matches!"
  },
  {
    intent: 'puzzles',
    triggers: ['puzzles', 'rating', 'elo', 'puzzle lock', 'how to solve'],
    response: "Puzzles test your Chaturanga tactics. Every puzzle you solve boosts your ELO rating. If a puzzle is too high above your rating (150+ points), it remains locked until you prove your worth on easier challenges."
  }
];

// Fallback responses when no intent matches
const fallbacks = [
  "This old Acharya does not understand. Could you rephrase your question about Chaturanga?",
  "I am versed in the arts of the Ashtapada and the Dhanurveda, but I didn't quite catch that. Ask me about piece movements, dice, or rules.",
  "Are you asking about a specific piece (Raja, Ratha, Ashwa, Danti, Nara) or a game mechanic?",
  "Samjh nahi aaya (Did not understand). Try asking 'how does the horse move?' or 'what is a vyuha?'"
];

function getChatbotResponse(userInput) {
  const normInput = normalizeInput(userInput);
  if (!normInput) return "Speak, student. I am listening.";

  // Exact or contains match first (fastest)
  for (const intent of chatbotIntents) {
    for (const trigger of intent.triggers) {
      if (normInput.includes(trigger)) {
        return intent.response;
      }
    }
  }

  // Fuzzy match (Levenshtein) if no direct match
  const inputWords = normInput.split(' ');
  let bestMatch = { intent: null, score: Infinity };

  for (const intent of chatbotIntents) {
    for (const trigger of intent.triggers) {
      const triggerWords = trigger.split(' ');
      // If single word trigger, check against all input words
      if (triggerWords.length === 1) {
        for (const word of inputWords) {
          const dist = levenshteinDistance(word, trigger);
          // Accept if distance is small relative to word length
          if (dist <= 2 && dist < trigger.length) {
            return intent.response;
          }
        }
      } else {
        // Compare full phrases
        const dist = levenshteinDistance(normInput, trigger);
        if (dist < bestMatch.score) {
          bestMatch = { intent: intent, score: dist };
        }
      }
    }
  }

  // If best full phrase match is reasonably close, return it (threshold roughly 3-4 typos)
  if (bestMatch.intent && bestMatch.score <= 4) {
    return bestMatch.intent.response;
  }

  // Fallback
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

globalThis.ChaturangaChatbot = {
  getResponse: getChatbotResponse
};
