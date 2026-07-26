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