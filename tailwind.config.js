/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // <-- Esta es la línea clave
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}