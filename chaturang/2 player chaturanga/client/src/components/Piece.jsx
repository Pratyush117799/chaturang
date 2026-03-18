import { motion } from 'framer-motion';
import { PIECE_TYPES, COLORS } from '../game/rules';

const PIECE_IMAGES = {
    [COLORS.WHITE]: {
        [PIECE_TYPES.RAJA]: '/pieces/white_raja.jpg',
        [PIECE_TYPES.MANTRI]: '/pieces/white_raja.jpg', // Reuse Raja for now
        [PIECE_TYPES.RATHA]: '/pieces/white_ratha.png',
        [PIECE_TYPES.GAJA]: '/pieces/white_gaja.png',
        [PIECE_TYPES.ASHVA]: '/pieces/white_ashva.png',
        [PIECE_TYPES.PADATI]: '/pieces/white_padati.jpg',
    },
    [COLORS.BLACK]: {
        [PIECE_TYPES.RAJA]: '/pieces/black_raja.jpg',
        [PIECE_TYPES.MANTRI]: '/pieces/black_raja.jpg', // Reuse Raja for now
        [PIECE_TYPES.RATHA]: '/pieces/black_ratha.jpg',
        [PIECE_TYPES.GAJA]: '/pieces/black_gaja.jpg',
        [PIECE_TYPES.ASHVA]: '/pieces/black_ashva.jpg',
        [PIECE_TYPES.PADATI]: '/pieces/black_padati.jpg',
    }
};

export function Piece({ type, color, isSelected }) {
    const imageSrc = PIECE_IMAGES[color]?.[type];

    return (
        <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
                scale: isSelected ? 1.2 : 1,
                opacity: 1,
                y: isSelected ? -10 : 0
            }}
            className={`
                relative w-full h-full flex items-center justify-center
                select-none cursor-pointer
                transition-transform duration-300
                ${isSelected ? 'z-20' : 'z-10'}
            `}
            style={{
                filter: isSelected ? 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' : 'drop-shadow(0 4px 4px rgba(0,0,0,0.3))'
            }}
        >
            {imageSrc ? (
                <>
                    <img
                        src={imageSrc}
                        alt={`${color} ${type}`}
                        className={`
                            max-w-[85%] max-h-[85%] object-contain mix-blend-multiply
                            ${type === PIECE_TYPES.MANTRI ? 'scale-75 brightness-90' : ''} 
                        `}
                    />
                    {type === PIECE_TYPES.MANTRI && (
                        <div className="absolute -bottom-1 -right-1 bg-black/50 text-white text-[8px] px-1 rounded">
                            M
                        </div>
                    )}
                </>
            ) : (
                <span className="text-red-500">?</span>
            )}
        </motion.div>
    );
}
