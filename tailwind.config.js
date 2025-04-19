/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"], // ← App Router構成の場合これでOK
  theme: {
    extend: {
      fontFamily: {
        rounded: ['"Rounded Mplus 1c"', 'sans-serif'],
        mplus: ['"M PLUS 1c"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
