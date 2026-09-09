/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        slab: ['"Roboto Slab"', "serif"],
        work: ['"Work Sans"', "sans-serif"],
      },
      keyframes: {
        rotation: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(359deg)" },
        },
      },
      animation: {
        rotate: "rotation 8s linear infinite",
      },
    },
  },
};
