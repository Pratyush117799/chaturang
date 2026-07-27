/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Gupta Empire Color Palette
                'saffron': {
                    DEFAULT: '#FF9933',
                    light: '#FFB366',
                    dark: '#E67300',
                },
                'terracotta': {
                    DEFAULT: '#CD5C5C',
                    light: '#E08080',
                    dark: '#B7410E',
                },
                'gold': {
                    DEFAULT: '#D4AF37',
                    light: '#E6C96B',
                    antique: '#C5A572',
                },
                'parchment': {
                    DEFAULT: '#F5E6D3',
                    light: '#FFF8DC',
                    dark: '#E8D4B8',
                },
                'stone': {
                    DEFAULT: '#3E3E3E',
                    light: '#5A5A5A',
                    dark: '#2C2C2C',
                },
                // Keep existing board colors for game
                'board-dark': '#8b4513',
                'board-light': '#cd853f',
            },
            fontFamily: {
                'heading': ['Eczar', 'serif'],
                'body': ['Inter', 'sans-serif'],
            },
            animation: {
                'stone-fade': 'stoneFade 1.2s ease-out',
                'slow-rise': 'slowRise 1.5s ease-out',
            },
            keyframes: {
                stoneFade: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slowRise: {
                    '0%': { opacity: '0', transform: 'translateY(40px) scale(0.95)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
            },
        },
    },
    plugins: [],
}
