import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE',
          300: '#93C5FD', 400: '#60A5FA', 500: '#3B82F6',
          600: '#2563EB', 700: '#1D4ED8', 800: '#1E40AF', 900: '#1E3A8A',
        },
        success: { DEFAULT: '#10B981', light: '#D1FAE5', dark: '#065F46' },
        warning: { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#92400E' },
        danger: { DEFAULT: '#EF4444', light: '#FEE2E2', dark: '#7F1D1D' },
        ai: { DEFAULT: '#8B5CF6', light: '#EDE9FE', dark: '#4C1D95' },
        // Dark mode tokens
        dark: {
          bg: '#0A0F1E',
          surface: '#0F1629',
          card: '#131D35',
          border: '#1E2D4A',
          'border-subtle': '#162038',
          'text-primary': '#F0F4FF',
          'text-secondary': '#8B9CC8',
          'text-muted': '#4A5D80',
        },
        // Light mode tokens
        light: {
          bg: '#FAFBFF',
          surface: '#FFFFFF',
          card: '#F8FAFF',
          border: '#E2E8F0',
          'text-primary': '#0F1629',
          'text-secondary': '#64748B',
          'text-muted': '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-dark': '0 1px 3px 0 rgb(0 0 0 / 0.4)',
        'elevated': '0 4px 12px -2px rgb(0 0 0 / 0.12)',
        'elevated-dark': '0 4px 12px -2px rgb(0 0 0 / 0.5)',
        'glow-blue': '0 0 24px rgb(37 99 235 / 0.25)',
        'glow-green': '0 0 24px rgb(16 185 129 / 0.25)',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
export default config
