/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class", // toggled at runtime via nativewind colorScheme (lib/theme.ts)
  theme: {
    extend: {
      colors: {
        // Brand palette (Vinted-style muted teal, our own brand) — constant across themes.
        primary: {
          DEFAULT: "#007782",
          dark: "#005A63",
          light: "#E2EFEF",
        },
        // Theme-aware neutrals — resolved from CSS variables in global.css so they
        // flip between light and dark. Channels + <alpha-value> keeps opacity utilities working.
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          muted: "rgb(var(--color-ink-muted) / <alpha-value>)",
          faint: "rgb(var(--color-ink-faint) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          alt: "rgb(var(--color-surface-alt) / <alpha-value>)",
          border: "rgb(var(--color-surface-border) / <alpha-value>)",
        },
        success: "#16A34A",
        danger: "#DC2626",
        accent: "#FF6B6B",
      },
    },
  },
  plugins: [],
};
