import React from 'react'

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const combinedClasses = [
    'inline-block border-2 border-solid border-current border-r-transparent align-[-0.125em] animate-spin rounded-full',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ')

  return (
    <div
      className={combinedClasses}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default LoadingSpinner