/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"], // App Router構成の場合
  theme: {
    extend: {
      fontFamily: {
        rounded: ['var(--font-rounded)', 'sans-serif'],
        kosugi: ['var(--font-kosugi)', 'sans-serif'],
        zenmaru: ['var(--font-zenmaru)', 'sans-serif'],
        uzura: ['var(--font-uzura)', 'sans-serif'],
        kawaii: ['var(--font-kawaii)', 'sans-serif'],
        maruminya: ['var(--font-maruminya)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}