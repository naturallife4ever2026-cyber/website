/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: {
      pulse: {
        50: '#f5f0ff', 100: '#ede5ff', 200: '#dccbff',
        500: '#7c3aed', 600: '#6d28d9', 700: '#5420b5',
        900: '#201044'
      }
    },
    boxShadow: { soft: '0 8px 28px rgba(43, 24, 88, 0.07)' }
  }},
  plugins: []
}
