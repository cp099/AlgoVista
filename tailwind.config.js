/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Semantic Colors mapped to CSS Variables
        'algo-bg': 'var(--color-bg)',
        'algo-surface': 'var(--color-surface)',
        'algo-border': 'var(--color-border)',
        'algo-text': 'var(--color-text-main)',
        'algo-muted': 'var(--color-text-muted)',
        'algo-primary': 'var(--color-primary)',
        'algo-accent': 'var(--color-accent)',
        'algo-success': 'var(--color-success)', // <--- ADDED THIS
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}