/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#2d6a4f',
          brown: '#603813',
          blue: '#1d4ed8',
          red: '#dc2626',
          bg: '#f8fafc',
          text: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
