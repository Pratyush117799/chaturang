# Chaturanga - Improved 4-Player Game

An enhanced implementation of the ancient Indian board game Chaturanga with complete rules, smooth animations, and modern UI/UX.

## Features

### Complete Game Rules Implementation
- ✅ **Correct Dice Mapping**: 1=Rook, 3=Horse, 4=Elephant, 6=Pawn/King (2 and 5 allow any piece)
- ✅ **Piece Movements**: All pieces follow authentic Chaturanga rules
  - Pawn: Moves forward one square, captures diagonally
  - Rook: Moves like chess rook (horizontal/vertical)
  - Horse: L-shape movement (knight)
  - Elephant: Moves exactly 2 squares in any direction (Version II)
  - King: Moves one step in any direction
- ✅ **Minor/Major Capture Rules**: Minor pieces (Pawn, Horse, Elephant) cannot capture Major pieces (Rook, Horse, King)
- ✅ **King Respawn**: When a teammate captures an opponent king, your captured king can respawn on any empty square
- ✅ **King Death**: If a king is captured twice, the player is frozen and cannot move
- ✅ **Pawn Promotion**: Pawns can promote to King, Rook, Horse, or Elephant when reaching the opposite side
- ✅ **Stalemate Rule**: Player who causes stalemate wins (opponent loses)
- ✅ **Team Victory**: Game ends when both kings of a team are permanently eliminated

### Enhanced UI/UX
- 🎨 **Modern Design**: Beautiful gradient backgrounds, smooth transitions, and professional styling
- 🎲 **Smooth Dice Animation**: Animated dice roll with visual feedback
- 🎯 **Legal Move Highlighting**: Click a piece to see all legal moves highlighted with animated indicators
- ✨ **Smooth Piece Movement**: Animated piece movement with cubic-bezier easing
- 🎭 **Interactive Feedback**: Hover effects, selection highlights, and status messages
- 📊 **Game Information Panel**: 
  - Current player turn with color coding
  - Captured pieces display
  - Move history
  - Player status (kings on board, frozen state)
  - Rules summary
- 🎪 **Modal Dialogs**: 
  - Pawn promotion selection
  - King respawn placement

### Technical Improvements
- 🏗️ **Clean Architecture**: Well-organized code with separation of concerns
- 🎬 **Animation System**: CSS animations and JavaScript transitions for smooth interactions
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- ♿ **Accessibility**: Clear visual feedback and intuitive controls
- 🐛 **Error Handling**: Proper validation and user feedback

## How to Play

1. **Start the Game**: Open `index.html` in a modern web browser
2. **Roll Dice**: Click the "Roll Dice" button to determine which piece type you must move
3. **Select Piece**: Click on one of your pieces that matches the dice roll
4. **View Legal Moves**: All legal moves will be highlighted with green indicators
5. **Make Move**: Click on a highlighted square to move your piece
6. **Special Actions**:
   - If your pawn reaches the opposite side, choose a promotion piece
   - If your teammate captures an opponent king, you can respawn your king
   - If you cannot move, you can forfeit your turn

## Game Rules Summary

### Dice Mapping
- **1** → Rook (रथ)
- **2** → Any piece
- **3** → Horse (अश्व)
- **4** → Elephant (हाथी)
- **5** → Any piece
- **6** → Pawn or King (नर / राजन)

### Piece Categories
- **Minor Pieces**: Pawn, Horse, Elephant (cannot capture Major pieces)
- **Major Pieces**: Rook, Horse, King (can capture any piece)

### Special Rules
- Minor pieces cannot capture Major pieces
- King can respawn once if teammate captures opponent king
- King captured twice = player frozen
- Pawn promotion when reaching opposite side
- Stalemate = win for the player who causes it

## File Structure

```
chaturanga-improved/
├── index.html          # Main game page
├── css/
│   ├── styles.css      # Main styling
│   └── animations.css  # Animation definitions
├── js/
│   ├── game.js         # Core game logic
│   ├── dice.js         # Dice roll functionality
│   └── ui.js           # User interface and interactions
├── images/             # Game piece images
└── README.md           # This file
```

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires modern browser with ES6+ support and CSS Grid.

## Future Enhancements

- [ ] AI opponent
- [ ] Online multiplayer
- [ ] Save/load game state
- [ ] Sound effects
- [ ] Piece images instead of Unicode symbols
- [ ] Tutorial mode
- [ ] Statistics tracking

## Credits

Based on the ancient Indian game Chaturanga, the ancestor of modern chess. Implementation includes all rules from the provided documentation.
