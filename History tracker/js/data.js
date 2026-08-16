// Era data for Chaturanga Chronicle
const erasData = [
  {
    slug: 'indus-valley',
    name: 'Indus Valley (3000-1500 BCE)',
    title: 'Proto-Board Games',
    confidence: 'theorized',
    description: 'Archaeological evidence from Indus Valley Civilization includes dice and game boards. These race games may have influenced later chess-like games.',
    details: 'Indus seals show evidence of game-like activities. While not chess, the cultural context of strategic games was established here.',
    image: '🎲'
  },
  {
    slug: 'ashtapada',
    name: 'Ashtapada (500-200 BCE)',
    title: 'The Eight-Square Board',
    confidence: 'established',
    description: 'An early Indian racing game played on an 8×8 board. This is the direct ancestor of Chaturanga.',
    details: 'Documented in early Indian texts. Players raced pieces around the board based on dice rolls. The 8×8 grid became the standard for all subsequent chess variants.',
    image: '📋'
  },
  {
    slug: 'chaturanga',
    name: 'Chaturanga (500-700 CE)',
    title: 'The Game of Four Arms',
    confidence: 'established',
    description: 'Born in the Gupta Empire, Chaturanga replaced dice with strategy. Four armies (infantry, cavalry, elephants, chariots) faced off on the sacred 8×8 board.',
    details: 'Chaturanga introduced the concept of pieces with different movement rules. The "king" was no longer just a racer—victory meant protecting him from capture. Infantry moved one square, cavalry could jump, chariots moved orthogonally, and elephants moved diagonally.',
    image: '♚'
  },
  {
    slug: 'shatranj',
    name: 'Shatranj (700-1500 CE)',
    title: 'Chess Enters Persia and Islam',
    confidence: 'established',
    description: 'As the Gupta Empire faded, Chaturanga traveled west to Persia and was renamed Shatranj. The rules stabilized across the Islamic world.',
    details: 'Shatranj used the same pieces but with Persianized names: Shah (King), Firzan (Advisor), Fil (Elephant), Asp (Horse), Rukh (Chariot/Rook), and Piyade (Pawn). The game became so integrated into Islamic culture that theologians debated its morality.',
    image: '♛'
  },
  {
    slug: 'modern-chess',
    name: 'Modern Chess (1475-Present)',
    title: 'Revolution in Europe',
    confidence: 'established',
    description: 'When Shatranj reached Europe, it collided with medieval culture. In 1475, in a sudden documented burst of innovation, the rules exploded.',
    details: 'The Advisor became the Queen—and gained the most powerful move (diagonal and straight, any distance). The Elephant became the Bishop. Pawns gained the ability to move two squares on their first move and capture en passant. Castling was formalized. These changes made the game faster and more dynamic, and modern chess was born.',
    image: '♕'
  },
  {
    slug: 'chaturaji',
    name: 'Chaturaji (800-Present)',
    title: 'The Four-Player Splinter',
    confidence: 'established',
    description: 'While Shatranj unified most of the world, India kept mutating its own game in parallel. Chaturaji brought back the four armies—and the dice.',
    details: 'Played on a 10×10 board with four players, each controlling a corner army. Dice rolls determined which pieces could move, gambling made a comeback, and the game resembled its ancestor Ashtapada as much as it did Chaturanga.',
    image: '🎲'
  },
  {
    slug: 'east-asian',
    name: 'East Asian Variants (1000-Present)',
    title: 'Xiangqi, Shogi, Makruk',
    confidence: 'theorized',
    description: 'In China, Japan, and Southeast Asia, games that may have descended from Chaturanga took radically different forms.',
    details: 'Xiangqi (Chinese chess) features a river dividing the board, confining the king to a 3×3 palace, and flying cannons that work like no other piece. Shogi (Japanese chess) allows captured pieces to re-enter the board. Makruk (Thai chess) uses a slower, more positional game. Historians debate how directly these connect back to India.',
    image: '🏯'
  }
];

// Function to get era by slug
function getEraBySlug(slug) {
  return erasData.find(era => era.slug === slug);
}

// Function to get all eras
function getAllEras() {
  return erasData;
}

// Export for use in pages
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { erasData, getEraBySlug, getAllEras };
}
