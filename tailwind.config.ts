import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Biru dusty ala referensi: hitam diganti biru tua berdebu
        black: "#3C4C6E",
        ivory: "#FAF8F5",
        cream: "#F3EEE7",
        charcoal: "#3C4C6E",
        muted: "#78716C",
        hairline: "#E7E5E4",
        rosewood: "#B76E79",
        rosesoft: "#F5E6E8",
        paper: "#E8EEF6",
        ink: "#3C4C6E",
        smoke: "#17171A",
        dusty: "#8E9CBE",
        dustydeep: "#5A6B94",
        mist: "#F2F6FC",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ["Manrope", "system-ui", "sans-serif"],
        hand: ["Caveat", "cursive"],
        display: ['"Anton"', "Arial Black", "sans-serif"],
        script: ['"Great Vibes"', "cursive"],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(28, 25, 23, 0.18)",
        card: "0 2px 12px -4px rgba(28, 25, 23, 0.12)",
        pop: "0 24px 80px -24px rgba(0,0,0,0.25)",
        hard: "5px 5px 0 0 #3C4C6E",
        hardSm: "3px 3px 0 0 #3C4C6E",
      },
    },
  },
  plugins: [],
};
export default config;
