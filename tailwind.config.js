module.exports = {
  content: ["./src/**/*.{html,tsx,ts}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        'primary': "#3D5A80",
        'secondary': "#98C1D9",
        'contrast': "#EE6C4D",
        'background': {
          'light': "#E0FBFC",
          'dark': "#293241"
        },
        'positive': "#46DA4E",
        'negative': "#D94545"
      }
    },
  },
  plugins: [],
}
