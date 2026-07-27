// Piece Types
export const PIECE_TYPES = {
    RAJA: 'raja',     // King
    MANTRI: 'mantri', // Queen/Advisor
    RATHA: 'ratha',   // Rook
    GAJA: 'gaja',     // Bishop/Elephant
    ASHVA: 'ashva',   // Knight
    PADATI: 'padati', // Pawn
};

export const COLORS = {
    WHITE: 'white',
    BLACK: 'black',
};

export const BOARD_SIZE = 8;

export const INITIAL_BOARD = setupBoard();

function setupBoard() {
    const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

    const backRow = [
        PIECE_TYPES.RATHA,
        PIECE_TYPES.ASHVA,
        PIECE_TYPES.GAJA,
        PIECE_TYPES.MANTRI,
        PIECE_TYPES.RAJA,
        PIECE_TYPES.GAJA,
        PIECE_TYPES.ASHVA,
        PIECE_TYPES.RATHA,
    ];

    // Setup White (Rows 6 & 7 visual? No, logic: 0-7. Let's say 0 is White's back row)
    // User said: "White traditionally moves first".
    // Let's assume White is at row 0, moving towards 7.
    // Black is at row 7, moving towards 0.

    // White Pieces
    backRow.forEach((type, col) => {
        board[0][col] = { type, color: COLORS.WHITE };
        board[1][col] = { type: PIECE_TYPES.PADATI, color: COLORS.WHITE };
    });

    // Black Pieces
    backRow.forEach((type, col) => {
        board[7][col] = { type, color: COLORS.BLACK };
        board[6][col] = { type: PIECE_TYPES.PADATI, color: COLORS.BLACK };
    });

    return board;
}

export function isValidMove(board, start, end, turnColor) {
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;
    const piece = board[startRow][startCol];

    // Basic validation
    if (!piece) return false;
    if (piece.color !== turnColor) return false;
    if (startRow === endRow && startCol === endCol) return false;
    if (endRow < 0 || endRow >= BOARD_SIZE || endCol < 0 || endCol >= BOARD_SIZE) return false;

    const target = board[endRow][endCol];
    if (target && target.color === piece.color) return false; // Cannot capture own piece

    const dx = Math.abs(endCol - startCol);
    const dy = Math.abs(endRow - startRow);
    const direction = piece.color === COLORS.WHITE ? 1 : -1; // 1 for White moving down? Wait.
    // Standard chess: White at 0,0?
    // If White is at row 0, "Forward" is increasing row index.
    // So direction = 1.

    switch (piece.type) {
        case PIECE_TYPES.RAJA: // King: 1 step any direction
            return dx <= 1 && dy <= 1;

        case PIECE_TYPES.MANTRI: // Minister: 1 step diagonal
            return dx === 1 && dy === 1;

        case PIECE_TYPES.RATHA: // Rook: Horizontal/Vertical, no jump
            if (dx !== 0 && dy !== 0) return false;
            return isPathClear(board, start, end);

        case PIECE_TYPES.GAJA: // Elephant: Exact 2 steps diagonal, JUMPS
            return dx === 2 && dy === 2; // Jump allowed, no path check

        case PIECE_TYPES.ASHVA: // Knight: L-shape, JUMPS
            return (dx === 2 && dy === 1) || (dx === 1 && dy === 2);

        case PIECE_TYPES.PADATI: // Pawn
            // Move 1 fwd
            if (dx === 0 && dy === 1) { // Forward 1
                // Must be empty
                if ((endRow - startRow) === direction) {
                    return !target;
                }
            }
            // Capture 1 diagonal
            if (dx === 1 && dy === 1) {
                if ((endRow - startRow) === direction) {
                    return target && target.color !== piece.color;
                }
            }
            return false;

        default:
            return false;
    }
}

function isPathClear(board, start, end) {
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;
    const dx = Math.sign(endCol - startCol);
    const dy = Math.sign(endRow - startRow);

    let r = startRow + dy;
    let c = startCol + dx;

    while (r !== endRow || c !== endCol) {
        if (board[r][c]) return false;
        r += dy;
        c += dx;
    }
    return true;
}

export function getPossibleMoves(board, start) {
    const [startRow, startCol] = start;
    const piece = board[startRow][startCol];
    if (!piece) return [];

    const moves = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (isValidMove(board, start, [r, c], piece.color)) {
                moves.push([r, c]);
            }
        }
    }
    return moves;
}

export function isKingCaptured(board, color) {
    // Check if King of 'color' is missing
    // Actually, the game ends WHEN the king is captured.
    // So we check if the move CAPTURED a King.
    // Or we check state after move.
    let kingFound = false;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const p = board[r][c];
            if (p && p.type === PIECE_TYPES.RAJA && p.color === color) {
                kingFound = true;
            }
        }
    }
    return !kingFound;
}
