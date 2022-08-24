/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'white': '#ffffff',
      'black': '#000000',
      'seafoam': {
        100: '#D3FDF9',
        300: '#77F8EB',
        500: '#0BD6C2',
        700: '#08A091',
        900: '#04443D'
      }
    },
    extend: {},
  },
  plugins: [],
}
