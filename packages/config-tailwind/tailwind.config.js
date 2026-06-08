/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#005EB8', // Stitch Medical Blue
          dark: '#00478d',
          light: '#c8daff',
        },
        secondary: {
          DEFAULT: '#585f66',
          muted: '#EBF2FA', // Stitch Soft Tint Blue
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8f9ff', // Stitch background
          bright: '#ffffff',
          dim: '#cbdbf5',
          container: {
            lowest: '#ffffff',
            low: '#eff4ff',
            DEFAULT: '#e5eeff',
            high: '#dce9ff',
            highest: '#d3e4fe',
          }
        },
        border: {
          soft: '#E2E8F0',
        },
        alert: {
          critical: '#ba1a1a',
          success: '#22C55E', // Stitch Clinical Green
          info: '#005db6',
        },
        text: {
          DEFAULT: '#0b1c30', // Stitch on-surface
          muted: '#424752', // Stitch on-surface-variant
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '0.25rem', // 4px
        DEFAULT: '0.5rem', // 8px (Standard elements)
        'md': '0.75rem', // 12px
        'lg': '1rem', // 16px
        'xl': '1.5rem', // 24px
      },
      spacing: {
        'base': '4px',
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'gutter': '24px',
        'container-padding': '40px',
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'tonal': '0px 4px 12px rgba(0, 93, 182, 0.1)', // Medical-blue tinted shadow
      }
    },
  },
  plugins: [],
}
