import HeroSection from './HeroSection';
import ModeSelector from './ModeSelector';
import ScholarCorner from './ScholarCorner';

export default function LandingPage({ onEnter, onSelectMode }) {
    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-stone-dark via-[#1a1410] to-stone-dark" />

            {/* Radial glow effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-saffron/10 via-transparent to-transparent" />

            {/* Content */}
            <div className="relative z-10">
                <HeroSection onEnter={onEnter} />
                <ModeSelector onSelectMode={onSelectMode} />
                <ScholarCorner />
            </div>

            {/* Decorative bottom fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-dark to-transparent pointer-events-none" />
        </div>
    );
}
