import React from 'react'
import { designSystem, componentStyles, designUtils } from '@/src/lib/design-system'

interface EnhancedCardProps {
  children: React.ReactNode
  variant?: 'default' | 'glass' | 'elevated'
  hover?: boolean
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  variant = 'default',
  hover = true,
  className = '',
  padding = 'md',
  border = true,
  shadow = 'md'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'glass':
        return componentStyles.card.glass
      case 'elevated':
        return 'bg-white rounded-3xl shadow-2xl border-0'
      default:
        return componentStyles.card.base
    }
  }

  const getPaddingClasses = () => {
    const paddingMap = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-10'
    }
    return paddingMap[padding]
  }

  const getShadowClasses = () => {
    const shadowMap = {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl'
    }
    return shadowMap[shadow]
  }

  const baseClasses = getVariantClasses()
  const paddingClasses = getPaddingClasses()
  const shadowClasses = getShadowClasses()
  const hoverClasses = hover ? componentStyles.card.hover : ''
  const borderClasses = border ? '' : 'border-0'

  return (
    <div className={`${baseClasses} ${paddingClasses} ${shadowClasses} ${hoverClasses} ${borderClasses} ${className}`}>
      {children}
    </div>
  )
}

// Specialized card variants
export const StatsCard: React.FC<{
  children: React.ReactNode
  icon?: React.ReactNode
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}> = ({ children, icon, title, value, subtitle, trend, className = '' }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <EnhancedCard variant="glass" className={`text-center ${className}`}>
      {icon && (
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
      <p className="text-sm text-gray-600 font-medium">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      {children}
    </EnhancedCard>
  )
}

export const FeatureCard: React.FC<{
  children: React.ReactNode
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}> = ({ children, icon, title, description, className = '' }) => {
  return (
    <EnhancedCard variant="default" className={`group ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
          {children}
        </div>
      </div>
    </EnhancedCard>
  )
}

export default EnhancedCard
