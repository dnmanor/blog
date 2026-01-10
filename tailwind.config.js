const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.njk", "./src/**/*.md", "./src/**/*.js", "./content/**/*.{md,njk,html}", "./.*.js"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        roboto: ["Roboto Slab", "serif"],
        bbh: ["BBH Bartle", "sans-serif"],
      },
    },
    colors: {
      gray: colors.slate,
      purple: colors.purple,
      orange: colors.orange,
      rose: colors.rose,
      blue: colors.blue,
      green: colors.green,
      yellow: colors.yellow,
      white: colors.white,
      black: colors.black,
      current: "currentColor",
      transparent: "transparent",
    },
    fontFamily: {},
  },
  variants: {
    backgroundColor: ["responsive", "dark", "focus", "active", "hover"],
    extend: { space: ["last"] },
  },
  plugins: [],
};
