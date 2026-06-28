/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand palette (Vinted-style muted teal, our own brand)
        primary: {
          DEFAULT: "#007782",
          dark: "#005A63",
          light: "#E2EFEF",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          muted: "#6B7280",
          faint: "#9CA3AF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          alt: "#F5F6F7",
          border: "#E5E7EB",
        },
        success: "#16A34A",
        danger: "#DC2626",
        accent: "#FF6B6B",
      },
    },
  },
  plugins: [],
};
