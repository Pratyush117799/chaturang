Chaturanga — 4-Player (minimal implementation)

This is a minimal scaffold demonstrating the core Chaturanga rules:
- 4 players (red, black, green, yellow) arranged in corners
- Dice-based forced movement (1: camel, 2: horse, 3: elephant, 4: king, 5: pawn, 6: any)
- Small vs Large capture rules (small pieces cannot capture large pieces)
- Basic king capture/freezing and simple respawn placeholder

How to run:
- Open `index.html` in a modern browser (no server required)
- Click `Roll Dice` to determine forced piece type
- Click your own piece (it must match dice unless roll=6) and click a target square to move

Files:
- `index.html` — main page
- `css/styles.css` — styles
- `js/game.js` — core engine
- `js/dice.js` — dice animation
- `js/ui.js` — minimal UI glue

This is Phase 1 scaffold. Next steps: improve visuals, add drag-and-drop, implement full king respawn logic with threat detection, add pawn promotion, save/load, AI and multiplayer.
