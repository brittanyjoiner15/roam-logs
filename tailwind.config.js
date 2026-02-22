/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#F25C2A',      // Sunset orange (primary)
        pine: '#3A9270',       // Forest green
        sand: '#C4B5A8',       // Warm neutral
        ink: '#2D2821',        // Dark text
      },
      borderRadius: {
        card: '12px',
        button: '10px',
        badge: '20px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.1)',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
