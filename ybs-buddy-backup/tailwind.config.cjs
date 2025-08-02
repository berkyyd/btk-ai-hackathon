/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Improved dark blue-purple theme colors with better contrast
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // Improved background colors with better contrast
        background: '#0a0a1a', // Very dark blue background
        'background-light': '#1a1a2e', // Slightly lighter background
        'background-card': '#1e1e3a', // Card background
        'background-hover': '#2a2a4a', // Hover state background
        'background-active': '#3a3a5a', // Active state background
        card: '#1e1e3a',
        text: '#f1f5f9', // Much lighter text for better readability
        'text-light': '#cbd5e1', // Lighter text
        'text-muted': '#94a3b8', // Muted text
        'text-accent': '#c084fc', // Brighter purple accent text
        'text-primary': '#818cf8', // Brighter blue text
        'border-light': '#475569',
        'border-dark': '#1e293b',
        'border-accent': '#6366f1', // Brighter border for active states
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 20px 40px rgba(15, 23, 42, 0.1)',
        'glass-dark': '0 20px 40px rgba(0, 0, 0, 0.3)',
        'dark-glow': '0 0 20px rgba(168, 85, 247, 0.3)',
        'dark-card': '0 8px 32px rgba(0, 0, 0, 0.4)',
        'hover-glow': '0 0 30px rgba(168, 85, 247, 0.4)',
        'active-glow': '0 0 40px rgba(168, 85, 247, 0.5)',
      },
      transitionTimingFunction: {
        'ease-in-out-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '700': '700ms',
        '300': '300ms',
        '200': '200ms',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(168, 85, 247, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' },
          '100%': { boxShadow: '0 0 5px rgba(168, 85, 247, 0.3)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        slideUp: 'slideUp 0.6s ease-out forwards',
        scaleIn: 'scaleIn 0.4s ease-out forwards',
        float: 'float 4s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
        pulse: 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} 