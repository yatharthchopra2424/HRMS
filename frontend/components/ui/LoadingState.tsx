import React from 'react'

export const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  )
}

export const LoadingState = ({ message = 'Loading...' }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <LoadingSpinner />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  )
}

export const FullPageLoading = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <LoadingSpinner />
        <p className="text-gray-600">Loading application...</p>
      </div>
    </div>
  )
}

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-10 bg-gray-200 rounded animate-shimmer flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default LoadingState
