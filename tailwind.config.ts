import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#1a1a2e",
        sand: "#faf6f1",
        amber: "#e8a838",
        teal: "#0d7377",
        coral: "#e8614a",
        moss: "#5a7a5a",
        paper: "#fdfcfa",
      },
      fontFamily: {
        sans: ["DM Sans", "system-ui", "-apple-system", "sans-serif"],
        serif: ["DM Serif Display", "Georgia", "serif"],
      },
      keyframes: {
        "squiggle": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-40px)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "ink-spread": {
          "0%": { opacity: "0", filter: "blur(8px)" },
          "100%": { opacity: "1", filter: "blur(0)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "squiggle": "squiggle 20s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "ink-spread": "ink-spread 0.6s ease-out",
        "fade-up": "fade-up 0.5s ease-out",
      },
    },
  },
  plugins: [],
};
export default config;
