/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#17263C',
          deep: '#101B2B',
          light: '#243B5A',
        },
        ivory: {
          DEFAULT: '#FAF9F6',
          dark: '#F0ECE1',
        },
        champagne: {
          DEFAULT: '#C5A46D',
          light: '#D4BC90',
          dark: '#B08E55',
        },
        borderGrey: '#E5E7EB',
        mutedGrey: '#747B85',
        successGreen: '#26734D',
        errorRed: '#B42318',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
}
