# Chaturanga Game Manual
*Project:* IoT-based Chaturanga Board (SIH 2026)  
*Board Type:* 8x8 Ashtapada Grid  
*Mode:* 4-Player Team Game (2 vs 2)  
*Nature:* Probabilistic Strategic Board Game with Dice Mechanics

---

## 1. Classification & Piece Hierarchy

### Piece Categories & Points Per Piece (PPP)
* **Minor Pieces:**
  * **Nar** (Pawn): 1 Point
  * **Danti** (Elephant): 2.5 Points
* **Major Pieces:**
  * **Ashva** (Knight): 3.5 Points
  * **Ratha** (Chariot): 5 Points
  * **Rajan** (King): ∞ Points

> [!NOTE]
>  piece combat status depending on the rule variant:
> - **Variant A (Primary / Traditional):**
>   - **Minor Pieces:** Nara, Danti, and Ashva
>   - **Major Pieces:** Ratha and Rajan


### Combat & Capture Rules
* **Minor Pieces** cannot capture **Major Pieces**.
* **Major Pieces** can capture any piece on the board (both Minor and Major).
* **Allied Players (Team-Up):** Players on the same team can capture each other's pieces, *except* for their partner's **Raja (King)**.

---

## 2. Dice Mechanics (Uncertainty Element)
Chaturanga is a probabilistic game involving a dice-rolling mechanism. On their turn, a player rolls a die to determine which piece they are allowed to move. The player must make a legal move with the rolled piece category if one exists.
* **Forfeit Turn (Auto-Forfeit):** If a player rolls a value but has no legal moves possible for that category of piece, their turn is automatically forfeited.

Depending on the setup/dice used, one of two dice systems can be adopted:

| Die Roll | System A (4-sided/traditional) | System B (alternate) |
| :---: | :--- | :--- |
| **2** | — | **Ratha** (Chariot) |
| **3** | **Ashva** (Knight) |
| **4** | **Danti** (Elephant) |
| **5** | **Nara** (Pawn) or **Rajan** (King) |

---

## 3. Piece Movement Rules

### 1. Nara (Pawn / Padati)
* **Movement:** Moves exactly one square forward.
* **Capture:** Captures one square diagonally forward.
* **Special rules:** Unlike modern chess, the Nara does not have a double-step option on its first move.

### 2. Ratha (Chariot / Ship)
* **Movement:** Moves orthogonally (vertically or horizontally) any number of vacant squares (identical to a modern Chess Rook).
* **Special rules:** Cannot jump over other pieces.

### 3. Danti (Elephant)
* **Movements:** Moves 1 step diagonally in any direction, or 1 step forward (representing the 4 legs and trunk of the elephant).

### 4. Ashva (Knight)
* **Movement:** Moves in an "L-shape" (two squares in one orthogonal direction and then one square perpendicular), identical to a modern Chess Knight.
* **Special rules:** Can jump over any intervening pieces.

### 5. Rajan (King)
* **Movement:** Moves exactly one step in any direction (orthogonal or diagonal).
* **Special rules:** Highly powerful piece capable of winning material. There is no castling, and there is no Queen in the game.

---

## 4. King Revival & Promotion Rules

### Nara Promotion
* When a Nara reaches the opposite end of the board (the 8th rank relative to its starting direction), it is promoted.
* **Promotion Type:** It gets promoted to the corresponding piece of the board column it reaches (based on the original piece layout of that column). It can be promoted to a King (Rajan) if it reaches the King's starting column.
* **Combat capability:** A promoted Nara can capture opponent pieces, except for the opponent's King.

### Raja Comeback (Revival)
If a team's King (Rajan) has been captured, there are two ways he can return to the game:
1. **Nara Promotion:** If the corresponding Nara of the captured King's side reaches the end of the board, the King is revived.
2. **Teammate Capture:** If the teammate captures at least one of the opponent team's Kings, the captured partner King is revived.
* **Placement:** The revived King is placed on any vacant, unchecked square on the board.

### Permanent Elimination
* If a King is captured a **second time** (killed twice), he cannot return to the game.
* Once a player's King is permanently eliminated, that player can no longer make any moves.

---

## 5. Initial Board Setup (4-Player Layout on 8x8 Ashtapada)

The game is played counter-clockwise with four players (Player 1 South, Player 4 East, Player 3 North, Player 2 West).

### Grid Diagram (Markdown Table)

| Row / Col | a | b | c | d | e | f | g | h | Player / Side |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| *8* | R | N | . | . | K | D | A | R | *Player 3 (North)* |
| *7* | A | N | . | . | N | N | N | N | *Player 3 (North)* |
| *6* | D | N | . | . | . | . | . | . | *Player 2 (West)* |
| *5* | K | N | . | . | . | . | . | . | *Player 2 (West) / Player 4 (East)* |
| *4* | . | . | . | . | . | . | N | K | *Player 4 (East)* |
| *3* | . | . | . | . | . | . | N | D | *Player 4 (East)* |
| *2* | N | N | N | N | . | . | N | A | *Player 1 (South)* |
| *1* | R | A | D | K | . | . | N | R | *Player 1 (South)* |

### Monospace Code Block Representation

```text
    a   b   c   d   e   f   g   h
  +---+---+---+---+---+---+---+---+
8 | R | N | . | . | K | D | A | R | 8  (Player 3 / North)
7 | A | N | . | . | N | N | N | N | 7
6 | D | N | . | . | . | . | . | . | 6
5 | K | N | . | . | . | . | . | . | 5  (Player 2 / West | Player 4 / East)
4 | . | . | . | . | . | . | N | K | 4
3 | . | . | . | . | . | . | N | D | 3
2 | N | N | N | N | . | . | N | A | 2
1 | R | A | D | K | . | . | N | R | 1  (Player 1 / South)
  +---+---+---+---+---+---+---+---+
    a   b   c   d   e   f   g   h
```

---

## 6. Victory & Defeat Conditions

1. **Checkmate:** Achieving checkmate against the opponent team's Kings (to win, capture both Kings of the opponent team).
2. **Baring the King:** Capturing all of an opponent's pieces except their King.
3. **Stalemate:** If a player has no legal moves on their turn, they lose the game (stalemating the opponent results in a win).
4. **Draw or Resign:** Mutual agreement of a draw, or resignation.