import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ],
        serif: [
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif"
        ]
      },
      colors: {
        archive: {
          ink: "#27231f",
          paper: "#fbf8f1",
          linen: "#efe7da",
          clay: "#a8654c",
          sage: "#667d6b",
          gold: "#c6a15b",
          champagne: "#e5cf9a",
          obsidian: "#0d0d0e",
          charcoal: "#19191b",
          ivory: "#f7f1e5",
          mist: "#e7ece7"
        }
      },
      boxShadow: {
        soft: "0 18px 55px rgba(39, 35, 31, 0.12)",
        luxury: "0 28px 80px rgba(0, 0, 0, 0.38)"
      }
    }
  },
  plugins: []
};

export default config;
