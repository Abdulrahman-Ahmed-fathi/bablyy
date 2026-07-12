import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "var(--color-black)",
        cream: "var(--color-cream)",
        brown: {
          DEFAULT: "var(--color-brown)",
          light: "var(--color-brown-light)",
        },
        "cream-dark": "var(--color-cream-dark)",
        white: "var(--color-white)",
        gold: "var(--color-gold)",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-jost)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        container: "1400px",
      },
      borderRadius: {
        luxury: "1rem",
      },
      boxShadow: {
        luxury: "0 20px 50px -12px rgba(61, 28, 16, 0.15)",
        "luxury-sm": "0 8px 24px -8px rgba(61, 28, 16, 0.12)",
      },
      animation: {
        shimmer: "shimmer 2s infinite linear",
        marquee: "marquee 25s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
