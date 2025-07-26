/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'custom-lg': '992px', // Custom breakpoint for 992px
        'custom-xs': '480px',
      },
    },
  },
  plugins: [
    function({ addComponents }) {
      addComponents({
        '.hide-scrollbar::-webkit-scrollbar': {
          display: 'none',
        },
      });
    },
    require('tailwind-scrollbar'),
  ],
}
