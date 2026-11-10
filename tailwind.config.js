/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sf: {
          bg: '#F7F8F5',
          surface: '#FFFFFF',
          secondary: '#F0F2ED',
          text: '#26352F',
          'text-secondary': '#78837C',
          muted: '#9AA39C',
          green: '#526D5B',
          forest: '#344D3D',
          'green-soft': '#E9F0E9',
          border: '#E6EAE4',
          beige: '#F3EFE7',
          amber: '#B58A4B',
          red: '#C47770',
          blue: '#7895A5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sf-xs': '0 1px 2px rgba(38, 53, 47, 0.04)',
        'sf-sm': '0 2px 8px -2px rgba(38, 53, 47, 0.06), 0 1px 2px rgba(38, 53, 47, 0.04)',
        'sf-md': '0 8px 24px -6px rgba(38, 53, 47, 0.08), 0 2px 6px -1px rgba(38, 53, 47, 0.04)',
        'sf-lg': '0 16px 40px -12px rgba(38, 53, 47, 0.10), 0 4px 12px -2px rgba(38, 53, 47, 0.04)',
      },
      borderRadius: {
        'sf-sm': '8px',
        'sf-md': '12px',
        'sf-lg': '16px',
      },
    },
  },
  plugins: [],
}

