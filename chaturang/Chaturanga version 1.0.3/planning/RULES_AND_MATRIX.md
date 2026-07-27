# Chaturanga 1.0.3 — Rules and Kill Matrix

## Piece Classification

- Minor: Nara (pawn), Ashwa (horse), Danti (elephant).
- Major: Raja (king), Ratha (rook).

In code: isMinor() = pawn, horse, elephant; isMajor() = rook, king only.

## Kill Matrix (1.0.3)

- Raja cannot capture Raja.
- Minor cannot capture Minor (minor can only capture major).
- Major can capture any (except Raja capturing Raja).

## Forfeit

- Auto-forfeit: No legal move for rolled piece; turn skipped; does not count toward manual limit.
- Manual forfeit: Max 3 per player per game. Move history records manualForfeit true/false.

## Dice to Piece

- 1 = Ratha, 2/5 = Any, 3 = Ashwa, 4 = Danti, 6 = Nara or Raja.

## Promotion and King Revival

- Unchanged from 1.0.2: promotion by symmetry; king revival in team mode.
