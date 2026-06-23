/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bloodmoon-dark': '#0F172A', // Deep space black/slate
        'bloodmoon-purple': '#8B5CF6', // Neon purple
        'bloodmoon-day': '#FEF3C7', // Warm cream
        'bloodmoon-sun': '#F59E0B', // Golden sun
        'bloodmoon-wolf': '#E11D48', // Wolf red
        'bloodmoon-villager': '#10B981', // Villager green
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 15px rgba(139, 92, 246, 0.5)' },
          '50%': { opacity: .7, boxShadow: '0 0 5px rgba(139, 92, 246, 0.2)' },
        }
      }
    },
  },
  plugins: [],
}
