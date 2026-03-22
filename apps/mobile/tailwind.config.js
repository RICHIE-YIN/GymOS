/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        background: {
          DEFAULT: '#F8FAFC',
          dark: '#0F172A',
        },
        card: {
          DEFAULT: '#FFFFFF',
          dark: '#1E293B',
        },
        success: {
          DEFAULT: '#22C55E',
          light: '#DCFCE7',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        error: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        // Fitness accent colors
        muscle: '#8B5CF6',
        energy: '#F97316',
        recovery: '#06B6D4',
        strength: '#EC4899',
        // Macro colors
        protein: '#3B82F6',
        carbs: '#F59E0B',
        fat:  '#EF4444',
        calories: '#8B5CF6',
      },
      fontFamily: {
        sans: ['System'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
