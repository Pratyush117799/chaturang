import { motion } from 'framer-motion';

export default function HeroSection({ onEnter }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="text-center py-20 px-4"
        >
            {/* Decorative top border */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="w-32 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-8"
            />

            {/* Main Title */}
            <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.5 }}
                className="font-heading text-7xl md:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-gold to-terracotta-dark mb-6 tracking-wide"
                style={{ textShadow: '0 0 40px rgba(212, 175, 55, 0.3)' }}
            >
                चतुरङ्ग
            </motion.h1>

            {/* English Title */}
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="font-heading text-3xl md:text-4xl text-parchment mb-4 tracking-widest"
            >
                CHATURANGA
            </motion.h2>

            {/* Subtitle */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.1 }}
                className="font-body text-xl md:text-2xl text-gold-antique mb-12 italic tracking-wide"
            >
                The Royal Game of India
            </motion.p>

            {/* Decorative divider */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.3 }}
                className="flex items-center justify-center gap-4 mb-12"
            >
                <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold" />
                <div className="w-2 h-2 rotate-45 bg-gold" />
                <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold" />
            </motion.div>

            {/* CTA Button */}
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={onEnter}
                className="seal-button px-12 py-5 text-parchment font-heading text-xl md:text-2xl font-semibold tracking-widest uppercase rounded-lg"
            >
                Enter the Battlefield
            </motion.button>

            {/* Decorative bottom border */}
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.2, delay: 1.7 }}
                className="w-32 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-8"
            />
        </motion.section>
    );
}
