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
          gold: "#b88b4a",
          mist: "#e7ece7"
        }
      },
      boxShadow: {
        soft: "0 18px 55px rgba(39, 35, 31, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
