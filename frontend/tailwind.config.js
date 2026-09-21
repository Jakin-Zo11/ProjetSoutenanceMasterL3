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
          navy: '#0D1F4E',
          primary: '#1A4BA8',
          sky: '#2D84E0',
          skyLight: '#EAF4FF',
          bg: '#F0F5FB',
          card: '#FFFFFF',
          border: '#DDEAF7',
          text: '#0B1D3A',
          muted: '#637799',
          error: '#DC2626',
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
