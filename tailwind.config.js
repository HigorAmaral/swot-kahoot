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
          red: '#E11D48',
          blue: '#0284C7',
          yellow: '#D97706',
          green: '#059669',
          purple: '#0D9488',
          darkPurple: '#0F172A',
          lightPurple: '#14B8A6',
          neonCyan: '#22D3EE',
          neonPink: '#34D399',
          surface: '#0B1120',
          card: '#111827',
        }
      },
      boxShadow: {
        'neon-red': '0 0 25px rgba(225, 29, 72, 0.45)',
        'neon-blue': '0 0 25px rgba(2, 132, 199, 0.45)',
        'neon-yellow': '0 0 25px rgba(217, 119, 6, 0.45)',
        'neon-green': '0 0 25px rgba(5, 150, 105, 0.45)',
        'neon-purple': '0 0 35px rgba(20, 184, 166, 0.45)',
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
