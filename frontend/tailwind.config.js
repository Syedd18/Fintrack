/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "rgba(255, 255, 255, 0.08)",
        card: "rgba(24, 24, 27, 0.65)",
        cardHover: "rgba(39, 39, 42, 0.85)",
        primary: {
          DEFAULT: "#10b981",
          hover: "#059669",
        },
      },
    },
  },
  plugins: [],
}
