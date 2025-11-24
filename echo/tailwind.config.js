/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        f1: {
          red: '#E10600',
          dark: '#0A0A0A',
          gray: '#1A1A1A',
          'light-gray': '#2A2A2A',
          accent: '#00D2BE',
          yellow: '#FFD700',
          white: '#FFFFFF',
        },
        primary: {
          50: '#ffe5e5',
          100: '#ffcccc',
          200: '#ff9999',
          300: '#ff6666',
          400: '#ff3333',
          500: '#E10600',
          600: '#b80500',
          700: '#8f0400',
          800: '#660300',
          900: '#3d0200',
        },
      },
      fontFamily: {
        racing: ['Racing Sans One', 'cursive'],
        orbitron: ['Orbitron', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'racing-gradient': 'linear-gradient(135deg, #0A0A0A 0%, #1A0A0A 25%, #0A0A1A 50%, #1A0A0A 75%, #0A0A0A 100%)',
        'glossy-dark': 'linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(10, 10, 10, 0.95) 100%)',
      },
      boxShadow: {
        'glossy': '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glossy-hover': '0 12px 48px rgba(225, 6, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        'glow-red': '0 0 20px rgba(225, 6, 0, 0.5)',
      },
    },
  },
  plugins: [],
}

