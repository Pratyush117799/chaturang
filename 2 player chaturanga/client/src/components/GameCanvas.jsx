import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Board } from './Board';
import { INITIAL_BOARD, COLORS, getPossibleMoves, PIECE_TYPES } from '../game/rules';

export default function GameCanvas({ mode, onBack }) {
    const [board, setBoard] = useState(INITIAL_BOARD);
    const [turn, setTurn] = useState(COLORS.WHITE);
    const [selectedPos, setSelectedPos] = useState(null);
    const [possibleMoves, setPossibleMoves] = useState([]);
    const [winner, setWinner] = useState(null);

    const handleSquareClick = (row, col) => {
        if (winner) return;

        const clickedPiece = board[row][col];
        const isSameColor = clickedPiece?.color === turn;

        if (selectedPos) {
            const [startRow, startCol] = selectedPos;

            if (startRow === row && startCol === col) {
                setSelectedPos(null);
                setPossibleMoves([]);
                return;
            }

            if (isSameColor) {
                setSelectedPos([row, col]);
                setPossibleMoves(getPossibleMoves(board, [row, col]));
                return;
            }

            if (possibleMoves.some(m => m[0] === row && m[1] === col)) {
                const newBoard = board.map(r => r.map(p => p ? { ...p } : null));
                newBoard[row][col] = newBoard[startRow][startCol];
                newBoard[startRow][startCol] = null;

                const piece = newBoard[row][col];
                if (piece.type === PIECE_TYPES.PADATI) {
                    if (piece.color === COLORS.WHITE && row === 7) piece.type = PIECE_TYPES.MANTRI;
                    if (piece.color === COLORS.BLACK && row === 0) piece.type = PIECE_TYPES.MANTRI;
                }

                setBoard(newBoard);

                if (clickedPiece && clickedPiece.type === PIECE_TYPES.RAJA) {
                    setWinner(turn);
                } else {
                    setTurn(turn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE);
                }

                setSelectedPos(null);
                setPossibleMoves([]);
            }
        } else {
            if (isSameColor) {
                setSelectedPos([row, col]);
                setPossibleMoves(getPossibleMoves(board, [row, col]));
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-stone-dark via-[#1a1410] to-stone-dark flex flex-col items-center justify-center p-4 md:p-8">
            {/* Back button */}
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                onClick={onBack}
                className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-stone/80 hover:bg-stone text-parchment rounded-lg border border-gold/30 hover:border-gold transition-all duration-300"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-body">Back</span>
            </motion.button>

            {/* Mode indicator */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-8 text-center"
            >
                <h2 className="font-heading text-3xl md:text-4xl text-gold mb-2">
                    {mode === 'bot' ? 'Playing vs Bot' : 'Playing Online'}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
            </motion.div>

            {/* Game container */}
            <div className="flex flex-col lg:flex-row gap-8 md:gap-16 items-center lg:items-start z-10">
                {/* Turn indicators */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="text-parchment space-y-8 min-w-[200px]"
                >
                    <div className={`p-4 rounded-lg transition-all duration-300 border border-transparent ${turn === COLORS.WHITE ? 'bg-gold/20 border-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'opacity-50'}`}>
                        <h3 className={`text-2xl font-heading ${turn === COLORS.WHITE ? 'text-parchment font-bold' : 'text-stone-light'}`}>
                            White Army
                        </h3>
                        {turn === COLORS.WHITE && <div className="text-sm text-gold mt-2 animate-pulse font-body">Your Turn</div>}
                    </div>
                    <div className={`p-4 rounded-lg transition-all duration-300 border border-transparent ${turn === COLORS.BLACK ? 'bg-gold/20 border-gold/50 shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'opacity-50'}`}>
                        <h3 className={`text-2xl font-heading ${turn === COLORS.BLACK ? 'text-parchment font-bold' : 'text-stone-light'}`}>
                            Black Army
                        </h3>
                        {turn === COLORS.BLACK && <div className="text-sm text-gold mt-2 animate-pulse font-body">Your Turn</div>}
                    </div>
                </motion.div>

                {/* Board */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                >
                    <Board
                        board={board}
                        validMoves={possibleMoves}
                        onSquareClick={handleSquareClick}
                        selectedPos={selectedPos}
                    />
                </motion.div>

                {/* Rules sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="w-72 manuscript-bg backdrop-blur p-6 rounded-xl border-2 border-gold/40 shadow-xl text-sm text-stone h-fit"
                >
                    <h3 className="text-xl text-terracotta-dark mb-4 border-b border-stone/30 pb-2 font-heading">Ancient Rules</h3>
                    <ul className="space-y-3 font-body font-light">
                        <li className="flex items-start gap-2"><span className="text-terracotta text-lg">♔</span> <span><b>Raja (King):</b> 1 step any direction.</span></li>
                        <li className="flex items-start gap-2"><span className="text-terracotta text-lg">♕</span> <span><b>Mantri:</b> 1 step Diagonal.</span></li>
                        <li className="flex items-start gap-2"><span className="text-terracotta text-lg">♗</span> <span><b>Gaja:</b> Jump 2 steps Diagonal.</span></li>
                        <li className="flex items-start gap-2"><span className="text-terracotta text-lg">♘</span> <span><b>Ashva:</b> Knight jump (L-shape).</span></li>
                        <li className="flex items-start gap-2"><span className="text-terracotta text-lg">♖</span> <span><b>Ratha:</b> Rook moves.</span></li>
                        <li className="flex items-start gap-2"><span className="text-terracotta text-lg">♙</span> <span><b>Padati:</b> Pawn moves. Promote to Mantri.</span></li>
                    </ul>
                </motion.div>
            </div>

            {/* Victory modal */}
            {winner && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="manuscript-bg p-12 rounded-2xl border-4 border-gold shadow-[0_0_50px_rgba(212,175,55,0.5)] text-center max-w-lg w-full"
                    >
                        <div className="text-6xl mb-6">♛</div>
                        <h2 className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-terracotta to-gold font-bold mb-6 font-heading">
                            {winner === COLORS.WHITE ? 'White' : 'Black'} Wins!
                        </h2>
                        <p className="text-stone mb-8 text-lg font-body">The enemy Raja has been captured.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="seal-button px-8 py-3 text-parchment rounded-lg font-bold font-heading tracking-wider"
                        >
                            PLAY AGAIN
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
