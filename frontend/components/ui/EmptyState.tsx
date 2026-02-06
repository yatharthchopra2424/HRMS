import React from 'react'
import { Inbox, Users, Calendar, FileQuestion } from 'lucide-react'

interface EmptyStateProps {
  icon?: 'inbox' | 'users' | 'calendar' | 'question'
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const icons = {
  inbox: Inbox,
  users: Users,
  calendar: Calendar,
  question: FileQuestion,
}

export const EmptyState = ({
  icon = 'inbox',
  title,
  description,
  action,
}: EmptyStateProps) => {
  const Icon = icons[icon]

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <Icon className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 text-sm max-w-md mb-6">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
