// Design System for Fitness Challenge App
// This file contains all design tokens, colors, spacing, and component styles
// for consistent use across the entire application

export const designSystem = {
  // Color Palette
  colors: {
    // Primary Colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Secondary Colors (Purple)
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
    },
    
    // Accent Colors
    accent: {
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
      },
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
      danger: {
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
    },
    
    // Neutral Colors
    neutral: {
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
    },
    
    // Challenge Type Colors
    challengeTypes: {
      fitness: {
        light: '#dbeafe',
        main: '#3b82f6',
        dark: '#1d4ed8',
      },
      'weight-loss': {
        light: '#dcfce7',
        main: '#22c55e',
        dark: '#16a34a',
      },
      strength: {
        light: '#fee2e2',
        main: '#ef4444',
        dark: '#b91c1c',
      },
      wellness: {
        light: '#f3e8ff',
        main: '#a855f7',
        dark: '#7c3aed',
      },
      endurance: {
        light: '#fed7aa',
        main: '#f97316',
        dark: '#c2410c',
      },
    },
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
  },

  // Spacing System
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
    '5xl': '8rem',   // 128px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
    secondary: 'linear-gradient(to right, #8b5cf6, #ec4899)',
    success: 'linear-gradient(to right, #22c55e, #10b981)',
    warning: 'linear-gradient(to right, #f59e0b, #f97316)',
    danger: 'linear-gradient(to right, #ef4444, #dc2626)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
    slowest: '500ms ease-in-out',
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
}

// Component-specific styles
export const componentStyles = {
  // Card Components
  card: {
    base: 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden',
    glass: 'bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20',
    hover: 'hover:shadow-2xl hover:-translate-y-1 transition-all duration-300',
  },

  // Button Components
  button: {
    base: 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300',
    outline: 'border-2 border-current text-current hover:bg-current hover:text-white',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  },

  // Input Components
  input: {
    base: 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
    error: 'border-red-300 focus:ring-red-500',
    success: 'border-green-300 focus:ring-green-500',
  },

  // Badge Components
  badge: {
    base: 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-purple-100 text-purple-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  },

  // Progress Components
  progress: {
    base: 'w-full bg-gray-200 rounded-full overflow-hidden',
    bar: 'h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out',
  },
}

// Utility functions for consistent styling
export const designUtils = {
  // Get challenge type colors
  getChallengeTypeColors: (type: string) => {
    return designSystem.colors.challengeTypes[type as keyof typeof designSystem.colors.challengeTypes] || designSystem.colors.challengeTypes.fitness
  },

  // Get responsive spacing
  getSpacing: (size: keyof typeof designSystem.spacing) => {
    return designSystem.spacing[size]
  },

  // Get gradient classes
  getGradient: (type: keyof typeof designSystem.gradients) => {
    return designSystem.gradients[type]
  },

  // Get component classes
  getComponentClasses: (component: keyof typeof componentStyles, variant?: string) => {
    const base = componentStyles[component].base
    const variantClass = variant ? componentStyles[component][variant as keyof typeof componentStyles[typeof component]] : ''
    return `${base} ${variantClass}`.trim()
  },
}

export default designSystem
