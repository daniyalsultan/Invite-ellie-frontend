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
        // The marketing site's type (src/components/landing/site/site.css)
        dmSans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ellieBlue: '#327AAD',
        ellieBlack: '#000000',
        ellieGray: '#545454',
        ellieNavy: '#0A1628',
        ellieAccent: '#FF8000',
        ellieSurface: '#F4F7FA',
        // The marketing site's palette, shared by the auth and onboarding pages
        ie: {
          indigo: '#222F61',
          blue: '#327AAD',
          violet: '#7964A0',
          green: '#43A18B',
          aqua: '#8FEFDE',
          ivory: '#F1EAD3',
          text: '#1B2448',
          muted: '#566079',
          line: 'rgba(34, 47, 97, 0.13)',
          bgAlt: '#F2F5FA',
          tBlue: '#E3EDF8',
          tViolet: '#ECE7F6',
          tIvory: '#F6F0DC',
          tAqua: '#DBF3EC',
        },
      },
      backgroundImage: {
        'ie-hero': 'linear-gradient(172deg, #6F5FA3 0%, #4671B0 28%, #327AAD 50%, #3A9DB0 76%, #7FE3D6 100%)',
        'ie-deep': 'linear-gradient(125deg, #6A5699 0%, #3E6CAB 35%, #2A72A6 60%, #1D7D86 85%, #23866F 100%)',
        'ie-edge': 'linear-gradient(120deg, #7964A0, #327AAD 50%, #43A18B)',
      },
      fontSize: {
        // From Figma desktop hero title
        hero: ['55px', { lineHeight: '1.1743' }],
      },
    },
    screens: {
      md: '700px',
      lg: '1050px',
      xl: '1920px', // desktop frame width
    },
  },
  plugins: [],
};


