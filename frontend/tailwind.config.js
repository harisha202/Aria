/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6432ff',
        secondary: '#00c8ff',
        dark: '#030d1a',
        'dark-light': '#0f172a',
      },
      backgroundColor: {
        'dark-bg': '#030d1a',
      },
    },
  },
  plugins: [],
}
