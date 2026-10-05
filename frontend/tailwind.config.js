/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emit: {
          navy: '#0A192F',
          primary: '#1E3A8A',
          sky: '#3B82F6',
          skyLight: '#F8FAFC',
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#DDEAF7',
          text: '#0A192F',
          muted: '#637799',
          error: '#1E3A8A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        emit: '10px',
      },
    },
  },
  plugins: [],
}
