import React from 'react'
import { AlertCircle, XCircle } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  type?: 'error' | 'warning'
}

export const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  type = 'error',
}: ErrorStateProps) => {
  const Icon = type === 'error' ? XCircle : AlertCircle
  const iconColor = type === 'error' ? 'text-red-500' : 'text-yellow-500'
  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-yellow-50'

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className={`${bgColor} rounded-full p-6 mb-4`}>
        <Icon className={`h-12 w-12 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export const InlineError = ({ message }: { message: string }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-800">{message}</p>
    </div>
  )
}

export default ErrorState
