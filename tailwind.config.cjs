/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['Nunito', 'system-ui', 'sans-serif'],
      },
      colors: {
        ellieBlue: '#327AAD',
        ellieBlack: '#000000',
        ellieGray: '#545454',
      },
      fontSize: {
        // From Figma desktop hero title
        hero: ['55px', { lineHeight: '1.1743' }],
      },
    },
    // Breakpoints matching Figma frames
    screens: {
      md: '440px', // mobile frame width
      xl: '1920px', // desktop frame width
    },
  },
  plugins: [],
};


