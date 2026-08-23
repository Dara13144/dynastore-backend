/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#05070C',           // Deep Black / Charcoal
          card: '#0D1424',         // Glassy Deep Navy
          nav: '#090F1D',          // Translucent Header
          gold: '#F59E0B',         // Primary Metallic Gold Accent
          goldHover: '#D97706',    // Darker Gold
          goldLight: '#FCD34D',    // Soft Gold Glow
          navy: '#0F172A',         // Slate Navy
          slate: '#1E293B',        // Dynamic Surface Slate
          accent: '#3B82F6'        // Electric Blue Accent
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(245, 158, 11, 0.4)',
        'gold-sm': '0 0 10px rgba(245, 158, 11, 0.25)',
        'blue-glow': '0 0 25px -5px rgba(59, 130, 246, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
        'gold-shimmer': 'linear-gradient(90deg, #FCD34D 0%, #F59E0B 50%, #D97706 100%)',
        'navy-gradient': 'linear-gradient(180deg, rgba(13, 20, 36, 0.8) 0%, rgba(5, 7, 12, 0.95) 100%)',
        'hero-overlay': 'linear-gradient(0deg, #05070C 0%, rgba(5, 7, 12, 0.7) 40%, rgba(5, 7, 12, 0) 100%)'
      }
    },
  },
  plugins: [],
}
