import type { Config } from "tailwindcss";
import { brandTheme } from "./lib/brand-theme";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        trulab: {
          bg: brandTheme.background,
          accent: brandTheme.accent,
          ink: brandTheme.ink,
          muted: brandTheme.muted,
        },
      },
      fontFamily: {
        sans: ["var(--font-site)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(23, 23, 23, 0.08)",
        lift: "0 18px 45px rgba(23, 23, 23, 0.10)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        reveal: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 32s linear infinite",
        reveal: "reveal 700ms ease both",
      },
    },
  },
  plugins: [],
};

export default config;
