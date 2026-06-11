/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#006b5f",
        "on-primary": "#ffffff",
        "primary-container": "#14b8a6",
        "on-primary-container": "#00423b",
        secondary: "#006b5e",
        "secondary-container": "#6ef9e2",
        "on-secondary-container": "#007164",
        "background-off-white": "#F8FAFC",
        background: "#f9f9ff",
        surface: "#f9f9ff",
        "surface-white": "#FFFFFF",
        "on-surface": "#111c2d",
        "on-surface-variant": "#3c4947",
        "outline-variant": "#bbcac6",
        outline: "#6c7a77",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",
        "subtle-gray": "#94A3B8",
        success: "#10B981",
        warning: "#F59E0B",
        info: "#3B82F6",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "16px",
        full: "9999px",
      },
      fontFamily: {
        body: ["Inter", "Public Sans", "sans-serif"],
        headline: ["Inter", "Public Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
