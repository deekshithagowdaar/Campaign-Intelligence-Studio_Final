/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#FFF4EA',
          100: '#FFE4D2',
          200: '#FFC5A4',
          300: '#FFA170',
          400: '#FB7A36',
          500: '#F97316', // Vibrant Orange
          600: '#EA580C', // Deep Orange
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        charcoal: {
          DEFAULT: '#252525',
          light: '#333333',
          lighter: '#4B4B4B',
        },
        surface: {
          light: '#F5F6F8',
          card: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'orange-glow': '0 10px 25px -5px rgba(249, 115, 22, 0.25), 0 8px 10px -6px rgba(249, 115, 22, 0.2)',
        'orange-glow-lg': '0 20px 35px -5px rgba(249, 115, 22, 0.35), 0 10px 15px -5px rgba(249, 115, 22, 0.2)',
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 12px 30px -4px rgba(234, 88, 12, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
