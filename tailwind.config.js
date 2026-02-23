/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Primary - Blue (#30638e)
        primary: {
          50: '#f0f5f9',
          100: '#dae6ef',
          200: '#b8cfe0',
          300: '#8bb3cc',
          400: '#5a91b3',
          500: '#30638e',
          600: '#2a5780',
          700: '#234a6d',
          800: '#1d3d5a',
          900: '#003d5b',
          950: '#002a3f',
        },
        // Accent - Green (#5fad41)
        accent: {
          50: '#f3f9f0',
          100: '#e2f2da',
          200: '#c5e5b6',
          300: '#9ed485',
          400: '#7bc45c',
          500: '#5fad41',
          600: '#4a9432',
          700: '#3d7a2a',
          800: '#336125',
          900: '#2a5020',
          950: '#142c0e',
        },
        // Success - Teal (#2d936c)
        success: {
          50: '#f0faf6',
          100: '#daf3e8',
          200: '#b7e6d3',
          300: '#86d3b6',
          400: '#4fb88f',
          500: '#2d936c',
          600: '#247a59',
          700: '#1f6249',
          800: '#1b4f3c',
          900: '#174132',
          950: '#0b251c',
        },
        // Warning - Amber
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Error - Red
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Neutrals - Based on #e8e9eb (light) and #003d5b (dark)
        dark: {
          50: '#f7f8f8',
          100: '#e8e9eb',
          200: '#d4d6da',
          300: '#b8bcc2',
          400: '#9299a3',
          500: '#6e7785',
          600: '#565e6c',
          700: '#454c58',
          800: '#2d3542',
          900: '#1a2433',
          950: '#0d1520',
        },
      },
      // Custom box shadows for depth
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
        'elevated': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
        'modal': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      },
      // Custom font sizes
      fontSize: {
        'xxs': ['10px', { lineHeight: '14px' }],
      },
      // Custom border radius
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
