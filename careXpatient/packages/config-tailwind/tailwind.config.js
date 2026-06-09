/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#14B8A6',
          light: '#5EEAD4',
          dark: '#0D9488',
        },
        secondary: {
          DEFAULT: '#E0F2FE',
          dark: '#BAE6FD',
        },
        background: {
          DEFAULT: '#F8FAFC',
          white: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
        },
        text: {
          DEFAULT: '#1E293B',
          muted: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem', // 16px soft radii
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(20, 184, 166, 0.05), 0 2px 8px -2px rgba(20, 184, 166, 0.05)',
      }
    },
  },
  plugins: [],
}
