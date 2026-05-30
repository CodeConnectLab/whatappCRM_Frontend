/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        surface: {
          DEFAULT: '#fafafa',
          card: '#ffffff',
        },
        wa: {
          bg: '#efeae2',
          darkBg: '#0b141a',
          bubbleOut: '#d9fdd3',
          bubbleIn: '#ffffff',
          bubbleInDark: '#202c33',
          accent: '#00a884',
        },
      },
      boxShadow: {
        shell: '0 1px 3px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)',
        card: '0 1px 2px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
};
