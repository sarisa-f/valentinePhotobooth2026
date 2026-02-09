/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        kapakana: ['Kapakana', 'serif'],
        dancing: ['Dancing Script', 'cursive'],
      },
      colors: {
        'vintage-red': '#98050D',
      }
    },
  },
  plugins: [],
}