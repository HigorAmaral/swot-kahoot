/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kahoot: {
          red: '#E21B3C',
          blue: '#1368CE',
          yellow: '#D89E00',
          green: '#26890C',
          purple: '#46178F',
          darkPurple: '#1A0B36',
          lightPurple: '#864CBF',
          neonCyan: '#00F0FF',
          neonPink: '#FF007F',
          surface: '#130C2E',
          card: '#1F1447',
        }
      },
      boxShadow: {
        'neon-red': '0 0 25px rgba(226, 27, 60, 0.45)',
        'neon-blue': '0 0 25px rgba(19, 104, 206, 0.45)',
        'neon-yellow': '0 0 25px rgba(216, 158, 0, 0.45)',
        'neon-green': '0 0 25px rgba(38, 137, 12, 0.45)',
        'neon-purple': '0 0 35px rgba(134, 76, 191, 0.5)',
        'neon-gold': '0 0 35px rgba(245, 158, 11, 0.5)',
      },
      animation: {
        'bounce-short': 'bounce 0.5s ease-in-out 2',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
