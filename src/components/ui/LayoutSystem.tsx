import React from 'react'
import { designSystem, componentStyles, designUtils } from '@/src/lib/design-system'

// Page Container
export const PageContainer: React.FC<{
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl'
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}> = ({ children, className = '', maxWidth = '7xl', padding = 'lg' }) => {
  const getMaxWidthClasses = () => {
    const maxWidthMap = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '7xl': 'max-w-7xl'
    }
    return maxWidthMap[maxWidth]
  }

  const getPaddingClasses = () => {
    const paddingMap = {
      sm: 'px-4 py-8',
      md: 'px-6 py-12',
      lg: 'px-8 py-16',
      xl: 'px-12 py-20'
    }
    return paddingMap[padding]
  }

  return (
    <div className={`container mx-auto ${getMaxWidthClasses()} ${getPaddingClasses()} ${className}`}>
      {children}
    </div>
  )
}

// Hero Section
export const HeroSection: React.FC<{
  children: React.ReactNode
  background?: 'default' | 'gradient' | 'glass' | 'pattern'
  className?: string
}> = ({ children, background = 'default', className = '' }) => {
  const getBackgroundClasses = () => {
    switch (background) {
      case 'gradient':
        return 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
      case 'glass':
        return 'bg-white/80 backdrop-blur-sm'
      case 'pattern':
        return 'bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 relative overflow-hidden'
      default:
        return 'bg-white'
    }
  }

  const getPatternElements = () => {
    if (background === 'pattern') {
      return (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-3"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        </>
      )
    }
    return null
  }

  return (
    <section className={`relative ${getBackgroundClasses()} ${className}`}>
      {getPatternElements()}
      <div className="relative">
        {children}
      </div>
    </section>
  )
}

// Section Container
export const SectionContainer: React.FC<{
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'xl'
}> = ({ children, title, subtitle, className = '', padding = 'lg' }) => {
  const getPaddingClasses = () => {
    const paddingMap = {
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
      xl: 'py-20'
    }
    return paddingMap[padding]
  }

  return (
    <section className={`${getPaddingClasses()} ${className}`}>
      {(title || subtitle) && (
        <div className="text-center mb-12">
          {title && (
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  )
}

// Grid Layout
export const GridLayout: React.FC<{
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}> = ({ children, columns = 3, gap = 'lg', className = '' }) => {
  const getColumnsClasses = () => {
    const columnsMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
    }
    return columnsMap[columns]
  }

  const getGapClasses = () => {
    const gapMap = {
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12'
    }
    return gapMap[gap]
  }

  return (
    <div className={`grid ${getColumnsClasses()} ${getGapClasses()} ${className}`}>
      {children}
    </div>
  )
}

// Flex Layout
export const FlexLayout: React.FC<{
  children: React.ReactNode
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  wrap?: boolean
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}> = ({ 
  children, 
  direction = 'row', 
  justify = 'start', 
  align = 'start', 
  wrap = false, 
  gap = 'md', 
  className = '' 
}) => {
  const getDirectionClasses = () => {
    const directionMap = {
      row: 'flex-row',
      col: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'col-reverse': 'flex-col-reverse'
    }
    return directionMap[direction]
  }

  const getJustifyClasses = () => {
    const justifyMap = {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    }
    return justifyMap[justify]
  }

  const getAlignClasses = () => {
    const alignMap = {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch'
    }
    return alignMap[align]
  }

  const getGapClasses = () => {
    const gapMap = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    }
    return gapMap[gap]
  }

  const wrapClasses = wrap ? 'flex-wrap' : 'flex-nowrap'

  return (
    <div className={`flex ${getDirectionClasses()} ${getJustifyClasses()} ${getAlignClasses()} ${wrapClasses} ${getGapClasses()} ${className}`}>
      {children}
    </div>
  )
}

// Divider
export const Divider: React.FC<{
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ orientation = 'horizontal', size = 'md', className = '' }) => {
  const getSizeClasses = () => {
    const sizeMap = {
      sm: orientation === 'horizontal' ? 'h-px' : 'w-px',
      md: orientation === 'horizontal' ? 'h-0.5' : 'w-0.5',
      lg: orientation === 'horizontal' ? 'h-1' : 'w-1'
    }
    return sizeMap[size]
  }

  const orientationClasses = orientation === 'horizontal' ? 'w-full' : 'h-full'

  return (
    <div className={`bg-gray-200 ${orientationClasses} ${getSizeClasses()} ${className}`} />
  )
}

// Spacer
export const Spacer: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  className?: string
}> = ({ size = 'md', className = '' }) => {
  const getSizeClasses = () => {
    const sizeMap = {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-4',
      lg: 'h-8',
      xl: 'h-12',
      '2xl': 'h-16',
      '3xl': 'h-24'
    }
    return sizeMap[size]
  }

  return <div className={`${getSizeClasses()} ${className}`} />
}

export default {
  PageContainer,
  HeroSection,
  SectionContainer,
  GridLayout,
  FlexLayout,
  Divider,
  Spacer
}
