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
        // Scrapbook raspberry: hitam diganti maroon tua agar seluruh
        // border/tombol/bayangan ikut jadi merah marun otomatis.
        black: "#5C1A24",
        ivory: "#FFFDF7",
        cream: "#FAF3E3",
        charcoal: "#54232D",
        muted: "#8A6F75",
        hairline: "#EADDC8",
        rosewood: "#B76E79",
        rosesoft: "#F5E6E8",
        paper: "#F1E7D2",
        ink: "#54232D",
        smoke: "#2A1218",
        dusty: "#A9BEDD",
        dustydeep: "#7E96BE",
        raspberry: "#A6193C",
        wine: "#7A1E2B",
        blush: "#F3D9DE",
        mist: "#F6F9FE",
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
        hard: "5px 5px 0 0 #5C1A24",
        hardSm: "3px 3px 0 0 #5C1A24",
      },
    },
  },
  plugins: [],
};
export default config;
