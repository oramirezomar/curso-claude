import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7f8",
          100: "#d7ecef",
          200: "#b3dade",
          300: "#87c2c9",
          400: "#5da4ad",
          500: "#3e8892",
          600: "#2f6e77",
          700: "#28575e",
          800: "#24484d",
          900: "#213d41",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
