# Chaturanga Game Manual
*Project:* IoT-based Chaturanga Board (SIH 2026)  
*Board Type:* 8x8 Ashtapada Grid  
*Mode:* 4-Player Team Game (2 vs 2)  
*Nature:* Probabilistic Strategic Board Game with Dice Mechanics

---

## 1. Classification & Piece Hierarchy

### Piece Categories & Points Per Piece (PPP)
* *Minor Pieces:*
  * *Nar* (Pawn): 1 Point
  * *Danti* (Elephant): 2.5 Points
  *Ashva* (Knight): 3.5 Points
* *Major Pieces:*
  * *Ratha* (Chariot): 5 Points
  * *Rajan* (King): ∞ Points

### Major / Minor Combat Rule
* *Minor Pieces (Nar,Ashva, Danti)* CANNOT capture any *Major Piece (Ratha, Rajan)*.
* *Major Pieces (Ratha, Rajan)* CAN capture any piece on the board.

---

## 2. Initial Board Setup (4-Player Layout on 8x8 Ashtapada)

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

---

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

## 3. Piece Movements & Capture Mechanics

Each piece has unique moving and capturing rules, governed strictly by the Ashtapada grid and combat constraints:

### Movements
*   **Rajan (King - K):** Moves exactly $1$ square in any direction (diagonally or orthogonally).
*   **Ratha (Chariot - R):** Moves orthogonally (horizontally or vertically) any number of unoccupied squares. Cannot leap over other pieces.
*   **Danti (Elephant - D):** Leaps exactly $2$ squares diagonally (e.g., from `c1` to `e3`). Can jump over any piece in between. Does not move horizontally, vertically, or exactly 1 diagonal square.
*   **Ashva (Knight - A):** Leaps in an "L-shape" ($2$ squares in one orthogonal direction and $1$ square perpendicular). Can jump over other pieces.
*   **Nara (Pawn - N):**
    *   **Movement:** Moves exactly $1$ square straight forward (in its direction of play).
    *   **Capture:** Captures $1$ square diagonally forward.
    *   **Forward Direction by Player:**
        *   *Player 1 (South):* Moves Up ($+1$ rank towards rank 8). Captures diagonally up ($\pm 1$ file, $+1$ rank).
        *   *Player 2 (West):* Moves Right ($+1$ file towards file h). Captures diagonally right ($+1$ file, $\pm 1$ rank).
        *   *Player 3 (North):* Moves Down ($-1$ rank towards rank 1). Captures diagonally down ($\pm 1$ file, $-1$ rank).
        *   *Player 4 (East):* Moves Left ($-1$ file towards file a). Captures diagonally left ($-1$ file, $\pm 1$ rank).

### Kill Matrix Restrictions
In Chaturanga, combat is asymmetrical:
1.  **No King on King Capture:** A *Rajan* (King) cannot capture another *Rajan*.
2.  **Minor vs. Major:** Minor Pieces (*Nara*, *Ashva*, *Danti*) cannot capture Major Pieces (*Ratha*, *Rajan*).
3.  **Friendly Fire:** Allied players (in Team Mode) cannot capture each other's pieces.

---

## 4. Turn & Dice Mechanics

Chaturanga is a probabilistic game where a 6-sided dice roll decides which piece a player must move on their turn:

### Dice to Piece Mapping
*   **Roll 1:** Must move **Ratha** (Chariot).
*   **Roll 3:** Must move **Ashva** (Knight).
*   **Roll 4:** Must move **Danti** (Elephant).
*   **Roll 6:** Must move either **Nara** (Pawn) or **Rajan** (King).
*   **Roll 2 or 5:** Wildcard — can move **any** piece on the board.

### Forfeits & Skipping Turns
*   **Turn Rotation:** Clockwise rotation (Player 1 $\rightarrow$ Player 2 $\rightarrow$ Player 3 $\rightarrow$ Player 4).
*   **Auto-Forfeit:** If the rolled dice value permits only piece types that have no legal moves on the board, the player's turn is skipped automatically. Auto-forfeits do not count towards any penalty.
*   **Manual Forfeit:** A player can choose to manually forfeit their turn. However, a maximum of **3 manual forfeits** is allowed per player per game.
*   **Elimination Skip:** If a player has lost all pieces (or is eliminated in Free-for-All), their turn is permanently skipped, and play passes immediately to the next player.

---

## 5. Pawn Promotion & King Revival

When a Nara (Pawn) reaches the furthest square in its path, it is promoted. Promotion is strictly deterministic based on the **symmetric position** of the promotion square and the state of the allied King.

### Deterministic Symmetry Map
*   **Player 1 (South) Promotion (on Rank 8):**
    *   `a8` $\rightarrow$ Promotes to **Ratha** (Chariot)
    *   `b8` $\rightarrow$ Promotes to **Ashva** (Knight)
    *   `c8` $\rightarrow$ Promotes to **Danti** (Elephant)
    *   `d8` $\rightarrow$ Promotes to **Rajan** (King)
*   **Player 2 (West) Promotion (on File h):**
    *   `h8` $\rightarrow$ Promotes to **Ratha** (Chariot)
    *   `h7` $\rightarrow$ Promotes to **Ashva** (Knight)
    *   `h6` $\rightarrow$ Promotes to **Danti** (Elephant)
    *   `h5` $\rightarrow$ Promotes to **Rajan** (King)
*   **Player 3 (North) Promotion (on Rank 1):**
    *   `h1` $\rightarrow$ Promotes to **Ratha** (Chariot)
    *   `g1` $\rightarrow$ Promotes to **Ashva** (Knight)
    *   `f1` $\rightarrow$ Promotes to **Danti** (Elephant)
    *   `e1` $\rightarrow$ Promotes to **Rajan** (King)
*   **Player 4 (East) Promotion (on File a):**
    *   `a1` $\rightarrow$ Promotes to **Ratha** (Chariot)
    *   `a2` $\rightarrow$ Promotes to **Ashva** (Knight)
    *   `a3` $\rightarrow$ Promotes to **Danti** (Elephant)
    *   `a4` $\rightarrow$ Promotes to **Rajan** (King)

### King Revival Rule
*   A pawn can only promote to a **Rajan** (King) if that player's King has already been captured and is currently dead.
*   If the King is still alive, the pawn cannot promote to a King (and thus cannot legally step onto the King's promotion square).
*   No player may have more than one King on the board at any given time.

---

## 6. Victory & Defeat Conditions

The victory conditions depend on the mode of play:

### Team Mode (2 vs 2)
*   **Alliances:** Player 1 (South) & Player 3 (North) are allies. Player 2 (West) & Player 4 (East) are allies.
*   **Survival:** A team is only defeated when **both allied Kings are captured**.
*   **Teammate Control:** If one player's King is captured, they are not eliminated. They continue playing with their remaining pieces.
*   **Win Condition:** Capture both opposing Kings.

### Free-for-All Mode (1v1v1v1)
*   **Elimination:** The capture of a player's King results in instant elimination.
*   **Clear Board:** Upon elimination, all remaining pieces of that player are immediately cleared from the board.
*   **Win Condition:** The last player with an active King standing on the board wins the game.