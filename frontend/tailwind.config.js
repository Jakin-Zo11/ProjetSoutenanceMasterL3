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
          navy: '#0B1F4B',
          primary: '#2563EB',
          sky: '#7DD3FC',
          skyLight: '#E0F2FE',
          bg: '#F5F8FF',
          card: '#FFFFFF',
          border: '#E5EAF5',
          text: '#0B1F4B',
          muted: '#52627D',
          error: '#E11D48',
          success: '#15803D',
          warning: '#C2410C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        emit: '14px',
      },
    },
  },
  plugins: [],
}
