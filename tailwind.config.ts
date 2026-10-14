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
        ivory: "#FAF8F5",
        cream: "#F3EEE7",
        charcoal: "#1C1917",
        muted: "#78716C",
        hairline: "#E7E5E4",
        rosewood: "#B76E79",
        rosesoft: "#F5E6E8",
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Manrope", "system-ui", "sans-serif"],
        hand: ["Caveat", "cursive"],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(28, 25, 23, 0.18)",
        card: "0 2px 12px -4px rgba(28, 25, 23, 0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
