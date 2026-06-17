/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ethio-primary': '#0A66C2',
        'ethio-secondary': '#059669',
        'ethio-accent': '#F59E0B',
      },
    },
  },
  plugins: [],
}