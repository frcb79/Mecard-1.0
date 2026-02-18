/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // =============================================
      // MECARD DESIGN SYSTEM TOKENS
      // =============================================
      
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },

      // Unified color palette with role-specific accents
      colors: {
        brand: {
          50:  '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8ecdff',
          400: '#59b0ff',
          500: '#3b93ff',
          600: '#1a6ff5',
          700: '#1459e1',
          800: '#1749b6',
          900: '#193f8f',
          950: '#142857',
        },
        // Emerald-based trust green (parent portal accent)
        trust: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Warm amber for alerts and concessionaire
        warm: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Surface colors for consistent backgrounds
        surface: {
          0:   '#ffffff',
          50:  '#f8fafc',
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
        // Status colors
        success: { DEFAULT: '#10b981', light: '#d1fae5', dark: '#047857' },
        danger:  { DEFAULT: '#ef4444', light: '#fee2e2', dark: '#b91c1c' },
        warning: { DEFAULT: '#f59e0b', light: '#fef3c7', dark: '#b45309' },
        info:    { DEFAULT: '#3b82f6', light: '#dbeafe', dark: '#1d4ed8' },
      },

      // Standardized border-radius (replaces 14 arbitrary values)
      borderRadius: {
        'xs':   '0.375rem',  // 6px - badges, tags
        'sm':   '0.5rem',    // 8px - inputs, small elements
        'md':   '0.75rem',   // 12px - cards, buttons
        'lg':   '1rem',      // 16px - panels, containers
        'xl':   '1.25rem',   // 20px - dialogs, large cards
        '2xl':  '1.5rem',    // 24px - hero cards, modals
        '3xl':  '2rem',      // 32px - premium surfaces
        'pill': '9999px',    // pill shape for tabs, tags
      },

      // Consistent shadow/elevation system
      boxShadow: {
        'xs':     '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm':     '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md':     '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg':     '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl':     '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl':    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'glow':   '0 0 20px 0 rgb(59 147 255 / 0.15)',
        'glow-lg':'0 0 40px 0 rgb(59 147 255 / 0.2)',
        'inner':  'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
        'card':   '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 6px 16px -2px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.06), 0 20px 40px -4px rgb(0 0 0 / 0.08)',
        'float':  '0 30px 60px -12px rgb(0 0 0 / 0.08), 0 18px 36px -18px rgb(0 0 0 / 0.08)',
      },

      // Consistent spacing for card padding
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
        '22':  '5.5rem',
      },

      // Typography scale
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],  // 10px
        'xs':  ['0.75rem',  { lineHeight: '1rem' }],       // 12px
        'sm':  ['0.875rem', { lineHeight: '1.25rem' }],    // 14px
        'base':['1rem',     { lineHeight: '1.5rem' }],     // 16px
        'lg':  ['1.125rem', { lineHeight: '1.75rem' }],    // 18px
        'xl':  ['1.25rem',  { lineHeight: '1.75rem' }],    // 20px
        '2xl': ['1.5rem',   { lineHeight: '2rem' }],       // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],    // 30px
        '4xl': ['2.25rem',  { lineHeight: '2.5rem' }],     // 36px
        '5xl': ['3rem',     { lineHeight: '1' }],           // 48px
        '6xl': ['3.75rem',  { lineHeight: '1' }],           // 60px
      },

      // Animations
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%':   { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%':   { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(59 147 255 / 0)' },
          '50%':      { boxShadow: '0 0 30px 10px rgb(59 147 255 / 0.1)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'toast-in': {
          '0%':   { opacity: '0', transform: 'translateY(-100%) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'toast-out': {
          '0%':   { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(-100%) scale(0.95)' },
        },
      },
      animation: {
        'fade-in':       'fade-in 0.3s ease-out',
        'fade-in-up':    'fade-in-up 0.4s ease-out',
        'fade-in-down':  'fade-in-down 0.4s ease-out',
        'slide-in-right':'slide-in-right 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.4s ease-out',
        'scale-in':      'scale-in 0.3s ease-out',
        'float':         'float 6s ease-in-out infinite',
        'pulse-glow':    'pulse-glow 3s infinite',
        'shimmer':       'shimmer 2s infinite linear',
        'toast-in':      'toast-in 0.3s ease-out',
        'toast-out':     'toast-out 0.2s ease-in forwards',
      },

      // Transitions
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
