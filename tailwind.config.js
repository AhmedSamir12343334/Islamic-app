/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: {
      xs: '420px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    extend: {
      colors: {
        ink: '#102B32',
        emerald: { 50: '#edf9f4', 100: '#d4f0e4', 500: '#168365', 600: '#0E6C53', 700: '#075441' },
        gold: { 50: '#fbf8ee', 100: '#f5ebcf', 400: '#d5a93d', 500: '#b98924' }
      },
      fontFamily: {
        arabic: ['"Noto Naskh Arabic"', 'serif'],
        sans: ['"Tajawal"', 'sans-serif']
      },
      boxShadow: { soft: '0 14px 45px rgba(10, 55, 45, .09)' }
    }
  },
  plugins: []
}

