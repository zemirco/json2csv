/* eslint-env node */
module.exports = {
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [require("@tailwindcss/typography")],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
};
