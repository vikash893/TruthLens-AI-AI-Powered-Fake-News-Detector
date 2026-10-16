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
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9ddfd',
          300: '#7cc2fb',
          400: '#36a3f7',
          500: '#0c87eb',
          600: '#026bc9',
          700: '#0355a3',
          800: '#074886',
          900: '#0c3d6f',
          950: '#08274a',
        },
        verdict: {
          supported: '#10b981',
          refuted: '#ef4444',
          mixed: '#f59e0b',
          insufficient: '#6b7280',
          context: '#f97316',
          notverifiable: '#8b5cf6'
        }
      }
    },
  },
  plugins: [],
}
