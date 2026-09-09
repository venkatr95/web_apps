import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef3f2",
          100: "#fde6e3",
          200: "#fccfc9",
          300: "#f9aca2",
          400: "#f47b6b",
          500: "#e95541",
          600: "#d63b28",
          700: "#b42e1e",
          800: "#95291c",
          900: "#7c271d",
          950: "#43100a",
        },
        secondary: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae2",
          300: "#b0bac9",
          400: "#8595ab",
          500: "#667791",
          600: "#515f78",
          700: "#424d62",
          800: "#394253",
          900: "#333947",
          950: "#22252e",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-noto-sans)",
          "var(--font-noto-sans-devanagari)",
          "var(--font-noto-sans-tamil)",
          "var(--font-inter)",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        heading: [
          "var(--font-noto-serif)",
          "var(--font-noto-serif-devanagari)",
          "var(--font-noto-serif-tamil)",
          "var(--font-playfair)",
          "Georgia",
          "serif",
        ],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
