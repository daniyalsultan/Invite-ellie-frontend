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
        inter: ['Inter', 'system-ui', 'sans-serif'],
        spaceGrotesk: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        ellieBlue: '#327AAD',
        ellieBlack: '#000000',
        ellieGray: '#545454',
        ellieNavy: '#0A1628',
        ellieAccent: '#FF8000',
        ellieSurface: '#F4F7FA',
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


