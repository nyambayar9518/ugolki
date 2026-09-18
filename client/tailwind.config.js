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
        board: {
          light: '#f0d9b5',
          dark: '#b58863',
          slateLight: '#cbd5e1',
          slateDark: '#475569',
          woodLight: '#e6c8a2',
          woodDark: '#8b5a2b'
        }
      },
      animation: {
        'bounce-short': 'bounce 0.4s ease-in-out 1',
        'pulse-glow': 'pulse-glow 1.5s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.95)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
