import React from 'react'
import { designSystem, componentStyles, designUtils } from '@/src/lib/design-system'

interface EnhancedButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  rounded?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export const EnhancedButton: React.FC<EnhancedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  rounded = 'full',
  className = '',
  onClick,
  type = 'button'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300'
      case 'secondary':
        return 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
      case 'outline':
        return 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
      case 'ghost':
        return 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-200 hover:shadow-green-300'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg shadow-yellow-200 hover:shadow-yellow-300'
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-200 hover:shadow-red-300'
      default:
        return componentStyles.button.primary
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm'
      case 'md':
        return 'px-6 py-3 text-base'
      case 'lg':
        return 'px-8 py-4 text-lg'
      case 'xl':
        return 'px-10 py-5 text-xl'
      default:
        return 'px-6 py-3 text-base'
    }
  }

  const getRoundedClasses = () => {
    switch (rounded) {
      case 'sm':
        return 'rounded-md'
      case 'md':
        return 'rounded-xl'
      case 'lg':
        return 'rounded-2xl'
      case 'full':
        return 'rounded-full'
      default:
        return 'rounded-full'
    }
  }

  const baseClasses = componentStyles.button.base
  const variantClasses = getVariantClasses()
  const sizeClasses = getSizeClasses()
  const roundedClasses = getRoundedClasses()
  const widthClasses = fullWidth ? 'w-full' : ''
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
  const loadingClasses = loading ? 'cursor-wait' : ''

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${roundedClasses} ${widthClasses} ${disabledClasses} ${loadingClasses} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  )
}

// Specialized button variants
export const IconButton: React.FC<{
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}> = ({ children, variant = 'ghost', size = 'md', className = '', onClick }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8'
      case 'md':
        return 'w-10 h-10'
      case 'lg':
        return 'w-12 h-12'
      default:
        return 'w-10 h-10'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300'
      case 'secondary':
        return 'bg-white text-gray-700 border border-gray-200 shadow-sm hover:bg-gray-50'
      case 'ghost':
        return 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      default:
        return 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }
  }

  return (
    <button
      className={`${getSizeClasses()} ${getVariantClasses()} rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export const FloatingActionButton: React.FC<{
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}> = ({ children, variant = 'primary', size = 'md', className = '', onClick }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12'
      case 'md':
        return 'w-14 h-14'
      case 'lg':
        return 'w-16 h-16'
      default:
        return 'w-14 h-14'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-300 hover:shadow-blue-400'
      case 'secondary':
        return 'bg-white text-gray-700 border border-gray-200 shadow-2xl hover:bg-gray-50'
      default:
        return 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-300 hover:shadow-blue-400'
    }
  }

  return (
    <button
      className={`${getSizeClasses()} ${getVariantClasses()} rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 fixed bottom-6 right-6 z-50 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default EnhancedButton
