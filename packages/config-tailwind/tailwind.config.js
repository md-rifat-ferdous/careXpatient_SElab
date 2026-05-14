/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006b5f',
          container: '#14b8a6',
          fixed: '#71f8e4',
          'fixed-dim': '#4fdbc8',
        },
        secondary: {
          DEFAULT: '#006b5e',
          container: '#6ef9e2',
          fixed: '#6ef9e2',
          'fixed-dim': '#4ddcc6',
        },
        tertiary: {
          DEFAULT: '#50616b',
          container: '#95a7b2',
          fixed: '#d3e5f1',
          'fixed-dim': '#b7c9d5',
        },
        surface: {
          DEFAULT: '#f9f9ff',
          dim: '#cfdaf2',
          bright: '#f9f9ff',
          variant: '#d8e3fb',
          container: {
            lowest: '#ffffff',
            low: '#f0f3ff',
            DEFAULT: '#e7eeff',
            high: '#dee8ff',
            highest: '#d8e3fb',
          },
          tint: '#006b5f',
          white: '#FFFFFF',
        },
        on: {
          primary: '#ffffff',
          'primary-container': '#00423b',
          secondary: '#ffffff',
          'secondary-container': '#007164',
          tertiary: '#ffffff',
          'tertiary-container': '#2c3d46',
          surface: '#111c2d',
          'surface-variant': '#3c4947',
          error: '#ffffff',
          'error-container': '#93000a',
          background: '#111c2d',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        background: {
          DEFAULT: '#f9f9ff',
          'off-white': '#F8FAFC',
        },
        outline: {
          DEFAULT: '#6c7a77',
          variant: '#bbcac6',
        },
        inverse: {
          surface: '#263143',
          'on-surface': '#ecf1ff',
          primary: '#4fdbc8',
        },
        'subtle-gray': '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'h1': ['48px', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
        'full': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 107, 95, 0.05), 0 2px 8px -2px rgba(0, 107, 95, 0.05)',
      }
    },
  },
  plugins: [],
}

