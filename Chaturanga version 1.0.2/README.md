# Chaturanga 1.0.2 - Chaturaji (4-Player)

Four-player Chaturanga with Team (2v2) and Single (1v1v1v1) modes, kill matrix, promotion by symmetry, king revival, and per-player piece images.

## Features (1.0.2)

- **Game modes:** Team (2v2), Single (1v1v1v1)
- **Kill matrix:** Raja cannot capture Raja; minor (Nara, Ashwa, Danti) cannot capture major (Raja, Ratha)
- **Danti:** Moves exactly 2 squares vertically or diagonally (not horizontally)
- **Promotion by symmetry:** Nara promotes to the piece type at the symmetric square (Ratha, Ashwa, Danti, or Raja if dead)
- **King revival (Team only):** Pawn promotion on Raja's symmetric square revives the dead Raja
- **Single mode:** King capture eliminates that player and removes all their pieces
- **Four dice:** One dice display per player beside the board
- **Auto-roll:** Option to auto-roll dice at start of each turn
- **Forfeit notation:** History shows e.g. Blue: Forfeit(Rook)
- **Move history:** Includes dice value, piece type, capture/promotion; winner recorded
- **Database:** Save game to database folder (download); auto-download on game end option; prompt on close
- **Piece images:** Red, Blue, Green, Yellow × Raja, Ratha, Nara, Danti, Ashwa (images/pieces/)

## How to Play

1. Choose **Mode:** Team (2v2) or Single (1v1v1v1). Optionally set **Auto-roll dice** and **Auto-download on game end**.
2. **Roll Dice** (or wait for auto-roll) to determine which piece type you must move.
3. Click one of your pieces of that type, then click a highlighted square to move.
4. If you cannot move, your turn is skipped (forfeit) automatically, or click **Forfeit Turn**.
5. Pawn promotion is automatic by symmetry (no choice). In Team mode, king can revive when a pawn promotes on the Raja square.

## File Structure

```
Chaturanga version 1.0.2/
├── index.html
├── css/
│   ├── styles.css
│   └── animations.css
├── js/
│   ├── game.js
│   ├── dice.js
│   └── ui.js
├── images/
│   ├── pieces/     # Red_Raja, Blue_Nara, etc. (4 colors × 5 types)
│   └── chaturanga board.png
├── database/       # Place saved game files here
└── README.md
```

## Dice Mapping

- 1 → Ratha (Rook)
- 2 → Any
- 3 → Ashwa (Horse)
- 4 → Danti (Elephant)
- 5 → Any
- 6 → Nara or Raja (Pawn or King)
