import { motion } from 'framer-motion';
import { BookOpen, Crown, Scroll } from 'lucide-react';

export default function ScholarCorner() {
    return (
        <motion.section
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="py-20 px-4"
        >
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="inline-block p-4 bg-gradient-to-br from-gold/20 to-terracotta/20 rounded-full mb-6"
                    >
                        <BookOpen className="w-12 h-12 text-gold" strokeWidth={1.5} />
                    </motion.div>
                    <h3 className="font-heading text-4xl md:text-5xl text-gold mb-4 tracking-wide">
                        Scholar's Corner
                    </h3>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
                </div>

                {/* Manuscript Container */}
                <div className="manuscript-bg rounded-2xl p-8 md:p-12 shadow-2xl border-4 border-gold/40 relative overflow-hidden">
                    {/* Decorative corner flourishes */}
                    <div className="absolute top-0 left-0 w-24 h-24 opacity-20">
                        <svg viewBox="0 0 100 100" className="text-terracotta-dark">
                            <path d="M0,0 Q50,0 50,50 Q0,50 0,0" fill="currentColor" />
                        </svg>
                    </div>
                    <div className="absolute bottom-0 right-0 w-24 h-24 opacity-20 rotate-180">
                        <svg viewBox="0 0 100 100" className="text-terracotta-dark">
                            <path d="M0,0 Q50,0 50,50 Q0,50 0,0" fill="currentColor" />
                        </svg>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 space-y-6 text-stone-dark">
                        {/* Title with icon */}
                        <div className="flex items-center gap-3 mb-6">
                            <Crown className="w-8 h-8 text-terracotta-dark" strokeWidth={2} />
                            <h4 className="font-heading text-3xl text-terracotta-dark tracking-wide">
                                The Ancient Game
                            </h4>
                        </div>

                        {/* Historical text */}
                        <p className="font-body text-lg leading-relaxed text-stone">
                            <span className="font-heading text-2xl text-terracotta-dark float-left mr-3 mt-1">C</span>
                            haturanga, meaning "four divisions" in Sanskrit, emerged during the Gupta Empire
                            around the 6th century CE. This strategic board game represented the four branches
                            of the ancient Indian military: infantry (Padāti), cavalry (Ashva), elephants (Gaja),
                            and chariots (Ratha).
                        </p>

                        <div className="flex items-center gap-2 my-6">
                            <Scroll className="w-6 h-6 text-terracotta" />
                            <div className="flex-1 h-px bg-gradient-to-r from-terracotta/50 to-transparent" />
                        </div>

                        <p className="font-body text-lg leading-relaxed text-stone">
                            Played on an 8×8 board, Chaturanga is recognized as the earliest ancestor of chess,
                            spreading westward through Persia (becoming Shatranj) and eventually evolving into
                            the modern game we know today. The Raja (King) and his court of advisors commanded
                            these forces in a battle of wits and strategy.
                        </p>

                        <div className="flex items-center gap-2 my-6">
                            <Scroll className="w-6 h-6 text-terracotta" />
                            <div className="flex-1 h-px bg-gradient-to-r from-terracotta/50 to-transparent" />
                        </div>

                        <p className="font-body text-lg leading-relaxed text-stone italic">
                            "As in life, so in Chaturanga: the wise player sees many moves ahead,
                            while the fool sees only the present square."
                        </p>

                        <p className="font-body text-sm text-right text-terracotta-dark mt-4">
                            — Ancient Sanskrit Proverb
                        </p>
                    </div>

                    {/* Aged paper effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-terracotta/5 to-terracotta/10 pointer-events-none rounded-2xl" />
                </div>
            </div>
        </motion.section>
    );
}
