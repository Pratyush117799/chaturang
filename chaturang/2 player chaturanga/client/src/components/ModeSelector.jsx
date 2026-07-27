import { motion } from 'framer-motion';
import { Swords, Bot } from 'lucide-react';

export default function ModeSelector({ onSelectMode }) {
    const modes = [
        {
            id: 'bot',
            title: 'Play vs Bot',
            description: 'Challenge the wisdom of an ancient strategist',
            icon: Bot,
            gradient: 'from-terracotta-dark to-terracotta',
            delay: 0.2,
        },
        {
            id: 'online',
            title: 'Play Online',
            description: 'Cross swords with warriors across the realm',
            icon: Swords,
            gradient: 'from-saffron-dark to-saffron',
            delay: 0.4,
        },
    ];

    return (
        <section id="mode-selector" className="py-16 px-4">
            <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="font-heading text-4xl md:text-5xl text-center text-gold mb-12 tracking-wide"
            >
                Choose Your Path
            </motion.h3>

            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                {modes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                        <motion.div
                            key={mode.id}
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 1.2, delay: mode.delay }}
                            whileHover={{ scale: 1.03, y: -8 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectMode(mode.id)}
                            className="relative group cursor-pointer"
                        >
                            {/* Card background */}
                            <div className="relative bg-gradient-to-br from-stone-dark to-stone p-8 rounded-2xl border-2 border-gold/30 overflow-hidden transition-all duration-500 group-hover:border-gold group-hover:shadow-[0_0_40px_rgba(212,175,55,0.4)]">
                                {/* Decorative corner ornaments */}
                                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-gold/50 rounded-tl-2xl" />
                                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-gold/50 rounded-br-2xl" />

                                {/* Icon */}
                                <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${mode.gradient} flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow duration-500`}>
                                    <Icon className="w-10 h-10 text-parchment" strokeWidth={2.5} />
                                </div>

                                {/* Title */}
                                <h4 className="font-heading text-2xl md:text-3xl text-parchment text-center mb-3 tracking-wide">
                                    {mode.title}
                                </h4>

                                {/* Description */}
                                <p className="font-body text-gold-antique text-center text-sm md:text-base leading-relaxed">
                                    {mode.description}
                                </p>

                                {/* Hover glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gold/0 via-gold/0 to-gold/0 group-hover:from-gold/5 group-hover:via-gold/10 group-hover:to-gold/5 transition-all duration-500 rounded-2xl pointer-events-none" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
