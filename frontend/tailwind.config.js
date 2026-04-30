/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D3B28', // Darker, deeper green
          light: '#1A5C3A',
          dark: '#082818',
        },
        secondary: {
          DEFAULT: '#F5F5DC', // Beige
          light: '#F9F9EA',
          dark: '#EBEBC2',
        },
        accent: {
          gold: '#D4AF37', // Luxurious accent
        }
      },
      fontFamily: {
        sans: ['General Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
