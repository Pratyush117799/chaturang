import { useState } from 'react';
import { motion } from 'framer-motion';
import { Piece } from './Piece';
import { COLORS } from '../game/rules';

export function Board({ board, validMoves, onSquareClick, selectedPos }) {
    return (
        <div className="grid grid-cols-8 gap-0 p-2 bg-[#4a3728] rounded-lg shadow-2xl border-8 border-[#4a3728] w-full max-w-[500px] aspect-square select-none mx-auto">
            {board.map((row, rIndex) =>
                row.map((piece, cIndex) => {
                    // Check if this square is a valid move target
                    const isValidTarget = validMoves.some(m => m[0] === rIndex && m[1] === cIndex);
                    const isSelected = selectedPos && selectedPos[0] === rIndex && selectedPos[1] === cIndex;
                    const isLight = (rIndex + cIndex) % 2 === 0;
                    const squareColor = isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]';

                    return (
                        <div
                            key={`${rIndex}-${cIndex}`}
                            onClick={() => onSquareClick(rIndex, cIndex)}
                            className={`
                relative flex items-center justify-center w-full h-full
                ${squareColor}
                ${isSelected ? 'ring-inset ring-4 ring-[#ffd54f] z-10' : ''}
                cursor-pointer hover:brightness-105 transition-all duration-150
              `}
                        >
                            {/* Rank and File labels */}
                            {cIndex === 0 && (
                                <span className={`absolute top-0 left-0.5 text-[10px] font-bold ${isLight ? 'text-[#b58863]' : 'text-[#f0d9b5]'}`}>
                                    {8 - rIndex}
                                </span>
                            )}
                            {rIndex === 7 && (
                                <span className={`absolute bottom-0 right-0.5 text-[10px] font-bold ${isLight ? 'text-[#b58863]' : 'text-[#f0d9b5]'}`}>
                                    {String.fromCharCode(97 + cIndex)}
                                </span>
                            )}

                            {/* Move indicator */}
                            {isValidTarget && (
                                <div className={`absolute w-3 h-3 rounded-full ${piece ? 'ring-4 ring-green-600/50' : 'bg-green-600/40'}`}>
                                </div>
                            )}

                            {piece && (
                                <Piece
                                    type={piece.type}
                                    color={piece.color}
                                    isSelected={isSelected}
                                />
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}
