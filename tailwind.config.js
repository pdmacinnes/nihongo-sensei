/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'Noto Sans JP', 'system-ui', 'sans-serif'],
        japanese: ['Noto Sans JP', 'Yu Gothic UI', 'Hiragino Sans', 'Meiryo', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#faf9f5',
          secondary: '#f3f1eb',
          card: '#ffffff',
          hover: '#f0ede6',
        },
        border: {
          DEFAULT: '#e2ddd6',
          light: '#ccc8c0',
        },
        sakura: {
          DEFAULT: '#c94b4b',
          bright: '#e05555',
          muted: '#f5dada',
          glow: 'rgba(201,75,75,0.15)',
        },
        gold: {
          DEFAULT: '#b07d1a',
          bright: '#c98f20',
          muted: '#fdf3dc',
        },
        jade: {
          DEFAULT: '#2d8a5e',
          bright: '#35a570',
          muted: '#d8f0e6',
        },
        ink: {
          100: '#1a1a2a',
          200: '#3a3a50',
          300: '#5a5a78',
          400: '#8a8aa8',
          500: '#b8b8cc',
          600: '#dddde8',
        },
        // Semantic aliases
        surface: '#ffffff',
        paper: '#faf9f5',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'card-lg': '0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.05)',
        'sakura': '0 2px 12px rgba(201,75,75,0.18)',
        'inner-sm': 'inset 0 1px 2px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pop': 'pop 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(10px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-6px)' } },
        pop: { '0%': { transform: 'scale(0.92)' }, '60%': { transform: 'scale(1.04)' }, '100%': { transform: 'scale(1)' } },
      },
    },
  },
  plugins: [],
}
